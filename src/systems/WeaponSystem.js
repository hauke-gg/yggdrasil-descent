import { getScaledWeapon, PASSIVES } from '../data/weapons.js';
import { checkEvolution } from '../data/evolutions.js';

export default class WeaponSystem {
  constructor(scene, player, enemyGroup) {
    this.scene = scene;
    this.player = player;
    this.enemyGroup = enemyGroup;
    this._cooldowns = {};     // weaponId → letzter Schuss-Timestamp
    this._projectiles = scene.physics.add.group();
  }

  // Wird von DungeonScene.update() aufgerufen
  update(time) {
    for (const weaponSlot of this.player.weapons) {
      const weaponId = weaponSlot.id;

      // Evolution prüfen und Slot ersetzen
      const evo = checkEvolution(weaponId, weaponSlot.level, this.player.passives);
      if (evo && weaponId !== evo.id) {
        weaponSlot.id = evo.id;
        this.scene.events.emit('weaponEvolved', evo);
        continue;
      }

      const stats = this._getEffectiveStats(weaponId, weaponSlot.level);
      if (!stats) continue;

      const lastShot = this._cooldowns[weaponId] || 0;
      if (time - lastShot < stats.cooldown) continue;

      const target = this._getNearestEnemy();
      if (!target && stats.type !== 'melee_aoe') continue;

      this._fire(weaponId, stats, target, time);
      this._cooldowns[weaponId] = time;
    }

    // Projektile die den Screen verlassen deaktivieren
    this._projectiles.getChildren().forEach(p => {
      if (p.active && (p.x < -50 || p.x > 1010 || p.y < -50 || p.y > 590)) {
        p.destroy();
      }
    });
  }

  _getEffectiveStats(weaponId, level) {
    const stats = getScaledWeapon(weaponId, level);
    if (!stats) return null;

    let cooldown = stats.cooldown;
    let range = stats.range;

    // Passiv-Effekte anwenden
    for (const passiveId of this.player.passives) {
      const passive = PASSIVES[passiveId];
      if (!passive) continue;
      if (passive.effect.cooldownMultiplier) cooldown = Math.round(cooldown * passive.effect.cooldownMultiplier);
      if (passive.effect.rangeMultiplier) range = Math.round(range * passive.effect.rangeMultiplier);
    }

    return { ...stats, cooldown, range };
  }

  _getNearestEnemy() {
    let nearest = null;
    let minDist = Infinity;
    this.enemyGroup.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });
    return nearest;
  }

  _fire(weaponId, stats, target, time) {
    const p = this.player;

    if (stats.type === 'melee_aoe' || stats.type === 'melee_aoe_split') {
      // Kreisangriff: alle Feinde in Range treffen
      this.enemyGroup.getChildren().forEach(e => {
        if (!e.active) return;
        const d = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
        if (d <= stats.range) {
          const dead = e.takeDamage(stats.damage);
          if (dead) this._onEnemyDie(e);
        }
      });
      // Visueller AoE-Ring
      this._showAoeRing(p.x, p.y, stats.range, stats.color);

    } else if (stats.type === 'projectile' || stats.type === 'projectile_chain') {
      if (!target) return;
      const proj = this.scene.physics.add.image(p.x, p.y, 'projectile');
      proj.setTint(stats.color);
      proj.setDepth(8);
      proj.weaponStats = stats;
      proj.chainCount = stats.chainCount || 0;
      proj.hitEnemies = new Set();

      const angle = Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y);
      proj.setVelocity(Math.cos(angle) * stats.speed, Math.sin(angle) * stats.speed);

      // Kollision mit Feinden
      this.scene.physics.add.overlap(proj, this.enemyGroup, (projectile, enemy) => {
        if (projectile.hitEnemies.has(enemy)) return;
        projectile.hitEnemies.add(enemy);
        const dead = enemy.takeDamage(projectile.weaponStats.damage);
        if (dead) this._onEnemyDie(enemy);

        if (projectile.chainCount > 0) {
          projectile.chainCount--;
          // Auf nächsten Feind springen
          const next = this._getNearestEnemyExcept(enemy, projectile.hitEnemies);
          if (next) {
            const a = Phaser.Math.Angle.Between(projectile.x, projectile.y, next.x, next.y);
            projectile.setVelocity(Math.cos(a) * projectile.weaponStats.speed, Math.sin(a) * projectile.weaponStats.speed);
          } else {
            projectile.destroy();
          }
        } else {
          projectile.destroy();
        }
      });

      this._projectiles.add(proj);
    }
  }

  _getNearestEnemyExcept(excludeEnemy, excludeSet) {
    let nearest = null;
    let minDist = Infinity;
    this.enemyGroup.getChildren().forEach(e => {
      if (!e.active || e === excludeEnemy || excludeSet.has(e)) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });
    return nearest;
  }

  _showAoeRing(x, y, radius, color) {
    const gfx = this.scene.add.graphics().setDepth(9);
    gfx.lineStyle(3, color, 0.8);
    gfx.strokeCircle(x, y, radius);
    this.scene.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 300,
      onComplete: () => gfx.destroy()
    });
  }

  _onEnemyDie(enemy) {
    this.player.kills++;
    const leveledUp = this.player.gainXp(enemy.xpReward);
    this.scene.events.emit('enemyDied', { x: enemy.x, y: enemy.y, xpReward: enemy.xpReward });
    if (leveledUp) this.scene.events.emit('levelUp');
    enemy.destroy();
  }
}
