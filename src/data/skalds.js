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
    spriteScale: 0.13,
    bodyRadius: 50,
    bodyOffsetX: 360,
    bodyOffsetY: 460,
    trauma:
      'Hat seinen Bruder im Gefecht erstochen — eine Sekunde Panik, die nie endet.',
    stats: { hp: 130, dmg: 1.15, spd: 200 },
    statLabel: 'HP +30 · Schaden ×1.15\nGeschwindigkeit normal',
  },
  solveig: {
    id: 'solveig',
    name: 'Sólveig Ungenannt',
    epithet: 'Die Namenlose',
    portrait: 'skald_solveig',
    spriteScale: 0.13,
    bodyRadius: 44,
    bodyOffsetX: 380,
    bodyOffsetY: 480,
    trauma:
      'Drei Tropfen Eisenhut in der Suppe. Drei Köpfe in den Schalen. Sie trägt seither keinen Namen mehr.',
    stats: { hp: 80, dmg: 1.0, spd: 260 },
    statLabel: 'HP −20 · Schaden ×1.0\nGeschwindigkeit +30%',
  },
  brandr: {
    id: 'brandr',
    name: 'Brandr von Snæfellsness',
    epithet: 'Der Wyrd-Tausch',
    portrait: 'skald_brandr',
    spriteScale: 0.13,
    bodyRadius: 44,
    bodyOffsetX: 380,
    bodyOffsetY: 480,
    trauma:
      'Ritzte Naudhiz für seine Mutter. Sie heilte. Drei Tage später starb sein Vater am gleichen Husten.',
    stats: { hp: 70, dmg: 1.4, spd: 200 },
    statLabel: 'HP −30 · Schaden ×1.4\nGeschwindigkeit normal',
  },
};

export const DEFAULT_SKALD = 'hakon';
