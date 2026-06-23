import { COLORS, CSS_COLORS, TEXT_STYLES } from '../data/design-system.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    this._createTopStrip();
    this._createXpBar();
  }

  _createTopStrip() {
    const s = this.scene;
    const W = s.scale.width;
    this._W = W;

    // Full-width dark panel at top
    const panel = s.add.graphics().setDepth(50).setScrollFactor(0);
    panel.fillStyle(0x000000, 0.72);
    panel.fillRect(0, 0, W, 44);
    panel.lineStyle(1, COLORS.purpleDim, 0.6);
    panel.lineBetween(0, 44, W, 44);

    // ── HP section (left) ──────────────────────────────────────
    s.add.text(10, 14, 'HP', {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: '#cc4444', fontStyle: 'bold'
    }).setDepth(53).setScrollFactor(0);

    this._hpBg = s.add.graphics().setDepth(51).setScrollFactor(0);
    this._hpBg.fillStyle(0x1a0000, 1);
    this._hpBg.fillRoundedRect(30, 10, 280, 22, 5);
    this._hpBg.lineStyle(1, 0x441111, 1);
    this._hpBg.strokeRoundedRect(30, 10, 280, 22, 5);

    this._hpFill = s.add.graphics().setDepth(52).setScrollFactor(0);

    this._hpText = s.add.text(170, 21, '100 / 100', {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#ffffff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(54).setScrollFactor(0);

    this._levelText = s.add.text(10, 32, 'LV 1', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: CSS_COLORS.purple
    }).setDepth(53).setScrollFactor(0);

    // ── Timer (center) ────────────────────────────────────────
    this._timerText = s.add.text(W / 2, 22, '00:00', {
      fontFamily: "'Cinzel', serif", fontSize: '20px',
      color: CSS_COLORS.gold, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 8, fill: true }
    }).setOrigin(0.5, 0.5).setDepth(54).setScrollFactor(0);

    // ── Kills + biome (right) ─────────────────────────────────
    this._killText = s.add.text(W - 10, 13, '0 Gefallen', {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#ffaaaa'
    }).setOrigin(1, 0.5).setDepth(53).setScrollFactor(0);

    this._biomeText = s.add.text(W - 10, 31, 'Midgard', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: CSS_COLORS.midgard
    }).setOrigin(1, 0.5).setDepth(53).setScrollFactor(0);
  }

  _createXpBar() {
    const s = this.scene;
    const W = this._W;
    const H = s.scale.height;
    this._H = H;

    this._xpBg = s.add.graphics().setDepth(50).setScrollFactor(0);
    this._xpBg.fillStyle(0x001133, 0.9);
    this._xpBg.fillRect(0, H - 7, W, 7);
    this._xpBg.lineStyle(1, COLORS.purpleDim, 0.4);
    this._xpBg.lineBetween(0, H - 7, W, H - 7);

    this._xpFill = s.add.graphics().setDepth(51).setScrollFactor(0);
  }

  update(player, survivalSeconds, biomeName) {
    const W = this._W || 960;
    const H = this._H || 540;

    // ── HP bar ──────────────────────────────────────────────
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    this._hpFill.clear();

    const barW = Math.max(0, 278 * hpRatio);
    if (barW > 0) {
      const hpColor = hpRatio > 0.55 ? 0xdd2222 : hpRatio > 0.25 ? 0xff7700 : 0xff1111;
      this._hpFill.fillStyle(hpColor, 1);
      this._hpFill.fillRoundedRect(31, 11, barW, 20, 4);
      this._hpFill.fillStyle(0xffffff, 0.18);
      this._hpFill.fillRoundedRect(31, 11, barW, 7, 3);
    }
    this._hpText.setText(`${player.hp} / ${player.maxHp}`);
    this._levelText.setText(`LV ${player.level}`);
    this._killText.setText(`${player.kills} Gefallen`);

    // ── XP bar ──────────────────────────────────────────────
    const xpRatio = Math.min(1, player.xp / player.xpToNext);
    this._xpFill.clear();
    if (xpRatio > 0) {
      this._xpFill.fillStyle(COLORS.frost, 1);
      this._xpFill.fillRect(0, H - 6, W * xpRatio, 5);
      this._xpFill.fillStyle(0xaaeeff, 0.35);
      this._xpFill.fillRect(0, H - 6, W * xpRatio, 2);
    }

    // ── Timer ───────────────────────────────────────────────
    if (survivalSeconds !== undefined) {
      const mins = Math.floor(survivalSeconds / 60).toString().padStart(2, '0');
      const secs = (survivalSeconds % 60).toString().padStart(2, '0');
      this._timerText.setText(`${mins}:${secs}`);
    }

    // ── Biome ───────────────────────────────────────────────
    if (biomeName !== undefined) {
      const col = biomeName.includes('jöt') || biomeName.includes('Jöt')
        ? CSS_COLORS.frost
        : biomeName.includes('Hel')
          ? CSS_COLORS.ember
          : CSS_COLORS.midgard;
      this._biomeText.setText(biomeName).setStyle({
        fontFamily: "'Space Mono', monospace", fontSize: '9px', color: col
      });
    }
  }

  destroy() {
    [this._hpBg, this._hpFill, this._hpText, this._levelText,
     this._timerText, this._killText, this._biomeText,
     this._xpBg, this._xpFill
    ].forEach(o => o && o.destroy());
  }
}
