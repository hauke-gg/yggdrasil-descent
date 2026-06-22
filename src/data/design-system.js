// Design System — Yggdrasil Descent
// Einmal definiert. Überall verwendet. Keine Ausnahmen.

export const COLORS = {
  // Hintergründe
  void:       0x06000f,   // tiefster Hintergrund
  night:      0x0d0520,   // UI-Hintergrund
  panel:      0x12082a,   // Karten, Panels
  panelHover: 0x1e0a3c,   // Hover-Zustand

  // Primär
  gold:       0xd4af37,   // Valhalla-Gold — primäre Aktionen, Headlines
  goldDim:    0x8a6a12,   // gedimmtes Gold für sekundäre Elemente
  goldCSS:    '#d4af37',

  // Lila-Spektrum
  purple:     0x9944ee,   // Asgard-Lila — Borders, Highlights
  purpleDark: 0x4a1088,   // dunkles Lila
  purpleDim:  0x330066,   // Raster-Linien, Subtexte
  purpleCSS:  '#9944ee',

  // Akzente
  ember:      0xff6b35,   // Fenrir-Feuer — Danger, Boss
  emberCSS:   '#ff6b35',
  frost:      0x44aaff,   // Jötunheim-Eis — XP, Magie
  frostCSS:   '#44aaff',
  midgard:    0x2d7a1e,   // Midgard-Grün — HP, Natur
  midgardCSS: '#2d7a1e',
  ash:        0x8a8a9a,   // Asche — Sekundärtext
  ashCSS:     '#8a8a9a',

  // Biom-Bodenfarben
  biomeMidgard:   0x080f08,
  biomeJotunheim: 0x050a1a,
  biomeHelheim:   0x1a0500,
};

export const CSS_COLORS = {
  gold:        '#d4af37',
  goldLight:   '#f0d060',
  goldDim:     '#8a6a12',
  purple:      '#9944ee',
  purpleLight: '#cc88ff',
  purpleDark:  '#4a1088',
  purpleDim:   '#330066',
  ember:       '#ff6b35',
  frost:       '#44aaff',
  midgard:     '#44bb33',
  ash:         '#8a8a9a',
  white:       '#f0eee8',
  panel:       'rgba(18, 8, 42, 0.92)',
  overlay:     'rgba(0, 0, 0, 0.75)',
};

export const FONTS = {
  // Cinzel: Gemeißelter Stein, Norse/Roman — für Titel, Überschriften, Götternamen
  // Lora: Klassisch-Serifen, gut lesbar — für Fließtexte, Beschreibungen
  // Space Mono: Monospace, technisch — für Stats, Zahlen, HUD
  heading:  "'Cinzel Decorative', 'Cinzel', serif",
  subhead:  "'Cinzel', serif",
  body:     "'Lora', 'Georgia', serif",
  ui:       "'Space Mono', 'Courier New', monospace",
};

// Phaser-Text-Styles — fertige Objekte direkt in add.text() übergeben
export const TEXT_STYLES = {
  title: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: '64px',
    color: CSS_COLORS.gold,
    fontStyle: 'bold',
    stroke: '#441100',
    strokeThickness: 8,
    shadow: { offsetX: 0, offsetY: 0, color: '#ff8800', blur: 32, fill: true },
  },
  subtitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: '22px',
    color: CSS_COLORS.goldDim,
    letterSpacing: 12,
  },
  heading: {
    fontFamily: "'Cinzel', serif",
    fontSize: '28px',
    color: CSS_COLORS.gold,
    stroke: '#000000',
    strokeThickness: 4,
  },
  body: {
    fontFamily: "'Lora', serif",
    fontSize: '16px',
    color: CSS_COLORS.white,
    wordWrap: { width: 680 },
    lineSpacing: 6,
  },
  caption: {
    fontFamily: "'Lora', serif",
    fontSize: '13px',
    color: CSS_COLORS.ash,
    fontStyle: 'italic',
  },
  stat: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    color: CSS_COLORS.frost,
  },
  hud: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    color: CSS_COLORS.gold,
  },
  hudValue: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '13px',
    color: CSS_COLORS.white,
  },
  godName: {
    fontFamily: "'Cinzel', serif",
    fontSize: '15px',
    color: CSS_COLORS.gold,
    letterSpacing: 4,
    stroke: '#000000',
    strokeThickness: 3,
  },
  godSpeech: {
    fontFamily: "'Lora', serif",
    fontSize: '20px',
    color: CSS_COLORS.white,
    fontStyle: 'italic',
    wordWrap: { width: 700 },
    align: 'center',
    lineSpacing: 8,
    stroke: '#000000',
    strokeThickness: 4,
  },
  toast: {
    fontFamily: "'Lora', serif",
    fontSize: '16px',
    color: CSS_COLORS.gold,
    stroke: '#000000',
    strokeThickness: 3,
  },
  button: {
    fontFamily: "'Cinzel', serif",
    fontSize: '18px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
  },
  cardTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: '16px',
    color: CSS_COLORS.gold,
    stroke: '#000000',
    strokeThickness: 3,
  },
  cardBody: {
    fontFamily: "'Lora', serif",
    fontSize: '13px',
    color: CSS_COLORS.white,
    wordWrap: { width: 160 },
    lineSpacing: 4,
  },
  tiny: {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    color: CSS_COLORS.ash,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
};

// Wiederverwendbare Phaser-Zeichenfunktionen
export function drawPanel(gfx, x, y, w, h, { alpha = 0.92, border = true, radius = 8 } = {}) {
  gfx.fillStyle(COLORS.panel, alpha);
  gfx.fillRoundedRect(x, y, w, h, radius);
  if (border) {
    gfx.lineStyle(1.5, COLORS.purple, 0.8);
    gfx.strokeRoundedRect(x, y, w, h, radius);
  }
}

export function drawPanelGold(gfx, x, y, w, h, radius = 8) {
  gfx.fillStyle(COLORS.panelHover, 0.95);
  gfx.fillRoundedRect(x, y, w, h, radius);
  gfx.lineStyle(2, COLORS.gold, 1);
  gfx.strokeRoundedRect(x, y, w, h, radius);
}

export function drawButton(gfx, x, y, w, h, hovered = false) {
  if (hovered) {
    gfx.fillStyle(0x7700cc, 0.95);
    gfx.fillRoundedRect(x, y, w, h, 6);
    gfx.lineStyle(2, COLORS.gold);
    gfx.strokeRoundedRect(x, y, w, h, 6);
  } else {
    gfx.fillStyle(COLORS.purpleDark, 0.9);
    gfx.fillRoundedRect(x, y, w, h, 6);
    gfx.lineStyle(2, COLORS.purple);
    gfx.strokeRoundedRect(x, y, w, h, 6);
  }
}

export function drawGrid(gfx, w, h, size = 48, color = COLORS.purpleDim, alpha = 0.18) {
  gfx.lineStyle(1, color, alpha);
  for (let x = 0; x <= w; x += size) gfx.lineBetween(x, 0, x, h);
  for (let y = 0; y <= h; y += size) gfx.lineBetween(0, y, w, y);
}
