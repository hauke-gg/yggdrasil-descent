export default class DungeonScene extends Phaser.Scene {
  constructor() { super('DungeonScene'); }

  create() {
    this.add.text(480, 270, 'DungeonScene — kommt gleich!', {
      fontSize: '24px', color: '#ffffff'
    }).setOrigin(0.5);
  }
}
