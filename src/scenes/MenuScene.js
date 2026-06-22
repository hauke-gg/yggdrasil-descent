export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cx = W / 2, cy = H / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x08010f);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x330066, 0.15);
    for (let x = 0; x <= W; x += 48) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 48) bg.lineBetween(0, y, W, y);

    if (this.textures.exists('menu_bg')) {
      this.add.image(480, 270, 'menu_bg').setDisplaySize(960, 540).setDepth(-1);
    }

    const deco = this.add.graphics();
    deco.lineStyle(1, 0x6633aa, 0.2);
    deco.strokeCircle(cx, cy, 200);
    deco.lineStyle(1, 0x6633aa, 0.12);
    deco.strokeCircle(cx, cy, 245);
    deco.lineStyle(2, 0x9944ee, 0.15);
    deco.strokeCircle(cx, cy, 160);
    deco.lineStyle(1, 0x441188, 0.3);
    deco.lineBetween(cx, cy - 185, cx, cy + 185);
    deco.lineBetween(cx - 185, cy, cx + 185, cy);

    this.tweens.add({
      targets: deco,
      alpha: { from: 0.6, to: 1 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const particles = [];
    for (let i = 0; i < 12; i++) {
      const px = Phaser.Math.Between(60, W - 60);
      const py = Phaser.Math.Between(60, H - 60);
      const color = Math.random() > 0.5 ? 0xd4af37 : 0x9944ee;
      const dot = this.add.circle(px, py, Phaser.Math.Between(2, 4), color, Phaser.Math.FloatBetween(0.3, 0.6));
      particles.push(dot);
      this.tweens.add({
        targets: dot,
        y: dot.y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 5500),
        ease: 'Sine.easeIn',
        delay: Phaser.Math.Between(0, 2000),
        onComplete: () => {
          dot.y = Phaser.Math.Between(H - 60, H - 20);
          dot.alpha = Phaser.Math.FloatBetween(0.3, 0.6);
          this.tweens.add({
            targets: dot,
            y: dot.y - Phaser.Math.Between(30, 80),
            alpha: 0,
            duration: Phaser.Math.Between(3000, 5500),
            ease: 'Sine.easeIn',
            repeat: -1,
            repeatDelay: Phaser.Math.Between(0, 2000)
          });
        }
      });
    }

    this.add.text(cx, cy - 96, 'YGGDRASIL', {
      fontSize: '64px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'serif',
      stroke: '#441100', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 30, fill: true }
    }).setOrigin(0.5);

    this.add.text(cx, cy - 36, 'D E S C E N T', {
      fontSize: '24px', color: '#cc9922', fontStyle: 'bold', fontFamily: 'serif',
      letterSpacing: 14
    }).setOrigin(0.5);

    const line = this.add.graphics();
    line.lineStyle(1, 0xd4af37, 0.5);
    line.lineBetween(cx - 170, cy - 14, cx + 170, cy - 14);

    this.add.text(cx, cy + 8, 'Ein nordisches Roguelite', {
      fontSize: '13px', color: '#775533', fontFamily: 'serif'
    }).setOrigin(0.5);

    const btnCx = cx, btnCy = cy + 68;
    const btnW = 260, btnH = 52;
    const btnGfx = this.add.graphics();
    const drawBtn = (hover) => {
      btnGfx.clear();
      btnGfx.fillStyle(hover ? 0x5a0099 : 0x2a0050, hover ? 1 : 0.95);
      btnGfx.fillRoundedRect(btnCx - btnW / 2, btnCy - btnH / 2, btnW, btnH, 8);
      btnGfx.lineStyle(2, 0xd4af37);
      btnGfx.strokeRoundedRect(btnCx - btnW / 2, btnCy - btnH / 2, btnW, btnH, 8);
    };
    drawBtn(false);

    const btnT = this.add.text(btnCx, btnCy, '▶  ABENTEUER BEGINNEN', {
      fontSize: '17px', color: '#d4af37', fontStyle: 'bold', fontFamily: 'sans-serif'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(btnCx - btnW / 2, btnCy - btnH / 2, btnW, btnH), hitAreaCallback: Phaser.Geom.Rectangle.Contains });

    btnT.on('pointerover', () => { drawBtn(true); btnT.setStyle({ color: '#ffffff' }); });
    btnT.on('pointerout', () => { drawBtn(false); btnT.setStyle({ color: '#d4af37' }); });
    btnT.on('pointerdown', () => this.scene.start('CharacterScene'));

    this.add.text(20, H - 14, 'v0.1.0 Alpha', {
      fontSize: '10px', color: '#332244', fontFamily: 'monospace'
    }).setOrigin(0, 1);

    this.add.text(W - 20, H - 14, 'hauke-gg.github.io', {
      fontSize: '10px', color: '#332244', fontFamily: 'monospace'
    }).setOrigin(1, 1);
  }
}
