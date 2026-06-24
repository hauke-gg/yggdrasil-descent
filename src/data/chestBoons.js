/**
 * Tier-3 boons — only available from chests dropped by bosses.
 * These are run-defining picks.
 */

export const CHEST_BOONS = [
  {
    id: 'wolf_pack',
    name: 'Fenrirs Rudel',
    desc: 'Bei jedem Kill: 25% Chance auf einen zweiten zufälligen Vers-Cast.',
    apply: (s) => { s.echoCastChance = (s.echoCastChance || 0) + 0.25; },
  },
  {
    id: 'mimirs_well',
    name: 'Mímirs Brunnen',
    desc: '+1 Max-Level-Boon pro Level-Up (wähle 2 statt 1).',
    apply: (s) => { s.doubleLevelupPick = true; },
  },
  {
    id: 'odin_eye',
    name: 'Odins Auge',
    desc: '+20% Crit-Chance. Crits heilen 8 HP.',
    apply: (s) => {
      s.critBonus = (s.critBonus || 0) + 0.20;
      s.healOnCrit = (s.healOnCrit || 0) + 8;
    },
  },
  {
    id: 'jormungandr',
    name: 'Jörmungandrs Biss',
    desc: '+60% Schaden. −30% Cooldown.',
    apply: (s) => {
      s.dmgMult *= 1.6;
      s.cdMult *= 0.7;
    },
  },
  {
    id: 'valkyrie_call',
    name: 'Walküren-Ruf',
    desc: 'XP-Magnet-Radius ×3. Gefallene Gegner heilen 1 HP.',
    apply: (s) => {
      s.magnetMult += 2;
      s.healOnKill = (s.healOnKill || 0) + 1;
    },
  },
  {
    id: 'ragnarok_pact',
    name: 'Ragnarök-Pakt',
    desc: '+100% Schaden. Du verlierst 50% Max-HP. Skalden-Wirbel-CD halbiert.',
    apply: (s) => {
      s.dmgMult *= 2;
      s.maxHpMult *= 0.5;
      s.swirlCdMult *= 0.5;
    },
  },
];

/** Roll 3 random chest boons, no duplicates. */
export function rollChestChoice() {
  const pool = CHEST_BOONS.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
