export const EVOLUTIONS = [
  {
    id: 'berserker_axt',
    name: 'Berserker-Axt',
    requiresWeapon: 'runen_axt',
    requiresWeaponLevel: 5,
    requiresPassive: 'blut_rune',
    damage: 60,
    cooldown: 700,
    range: 100,
    type: 'melee_aoe_split',   // wie melee_aoe, aber erzeugt 4 Projektile beim Treffer
    color: 0xff4444,
    description: 'Kreisschlag spaltet in Projektile'
  },
  {
    id: 'weltenbaumblitz',
    name: 'Weltenbaumblitz',
    requiresWeapon: 'runen_bolt',
    requiresWeaponLevel: 5,
    requiresPassive: 'yggdrasil_samen',
    damage: 40,
    cooldown: 600,
    range: 400,
    speed: 400,
    type: 'projectile_chain',  // springt auf bis zu 3 weitere Feinde
    chainCount: 3,
    color: 0x00ffcc,
    description: 'Kettenblitz springt auf 3 Feinde'
  }
];

// Gibt Evolution zurück wenn alle Bedingungen erfüllt, sonst null
export function checkEvolution(weaponId, weaponLevel, passiveIds) {
  for (const evo of EVOLUTIONS) {
    if (
      evo.requiresWeapon === weaponId &&
      weaponLevel >= evo.requiresWeaponLevel &&
      passiveIds.includes(evo.requiresPassive)
    ) {
      return evo;
    }
  }
  return null;
}
