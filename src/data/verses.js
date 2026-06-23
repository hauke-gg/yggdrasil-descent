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
 * Default starter verses — three pre-composed, one per stab.
 * The "Weinende Skalde" build is verse[0]: onHit → freeze → frost.
 */
export const DEFAULT_VERSES = [
  composeVerse('onHit',        'freeze', 'frost'),   // Weinende: on low HP, freeze enemies in frost
  composeVerse('onTakeDamage', 'burst',  'wounds'),  // on hit, fire projectile burst
  composeVerse('onKill',       'strike', 'spear'),   // on kill, fire a precision spear
];
