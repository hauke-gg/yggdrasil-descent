export default class VirtualJoystick {
  constructor(scene) {
    this.scene = scene;
    this._vector = { x: 0, y: 0 };
    this._active = false;
    this._pointerId = null;
    this._baseX = 120;
    this._baseY = 420;
    this._radius = 60;

    // Zeichnen
    this._base = scene.add.circle(this._baseX, this._baseY, this._radius, 0xffffff, 0.15).setDepth(50).setScrollFactor(0);
    this._thumb = scene.add.circle(this._baseX, this._baseY, 24, 0xffffff, 0.5).setDepth(51).setScrollFactor(0);

    scene.input.on('pointerdown', this._onDown, this);
    scene.input.on('pointermove', this._onMove, this);
    scene.input.on('pointerup', this._onUp, this);
  }

  _isInZone(x, y) {
    return x < 320 && y > 300; // Linke untere Hälfte
  }

  _onDown(pointer) {
    if (this._active) return;
    if (!this._isInZone(pointer.x, pointer.y)) return;
    this._active = true;
    this._pointerId = pointer.id;
    this._baseX = pointer.x;
    this._baseY = pointer.y;
    this._base.setPosition(pointer.x, pointer.y);
    this._thumb.setPosition(pointer.x, pointer.y);
  }

  _onMove(pointer) {
    if (!this._active || pointer.id !== this._pointerId) return;
    const dx = pointer.x - this._baseX;
    const dy = pointer.y - this._baseY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(len, this._radius);
    const nx = len > 0 ? (dx / len) : 0;
    const ny = len > 0 ? (dy / len) : 0;
    this._thumb.setPosition(this._baseX + nx * clamped, this._baseY + ny * clamped);
    this._vector = { x: nx * (clamped / this._radius), y: ny * (clamped / this._radius) };
  }

  _onUp(pointer) {
    if (pointer.id !== this._pointerId) return;
    this._active = false;
    this._pointerId = null;
    this._vector = { x: 0, y: 0 };
    this._thumb.setPosition(this._baseX, this._baseY);
  }

  getVector() {
    return this._vector;
  }

  destroy() {
    this._base.destroy();
    this._thumb.destroy();
  }
}
