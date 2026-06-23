import { COLORS } from '../data/design-system.js';

export default class SkillButtons {
  constructor(scene) {
    this.scene = scene;
    this._callbacks  = {};
    this._cooldown   = false;
    this._cooldownPct = 0;

    // Button center — anchored to bottom-right corner
    this._btnX = scene.scale.width - 98;
    this._btnY = scene.scale.height - 88;
    this._btnR = 38;

    this._gfx = scene.add.graphics().setDepth(50).setScrollFactor(0);
    this._labelGfx = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._drawBtn(false);

    // Hit area
    const hit = scene.add.circle(this._btnX, this._btnY, this._btnR + 4, 0x000000, 0)
      .setDepth(52).setScrollFactor(0).setInteractive({ useHandCursor: true });

    hit.on('pointerdown', () => {
      if (this._callbacks[0]) this._callbacks[0]();
    });
    hit.on('pointerover',  () => this._drawBtn(true));
    hit.on('pointerout',   () => this._drawBtn(this._cooldown));
    this._hit = hit;

    // "DASH" label
    scene.add.text(this._btnX, this._btnY + this._btnR + 12, 'DASH', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#888888'
    }).setOrigin(0.5, 0).setDepth(52).setScrollFactor(0);
  }

  _drawBtn(active) {
    const g  = this._gfx;
    const lg = this._labelGfx;
    const x  = this._btnX, y = this._btnY, r = this._btnR;
    g.clear();
    lg.clear();

    // Background circle
    if (this._cooldown) {
      g.fillStyle(0x1a1a2a, 0.9);
      g.fillCircle(x, y, r);
      g.lineStyle(2, COLORS.purpleDim, 0.6);
      g.strokeCircle(x, y, r);
      // Gray-out icon
      this._drawDashIcon(lg, x, y, '#555577');
      return;
    }

    // Outer glow ring
    g.lineStyle(3, active ? COLORS.gold : COLORS.purple, active ? 0.5 : 0.3);
    g.strokeCircle(x, y, r + 4);

    // Main fill
    g.fillStyle(active ? COLORS.purpleDark : 0x1a0a33, 0.92);
    g.fillCircle(x, y, r);
    g.lineStyle(2, active ? COLORS.gold : COLORS.purple, active ? 0.95 : 0.65);
    g.strokeCircle(x, y, r);

    // Gloss
    g.fillStyle(0xffffff, 0.07);
    g.fillCircle(x, y - 8, r * 0.6);

    // Dash icon
    const iconColor = active ? '#ffdd88' : '#9966ee';
    this._drawDashIcon(lg, x, y, iconColor);
  }

  _drawDashIcon(g, x, y, cssColor) {
    // Draw a simple "dash/speed" chevron shape
    // Two parallel horizontal lines + right-pointing arrow
    const col = parseInt(cssColor.replace('#', ''), 16);
    g.lineStyle(2.5, col, 0.9);

    // Arrow body
    g.lineBetween(x - 14, y,      x + 8,  y);
    // Arrow head
    g.lineBetween(x + 8,  y,      x - 2,  y - 9);
    g.lineBetween(x + 8,  y,      x - 2,  y + 9);

    // Speed trail lines
    g.lineStyle(1.5, col, 0.45);
    g.lineBetween(x - 16, y - 6,  x + 2,  y - 6);
    g.lineStyle(1, col, 0.25);
    g.lineBetween(x - 12, y + 6,  x + 0,  y + 6);
  }

  onSkill(index, callback) {
    this._callbacks[index] = callback;
  }

  setCooldown(index, active) {
    if (index !== 0) return;
    this._cooldown = active;
    this._drawBtn(false);
  }

  destroy() {
    this._gfx.destroy();
    this._labelGfx.destroy();
    this._hit.destroy();
  }
}
