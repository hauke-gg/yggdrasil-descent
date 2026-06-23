/**
 * SkaldenliedScene — Sprint 1 Prototyp.
 *
 * EIN handgebauter Yggdrasil-Wurzelraum. Skalde im Zentrum, Draugr spawnen
 * aus drei Ecken. Spieler bewegt sich mit WASD/Pfeilen. Es gibt KEINE
 * Auto-Attack — der Skalde tötet ausschliesslich durch seine drei Verse.
 *
 * Ziel: in 5 Minuten Spielzeit beweisen, ob der Hook trägt.
 *
 * Spec: docs/vision-skaldenlied.md, Sprint 1.
 */

import { COLORS, CSS_COLORS } from '../data/design-system.js';
import Skaldenlied from '../systems/Skaldenlied.js';
import { DEFAULT_VERSES } from '../data/verses.js';
import {
  hitPause, FEEL, shakeNormal, shakeHeavy, squashStretch,
  damagePopup, hitBurst, slowMo, critPunch,
} from '../utils/GameFeel.js';
import {
  createSkaldTexture, createDraugrTexture, createDraugrWarriorTexture,
  createDraugrKingTexture, drawWurzelkammerFloor,
  spawnMist, spawnLightShaft, drawVignette, drawNorseOrnament,
  playVerseTriggerFx,
} from '../utils/SkaldenliedArt.js';
import { audio } from '../audio/AudioBus.js';

const ROOM_W = 1600;
const ROOM_H = 900;

export default class SkaldenliedScene extends Phaser.Scene {
  constructor() { super('SkaldenliedScene'); }

  preload() {
    if (!this.textures.exists('wurzelkammer_bg')) {
      this.load.image('wurzelkammer_bg', 'assets/wurzelkammer-bg.png');
    }
    if (!this.textures.exists('draugr_king_img')) {
      this.load.image('draugr_king_img', 'assets/draugr-king.png');
    }
  }

