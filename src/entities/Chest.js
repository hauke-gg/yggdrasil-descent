import { LOOT_TABLE } from '../data/lore.js';

export default class Chest {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this._opened = false;

    this._gfx = scene.add.graphics().setDepth(3);
    this._gfx.fillStyle(0x5a3a00);
    this._gfx.fillRoundedRect(x - 16, y - 12, 32, 24, 4);
    this._gfx.lineStyle(2, 0xd4af37);
    this._gfx.strokeRoundedRect(x - 16, y - 12, 32, 24, 4);
    this._gfx.fillStyle(0xd4af37);
    this._gfx.fillCircle(x, y, 4);

    this._label = scene.add.text(x, y - 22, '◈ TRUHE', {
      fontSize: '11px', color: '#d4af37', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(4);

    // Interactive zone
    this._zone = scene.add.zone(x, y, 40, 40).setInteractive();
    this._zone.on('pointerdown', () => this._tryOpen());

    scene.tweens.add({
      targets: this._label,
      y: y - 26,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.openRadius = 50;
  }

  _tryOpen() {
    if (this._opened) return;
    this.open();
  }

  open() {
    if (this._opened) return null;
    this._opened = true;
    this._gfx.destroy();
    this._label.destroy();
    this._zone.destroy();
    // Particle burst
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.text(this.x, this.y, '✦', {
        fontSize: '16px', color: '#d4af37'
      }).setOrigin(0.5).setDepth(5);
      this.scene.tweens.add({
        targets: p,
        x: this.x + (Math.random() - 0.5) * 80,
        y: this.y - 40 - Math.random() * 40,
        alpha: 0,
        duration: 600,
        onComplete: () => p.destroy()
      });
    }
    return LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
  }

  isNear(px, py) {
    const dx = px - this.x, dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.openRadius;
  }

  destroy() {
    if (!this._opened) {
      this._gfx.destroy();
      this._label.destroy();
      this._zone.destroy();
    }
  }
}
