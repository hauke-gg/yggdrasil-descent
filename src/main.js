import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import DungeonScene from './scenes/DungeonScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#0a0015',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, MenuScene, DungeonScene, GameOverScene]
};

window.game = new Phaser.Game(config);
