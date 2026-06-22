export default class TutorialScene extends Phaser.Scene {
  constructor() { super('TutorialScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    this._page = 0;
    this._cards = [
      { title: 'BEWEGE DICH', icon: '🕹', body: 'Linke Seite: Virtueller Joystick zum Laufen\nRechte Seite: Fähigkeiten aktivieren' },
      { title: 'KÄMPFE AUTO', icon: '⚔', body: 'Dein Krieger greift automatisch an.\nWeiche Angriffen aus!' },
      { title: 'LEVEL UP', icon: '✦', body: 'Töte Feinde → Sammle XP\nWähle neue Fähigkeiten & Waffen' },
      { title: 'ÜBERLEBE', icon: '💀', body: 'Feinde werden stärker.\nEntwickle deine Waffen.\nBesiege Fenrir!' }
    ];

    const bg = this.add.graphics();
    bg.fillStyle(0x08010f);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x330066, 0.15);
    for (let x = 0; x <= W; x += 48) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) bg.lineBetween(0, y, W, y);

    this._cardGfx = this.add.graphics();
    this._iconT = this.add.text(cx, cy - 80, '', { fontSize: '48px' }).setOrigin(0.5);
    this._titleT = this.add.text(cx, cy - 20, '', {
      fontSize: '28px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'serif',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 16, fill: true }
    }).setOrigin(0.5);
    this._bodyT = this.add.text(cx, cy + 40, '', {
      fontSize: '15px', color: '#cccccc', fontFamily: 'sans-serif', align: 'center', lineSpacing: 6
    }).setOrigin(0.5);

    this._dotsGfx = this.add.graphics();

    const backBtn = this.add.text(40, cy, '←', {
      fontSize: '28px', color: '#d4af37', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this._goTo(this._page - 1));
    this._backBtn = backBtn;

    const nextBtn = this.add.text(W - 40, cy, '→', {
      fontSize: '28px', color: '#d4af37', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => this._advance());
    this._nextBtn = nextBtn;

    const tapZone = this.add.rectangle(cx, cy, W - 120, H - 80, 0x000000, 0)
      .setInteractive();
    tapZone.on('pointerdown', () => this._advance());

    this._renderPage();
  }

  _renderPage() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;
    const card = this._cards[this._page];
    const cardW = 500, cardH = 260;

    this._cardGfx.clear();
    this._cardGfx.fillStyle(0x12003a, 0.95);
    this._cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);
    this._cardGfx.lineStyle(2, 0x6633aa);
    this._cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 14);

    this._iconT.setText(card.icon);
    this._titleT.setText(card.title);
    this._bodyT.setText(card.body);

    this._dotsGfx.clear();
    const dotSpacing = 20;
    const dotsStartX = cx - ((this._cards.length - 1) * dotSpacing) / 2;
    this._cards.forEach((_, i) => {
      if (i === this._page) {
        this._dotsGfx.fillStyle(0xd4af37);
        this._dotsGfx.fillCircle(dotsStartX + i * dotSpacing, H - 24, 5);
      } else {
        this._dotsGfx.fillStyle(0x443355);
        this._dotsGfx.fillCircle(dotsStartX + i * dotSpacing, H - 24, 4);
      }
    });

    this._backBtn.setVisible(this._page > 0);

    if (this._page === this._cards.length - 1) {
      this._nextBtn.setText('▶');
    } else {
      this._nextBtn.setText('→');
    }
  }

  _advance() {
    if (this._page < this._cards.length - 1) {
      this._goTo(this._page + 1);
    } else {
      this.scene.start('DungeonScene');
    }
  }

  _goTo(idx) {
    if (idx < 0 || idx >= this._cards.length) return;
    this._page = idx;
    this._renderPage();
  }
}
