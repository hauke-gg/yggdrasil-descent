export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this._makePlayer();
    this._makeDraugr();
    this._makeJotunn();
    this._makeFenrir();
    this._makeProjectile();
    this._makeXpOrb();
    this.scene.start('MenuScene');
  }

  _makePlayer() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 24, cy = 24, r = 18;

    // Äußerer Glow-Ring
    g.lineStyle(3, 0x6699ff, 0.3);
    g.strokeCircle(cx, cy, r + 6);

    // Körper: achteckige Ritter-Form
    g.fillStyle(0x2255cc);
    g.fillCircle(cx, cy, r);

    // Innerer Glanz
    g.fillStyle(0x4488ff);
    g.fillCircle(cx, cy, r - 4);

    // Rune-Kreuz
    g.fillStyle(0xaaccff);
    g.fillRect(cx - 2, cy - 10, 4, 20);
    g.fillRect(cx - 10, cy - 2, 20, 4);

    // Highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(cx - 4, cy - 6, 5);

    g.generateTexture('player', 48, 48);
    g.destroy();
  }

  _makeDraugr() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 18, cy = 18;

    // Glow
    g.fillStyle(0x660000, 0.4);
    g.fillCircle(cx, cy, 16);

    // Körper: Dreieck (aggressiv)
    g.fillStyle(0xcc2222);
    g.fillTriangle(cx, 4, cx + 14, cy + 12, cx - 14, cy + 12);

    // Innerer Kern
    g.fillStyle(0xff4444);
    g.fillTriangle(cx, 8, cx + 9, cy + 10, cx - 9, cy + 10);

    // Augen (zwei rote Punkte)
    g.fillStyle(0xff9900);
    g.fillCircle(cx - 4, cy, 2);
    g.fillCircle(cx + 4, cy, 2);

    g.generateTexture('enemy_draugr', 36, 36);
    g.destroy();
  }

  _makeJotunn() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 28, cy = 28;

    // Glow
    g.fillStyle(0x440022, 0.5);
    g.fillCircle(cx, cy, 26);

    // Körper: massives Sechseck
    const hex = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      hex.push({ x: cx + Math.cos(a) * 20, y: cy + Math.sin(a) * 20 });
    }
    g.fillStyle(0x881133);
    g.fillPoints(hex, true);

    // Inneres Sechseck
    const hex2 = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      hex2.push({ x: cx + Math.cos(a) * 13, y: cy + Math.sin(a) * 13 });
    }
    g.fillStyle(0xcc2255);
    g.fillPoints(hex2, true);

    // Augen
    g.fillStyle(0xff6600);
    g.fillCircle(cx - 6, cy - 2, 3);
    g.fillCircle(cx + 6, cy - 2, 3);

    g.generateTexture('enemy_jotunn', 56, 56);
    g.destroy();
  }

  _makeFenrir() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = 40, cy = 40;

    // Äußerer Glow (orange/rot)
    g.fillStyle(0x441100, 0.6);
    g.fillCircle(cx, cy, 38);

    // Stacheln (Wolf-Silhouette angedeutet)
    g.fillStyle(0xff6600);
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      const x1 = cx + Math.cos(a) * 28;
      const y1 = cy + Math.sin(a) * 28;
      const x2 = cx + Math.cos(a + 0.2) * 36;
      const y2 = cy + Math.sin(a + 0.2) * 36;
      const x3 = cx + Math.cos(a - 0.2) * 36;
      const y3 = cy + Math.sin(a - 0.2) * 36;
      g.fillTriangle(x1, y1, x2, y2, x3, y3);
    }

    // Körper
    g.fillStyle(0xdd4400);
    g.fillCircle(cx, cy, 26);

    // Fell-Textur (Ringe)
    g.lineStyle(2, 0xff8800, 0.6);
    g.strokeCircle(cx, cy, 18);
    g.lineStyle(2, 0xff8800, 0.3);
    g.strokeCircle(cx, cy, 10);

    // Augen
    g.fillStyle(0xffff00);
    g.fillCircle(cx - 8, cy - 4, 5);
    g.fillCircle(cx + 8, cy - 4, 5);
    g.fillStyle(0xff0000);
    g.fillCircle(cx - 8, cy - 4, 2);
    g.fillCircle(cx + 8, cy - 4, 2);

    g.generateTexture('boss_fenrir', 80, 80);
    g.destroy();
  }

  _makeProjectile() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Rune-Orb: heller Kern + Glow
    g.fillStyle(0x4466ff, 0.3);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0x88aaff, 0.7);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(8, 8, 3);

    g.generateTexture('projectile', 16, 16);
    g.destroy();
  }

  _makeXpOrb() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // XP-Kristall (Vampire Survivors-Stil)
    g.fillStyle(0x00ff88, 0.4);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0x00ffaa);
    g.fillCircle(6, 6, 4);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(4, 4, 2);

    g.generateTexture('xp_orb', 12, 12);
    g.destroy();
  }
}
