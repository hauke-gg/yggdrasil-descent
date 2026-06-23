/**
 * VerseComposerScene — compose your three-verse song before descending.
 *
 * Library at the top (9 cards), three slots at the bottom. Click a library
 * card to assign it to the next empty slot. Click a slot to remove it.
 * When all three slots are filled, "STEIG HINAB" button activates.
 *
 * Spec: docs/vision-skaldenlied.md → Pfeiler 1 (Skaldenlied)
 */

import { CSS_COLORS } from '../data/design-system.js';
import { VERSE_LIBRARY, buildVerses, composeVerse } from '../data/verses.js';

export default class VerseComposerScene extends Phaser.Scene {
  constructor() { super('VerseComposerScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Dark background
    this.add.graphics().fillStyle(0x06000F, 1).fillRect(0, 0, W, H).setDepth(-2);

    // Dynamic layout — fit everything in the viewport
    // Allocations as % of H:
    //  header band     0   – 8%
    //  library 3×3     9   – 53%
    //  divider         54%
    //  "DEIN LIED"     56%
    //  slots           58% – 76%
    //  STEIG HINAB     80% – 90%
    //  footer hint     95%

    const headerY = Math.max(28, H * 0.045);
    const subHeadY = headerY + 28;

    this.add.text(W / 2, headerY, 'KOMPONIERE DEIN LIED', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '22px',
      color: '#FFD66B', fontStyle: 'bold', letterSpacing: 5,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);

    this.add.text(W / 2, subHeadY, 'Drei Verse. Drei Trigger. Eine Geschichte, die du selbst erfindest.', {
      fontFamily: "'Lora', serif", fontStyle: 'italic',
      fontSize: '12px', color: '#a89888',
    }).setOrigin(0.5).setDepth(10);

    // Library cards — 3×3 grid sized to fit allocation band
    this._chosenIds = [];
    this._libraryCards = [];
    const cols = 3, rows = Math.ceil(VERSE_LIBRARY.length / cols);
    const lgap = 8;
    const libTop = H * 0.09;
    const libBottom = H * 0.53;
    const libBandH = libBottom - libTop;
    const availW = W - 36;
    const lw = Math.min(240, Math.floor((availW - (cols - 1) * lgap) / cols));
    const lh = Math.min(95, Math.floor((libBandH - (rows - 1) * lgap) / rows));
    const gridW = cols * lw + (cols - 1) * lgap;
    const startX = W / 2 - gridW / 2 + lw / 2;
    const startY = libTop + lh / 2;
    VERSE_LIBRARY.forEach((lib, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (lw + lgap);
      const cy = startY + row * (lh + lgap);
      this._libraryCards.push(this._createLibraryCard(lib, cx, cy, lw, lh));
    });

    // Divider + "DEIN LIED" header
    const dividerY = H * 0.54;
    const div = this.add.graphics().setDepth(2);
    div.lineStyle(1, 0xC9A961, 0.4)
      .lineBetween(W * 0.15, dividerY, W * 0.85, dividerY);
    this.add.text(W / 2, H * 0.565, '— DEIN LIED —', {
      fontFamily: "'Cinzel', serif", fontSize: '13px',
      color: '#FFD66B', fontStyle: 'bold', letterSpacing: 4,
    }).setOrigin(0.5).setDepth(10);

    // Three slots — fit allocation 58–76%
    const sgap = 14;
    const sAvailW = W - 60;
    const sw = Math.min(280, Math.floor((sAvailW - 2 * sgap) / 3));
    const sh = Math.min(64, Math.floor((H * 0.76 - H * 0.58) - 6));
    const slotsW = 3 * sw + 2 * sgap;
    const slotStartX = W / 2 - slotsW / 2 + sw / 2;
    const slotY = H * 0.67;
    this._slots = [];
    for (let i = 0; i < 3; i++) {
      const cx = slotStartX + i * (sw + sgap);
      this._slots.push(this._createSlot(i, cx, slotY, sw, sh));
    }

    // "Steig hinab" button — always at fixed bottom band
    const btnW = Math.min(280, W * 0.4), btnH = 46;
    const btnX = W / 2, btnY = H * 0.86;
    this._descendBg = this.add.graphics().setDepth(5);
    this._descendLabel = this.add.text(btnX, btnY, 'STEIG HINAB', {
      fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: '18px',
      color: '#5a4a6a', fontStyle: 'bold', letterSpacing: 6,
    }).setOrigin(0.5).setDepth(6);
    this._descendHit = this.add.rectangle(btnX, btnY, btnW, btnH, 0x000000, 0)
      .setDepth(7);
    this._descendBtnX = btnX - btnW / 2;
    this._descendBtnY = btnY - btnH / 2;
    this._descendBtnW = btnW;
    this._descendBtnH = btnH;
    this._refreshDescendButton();

    this._descendHit.on('pointerover', () => this._refreshDescendButton(true));
    this._descendHit.on('pointerout', () => this._refreshDescendButton(false));
    this._descendHit.on('pointerdown', () => {
      if (this._chosenIds.length === 3) this._descend();
    });

    // ESC back / Touch back
    const onTouch = (typeof window !== 'undefined') &&
      (('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);
    const backLabel = onTouch ? '← zurück' : 'ESC — zurück';
    const backText = this.add.text(20, H - 16, backLabel, {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#7a7080',
    }).setOrigin(0, 1).setDepth(10);
    if (onTouch) {
      backText.setInteractive({ useHandCursor: true });
      backText.on('pointerdown', () => this.scene.start('SkaldSelectScene'));
    }
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('SkaldSelectScene'));
  }

  _createLibraryCard(lib, cx, cy, w, h) {
    const rx = cx - w / 2, ry = cy - h / 2;
    const composed = composeVerse(lib.triggerId, lib.verbId, lib.objectId);
    const stabColor = composed.synergy ? 0xFFD66B : 0xcc88ff;
    const stabCss = composed.synergy ? '#FFD66B' : '#cc88ff';

    const bg = this.add.graphics().setDepth(2);
    const drawBg = (active = false) => {
      bg.clear();
      bg.fillStyle(active ? 0x1A0F2A : 0x0E0A18, 0.95)
        .fillRoundedRect(rx, ry, w, h, 6);
      bg.lineStyle(active ? 2 : 1, active ? 0xFFD66B : 0x4a3a5e, active ? 0.95 : 0.75)
        .strokeRoundedRect(rx, ry, w, h, 6);
    };
    drawBg();

    // Synergy gold star (top-left) if all-stab match
    if (composed.synergy) {
      this.add.text(rx + 8, ry + 6, '✦', {
        fontFamily: "'Cinzel', serif", fontSize: '14px',
        color: '#FFD66B', fontStyle: 'bold',
      }).setOrigin(0, 0).setDepth(3);
    }

    // Name
    const name = this.add.text(cx, ry + 14, lib.name, {
      fontFamily: "'Cinzel', serif", fontSize: '13px',
      color: stabCss, fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(3);

    // Description
    const desc = this.add.text(cx, ry + 38, lib.description, {
      fontFamily: "'Lora', serif", fontSize: '10px',
      color: '#cdb8a8', align: 'center',
      wordWrap: { width: w - 20 }, lineSpacing: 2,
    }).setOrigin(0.5, 0).setDepth(3);

    const hit = this.add.rectangle(cx, cy, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);
    hit.on('pointerover', () => drawBg(true));
    hit.on('pointerout', () => drawBg(false));
    hit.on('pointerdown', () => this._chooseLibrary(lib));

    return { lib, bg, name, desc, hit, composed };
  }

  _createSlot(idx, cx, cy, w, h) {
    const rx = cx - w / 2, ry = cy - h / 2;
    const bg = this.add.graphics().setDepth(2);
    const content = this.add.text(cx, cy, `Slot ${idx + 1} — leer`, {
      fontFamily: "'Space Mono', monospace", fontSize: '11px',
      color: '#5a4a6a',
    }).setOrigin(0.5).setDepth(3);
    const hit = this.add.rectangle(cx, cy, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    const draw = (filled = false) => {
      bg.clear();
      bg.fillStyle(filled ? 0x1A0F2A : 0x0A0612, 0.9)
        .fillRoundedRect(rx, ry, w, h, 8);
      bg.lineStyle(filled ? 2 : 1, filled ? 0xC9A961 : 0x3a2040,
                  filled ? 0.85 : 0.7)
        .strokeRoundedRect(rx, ry, w, h, 8);
    };
    draw();

    hit.on('pointerdown', () => this._removeSlot(idx));

    return { idx, cx, cy, w, h, bg, content, hit, draw };
  }

  _chooseLibrary(lib) {
    if (this._chosenIds.length >= 3) return;
    if (this._chosenIds.includes(lib.id)) return;
    this._chosenIds.push(lib.id);
    this._refreshSlots();
    this._refreshDescendButton();
  }

  _removeSlot(idx) {
    if (idx >= this._chosenIds.length) return;
    this._chosenIds.splice(idx, 1);
    this._refreshSlots();
    this._refreshDescendButton();
  }

  _refreshSlots() {
    this._slots.forEach((slot, i) => {
      const id = this._chosenIds[i];
      if (id) {
        const lib = VERSE_LIBRARY.find(v => v.id === id);
        const composed = composeVerse(lib.triggerId, lib.verbId, lib.objectId);
        const css = composed.synergy ? '#FFD66B' : '#e8dcc0';
        slot.content.setText(`${i + 1}.  ${composed.text}`);
        slot.content.setStyle({
          fontFamily: "'Lora', serif", fontSize: '12px',
          color: css, align: 'center', fontStyle: 'italic',
          wordWrap: { width: slot.w - 20 },
        });
        slot.draw(true);
      } else {
        slot.content.setText(`Slot ${i + 1} — leer`);
        slot.content.setStyle({
          fontFamily: "'Space Mono', monospace", fontSize: '11px',
          color: '#5a4a6a',
        });
        slot.draw(false);
      }
    });
  }

  _refreshDescendButton(hover = false) {
    const ready = this._chosenIds.length === 3;
    this._descendBg.clear();
    const fill = ready ? (hover ? 0x6a3a18 : 0x4a2a10) : 0x1A1422;
    const lineColor = ready ? 0xFFD66B : 0x4a3a5e;
    this._descendBg.fillStyle(fill, 0.9)
      .fillRoundedRect(this._descendBtnX, this._descendBtnY,
                       this._descendBtnW, this._descendBtnH, 8);
    this._descendBg.lineStyle(2, lineColor, ready ? 0.95 : 0.5)
      .strokeRoundedRect(this._descendBtnX, this._descendBtnY,
                         this._descendBtnW, this._descendBtnH, 8);
    this._descendLabel.setColor(ready ? (hover ? '#fff' : '#FFD66B') : '#5a4a6a');
    if (ready) {
      this._descendHit.setInteractive({ useHandCursor: true });
    } else {
      this._descendHit.disableInteractive();
    }
  }

  _descend() {
    this.registry.set('chosenVerseIds', this._chosenIds.slice());
    const W = this.scale.width, H = this.scale.height;
    const out = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(300);
    this.tweens.add({
      targets: out, fillAlpha: 1, duration: 600,
      onComplete: () => this.scene.start('SkaldenliedScene'),
    });
  }
}
