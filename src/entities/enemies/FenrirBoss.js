import Enemy from '../Enemy.js';

export default class FenrirBoss extends Enemy {
  constructor(scene, x, y) {
    const stats = { hp: 800, speed: 70, damage: 25, xpReward: 200, scale: 2.0 };
    super(scene, x, y, 'boss_fenrir', stats);

    this._phase = 1;       // Phase 1: normal; Phase 2: bei <50% HP, schneller
    this._chargeTimer = 0;
    this._charging = false;
    this.onWolfSpawn = null; // Callback: () => void — DungeonScene spawnt Wölfe
  }

  update(player) {
    // Phase 2 ab 50% HP
    if (this.hp < this.maxHp * 0.5 && this._phase === 1) {
      this._phase = 2;
      this.speed = 110;
      this.setTint(0xff6600);
    }

    this._chargeTimer++;
    const chargeInterval = this._phase === 1 ? 240 : 150;

    if (this._chargeTimer >= chargeInterval && !this._charging) {
      this._charging = true;
      this._chargeTimer = 0;

      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);

      // In Phase 2: Wölfe spawnen beim Charge
      if (this._phase === 2 && this.onWolfSpawn) this.onWolfSpawn();

      this.scene.time.delayedCall(500, () => { this._charging = false; });
      return;
    }

    if (!this._charging) super.update(player);
  }
}
