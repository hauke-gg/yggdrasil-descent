/**
 * Skaldenlied — Vers-Module.
 *
 * Jeder Vers = (TRIGGER + VERB + OBJEKT) im Stabreim.
 * Synergie-Boost wenn alle drei Module den gleichen Stab-Buchstaben teilen.
 *
 * Spec: docs/vision-skaldenlied.md, Pfeiler 1.
 */

export const TRIGGERS = {
  onHit: {
    id: 'onHit',
    stab: 'W',
    text: 'Wenn Wolf weint',
    desc: 'Bei niedriger HP (<40%)',
    when: (state) => state.hp / state.maxHp < 0.4,
  },
  onTakeDamage: {
    id: 'onTakeDamage',
    stab: 'B',
    text: 'Bricht Bruder Bein',
    desc: 'Bei jedem Treffer den du nimmst',
  },
  onKill: {
    id: 'onKill',
    stab: 'F',
    text: 'Fällt Feind, fragt',
    desc: 'Wenn ein Gegner stirbt',
  },
  onRhythm: {
    id: 'onRhythm',
    stab: 'S',
    text: 'Schlägt Skalde Stein',
    desc: 'Auf den Schlag der Trommel (jede 0.57s)',
  },
  onSilence: {
    id: 'onSilence',
    stab: 'N',
    text: 'Nacht nährt Nichts',
    desc: 'Nach 3 Sekunden ohne Aktion',
  },
};

export const VERBS = {
  burst: {
    id: 'burst',
    stab: 'W',
    text: 'wirft Wind',
    desc: 'Projektil-Salve in 8 Richtungen',
  },
  bind: {
    id: 'bind',
    stab: 'B',
    text: 'bindet Blut',
    desc: 'Heilt 8 HP',
  },
  freeze: {
    id: 'freeze',
    stab: 'F',
    text: 'friert Feldwege',
    desc: 'Verlangsamt alle Gegner im Umkreis',
  },
  strike: {
    id: 'strike',
    stab: 'S',
    text: 'schickt Speerwurf',
    desc: 'Einzelner Hochschaden-Strahl',
  },
  nova: {
    id: 'nova',
    stab: 'N',
    text: 'nimmt Nacht',
    desc: 'AoE-Explosion um den Skalden',
  },
};

export const OBJECTS = {
  wounds: {
    id: 'wounds',
    stab: 'W',
    text: 'weiße Wunden',
    desc: '12 Schaden',
    damage: 12,
  },
  blood: {
    id: 'blood',
    stab: 'B',
    text: 'bittres Blut',
    desc: '+5 HP',
    heal: 5,
  },
  frost: {
    id: 'frost',
    stab: 'F',
    text: 'fahle Fesseln',
    desc: 'Frost-Debuff 2s',
    slow: 0.4,
    slowDur: 2000,
  },
  spear: {
    id: 'spear',
    stab: 'S',
    text: 'scharfe Splitter',
    desc: '24 Schaden',
    damage: 24,
  },
  silence: {
    id: 'silence',
    stab: 'N',
    text: 'namenlose Not',
    desc: '40 AoE-Schaden',
    damage: 40,
    radius: 140,
  },
};

/**
 * Compose a verse text from three module ids.
 */
export function composeVerse(triggerId, verbId, objectId) {
  const t = TRIGGERS[triggerId];
  const v = VERBS[verbId];
  const o = OBJECTS[objectId];
  if (!t || !v || !o) return '';
  const stabs = new Set([t.stab, v.stab, o.stab]);
  const synergy = stabs.size === 1; // alle drei stab-gleich
  return {
    text: `${t.text} / ${v.text} / ${o.text}.`,
    trigger: t,
    verb: v,
    object: o,
    synergy,
  };
}

/**
 * The full set of verse modules the composer can choose from.
 * Each has a stab letter for synergy detection.
 */
export const VERSE_LIBRARY = [
  {
    id: 'weinende',
    name: 'Die Weinende',
    triggerId: 'onHit',  verbId: 'freeze', objectId: 'frost',
    description: 'Bei niedriger HP: Frost-Aura verlangsamt alle Gegner.',
  },
  {
    id: 'sturm',
    name: 'Der Sturm',
    triggerId: 'onTakeDamage', verbId: 'burst', objectId: 'wounds',
    description: 'Bei jedem Treffer: 8 Geschosse in alle Richtungen.',
  },
  {
    id: 'jaeger',
    name: 'Der Jäger',
    triggerId: 'onKill', verbId: 'strike', objectId: 'spear',
    description: 'Bei jedem Kill: gezielter Speerwurf auf den nächsten Feind.',
  },
  {
    id: 'trommel',
    name: 'Die Trommel',
    triggerId: 'onRhythm', verbId: 'burst', objectId: 'wounds',
    description: 'Auf jeden Trommelschlag: kleine Wind-Salve.',
  },
  {
    id: 'klage',
    name: 'Die Klage',
    triggerId: 'onHit', verbId: 'bind', objectId: 'blood',
    description: 'Bei niedriger HP: heile dich um 5.',
  },
  {
    id: 'leere',
    name: 'Die Leere',
    triggerId: 'onSilence', verbId: 'nova', objectId: 'silence',
    description: 'Nach 3 Sek ohne Aktion: 40-Schaden-AoE um dich.',
  },
  {
    id: 'frost-tanz',
    name: 'Der Frost-Tanz',
    triggerId: 'onKill', verbId: 'freeze', objectId: 'frost',
    description: 'Bei jedem Kill: Frost-Aura friert nahe Gegner.',
  },
  {
    id: 'donner',
    name: 'Der Donner',
    triggerId: 'onRhythm', verbId: 'strike', objectId: 'spear',
    description: 'Auf jeden Trommelschlag: Speer auf den nächsten Feind.',
  },
  {
    id: 'opfer',
    name: 'Das Opfer',
    triggerId: 'onTakeDamage', verbId: 'nova', objectId: 'silence',
    description: 'Bei jedem Treffer: Riesen-Explosion um dich.',
  },
];

/**
 * Build verse objects (with computed synergy / stab data) from library ids.
 */
export function buildVerses(ids) {
  return ids.map(id => {
    const lib = VERSE_LIBRARY.find(v => v.id === id);
    if (!lib) return null;
    const composed = composeVerse(lib.triggerId, lib.verbId, lib.objectId);
    return Object.assign({}, composed, { id, name: lib.name, description: lib.description });
  }).filter(Boolean);
}

/**
 * Default starter verses — three pre-composed, one per stab.
 * The "Weinende Skalde" build is verse[0]: onHit → freeze → frost.
 */
export const DEFAULT_VERSES = buildVerses(['weinende', 'sturm', 'jaeger']);
