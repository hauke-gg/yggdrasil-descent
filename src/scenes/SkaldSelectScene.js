/**
 * SkaldSelectScene — choose your Bragi-apprentice before each run.
 *
 * Three card layout: Hákon / Sólveig / Brandr. Each card shows the
 * Higgsfield portrait, name, epithet, trauma, stat profile.
 *
 * Spec: docs/vision-skaldenlied.md → "Wer du wirst, bevor du steigst"
 */

import { CSS_COLORS } from '../data/design-system.js';
import { SKALDS } from '../data/skalds.js';
import { makeBlackTransparent } from '../utils/SpritePostprocess.js';

export default class SkaldSelectScene extends Phaser.Scene {
  constructor() { super('SkaldSelectScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Background: dark void with subtle dust particles
    this.add.graphics().fillStyle(0x06000F, 1).fillRect(0, 0, W, H).setDepth(-2);

    // Header
    this.add.text(W / 2, 50, 'WER STIRBT HEUTE?', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '28px',
      color: '#FFD66B', fontStyle: 'bold', letterSpacing: 6,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    this.add.text(W / 2, 86, 'Drei Stimmen warten in Bragis Brunnen.', {
      fontFamily: "'Lora', serif", fontStyle: 'italic',
      fontSize: '14px', color: '#a89888',
    }).setOrigin(0.5).setDepth(10);

    // Three cards — scale to viewport
    const cardGap = 16;
    const availableW = W - 60;
    const cardW = Math.min(280, Math.floor((availableW - 2 * cardGap) / 3));
    const cardH = Math.min(460, Math.max(360, H - 160));
    const totalW = 3 * cardW + 2 * cardGap;
    const startX = W / 2 - totalW / 2 + cardW / 2;
    const cardY = H / 2 + Math.max(20, (H - cardH - 120) / 2);

    const order = ['hakon', 'solveig', 'brandr'];
    this._cards = [];
    order.forEach((id, i) => {
      const cx = startX + i * (cardW + cardGap);
      this._cards.push(this._createCard(SKALDS[id], cx, cardY, cardW, cardH));
    });

    // Footer instructions
    const onTouch = (typeof window !== 'undefined') &&
      (('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);
    this.add.text(W / 2, H - 14, onTouch
      ? 'Tippe eine Karte zum Wählen'
      : 'Klick wählt   ·   ESC verlässt den Brunnen', {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: '#5a4a6a', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(10);

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  _createCard(skald, cx, cy, w, h) {
    const rx = cx - w / 2, ry = cy - h / 2;

    // Card frame
    const frame = this.add.graphics().setDepth(2);
    frame.fillStyle(0x0E0A18, 0.95).fillRoundedRect(rx, ry, w, h, 10);
    frame.lineStyle(2, 0x4a3a5e, 0.85).strokeRoundedRect(rx, ry, w, h, 10);

    // Dark backdrop behind portrait (normalises Sólveig's transparent PNG)
    const backdrop = this.add.graphics().setDepth(2.5);
    backdrop.fillStyle(0x06000F, 1)
      .fillRoundedRect(rx + 16, ry + 16, w - 32, w - 32, 6);

    // Portrait — Higgsfield JPG, strip black background
    let portrait = null;
    if (this.textures.exists(skald.portrait)) {
      const cleanKey = makeBlackTransparent(this, skald.portrait);
      portrait = this.add.image(cx, ry + 130, cleanKey)
        .setDisplaySize(w - 32, w - 32)
        .setDepth(3);
      // Multiply blend mode darkens any white edges (helps PNGs with white bg)
      portrait.setBlendMode(Phaser.BlendModes.NORMAL);
      // Gold border around portrait
      const border = this.add.graphics().setDepth(4);
      border.lineStyle(1, 0xC9A961, 0.4)
        .strokeRoundedRect(rx + 16, ry + 16, w - 32, w - 32, 6);
    }

    // Anchors derived from card dimensions so it scales cleanly
    const portraitBottom = ry + 16 + (w - 32); // square portrait
    const nameY = portraitBottom + 14;
    const epithetY = nameY + 20;
    const dividerY = epithetY + 16;
    const traumaY = dividerY + 10;
    // Reserve a clear band for stats at the bottom
    const statsLineH = 26;
    const statsY = ry + h - 14;
    const statsTop = statsY - statsLineH;

    // Name
    const name = this.add.text(cx, nameY, skald.name, {
      fontFamily: "'Cinzel', serif", fontSize: '16px',
      color: '#FFD66B', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(5);

    // Epithet
    const epithet = this.add.text(cx, epithetY, skald.epithet, {
      fontFamily: "'Lora', serif", fontSize: '11px', fontStyle: 'italic',
      color: '#a89888',
    }).setOrigin(0.5).setDepth(5);

    // Divider
    const div = this.add.graphics().setDepth(5);
    div.lineStyle(1, 0xC9A961, 0.4)
      .lineBetween(rx + 30, dividerY, rx + w - 30, dividerY);

    // Trauma — limit to 4 lines, ellipsis if longer
    const trauma = this.add.text(cx, traumaY, skald.trauma, {
      fontFamily: "'Lora', serif", fontSize: '10.5px',
      color: '#cdb8a8', align: 'center',
      wordWrap: { width: w - 30 }, lineSpacing: 3,
      maxLines: 4,
    }).setOrigin(0.5, 0).setDepth(5);

    // Stats line — measure trauma's actual height and anchor stats safely below
    const traumaBottom = traumaY + trauma.height;
    const minStatsY = Math.max(statsY, traumaBottom + 14);
    const stats = this.add.text(cx, minStatsY, skald.statLabel, {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: CSS_COLORS.purpleLight, letterSpacing: 1, align: 'center',
      wordWrap: { width: w - 20 }, lineSpacing: 2,
    }).setOrigin(0.5, 0).setDepth(5);

    // Interactive overlay
    const hit = this.add.rectangle(cx, cy, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    hit.on('pointerover', () => {
      frame.clear();
      frame.fillStyle(0x1A0F2A, 0.95).fillRoundedRect(rx, ry, w, h, 10);
      frame.lineStyle(3, 0xFFD66B, 0.95).strokeRoundedRect(rx, ry, w, h, 10);
      this.tweens.add({ targets: [portrait, name].filter(Boolean),
        scale: 1.02, duration: 160 });
    });
    hit.on('pointerout', () => {
      frame.clear();
      frame.fillStyle(0x0E0A18, 0.95).fillRoundedRect(rx, ry, w, h, 10);
      frame.lineStyle(2, 0x4a3a5e, 0.85).strokeRoundedRect(rx, ry, w, h, 10);
      this.tweens.add({ targets: [portrait, name].filter(Boolean),
        scale: 1.0, duration: 160 });
    });
    hit.on('pointerdown', () => {
      this.registry.set('selectedSkald', skald.id);
      this._fadeAndStart();
    });

    return { frame, portrait, name, epithet, trauma, stats, hit };
  }

  _fadeAndStart() {
    const W = this.scale.width, H = this.scale.height;
    const out = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(300);
    this.tweens.add({
      targets: out, fillAlpha: 1, duration: 600,
      onComplete: () => this.scene.start('VerseComposerScene'),
    });
  }

}
