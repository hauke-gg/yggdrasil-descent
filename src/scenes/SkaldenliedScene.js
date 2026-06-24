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
import { DEFAULT_VERSES, buildVerses } from '../data/verses.js';
import { SKALDS, DEFAULT_SKALD } from '../data/skalds.js';
import { GODS, BOON_LIBRARY, rollBoonChoice } from '../data/boons.js';
import { isMobile } from '../utils/MobileDetect.js';
import VirtualJoystick from '../ui/VirtualJoystick.js';
import { makeBlackTransparent } from '../utils/SpritePostprocess.js';
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

const ROOM_W = 3200;
const ROOM_H = 3200;
const CENTER_X = ROOM_W / 2;
const CENTER_Y = ROOM_H / 2;
const HIGGSFIELD_SIZE = 2400; // central painted region — most of the playable map

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
    const chosenIds = this.registry.get('chosenVerseIds');
    this._verses = chosenIds && chosenIds.length === 3
      ? buildVerses(chosenIds)
      : DEFAULT_VERSES;
    this.skaldenlied = new Skaldenlied(this, { verses: this._verses });
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

    // Mobile touch controls
    this._mobile = isMobile(this);
    if (this._mobile) {
      this._joystick = new VirtualJoystick(this);
    }

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
    // Base floor — darker outer ring + mauve-tinted core
    const floor = this.add.graphics().setDepth(-2);
    floor.fillStyle(0x0A0612, 1).fillRect(0, 0, ROOM_W, ROOM_H);

    // Outer band gets a deeper helheim tint so the edge of the world doesn't read as "empty"
    const bandSteps = 14;
    for (let i = 0; i < bandSteps; i++) {
      const t = i / bandSteps;
      const inset = t * 220;
      const alpha = 0.05 * (1 - t);
      floor.fillStyle(0x2A1C36, alpha)
        .fillRect(inset, inset, ROOM_W - inset * 2, ROOM_H - inset * 2);
    }

    // Tile-able floor texture — large rune-stones grid evenly across the outer area
    const TILE = 320;
    floor.lineStyle(1, 0x3a2040, 0.55);
    for (let tx = 0; tx <= ROOM_W; tx += TILE) {
      floor.beginPath().moveTo(tx, 0).lineTo(tx, ROOM_H).strokePath();
    }
    for (let ty = 0; ty <= ROOM_H; ty += TILE) {
      floor.beginPath().moveTo(0, ty).lineTo(ROOM_W, ty).strokePath();
    }

    // Rune carvings only outside the painted Higgsfield area
    floor.lineStyle(1.5, 0xC9A961, 0.28);
    const RUNE_COUNT = 56;
    for (let i = 0; i < RUNE_COUNT; i++) {
      const rx = Math.random() * ROOM_W;
      const ry = Math.random() * ROOM_H;
      const dx = rx - CENTER_X, dy = ry - CENTER_Y;
      if (dx * dx + dy * dy < (HIGGSFIELD_SIZE / 2.2) * (HIGGSFIELD_SIZE / 2.2)) continue;
      const variant = Math.floor(Math.random() * 3);
      floor.beginPath();
      if (variant === 0) {
        floor.moveTo(rx - 10, ry - 10).lineTo(rx + 10, ry + 10)
             .moveTo(rx + 10, ry - 10).lineTo(rx - 10, ry + 10);
      } else if (variant === 1) {
        floor.moveTo(rx, ry - 12).lineTo(rx, ry + 12)
             .moveTo(rx - 8, ry).lineTo(rx + 8, ry);
      } else {
        floor.moveTo(rx - 12, ry).lineTo(rx, ry - 10).lineTo(rx + 12, ry)
             .lineTo(rx, ry + 10).closePath();
      }
      floor.strokePath();
    }

    // Higgsfield Wurzelkammer at center — now bigger so the painted area
    // covers most of the visible play space
    if (this.textures.exists('wurzelkammer_bg')) {
      this.add.image(CENTER_X, CENTER_Y, 'wurzelkammer_bg')
        .setDisplaySize(HIGGSFIELD_SIZE, HIGGSFIELD_SIZE)
        .setDepth(-1);
    }

    // Soft transition: dark radial fade outside the Higgsfield area
    const fade = this.add.graphics().setDepth(0);
    const fadeRadius = HIGGSFIELD_SIZE / 1.4;
    for (let r = fadeRadius * 1.8; r > fadeRadius; r -= 30) {
      const t = (r - fadeRadius) / (fadeRadius * 0.8);
      fade.fillStyle(0x06000F, t * 0.08).fillCircle(CENTER_X, CENTER_Y, r);
    }

    // Distant Yggdrasil-root pillars scattered through the world
    const pillars = this.add.graphics().setDepth(-1.5);
    for (let i = 0; i < 10; i++) {
      const px = Math.random() * ROOM_W;
      const py = Math.random() * ROOM_H;
      // Skip pillars too close to the Higgsfield center
      const dx = px - CENTER_X, dy = py - CENTER_Y;
      if (dx * dx + dy * dy < HIGGSFIELD_SIZE * HIGGSFIELD_SIZE / 4) continue;
      const pSize = 40 + Math.random() * 30;
      // Pillar silhouette
      pillars.fillStyle(0x0E0A18, 0.95).fillCircle(px, py, pSize);
      pillars.fillStyle(0x1A1422, 0.8).fillCircle(px, py - pSize / 3, pSize * 0.8);
      pillars.lineStyle(1.5, 0x3a2040, 0.7).strokeCircle(px, py, pSize);
      // Gold rune mark on some
      if (Math.random() < 0.3) {
        pillars.fillStyle(0xFFB45A, 0.55).fillCircle(px, py - pSize / 4, 4);
      }
    }

    // Atmosphere: mist only near the center where it's "lit"
    spawnMist(this, ROOM_W, ROOM_H, 5);

    // Volumetric god-rays only at center
    spawnLightShaft(this, CENTER_X - 200, CENTER_Y - HIGGSFIELD_SIZE / 2,
                    HIGGSFIELD_SIZE * 9 / 16, 140, 4);
    spawnLightShaft(this, CENTER_X + 280, CENTER_Y - HIGGSFIELD_SIZE / 2,
                    HIGGSFIELD_SIZE * 9 / 16, 100, 4);

    // Vignette is camera-pinned
    drawVignette(this, this.scale.width, this.scale.height, 60);
  }

  _createPlayer() {
    const cx = CENTER_X, cy = CENTER_Y;
    const selectedId = this.registry.get('selectedSkald') || DEFAULT_SKALD;
    const skald = SKALDS[selectedId] || SKALDS[DEFAULT_SKALD];
    this._skaldProfile = skald;

    let key, useHiggsfield = false;
    if (this.textures.exists(skald.portrait)) {
      key = makeBlackTransparent(this, skald.portrait);
      useHiggsfield = true;
    } else {
      key = createSkaldTexture(this);
    }

    this.player = this.physics.add.sprite(cx, cy, key);
    if (useHiggsfield) {
      this.player.setScale(skald.spriteScale);
      this.player.setCircle(skald.bodyRadius, skald.bodyOffsetX, skald.bodyOffsetY);
    } else {
      this.player.setCircle(18, 30, 36);
    }
    this.player.setCollideWorldBounds(true);
    this.player.maxHp = skald.stats.hp;
    this.player.hp = skald.stats.hp;
    this.player.dmgMult = skald.stats.dmg;
    this.player.speed = skald.stats.spd;
    this.player.setDepth(20);
    this._playerBaseScale = this.player.scaleX;
    this._playerFacing = 1; // 1 = right, -1 = left

    // Idle breath: visible scaleY pulse — NOTE: no .y tween, that would
    // fight the velocity-driven vertical movement.
    this.tweens.add({
      targets: this.player,
      scaleY: this.player.scaleY * 1.08,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

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

    // Compact action bar
    // Desktop: centered at the bottom in a single row
    // Mobile: 2×2 grid in the bottom-right corner (thumb-friendly)
    this._actionButtons = [];
    const onMobile = isMobile(this);
    const btnSize = onMobile ? 78 : 56;
    const btnGap = onMobile ? 12 : 14;
    let btnPositions;
    if (onMobile) {
      const gridW = 2 * btnSize + btnGap;
      const gridH = 2 * btnSize + btnGap;
      const baseX = W - gridW - 22;
      const baseY = H - gridH - 22;
      btnPositions = [
        { cx: baseX + btnSize / 2,                    cy: baseY + btnSize / 2 },
        { cx: baseX + btnSize + btnGap + btnSize / 2, cy: baseY + btnSize / 2 },
        { cx: baseX + btnSize / 2,                    cy: baseY + btnSize + btnGap + btnSize / 2 },
        { cx: baseX + btnSize + btnGap + btnSize / 2, cy: baseY + btnSize + btnGap + btnSize / 2 },
      ];
    } else {
      const totalW = 4 * btnSize + 3 * btnGap;
      const startX = W / 2 - totalW / 2 + btnSize / 2;
      const btnY = H - btnSize / 2 - 12;
      btnPositions = [0, 1, 2, 3].map(i => ({
        cx: startX + i * (btnSize + btnGap),
        cy: btnY,
      }));
      const bar = this.add.graphics().setDepth(80).setScrollFactor(0);
      bar.fillStyle(0x000000, 0.4).fillRect(0, btnY - btnSize / 2 - 6, W, btnSize + 12);
      bar.lineStyle(1, 0xC9A961, 0.25)
        .lineBetween(0, btnY - btnSize / 2 - 6, W, btnY - btnSize / 2 - 6);
    }

    const verses = this._verses || DEFAULT_VERSES;
    verses.forEach((v, i) => {
      const pos = btnPositions[i];
      const stabColor = v.synergy ? 0xFFD66B : 0xcc88ff;
      this._actionButtons.push(
        this._createActionButton(pos.cx, pos.cy, btnSize, {
          slot: i,
          keyLabel: onMobile ? '' : String(i + 1),
          glyph: v.trigger.stab,
          glyphColor: stabColor,
          subLabel: this._verbShort(v.verb.id),
          tooltipText: v.text,
          tappable: onMobile,
        })
      );
    });

    // 4th button — Skalden-Wirbel (SPACE)
    const swirlPos = btnPositions[3];
    this._swirlButton = this._createActionButton(swirlPos.cx, swirlPos.cy, btnSize, {
      slot: -1,
      keyLabel: onMobile ? '' : '⎵',
      glyph: '✦',
      glyphColor: 0xFFB45A,
      subLabel: 'Wirbel',
      tooltipText: 'Skalden-Wirbel — 360° AoE-Stoß',
      tappable: onMobile,
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

    // ESC / Back hint — top-right corner to avoid clash with action bar
    const escLabel = isMobile(this) ? '✕ Menü' : 'ESC = Menü';
    const escText = this.add.text(W - 12, 50, escLabel, {
      fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#7a7080',
    }).setOrigin(1, 0).setDepth(83).setScrollFactor(0);
    if (isMobile(this)) {
      escText.setInteractive({ useHandCursor: true });
      escText.on('pointerdown', () => this._returnToMenu());
    }
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

    // Glyph in center (scales with size)
    const glyphSize = Math.round(size * 0.55);
    const glyph = this.add.text(cx, cy, opts.glyph, {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: glyphSize + 'px',
      color: colorCss, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(82).setScrollFactor(0);

    // Key badge — only on desktop
    let keyBg = null, keyText = null;
    if (opts.keyLabel) {
      keyBg = this.add.graphics().setDepth(82).setScrollFactor(0);
      keyBg.fillStyle(0x000000, 0.85).fillRoundedRect(cx - r - 4, cy - r - 4, 18, 18, 3);
      keyBg.lineStyle(1, 0xC9A961, 0.8).strokeRoundedRect(cx - r - 4, cy - r - 4, 18, 18, 3);
      keyText = this.add.text(cx - r + 5, cy - r + 5, opts.keyLabel, {
        fontFamily: "'Cinzel', serif", fontSize: '11px',
        color: '#FFD66B', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(83).setScrollFactor(0);
    }

    // Sub label below — desktop only; on mobile the 2×2 grid would overlap
    let sub = null;
    if (!isMobile(this)) {
      sub = this.add.text(cx, cy + r + 8, opts.subLabel, {
        fontFamily: "'Space Mono', monospace", fontSize: '9px',
        color: dimCss, letterSpacing: 1,
      }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);
    }

    // Tap zone — only on mobile, fires the cast/swirl
    if (opts.tappable) {
      const hit = this.add.rectangle(cx, cy, size + 8, size + 8, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0).setDepth(84);
      hit.on('pointerdown', () => {
        if (opts.slot >= 0) this._tryCast(opts.slot);
        else this._trySwirl();
      });
    }

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
    const verses = this._verses || DEFAULT_VERSES;
    const idx = verses.indexOf(verse);
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

  _presentBoonChoice(godId) {
    if (this._boonActive) return;
    this._boonActive = true;
    this.physics.pause();
    audio.bossHorn();

    const god = GODS[godId] || GODS.loki;
    const W = this.scale.width, H = this.scale.height;
    const layer = this.add.container(0, 0).setDepth(220).setScrollFactor(0);

    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0).fillRect(0, 0, W, H);
    layer.add(ov);
    this.tweens.add({ targets: ov, fillAlpha: 0.78, duration: 600 });

    // God portrait left
    let portrait = null;
    if (this.textures.exists(god.portrait)) {
      const cleanKey = makeBlackTransparent(this, god.portrait);
      portrait = this.add.image(W * 0.25, H * 0.5, cleanKey)
        .setDisplaySize(H * 0.7, H * 0.7).setAlpha(0);
      layer.add(portrait);
      this.tweens.add({ targets: portrait, alpha: 1, duration: 900, delay: 200 });
    }

    // God name + monologue right
    const name = this.add.text(W * 0.58, H * 0.18, god.name, {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '38px',
      color: god.color, fontStyle: 'bold', letterSpacing: 8,
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0, 0).setAlpha(0);
    layer.add(name);
    this.tweens.add({ targets: name, alpha: 1, duration: 700, delay: 600 });

    const title = this.add.text(W * 0.58, H * 0.27, god.title, {
      fontFamily: "'Lora', serif", fontSize: '14px', fontStyle: 'italic',
      color: '#a89888',
    }).setOrigin(0, 0).setAlpha(0);
    layer.add(title);
    this.tweens.add({ targets: title, alpha: 1, duration: 700, delay: 900 });

    const mono = this.add.text(W * 0.58, H * 0.34, '„' + god.monologue + '"', {
      fontFamily: "'Lora', serif", fontSize: '15px',
      color: '#e8dcc0', wordWrap: { width: W * 0.36 },
      lineSpacing: 4, fontStyle: 'italic',
    }).setOrigin(0, 0).setAlpha(0);
    layer.add(mono);
    this.tweens.add({ targets: mono, alpha: 1, duration: 800, delay: 1300 });

    // 3 boon cards
    const choices = rollBoonChoice(god.id);
    const cw = 200, ch = 130, cgap = 16;
    const cardsTotalW = 3 * cw + 2 * cgap;
    const cardsStartX = W * 0.58 + cardsTotalW / 6 - cardsTotalW / 2 + cw / 2;
    const cardsY = H * 0.66;

    choices.forEach((boon, i) => {
      const cx = W * 0.58 + (cardsTotalW / 2) - cardsTotalW + i * (cw + cgap) + cw / 2;
      const ry = cardsY - ch / 2;
      const rx = cx - cw / 2;
      const bg = this.add.graphics();
      const draw = (hover) => {
        bg.clear();
        bg.fillStyle(hover ? 0x1A0F2A : 0x0E0A18, 0.95)
          .fillRoundedRect(rx, ry, cw, ch, 8);
        bg.lineStyle(hover ? 3 : 2, hover ? Phaser.Display.Color.HexStringToColor(god.color).color : 0x4a3a5e, hover ? 0.95 : 0.8)
          .strokeRoundedRect(rx, ry, cw, ch, 8);
      };
      draw(false);
      const cardName = this.add.text(cx, ry + 18, boon.name, {
        fontFamily: "'Cinzel', serif", fontSize: '14px', fontStyle: 'bold',
        color: god.color, align: 'center', wordWrap: { width: cw - 16 },
      }).setOrigin(0.5, 0);
      const cardDesc = this.add.text(cx, ry + 56, boon.description, {
        fontFamily: "'Lora', serif", fontSize: '11px',
        color: '#cdb8a8', align: 'center', wordWrap: { width: cw - 20 },
        lineSpacing: 2,
      }).setOrigin(0.5, 0);
      const hit = this.add.rectangle(cx, cardsY, cw, ch, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerover', () => draw(true));
      hit.on('pointerout', () => draw(false));
      hit.on('pointerdown', () => this._chooseBoon(boon, layer));

      layer.add([bg, cardName, cardDesc, hit]);
      [bg, cardName, cardDesc].forEach(o => o.setAlpha(0));
      this.tweens.add({ targets: [bg, cardName, cardDesc], alpha: 1, duration: 500, delay: 1700 + i * 200 });
    });

    this._boonLayer = layer;
  }

  _chooseBoon(boon, layer) {
    if (!this._boonActive) return;
    this._boonState = this._boonState || {
      dmgMult: 1, spdMult: 1, cdMult: 1, swirlCdMult: 1, swirlDmgMult: 1,
      maxHpMult: 1, comboDecayMult: 1, comboCap: 3.0,
      critBonus: 0, healOnCrit: 0,
    };
    boon.apply(this._boonState);
    this._applyBoonStateToPlayer();
    // Fade overlay
    this.tweens.add({
      targets: layer.list,
      alpha: 0, duration: 500,
      onComplete: () => {
        layer.destroy();
        this.physics.resume();
        this._boonActive = false;
      },
    });
    // Visual flash on player
    const ring = this.add.circle(this.player.x, this.player.y, 12, 0xFFD66B, 0)
      .setStrokeStyle(3, 0xFFD66B, 1).setDepth(28);
    this.tweens.add({
      targets: ring, radius: 120, alpha: 0,
      duration: 700, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  _applyBoonStateToPlayer() {
    const s = this._boonState;
    if (!s || !this.player) return;
    // Speed
    this.player.speed = (this._skaldProfile?.stats?.spd || 220) * s.spdMult;
    // Max HP
    const baseMax = this._skaldProfile?.stats?.hp || 100;
    const newMax = Math.round(baseMax * s.maxHpMult + (s.maxHpBonus || 0));
    const ratio = this.player.hp / this.player.maxHp;
    this.player.maxHp = newMax;
    this.player.hp = Math.min(newMax, Math.round(newMax * ratio + (s.healOnApply || 0)));
    s.healOnApply = 0;
    // Damage multiplier — kept on the scene, applied in damage flow
    this._dmgBoonMult = s.dmgMult;
    // Cooldown multiplier — applied to Skaldenlied
    if (this.skaldenlied) {
      this.skaldenlied._activeCdMs = this.skaldenlied._activeCdMs.map(
        cd => Math.round(cd * (s.cdMult / (this._lastCdMult || 1)))
      );
      this._lastCdMult = s.cdMult;
      // Combo cap + decay
      this.skaldenlied.comboCap = s.comboCap;
      this.skaldenlied._comboDecayDelay = 2000 / (s.comboDecayMult || 1);
    }
  }

  _showOnboarding() {
    const W = this.scale.width, H = this.scale.height;
    const ov = this.add.graphics().setDepth(180).setScrollFactor(0);
    ov.fillStyle(0x000000, 0.55).fillRect(0, 0, W, H);

    const onMobile = isMobile(this);

    const title = this.add.text(W / 2, H * 0.30, 'BEFEHLE', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '20px',
      color: '#FFD66B', fontStyle: 'bold', letterSpacing: 6,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const moveHint = this.add.text(W / 2, H * 0.36,
      onMobile ? 'Linker Daumen — Joystick zum Bewegen' : 'WASD / Pfeiltasten — bewegen', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#e8dcc0', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const versHint = this.add.text(W / 2, H * 0.43,
      onMobile
        ? 'Rechte Buttons   —   tippen, um Verse zu casten'
        : '1 · 2 · 3   —   aktive Verse (Tasten gehören zu deinem Lied)', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#cc88ff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const swirlHint = this.add.text(W / 2, H * 0.49,
      onMobile
        ? '✦ — Skalden-Wirbel (360° Stoß, 4 Sek Cooldown)'
        : 'Leertaste   —   Skalden-Wirbel (360° Stoß, 4 Sek Cooldown)', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: '#FFB45A', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const goal = this.add.text(W / 2, H * 0.57,
      'Sieben Wellen. Eine Krone fällt am Ende der fünften.', {
      fontFamily: "'Lora', serif", fontSize: '13px', fontStyle: 'italic',
      color: '#a89888', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(181).setScrollFactor(0).setAlpha(0);

    const skip = this.add.text(W / 2, H * 0.64,
      onMobile ? '(Tippen — beginnen)' : '(Beliebige Taste — beginnen)', {
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
    // After 4.2s OR any keypress / tap
    this.time.delayedCall(4200, dismiss);
    this.input.keyboard.on('keydown', dismiss);
    this.input.on('pointerdown', dismiss);
  }

  update(time, delta) {
    if (!this.player || !this.player.active) return;

    // Movement — keyboard always, joystick on mobile
    const k = this.keys;
    let vx = 0, vy = 0;
    if (k.W.isDown || k.UP.isDown)    vy = -1;
    if (k.S.isDown || k.DOWN.isDown)  vy = 1;
    if (k.A.isDown || k.LEFT.isDown)  vx = -1;
    if (k.D.isDown || k.RIGHT.isDown) vx = 1;
    if (this._joystick) {
      const jv = this._joystick.getVector();
      if (Math.abs(jv.x) > 0.05 || Math.abs(jv.y) > 0.05) {
        vx = jv.x;
        vy = jv.y;
      }
    }
    if (vx || vy) {
      const len = Math.hypot(vx, vy) || 1;
      this.player.setVelocity(vx / len * this.player.speed, vy / len * this.player.speed);
      this.skaldenlied.markAction();
      // Horizontal flip toward movement
      if (vx > 0.1 && this._playerFacing !== 1) {
        this._playerFacing = 1;
        this.player.setScale(this._playerBaseScale, Math.abs(this.player.scaleY));
      } else if (vx < -0.1 && this._playerFacing !== -1) {
        this._playerFacing = -1;
        this.player.setScale(-this._playerBaseScale, Math.abs(this.player.scaleY));
      }
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
    // VS-style ring spawn: random angle around the player at ~700px (just off-screen)
    const angle = Math.random() * Math.PI * 2;
    const dist = 700 + Math.random() * 200;
    const px = this.player ? this.player.x : CENTER_X;
    const py = this.player ? this.player.y : CENTER_Y;
    const ox = Phaser.Math.Clamp(px + Math.cos(angle) * dist, 100, ROOM_W - 100);
    const oy = Phaser.Math.Clamp(py + Math.sin(angle) * dist, 100, ROOM_H - 100);

    // Spawn variety scales with wave
    // wave 1-2: basic draugr only
    // wave 3+: skinwalker variant
    // wave 4+: fenrir wolf (fast)
    // wave 5+: warrior (tanky)
    const roll = Math.random();
    let kind = 'draugr';
    if (this._waveIndex >= 5 && roll < 0.25) kind = 'warrior';
    else if (this._waveIndex >= 4 && roll < 0.35) kind = 'fenrir';
    else if (this._waveIndex >= 3 && roll < 0.45) kind = 'skinwalker';

    const waveScale = 1 + (this._waveIndex - 1) * 0.15;

    if (kind === 'fenrir' && this.textures.exists('enemy_fenrir')) {
      const cleanKey = makeBlackTransparent(this, 'enemy_fenrir');
      const e = this.physics.add.sprite(ox, oy, cleanKey);
      e.setScale(0.08);
      e.setCircle(220, 320, 380);
      e.hp = Math.round(36 * waveScale);
      e.maxHp = e.hp;
      e.damage = Math.round(12 * waveScale);
      e.speed = 140 + Math.random() * 40;
      e.speedMult = 1;
      e.setDepth(18);
      e.lastTouchAt = 0;
      e.kind = 'fenrir';
      this.enemies.add(e);
      return;
    }

    if (kind === 'skinwalker' && this.textures.exists('enemy_skinwalker')) {
      const cleanKey = makeBlackTransparent(this, 'enemy_skinwalker');
      const e = this.physics.add.sprite(ox, oy, cleanKey);
      e.setScale(0.075);
      e.setCircle(280, 300, 380);
      e.hp = Math.round(50 * waveScale);
      e.maxHp = e.hp;
      e.damage = Math.round(14 * waveScale);
      e.speed = 110 + Math.random() * 30;
      e.speedMult = 1;
      e.setDepth(18);
      e.lastTouchAt = 0;
      e.kind = 'skinwalker';
      this.enemies.add(e);
      return;
    }

    if (kind === 'warrior') {
      const key = createDraugrWarriorTexture(this);
      const e = this.physics.add.sprite(ox, oy, key);
      e.setCircle(16, 32, 30);
      e.hp = Math.round(64 * waveScale);
      e.maxHp = e.hp;
      e.damage = Math.round(16 * waveScale);
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
    const key = this.textures.exists('draugr_king_img')
      ? makeBlackTransparent(this, 'draugr_king_img')
      : createDraugrKingTexture(this);
    // Spawn the king directly in front of the player, far enough that he walks in
    const px = this.player ? this.player.x : CENTER_X;
    const py = this.player ? this.player.y : CENTER_Y;
    const ox = px;
    const oy = py - 600;
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
    const boonMult = this._dmgBoonMult || 1;
    const critBonus = this._boonState?.critBonus || 0;
    const crit = Math.random() < (0.18 + critBonus);
    const baseDmg = dmg * boonMult;
    const finalDmg = crit ? baseDmg * 2 : baseDmg;
    if (crit) {
      const healOnCrit = this._boonState?.healOnCrit || 0;
      if (healOnCrit > 0 && this.player.hp > 0) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healOnCrit);
      }
    }
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
        // Trigger Loki boon choice after the show finishes
        this.time.delayedCall(2200, () => this._presentBoonChoice('loki'));
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

    const onMobileGO = isMobile(this);
    const hint = this.add.text(W / 2, H * 0.88,
      onMobileGO
        ? 'Tippen — Steige erneut hinab'
        : '↵ ENTER — Steige erneut hinab        ESC — Verlasse den Brunnen', {
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
    this.input.once('pointerdown', () => this.scene.restart());
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
    this._joystick?.destroy();
  }
}
