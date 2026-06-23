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
    this._cooldowns = {};        // passive-trigger cooldowns
    this._activeCooldowns = [0, 0, 0]; // active-cast cooldowns per slot (ms wall time)
    this._activeCdMs = [2200, 1800, 2600]; // tuned per slot
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
  }

  /**
   * Active cast — player pressed 1/2/3. Returns true if fired, false if on cooldown.
   * Active casts skip the trigger check and resolve immediately with a bonus mult.
   */
  castActive(slotIdx) {
    if (slotIdx < 0 || slotIdx >= this.verses.length) return false;
    const now = this.scene.time.now;
    if (now < this._activeCooldowns[slotIdx]) return false;
    this._activeCooldowns[slotIdx] = now + this._activeCdMs[slotIdx];
    const verse = this.verses[slotIdx];
    this.markAction();
    this._lastCastAt = now;
    this.combo = Math.min(3.0, this.combo + 0.5);
    if (this.onComboChange) this.onComboChange(this.combo);
    if (this.onVerseFired) this.onVerseFired(verse, true);
    this._resolve(verse, /*activeBonus*/ 1.5);
    return true;
  }

  getActiveCooldownProgress(slotIdx) {
    const now = this.scene.time.now;
    const cdEnd = this._activeCooldowns[slotIdx] || 0;
    const cdLen = this._activeCdMs[slotIdx] || 1;
    const remaining = Math.max(0, cdEnd - now);
    return 1 - remaining / cdLen; // 1 = ready, 0 = just fired
  }

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
    // Wind-burst: 12 amber-gold projectiles in a flat star + brief wind ring
    const scene = this.scene;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      this._spawnProjectile(x, y, angle, damage, 0xffcc66, 420, 750);
    }
    // Outward gust ring (yellow)
    const ring = scene.add.circle(x, y, 14, 0xffcc66, 0)
      .setStrokeStyle(3, 0xFFE5B0, 0.85).setDepth(38);
    scene.tweens.add({
      targets: ring, radius: 90, alpha: 0, duration: 320, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  _spawnStrike(x, y, damage) {
    // Spear-strike: fast cyan-white lance + crack-line streaks behind it
    const scene = this.scene;
    const target = this._nearestEnemy(x, y);
    if (!target) return;
    const angle = Math.atan2(target.y - y, target.x - x);
    this._spawnProjectile(x, y, angle, damage, 0xcceeff, 850, 500);
    // Crack streak trail
    for (let i = 0; i < 5; i++) {
      const offsetAngle = angle + (Math.random() - 0.5) * 0.3;
      const dist = 30 + Math.random() * 60;
      const streak = scene.add.rectangle(
        x + Math.cos(offsetAngle) * dist,
        y + Math.sin(offsetAngle) * dist,
        14, 2, 0xddeeff, 0.85,
      ).setDepth(39).setRotation(angle);
      scene.tweens.add({
        targets: streak, alpha: 0, scaleX: 0,
        duration: 220, ease: 'Cubic.easeOut',
        onComplete: () => streak.destroy(),
      });
    }
  }

  _spawnNova(x, y, radius, damage) {
    // Void-nova: violet ring + dark shockwave + inner purple sparks
    const scene = this.scene;
    const outerRing = scene.add.circle(x, y, 14, 0x9966ff, 0)
      .setStrokeStyle(4, 0xBB88FF, 1).setDepth(40);
    scene.tweens.add({
      targets: outerRing, radius, alpha: 0,
      duration: 420, ease: 'Cubic.easeOut',
      onComplete: () => outerRing.destroy(),
    });
    const innerRing = scene.add.circle(x, y, 8, 0x4a1088, 0.55).setDepth(39);
    scene.tweens.add({
      targets: innerRing, radius: radius * 0.7, alpha: 0,
      duration: 320, ease: 'Cubic.easeIn',
      onComplete: () => innerRing.destroy(),
    });
    // Violet sparks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const spark = scene.add.circle(x, y, 2, 0xCC88FF, 1).setDepth(41);
      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(a) * radius * 0.9,
        y: y + Math.sin(a) * radius * 0.9,
        alpha: 0,
        duration: 360 + Math.random() * 120, ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
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
    // Frost-aura: thick ice-blue dome with crystal points + slow lingering haze
    const scene = this.scene;
    const dome = scene.add.circle(x, y, radius, 0x66aaff, 0.18).setDepth(38);
    const rim = scene.add.circle(x, y, radius, 0xAADDFF, 0)
      .setStrokeStyle(2.5, 0xCCEEFF, 0.9).setDepth(40);
    scene.tweens.add({ targets: dome, alpha: 0, duration: 1200,
      onComplete: () => dome.destroy() });
    scene.tweens.add({ targets: rim, scale: 1.05, alpha: 0, duration: 700,
      ease: 'Cubic.easeOut', onComplete: () => rim.destroy() });
    // Ice crystal spikes around the rim
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const cx = x + Math.cos(a) * radius * 0.9;
      const cy = y + Math.sin(a) * radius * 0.9;
      const crystal = scene.add.triangle(cx, cy, 0, 0, 6, -14, 12, 0, 0xDDEEFF, 0.85)
        .setRotation(a + Math.PI / 2).setDepth(41);
      scene.tweens.add({
        targets: crystal, alpha: 0, scale: 0.5,
        duration: 700, delay: 50 + i * 18,
        onComplete: () => crystal.destroy(),
      });
    }
    if (scene.enemies) {
      scene.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - x, dy = e.y - y;
        if (dx * dx + dy * dy <= radius * radius) {
          e.speedMult = slow;
          e.setTint(0x88BBFF);
          scene.time.delayedCall(dur, () => {
            if (e && e.active) { e.speedMult = 1; e.clearTint(); }
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
  }
}
