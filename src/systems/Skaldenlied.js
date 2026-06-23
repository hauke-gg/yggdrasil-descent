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
    const scene = this.scene;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this._spawnProjectile(x, y, angle, damage, 0xffcc66, 380, 700);
    }
  }

  _spawnStrike(x, y, damage) {
    const scene = this.scene;
    const target = this._nearestEnemy(x, y);
    if (!target) return;
    const angle = Math.atan2(target.y - y, target.x - x);
    this._spawnProjectile(x, y, angle, damage, 0xcceeff, 700, 500);
  }

  _spawnNova(x, y, radius, damage) {
    const scene = this.scene;
    const ring = scene.add.circle(x, y, 10, 0x9966ff, 0.4).setDepth(40);
    scene.tweens.add({
      targets: ring,
      radius: radius,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
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
    const scene = this.scene;
    const ring = scene.add.circle(x, y, radius, 0x66aaff, 0.25).setDepth(40);
    scene.tweens.add({ targets: ring, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
    if (scene.enemies) {
      scene.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - x, dy = e.y - y;
        if (dx * dx + dy * dy <= radius * radius) {
          e.speedMult = slow;
          scene.time.delayedCall(dur, () => { if (e && e.active) e.speedMult = 1; });
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
