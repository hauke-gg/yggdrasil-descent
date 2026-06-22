export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.text(cx, cy - 80, 'YGGDRASIL DESCENT', {
      fontSize: '42px', color: '#d4af37', fontStyle: 'bold',
      fontFamily: 'serif', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(cx, cy - 30, 'Ein nordischer Dungeon Crawler', {
      fontSize: '18px', color: '#aaaaaa', fontFamily: 'serif'
    }).setOrigin(0.5);

    const startBtn = this.add.text(cx, cy + 40, '▶  SPIEL STARTEN', {
      fontSize: '28px', color: '#ffffff', backgroundColor: '#4a0080',
      padding: { x: 24, y: 12 }, fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setStyle({ color: '#ffdd00' }));
    startBtn.on('pointerout', () => startBtn.setStyle({ color: '#ffffff' }));
    startBtn.on('pointerdown', () => this.scene.start('DungeonScene'));
  }
}
