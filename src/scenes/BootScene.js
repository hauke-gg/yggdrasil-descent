import { registerAllSprites } from '../utils/SpriteFactory.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('menu_bg', 'assets/menu-bg.png');
    this.load.image('wurzelkammer_bg', 'assets/wurzelkammer-bg.png');
    this.load.image('bragi_intro_bg', 'assets/bragi-intro.png');
    this.load.image('draugr_king_img', 'assets/draugr-king.png');
    this.load.image('skald_hakon', 'assets/skald-hakon.jpg');
    this.load.image('skald_solveig', 'assets/skald-solveig.png');
    this.load.image('skald_brandr', 'assets/skald-brandr.jpg');
    this.load.image('enemy_skinwalker', 'assets/enemy-skinwalker.png');
    this.load.image('enemy_fenrir', 'assets/enemy-fenrir.jpg');
    this.load.image('enemy_jotunn', 'assets/enemy-jotunn.jpg');
    this.load.image('god_loki_img', 'assets/god-loki.jpg');
  }

  create() {
    registerAllSprites(this);
    this.scene.start('MenuScene');
  }
}
