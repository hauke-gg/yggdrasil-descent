export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.floor = data.floor || 1;
    this.kills = data.kills || 0;
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, 960, 540, 0x000000, 0.8);

    this.add.text(cx, cy - 80, 'GEFALLEN IN MIDGARD', {
      fontSize: '36px', color: '#ff4444', fontStyle: 'bold', fontFamily: 'serif'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, `Floor erreicht: ${this.floor}`, {
      fontSize: '22px', color: '#ffffff', fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, `Feinde besiegt: ${this.kills}`, {
      fontSize: '22px', color: '#ffffff', fontFamily: 'sans-serif'
    }).setOrigin(0.5);

    const restartBtn = this.add.text(cx, cy + 100, '↺  NEUER RUN', {
      fontSize: '28px', color: '#ffffff', backgroundColor: '#4a0080',
      padding: { x: 24, y: 12 }, fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => this.scene.start('DungeonScene'));
  }
}
