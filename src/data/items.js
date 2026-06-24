/**
 * Floor pickups — small chance drops from enemies.
 * Each item draws a simple icon procedurally so we don't need sprites.
 */

export const ITEM_TYPES = {
  hp_potion: {
    id: 'hp_potion',
    color: 0xFF4466,
    rarity: 'common',
    label: '+20 HP',
    icon: 'flask',
  },
  xp_burst: {
    id: 'xp_burst',
    color: 0x66CCFF,
    rarity: 'common',
    label: '+10 XP',
    icon: 'star',
  },
  magnet: {
    id: 'magnet',
    color: 0xFFD66B,
    rarity: 'uncommon',
    label: 'Alle Orbs einsaugen',
    icon: 'magnet',
  },
};

/** Returns an item type id (or null if no drop). */
export function rollItemDrop() {
  const r = Math.random();
  if (r < 0.04) return 'hp_potion';
  if (r < 0.07) return 'xp_burst';
  if (r < 0.085) return 'magnet';
  return null;
}

/** Returns an item type id for boss death (always drops something good). */
export function bossItemDrop() {
  const pool = ['hp_potion', 'xp_burst', 'magnet'];
  return pool[Math.floor(Math.random() * pool.length)];
}
