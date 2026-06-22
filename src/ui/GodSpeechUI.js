import { GOD_SPEECHES } from '../data/lore.js';

export default class GodSpeechUI {
  constructor(scene) {
    this.scene = scene;
    this._objects = [];
  }

  show(onDismiss) {
    const gods = Object.keys(GOD_SPEECHES);
    const god = gods[Math.floor(Math.random() * gods.length)];
    const speeches = GOD_SPEECHES[god];
    const speech = speeches[Math.floor(Math.random() * speeches.length)];

    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    const overlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7)
      .setDepth(90).setScrollFactor(0);

    const godColors = { ODIN: '#aaaaff', FREYA: '#ffaacc', THOR: '#ffcc44', LOKI: '#44ff88' };
    const color = godColors[speech.speaker] || '#ffffff';

    const nameText = this.scene.add.text(W / 2, H / 2 - 60, `— ${speech.speaker} SPRICHT —`, {
      fontSize: '16px', color: color, fontFamily: 'serif', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    const speechText = this.scene.add.text(W / 2, H / 2 - 10, `"${speech.text}"`, {
      fontSize: '22px', color: '#ffffff', fontFamily: 'serif', fontStyle: 'italic',
      wordWrap: { width: 700 }, align: 'center',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    const hint = this.scene.add.text(W / 2, H / 2 + 90, '[ Tippe zum Fortfahren ]', {
      fontSize: '13px', color: '#886644', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    this._objects = [overlay, nameText, speechText, hint];
    this._dismissed = false;

    this.scene.tweens.add({
      targets: [nameText, speechText, hint],
      alpha: 1,
      duration: 500,
      delay: 100
    });

    const dismiss = () => {
      if (this._dismissed) return;
      this._dismissed = true;
      overlay.removeInteractive();
      this.scene.tweens.add({
        targets: this._objects,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this._objects.forEach(o => o.destroy());
          this._objects = [];
          onDismiss();
        }
      });
    };

    overlay.setInteractive();
    overlay.once('pointerdown', dismiss);

    this.scene.time.delayedCall(4000, () => {
      if (this._objects.length > 0) dismiss();
    });
  }

  destroy() {
    this._objects.forEach(o => o.destroy());
    this._objects = [];
  }
}
