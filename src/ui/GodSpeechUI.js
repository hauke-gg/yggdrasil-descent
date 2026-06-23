import { COLORS, CSS_COLORS, TEXT_STYLES, drawPanel } from '../data/design-system.js';
import { GOD_SPEECHES } from '../data/copy.js';

const GOD_PORTRAIT_COLORS = {
  ODIN:  { fill: 0x221155, accent: 0x8888ff, symbol: 'O' },
  THOR:  { fill: 0x332200, accent: 0xffdd44, symbol: 'T' },
  FREYA: { fill: 0x330022, accent: 0xff88cc, symbol: 'F' },
  LOKI:  { fill: 0x001122, accent: 0x44ff99, symbol: 'L' },
};

export default class GodSpeechUI {
  constructor(scene) {
    this.scene = scene;
    this._objects = [];
    this._dismissed = false;
    this._autoDismissTimer = null;
    this._showId = 0;
  }

  show(onDismiss) {
    this.hide();
    this._dismissed = false;
    const showId = ++this._showId;

    const gods = Object.keys(GOD_SPEECHES);
    const god  = gods[Math.floor(Math.random() * gods.length)];
    const speeches = GOD_SPEECHES[god];
    const speech = speeches[Math.floor(Math.random() * speeches.length)];

    const W = 960, H = 540;
    const cx = W / 2, cy = H / 2;

    // ── Dark overlay ──────────────────────────────────────────
    const overlay = this.scene.add.rectangle(cx, cy, W, H, 0x000000, 0.7)
      .setDepth(90).setScrollFactor(0).setInteractive();
    this._objects.push(overlay);

    // ── Main panel ───────────────────────────────────────────
    // Hades-style: wide, bottom-aligned, with colored border
    const panelW = 780, panelH = 195;
    const panelX = cx - panelW / 2;
    const panelY = cy + 30;          // slightly below center

    const godColors = GOD_PORTRAIT_COLORS[speech.speaker] || GOD_PORTRAIT_COLORS.ODIN;
    const accentHex = parseInt(speech.color.replace('#', ''), 16);

    const panelGfx = this.scene.add.graphics().setDepth(91).setScrollFactor(0);
    panelGfx.fillStyle(0x06000f, 0.97);
    panelGfx.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    // Colored border
    panelGfx.lineStyle(2, accentHex, 0.9);
    panelGfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);
    // Top accent bar
    panelGfx.fillStyle(accentHex, 0.3);
    panelGfx.fillRoundedRect(panelX + 2, panelY + 2, panelW - 4, 6, { tl: 8, tr: 8, bl: 0, br: 0 });
    this._objects.push(panelGfx);

    // ── God portrait (left column) ───────────────────────────
    const portraitCX = panelX + 90;
    const portraitCY = panelY + panelH / 2 + 2;
    const portraitR  = 52;

    const portraitGfx = this.scene.add.graphics().setDepth(92).setScrollFactor(0);
    // Outer glow ring
    portraitGfx.lineStyle(3, accentHex, 0.25);
    portraitGfx.strokeCircle(portraitCX, portraitCY, portraitR + 8);
    // Portrait circle fill
    portraitGfx.fillStyle(godColors.fill, 1);
    portraitGfx.fillCircle(portraitCX, portraitCY, portraitR);
    portraitGfx.lineStyle(2, accentHex, 0.85);
    portraitGfx.strokeCircle(portraitCX, portraitCY, portraitR);
    // Inner rune cross
    portraitGfx.lineStyle(1, accentHex, 0.45);
    portraitGfx.lineBetween(portraitCX - portraitR + 8, portraitCY, portraitCX + portraitR - 8, portraitCY);
    portraitGfx.lineBetween(portraitCX, portraitCY - portraitR + 8, portraitCX, portraitCY + portraitR - 8);
    this._objects.push(portraitGfx);

