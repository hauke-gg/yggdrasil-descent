export default class DungeonGenerator {
  generate(scene) {
    const floors = [];
    for (let f = 1; f <= 5; f++) {
      floors.push(this._generateFloor(f));
    }
    return { floors };
  }

  _generateFloor(floorNumber) {
    const room = { x: 40, y: 40, w: 880, h: 460 };

    const spawnPoints = [
      { x: room.x + 20, y: room.y + 20 },
      { x: room.x + room.w - 20, y: room.y + 20 },
      { x: room.x + 20, y: room.y + room.h - 20 },
      { x: room.x + room.w - 20, y: room.y + room.h - 20 },
      { x: room.x + room.w / 2, y: room.y + 10 },
      { x: room.x + room.w / 2, y: room.y + room.h - 10 },
      { x: room.x + 10, y: room.y + room.h / 2 },
      { x: room.x + room.w - 10, y: room.y + room.h / 2 }
    ];

    const exitPoint = { x: 480, y: room.y + room.h - 20 };
    return { floorNumber, rooms: [room], spawnPoints, exitPoint };
  }

  drawFloor(scene, floorData) {
    const container = scene.add.container(0, 0).setDepth(0);
    const gfx = scene.add.graphics();
    const r = floorData.rooms[0];
    const f = floorData.floorNumber;

    // Farbpalette je nach Welt
    const palette = this._getPalette(f);

    // Hintergrund
    gfx.fillStyle(palette.bg);
    gfx.fillRect(0, 0, 960, 540);

    // Tile-Gitter (Vampire Survivors-Stil)
    const tileSize = 48;
    gfx.lineStyle(1, palette.grid, 0.18);
    for (let x = r.x; x <= r.x + r.w; x += tileSize) {
      gfx.lineBetween(x, r.y, x, r.y + r.h);
    }
    for (let y = r.y; y <= r.y + r.h; y += tileSize) {
      gfx.lineBetween(r.x, y, r.x + r.w, y);
    }

    // Dunkel-Vignette (Ränder dunkler)
    gfx.fillStyle(0x000000, 0.45);
    gfx.fillRect(0, 0, 960, 40);
    gfx.fillRect(0, 500, 960, 40);
    gfx.fillRect(0, 0, 40, 540);
    gfx.fillRect(920, 0, 40, 540);

    // Wand-Rahmen
    gfx.lineStyle(4, palette.wall, 1);
    gfx.strokeRect(r.x, r.y, r.w, r.h);
    gfx.lineStyle(1, palette.wallInner, 0.4);
    gfx.strokeRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16);

    // Eckdekoration
    this._drawCorner(gfx, r.x, r.y, palette.wall);
    this._drawCorner(gfx, r.x + r.w, r.y, palette.wall);
    this._drawCorner(gfx, r.x, r.y + r.h, palette.wall);
    this._drawCorner(gfx, r.x + r.w, r.y + r.h, palette.wall);

    // Floor-Label (oben mittig, klein)
    const worldName = ['', 'Midgard', 'Midgard', 'Midgard', 'Midgard', 'Midgard — Fenrir'][Math.min(f, 5)];
    const txt = scene.add.text(480, 14, `Floor ${f}  ·  ${worldName}`, {
      fontSize: '13px',
      color: palette.textColor,
      fontFamily: 'monospace',
      alpha: 0.7
    }).setOrigin(0.5, 0).setDepth(20);

    container.add([gfx, txt]);
    return container;
  }

  _drawCorner(gfx, x, y, color) {
    const size = 12;
    gfx.lineStyle(3, color, 0.9);
    // kleine L-Winkel an jeder Ecke
    const sx = x === 40 ? 1 : -1;
    const sy = y === 40 ? 1 : -1;
    gfx.lineBetween(x, y, x + sx * size, y);
    gfx.lineBetween(x, y, x, y + sy * size);
  }

  _getPalette(floor) {
    // Alle Midgard-Floors in Phase 1
    return {
      bg: 0x08010f,
      grid: 0x6633aa,
      wall: 0x9944ee,
      wallInner: 0xcc88ff,
      textColor: '#9966cc'
    };
  }
}
