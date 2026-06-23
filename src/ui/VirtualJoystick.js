import { COLORS } from '../data/design-system.js';

export default class VirtualJoystick {
  constructor(scene) {
    this.scene = scene;
    this._vector    = { x: 0, y: 0 };
    this._active    = false;
    this._pointerId = null;
    this._baseX     = 100;
    this._baseY     = 430;
    this._radius    = 64;

    // Outer ring — gold, low alpha
    this._baseGfx = scene.add.graphics().setDepth(50).setScrollFactor(0);
    // Thumb — filled circle
    this._thumbGfx = scene.add.graphics().setDepth(51).setScrollFactor(0);

    this._drawBase(this._baseX, this._baseY, false);
    this._drawThumb(this._baseX, this._baseY, false);

    scene.input.on('pointerdown', this._onDown, this);
    scene.input.on('pointermove', this._onMove, this);
    scene.input.on('pointerup',   this._onUp,   this);
  }

  _drawBase(x, y, active) {
    this._baseGfx.clear();
    // Outer ring
    this._baseGfx.lineStyle(2, COLORS.gold, active ? 0.55 : 0.28);
    this._baseGfx.strokeCircle(x, y, this._radius);
    // Inner guide ring
    this._baseGfx.lineStyle(1, COLORS.purple, active ? 0.45 : 0.18);
    this._baseGfx.strokeCircle(x, y, this._radius * 0.55);
    // Background fill
    this._baseGfx.fillStyle(COLORS.void, active ? 0.5 : 0.35);
    this._baseGfx.fillCircle(x, y, this._radius);
  }

  _drawThumb(x, y, active) {
    this._thumbGfx.clear();
    // Glow halo
    this._thumbGfx.fillStyle(COLORS.gold, active ? 0.18 : 0.08);
    this._thumbGfx.fillCircle(x, y, 30);
    // Main thumb
    this._thumbGfx.fillStyle(active ? COLORS.gold : COLORS.purple, active ? 0.85 : 0.55);
    this._thumbGfx.fillCircle(x, y, 20);
    // Inner gloss dot
    this._thumbGfx.fillStyle(0xffffff, 0.22);
    this._thumbGfx.fillCircle(x - 4, y - 4, 6);
    // Border
    this._thumbGfx.lineStyle(1.5, active ? COLORS.gold : COLORS.purple, 0.8);
    this._thumbGfx.strokeCircle(x, y, 20);
  }

  _isInZone(x, y) {
    // Left half, lower 55% of screen
    return x < 340 && y > 260;
  }

  _onDown(pointer) {
    if (this._active) return;
    if (!this._isInZone(pointer.x, pointer.y)) return;
    this._active    = true;
    this._pointerId = pointer.id;
    this._baseX     = pointer.x;
    this._baseY     = pointer.y;
    this._drawBase(pointer.x, pointer.y, true);
    this._drawThumb(pointer.x, pointer.y, true);
  }

  _onMove(pointer) {
    if (!this._active || pointer.id !== this._pointerId) return;
    const dx  = pointer.x - this._baseX;
    const dy  = pointer.y - this._baseY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(len, this._radius);
    const nx  = len > 0 ? dx / len : 0;
    const ny  = len > 0 ? dy / len : 0;
    const tx  = this._baseX + nx * clamped;
    const ty  = this._baseY + ny * clamped;
    this._drawBase(this._baseX, this._baseY, true);
    this._drawThumb(tx, ty, true);
    this._vector = { x: nx * (clamped / this._radius), y: ny * (clamped / this._radius) };
  }

  _onUp(pointer) {
    if (pointer.id !== this._pointerId) return;
    this._active    = false;
    this._pointerId = null;
    this._vector    = { x: 0, y: 0 };
    this._drawBase(this._baseX, this._baseY, false);
    this._drawThumb(this._baseX, this._baseY, false);
  }

  getVector() { return this._vector; }

  destroy() {
    this._baseGfx.destroy();
    this._thumbGfx.destroy();
  }
}
