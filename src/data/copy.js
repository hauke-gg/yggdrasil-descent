// Alle Spieltexte im Stil von Neil Gaimans Norse Mythology + Hades (Supergiant)
// Ton: trocken, sarkastisch, göttlich gleichgültig — aber nie grausam.

export const MENU = {
  title: 'YGGDRASIL',
  subtitle: 'D E S C E N T',
  tagline: 'Die Welt endet. Du auch. Aber nicht heute.',
  startButton: 'SCHICKSAL HERAUSFORDERN',
  version: 'v0.1 — Ragnarök noch ausstehend',
};

export const CHARACTER_CREATION = {
  title: 'WER BIST DU?',
  subtitle: 'Die Nornen wollen es wissen. Wir alle müssen mit der Antwort leben.',
  namePlaceholder: 'Dein Name, Sterblicher',
  nameLabel: 'Wie nennen die Götter dich?',
  continueButton: 'SO SEI ES →',

  classes: {
    krieger: {
      name: 'KRIEGER',
      epithet: 'Der Unaufhaltsame',
      desc: 'Du bist kein Stratege. Du bist auch kein Poet. Du bist ein Krieger — was bedeutet, dass du auf Probleme zuläufst, anstatt nachzudenken. Das hat bisher funktioniert.',
      stats: 'HP: 120  ·  Schaden: ×1,2  ·  Geschwindigkeit: Normal',
      icon: '⚔',
    },
    schatten: {
      name: 'SCHATTENJÄGER',
      epithet: 'Die Unsichtbare Klinge',
      desc: 'Schnell, präzise, und mit dem unstillbaren Drang, aus dem Schatten zu agieren. Ob die Draugr Schatten bemerken? Keine Ahnung. Versuch es.',
      stats: 'HP: 80  ·  Schaden: ×1,0  ·  Geschwindigkeit: ×1,3',
      icon: '🏹',
    },
    magier: {
      name: 'RUNENMAGIER',
      epithet: 'Odins Nachahmung',
      desc: 'Du hast Jahre damit verbracht, uralte Runen zu studieren. Odin hing neun Tage am Yggdrasil dafür. Du hattest Bücher. Immerhin — deine Feuerbälle sind beeindruckend.',
      stats: 'HP: 70  ·  Schaden: ×1,5  ·  Geschwindigkeit: ×0,9',
      icon: '🔮',
    },
  },
};

export const TUTORIAL = [
  {
    title: 'BEWEGE DICH',
    icon: '◈',
    body: 'Linke Seite: Virtueller Joystick. Drücke und ziehe — dein Krieger folgt. Die Götter beobachten. Versuch, nicht gegen Wände zu laufen.',
    tip: 'Pro-Tipp: Weg von Feinden ist eine valide Strategie. Vorerst.',
  },
  {
    title: 'DU KÄMPFST VON ALLEIN',
    icon: '⚡',
    body: 'Deine Waffe greift automatisch an. Das war Lokis Idee — er fand es amüsant. Du musst dich nur bewegen. Die Feinde erledigen sich... meistens.',
    tip: 'Dash: Rechte Seite tippen. Kurz. Unverwundbar. Nützlich.',
  },
  {
    title: 'WÄHLE DEINE KRAFT',
    icon: '✦',
    body: 'Bei jedem Level-Up erscheint ein Gott mit Ratschlägen und Gaben. Drei Karten — wähle eine. Der Rest verschwindet. Die Götter sind generös, aber nicht verschwenderisch.',
    tip: 'Waffen entwickeln sich, wenn sie Stufe 5 erreichen. Odin sagt, das sei wichtig.',
  },
  {
    title: 'ERKUNDE MIDGARD',
    icon: '🗺',
    body: 'Die Welt ist größer als sie aussieht. Goldene Truhen warten im Dunkel. Laufe hinein — sie öffnen sich von selbst. Frag nicht wie. Es ist Magie.',
    tip: 'Weiter draußen: Jötunheim (kalt) und Helheim (kälter, aber emotional).',
  },
];

