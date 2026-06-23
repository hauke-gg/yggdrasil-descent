/**
 * Skalden — three playable Bragi-apprentices.
 * Spec: docs/vision-skaldenlied.md → "Die 3 Skalden"
 */

export const SKALDS = {
  hakon: {
    id: 'hakon',
    name: 'Hákon Eisensohn',
    epithet: 'Der Eisensohn',
    portrait: 'skald_hakon',
    spriteScale: 0.085,
    bodyRadius: 32,
    bodyOffsetX: 380,
    bodyOffsetY: 480,
    trauma:
      'Er hat seinen jüngeren Bruder mit eigener Klinge erstochen, weil der Junge in Panik schrie und die Stellung verriet.',
    stats: { hp: 130, dmg: 1.15, spd: 200 },
    statLabel: 'HP +30  ·  Schaden ×1.15  ·  Geschwindigkeit normal',
  },
  solveig: {
    id: 'solveig',
    name: 'Sólveig Ungenannt',
    epithet: 'Die Namenlose',
    portrait: 'skald_solveig',
    spriteScale: 0.085,
    bodyRadius: 28,
    bodyOffsetX: 320,
    bodyOffsetY: 440,
    trauma:
      'Drei Tropfen Eisenhutwurzel in der Suppe, dreimal Atem anhalten, dreimal ein Lied summen, bis die Köpfe in den Schalen lagen.',
    stats: { hp: 80, dmg: 1.0, spd: 260 },
    statLabel: 'HP −20  ·  Schaden ×1.0  ·  Geschwindigkeit +30%',
  },
  brandr: {
    id: 'brandr',
    name: 'Brandr von Snæfellsness',
    epithet: 'Der Wyrd-Tausch',
    portrait: 'skald_brandr',
    spriteScale: 0.085,
    bodyRadius: 28,
    bodyOffsetX: 380,
    bodyOffsetY: 460,
    trauma:
      'Er hat Naudhiz auf den Stab seiner Mutter geritzt — sie heilte, drei Tage später starb sein Vater am gleichen Husten.',
    stats: { hp: 70, dmg: 1.4, spd: 200 },
    statLabel: 'HP −30  ·  Schaden ×1.4  ·  Geschwindigkeit normal',
  },
};

export const DEFAULT_SKALD = 'hakon';
