import Enemy from '../Enemy.js';

export default class Jotunn extends Enemy {
  constructor(scene, x, y, stats) {
    super(scene, x, y, 'enemy_jotunn', stats);
    // Jotunn ist langsam, aber macht kurzen Charge-Angriff alle 5 Sekunden
    this._chargeTimer = 0;
    this._charging = false;
  }

  update(player) {
    this._chargeTimer++;
    // Alle 300 Frames (5 Sek bei 60fps): kurzer Charge
    if (this._chargeTimer >= 300 && !this._charging) {
      this._charging = true;
      this._chargeTimer = 0;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocity(Math.cos(angle) * 280, Math.sin(angle) * 280);
      this.scene.time.delayedCall(400, () => { this._charging = false; });
      return; // Bewegung während Charge durch Velocity gesteuert
    }
    if (!this._charging) super.update(player);
  }
}