export const GOD_SPEECHES = {
  odin: [
    {
      speaker: 'ODIN',
      color: '#9999ff',
      lines: [
        'Ich habe dich beobachtet.',
        'Mit meinem verbleibenden Auge.',
        'Das andere verlor ich für Weisheit.',
        'Es war... einen anderen Preis wert.',
      ],
      choice: 'Wähle klug. Oder leb mit den Konsequenzen. Beides akzeptabel.',
    },
    {
      speaker: 'ODIN',
      color: '#9999ff',
      lines: [
        'Die Nornen weben dein Schicksal.',
        'Ich habe heimlich hineingeschaut.',
        'Es ist... interessant.',
      ],
      choice: 'Diese Gabe hier könnte das Muster verändern. Oder auch nicht.',
    },
    {
      speaker: 'ODIN',
      color: '#9999ff',
      lines: [
        'Huginn und Muninn berichten Merkwürdiges.',
        'Du lebst noch.',
      ],
      choice: 'Das hatte ich nicht erwartet. Wähle.',
    },
  ],

  thor: [
    {
      speaker: 'THOR',
      color: '#ffdd44',
      lines: [
        'HA.',
        'Das nenn ICH kämpfen.',
        'Mjölnir und ich haben gewettet, ob du das schaffst.',
        'Mjölnir schuldet mir jetzt einen Drink.',
      ],
      choice: 'Nimm das. Du hast es dir verdient. Mehr oder weniger.',
    },
    {
      speaker: 'THOR',
      color: '#ffdd44',
      lines: [
        'Ich war kurz abgelenkt.',
        'Hat jemand meinen Hammer gesehen?',
        'Egal. Du hast gut gekämpft.',
      ],
      choice: 'Wähle schnell. Ich muss meinen Hammer suchen.',
    },
    {
      speaker: 'THOR',
      color: '#ffdd44',
      lines: [
        'Du schlägst fast so hart wie ich.',
        'Fast.',
        'Aber für einen Sterblichen — beachtlich.',
      ],
      choice: 'Hier. Mach weiter so. Aber nicht ZU ähnlich wie ich — das wäre unangemessen.',
    },
  ],

  freya: [
    {
      speaker: 'FREYA',
      color: '#ffaacc',
      lines: [
        'Die Walküren haben mich geschickt.',
        'Normalerweise kommen sie erst nach dem Tod.',
        'Du bist noch nicht tot.',
        'Das ist... ungewöhnlich positiv.',
      ],
      choice: 'Nimm meine Gabe. Die Walküren warten noch.',
    },
    {
      speaker: 'FREYA',
      color: '#ffaacc',
      lines: [
        'Ich bin Göttin der Liebe UND des Krieges.',
        'Menschen vergessen immer das Zweite.',
        'Du vergisst es nicht.',
      ],
      choice: 'Das ehrt mich. Wähle.',
    },
    {
      speaker: 'FREYA',
      color: '#ffaacc',
      lines: [
        'Schönheit ist Macht.',
        'Stärke ist Schönheit.',
        'Dieser Satz macht mehr Sinn auf Altnordisch.',
      ],
      choice: 'Nimm, was du brauchst.',
    },
  ],

  loki: [
    {
      speaker: 'LOKI',
      color: '#44ff99',
      lines: [
        'Du lebst noch.',
        'Ehrlich gesagt — nicht mein Plan.',
        'Aber ich adaptiere.',
      ],
      choice: 'Hier. Ein Geschenk. Von mir. Völlig ohne Hintergedanken. Vertrau mir.',
    },
    {
      speaker: 'LOKI',
      color: '#44ff99',
      lines: [
        'Weißt du was lustig ist?',
        'Die Draugr glauben, sie würden gewinnen.',
        'Tun sie nicht.',
        'Das ist lustig.',
      ],
      choice: 'Nimm das hier. Es wird... interessant werden.',
    },
    {
      speaker: 'LOKI',
      color: '#44ff99',
      lines: [
        'Ich bin nicht böse.',
        'Ich bin nur missverstanden.',
        'Und außerdem manchmal böse.',
        'Aber meistens nur missverstanden.',
      ],
      choice: 'Diese Gabe ist vollkommen legal. Soweit du weißt.',
    },
  ],
};

