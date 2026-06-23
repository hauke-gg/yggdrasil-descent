/**
 * Götter-Boons — Hades-style choice cards after the Draugr-King falls.
 *
 * Each boon is offered by ONE of the four gods. The god speaks a line from
 * the story bible (Pfeiler 2). Players pick 1 of 3 cards; the boon applies
 * for the rest of the run.
 */

export const GODS = {
  loki: {
    id: 'loki',
    name: 'LOKI',
    title: 'Der Schmerzensvater',
    portrait: 'god_loki_img',
    color: '#88EE66',
    monologue: 'Mein Sohn war ein Wolf. Mein Sohn war eine Schlange. Du wirst auch etwas verlieren — heute noch.',
  },
  odin: {
    id: 'odin',
    name: 'ODIN',
    title: 'Der Sammler',
    portrait: 'portrait_odin',
    color: '#FFD66B',
    monologue: 'Ich brauche dich nicht lebend, ich brauche dich brauchbar.',
  },
  thor: {
    id: 'thor',
    name: 'THOR',
    title: 'Der Bauer der Götter',
    portrait: 'portrait_thor',
    color: '#FF7744',
    monologue: 'Iss, Kleines. Du bist schmal geworden auf dem Weg nach unten.',
  },
  freya: {
    id: 'freya',
    name: 'FREYA',
    title: 'Die Halfwitwe',
    portrait: 'portrait_freya',
    color: '#FFAAEE',
    monologue: 'Ich nehme die, die lieben konnten, bevor sie töteten. Komm.',
  },
};

export const BOON_LIBRARY = [
  // Loki: stark, mit Kosten
  {
    id: 'loki_blade',
    god: 'loki',
    name: 'Klinge des Trickbetrugs',
    description: '+40% Schaden. Du verlierst 25% deiner Max-HP.',
    apply: (state) => {
      state.dmgMult *= 1.4;
      state.maxHpMult *= 0.75;
    },
  },
  {
    id: 'loki_speed',
    god: 'loki',
    name: 'Wolfssohn-Gangart',
    description: '+50% Bewegungsgeschwindigkeit. Jeder Kill kostet 2 HP.',
    apply: (state) => {
      state.spdMult *= 1.5;
      state.hpCostOnKill = (state.hpCostOnKill || 0) + 2;
    },
  },
  {
    id: 'loki_echo',
    god: 'loki',
    name: 'Falsche Prophezeiung',
    description: 'Aktive Verse feuern zweimal hintereinander.',
    apply: (state) => {
      state.doubleCast = true;
    },
  },
  // Odin (auch verfügbar, einfache Stat-Boons)
  {
    id: 'odin_cd',
    god: 'odin',
    name: 'Walhall-Drill',
    description: '−30% auf alle Vers-Cooldowns.',
    apply: (state) => {
      state.cdMult *= 0.7;
    },
  },
  {
    id: 'odin_crit',
    god: 'odin',
    name: 'Auge des Sammlers',
    description: '+25% Crit-Chance.',
    apply: (state) => {
      state.critBonus = (state.critBonus || 0) + 0.25;
    },
  },
  // Thor
  {
    id: 'thor_korn',
    god: 'thor',
    name: 'Sifs Korn',
    description: '+50 Max-HP. Heile sofort um diese Menge.',
    apply: (state) => {
      state.maxHpBonus = (state.maxHpBonus || 0) + 50;
      state.healOnApply = (state.healOnApply || 0) + 50;
    },
  },
  {
    id: 'thor_donner',
    god: 'thor',
    name: 'Erster Donnerschlag',
    description: 'Skalden-Wirbel hat halben Cooldown und doppelten Schaden.',
    apply: (state) => {
      state.swirlCdMult *= 0.5;
      state.swirlDmgMult *= 2;
    },
  },
  // Freya
  {
    id: 'freya_combo',
    god: 'freya',
    name: 'Folkvang-Tanz',
    description: 'Combo decay 2× langsamer. Combo-Cap 4.5 statt 3.0.',
    apply: (state) => {
      state.comboDecayMult *= 0.5;
      state.comboCap = 4.5;
    },
  },
  {
    id: 'freya_heal',
    god: 'freya',
    name: 'Liebes-Tribut',
    description: 'Bei jedem Crit: heile 4 HP. Du vergisst einen Vers-Namen.',
    apply: (state) => {
      state.healOnCrit = (state.healOnCrit || 0) + 4;
      state.forgottenVerse = true;
    },
  },
];

/**
 * Pick 3 random boons for the choice. Prefers offering boons from a
 * specific god if `preferGod` is set; otherwise uniformly random.
 */
export function rollBoonChoice(preferGod = null) {
  const pool = preferGod
    ? BOON_LIBRARY.filter(b => b.god === preferGod)
    : BOON_LIBRARY.slice();
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
