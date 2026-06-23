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
    this._cooldowns = {};
    this._silenceMs = 3000;

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

  _resolve(verse) {
    const scene = this.scene;
    const player = scene.player;
    if (!player) return;
    const synergyMult = verse.synergy ? 1.5 : 1.0;

    if (this.onVerseFired) this.onVerseFired(verse);

    if (verse.verb.id === 'bind') {
      const heal = (verse.object.heal || 5) * synergyMult;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      return;
    }

    if (verse.verb.id === 'burst') {
      const dmg = (verse.object.damage || 12) * synergyMult;
      this._spawnBurst(player.x, player.y, dmg);
      return;
    }

    if (verse.verb.id === 'strike') {
      const dmg = (verse.object.damage || 24) * synergyMult;
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
      const dmg = (verse.object.damage || 40) * synergyMult;
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
  }
}
