export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Spieler-Textur: blauer Kreis
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    playerGfx.fillStyle(0x4488ff);
    playerGfx.fillCircle(16, 16, 16);
    playerGfx.generateTexture('player', 32, 32);
    playerGfx.destroy();

    // Feind-Textur: roter Kreis
    const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGfx.fillStyle(0xff4444);
    enemyGfx.fillCircle(14, 14, 14);
    enemyGfx.generateTexture('enemy_draugr', 28, 28);
    enemyGfx.destroy();

    // Jotunn-Textur: größerer roter Kreis
    const jotunnGfx = this.make.graphics({ x: 0, y: 0, add: false });
    jotunnGfx.fillStyle(0xaa2222);
    jotunnGfx.fillCircle(22, 22, 22);
    jotunnGfx.generateTexture('enemy_jotunn', 44, 44);
    jotunnGfx.destroy();

    // Boss-Textur: oranger großer Kreis
    const bossGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bossGfx.fillStyle(0xff8800);
    bossGfx.fillCircle(32, 32, 32);
    bossGfx.generateTexture('boss_fenrir', 64, 64);
    bossGfx.destroy();

    // Projektil-Textur: gelber kleiner Kreis
    const projGfx = this.make.graphics({ x: 0, y: 0, add: false });
    projGfx.fillStyle(0xffee00);
    projGfx.fillCircle(6, 6, 6);
    projGfx.generateTexture('projectile', 12, 12);
    projGfx.destroy();

    this.scene.start('MenuScene');
  }
}
