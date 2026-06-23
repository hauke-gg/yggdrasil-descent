import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterScene from './scenes/CharacterScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import DungeonScene from './scenes/DungeonScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#06000f',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  input: {
    activePointers: 3
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, MenuScene, CharacterScene, TutorialScene, DungeonScene, GameOverScene]
};

window.game = new Phaser.Game(config);
