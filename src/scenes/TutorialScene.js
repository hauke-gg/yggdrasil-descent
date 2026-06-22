import { COLORS, TEXT_STYLES, drawGrid, drawPanel, drawButton } from '../data/design-system.js';
import { TUTORIAL } from '../data/copy.js';

export default class TutorialScene extends Phaser.Scene {
  constructor() { super('TutorialScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    this._page = 0;

    // --- Static background ---
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.void, 1);
    bg.fillRect(0, 0, W, H);
    const gridGfx = this.add.graphics();
    drawGrid(gridGfx, W, H);

    // --- Dynamic card layer ---
    this._cardGfx = this.add.graphics();

    // --- Progress indicator (top-right) ---
    this._progressT = this.add.text(W - 16, 16, '', TEXT_STYLES.tiny)
      .setOrigin(1, 0);

    // --- Large icon ---
    this._iconT = this.add.text(cx, cy - 95, '', { ...TEXT_STYLES.heading, fontSize: '56px', color: COLORS.goldCSS })
      .setOrigin(0.5);

    // --- Title ---
    this._titleT = this.add.text(cx, cy - 28, '', TEXT_STYLES.heading)
      .setOrigin(0.5);

    // --- Gold divider ---
    this._divGfx = this.add.graphics();

    // --- Body text ---
    this._bodyT = this.add.text(cx, cy + 20, '',
      { ...TEXT_STYLES.body, wordWrap: { width: 580 }, align: 'center' })
      .setOrigin(0.5, 0);

    // --- Tip text ---
    this._tipT = this.add.text(cx, cy + 100, '',
      { ...TEXT_STYLES.caption, fontSize: '12px' })
      .setOrigin(0.5);

    // --- Progress dots ---
    this._dotsGfx = this.add.graphics();

    // --- Back button (left) ---
    this._backBtn = this.add.text(36, cy, '←',
      { ...TEXT_STYLES.heading, fontSize: '28px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this._backBtn.on('pointerdown', () => this._goTo(this._page - 1));

    // --- Next / Start button (right) ---
    this._nextBtnGfx = this.add.graphics();
    this._nextBtnLabel = this.add.text(W - 36, cy, '→',
      { ...TEXT_STYLES.heading, fontSize: '28px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this._nextBtnLabel.on('pointerdown', () => this._advance());

    // --- Tap zone (center) ---
    const tapZone = this.add.rectangle(cx, cy, W - 120, H - 80, 0x000000, 0)
      .setInteractive();
    tapZone.on('pointerdown', () => this._advance());

    this._renderPage();
  }

  _renderPage() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;
    const card = TUTORIAL[this._page];
    const cardW = 560, cardH = 300;

    // Card background
    this._cardGfx.clear();
    drawPanel(this._cardGfx, cx - cardW / 2, cy - cardH / 2, cardW, cardH, { radius: 14 });

    // Progress
    this._progressT.setText(`${this._page + 1} / ${TUTORIAL.length}`);

    // Icon
    this._iconT.setText(card.icon);

    // Title
    this._titleT.setText(card.title);

    // Divider
    this._divGfx.clear();
    this._divGfx.lineStyle(1, COLORS.gold, 0.4);
    this._divGfx.lineBetween(cx - 100, cy - 4, cx + 100, cy - 4);

    // Body
    this._bodyT.setText(card.body);
    this._bodyT.setY(cy + 12);

    // Tip
    this._tipT.setText(card.tip);
    this._tipT.setY(cy + 95);

    // Progress dots
    this._dotsGfx.clear();
    const dotSpacing = 20;
    const dotsStartX = cx - ((TUTORIAL.length - 1) * dotSpacing) / 2;
    TUTORIAL.forEach((_, i) => {
      if (i === this._page) {
        this._dotsGfx.fillStyle(COLORS.gold, 1);
        this._dotsGfx.fillCircle(dotsStartX + i * dotSpacing, H - 24, 5);
      } else {
        this._dotsGfx.lineStyle(1.5, COLORS.purple, 0.8);
        this._dotsGfx.strokeCircle(dotsStartX + i * dotSpacing, H - 24, 5);
      }
    });

    // Back button visibility
    this._backBtn.setVisible(this._page > 0);

    // Next / Start button
    if (this._page === TUTORIAL.length - 1) {
      this._nextBtnLabel.setText('STARTE ABENTEUER')
        .setFontSize('15px')
        .setX(W - 90);
    } else {
      this._nextBtnLabel.setText('→')
        .setFontSize('28px')
        .setX(W - 36);
    }
  }

  _advance() {
    if (this._page < TUTORIAL.length - 1) {
      this._goTo(this._page + 1);
    } else {
      this.scene.start('DungeonScene');
    }
  }

  _goTo(idx) {
    if (idx < 0 || idx >= TUTORIAL.length) return;
    this._page = idx;
    this._renderPage();
  }
}
