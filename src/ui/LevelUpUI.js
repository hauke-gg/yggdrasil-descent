import { WEAPONS, PASSIVES } from '../data/weapons.js';

export default class LevelUpUI {
  constructor(scene) {
    this.scene = scene;
    this._objects = [];
  }

  show(options, onChoice) {
    this.hide();
    this.scene.physics.pause();

    const cx = 480, cy = 270;

    const overlay = this.scene.add.rectangle(cx, cy, 960, 540, 0x000000, 0.78).setDepth(100);
    this._objects.push(overlay);

    const title = this.scene.add.text(cx, cy - 155, '⚔  LEVEL UP  ⚔', {
      fontSize: '28px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'serif'
    }).setOrigin(0.5).setDepth(101);
    this._objects.push(title);

    const cardW = 220, cardH = 165;
    const gap = 20;
    const totalW = options.length * cardW + (options.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    options.forEach((option, i) => {
      const cardX = startX + i * (cardW + gap);
      const info = this._getOptionInfo(option);

      const cardBg = this.scene.add.graphics().setDepth(101);
      const drawCard = (hover) => {
        cardBg.clear();
        cardBg.fillStyle(hover ? 0x2a1060 : 0x1a0033, hover ? 0.98 : 0.92);
        cardBg.fillRoundedRect(cardX - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
        cardBg.lineStyle(2, hover ? 0xd4af37 : 0x8844cc);
        cardBg.strokeRoundedRect(cardX - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
      };
      drawCard(false);
      this._objects.push(cardBg);

      const iconT = this.scene.add.text(cardX, cy - 52, info.icon, { fontSize: '32px' }).setOrigin(0.5).setDepth(102);
      const nameT = this.scene.add.text(cardX, cy - 8, info.name, {
        fontSize: '15px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'sans-serif',
        wordWrap: { width: cardW - 20 }, align: 'center'
      }).setOrigin(0.5).setDepth(102);
      const descT = this.scene.add.text(cardX, cy + 34, info.description, {
        fontSize: '12px', color: '#aaaaaa', fontFamily: 'sans-serif',
        wordWrap: { width: cardW - 20 }, align: 'center'
      }).setOrigin(0.5).setDepth(102);
      this._objects.push(iconT, nameT, descT);

      const hit = this.scene.add.rectangle(cardX, cy, cardW, cardH, 0x000000, 0)
        .setInteractive({ useHandCursor: true }).setDepth(102);
      this._objects.push(hit);

      hit.on('pointerover', () => drawCard(true));
      hit.on('pointerout', () => drawCard(false));
      hit.on('pointerdown', () => {
        this.hide();
        onChoice(option);
      });
    });
  }

  _getOptionInfo(option) {
    if (option.type === 'weapon') {
      const w = WEAPONS[option.id];
      return { icon: '⚔', name: w ? w.name : option.id, description: w ? w.description : '' };
    }
    if (option.type === 'passive') {
      const p = PASSIVES[option.id];
      return { icon: '✦', name: p ? p.name : option.id, description: p ? p.description : '' };
    }
    if (option.type === 'upgrade') {
      const w = WEAPONS[option.id];
      return { icon: '▲', name: `${w ? w.name : option.id} aufwerten`, description: 'Waffe auf nächstes Level' };
    }
    return { icon: '?', name: option.id, description: '' };
  }

  hide() {
    this._objects.forEach(o => { if (o && o.destroy) o.destroy(); });
    this._objects = [];
    if (this.scene && this.scene.physics) this.scene.physics.resume();
  }
}
