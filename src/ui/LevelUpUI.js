import { WEAPONS, PASSIVES } from '../data/weapons.js';

export default class LevelUpUI {
  constructor(scene) {
    this.scene = scene;
    this._container = null;
  }

  // options: Array von { type: 'weapon'|'passive'|'upgrade', id: string }
  // onChoice: (option) => void
  show(options, onChoice) {
    // Spiel pausieren
    this.scene.physics.pause();

    const cx = 480, cy = 270;
    this._container = this.scene.add.container(0, 0).setDepth(100);

    // Dunkles Overlay
    const overlay = this.scene.add.rectangle(cx, cy, 960, 540, 0x000000, 0.75);
    this._container.add(overlay);

    this.scene.add.text(cx, cy - 160, '⚔  LEVEL UP  ⚔', {
      fontSize: '28px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'serif'
    }).setOrigin(0.5).setDepth(101);

    const cardW = 220, cardH = 160;
    const startX = cx - (options.length - 1) * (cardW / 2 + 10);

    options.forEach((option, i) => {
      const cardX = startX + i * (cardW + 20);
      const cardY = cy;
      const info = this._getOptionInfo(option);

      // Karte
      const card = this.scene.add.rectangle(cardX, cardY, cardW, cardH, 0x2d1b4e)
        .setStrokeStyle(2, 0x8844cc).setInteractive({ useHandCursor: true }).setDepth(101);

      this.scene.add.text(cardX, cardY - 50, info.icon, { fontSize: '32px' }).setOrigin(0.5).setDepth(102);
      this.scene.add.text(cardX, cardY - 10, info.name, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold', fontFamily: 'sans-serif',
        wordWrap: { width: cardW - 20 }
      }).setOrigin(0.5).setDepth(102);
      this.scene.add.text(cardX, cardY + 30, info.description, {
        fontSize: '12px', color: '#aaaaaa', fontFamily: 'sans-serif',
        wordWrap: { width: cardW - 20 }, align: 'center'
      }).setOrigin(0.5).setDepth(102);

      card.on('pointerover', () => card.setFillStyle(0x4a2a7e));
      card.on('pointerout', () => card.setFillStyle(0x2d1b4e));
      card.on('pointerdown', () => {
        this._close();
        onChoice(option);
      });

      this._container.add([card]);
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

  _close() {
    if (this._container) {
      this._container.destroy();
      this._container = null;
    }
    // Alle Text-Objekte die außerhalb des Containers erzeugt wurden aufräumen
    // (DungeonScene räumt via Scene-Restart auf)
    this.scene.physics.resume();
  }
}
