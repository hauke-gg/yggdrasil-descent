// Alle Werte sind Basis-Stats; WeaponSystem skaliert sie mit Level
export const WEAPONS = {
  runen_axt: {
    id: 'runen_axt',
    name: 'Runen-Axt',
    type: 'melee_aoe',       // melee_aoe | projectile | melee_line | passive
    damage: 25,
    cooldown: 1000,          // ms zwischen Angriffen
    range: 80,               // Pixel-Radius für Melee
    speed: 0,                // Projektil-Speed (0 = kein Projektil)
    color: 0x88aaff,
    description: 'Kreisschlag um den Spieler'
  },
  runen_bolt: {
    id: 'runen_bolt',
    name: 'Runen-Bolt',
    type: 'projectile',
    damage: 18,
    cooldown: 800,
    range: 400,
    speed: 350,
    color: 0xffee00,
    description: 'Gerader Schuss auf nächsten Feind'
  },
  speer: {
    id: 'speer',
    name: 'Speer',
    type: 'melee_line',
    damage: 35,
    cooldown: 1200,
    range: 120,
    speed: 0,
    color: 0xaaffaa,
    description: 'Stich nach vorne'
  }
};

export function getWeapon(id) {
  return WEAPONS[id] || null;
}

// Waffe auf Level anwenden: Schaden +20% pro Level, Cooldown -5% pro Level
export function getScaledWeapon(id, level) {
  const base = getWeapon(id);
  if (!base) return null;
  return {
    ...base,
    damage: Math.round(base.damage * (1 + 0.2 * (level - 1))),
    cooldown: Math.round(base.cooldown * (1 - 0.05 * (level - 1)))
  };
}

export const PASSIVES = {
  blut_rune: {
    id: 'blut_rune',
    name: 'Blut-Rune',
    description: '+30% Angriffstempo',
    effect: { cooldownMultiplier: 0.7 }
  },
  yggdrasil_samen: {
    id: 'yggdrasil_samen',
    name: 'Yggdrasil-Samen',
    description: 'Treffer springen auf 1 weiteren Feind',
    effect: { chain: 1 }
  },
  mjolnir_splitter: {
    id: 'mjolnir_splitter',
    name: 'Mjölnir-Splitter',
    description: '+25% AoE-Radius',
    effect: { rangeMultiplier: 1.25 }
  }
};
