import { COLORS, TEXT_STYLES } from '../data/design-system.js';
import { GOD_SPEECHES } from '../data/copy.js';

export default class GodSpeechUI {
  constructor(scene) {
    this.scene = scene;
    this._objects = [];
    this._dismissed = false;
  }

  show(onDismiss) {
    const gods = Object.keys(GOD_SPEECHES);
    const god = gods[Math.floor(Math.random() * gods.length)];
    const speeches = GOD_SPEECHES[god];
    const speech = speeches[Math.floor(Math.random() * speeches.length)];

    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    // Dark overlay
    const overlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setDepth(90).setScrollFactor(0);

    // Thin colored top-line decoration
    const lineGfx = this.scene.add.graphics().setDepth(91).setScrollFactor(0);
    const godColorInt = parseInt(speech.color.replace('#', '0x'));
    lineGfx.lineStyle(2, godColorInt, 0.9);
    lineGfx.lineBetween(W / 2 - 200, H / 2 - 90, W / 2 + 200, H / 2 - 90);

    // God name
    const nameText = this.scene.add.text(
      W / 2, H / 2 - 70,
      `— ${speech.speaker} SPRICHT —`,
      { ...TEXT_STYLES.godName, color: speech.color }
    ).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    // Speech lines — join and display
    const speechText = this.scene.add.text(
      W / 2, H / 2 - 30,
      speech.lines.join('\n'),
      TEXT_STYLES.godSpeech
    ).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    // Choice / subtext
    const choiceText = this.scene.add.text(
      W / 2, H / 2 + 80,
      speech.choice,
      { ...TEXT_STYLES.caption, fontSize: '14px' }
    ).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    // Hint
    const hint = this.scene.add.text(
      W / 2, H / 2 + 110,
      '[ Tippe zum Fortfahren ]',
      TEXT_STYLES.tiny
    ).setOrigin(0.5).setDepth(91).setScrollFactor(0).setAlpha(0);

    this._objects = [overlay, lineGfx, nameText, speechText, choiceText, hint];
    this._dismissed = false;

    // Animate lines in with stagger
    this.scene.tweens.add({ targets: nameText,   alpha: 1, duration: 400, delay: 100 });
    this.scene.tweens.add({ targets: speechText, alpha: 1, duration: 500, delay: 300 });
    this.scene.tweens.add({ targets: choiceText, alpha: 1, duration: 400, delay: 800 });
    this.scene.tweens.add({ targets: hint,       alpha: 1, duration: 300, delay: 1200 });

    const dismiss = () => {
      if (this._dismissed) return;
      this._dismissed = true;
      overlay.removeInteractive();
      this.scene.tweens.add({
        targets: this._objects,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this._objects.forEach(o => o && o.destroy());
          this._objects = [];
          if (onDismiss) onDismiss();
        }
      });
    };

    overlay.setInteractive();
    overlay.once('pointerdown', dismiss);

    // Auto-dismiss after 5s
    this.scene.time.delayedCall(5000, () => {
      if (this._objects.length > 0 && !this._dismissed) dismiss();
    });
  }

  destroy() {
    this._objects.forEach(o => o && o.destroy());
    this._objects = [];
  }
}