  create() {
    audio.unlock();
    audio.startAmbientDrone();
    audio.startCombatPulse();

    this.physics.world.setBounds(0, 0, ROOM_W, ROOM_H);
    this.cameras.main.setBounds(0, 0, ROOM_W, ROOM_H);

    this._drawRoom();
    this._createPlayer();
    this._createUI();

    this.enemies = this.physics.add.group();
    this.skaldenlied = new Skaldenlied(this, { verses: DEFAULT_VERSES });
    this.skaldenlied.onVerseFired = (verse, active = false) => {
      this._flashVerse(verse, active);
      const color = active ? 0xFFD66B : (verse.synergy ? 0xFFD66B : 0xcc88ff);
      playVerseTriggerFx(this, this.player.x, this.player.y, color);
      if (active) {
        audio.cast();
        this._castRing(color);
      }
    };
    this.skaldenlied.onComboChange = (combo) => this._updateComboUI(combo);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Show onboarding splash on first entry (or if skipped previously, still show)
    this._showOnboarding();

    // Input
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,ONE,TWO,THREE,SPACE');
    this.input.keyboard.on('keydown-ESC', () => this._returnToMenu());
    this.input.keyboard.on('keydown-ONE',   () => this._tryCast(0));
    this.input.keyboard.on('keydown-TWO',   () => this._tryCast(1));
    this.input.keyboard.on('keydown-THREE', () => this._tryCast(2));
    this.input.keyboard.on('keydown-SPACE', () => this._trySwirl());

    // Spawner — three corners, escalating rate
    this._spawnTimer = this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: () => this._spawnDraugr(),
    });

    // Wave + killcounter
    this._killsThisWave = 0;
    this._waveSize = 6;
    this._waveIndex = 1;
    this._totalKills = 0;
    this._bossPending = false;
    this._bossActive = false;

    // Projectile-enemy overlap
    this.physics.world.on('worldstep', () => this._updateProjectiles());
  }

  _drawRoom() {
    // Base black under-layer
    const black = this.add.graphics().setDepth(-2);
    black.fillStyle(0x06000F, 1).fillRect(0, 0, ROOM_W, ROOM_H);

    // Higgsfield-painted Wurzelkammer background
    if (this.textures.exists('wurzelkammer_bg')) {
      this.add.image(ROOM_W / 2, ROOM_H / 2, 'wurzelkammer_bg')
        .setDisplaySize(ROOM_W, ROOM_H)
        .setDepth(-1);
    } else {
      // Procedural fallback
      const g = this.add.graphics().setDepth(0);
      drawWurzelkammerFloor(g, ROOM_W, ROOM_H);
    }

    // Subtle rune overlay on top of background — pulses with the rhythm
    const runeOverlay = this.add.graphics().setDepth(2);
    runeOverlay.lineStyle(1, 0xC9A961, 0.18);
    const runes = [
      [[-8, -10], [8, -10], [-8, 10], [8, 10]],
      [[0, -10], [-8, 10], [8, 10]],
      [[-6, -10], [-6, 10], [6, -10], [-6, 0]],
    ];
    for (let i = 0; i < 6; i++) {
      const rx = 140 + Math.random() * (ROOM_W - 280);
      const ry = 140 + Math.random() * (ROOM_H - 280);
      const rune = runes[Math.floor(Math.random() * runes.length)];
      runeOverlay.beginPath();
      runeOverlay.moveTo(rx + rune[0][0], ry + rune[0][1]);
      for (let p = 1; p < rune.length; p++) {
        runeOverlay.lineTo(rx + rune[p][0], ry + rune[p][1]);
      }
      runeOverlay.strokePath();
    }
    this.tweens.add({
      targets: runeOverlay,
      alpha: { from: 0.6, to: 1 },
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Atmosphere: drifting mist particles on top of background
    spawnMist(this, ROOM_W, ROOM_H, 5);

    // Volumetric god-rays through Yggdrasil roots from above
    spawnLightShaft(this, ROOM_W * 0.45, 0, ROOM_H, 140, 4);
    spawnLightShaft(this, ROOM_W * 0.7,  0, ROOM_H, 100, 4);

    // Heavy vignette pins to camera
    drawVignette(this, this.scale.width, this.scale.height, 60);

    this._spawnCorners = [
      { x: 220, y: 200 },
      { x: ROOM_W - 220, y: 200 },
      { x: ROOM_W / 2, y: ROOM_H - 180 },
    ];
  }

  _createPlayer() {
    const cx = ROOM_W / 2, cy = ROOM_H / 2;
    const key = createSkaldTexture(this);

    this.player = this.physics.add.sprite(cx, cy, key);
    this.player.setCircle(18, 30, 36);
    this.player.setCollideWorldBounds(true);
    this.player.maxHp = 100;
    this.player.hp = 100;
    this.player.speed = 220;
    this.player.setDepth(20);

    // Soft golden glow under the skald — anchored, pulses
    this.playerGlow = this.add.circle(cx, cy, 42, 0xC9A961, 0.18).setDepth(15);
    this.tweens.add({
      targets: this.playerGlow,
      alpha: { from: 0.12, to: 0.24 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _createUI() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Top dark strip
    const top = this.add.graphics().setDepth(80).setScrollFactor(0);
    top.fillStyle(0x000000, 0.7).fillRect(0, 0, W, 44);
    top.lineStyle(1, 0x3a2040, 0.8).lineBetween(0, 44, W, 44);

    // HP bar
    this.add.text(12, 14, 'HP', {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: '#cc4444', fontStyle: 'bold',
    }).setDepth(82).setScrollFactor(0);
    this._hpBg = this.add.graphics().setDepth(81).setScrollFactor(0);
    this._hpBg.fillStyle(0x1a0000, 1).fillRoundedRect(30, 10, 240, 22, 4);
    this._hpFill = this.add.graphics().setDepth(82).setScrollFactor(0);
    this._hpText = this.add.text(150, 21, '100 / 100', {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#fff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(83).setScrollFactor(0);

    // Kill counter (right)
    this._killText = this.add.text(W - 12, 22, '0 Gefallen', {
      fontFamily: "'Space Mono', monospace", fontSize: '12px',
      color: '#ffaaaa',
    }).setOrigin(1, 0.5).setDepth(82).setScrollFactor(0);

    // Center title
    this.add.text(W / 2, 14, 'WURZELKAMMER', {
      fontFamily: "'Cinzel', serif", fontSize: '13px',
      color: CSS_COLORS.goldLight, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

    // Combo indicator below title
    this._comboText = this.add.text(W / 2, 32, '×1.0', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '14px',
      color: '#7a7080', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

    // Compact action bar — 4 square buttons centered at the bottom
    this._actionButtons = [];
    const btnSize = 56;
    const btnGap = 14;
    const btnCount = 4;
    const totalW = btnCount * btnSize + (btnCount - 1) * btnGap;
    const startX = W / 2 - totalW / 2 + btnSize / 2;
    const btnY = H - btnSize / 2 - 12;

    // Subtle bar background — narrow strip
    const bar = this.add.graphics().setDepth(80).setScrollFactor(0);
    bar.fillStyle(0x000000, 0.4).fillRect(0, btnY - btnSize / 2 - 6, W, btnSize + 12);
    bar.lineStyle(1, 0xC9A961, 0.25)
      .lineBetween(0, btnY - btnSize / 2 - 6, W, btnY - btnSize / 2 - 6);

    DEFAULT_VERSES.forEach((v, i) => {
      const cx = startX + i * (btnSize + btnGap);
      const stabColor = v.synergy ? 0xFFD66B : 0xcc88ff;
      this._actionButtons.push(
        this._createActionButton(cx, btnY, btnSize, {
          slot: i,
          keyLabel: String(i + 1),
          glyph: v.trigger.stab,
          glyphColor: stabColor,
          subLabel: this._verbShort(v.verb.id),
          tooltipText: v.text,
        })
      );
    });

    // 4th button — Skalden-Wirbel (SPACE)
    const swirlX = startX + 3 * (btnSize + btnGap);
    this._swirlButton = this._createActionButton(swirlX, btnY, btnSize, {
      slot: -1,
      keyLabel: '⎵',
      glyph: '✦',
      glyphColor: 0xFFB45A,
      subLabel: 'Wirbel',
      tooltipText: 'Skalden-Wirbel — 360° AoE-Stoß',
    });

    // Verse pop-up text holder — shows full stab-rhyme when a verse fires
    this._versePopupText = this.add.text(W / 2, H * 0.34, '', {
      fontFamily: "'Cinzel', serif", fontSize: '20px',
      color: '#e8dcc0', align: 'center', wordWrap: { width: W * 0.7 },
      stroke: '#000', strokeThickness: 3, fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(140).setScrollFactor(0).setAlpha(0);

    // For backward compatibility (cooldown / flash methods reference these)
    this._verseTexts = [];
    this._cooldownBars = [];

    // ESC hint
    this.add.text(W - 12, H - 8, 'ESC = Menü', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#5a4a6a',
    }).setOrigin(1, 1).setDepth(83).setScrollFactor(0);
  }

  _verbShort(verbId) {
    return ({
      burst: 'Burst', bind: 'Heilung', freeze: 'Frost',
      strike: 'Speer', nova: 'Nova',
    })[verbId] || verbId;
  }

  _createActionButton(cx, cy, size, opts) {
    const r = size / 2;
    const hex = opts.glyphColor;
    const colorCss = '#' + hex.toString(16).padStart(6, '0');
    const dimCss = '#' + this._dimHex(hex, 0.5).toString(16).padStart(6, '0');

    // Background frame
    const bg = this.add.graphics().setDepth(81).setScrollFactor(0);
    const cdOverlay = this.add.graphics().setDepth(83).setScrollFactor(0);

    const draw = (ready) => {
      bg.clear();
      bg.fillStyle(0x0E0A18, 0.92).fillRoundedRect(cx - r, cy - r, size, size, 8);
      bg.lineStyle(2, ready ? hex : 0x4a3a5e, ready ? 0.95 : 0.65)
        .strokeRoundedRect(cx - r, cy - r, size, size, 8);
    };
    draw(true);

    // Glyph in center
    const glyph = this.add.text(cx, cy, opts.glyph, {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '30px',
      color: colorCss, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(82).setScrollFactor(0);

    // Key badge (top-left)
    const keyBg = this.add.graphics().setDepth(82).setScrollFactor(0);
    keyBg.fillStyle(0x000000, 0.85).fillRoundedRect(cx - r - 4, cy - r - 4, 18, 18, 3);
    keyBg.lineStyle(1, 0xC9A961, 0.8).strokeRoundedRect(cx - r - 4, cy - r - 4, 18, 18, 3);
    const keyText = this.add.text(cx - r + 5, cy - r + 5, opts.keyLabel, {
      fontFamily: "'Cinzel', serif", fontSize: '11px',
      color: '#FFD66B', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(83).setScrollFactor(0);

    // Sub label below
    const sub = this.add.text(cx, cy + r + 9, opts.subLabel, {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: dimCss, letterSpacing: 1,
    }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

    return {
      slot: opts.slot,
      cx, cy, size, r, hex,
      bg, glyph, keyBg, keyText, sub, cdOverlay,
      draw,
      tooltipText: opts.tooltipText,
    };
  }

  _dimHex(hex, factor) {
    const r = ((hex >> 16) & 255) * factor;
    const g = ((hex >> 8) & 255) * factor;
    const b = (hex & 255) * factor;
    return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
  }

  _flashVerse(verse, active = false) {
    const idx = DEFAULT_VERSES.indexOf(verse);
    if (idx < 0 || !this._actionButtons[idx]) return;
    const btn = this._actionButtons[idx];
    const flashColor = active ? 0xFFD66B : btn.hex;

    // Pulse the button
    this.tweens.add({
      targets: btn.glyph,
      scale: { from: 1.0, to: active ? 1.6 : 1.4 },
      duration: 180, yoyo: true,
      onComplete: () => btn.glyph.setScale(1),
    });
    btn.bg.clear();
    btn.bg.fillStyle(this._dimHex(flashColor, 0.3), 0.95)
      .fillRoundedRect(btn.cx - btn.r, btn.cy - btn.r, btn.size, btn.size, 8);
    btn.bg.lineStyle(3, flashColor, 1)
      .strokeRoundedRect(btn.cx - btn.r, btn.cy - btn.r, btn.size, btn.size, 8);
    this.time.delayedCall(220, () => btn.draw(true));

    // Show verse-text pop-up
    this._showVersePopup(verse.text, active);
  }

  _showVersePopup(text, active) {
    if (!this._versePopupText) return;
    if (this._versePopupTween) this._versePopupTween.stop();
    this._versePopupText.setText(text);
    this._versePopupText.setColor(active ? '#FFD66B' : '#e8dcc0');
    this._versePopupText.setAlpha(0);
    this._versePopupText.setScale(0.7);
    this._versePopupTween = this.tweens.add({
      targets: this._versePopupText,
      alpha: { from: 0, to: 1 },
      scale: { from: 0.7, to: 1.05 },
      duration: 220, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this._versePopupText,
          alpha: 0, y: this._versePopupText.y - 30,
          duration: 800, delay: 800, ease: 'Cubic.easeIn',
          onComplete: () => {
            this._versePopupText.y = this.scale.height * 0.34;
          },
        });
      },
    });
  }

  _tryCast(slotIdx) {
    if (!this.skaldenlied) return;
    if (this.player.hp <= 0) return;
    const fired = this.skaldenlied.castActive(slotIdx);
    if (!fired) {
      // Subtle feedback for failed cast
      const entry = this._verseTexts[slotIdx];
      if (entry && entry.keyText) {
        this.tweens.add({
          targets: entry.keyText,
          alpha: { from: 0.4, to: 1 },
          duration: 200,
          yoyo: true,
        });
      }
    }
  }

  _trySwirl() {
    if (!this.skaldenlied || this.player.hp <= 0) return;
    if (!this.skaldenlied.triggerSwirl()) return;
    audio.cast();
    audio.bossHorn(); // satisfying low pulse
    // Hit-stop + heavy shake
    hitPause(this, 80);
    shakeHeavy(this);
    // Expand wave ring
    const x = this.player.x, y = this.player.y;
    const radius = 220;
    const ring = this.add.circle(x, y, 8, 0xFFB45A, 0)
      .setStrokeStyle(4, 0xFFD66B, 1).setDepth(28);
    this.tweens.add({
      targets: ring, radius, alpha: 0,
      duration: 480, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    // Damage + knockback all in radius
    if (this.enemies) {
      this.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - x, dy = e.y - y;
        const d = Math.hypot(dx, dy) || 1;
        if (d <= radius) {
          const dmg = 22 * this.skaldenlied.comboMultiplier();
          this.damageEnemy(e, dmg, x, y);
          if (e.body) {
            e.body.setVelocity(dx / d * 480, dy / d * 480);
            // damp after a beat
            this.time.delayedCall(180, () => { if (e && e.active && e.body) e.body.setVelocity(0, 0); });
          }
        }
      });
    }
  }

  _castRing(color) {
    const x = this.player.x, y = this.player.y;
    const ring = this.add.circle(x, y, 6, color, 0)
      .setStrokeStyle(3, color, 1).setDepth(28);
    this.tweens.add({
      targets: ring, radius: 90, alpha: 0,
      duration: 360, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
    // Cast-flash on screen edges
    const W = this.scale.width, H = this.scale.height;
    const flash = this.add.graphics().setDepth(160).setScrollFactor(0);
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    flash.fillStyle(color, 0.18);
    flash.fillRect(0, 0, W, 12);
    flash.fillRect(0, H - 12, W, 12);
    flash.fillRect(0, 0, 12, H);
    flash.fillRect(W - 12, 0, 12, H);
    this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
  }

  _critStamp(x, y) {
    const stamp = this.add.text(x, y - 50, 'CRIT!', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '22px',
      color: '#FFD66B', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#FFB45A', blur: 14, fill: true },
    }).setOrigin(0.5).setDepth(110)
      .setRotation((Math.random() * 16 - 8) * Math.PI / 180)
      .setScale(0.6).setAlpha(0);
    this.tweens.add({
      targets: stamp,
      scale: 1.2, alpha: 1,
      duration: 100, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: stamp, alpha: 0, y: y - 80,
          duration: 380, delay: 120, ease: 'Cubic.easeIn',
          onComplete: () => stamp.destroy(),
        });
      },
    });
  }

  _updateComboUI(combo) {
    if (!this._comboText) return;
    const mult = 1 + combo;
    this._comboText.setText(`×${mult.toFixed(1)}`);
    if (combo > 1.5) this._comboText.setColor('#FFD66B').setFontSize(16);
    else if (combo > 0.5) this._comboText.setColor('#cc88ff').setFontSize(15);
    else this._comboText.setColor('#7a7080').setFontSize(14);
    this.tweens.add({
      targets: this._comboText,
      scale: { from: 1, to: 1.18 }, duration: 120, yoyo: true,
    });
  }

  _updateCooldownBars() {
    if (!this._actionButtons || !this.skaldenlied) return;
    // Draw a darkening overlay sliding away from the bottom as the cooldown clears
    this._actionButtons.forEach((btn, i) => {
      const p = this.skaldenlied.getActiveCooldownProgress(i);
      btn.cdOverlay.clear();
      if (p < 1) {
        const fillH = btn.size * (1 - p);
        btn.cdOverlay
          .fillStyle(0x000000, 0.65)
          .fillRect(btn.cx - btn.r, btn.cy - btn.r, btn.size, fillH);
      } else {
        // Subtle pulse halo when ready
        const pulse = 0.5 + Math.sin(this.time.now * 0.005) * 0.5;
        btn.cdOverlay
          .lineStyle(2, btn.hex, pulse * 0.35)
          .strokeRoundedRect(btn.cx - btn.r - 2, btn.cy - btn.r - 2, btn.size + 4, btn.size + 4, 9);
      }
    });

    // Swirl button cooldown
    if (this._swirlButton && this.skaldenlied) {
      const p = this.skaldenlied.swirlCooldownProgress();
      const btn = this._swirlButton;
      btn.cdOverlay.clear();
      if (p < 1) {
        const fillH = btn.size * (1 - p);
        btn.cdOverlay
          .fillStyle(0x000000, 0.65)
          .fillRect(btn.cx - btn.r, btn.cy - btn.r, btn.size, fillH);
      } else {
        const pulse = 0.5 + Math.sin(this.time.now * 0.005) * 0.5;
        btn.cdOverlay
          .lineStyle(2, btn.hex, pulse * 0.4)
          .strokeRoundedRect(btn.cx - btn.r - 2, btn.cy - btn.r - 2, btn.size + 4, btn.size + 4, 9);
      }
    }
  }

  _showOnboarding() {
    const W = this.scale.width, H = this.scale.height;
    const ov = this.add.graphics().setDepth(180).setScrollFactor(0);
    ov.fillStyle(0x000000, 0.55).fillRect(0, 0, W, H);

    const title = this.add.text(W / 2, H * 0.30, 'BEFEHLE', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '20px',
      color: '#FFD66B', fontStyle: 'bold', letterSpacing: 6,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const moveHint = this.add.text(W / 2, H * 0.36, 'WASD / Pfeiltasten — bewegen', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#e8dcc0', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const versHint = this.add.text(W / 2, H * 0.43,
      '1 · 2 · 3   —   aktive Verse (Tasten gehören zu deinem Lied)', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#cc88ff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const swirlHint = this.add.text(W / 2, H * 0.49,
      'Leertaste   —   Skalden-Wirbel (360° Stoß, 4 Sek Cooldown)', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#FFB45A', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const goal = this.add.text(W / 2, H * 0.57,
      'Sieben Wellen. Eine Krone fällt am Ende der fünften.', {
      fontFamily: "'Lora', serif", fontSize: '13px', fontStyle: 'italic',
      color: '#a89888', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const skip = this.add.text(W / 2, H * 0.64,
      '(Beliebige Taste — beginnen)', {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: '#7a7080',
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, duration: 400 });
    this.tweens.add({ targets: moveHint, alpha: 1, duration: 400, delay: 350 });
    this.tweens.add({ targets: versHint, alpha: 1, duration: 400, delay: 700 });
    this.tweens.add({ targets: swirlHint, alpha: 1, duration: 400, delay: 1050 });
    this.tweens.add({ targets: goal, alpha: 1, duration: 400, delay: 1400 });
    this.tweens.add({ targets: skip, alpha: 1, duration: 400, delay: 1800 });

    const dismiss = () => {
      if (this._onboardingDismissed) return;
      this._onboardingDismissed = true;
      [ov, title, moveHint, versHint, swirlHint, goal, skip].forEach(o => {
        this.tweens.add({ targets: o, alpha: 0, duration: 400, onComplete: () => o.destroy() });
      });
      this.input.keyboard.off('keydown', dismiss);
    };
    // After 4.2s OR any keypress
    this.time.delayedCall(4200, dismiss);
    this.input.keyboard.on('keydown', dismiss);
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    // Movement
    const k = this.keys;
    let vx = 0, vy = 0;
    if (k.W.isDown || k.UP.isDown)    vy = -1;
    if (k.S.isDown || k.DOWN.isDown)  vy = 1;
    if (k.A.isDown || k.LEFT.isDown)  vx = -1;
    if (k.D.isDown || k.RIGHT.isDown) vx = 1;
    if (vx || vy) {
      const n = Math.hypot(vx, vy);
      this.player.setVelocity(vx / n * this.player.speed, vy / n * this.player.speed);
      this.skaldenlied.markAction();
    } else {
      this.player.setVelocity(0, 0);
    }

    this.playerGlow.x = this.player.x;
    this.playerGlow.y = this.player.y;

    this._updateHpBar();
    this._updateEnemies(delta);
    this._updateCooldownBars();
  }

  _updateHpBar() {
    const r = Math.max(0, this.player.hp / this.player.maxHp);
    this._hpFill.clear();
    const w = 240 * r;
    if (w > 0) {
      const c = r > 0.5 ? 0xdd2222 : r > 0.25 ? 0xff7700 : 0xff1111;
      this._hpFill.fillStyle(c, 1).fillRoundedRect(31, 11, w - 2, 20, 3);
      this._hpFill.fillStyle(0xffffff, 0.18).fillRoundedRect(31, 11, w - 2, 6, 2);
    }
    this._hpText.setText(`${Math.max(0, Math.floor(this.player.hp))} / ${this.player.maxHp}`);
  }

  _spawnDraugr() {
    if (this._bossActive) return;
    if (this._bossPending) {
      this._spawnDraugrKing();
      return;
    }
    const corner = Phaser.Math.RND.pick(this._spawnCorners);
    const offset = 40;
    const ox = corner.x + (Math.random() - 0.5) * offset;
    const oy = corner.y + (Math.random() - 0.5) * offset;

    // Wave 3+: 30% chance for warrior; wave 5+: 50%
    const warriorChance = this._waveIndex >= 5 ? 0.5 : this._waveIndex >= 3 ? 0.3 : 0;
    if (Math.random() < warriorChance) {
      const key = createDraugrWarriorTexture(this);
      const e = this.physics.add.sprite(ox, oy, key);
      e.setCircle(16, 32, 30);
      e.hp = 64;
      e.maxHp = 64;
      e.damage = 16;
      e.speed = 55 + Math.random() * 20;
      e.speedMult = 1;
      e.setDepth(18);
      e.lastTouchAt = 0;
      e.kind = 'warrior';
      this.enemies.add(e);
      return;
    }

    const key = createDraugrTexture(this);
    const e = this.physics.add.sprite(ox, oy, key);
    e.setCircle(14, 26, 22);
    const waveScale = 1 + (this._waveIndex - 1) * 0.15;
    e.hp = Math.round(28 * waveScale);
    e.maxHp = e.hp;
    e.damage = Math.round(8 * waveScale);
    e.speed = 80 + Math.random() * 30 + this._waveIndex * 4;
    e.speedMult = 1;
    e.setDepth(18);
    e.lastTouchAt = 0;
    e.kind = 'draugr';
    this.enemies.add(e);
  }

  _spawnDraugrKing() {
    this._bossPending = false;
    this._bossActive = true;
    audio.bossHorn();
    shakeHeavy(this);

    // Use the Higgsfield-painted king if loaded, fallback procedural
    const key = this.textures.exists('draugr_king_img') ? 'draugr_king_img' : createDraugrKingTexture(this);
    const ox = ROOM_W / 2;
    const oy = 200;
    const e = this.physics.add.sprite(ox, oy, key);
    if (key === 'draugr_king_img') {
      e.setScale(0.18);
      e.setCircle(180, 332, 380);
    } else {
      e.setCircle(22, 42, 50);
    }
    e.hp = 320;
    e.maxHp = 320;
    e.damage = 24;
    e.speed = 70;
    e.speedMult = 1;
    e.setDepth(19);
    e.lastTouchAt = 0;
    e.kind = 'king';
    this.enemies.add(e);
    this._kingRef = e;

    // Boss-name banner
    const W = this.scale.width, H = this.scale.height;
    const banner = this.add.text(W / 2, H / 2 - 40, 'DRAUGR-KÖNIG ERWACHT', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '36px',
      color: '#FF3322', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff3322', blur: 16, fill: true },
    }).setOrigin(0.5).setDepth(150).setScrollFactor(0).setAlpha(0);
    const sub = this.add.text(W / 2, H / 2 + 4, 'Sieger über sieben Skalden vor dir', {
      fontFamily: "'Lora', serif", fontSize: '13px',
      color: '#cc88ff', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(150).setScrollFactor(0).setAlpha(0);
    this.tweens.add({
      targets: [banner, sub], alpha: 1, duration: 600,
      onComplete: () => {
        this.time.delayedCall(2200, () => {
          this.tweens.add({
            targets: [banner, sub], alpha: 0, duration: 800,
            onComplete: () => { banner.destroy(); sub.destroy(); },
          });
        });
      },
    });
  }

  _updateEnemies(delta) {
    if (!this.enemies) return;
    const px = this.player.x, py = this.player.y;
    this.enemies.children.iterate((e) => {
      if (!e || !e.active) return;
      const dx = px - e.x, dy = py - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const v = e.speed * (e.speedMult || 1);
      e.setVelocity(dx / d * v, dy / d * v);

      // Touch damage every 600ms
      if (d < 22 && this.time.now - e.lastTouchAt > 600) {
        e.lastTouchAt = this.time.now;
        this._playerTakeDamage(e.damage, e.x, e.y);
      }
    });
  }

  _playerTakeDamage(dmg, srcX, srcY) {
    if (this.player.hp <= 0) return;
    this.player.hp -= dmg;
    audio.hitHeavy();
    hitPause(this, FEEL.HIT_PAUSE_NORMAL);
    shakeHeavy(this);
    damagePopup(this, this.player.x, this.player.y - 20, dmg);
    // Flash player red
    this.player.setTint(0xff4444);
    this.time.delayedCall(80, () => this.player.clearTint());
    this.skaldenlied.onPlayerTookDamage();
    if (this.player.hp <= 0) this._gameOver();
  }

  _updateProjectiles() {
    if (!this.skaldProjectiles) return;
    const now = this.time.now;
    this.skaldProjectiles.children.iterate((p) => {
      if (!p || !p.active) return;
      if (now - p.bornAt > p.lifetime) { p.destroy(); return; }
      // Collide with enemies
      if (!this.enemies) return;
      this.enemies.children.iterate((e) => {
        if (!e || !e.active || !p.active) return;
        const dx = e.x - p.x, dy = e.y - p.y;
        if (dx * dx + dy * dy < (e.body.radius + p.radius) ** 2) {
          this.damageEnemy(e, p.damage, p.x, p.y);
          p.destroy();
        }
      });
    });
  }

  damageEnemy(e, dmg, srcX, srcY) {
    if (!e || !e.active) return;
    const crit = Math.random() < 0.18;
    const finalDmg = crit ? dmg * 2 : dmg;
    e.hp -= finalDmg;
    audio.hitLight();
    damagePopup(this, e.x, e.y - 22, Math.floor(finalDmg), crit);
    squashStretch(this, e);
    if (crit) {
      critPunch(this);
      this._critStamp(e.x, e.y);
      hitPause(this, FEEL.HIT_PAUSE_CRIT);
      shakeHeavy(this);
    } else {
      shakeNormal(this);
    }
    hitBurst(this, e.x, e.y, (e.x - (srcX || e.x)), (e.y - (srcY || e.y)), crit ? 0xFFD66B : 0xff8844);
    this.skaldenlied?.registerHit();
    if (e.hp <= 0) {
      const wasBoss = e.kind === 'king';
      this._killsThisWave++;
      this._totalKills = (this._totalKills || 0) + 1;
      this._killText.setText(`${this._totalKills} Gefallen`);
      this.skaldenlied.onEnemyKilled(e);
      audio.pickup();

      if (wasBoss) {
        this._bossActive = false;
        this._kingRef = null;
        slowMo(this);
        audio.bossDeath();
        shakeHeavy(this);
        hitPause(this, FEEL.HIT_PAUSE_CRIT * 2);
        // Massive particle burst
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2;
          hitBurst(this, e.x, e.y, Math.cos(angle) * 50, Math.sin(angle) * 50, 0xFFB45A);
        }
        // Show royal-down banner
        const W = this.scale.width, H = this.scale.height;
        const banner = this.add.text(W / 2, H / 2, 'KÖNIG GEFALLEN', {
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '40px',
          color: '#FFD66B', fontStyle: 'bold',
          stroke: '#000', strokeThickness: 4,
          shadow: { offsetX: 0, offsetY: 0, color: '#FFB45A', blur: 18, fill: true },
        }).setOrigin(0.5).setDepth(150).setScrollFactor(0).setAlpha(0);
        this.tweens.add({
          targets: banner, alpha: 1, duration: 400,
          onComplete: () => {
            this.time.delayedCall(2200, () => {
              this.tweens.add({ targets: banner, alpha: 0, duration: 600, onComplete: () => banner.destroy() });
            });
          },
        });
        // Advance wave significantly
        this._waveIndex += 1;
        this._killsThisWave = 0;
        this._waveSize = 8 + this._waveIndex * 2;
      } else if (this._killsThisWave >= this._waveSize) {
        // End of regular wave
        this._waveIndex += 1;
        this._killsThisWave = 0;
        this._waveSize += 2;
        slowMo(this);
        shakeHeavy(this);
        hitPause(this, FEEL.HIT_PAUSE_CRIT);
        // Trigger boss at wave 5
        if (this._waveIndex === 5 && !this._bossActive) {
          this._bossPending = true;
        }
      }
      e.destroy();
    } else {
      hitPause(this, 30);
    }
  }

  _gameOver() {
    audio.stopCombatPulse();
    audio.stopAmbientDrone();
    const W = this.scale.width, H = this.scale.height;

    // Dim overlay with slow fade-in
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setDepth(200).setScrollFactor(0);
    this.tweens.add({ targets: overlay, fillAlpha: 0.88, duration: 1200 });

    // Mímir-foreshadowing line — pulled from a small pool by run
    const mimirLines = [
      '„Der siebte Skalde fällt. Bald wird der achte gewoben."',
      '„Du dachtest, du wärst der Erste. Vier Knochen vor dir trugen deinen Namen."',
      '„Mímir trinkt aus seinem Brunnen und lächelt. Es geht voran."',
      '„Eine Norne webt ein neues Garn. Es trägt schon deine Farbe."',
      '„Sie sagten dir, du wärst gewählt. Sie logen, weil es freundlich klang."',
    ];
    const line = mimirLines[(this._totalKills || 0) % mimirLines.length];

    // Bragi memo strophe
    const memo =
      'Hörnerklang aus Helheim hallt,\n' +
      'Skalde sank, sein Lied verstummte.\n' +
      'Sieben Söhne sanken sanft —\n' +
      'Wer ist nun der Achte, der?';

    const fallenTitle = this.add.text(W / 2, H * 0.22, 'DU BIST GEFALLEN', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '34px',
      color: '#FFD66B', fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#FFB45A', blur: 12, fill: true },
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

    // Stats line
    const stats = this.add.text(
      W / 2, H * 0.30,
      `Welle ${this._waveIndex || 1}   ·   ${this._totalKills || 0} Gefallen`,
      { fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#a89888' }
    ).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

    // Mímir's voice
    const mimirVoice = this.add.text(W / 2, H * 0.46, line, {
      fontFamily: "'Lora', serif", fontSize: '17px', fontStyle: 'italic',
      color: '#cc88ff', align: 'center', wordWrap: { width: W * 0.7 },
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

    const memoLine = this.add.text(W / 2, H * 0.66, memo, {
      fontFamily: "'Cinzel', serif", fontSize: '12px', color: '#7a7080',
      align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

    const hint = this.add.text(W / 2, H * 0.88,
      '↵ ENTER — Steige erneut hinab        ESC — Verlasse den Brunnen', {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#5a4a6a', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0).setAlpha(0);

    // Sequence the reveal
    const tlOpts = (target, delay) => ({
      targets: target, alpha: 1, duration: 900, delay, ease: 'Cubic.easeOut',
    });
    this.tweens.add(tlOpts(fallenTitle, 600));
    this.tweens.add(tlOpts(stats, 1200));
    this.tweens.add(tlOpts(mimirVoice, 2200));
    this.tweens.add(tlOpts(memoLine, 3400));
    this.tweens.add(tlOpts(hint, 4400));

    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart());
  }

  _returnToMenu() {
    audio.stopCombatPulse();
    audio.stopAmbientDrone();
    this.scene.start('MenuScene');
  }

  shutdown() {
    audio.stopCombatPulse();
    audio.stopAmbientDrone();
    this.skaldenlied?.destroy();
  }
}
