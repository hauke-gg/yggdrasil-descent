/**
 * Skaldenlied — the central mechanic.
 *
 * Holds the 3 active verses. Listens to game-state events (hit, take-damage,
 * kill, rhythm tick, silence). When a verse's trigger fires, the verb resolves
 * the object's effect on a target list.
 *
 * Spec: docs/vision-skaldenlied.md, Pfeiler 1.
 */

import { DEFAULT_VERSES } from '../data/verses.js';

export default class Skaldenlied {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.verses = (opts.verses || DEFAULT_VERSES).slice(0, 3);
    this.rhythmBpm = 105;
    this.lastAction = scene.time.now;
    this.silenceTriggered = false;
    this._cooldowns = {};        // passive-trigger cooldowns (kept for back-compat)
    // Auto-cast Vampire-Survivors style: every verse fires on its own cadence
    this._autoCooldowns = [0, 0, 0];
    this._autoCdMs = [1800, 1400, 2000];
    this._silenceMs = 3000;

    // Combo
    this.combo = 0;              // 0..3.0 multiplier
    this._lastCastAt = 0;
    this._comboDecayDelay = 2000;

    // Swirl
    this._swirlCdUntil = 0;
    this._swirlCdMs = 4000;

    this._rhythmEvent = scene.time.addEvent({
      delay: 60000 / this.rhythmBpm,
      loop: true,
      callback: () => this._fire('onRhythm'),
    });

