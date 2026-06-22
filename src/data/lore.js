export const GOD_SPEECHES = {
  odin: [
    { speaker: 'ODIN', text: 'Gut gekämpft, Sterblicher. Wähle deine nächste Kraft weise.' },
    { speaker: 'ODIN', text: 'Yggdrasil beobachtet deinen Aufstieg. Zeige mir deine Stärke.' },
    { speaker: 'ODIN', text: 'Ich habe mein Auge auf dich geworfen. Enttäusch mich nicht.' },
  ],
  freya: [
    { speaker: 'FREYA', text: 'Dein Kampfgeist ehrt mich. Nimm meine Gabe, Krieger.' },
    { speaker: 'FREYA', text: 'Die Walküren singen von deinen Taten. Kämpf weiter.' },
    { speaker: 'FREYA', text: 'Schönheit und Stärke — beides kannst du haben. Wähle.' },
  ],
  thor: [
    { speaker: 'THOR', text: 'HA! Das nenn ich kämpfen! Nimm Mjölnirs Segen!' },
    { speaker: 'THOR', text: 'Du schlägst fast so hart wie ich. Fast.' },
    { speaker: 'THOR', text: 'Jetzt wird es interessant. Mehr Feinde, mehr Ruhm!' },
  ],
  loki: [
    { speaker: 'LOKI', text: 'Interessant... du lebst noch. Vielleicht bist du nützlich.' },
    { speaker: 'LOKI', text: 'Chaos ist Macht. Ich habe etwas... Besonderes für dich.' },
    { speaker: 'LOKI', text: 'Vertrau mir. Diesmal wirklich.' },
  ]
};

export const LOOT_TABLE = [
  { id: 'rune_shard', name: 'Runenscherbe', desc: '+5% Gesamtschaden (dauerhaft)', icon: '◈', permanent: true, effect: { dmgBonus: 0.05 } },
  { id: 'mjolnir_fragment', name: 'Mjölnir-Splitter', desc: '+10% Angriffsgeschwindigkeit', icon: '⚡', permanent: false, effect: { atkSpeedBonus: 0.10 } },
  { id: 'valkyrie_feather', name: 'Walküren-Feder', desc: '+20 maximale HP', icon: '🪶', permanent: false, effect: { maxHpBonus: 20 } },
  { id: 'yggdrasil_leaf', name: 'Yggdrasil-Blatt', desc: '+5 HP regeneriert sofort', icon: '🍃', permanent: false, effect: { healAmount: 5 } },
  { id: 'odin_eye', name: 'Odins Auge', desc: 'XP-Gewinn +15%', icon: '👁', permanent: false, effect: { xpBonus: 0.15 } },
  { id: 'frost_rune', name: 'Frost-Rune', desc: '+8% Bewegungsgeschwindigkeit', icon: '❄', permanent: false, effect: { speedBonus: 0.08 } },
];
