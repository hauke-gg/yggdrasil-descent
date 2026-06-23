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
import { audio } from '../audio/AudioBus.js';

const ROOM_W = 1600;
const ROOM_H = 900;

export default class SkaldenliedScene extends Phaser.Scene {
  constructor() { super('SkaldenliedScene'); }

  create() {
    audio.unlock();
    audio.startCombatPulse();

    this.physics.world.setBounds(0, 0, ROOM_W, ROOM_H);
    this.cameras.main.setBounds(0, 0, ROOM_W, ROOM_H);

    this._drawRoom();
    this._createPlayer();
    this._createUI();

    this.enemies = this.physics.add.group();
    this.skaldenlied = new Skaldenlied(this, { verses: DEFAULT_VERSES });
    this.skaldenlied.onVerseFired = (verse) => this._flashVerse(verse);

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

    // Killcounter for slow-mo trigger
    this._killsThisWave = 0;
    this._waveSize = 6;

    // Projectile-enemy overlap
    this.physics.world.on('worldstep', () => this._updateProjectiles());
  }

  _drawRoom() {
    // Floor — Midgard palette, late-summer-before-storm
    const g = this.add.graphics();
    g.fillStyle(0x2E2418, 1).fillRect(0, 0, ROOM_W, ROOM_H);

    // Yggdrasil-root cracks across the floor
    g.lineStyle(2, 0x3D4A2B, 0.6);
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * ROOM_W;
      const y = Math.random() * ROOM_H;
      g.beginPath();
      g.moveTo(x, y);
      let cx = x, cy = y;
      for (let s = 0; s < 8; s++) {
        cx += (Math.random() - 0.5) * 60;
        cy += (Math.random() - 0.5) * 60;
        g.lineTo(cx, cy);
      }
      g.strokePath();
    }

    // Inner glow rim
    g.lineStyle(3, 0xC9A961, 0.18);
    g.strokeCircle(ROOM_W / 2, ROOM_H / 2, 300);

    // Outer wall — Helheim mauve creeping in
    g.fillStyle(0x1A1820, 1);
    g.fillRect(0, 0, ROOM_W, 40);
    g.fillRect(0, ROOM_H - 40, ROOM_W, 40);
    g.fillRect(0, 0, 40, ROOM_H);
    g.fillRect(ROOM_W - 40, 0, 40, ROOM_H);

