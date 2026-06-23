export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, stats) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);
    this.setScale(stats.scale || 1.0);

    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.xpReward = stats.xpReward;

    // HP-Bar nur anzeigen wenn getroffen (spart visuelles Rauschen)
    this._hpBar = scene.add.graphics().setDepth(6);
    this._hpVisible = false;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._hpVisible = true;
    this._drawHpBar();

    // Weißer Hit-Flash
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());

    return this.hp <= 0;
  }

  update(player) {
    if (!this.active || !player || !player.active) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const vx = Math.cos(angle) * this.speed;
    this.setVelocity(vx, Math.sin(angle) * this.speed);
    // Face direction of movement
    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);

    if (this._hpVisible) this._drawHpBar();
  }

  _drawHpBar() {
    if (!this._hpBar) return;
    this._hpBar.clear();

    const w = Math.max(24, this.displayWidth);
    const h = 3;
    const x = this.x - w / 2;
    const y = this.y - this.displayHeight / 2 - 6;

    // Dunkler Hintergrund
    this._hpBar.fillStyle(0x000000, 0.7);
    this._hpBar.fillRect(x - 1, y - 1, w + 2, h + 2);

    // Füllung
    const ratio = this.hp / this.maxHp;
    const color = ratio > 0.6 ? 0x44dd44 : ratio > 0.3 ? 0xffaa00 : 0xff2222;
    this._hpBar.fillStyle(color);
    this._hpBar.fillRect(x, y, w * ratio, h);
  }

  destroy(fromScene) {
    if (this._hpBar) this._hpBar.destroy();
    super.destroy(fromScene);
  }
}
