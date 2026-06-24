/**
 * Level-up Boon catalog — Vampire-Survivors-style "pick 3" reward after each level.
 *
 * Each boon mutates the per-run state object the scene tracks. They stack
 * additively so the run can spiral upward.
 */

export const LEVELUP_BOONS = [
  // ─── Tier 1 — early, frequent ────────────────────────────────────────────
  {
    id: 'iron_skin',
    name: 'Eisenhaut',
    desc: '+20 Max-HP. Heilt sofort um diese Menge.',
    tier: 1,
    apply: (s) => { s.maxHpBonus += 20; s.healOnApply = (s.healOnApply || 0) + 20; },
  },
  {
    id: 'fury',
    name: 'Berserker-Wut',
    desc: '+15% Schaden auf alle Verse.',
    tier: 1,
    apply: (s) => { s.dmgMult *= 1.15; },
  },
  {
    id: 'wolf_step',
    name: 'Wolfs-Fuß',
    desc: '+10% Bewegungsgeschwindigkeit.',
    tier: 1,
    apply: (s) => { s.spdMult *= 1.10; },
  },
  {
    id: 'galdr_pull',
    name: 'Galdr-Anziehung',
    desc: '+60% XP-Magnet-Radius.',
    tier: 1,
    apply: (s) => { s.magnetMult += 0.6; },
  },
  {
    id: 'verse_echo',
    name: 'Echo der Verse',
    desc: '−15% auf alle Vers-Cooldowns.',
    tier: 1,
    apply: (s) => { s.cdMult *= 0.85; },
  },
  {
    id: 'crit_eye',
    name: 'Hökers Auge',
    desc: '+10% Crit-Chance.',
    tier: 1,
    apply: (s) => { s.critBonus = (s.critBonus || 0) + 0.10; },
  },
  {
    id: 'xp_doubler',
    name: 'Skaldenlied-Gier',
    desc: '+25% XP pro Gegner.',
    tier: 1,
    apply: (s) => { s.xpMult *= 1.25; },
  },
  // ─── Tier 2 — bigger swings, available from level 5+ ────────────────────
  {
    id: 'storm_son',
    name: 'Sturmsohn',
    desc: '+30% Schaden, −10% Max-HP.',
    tier: 2,
    apply: (s) => { s.dmgMult *= 1.30; s.maxHpMult *= 0.90; },
  },
  {
    id: 'blood_pact',
    name: 'Blutpakt',
    desc: 'Bei jedem Kill: +1 HP heilen.',
    tier: 2,
    apply: (s) => { s.healOnKill = (s.healOnKill || 0) + 1; },
  },
  {
    id: 'frozen_heart',
    name: 'Gefrorenes Herz',
    desc: 'Crit heilt 5 HP.',
    tier: 2,
    apply: (s) => { s.healOnCrit = (s.healOnCrit || 0) + 5; },
  },
  {
    id: 'thunder_step',
    name: 'Donnerschritt',
    desc: 'Skalden-Wirbel: halber Cooldown, doppelter Schaden.',
    tier: 2,
    apply: (s) => { s.swirlCdMult *= 0.5; s.swirlDmgMult *= 2; },
  },
  {
    id: 'twin_song',
    name: 'Zwillingslied',
    desc: 'Aktive Verse feuern doppelt (Echo-Cast).',
    tier: 2,
    apply: (s) => { s.doubleCast = true; },
  },
  {
    id: 'combo_master',
    name: 'Combo-Meister',
    desc: 'Combo-Cap 3.0 → 4.5. Decay 2× langsamer.',
    tier: 2,
    apply: (s) => { s.comboCap = 4.5; s.comboDecayMult *= 0.5; },
  },
];

/**
 * Pick 3 random boons appropriate for the given player level.
 * T1 only for the first 4 levels, then mix in T2 at increasing rate.
 */
export function rollLevelupChoice(playerLevel) {
  const allowT2 = playerLevel >= 5;
  const pool = LEVELUP_BOONS.filter(b => allowT2 || b.tier === 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

/**
 * XP needed to reach `targetLevel` from the start of the run.
 * Mildly exponential so the first few levels feel snappy.
 */
export function xpToLevel(targetLevel) {
  return Math.floor(10 * Math.pow(1.45, targetLevel - 1));
}
