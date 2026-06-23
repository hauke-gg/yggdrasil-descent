export const ENEMIES = {
  draugr: {
    id: 'draugr',
    name: 'Draugr',
    texture: 'enemy_draugr',
    hp: 40,
    speed: 90,
    damage: 8,
    xpReward: 15,
    scale: 1.0
  },
  jotunn: {
    id: 'jotunn',
    name: 'Jotunn',
    texture: 'enemy_jotunn',
    hp: 120,
    speed: 50,
    damage: 20,
    xpReward: 15,
    scale: 1.4
  },
  fenrir_wolf: {
    id: 'fenrir_wolf',
    name: 'Fenrir-Wolf',
    texture: 'enemy_fenrir_wolf',
    hp: 25,
    speed: 130,
    damage: 6,
    xpReward: 8,
    scale: 0.65
  }
};

export function getEnemy(id) {
  return ENEMIES[id] || null;
}

// Skaliert Feind-Stats mit Floor-Tiefe
export function getScaledEnemy(id, floor) {
  const base = getEnemy(id);
  if (!base) return null;
  const scale = 1 + (floor - 1) * 0.15;
  return {
    ...base,
    hp: Math.round(base.hp * scale),
    damage: Math.round(base.damage * scale)
  };
}
