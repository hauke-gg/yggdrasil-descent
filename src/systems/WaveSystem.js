import { getScaledEnemy } from '../data/enemies.js';

// Gibt die Spawn-Anweisungen für eine Welle zurück.
// Jede Anweisung: { enemyId, count, delayBetween (ms) }
export default class WaveSystem {
  constructor(floor) {
    this.floor = floor;
    this.waveNumber = 0;
    this.maxWaves = floor === 5 ? 1 : 3; // Floor 5 = Boss-Floor (nur 1 Trigger-Welle)
  }

  // Gibt Array von { enemyId, count, delayBetween } für aktuelle Welle zurück
  getNextWave() {
    this.waveNumber++;
    return this._buildWave(this.floor, this.waveNumber);
  }

  hasMoreWaves() {
    return this.waveNumber < this.maxWaves;
  }

  isBossFloor() {
    return this.floor === 5;
  }

  _buildWave(floor, waveNum) {
    // Basis: mehr Feinde pro Welle und Floor
    const baseCount = 4 + (floor - 1) * 2 + (waveNum - 1) * 2;

    if (floor <= 2) {
      return [{ enemyId: 'draugr', count: baseCount, delayBetween: 400 }];
    }
    if (floor <= 4) {
      return [
        { enemyId: 'draugr', count: Math.floor(baseCount * 0.7), delayBetween: 350 },
        { enemyId: 'jotunn', count: Math.floor(baseCount * 0.3), delayBetween: 600 }
      ];
    }
    // Floor 5: Boss-Trigger (Boss wird separat gespawnt)
    return [{ enemyId: 'fenrir_wolf', count: 4, delayBetween: 300 }];
  }

  // Gibt skalierten Feind-Stat-Block zurück (für Entity-Erstellung)
  getEnemyStats(enemyId) {
    return getScaledEnemy(enemyId, this.floor);
  }
}
