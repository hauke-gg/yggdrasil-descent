import { COLORS, CSS_COLORS, TEXT_STYLES, drawPanel, drawPanelGold } from '../data/design-system.js';
import { WEAPONS, PASSIVES } from '../data/weapons.js';
import { LEVEL_UP } from '../data/copy.js';

export default class LevelUpUI {
  constructor(scene) {
    this.scene = scene;
    this._objects = [];
  }

  show(options, onChoice) {
    this.hide();
    this.scene.physics.pause();

    const W = 960, H = 540;
    const cx = W / 2, cy = H / 2;

    // ── Overlay — MUST setScrollFactor(0) ──────────────────
    const overlay = this.scene.add.rectangle(cx, cy, W, H, 0x000000, 0.84)
      .setDepth(100).setScrollFactor(0);
    this._objects.push(overlay);

    // Decorative gold border lines
    const decoGfx = this.scene.add.graphics().setDepth(101).setScrollFactor(0);
    decoGfx.lineStyle(1, COLORS.gold, 0.35);
    decoGfx.lineBetween(cx - 320, cy - 158, cx + 320, cy - 158);
    decoGfx.lineBetween(cx - 320, cy + 130, cx + 320, cy + 130);
    // Corner accents
    decoGfx.lineStyle(2, COLORS.gold, 0.5);
    decoGfx.lineBetween(cx - 320, cy - 158, cx - 300, cy - 158);
    decoGfx.lineBetween(cx - 320, cy + 130, cx - 300, cy + 130);
    decoGfx.lineBetween(cx + 300, cy - 158, cx + 320, cy - 158);
    decoGfx.lineBetween(cx + 300, cy + 130, cx + 320, cy + 130);
    this._objects.push(decoGfx);

    // Title
    const title = this.scene.add.text(cx, cy - 170, LEVEL_UP.title, {
      ...TEXT_STYLES.heading, fontSize: '24px'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    this._objects.push(title);

    // Subtitle
    const subtitle = this.scene.add.text(cx, cy - 142, LEVEL_UP.subtitle, {
      ...TEXT_STYLES.caption, fontSize: '11px'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    this._objects.push(subtitle);

    // Hint
    const hint = this.scene.add.text(cx, cy + 144, LEVEL_UP.chooseHint, {
      ...TEXT_STYLES.tiny, color: CSS_COLORS.ash
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    this._objects.push(hint);

    // ── Cards ──────────────────────────────────────────────
    const cardW = 228, cardH = 196;
    const gap   = 18;
    const totalW = options.length * cardW + (options.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    options.forEach((option, i) => {
      const cardX = startX + i * (cardW + gap);
      const info  = this._getOptionInfo(option);
      const rx    = cardX - cardW / 2;
      const ry    = cy - cardH / 2 + 2;

      // Card background graphics
      const cardBg = this.scene.add.graphics().setDepth(101).setScrollFactor(0);
      this._objects.push(cardBg);

      const drawCard = (hover) => {
        cardBg.clear();
        if (hover) drawPanelGold(cardBg, rx, ry, cardW, cardH);
        else       drawPanel(cardBg, rx, ry, cardW, cardH);
        // Icon zone at top of card
        cardBg.fillStyle(hover ? COLORS.purpleDark : 0x0a0520, 0.9);
        cardBg.fillRoundedRect(rx + 8, ry + 8, cardW - 16, 58, 6);
        if (hover) {
          cardBg.lineStyle(1, COLORS.gold, 0.45);
          cardBg.strokeRoundedRect(rx + 8, ry + 8, cardW - 16, 58, 6);
        }
        // Horizontal divider
        cardBg.lineStyle(1, hover ? COLORS.gold : COLORS.purpleDim, 0.5);
        cardBg.lineBetween(rx + 16, ry + 74, rx + cardW - 16, ry + 74);
      };
      drawCard(false);

      // Icon
      const iconT = this.scene.add.text(cardX, ry + 37, info.icon, {
        fontFamily: "'Cinzel', serif", fontSize: '26px',
        color: CSS_COLORS.gold,
        shadow: { blur: 8, color: CSS_COLORS.gold, fill: true }
      }).setOrigin(0.5).setDepth(102).setScrollFactor(0);

      // Type label (corner badge)
      const typeLabel = { weapon: 'WAFFE', passive: 'PASSIV', upgrade: 'AUFWERTEN' }[option.type] || '';
      const typeColor = option.type === 'passive' ? CSS_COLORS.frost
                       : option.type === 'upgrade' ? CSS_COLORS.ember
                       : CSS_COLORS.goldDim;
      const typeT = this.scene.add.text(rx + cardW - 10, ry + 10, typeLabel, {
        fontFamily: "'Space Mono', monospace", fontSize: '9px', color: typeColor
      }).setOrigin(1, 0).setDepth(102).setScrollFactor(0);

      // Name
      const nameT = this.scene.add.text(cardX, ry + 84, info.name, {
        ...TEXT_STYLES.cardTitle, wordWrap: { width: cardW - 24 }, align: 'center'
      }).setOrigin(0.5, 0).setDepth(102).setScrollFactor(0);

      // Description
      const descT = this.scene.add.text(cardX, ry + 108, info.description, {
        fontFamily: "'Lora', serif", fontSize: '12px',
        color: '#cccac0', wordWrap: { width: cardW - 26 }, align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5, 0).setDepth(102).setScrollFactor(0);

      this._objects.push(iconT, typeT, nameT, descT);

      // Hit area
      const hit = this.scene.add.rectangle(cardX, cy + 2, cardW, cardH, 0x000000, 0)
        .setInteractive({ useHandCursor: true }).setDepth(103).setScrollFactor(0);
      this._objects.push(hit);

      hit.on('pointerover', () => drawCard(true));
      hit.on('pointerout',  () => drawCard(false));
      hit.on('pointerdown', () => { this.hide(); onChoice(option); });
    });

    // Animate all objects in (setInterval — RAF doesn't run in background tabs)
    this._objects.forEach(o => o.setAlpha(0));
    const luObjs = this._objects;
    const luStart = Date.now();
    const luIv = setInterval(() => {
      const p = Math.min(1, (Date.now() - luStart) / 280);
      luObjs.forEach(o => o && !o.destroyed && o.setAlpha(p));
      if (p >= 1) clearInterval(luIv);
    }, 16);
  }

  _getOptionInfo(option) {
    if (option.type === 'weapon') {
      const w = WEAPONS[option.id];
      return {
        icon: '✦',
        name: w ? w.name : option.id,
        description: w ? w.description : ''
      };
    }
    if (option.type === 'passive') {
      const p = PASSIVES[option.id];
      return {
        icon: '◈',
        name: p ? p.name : option.id,
        description: p ? p.description : ''
      };
    }
    if (option.type === 'upgrade') {
      const w = WEAPONS[option.id];
      return {
        icon: '▲',
        name: `${w ? w.name : option.id} +1`,
        description: 'Stärke wächst. Ragnarök wartet noch.'
      };
    }
    return { icon: '?', name: option.id, description: '' };
  }

  hide() {
    this._objects.forEach(o => { if (o && o.destroy) o.destroy(); });
    this._objects = [];
    if (this.scene && this.scene.physics) this.scene.physics.resume();
  }
}
