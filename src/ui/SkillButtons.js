export default class SkillButtons {
  constructor(scene) {
    this.scene = scene;
    this._callbacks = {};

    // Dash-Button rechts unten
    this._dashBtn = scene.add.circle(840, 440, 40, 0x4444aa, 0.7)
      .setDepth(50).setScrollFactor(0).setInteractive();

    scene.add.text(840, 440, '⚡', { fontSize: '24px' })
      .setOrigin(0.5).setDepth(51).setScrollFactor(0);

    this._dashBtn.on('pointerdown', () => {
      if (this._callbacks[0]) this._callbacks[0]();
    });
  }

  // index: 0 = Dash
  onSkill(index, callback) {
    this._callbacks[index] = callback;
  }

  setCooldown(index, active) {
    if (index === 0) this._dashBtn.setFillStyle(active ? 0x888888 : 0x4444aa, 0.7);
  }

  destroy() {
    this._dashBtn.destroy();
  }
}
