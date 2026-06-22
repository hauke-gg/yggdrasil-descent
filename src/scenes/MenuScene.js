export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    // Hintergrund-Raster (wie im Dungeon)
    const bg = this.add.graphics();
    bg.fillStyle(0x08010f);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x330066, 0.25);
    for (let x = 0; x <= W; x += 48) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) bg.lineBetween(0, y, W, y);

    // Vignette
    bg.fillStyle(0x000000, 0.5);
    bg.fillRect(0, 0, W, 60);
    bg.fillRect(0, H - 60, W, 60);

    // Dekorative Runen-Kreise (Hintergrund)
    const deco = this.add.graphics();
    deco.lineStyle(1, 0x6633aa, 0.2);
    deco.strokeCircle(cx, cy, 200);
    deco.lineStyle(1, 0x6633aa, 0.12);
    deco.strokeCircle(cx, cy, 240);
    deco.lineStyle(2, 0x9944ee, 0.15);
    deco.strokeCircle(cx, cy, 160);

    // Runen-Kreuz Hintergrund
    deco.lineStyle(1, 0x441188, 0.3);
    deco.lineBetween(cx, cy - 180, cx, cy + 180);
    deco.lineBetween(cx - 180, cy, cx + 180, cy);

    // Titel
    this.add.text(cx, cy - 90, 'YGGDRASIL', {
      fontSize: '52px',
      color: '#d4af37',
      fontStyle: 'bold',
      fontFamily: 'serif',
      stroke: '#441100',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 20, fill: true }
    }).setOrigin(0.5);

    this.add.text(cx, cy - 38, 'D E S C E N T', {
      fontSize: '22px',
      color: '#cc9922',
      fontStyle: 'bold',
      fontFamily: 'serif',
      letterSpacing: 12
    }).setOrigin(0.5);

    // Trennlinie
    const line = this.add.graphics();
    line.lineStyle(1, 0xd4af37, 0.5);
    line.lineBetween(cx - 160, cy - 18, cx + 160, cy - 18);

    this.add.text(cx, cy + 8, 'Ein nordisches Roguelite', {
      fontSize: '14px',
      color: '#886644',
      fontFamily: 'serif'
    }).setOrigin(0.5);

    // Start-Button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x4a0080, 0.9);
    btnBg.fillRoundedRect(cx - 110, cy + 42, 220, 50, 6);
    btnBg.lineStyle(2, 0x9944ee);
    btnBg.strokeRoundedRect(cx - 110, cy + 42, 220, 50, 6);

    const btn = this.add.text(cx, cy + 67, '▶   SPIEL STARTEN', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Hover-Effekt
    btn.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x7700cc, 0.95);
      btnBg.fillRoundedRect(cx - 110, cy + 42, 220, 50, 6);
      btnBg.lineStyle(2, 0xcc88ff);
      btnBg.strokeRoundedRect(cx - 110, cy + 42, 220, 50, 6);
      btn.setStyle({ color: '#ffdd88' });
    });
    btn.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x4a0080, 0.9);
      btnBg.fillRoundedRect(cx - 110, cy + 42, 220, 50, 6);
      btnBg.lineStyle(2, 0x9944ee);
      btnBg.strokeRoundedRect(cx - 110, cy + 42, 220, 50, 6);
      btn.setStyle({ color: '#ffffff' });
    });
    btn.on('pointerdown', () => this.scene.start('DungeonScene'));

    // Hinweis Touch
    this.add.text(cx, H - 16, 'Querformat · Touch-Steuerung', {
      fontSize: '11px', color: '#443355', fontFamily: 'monospace'
    }).setOrigin(0.5, 1);

    // Pulsierender Ring-Animation am Titel
    this.tweens.add({
      targets: deco,
      alpha: { from: 0.7, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