    // God initial letter
    const portraitLetter = this.scene.add.text(portraitCX, portraitCY, godColors.symbol, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: '36px', color: speech.color,
      shadow: { blur: 12, color: speech.color, fill: true }
    }).setOrigin(0.5).setDepth(93).setScrollFactor(0).setAlpha(0);
    this._objects.push(portraitLetter);

    // Divider line between portrait and text
    const divX = panelX + 165;
    const divGfx = this.scene.add.graphics().setDepth(92).setScrollFactor(0);
    divGfx.lineStyle(1, accentHex, 0.3);
    divGfx.lineBetween(divX, panelY + 14, divX, panelY + panelH - 14);
    this._objects.push(divGfx);

    // ── Text column (right) ──────────────────────────────────
    const textX  = panelX + 185;
    const textW  = panelW - 195;
    const textCX = textX + textW / 2;

    // God name header
    const nameT = this.scene.add.text(textX, panelY + 18,
      `— ${speech.speaker} —`,
      { fontFamily: "'Cinzel', serif", fontSize: '13px',
        color: speech.color, letterSpacing: 5,
        stroke: '#000000', strokeThickness: 2 }
    ).setDepth(93).setScrollFactor(0).setAlpha(0);
    this._objects.push(nameT);

    // Thin accent underline
    const underGfx = this.scene.add.graphics().setDepth(92).setScrollFactor(0);
    underGfx.lineStyle(1, accentHex, 0.5);
    underGfx.lineBetween(textX, panelY + 38, textX + 220, panelY + 38);
    this._objects.push(underGfx);

    // Speech text — joined lines
    const speechT = this.scene.add.text(textX, panelY + 48,
      speech.lines.join('\n'),
      { fontFamily: "'Lora', serif", fontSize: '16px',
        color: '#f0eee8', fontStyle: 'italic',
        wordWrap: { width: textW - 10 },
        lineSpacing: 6,
        stroke: '#000000', strokeThickness: 2 }
    ).setDepth(93).setScrollFactor(0).setAlpha(0);
    this._objects.push(speechT);

    // Choice text — below speech, with breathing room
    const speechH = speechT.height;
    const choiceY = Math.max(panelY + 118, panelY + 54 + speechH + 8);
    const choiceT = this.scene.add.text(textX, choiceY,
      speech.choice,
      { fontFamily: "'Lora', serif", fontSize: '12px',
        color: CSS_COLORS.ash, fontStyle: 'italic',
        wordWrap: { width: textW - 10 } }
    ).setDepth(93).setScrollFactor(0).setAlpha(0);
    this._objects.push(choiceT);

    // "Tap to continue" hint — pinned to panel bottom
    const hintT = this.scene.add.text(panelX + panelW - 14, panelY + panelH - 12,
      '[ Tippe zum Fortfahren ]',
      { fontFamily: "'Space Mono', monospace", fontSize: '10px',
        color: CSS_COLORS.ash }
    ).setOrigin(1, 1).setDepth(93).setScrollFactor(0).setAlpha(0);
    this._objects.push(hintT);

    // ── Staggered fade-in (native RAF — Phaser tweens broken in 3.70 context) ──
    panelGfx.setAlpha(0);
    portraitGfx.setAlpha(0);
    divGfx.setAlpha(0);
    underGfx.setAlpha(0);

    const rafFade = (targets, fromA, toA, duration, delay, onDone) => {
      const objs = Array.isArray(targets) ? targets : [targets];
      setTimeout(() => {
        if (this._showId !== showId) return;
        const start = Date.now();
        const step = 16;
        const iv = setInterval(() => {
          if (this._showId !== showId) { clearInterval(iv); return; }
          const p = Math.min(1, (Date.now() - start) / duration);
          const a = fromA + (toA - fromA) * p;
          objs.forEach(o => o && !o.destroyed && o.setAlpha(a));
          if (p >= 1) { clearInterval(iv); if (onDone) onDone(); }
        }, step);
      }, delay);
    };

    rafFade(panelGfx,      0, 1, 280,  50);
    rafFade(portraitGfx,   0, 1, 280, 100);
    rafFade([divGfx, underGfx], 0, 1, 250, 150);
    rafFade(portraitLetter, 0, 1, 300, 200);
    rafFade(nameT,          0, 1, 250, 250);
    rafFade(speechT,        0, 1, 400, 380);
    rafFade(choiceT,        0, 1, 300, 700);
    rafFade(hintT,          0, 1, 250, 1000);

    // ── Dismiss ──────────────────────────────────────────────
    const dismiss = () => {
      if (this._showId !== showId || this._dismissed) return;
      this._dismissed = true;
      overlay.removeInteractive();
      rafFade(this._objects.filter(Boolean), 1, 0, 220, 0, () => {
        this._objects.forEach(o => o && o.destroy());
        this._objects = [];
        if (onDismiss) onDismiss();
      });
    };

    // 400ms grace period prevents accidental dismiss from input that triggered show()
    setTimeout(() => {
      if (this._showId !== showId) return;
      overlay.once('pointerdown', dismiss);
    }, 400);
    this._autoDismissTimer = setTimeout(() => dismiss(), 6000);
  }

  hide() {
    clearTimeout(this._autoDismissTimer);
    this._autoDismissTimer = null;
    this._showId++;
    this._objects.forEach(o => o && o.destroy());
    this._objects = [];
    this._dismissed = true;
  }

  destroy() {
    this.hide();
  }
}
