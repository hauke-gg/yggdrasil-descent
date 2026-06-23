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
    this.skaldenlied.onVerseFired = (verse) => {
      this._flashVerse(verse);
      const color = verse.synergy ? 0xFFD66B : 0xcc88ff;
      playVerseTriggerFx(this, this.player.x, this.player.y, color);
    };

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Input
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC');
    this.input.keyboard.on('keydown-ESC', () => this._returnToMenu());

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
    this.add.text(W / 2, 22, 'WURZELKAMMER', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: CSS_COLORS.goldLight, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82).setScrollFactor(0);

    // Verse panel — bottom strip with Norse ornament
    const panelH = 120;
    const panelY = H - panelH;
    const panel = this.add.graphics().setDepth(80).setScrollFactor(0);
    // Layered panel background — darker at bottom
    panel.fillStyle(0x000000, 0.85).fillRect(0, panelY, W, panelH);
    panel.fillStyle(0x0A0612, 0.6).fillRect(0, panelY + panelH * 0.5, W, panelH * 0.5);
    // Top border ornament
    drawNorseOrnament(panel, 0, panelY, W, panelH);

    this.add.text(W / 2, panelY + 16, '— DEIN LIED —', {
      fontFamily: "'Cinzel', serif", fontSize: '12px',
      color: CSS_COLORS.goldLight, fontStyle: 'bold', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(82).setScrollFactor(0);

    this._verseTexts = [];
    const verseGap = W / 3;
    DEFAULT_VERSES.forEach((v, i) => {
      const cx = verseGap * i + verseGap / 2;
      const stab = v.trigger.stab;
      const stabColor = v.synergy ? CSS_COLORS.goldLight : CSS_COLORS.purpleLight;

      // Vertical divider between verses
      if (i > 0) {
        const divX = verseGap * i;
        const div = this.add.graphics().setDepth(81).setScrollFactor(0);
        div.lineStyle(1, 0xC9A961, 0.25);
        div.lineBetween(divX, panelY + 32, divX, panelY + panelH - 12);
      }

      // Stab-letter badge — large alliteration letter
      const badge = this.add.text(cx - 90, panelY + 50, stab, {
        fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '32px',
        color: stabColor, fontStyle: 'bold',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(82).setScrollFactor(0).setAlpha(0.55);

      const t = this.add.text(cx + 10, panelY + 42, v.text, {
        fontFamily: "'Lora', serif", fontSize: '13px',
        color: '#e8dcc0', align: 'left', wordWrap: { width: verseGap - 100 },
        lineSpacing: 2,
      }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

      const sub = this.add.text(cx + 10, panelY + 90, v.trigger.desc, {
        fontFamily: "'Space Mono', monospace", fontSize: '9px',
        color: '#7a7080', align: 'left', wordWrap: { width: verseGap - 100 },
      }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

      this._verseTexts.push({ text: t, sub, badge });
    });

    // ESC hint
    this.add.text(W - 12, H - 8, 'ESC = Menü', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#5a4a6a',
    }).setOrigin(1, 1).setDepth(83).setScrollFactor(0);
  }

  _flashVerse(verse) {
    const idx = DEFAULT_VERSES.indexOf(verse);
    if (idx < 0 || !this._verseTexts[idx]) return;
    const entry = this._verseTexts[idx];
    const t = entry.text;
    const badge = entry.badge;
    const color = verse.synergy ? '#FFD66B' : '#cc88ff';
    t.setColor(color);
    if (badge) {
      badge.setAlpha(1);
      this.tweens.add({
        targets: badge,
        scale: { from: 1.0, to: 1.3 },
        duration: 180,
        yoyo: true,
        onComplete: () => { badge.setScale(1); badge.setAlpha(0.55); },
      });
    }
    this.tweens.add({
      targets: t,
      scale: { from: 1.0, to: 1.12 },
      duration: 140,
      yoyo: true,
      onComplete: () => t.setColor('#e8dcc0'),
    });
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
    e.hp -= dmg;
    const crit = Math.random() < 0.15;
    const finalDmg = crit ? dmg * 2 : dmg;
    audio.hitLight();
    damagePopup(this, e.x, e.y - 18, Math.floor(finalDmg), crit);
    squashStretch(this, e);
    if (crit) critPunch(this);
    hitBurst(this, e.x, e.y, (e.x - (srcX || e.x)), (e.y - (srcY || e.y)), 0xff8844);
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
