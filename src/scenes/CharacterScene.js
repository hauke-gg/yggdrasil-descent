import { COLORS, TEXT_STYLES, drawGrid, drawPanel, drawPanelGold, drawButton } from '../data/design-system.js';
import { CHARACTER_CREATION } from '../data/copy.js';

export default class CharacterScene extends Phaser.Scene {
  constructor() { super('CharacterScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2;

    this._selectedClass = 'krieger';
    this._nameInput = null;
    this._styleTag = null;

    // --- Background ---
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.void, 1);
    bg.fillRect(0, 0, W, H);
    const gridGfx = this.add.graphics();
    drawGrid(gridGfx, W, H);

    // --- Title ---
    this.add.text(cx, 38, CHARACTER_CREATION.title, TEXT_STYLES.heading)
      .setOrigin(0.5);

    // --- Subtitle ---
    this.add.text(cx, 68, CHARACTER_CREATION.subtitle, TEXT_STYLES.caption)
      .setOrigin(0.5);

    // --- Name input label ---
    this.add.text(cx, 100, CHARACTER_CREATION.nameLabel, TEXT_STYLES.stat)
      .setOrigin(0.5);

    // Style the HTML input
    const styleTag = document.createElement('style');
    styleTag.textContent = '#ygg-name-input { background: #0d0520; border: 1.5px solid #d4af37; border-radius: 6px; color: #f0d060; font-family: \'Cinzel\', serif; font-size: 18px; padding: 10px 16px; outline: none; width: 320px; text-align: center; }';
    document.head.appendChild(styleTag);
    this._styleTag = styleTag;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'ygg-name-input';
    input.placeholder = CHARACTER_CREATION.namePlaceholder;
    input.maxLength = 20;
    Object.assign(input.style, {
      position: 'absolute',
      zIndex: '10',
    });
    document.body.appendChild(input);
    this._nameInput = input;

    // Position input over canvas
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / W;
    const scaleY = rect.height / H;
    input.style.left = (rect.left + (cx - 160) * scaleX) + 'px';
    input.style.top  = (rect.top  + (114) * scaleY) + 'px';
    input.style.width = (320 * scaleX) + 'px';

    // --- Class cards ---
    const classKeys = ['krieger', 'schatten', 'magier'];
    const cardW = 185, cardH = 220;
    const gap = 20;
    const totalW = classKeys.length * cardW + (classKeys.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;
    const cardCY = H / 2 + 60;

    this._cardGraphics = [];

    classKeys.forEach((key, i) => {
      const cls = CHARACTER_CREATION.classes[key];
      const cardX = startX + i * (cardW + gap);
      const isSelected = key === this._selectedClass;
      const rx = cardX - cardW / 2;
      const ry = cardCY - cardH / 2;

      const cardGfx = this.add.graphics();
      if (isSelected) drawPanelGold(cardGfx, rx, ry, cardW, cardH);
      else            drawPanel(cardGfx, rx, ry, cardW, cardH);
      this._cardGraphics.push({ gfx: cardGfx, x: rx, y: ry, w: cardW, h: cardH, id: key });

      // Icon
      this.add.text(cardX, ry + 28, cls.icon, { ...TEXT_STYLES.heading, fontSize: '32px' })
        .setOrigin(0.5);

      // Class name
      this.add.text(cardX, ry + 66, cls.name, TEXT_STYLES.cardTitle)
        .setOrigin(0.5);

      // Epithet
      this.add.text(cardX, ry + 88, cls.epithet, TEXT_STYLES.caption)
        .setOrigin(0.5);

      // Description
      this.add.text(cardX, ry + 110, cls.desc,
        { ...TEXT_STYLES.cardBody, wordWrap: { width: cardW - 24 }, align: 'center' })
        .setOrigin(0.5, 0);

      // Stats
      this.add.text(cardX, ry + cardH - 12, cls.stats,
        { ...TEXT_STYLES.stat, fontSize: '10px' })
        .setOrigin(0.5, 1);

      // Hit area
      const hit = this.add.rectangle(cardX, cardCY, cardW, cardH, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        this._selectedClass = key;
        this._cardGraphics.forEach(c => {
          c.gfx.clear();
          if (c.id === this._selectedClass) drawPanelGold(c.gfx, c.x, c.y, c.w, c.h);
          else                               drawPanel(c.gfx, c.x, c.y, c.w, c.h);
        });
      });
    });

    // --- Continue button ---
    const btnW = 260, btnH = 52;
    const btnX = cx - btnW / 2;
    const btnY = H - 70;

    const btnGfx = this.add.graphics();
    drawButton(btnGfx, btnX, btnY, btnW, btnH, false);

    const btnLabel = this.add.text(cx, btnY + btnH / 2, CHARACTER_CREATION.continueButton, TEXT_STYLES.button)
      .setOrigin(0.5);

    const btnHit = this.add.rectangle(cx, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on('pointerover', () => {
      btnGfx.clear();
      drawButton(btnGfx, btnX, btnY, btnW, btnH, true);
      btnLabel.setStyle({ ...TEXT_STYLES.button, color: COLORS.goldCSS });
    });
    btnHit.on('pointerout', () => {
      btnGfx.clear();
      drawButton(btnGfx, btnX, btnY, btnW, btnH, false);
      btnLabel.setStyle({ ...TEXT_STYLES.button, color: '#ffffff' });
    });
    btnHit.on('pointerdown', () => {
      const name = this._nameInput ? this._nameInput.value.trim() : '';
      localStorage.setItem('ygg_player', JSON.stringify({ name: name || 'Krieger', class: this._selectedClass }));
      this._cleanup();
      this.scene.start('TutorialScene');
    });
  }

  _cleanup() {
    if (this._nameInput) { this._nameInput.remove(); this._nameInput = null; }
    if (this._styleTag)  { this._styleTag.remove();  this._styleTag = null; }
  }

  shutdown() { this._cleanup(); }
  destroy()  { this._cleanup(); }
}
