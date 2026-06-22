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

    // HP-Bar über dem Feind
    this._hpBar = scene.add.graphics().setDepth(6);
    this._drawHpBar();
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._drawHpBar();
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());
    return this.hp <= 0;
  }

  update(player) {
    if (!this.active || !player || !player.active) return;

    // Auf Spieler zubewegen
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // HP-Bar Position updaten
    this._drawHpBar();
  }

  _drawHpBar() {
    if (!this._hpBar) return;
    this._hpBar.clear();
    const w = 32;
    const h = 4;
    const x = this.x - w / 2;
    const y = this.y - this.displayHeight / 2 - 8;
    // Hintergrund
    this._hpBar.fillStyle(0x333333);
    this._hpBar.fillRect(x, y, w, h);
    // Füllung
    const ratio = this.hp / this.maxHp;
    this._hpBar.fillStyle(ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222);
    this._hpBar.fillRect(x, y, w * ratio, h);
  }

  destroy(fromScene) {
    if (this._hpBar) this._hpBar.destroy();
    super.destroy(fromScene);
  }
}