    this._silenceCheck = scene.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (scene.time.now - this.lastAction > this._silenceMs && !this.silenceTriggered) {
          this.silenceTriggered = true;
          this._fire('onSilence');
        }
      },
    });

    // Combo decay tick
    this._comboTick = scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.combo > 0 && scene.time.now - this._lastCastAt > this._comboDecayDelay) {
          this.combo = Math.max(0, this.combo - 0.06);
          if (this.onComboChange) this.onComboChange(this.combo);
        }
      },
    });

    // Auto-cast tick — Vampire-Survivors style: each verse fires when its cooldown is ready
    this._autoTick = scene.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => this._autoCastTick(),
    });
  }

  _autoCastTick() {
    if (!this.scene || !this.scene.player || this.scene.player.hp <= 0) return;
    const now = this.scene.time.now;
    for (let i = 0; i < this.verses.length; i++) {
      if (now >= this._autoCooldowns[i]) {
        this._autoCooldowns[i] = now + this._autoCdMs[i];
        const verse = this.verses[i];
        this.markAction();
        this._lastCastAt = now;
        if (this.onVerseFired) this.onVerseFired(verse, false);
        this._resolve(verse, 1.0);
      }
    }
  }

  getActiveCooldownProgress(slotIdx) {
    const now = this.scene.time.now;
    const cdEnd = this._autoCooldowns[slotIdx] || 0;
    const cdLen = this._autoCdMs[slotIdx] || 1;
    const remaining = Math.max(0, cdEnd - now);
    return 1 - remaining / cdLen;
  }

  /** Legacy active-cast hook — auto-cast is the default now; this stays as a no-op. */
  castActive() { return false; }

  registerHit() {
    if (this.scene.time.now - this._lastCastAt < this._comboDecayDelay) {
      this.combo = Math.min(3.0, this.combo + 0.04);
      if (this.onComboChange) this.onComboChange(this.combo);
    }
  }

  comboMultiplier() {
    return 1 + this.combo;
  }

  canSwirl() {
    return this.scene.time.now >= this._swirlCdUntil;
  }

  triggerSwirl() {
    if (!this.canSwirl()) return false;
    this._swirlCdUntil = this.scene.time.now + this._swirlCdMs;
    this.markAction();
    this._lastCastAt = this.scene.time.now;
    this.combo = Math.min(3.0, this.combo + 0.3);
    if (this.onComboChange) this.onComboChange(this.combo);
    return true;
  }

  swirlCooldownProgress() {
    const now = this.scene.time.now;
    const remaining = Math.max(0, this._swirlCdUntil - now);
    return 1 - remaining / this._swirlCdMs;
  }

  markAction() {
    this.lastAction = this.scene.time.now;
    this.silenceTriggered = false;
  }

  onPlayerHit(targetEnemy) {
    this.markAction();
    if (this.scene.player && this.scene.player.hp / this.scene.player.maxHp < 0.4) {
      this._fire('onHit');
    }
  }

  onPlayerTookDamage() {
    this.markAction();
    this._fire('onTakeDamage');
  }

  onEnemyKilled(enemy) {
    this.markAction();
    this._fire('onKill');
  }

  _fire(triggerId) {
    for (const verse of this.verses) {
      if (!verse || verse.trigger.id !== triggerId) continue;
      const cdKey = `${verse.trigger.id}_${verse.verb.id}_${verse.object.id}`;
      const now = this.scene.time.now;
      const cd = this._cooldowns[cdKey] || 0;
      if (now < cd) continue;
      this._cooldowns[cdKey] = now + this._cooldownFor(verse);
      this._resolve(verse);
    }
  }

  _cooldownFor(verse) {
    if (verse.trigger.id === 'onRhythm')      return 800;
    if (verse.trigger.id === 'onTakeDamage')  return 400;
    if (verse.trigger.id === 'onKill')        return 250;
    if (verse.trigger.id === 'onHit')         return 1500;
    if (verse.trigger.id === 'onSilence')     return 3000;
    return 500;
  }

  _resolve(verse, extraMult = 1.0) {
    const scene = this.scene;
    const player = scene.player;
    if (!player) return;
    const synergyMult = verse.synergy ? 1.5 : 1.0;
    const comboMult = this.comboMultiplier();
    const mult = synergyMult * comboMult * extraMult;

    if (verse.verb.id === 'bind') {
      const heal = (verse.object.heal || 5) * mult;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      return;
    }

    if (verse.verb.id === 'burst') {
      const dmg = (verse.object.damage || 12) * mult;
      this._spawnBurst(player.x, player.y, dmg);
      return;
    }

    if (verse.verb.id === 'strike') {
      const dmg = (verse.object.damage || 24) * mult;
      this._spawnStrike(player.x, player.y, dmg);
      return;
    }

    if (verse.verb.id === 'freeze') {
      const slow = verse.object.slow || 0.4;
      const dur = verse.object.slowDur || 2000;
      this._applyFreeze(player.x, player.y, 200, slow, dur);
      return;
    }

    if (verse.verb.id === 'nova') {
      const dmg = (verse.object.damage || 40) * mult;
      const radius = verse.object.radius || 140;
      this._spawnNova(player.x, player.y, radius, dmg);
      return;
    }
  }

  _spawnBurst(x, y, damage) {
    // Wind-Sicheln: crescent-shaped blades fan out, rotating as they fly
    const scene = this.scene;
    const bladeCount = 10;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const blade = scene.add.graphics().setDepth(42).setScrollFactor(1);
      blade.fillStyle(0xFFD66B, 0.9);
      // Crescent shape via two arcs
      blade.beginPath();
      blade.arc(0, 0, 18, -1.0, 1.0, false);
      blade.arc(0, -4, 16, 1.0, -1.0, true);
      blade.closePath();
      blade.fillPath();
      blade.lineStyle(1.2, 0xFFB45A, 1);
      blade.strokePath();
      blade.x = x; blade.y = y;
      blade.rotation = angle - Math.PI / 2;
      scene.tweens.add({
        targets: blade,
        x: x + dx * 240,
        y: y + dy * 240,
        rotation: blade.rotation + Math.PI * 3,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => blade.destroy(),
      });
      // Still spawn an invisible damage projectile that follows the same angle
      this._spawnProjectile(x, y, angle, damage, 0xffcc66, 500, 600);
    }
    // Central whirl pulse
    const whirl = scene.add.circle(x, y, 10, 0xFFE5B0, 0.65).setDepth(40);
    scene.tweens.add({
      targets: whirl, radius: 70, alpha: 0,
      duration: 380, ease: 'Cubic.easeOut',
      onComplete: () => whirl.destroy(),
    });
  }

  _spawnStrike(x, y, damage) {
    // Speerwurf: a long spear sprite flies in the skald's facing direction —
    // NO auto-aim. The player decides where to aim by facing.
    const scene = this.scene;
    // Direction from facing (default right), with velocity bias if moving
    const facing = scene._playerFacing || 1;
    let angle = facing > 0 ? 0 : Math.PI;
    if (scene.player && scene.player.body) {
      const vx = scene.player.body.velocity.x;
      const vy = scene.player.body.velocity.y;
      if (Math.abs(vx) > 5 || Math.abs(vy) > 5) {
        angle = Math.atan2(vy, vx);
      }
    }
    const distance = 500;

    // Spear: long thin gradient shape
    const spear = scene.add.graphics().setDepth(45);
    spear.fillStyle(0xCCEEFF, 1);
    // Shaft
    spear.fillRect(-26, -1.5, 52, 3);
    // Tip
    spear.fillTriangle(26, -4, 26, 4, 38, 0);
    // Tail wraps
    spear.fillStyle(0x88AABB, 1);
    spear.fillRect(-26, -2.5, 6, 5);
    spear.fillRect(-18, -2.5, 4, 5);
    spear.x = x; spear.y = y;
    spear.rotation = angle;
    spear.damage = damage;
    spear.maxTravel = Math.min(distance + 60, 500);
    spear.traveled = 0;
    spear.alive = true;

    // Motion-blur ghosts
    const spawnGhost = () => {
      if (!spear.alive) return;
      const g = scene.add.graphics().setDepth(43);
      g.fillStyle(0xCCEEFF, 0.35);
      g.fillRect(-22, -1, 44, 2);
      g.x = spear.x; g.y = spear.y; g.rotation = spear.rotation;
      scene.tweens.add({
        targets: g, alpha: 0, scale: 0.6,
        duration: 280, onComplete: () => g.destroy(),
      });
      scene.time.delayedCall(40, spawnGhost);
    };
    spawnGhost();

    // Drive the spear forward and damage on contact
    const dx = Math.cos(angle), dy = Math.sin(angle);
    scene.tweens.add({
      targets: spear,
      x: x + dx * spear.maxTravel,
      y: y + dy * spear.maxTravel,
      duration: 360,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        if (!spear.alive || !scene.enemies) return;
        scene.enemies.children.iterate((e) => {
          if (!e || !e.active || !spear.alive) return;
          const ex = e.x - spear.x, ey = e.y - spear.y;
          if (ex * ex + ey * ey < 32 * 32) {
            spear.alive = false;
            scene.damageEnemy?.(e, damage, spear.x, spear.y);
            // Impact burst
            const burst = scene.add.circle(spear.x, spear.y, 8, 0xFFFFFF, 0.9).setDepth(46);
            scene.tweens.add({
              targets: burst, radius: 36, alpha: 0,
              duration: 220, onComplete: () => burst.destroy(),
            });
            spear.destroy();
          }
        });
      },
      onComplete: () => { if (spear.active) spear.destroy(); spear.alive = false; },
    });
  }

  _spawnNova(x, y, radius, damage) {
    // Stern-Schock: 6-pointed expanding star with runic glyphs + shockwave
    const scene = this.scene;

    // Dark shockwave (inner solid)
    const shock = scene.add.circle(x, y, 8, 0x1A0F2A, 0.85).setDepth(38);
    scene.tweens.add({
      targets: shock, radius: radius * 0.5, alpha: 0,
      duration: 260, ease: 'Cubic.easeOut',
      onComplete: () => shock.destroy(),
    });

    // 6-pointed star ring
    const star = scene.add.graphics().setDepth(42);
    const drawStar = (innerR, outerR, alpha) => {
      star.clear();
      star.lineStyle(3, 0xFFD66B, alpha);
      star.fillStyle(0xBB88FF, alpha * 0.6);
      star.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) star.moveTo(px, py); else star.lineTo(px, py);
      }
      star.closePath();
      star.fillPath();
      star.strokePath();
    };
    const starState = { r: 10, a: 1 };
    drawStar(starState.r * 0.5, starState.r, starState.a);
    scene.tweens.add({
      targets: starState,
      r: radius * 0.95,
      a: 0,
      duration: 540,
      ease: 'Cubic.easeOut',
      onUpdate: () => drawStar(starState.r * 0.5, starState.r, starState.a),
      onComplete: () => star.destroy(),
    });

    // Rotating Norse glyphs in the burst
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const glyph = scene.add.text(x, y,
        ['ᚦ', 'ᛟ', 'ᛉ', 'ᚹ', 'ᛒ', 'ᛇ'][i],
        { fontFamily: "'Cinzel', serif", fontSize: '28px', color: '#FFD66B',
          stroke: '#000', strokeThickness: 3 },
      ).setOrigin(0.5).setDepth(43);
      scene.tweens.add({
        targets: glyph,
        x: x + Math.cos(a) * radius * 0.75,
        y: y + Math.sin(a) * radius * 0.75,
        alpha: 0,
        rotation: Math.PI * 2,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => glyph.destroy(),
      });
    }

    if (scene.enemies) {
      scene.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - x, dy = e.y - y;
        if (dx * dx + dy * dy <= radius * radius) {
          scene.damageEnemy?.(e, damage);
        }
      });
    }
  }

  _applyFreeze(x, y, radius, slow, dur) {
    // Frost-Sturm: ground-frost ring + 14 upward-growing ice crystals + hex frost pattern
    const scene = this.scene;

    // Ground frost — flat hexagonal pattern that fades over time
    const groundFrost = scene.add.graphics().setDepth(-1.2);
    groundFrost.lineStyle(2, 0xCCEEFF, 0.6);
    const hex = (cx, cy, r) => {
      groundFrost.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) groundFrost.moveTo(px, py); else groundFrost.lineTo(px, py);
      }
      groundFrost.closePath();
      groundFrost.strokePath();
    };
    hex(x, y, radius * 0.95);
    hex(x, y, radius * 0.7);
    hex(x, y, radius * 0.45);
    // Spokes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      groundFrost.beginPath();
      groundFrost.moveTo(x, y);
      groundFrost.lineTo(x + Math.cos(a) * radius * 0.95, y + Math.sin(a) * radius * 0.95);
      groundFrost.strokePath();
    }
    scene.tweens.add({
      targets: groundFrost, alpha: 0, duration: dur,
      onComplete: () => groundFrost.destroy(),
    });

    // Upward-growing ice crystals at random points inside the radius
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.9;
      const cx = x + Math.cos(a) * r;
      const cy = y + Math.sin(a) * r;
      const h = 14 + Math.random() * 16;
      const w = 6 + Math.random() * 4;
      const crystal = scene.add.graphics().setDepth(41);
      crystal.fillStyle(0xCCEEFF, 0.9);
      crystal.fillTriangle(0, 0, w, -h, w * 2, 0);
      crystal.lineStyle(1, 0x88BBFF, 1);
      crystal.strokeTriangle(0, 0, w, -h, w * 2, 0);
      crystal.x = cx - w; crystal.y = cy;
      crystal.setScale(0, 0);
      scene.tweens.add({
        targets: crystal, scaleX: 1, scaleY: 1,
        duration: 280, delay: i * 18, ease: 'Back.easeOut',
      });
      scene.tweens.add({
        targets: crystal, alpha: 0, duration: 600, delay: dur - 600,
        onComplete: () => crystal.destroy(),
      });
    }

    // Sparkle motes drifting up from the ground (real frost shimmer)
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const sx = x + Math.cos(a) * r;
      const sy = y + Math.sin(a) * r;
      const mote = scene.add.circle(sx, sy, 1.5, 0xFFFFFF, 0.9).setDepth(42);
      scene.tweens.add({
        targets: mote, y: sy - 30 - Math.random() * 20, alpha: 0,
        duration: 800 + Math.random() * 400, delay: Math.random() * 300,
        ease: 'Cubic.easeOut', onComplete: () => mote.destroy(),
      });
    }

    // Apply slow + tint + ice-shard overlay on enemies in radius
    if (scene.enemies) {
      scene.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - x, dy = e.y - y;
        if (dx * dx + dy * dy <= radius * radius) {
          e.speedMult = slow;
          e.setTint(0x88BBFF);
          // Ice shards encrusting the enemy
          const shardA = scene.add.triangle(e.x, e.y - 12, 0, 0, 4, -12, 8, 0, 0xDDEEFF, 0.9).setDepth(20);
          const shardB = scene.add.triangle(e.x - 8, e.y - 4, 0, 0, 3, -8, 6, 0, 0xCCEEFF, 0.9).setDepth(20);
          const shardC = scene.add.triangle(e.x + 6, e.y - 6, 0, 0, 3, -10, 6, 0, 0xDDEEFF, 0.9).setDepth(20);
          e._frostShards = [shardA, shardB, shardC];
          // Frost glaze patch on the ground beneath them
          const glaze = scene.add.ellipse(e.x, e.y + 8, 30, 12, 0xAADDFF, 0.45).setDepth(-1.1);
          e._frostGlaze = glaze;
          scene.time.delayedCall(dur, () => {
            if (e && e.active) { e.speedMult = 1; e.clearTint(); }
            shardA?.destroy(); shardB?.destroy(); shardC?.destroy();
            glaze?.destroy();
            if (e) { e._frostShards = null; e._frostGlaze = null; }
          });
        }
      });
    }
  }

  _spawnProjectile(x, y, angle, damage, color, speed, lifetime) {
    const scene = this.scene;
    const p = scene.add.circle(x, y, 4, color).setDepth(45);
    scene.physics.add.existing(p);
    p.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    p.damage = damage;
    p.lifetime = lifetime;
    p.bornAt = scene.time.now;
    if (!scene.skaldProjectiles) {
      scene.skaldProjectiles = scene.physics.add.group();
    }
    scene.skaldProjectiles.add(p);
  }

  _nearestEnemy(x, y) {
    const scene = this.scene;
    if (!scene.enemies) return null;
    let best = null, bestD = Infinity;
    scene.enemies.children.iterate((e) => {
      if (!e || !e.active) return;
      const d = (e.x - x) ** 2 + (e.y - y) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    });
    return best;
  }

  destroy() {
    this._rhythmEvent?.remove();
    this._silenceCheck?.remove();
    this._comboTick?.remove();
    this._autoTick?.remove();
  }
}
