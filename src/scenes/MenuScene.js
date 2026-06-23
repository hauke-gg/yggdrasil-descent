import { COLORS, TEXT_STYLES, drawGrid, drawButton } from '../data/design-system.js';
import { MENU } from '../data/copy.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    // --- Background (all negative depths so UI stays above) ---
    const bg = this.add.graphics().setDepth(-10);
    bg.fillStyle(COLORS.void, 1);
    bg.fillRect(0, 0, W, H);

    if (this.textures.exists('menu_bg')) {
      this.add.image(cx, cy, 'menu_bg')
        .setDisplaySize(W, H)
        .setDepth(-9)
        .setAlpha(0.72);
      // Vignette keeps text readable
      const vig = this.add.graphics().setDepth(-8);
      vig.fillStyle(0x000000, 0.40);
      vig.fillRect(0, 0, W, H);
    }

    // Subtle grid (below UI elements)
    const gridGfx = this.add.graphics().setDepth(-7);
    drawGrid(gridGfx, W, H);

    // --- Rune deco circles (behind title) ---
    const decoGfx = this.add.graphics();
    decoGfx.lineStyle(1, COLORS.purpleDim, 0.3);
    decoGfx.strokeCircle(cx, 165, 120);
    decoGfx.lineStyle(1, COLORS.purpleDim, 0.15);
    decoGfx.strokeCircle(cx, 165, 160);
    decoGfx.lineStyle(1, COLORS.goldDim, 0.12);
    decoGfx.strokeCircle(cx, 165, 90);

    // --- Floating particles ---
    this._particles = [];
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(20, W - 20);
      const y = Phaser.Math.Between(60, H - 40);
      const color = Math.random() > 0.5 ? COLORS.gold : COLORS.purple;
      const dot = this.add.graphics();
      dot.fillStyle(color, 0.6 + Math.random() * 0.4);
      dot.fillCircle(0, 0, 1.5 + Math.random() * 1.5);
      dot.setPosition(x, y);
      this._particles.push(dot);

      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(60, 140),
        alpha: 0,
        duration: 2000 + Math.random() * 3000,
        delay: Math.random() * 2000,
        ease: 'Sine.easeIn',
        repeat: -1,
        onRepeat: () => {
          dot.setPosition(Phaser.Math.Between(20, W - 20), H - 20);
          dot.setAlpha(0.6 + Math.random() * 0.4);
        }
      });
    }

    // --- Title ---
    this.add.text(cx, 165, MENU.title, TEXT_STYLES.title)
      .setOrigin(0.5);

    // --- Subtitle ---
    this.add.text(cx, 235, MENU.subtitle, TEXT_STYLES.subtitle)
      .setOrigin(0.5);

    // --- Gold divider ---
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, COLORS.gold, 0.5);
    divGfx.lineBetween(cx - 120, 256, cx + 120, 256);

    // --- Tagline ---
    this.add.text(cx, 275, MENU.tagline, TEXT_STYLES.caption)
      .setOrigin(0.5);

    // --- Start button ---
    const btnW = 260, btnH = 58;
    const btnX = cx - btnW / 2;
    const btnY = 330;

    const btnGfx = this.add.graphics();
    drawButton(btnGfx, btnX, btnY, btnW, btnH, false);

    const btnLabel = this.add.text(cx, btnY + btnH / 2, MENU.startButton, TEXT_STYLES.button)
      .setOrigin(0.5);

    const btnHit = this.add.rectangle(cx, btnY + btnH / 2, btnW, btnH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on('pointerover', () => {
      btnGfx.clear();
      drawButton(btnGfx, btnX, btnY, btnW, btnH, true);
      btnLabel.setStyle({ ...TEXT_STYLES.button, color: COLORS.goldCSS });
    });
    btnHit.on('pointerout', () => {
      btnGfx.clear();
      drawButton(btnGfx, btnX, btnY, btnW, btnH, false);
      btnLabel.setStyle({ ...TEXT_STYLES.button, color: '#ffffff' });
    });
    btnHit.on('pointerdown', () => {
      this.scene.start('CharacterScene');
    });

    // --- Sprint-1 Prototyp-Button ---
    const protoW = 220, protoH = 38;
    const protoX = cx - protoW / 2;
    const protoY = btnY + btnH + 18;

    const protoGfx = this.add.graphics();
    protoGfx.fillStyle(0x0a0520, 0.92).fillRoundedRect(protoX, protoY, protoW, protoH, 4);
    protoGfx.lineStyle(1, 0x6B4F5C, 0.9).strokeRoundedRect(protoX, protoY, protoW, protoH, 4);

    const protoLabel = this.add.text(cx, protoY + protoH / 2, '▶ PROTOTYP: SKALDENLIED', {
      fontFamily: "'Cinzel', serif", fontSize: '12px',
      color: '#C9C4D1', fontStyle: 'bold', letterSpacing: 2,
    }).setOrigin(0.5);

    const protoHit = this.add.rectangle(cx, protoY + protoH / 2, protoW, protoH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    protoHit.on('pointerover', () => {
      protoGfx.clear();
      protoGfx.fillStyle(0x1a0a33, 0.95).fillRoundedRect(protoX, protoY, protoW, protoH, 4);
      protoGfx.lineStyle(1, 0xC9A961, 1).strokeRoundedRect(protoX, protoY, protoW, protoH, 4);
      protoLabel.setColor('#FFD66B');
    });
    protoHit.on('pointerout', () => {
      protoGfx.clear();
      protoGfx.fillStyle(0x0a0520, 0.92).fillRoundedRect(protoX, protoY, protoW, protoH, 4);
      protoGfx.lineStyle(1, 0x6B4F5C, 0.9).strokeRoundedRect(protoX, protoY, protoW, protoH, 4);
      protoLabel.setColor('#C9C4D1');
    });
    protoHit.on('pointerdown', () => {
      this.scene.start('BragiIntroScene');
    });

    this.add.text(cx, protoY + protoH + 8, 'Sprint 1 — Hook-Test', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: '#5a4a6a',
    }).setOrigin(0.5);

    // --- Version bottom-left ---
    this.add.text(12, H - 16, MENU.version, TEXT_STYLES.tiny)
      .setOrigin(0, 1);

    // --- URL bottom-right ---
    this.add.text(W - 12, H - 16, 'hauke-gg.github.io/yggdrasil-descent', TEXT_STYLES.tiny)
      .setOrigin(1, 1);
  }
}
