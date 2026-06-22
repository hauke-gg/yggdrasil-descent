import { checkEvolution } from '../data/evolutions.js';

export default class EvolutionSystem {
  // Prüft alle Waffen des Spielers auf Evolutions
  // Gibt Array von evolution-Objekten zurück die aktiviert werden können
  checkAll(player) {
    const available = [];
    for (const weaponSlot of player.weapons) {
      const evo = checkEvolution(weaponSlot.id, weaponSlot.level, player.passives);
      if (evo) available.push({ weaponSlot, evo });
    }
    return available;
  }

  // Wendet Evolution auf Spieler-Waffe an
  apply(player, weaponSlot, evo) {
    weaponSlot.id = evo.id;
    // Passiv-Item wird verbraucht
    const passiveIdx = player.passives.indexOf(evo.requiresPassive);
    if (passiveIdx !== -1) player.passives.splice(passiveIdx, 1);
    return evo;
  }
}
