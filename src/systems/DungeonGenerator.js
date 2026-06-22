// Generiert ein einfaches Floor-Layout: ein großer Haupt-Raum + Spawn-Punkte am Rand
export default class DungeonGenerator {
  generate(scene) {
    const floors = [];
    for (let f = 1; f <= 5; f++) {
      floors.push(this._generateFloor(f));
    }
    return { floors };
  }

  _generateFloor(floorNumber) {
    // Phase 1: Ein einziger großer Kampf-Raum (einfaches MVP-Layout)
    const room = { x: 60, y: 60, w: 840, h: 420 };

    // Spawn-Punkte: Ecken und Kanten des Raums
    const spawnPoints = [
      { x: room.x + 30, y: room.y + 30 },
      { x: room.x + room.w - 30, y: room.y + 30 },
      { x: room.x + 30, y: room.y + room.h - 30 },
      { x: room.x + room.w - 30, y: room.y + room.h - 30 },
      { x: room.x + room.w / 2, y: room.y + 10 },
      { x: room.x + room.w / 2, y: room.y + room.h - 10 }
    ];

    // Ausgang: unten mitte (erscheint nach letzter Welle)
    const exitPoint = { x: 480, y: room.y + room.h - 20 };

    return { floorNumber, rooms: [room], spawnPoints, exitPoint };
  }

  // Zeichnet Floor-Layout in eine Phaser-Scene
  drawFloor(scene, floorData) {
    const container = scene.add.container(0, 0).setDepth(0);
    const gfx = scene.add.graphics();

    // Boden
    gfx.fillStyle(0x1a0a2e);
    gfx.fillRect(0, 0, 960, 540);

    // Raum
    gfx.fillStyle(0x2d1b4e);
    const r = floorData.rooms[0];
    gfx.fillRect(r.x, r.y, r.w, r.h);

    // Wände
    gfx.lineStyle(3, 0x8844cc);
    gfx.strokeRect(r.x, r.y, r.w, r.h);

    // Floor-Nummer anzeigen
    const txt = scene.add.text(10, 10, `Floor ${floorData.floorNumber} — Midgard`, {
      fontSize: '16px', color: '#aaaaaa', fontFamily: 'sans-serif'
    }).setDepth(20);

    container.add([gfx, txt]);
    return container;
  }
}
