import { getScaledEnemy } from '../data/enemies.js';

export default class WaveSystem {
  getEnemyStats(enemyId, scaleFactor = 1) {
    return getScaledEnemy(enemyId, scaleFactor);
  }
}