export const LOOT_DESCRIPTIONS = {
  rune_shard: {
    name: 'Runenscherbe',
    icon: '◈',
    found: 'Eine Runenscherbe. Uralte Magie, verrottete Form. Funktioniert noch. Irgendwie.',
    effect: '+5% Schaden (dauerhaft — das bleibt)',
  },
  mjolnir_fragment: {
    name: 'Mjölnir-Splitter',
    icon: '⚡',
    found: 'Thor verliert Dinge. Sein Hammer am häufigsten. Sein Problem ist dein Vorteil.',
    effect: '+10% Angriffsgeschwindigkeit',
  },
  valkyrie_feather: {
    name: 'Walküren-Feder',
    icon: '🪶',
    found: 'Eine Walküre hat das verloren. Oder zurückgelassen. Bei Walküren ist der Unterschied manchmal gering.',
    effect: '+20 maximale HP',
  },
  yggdrasil_leaf: {
    name: 'Yggdrasil-Blatt',
    icon: '🍃',
    found: 'Ein Blatt des Weltbaums. Leuchtet leise. Du fühlst dich sofort besser. Das ist keine Einbildung.',
    effect: 'Heilt 5 HP sofort',
  },
  odin_eye: {
    name: 'Odins Auge',
    icon: '👁',
    found: 'Das andere Auge. Odin sagt, er vermisst es nicht. Odin lügt manchmal.',
    effect: '+15% XP-Gewinn',
  },
  frost_rune: {
    name: 'Frost-Rune',
    icon: '❄',
    found: 'Aus Jötunheim, wo niemand gerne ist. Kalt. Aber schnell macht sie dich.',
    effect: '+8% Bewegungsgeschwindigkeit',
  },
};

export const CHEST_MESSAGES = [
  'Die Truhe öffnet sich. Darin: etwas Nützliches und ein leichtes Gefühl der Schuld.',
  'Eine alte Truhe. Jemand hat sie hiergelassen. Das war wahrscheinlich nicht freiwillig.',
  'Du öffnest die Truhe. Die Götter schauen zu. Einer von ihnen nickt anerkennend.',
  'Inhalt: Eine Gabe. Herkunft: fragwürdig. Wirksamkeit: gegeben.',
];

export const BIOME_NAMES = {
  midgard:   'Midgard — Hier beginnt es',
  jotunheim: 'Jötunheim — Es wird kälter',
  helheim:   'Helheim — Du solltest umkehren',
};

export const HUD = {
  hp: 'LEBEN',
  xp: 'ERFAHRUNG',
  kills: 'GEFALLEN',
  level: 'RANG',
};

export const GAME_OVER = {
  title: 'DU BIST GEFALLEN',
  subtitles: [
    'Die Nornen haben es kommen sehen. Sie haben es nicht erwähnt.',
    'Valhalla nimmt dich auf. Wahrscheinlich. Die Bürokratie dort ist komplex.',
    'Thor ist enttäuscht. Er erwähnt es nicht. Aber er ist es.',
    'Loki lacht. Das ist kein gutes Zeichen. Das ist auch kein schlechtes. Es ist einfach Loki.',
    'Du hast tapfer gekämpft. Die Draugr waren mehr. Das passiert.',
    'Odin hat in seinen Aufzeichnungen nachgesehen. Du warst gut. Gut genug? Nun ja.',
  ],
  restartButton: 'NOCHMALS KÄMPFEN',
  menuButton: 'VALHALLA VERLASSEN',
  stats: {
    survived: 'Überlebt',
    killed: 'Gefallen',
    level: 'Rang erreicht',
    biome: 'Zuletzt gesehen in',
  },
};

export const LEVEL_UP = {
  title: '— AUFGESTIEGEN —',
  subtitle: 'Ein Gott hat Interesse an dir gefunden. Das kann gut oder schlecht sein.',
  chooseHint: 'Wähle eine Gabe. Die anderen verschwinden.',
};
