import Enemy from '../Enemy.js';

export default class Draugr extends Enemy {
  constructor(scene, x, y, stats) {
    super(scene, x, y, 'enemy_draugr', stats);
    // Draugr bewegt sich in kleinen Zick-Zack-Schritten
    this._zigzagTimer = 0;
    this._zigzagOffset = 0;
  }

  update(player) {
    this._zigzagTimer++;
    if (this._zigzagTimer % 30 === 0) {
      this._zigzagOffset = (Math.random() - 0.5) * 60;
    }
    super.update(player);
    // Leichtes Zick-Zack zur aktuellen Velocity addieren
    this.setVelocityX(this.body.velocity.x + this._zigzagOffset);
  }
}
