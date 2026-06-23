import { registerAllSprites } from '../utils/SpriteFactory.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('menu_bg', 'assets/menu-bg.png');
    this.load.image('wurzelkammer_bg', 'assets/wurzelkammer-bg.png');
  }

  create() {
    registerAllSprites(this);
    this.scene.start('MenuScene');
  }
}