    // Three Yggdrasil-root nodes (spawn-corner markers)
    [
      { x: 120, y: 120 },
      { x: ROOM_W - 120, y: 120 },
      { x: ROOM_W / 2, y: ROOM_H - 120 },
    ].forEach((n) => {
      g.fillStyle(0x6B4F5C, 0.6).fillCircle(n.x, n.y, 28);
      g.lineStyle(2, 0xC9A961, 0.5).strokeCircle(n.x, n.y, 32);
    });
    this._spawnCorners = [
      { x: 120, y: 120 },
      { x: ROOM_W - 120, y: 120 },
      { x: ROOM_W / 2, y: ROOM_H - 120 },
    ];
  }

  _createPlayer() {
    const cx = ROOM_W / 2, cy = ROOM_H / 2;
    // Procedural Skalde-Sprite: blue cloak with gold hood-edge
    const g = this.add.graphics();
    // body cloak
    g.fillStyle(0x2B2D3A, 1).fillEllipse(0, 8, 28, 38);
    // gold hood rim
    g.lineStyle(2, 0xC9A961, 1).strokeEllipse(0, 8, 28, 38);
    // hood
    g.fillStyle(0x1F2933, 1).fillCircle(0, -8, 14);
    g.lineStyle(2, 0xC9A961, 1).strokeCircle(0, -8, 14);
    // bone-staff
    g.lineStyle(2.5, 0xE8DCC0, 1);
    g.lineBetween(14, 16, 22, -20);
    g.fillStyle(0xC9A961, 1).fillCircle(22, -22, 4);

    g.generateTexture('__skald_tex', 48, 48);
    g.destroy();

    this.player = this.physics.add.sprite(cx, cy, '__skald_tex');
    this.player.setCircle(16, 8, 8);
    this.player.setCollideWorldBounds(true);
    this.player.maxHp = 100;
    this.player.hp = 100;
    this.player.speed = 220;
    this.player.setDepth(20);

    // Soft glow under the skald
    this.playerGlow = this.add.circle(cx, cy, 32, 0xC9A961, 0.15).setDepth(15);
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

    // Verse panel — bottom strip
    const panelH = 110;
    const panelY = H - panelH;
    const panel = this.add.graphics().setDepth(80).setScrollFactor(0);
    panel.fillStyle(0x000000, 0.78).fillRect(0, panelY, W, panelH);
    panel.lineStyle(1, 0xC9A961, 0.45).lineBetween(0, panelY, W, panelY);

    this.add.text(W / 2, panelY + 12, 'DEIN LIED', {
      fontFamily: "'Cinzel', serif", fontSize: '11px',
      color: CSS_COLORS.goldLight, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(82).setScrollFactor(0);

    this._verseTexts = [];
    const verseGap = W / 3;
    DEFAULT_VERSES.forEach((v, i) => {
      const cx = verseGap * i + verseGap / 2;
      const stab = v.trigger.stab;
      const stabColor = v.synergy ? CSS_COLORS.goldLight : CSS_COLORS.purpleLight;

      const t = this.add.text(cx, panelY + 36, `${i + 1}.  ${v.text}`, {
        fontFamily: "'Lora', serif", fontSize: '12px',
        color: '#e0d8c0', align: 'center', wordWrap: { width: verseGap - 24 },
      }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

      const sub = this.add.text(cx, panelY + 82, `${v.trigger.desc}`, {
        fontFamily: "'Space Mono', monospace", fontSize: '9px',
        color: '#7a7080', align: 'center', wordWrap: { width: verseGap - 24 },
      }).setOrigin(0.5, 0).setDepth(82).setScrollFactor(0);

      this._verseTexts.push({ text: t, sub, container: null });
    });

    // ESC hint
    this.add.text(W - 12, H - 8, 'ESC = Menü', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#5a4a6a',
    }).setOrigin(1, 1).setDepth(83).setScrollFactor(0);
  }

  _flashVerse(verse) {
    const idx = DEFAULT_VERSES.indexOf(verse);
    if (idx < 0 || !this._verseTexts[idx]) return;
    const t = this._verseTexts[idx].text;
    t.setColor(verse.synergy ? '#FFD66B' : '#cc88ff');
    this.tweens.add({
      targets: t,
      scale: { from: 1.0, to: 1.15 },
      duration: 120,
      yoyo: true,
      onComplete: () => t.setColor('#e0d8c0'),
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
    const corner = Phaser.Math.RND.pick(this._spawnCorners);
    const offset = 40;
    const ox = corner.x + (Math.random() - 0.5) * offset;
    const oy = corner.y + (Math.random() - 0.5) * offset;

    const key = '__draugr_tex';
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0x5C5470, 1).fillEllipse(16, 18, 22, 30);
      g.lineStyle(1.5, 0x2B2D3A, 1).strokeEllipse(16, 18, 22, 30);
      g.fillStyle(0xC9C4D1, 1).fillCircle(16, 10, 8);
      g.lineStyle(1, 0x2B2D3A, 1).strokeCircle(16, 10, 8);
      g.fillStyle(0xff4422, 0.9).fillCircle(14, 8, 1.5);
      g.fillStyle(0xff4422, 0.9).fillCircle(18, 8, 1.5);
      g.generateTexture(key, 32, 36);
      g.destroy();
    }

    const e = this.physics.add.sprite(ox, oy, key);
    e.setCircle(11, 5, 7);
    e.hp = 28;
    e.maxHp = 28;
    e.damage = 8;
    e.speed = 80 + Math.random() * 30;
    e.speedMult = 1;
    e.setDepth(18);
    e.lastTouchAt = 0;
    this.enemies.add(e);
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
      this._killsThisWave++;
      this._totalKills = (this._totalKills || 0) + 1;
      this._killText.setText(`${this._totalKills} Gefallen`);
      this.skaldenlied.onEnemyKilled(e);
      audio.pickup();
      // Slow-mo on last-of-wave
      if (this._killsThisWave >= this._waveSize) {
        this._killsThisWave = 0;
        this._waveSize += 2;
        slowMo(this);
        audio.bossDeath();
        shakeHeavy(this);
        hitPause(this, FEEL.HIT_PAUSE_CRIT);
      }
      e.destroy();
    } else {
      hitPause(this, 30);
    }
  }

  _gameOver() {
    audio.stopCombatPulse();
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85)
      .setDepth(200).setScrollFactor(0);
    this.add.text(W / 2, H / 2 - 30, 'Du bist gefallen.', {
      fontFamily: "'Cinzel', serif", fontSize: '32px',
      color: CSS_COLORS.goldLight, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    this.add.text(W / 2, H / 2 + 10, `${this._totalKills || 0} Draugr fielen mit dir.`, {
      fontFamily: "'Lora', serif", fontSize: '14px',
      color: '#a89888',
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    this.add.text(W / 2, H / 2 + 60, 'ENTER für einen neuen Vers · ESC für Menü', {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: CSS_COLORS.purpleLight,
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart());
  }

  _returnToMenu() {
    audio.stopCombatPulse();
    this.scene.start('MenuScene');
  }

  shutdown() { audio.stopCombatPulse(); this.skaldenlied?.destroy(); }
}
