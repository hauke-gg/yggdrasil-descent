/**
 * BragiIntroScene — the 3-Sätze-Opening before each Skaldenlied run.
 *
 * Shows the Higgsfield-painted Bragi tableau, types the opening lines one
 * after the other, fades in a "Steig hinab" call-to-action. Audio: ambient
 * drone fades in.
 *
 * Spec: docs/vision-skaldenlied.md, Story → Das Opening.
 */

import { CSS_COLORS } from '../data/design-system.js';
import { audio } from '../audio/AudioBus.js';

const LINES = [
  'Du bist gestorben, bevor du wusstest, dass du lebst.',
  'Die Wurzeln haben dich gehalten, weil sie dich noch brauchen — nicht weil du es wert wärst.',
  'Steig hinab. Drei Götter haben dich gewählt. Einer hat dich verkauft.',
];

export default class BragiIntroScene extends Phaser.Scene {
  constructor() { super('BragiIntroScene'); }

  preload() {
    if (!this.textures.exists('bragi_intro_bg')) {
      this.load.image('bragi_intro_bg', 'assets/bragi-intro.png');
    }
  }

  create() {
    audio.unlock();
    audio.startAmbientDrone();

    const W = this.scale.width, H = this.scale.height;

    // If the player has already seen the intro at least once,
    // skip the whole sequence and jump straight to the skald-pick.
    let introSeen = false;
    try { introSeen = localStorage.getItem('ygg_intro_seen') === '1'; } catch {}
    if (introSeen) {
      this.scene.start('SkaldSelectScene');
      return;
    }

    // Black under-layer
    this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, W, H);

    // The Bragi tableau — covers full viewport, fades from black
    let bg;
    if (this.textures.exists('bragi_intro_bg')) {
      bg = this.add.image(W / 2, H / 2, 'bragi_intro_bg')
        .setDisplaySize(W, H * 1.05)
        .setAlpha(0);
      this.tweens.add({ targets: bg, alpha: 0.85, duration: 2200, ease: 'Cubic.easeOut' });
    } else {
      bg = this.add.graphics();
      bg.fillStyle(0x0E0A18, 1).fillRect(0, 0, W, H);
    }

    // Vignette
    const vig = this.add.graphics().setDepth(5);
    const cx = W / 2, cy = H / 2;
    const maxR = Math.hypot(cx, cy);
    for (let r = maxR; r > maxR * 0.4; r -= 10) {
      const t = (r - maxR * 0.4) / (maxR - maxR * 0.4);
      vig.fillStyle(0x000000, t * 0.06).fillCircle(cx, cy, r);
    }

    // Top: small kennel
    const kenning = this.add.text(W / 2, 64, '— DAS LIED DES BRAGI —', {
      fontFamily: "'Cinzel', serif", fontSize: '12px',
      color: '#7a7080', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: kenning, alpha: 1, duration: 1200, delay: 400 });

    // Stack the three lines vertically, lower third of screen
    this._lineTexts = [];
    LINES.forEach((line, i) => {
      const lineY = H * 0.58 + i * 56;
      const t = this.add.text(W / 2, lineY, '', {
        fontFamily: "'Cinzel', serif",
        fontSize: i === 2 ? '20px' : '17px',
        color: i === 2 ? CSS_COLORS.goldLight : '#e8dcc0',
        align: 'center', fontStyle: i === 2 ? 'bold' : 'normal',
        wordWrap: { width: W * 0.78 },
        lineSpacing: 6, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(20);
      this._lineTexts.push({ obj: t, full: line });
    });

    // Begin typewriter cascade
    this._typeLine(0, 2400);

    // CTA at the bottom — touch-aware
    const onTouch = (typeof window !== 'undefined') &&
      (('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);
    this._cta = this.add.text(W / 2, H * 0.92,
      onTouch ? 'Tippen — Steige hinab' : '↵ ENTER — Steige hinab', {
      fontFamily: "'Cinzel', serif", fontSize: '14px',
      color: CSS_COLORS.goldLight, letterSpacing: 3,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this._ctaHint = this.add.text(W / 2, H * 0.96,
      onTouch ? '' : 'oder klicke', {
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: '#5a4a6a',
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    // Allow skip — ENTER or Click anytime starts the run
    this._proceed = () => this._goToSkaldenlied();
    this.input.keyboard.on('keydown-ENTER', this._proceed);
    this.input.keyboard.on('keydown-SPACE', this._proceed);
    this.input.on('pointerdown', this._proceed);
    this.input.keyboard.on('keydown-ESC', () => {
      audio.stopAmbientDrone();
      this.scene.start('MenuScene');
    });
  }

  _typeLine(idx, delayUntilStart) {
    if (idx >= this._lineTexts.length) {
      // All lines written — show CTA
      this.tweens.add({ targets: [this._cta, this._ctaHint], alpha: 1, duration: 900, delay: 600 });
      this.tweens.add({
        targets: this._cta,
        scale: { from: 1, to: 1.06 },
        duration: 1400,
        delay: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return;
    }
    const entry = this._lineTexts[idx];
    let cursor = 0;
    this.time.delayedCall(delayUntilStart, () => {
      const timer = this.time.addEvent({
        delay: 32,
        repeat: entry.full.length - 1,
        callback: () => {
          cursor++;
          entry.obj.setText(entry.full.slice(0, cursor));
        },
      });
      // When done with this line, kick off next
      this.time.delayedCall(entry.full.length * 32 + 700, () => {
        this._typeLine(idx + 1, 200);
      });
    });
  }

  _goToSkaldenlied() {
    if (this._proceeding) return;
    this._proceeding = true;
    // Quick fade out → skald select
    const W = this.scale.width, H = this.scale.height;
    const out = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(300);
    this.tweens.add({
      targets: out, fillAlpha: 1, duration: 700,
      onComplete: () => this.scene.start('SkaldSelectScene'),
    });
  }

  shutdown() {
    // Don't stop ambient — SkaldenliedScene takes over the same audio bus
    this.input.keyboard.off('keydown-ENTER', this._proceed);
    this.input.keyboard.off('keydown-SPACE', this._proceed);
    this.input.off('pointerdown', this._proceed);
  }
}
