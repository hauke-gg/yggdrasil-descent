export default class CharacterScene extends Phaser.Scene {
  constructor() { super('CharacterScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    this._selectedClass = 'krieger';
    this._nameInput = null;

    const bg = this.add.graphics();
    bg.fillStyle(0x08010f);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x330066, 0.15);
    for (let x = 0; x <= W; x += 48) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) bg.lineBetween(0, y, W, y);

    this.add.text(cx, 38, 'KRIEGER DES NORDENS', {
      fontSize: '36px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'serif',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 24, fill: true }
    }).setOrigin(0.5);

    this.add.text(cx, 72, 'Wähle deinen Weg durch Yggdrasil', {
      fontSize: '14px', color: '#886644', fontFamily: 'serif'
    }).setOrigin(0.5);

    this.add.text(cx - 200, 106, 'Dein Name, Krieger:', {
      fontSize: '13px', color: '#aaaaaa', fontFamily: 'sans-serif'
    }).setOrigin(0, 0.5);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Krieger';
    input.maxLength = 20;
    Object.assign(input.style, {
      position: 'absolute',
      background: '#0d0020',
      border: '1px solid #6633aa',
      borderRadius: '4px',
      color: '#d4af37',
      fontSize: '14px',
      padding: '4px 10px',
      outline: 'none',
      fontFamily: 'sans-serif',
      width: '180px',
      zIndex: '10'
    });
    document.body.appendChild(input);
    this._nameInput = input;

    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / W;
    const scaleY = rect.height / H;
    input.style.left = (rect.left + (cx + 10) * scaleX) + 'px';
    input.style.top = (rect.top + (99) * scaleY) + 'px';
    input.style.width = (180 * scaleX) + 'px';
    input.style.height = (22 * scaleY) + 'px';

    const classes = [
      { id: 'krieger', icon: '⚔', name: 'Krieger', sub: 'Stark & Unaufhaltsam', stats: 'HP 120 · DMG ×1.2' },
      { id: 'schatten', icon: '🏹', name: 'Schattenjäger', sub: 'Schnell & Präzise', stats: 'HP 80 · SPD ×1.3' },
      { id: 'runen', icon: '🔮', name: 'Runenmagier', sub: 'Mächtige Runen', stats: 'HP 70 · DMG ×1.5' }
    ];

    this._cardGraphics = [];
    this._cardObjects = [];

    const cardW = 180, cardH = 200;
    const totalW = classes.length * cardW + (classes.length - 1) * 20;
    const startX = cx - totalW / 2 + cardW / 2;
    const cardY = cy + 30;

    classes.forEach((cls, i) => {
      const cardX = startX + i * (cardW + 20);
      const isSelected = cls.id === this._selectedClass;

      const cardGfx = this.add.graphics();
      this._drawCard(cardGfx, cardX, cardY, cardW, cardH, isSelected);
      this._cardGraphics.push({ gfx: cardGfx, x: cardX, y: cardY, id: cls.id });

      const icon = this.add.text(cardX, cardY - 60, cls.icon, { fontSize: '32px' }).setOrigin(0.5);
      const nameT = this.add.text(cardX, cardY - 18, cls.name, {
        fontSize: '15px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'sans-serif'
      }).setOrigin(0.5);
      const subT = this.add.text(cardX, cardY + 14, cls.sub, {
        fontSize: '11px', color: '#aaaaaa', fontFamily: 'sans-serif'
      }).setOrigin(0.5);
      const statsT = this.add.text(cardX, cardY + 52, cls.stats, {
        fontSize: '11px', color: '#d4af37', fontFamily: 'monospace'
      }).setOrigin(0.5);

      const hitArea = this.add.rectangle(cardX, cardY, cardW, cardH, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerdown', () => {
        this._selectedClass = cls.id;
        this._cardGraphics.forEach(c => {
          c.gfx.clear();
          this._drawCard(c.gfx, c.x, c.y, cardW, cardH, c.id === this._selectedClass);
        });
      });

      this._cardObjects.push(icon, nameT, subT, statsT, hitArea);
    });

    const btnX = W - 120, btnY = H - 40;
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x2a0050, 0.95);
    btnGfx.fillRoundedRect(btnX - 100, btnY - 22, 200, 44, 8);
    btnGfx.lineStyle(2, 0xd4af37);
    btnGfx.strokeRoundedRect(btnX - 100, btnY - 22, 200, 44, 8);

    const btnT = this.add.text(btnX, btnY, 'WEITER →', {
      fontSize: '16px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnT.on('pointerover', () => btnT.setStyle({ color: '#ffffff' }));
    btnT.on('pointerout', () => btnT.setStyle({ color: '#d4af37' }));
    btnT.on('pointerdown', () => {
      const name = this._nameInput.value.trim() || 'Krieger';
      localStorage.setItem('ygg_player', JSON.stringify({ name, class: this._selectedClass }));
      this._cleanup();
      this.scene.start('TutorialScene');
    });
  }

  _drawCard(gfx, x, y, w, h, selected) {
    gfx.fillStyle(0x12003a, 0.95);
    gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    if (selected) {
      gfx.lineStyle(2, 0xd4af37);
    } else {
      gfx.lineStyle(1, 0x6633aa);
    }
    gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
  }

  _cleanup() {
    if (this._nameInput) {
      this._nameInput.remove();
      this._nameInput = null;
    }
  }

  shutdown() { this._cleanup(); }
  destroy() { this._cleanup(); }
}
