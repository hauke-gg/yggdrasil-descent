import { COLORS, TEXT_STYLES, drawGrid, drawPanel, drawButton } from '../data/design-system.js';
import { GAME_OVER, BIOME_NAMES } from '../data/copy.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.survivalSeconds = data.survivalSeconds || 0;
    this.kills           = data.kills           || 0;
    this.level           = data.level           || 1;
    this.biomeName       = data.biomeName       || 'Midgard';
    // legacy compat
    this.floor   = data.floor   || 1;
    this.victory = data.victory || false;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.void, 1);
    bg.fillRect(0, 0, W, H);
    const gridGfx = this.add.graphics();
    drawGrid(gridGfx, W, H);

    // All elements start invisible, fade in
    const allObjs = [];

    // Title
    const title = this.add.text(cx, cy - 140, GAME_OVER.title,
      { ...TEXT_STYLES.title, fontSize: '48px' })
      .setOrigin(0.5).setAlpha(0);
    allObjs.push(title);

    // Random subtitle
    const subtitles = GAME_OVER.subtitles;
    const sub = subtitles[Math.floor(Math.random() * subtitles.length)];
    const subT = this.add.text(cx, cy - 80, sub,
      { ...TEXT_STYLES.body, align: 'center', fontStyle: 'italic', wordWrap: { width: 600 } })
      .setOrigin(0.5).setAlpha(0);
    allObjs.push(subT);

    // Stats panel
    const panelW = 320, panelH = 130;
    const panelGfx = this.add.graphics().setAlpha(0);
    drawPanel(panelGfx, cx - panelW / 2, cy - 28, panelW, panelH);
    allObjs.push(panelGfx);

    const mins = Math.floor(this.survivalSeconds / 60).toString().padStart(2, '0');
    const secs = (this.survivalSeconds % 60).toString().padStart(2, '0');

    const statsLines = [
      `${GAME_OVER.stats.survived}:  ${mins}:${secs}`,
      `${GAME_OVER.stats.killed}:   ${this.kills}`,
      `${GAME_OVER.stats.level}:    ${this.level}`,
      `${GAME_OVER.stats.biome}:    ${this.biomeName}`,
    ];

    const statsT = this.add.text(cx, cy + 38, statsLines.join('\n'),
      { ...TEXT_STYLES.stat, align: 'center', lineSpacing: 8 })
      .setOrigin(0.5, 1).setAlpha(0);
    allObjs.push(statsT);

    // Restart button
    const btn1W = 220, btn1H = 50;
    const btn1X = cx - btn1W / 2 - 10;
    const btn1Y = cy + 120;

    const btn1Gfx = this.add.graphics().setAlpha(0);
    drawButton(btn1Gfx, btn1X, btn1Y, btn1W, btn1H, false);
    allObjs.push(btn1Gfx);

    const btn1Label = this.add.text(btn1X + btn1W / 2, btn1Y + btn1H / 2,
      GAME_OVER.restartButton, TEXT_STYLES.button)
      .setOrigin(0.5).setAlpha(0);
    allObjs.push(btn1Label);

    const btn1Hit = this.add.rectangle(btn1X + btn1W / 2, btn1Y + btn1H / 2, btn1W, btn1H, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setAlpha(0);
    allObjs.push(btn1Hit);

    btn1Hit.on('pointerover', () => { btn1Gfx.clear(); drawButton(btn1Gfx, btn1X, btn1Y, btn1W, btn1H, true); btn1Label.setStyle({ ...TEXT_STYLES.button, color: COLORS.goldCSS }); });
    btn1Hit.on('pointerout',  () => { btn1Gfx.clear(); drawButton(btn1Gfx, btn1X, btn1Y, btn1W, btn1H, false); btn1Label.setStyle({ ...TEXT_STYLES.button, color: '#ffffff' }); });
    btn1Hit.on('pointerdown', () => this.scene.start('DungeonScene'));

    // Menu button
    const btn2W = 200, btn2H = 50;
    const btn2X = cx + 10;
    const btn2Y = cy + 120;

    const btn2Gfx = this.add.graphics().setAlpha(0);
    drawButton(btn2Gfx, btn2X, btn2Y, btn2W, btn2H, false);
    allObjs.push(btn2Gfx);

    const btn2Label = this.add.text(btn2X + btn2W / 2, btn2Y + btn2H / 2,
      GAME_OVER.menuButton, TEXT_STYLES.button)
      .setOrigin(0.5).setAlpha(0);
    allObjs.push(btn2Label);

    const btn2Hit = this.add.rectangle(btn2X + btn2W / 2, btn2Y + btn2H / 2, btn2W, btn2H, 0x000000, 0)
      .setInteractive({ useHandCursor: true }).setAlpha(0);
    allObjs.push(btn2Hit);

    btn2Hit.on('pointerover', () => { btn2Gfx.clear(); drawButton(btn2Gfx, btn2X, btn2Y, btn2W, btn2H, true); btn2Label.setStyle({ ...TEXT_STYLES.button, color: COLORS.goldCSS }); });
    btn2Hit.on('pointerout',  () => { btn2Gfx.clear(); drawButton(btn2Gfx, btn2X, btn2Y, btn2W, btn2H, false); btn2Label.setStyle({ ...TEXT_STYLES.button, color: '#ffffff' }); });
    btn2Hit.on('pointerdown', () => this.scene.start('MenuScene'));

    // Fade everything in
    this.tweens.add({
      targets: allObjs,
      alpha: 1,
      duration: 600,
      ease: 'Sine.easeOut',
    });
  }
}
