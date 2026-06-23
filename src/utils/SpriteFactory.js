/**
 * SpriteFactory — Erzeugt alle Spiel-Sprites als HTML-Canvas-Elemente.
 * Wird in BootScene aufgerufen und via scene.textures.addCanvas() registriert.
 */

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── KRIEGER ──────────────────────────────────────────────────────────────────
export function makeKrieger() {
  const c = mkCanvas(64, 72); const ctx = c.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(28, 69, 16, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Red cape (drawn first — behind body)
  ctx.fillStyle = '#6A0808';
  ctx.beginPath();
  ctx.moveTo(15, 26); ctx.lineTo(10, 62); ctx.lineTo(18, 62);
  ctx.lineTo(28, 44); ctx.lineTo(38, 62); ctx.lineTo(46, 62);
  ctx.lineTo(41, 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9A1111';
  ctx.beginPath();
  ctx.moveTo(17, 26); ctx.lineTo(13, 56); ctx.lineTo(20, 56);
  ctx.lineTo(28, 42); ctx.lineTo(36, 56); ctx.lineTo(43, 56);
  ctx.lineTo(39, 26); ctx.closePath(); ctx.fill();

  // Boots
  ctx.fillStyle = '#1A0F05';
  ctx.fillRect(16, 50, 9, 16); ctx.fillRect(29, 50, 9, 16);
  ctx.fillStyle = '#3A2010';
  ctx.fillRect(17, 50, 6, 5); ctx.fillRect(30, 50, 6, 5);
  ctx.fillStyle = '#C4942A'; // gold buckle
  ctx.fillRect(18, 52, 4, 2); ctx.fillRect(31, 52, 4, 2);

  // Greaves (lower legs)
  ctx.fillStyle = '#2A3A5A';
  ctx.fillRect(16, 42, 9, 10); ctx.fillRect(29, 42, 9, 10);
  ctx.fillStyle = '#3A4A7A';
  ctx.fillRect(17, 43, 6, 7); ctx.fillRect(30, 43, 6, 7);

  // Gold belt
  ctx.fillStyle = '#C4942A';
  ctx.fillRect(14, 40, 28, 4);
  ctx.fillStyle = '#E5C05A';
  rr(ctx, 23, 39, 10, 6, 2); ctx.fill();
  ctx.fillStyle = '#C4942A';
  ctx.fillRect(25, 40, 6, 4);

  // Body armor (torso)
  ctx.fillStyle = '#2A3A5A';
  rr(ctx, 13, 22, 30, 20, 4); ctx.fill();
  ctx.fillStyle = '#3A4A6A';
  rr(ctx, 15, 23, 26, 18, 3); ctx.fill();
  // Chest plate
  ctx.fillStyle = '#4A5A8A';
  rr(ctx, 18, 25, 20, 13, 2); ctx.fill();
  // Cross detail
  ctx.strokeStyle = '#2A3A5A'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(28, 25); ctx.lineTo(28, 38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(18, 31); ctx.lineTo(38, 31); ctx.stroke();
  // Rivets
  ctx.fillStyle = '#C4942A';
  [19,37].forEach(x => [26, 36].forEach(y => { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill(); }));

  // Left pauldron
  ctx.fillStyle = '#2A3A5A'; rr(ctx, 6, 22, 10, 12, 4); ctx.fill();
  ctx.fillStyle = '#4A5A8A'; rr(ctx, 7, 23, 8, 9, 3); ctx.fill();
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.moveTo(6,28); ctx.lineTo(16,28); ctx.lineWidth=1; ctx.stroke();

  // Right pauldron
  ctx.fillStyle = '#2A3A5A'; rr(ctx, 40, 22, 10, 12, 4); ctx.fill();
  ctx.fillStyle = '#4A5A8A'; rr(ctx, 41, 23, 8, 9, 3); ctx.fill();
  ctx.strokeStyle = '#C4942A';
  ctx.beginPath(); ctx.moveTo(40,28); ctx.lineTo(50,28); ctx.stroke();

  // Left gauntlet (holding shield)
  ctx.fillStyle = '#3A4A6A'; ctx.fillRect(6, 33, 8, 10);
  ctx.fillStyle = '#C4942A'; ctx.fillRect(6, 42, 8, 2);

  // Right gauntlet (holding axe)
  ctx.fillStyle = '#3A4A6A'; ctx.fillRect(42, 33, 8, 10);
  ctx.fillStyle = '#C4942A'; ctx.fillRect(42, 42, 8, 2);

  // SHIELD (left side)
  ctx.fillStyle = '#2A3A5A'; ctx.beginPath(); ctx.arc(3, 34, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4A5A8A'; ctx.beginPath(); ctx.arc(3, 34, 8, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#C4942A'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(3, 34, 10, 0, Math.PI*2); ctx.stroke();
  ctx.fillStyle = '#C4942A'; ctx.beginPath(); ctx.arc(3, 34, 3, 0, Math.PI*2); ctx.fill();
  // Shield rune
  ctx.strokeStyle = 'rgba(100,180,255,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(3, 27); ctx.lineTo(3, 41); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, 34); ctx.lineTo(10, 34); ctx.stroke();

  // BATTLE-AXE (right side, raised)
  ctx.fillStyle = '#6A5A3A'; ctx.fillRect(51, 16, 4, 28); // handle
  ctx.fillStyle = '#3A3A3A'; // axe head (back)
  ctx.beginPath(); ctx.moveTo(46,12); ctx.lineTo(60,10); ctx.lineTo(60,22); ctx.lineTo(46,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#888888';
  ctx.beginPath(); ctx.moveTo(47,13); ctx.lineTo(59,11); ctx.lineTo(59,21); ctx.lineTo(47,19); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#CCCCCC';
  ctx.beginPath(); ctx.moveTo(48,14); ctx.lineTo(58,12); ctx.lineTo(58,18); ctx.lineTo(48,16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(49,13.5); ctx.lineTo(57,12); ctx.stroke();
  // Rune on axe blade
  ctx.strokeStyle = '#66AAFF'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(53,13); ctx.lineTo(53,20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50,16.5); ctx.lineTo(56,16.5); ctx.stroke();

  // HELMET
  // Back of helmet
  ctx.fillStyle = '#1A2A4A';
  ctx.beginPath(); ctx.ellipse(28, 16, 16, 13, 0, 0, Math.PI*2); ctx.fill();
  // Main helmet dome
  ctx.fillStyle = '#2A3A5A';
  ctx.beginPath(); ctx.ellipse(28, 15, 14, 11, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3A4A6A';
  ctx.beginPath(); ctx.ellipse(25, 12, 9, 7, -0.2, 0, Math.PI*2); ctx.fill();
  // Ridge
  ctx.fillStyle = '#5A6A9A';
  ctx.fillRect(27, 4, 2, 10);
  // Crest (red plume)
  ctx.fillStyle = '#AA1111';
  ctx.beginPath(); ctx.moveTo(24,5); ctx.lineTo(32,5); ctx.lineTo(31,11); ctx.lineTo(28,13); ctx.lineTo(25,11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#CC3333';
  ctx.beginPath(); ctx.moveTo(25,5); ctx.lineTo(31,5); ctx.lineTo(30,10); ctx.lineTo(28,12); ctx.lineTo(26,10); ctx.closePath(); ctx.fill();

  // Horns
  ctx.fillStyle = '#8A6000';
  ctx.beginPath(); ctx.moveTo(15,12); ctx.lineTo(4,3); ctx.lineTo(14,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.moveTo(15,12); ctx.lineTo(6,5); ctx.lineTo(13,17); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E5C05A'; // horn tip
  ctx.beginPath(); ctx.arc(5.5,4, 1.5, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#8A6000';
  ctx.beginPath(); ctx.moveTo(41,12); ctx.lineTo(52,3); ctx.lineTo(42,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.moveTo(41,12); ctx.lineTo(50,5); ctx.lineTo(43,17); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E5C05A';
  ctx.beginPath(); ctx.arc(50.5,4, 1.5, 0, Math.PI*2); ctx.fill();

  // Nose guard
  ctx.fillStyle = '#2A3A5A'; ctx.fillRect(27,16,2,8);

  // Visor (dark face opening)
  ctx.fillStyle = '#050510';
  rr(ctx, 15,13, 26,9, 3); ctx.fill();

  // Eyes
  ctx.fillStyle = 'rgba(80,160,255,0.25)';
  ctx.beginPath(); ctx.ellipse(22,17.5, 5,3.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(34,17.5, 5,3.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3388DD';
  ctx.beginPath(); ctx.ellipse(22,17.5, 3,2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(34,17.5, 3,2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AADDFF';
  ctx.beginPath(); ctx.arc(21.5,16.5, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(33.5,16.5, 1.2, 0, Math.PI*2); ctx.fill();

  return c;
}

// ─── SCHATTEN (Assassin) ───────────────────────────────────────────────────────
export function makeSchatten() {
  const c = mkCanvas(56, 68); const ctx = c.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(26, 65, 13, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Cloak (billowing, dark)
  ctx.fillStyle = '#0A0014';
  ctx.beginPath();
  ctx.moveTo(10, 26); ctx.quadraticCurveTo(4, 44, 8, 64);
  ctx.lineTo(16, 62); ctx.lineTo(20, 48);
  ctx.lineTo(26, 52); ctx.lineTo(32, 48);
  ctx.lineTo(36, 62); ctx.lineTo(44, 64);
  ctx.quadraticCurveTo(48, 44, 42, 26); ctx.closePath(); ctx.fill();

  // Cloak inner fold (purple highlight)
  ctx.fillStyle = '#18002A';
  ctx.beginPath();
  ctx.moveTo(13, 28); ctx.quadraticCurveTo(8, 44, 12, 60);
  ctx.lineTo(18, 58); ctx.lineTo(22, 46);
  ctx.lineTo(26, 50); ctx.lineTo(30, 46);
  ctx.lineTo(34, 58); ctx.lineTo(40, 60);
  ctx.quadraticCurveTo(44, 44, 39, 28); ctx.closePath(); ctx.fill();

  // Cloak shimmer strips
  ctx.strokeStyle = 'rgba(120,40,200,0.3)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(14 + i*5, 32); ctx.quadraticCurveTo(14+i*5-2, 50, 15+i*5, 62);
    ctx.stroke();
  }

  // Legs (dark, barely visible under cloak)
  ctx.fillStyle = '#0E0018';
  ctx.fillRect(18, 46, 7, 16); ctx.fillRect(27, 46, 7, 16);
  // Boot tips
  ctx.fillStyle = '#1A0028';
  ctx.fillRect(18, 58, 8, 4); ctx.fillRect(27, 58, 8, 4);

  // Body armor (under cloak, slight purple sheen)
  ctx.fillStyle = '#120020';
  rr(ctx, 14, 24, 24, 24, 4); ctx.fill();
  ctx.fillStyle = '#1E0030';
  rr(ctx, 16, 25, 20, 20, 3); ctx.fill();
  // Chest strap
  ctx.strokeStyle = '#3A005A'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16, 28); ctx.lineTo(36, 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(36, 28); ctx.lineTo(16, 34); ctx.stroke();

  // Belt
  ctx.fillStyle = '#2A0040';
  ctx.fillRect(14, 44, 24, 3);
  ctx.fillStyle = '#6600AA'; // purple gem
  ctx.beginPath(); ctx.arc(26, 45, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AA44FF';
  ctx.beginPath(); ctx.arc(25.5, 44.5, 1.5, 0, Math.PI*2); ctx.fill();

  // Left arm + dagger
  ctx.fillStyle = '#0E0018'; ctx.fillRect(8, 28, 7, 14);
  // Left dagger
  ctx.fillStyle = '#444444'; ctx.fillRect(5, 34, 2, 12);
  ctx.fillStyle = '#AAAAAA'; ctx.fillRect(5, 28, 2, 8);
  ctx.fillStyle = '#DDDDDD'; // blade shine
  ctx.fillRect(5.5, 29, 1, 6);
  ctx.fillStyle = '#6600AA'; // gem in hilt
  ctx.beginPath(); ctx.arc(6, 35, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AA44FF'; ctx.beginPath(); ctx.arc(5.5, 34.5, 1, 0, Math.PI*2); ctx.fill();
  // Cross-guard
  ctx.fillStyle = '#888888'; ctx.fillRect(3, 34, 6, 2);

  // Right arm + dagger
  ctx.fillStyle = '#0E0018'; ctx.fillRect(41, 28, 7, 14);
  // Right dagger (raised)
  ctx.fillStyle = '#444444'; ctx.fillRect(49, 20, 2, 12);
  ctx.fillStyle = '#AAAAAA'; ctx.fillRect(49, 14, 2, 8);
  ctx.fillStyle = '#DDDDDD';
  ctx.fillRect(49.5, 15, 1, 6);
  ctx.fillStyle = '#6600AA';
  ctx.beginPath(); ctx.arc(50, 21, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AA44FF'; ctx.beginPath(); ctx.arc(49.5, 20.5, 1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#888888'; ctx.fillRect(47, 21, 6, 2);

  // HOOD
  // Hood back/volume
  ctx.fillStyle = '#050010';
  ctx.beginPath(); ctx.ellipse(26, 16, 17, 14, 0, 0, Math.PI*2); ctx.fill();
  // Hood front
  ctx.fillStyle = '#0A0018';
  ctx.beginPath(); ctx.ellipse(26, 17, 14, 12, 0, 0, Math.PI*2); ctx.fill();
  // Hood inner shadow
  ctx.fillStyle = '#000008';
  ctx.beginPath(); ctx.ellipse(26, 19, 10, 9, 0, 0, Math.PI*2); ctx.fill();
  // Hood highlight (fabric fold)
  ctx.strokeStyle = '#1A0030'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(14, 14, 12, 0.3, 1.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(38, 14, 12, 1.9, 2.8); ctx.stroke();

  // Face shadow (deep darkness under hood)
  ctx.fillStyle = '#020008';
  ctx.beginPath(); ctx.ellipse(26, 20, 9, 8, 0, 0, Math.PI*2); ctx.fill();

  // EYES (glowing purple in darkness)
  // Outer glow
  ctx.fillStyle = 'rgba(150,40,255,0.2)';
  ctx.beginPath(); ctx.ellipse(21, 20, 5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(31, 20, 5, 3, 0, 0, Math.PI*2); ctx.fill();
  // Eye
  ctx.fillStyle = '#8800CC';
  ctx.beginPath(); ctx.ellipse(21, 20, 3, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(31, 20, 3, 2, 0, 0, Math.PI*2); ctx.fill();
  // Slit pupil
  ctx.fillStyle = '#CC44FF';
  ctx.beginPath(); ctx.ellipse(21, 20, 1, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(31, 20, 1, 2, 0, 0, Math.PI*2); ctx.fill();
  // Bright pupil center
  ctx.fillStyle = '#EE88FF';
  ctx.beginPath(); ctx.arc(21, 19.5, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(31, 19.5, 0.8, 0, Math.PI*2); ctx.fill();

  // Shadow wisps (purple particles below character)
  ctx.fillStyle = 'rgba(100,0,180,0.15)';
  [[10,60,8,6],[20,64,5,3],[35,63,6,4],[44,61,7,5]].forEach(([x,y,rx,ry]) => {
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
  });

  return c;
}

// ─── MAGIER (Mage) ────────────────────────────────────────────────────────────
export function makeMagier() {
  const c = mkCanvas(56, 72); const ctx = c.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(24, 69, 13, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Robes (wide, flowing)
  ctx.fillStyle = '#0C0830';
  ctx.beginPath();
  ctx.moveTo(12, 28); ctx.quadraticCurveTo(8, 46, 10, 68);
  ctx.lineTo(20, 68); ctx.lineTo(24, 52); ctx.lineTo(28, 68);
  ctx.lineTo(38, 68); ctx.quadraticCurveTo(40, 46, 36, 28);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#14106A';
  ctx.beginPath();
  ctx.moveTo(14, 28); ctx.quadraticCurveTo(10, 46, 12, 64);
  ctx.lineTo(20, 64); ctx.lineTo(24, 50); ctx.lineTo(28, 64);
  ctx.lineTo(36, 64); ctx.quadraticCurveTo(38, 46, 34, 28);
  ctx.closePath(); ctx.fill();

  // Robe star/rune pattern
  ctx.strokeStyle = 'rgba(100,120,255,0.3)'; ctx.lineWidth = 0.8;
  [[18,40],[24,54],[30,42]].forEach(([x,y]) => {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i;
      ctx.beginPath(); ctx.moveTo(x,y);
      ctx.lineTo(x+Math.cos(a)*5, y+Math.sin(a)*5); ctx.stroke();
    }
  });

  // Torso (inner robe)
  ctx.fillStyle = '#1A1880';
  rr(ctx, 14, 24, 20, 22, 4); ctx.fill();
  ctx.fillStyle = '#2222AA';
  rr(ctx, 16, 25, 16, 18, 3); ctx.fill();
  // Robe clasp
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.arc(24, 30, 4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#E5C05A';
  ctx.beginPath(); ctx.arc(24, 30, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4444FF';
  ctx.beginPath(); ctx.arc(24, 30, 1.5, 0, Math.PI*2); ctx.fill();

  // Belt / sash
  ctx.fillStyle = '#8833AA';
  ctx.fillRect(13, 43, 22, 4);
  ctx.fillStyle = '#AA44CC';
  ctx.fillRect(20, 42, 8, 6);

  // Sleeves
  ctx.fillStyle = '#14106A'; ctx.fillRect(8, 26, 7, 18); // left
  ctx.fillRect(33, 26, 7, 18); // right
  ctx.fillStyle = '#8833AA'; // cuff trim
  ctx.fillRect(8, 43, 7, 2); ctx.fillRect(33, 43, 7, 2);

  // Left hand (holding scroll)
  ctx.fillStyle = '#C9956A';
  ctx.beginPath(); ctx.ellipse(11, 48, 3, 4, 0, 0, Math.PI*2); ctx.fill();
  // Scroll
  ctx.fillStyle = '#E8DEC0';
  ctx.fillRect(5, 44, 8, 12); ctx.fillRect(4, 43, 10, 3); ctx.fillRect(4, 54, 10, 3);
  ctx.strokeStyle = '#AA9060'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(7, 47); ctx.lineTo(13, 47); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, 50); ctx.lineTo(13, 50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, 53); ctx.lineTo(13, 53); ctx.stroke();

  // STAFF (right side, tall)
  ctx.fillStyle = '#5A3A18'; // wood shaft
  ctx.fillRect(38, 4, 4, 64);
  ctx.fillStyle = '#7A5A28';
  ctx.fillRect(39, 5, 2, 62);
  // Staff orb
  ctx.fillStyle = '#3300AA';
  ctx.beginPath(); ctx.arc(40, 8, 9, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5522CC';
  ctx.beginPath(); ctx.arc(40, 8, 7, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8844EE';
  ctx.beginPath(); ctx.arc(40, 7, 4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AACCFF'; // bright inner
  ctx.beginPath(); ctx.arc(38.5, 6, 2, 0, Math.PI*2); ctx.fill();
  // Glow rays
  ctx.strokeStyle = 'rgba(120,80,255,0.4)'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI/4)*i;
    ctx.beginPath(); ctx.moveTo(40+Math.cos(a)*9, 8+Math.sin(a)*9);
    ctx.lineTo(40+Math.cos(a)*16, 8+Math.sin(a)*16); ctx.stroke();
  }
  // Staff binding rings
  ctx.strokeStyle = '#C4942A'; ctx.lineWidth = 1.5;
  [20, 35, 48].forEach(y => { ctx.beginPath(); ctx.moveTo(38,y); ctx.lineTo(42,y); ctx.stroke(); });

  // Floating runes (around body)
  ctx.font = '7px serif';
  ctx.fillStyle = 'rgba(100,180,255,0.55)';
  ctx.fillText('ᚱ', 3, 32); ctx.fillText('ᚦ', 3, 56);
  ctx.fillStyle = 'rgba(180,100,255,0.55)';
  ctx.fillText('ᚢ', 48, 38); ctx.fillText('ᚠ', 48, 58);

  // WIZARD HAT
  // Hat brim
  ctx.fillStyle = '#0C0830';
  ctx.beginPath(); ctx.ellipse(24, 18, 18, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#14106A';
  ctx.beginPath(); ctx.ellipse(24, 17, 16, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#8833AA'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(24, 17, 16, 4, 0, 0, Math.PI*2); ctx.stroke();
  // Hat cone
  ctx.fillStyle = '#0C0830';
  ctx.beginPath(); ctx.moveTo(10, 18); ctx.lineTo(24, 2); ctx.lineTo(38, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#14106A';
  ctx.beginPath(); ctx.moveTo(12, 18); ctx.lineTo(24, 3); ctx.lineTo(36, 18); ctx.closePath(); ctx.fill();
  // Star on hat
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.arc(24, 10, 3, 0, Math.PI*2); ctx.fill();
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI*2/5)*i - Math.PI/2;
    const x = 24+Math.cos(a)*5; const y = 10+Math.sin(a)*5;
    ctx.fillRect(x-1, y-1, 2, 2);
  }

  // Face (visible below brim)
  ctx.fillStyle = '#C9956A';
  ctx.beginPath(); ctx.ellipse(24, 21, 8, 6, 0, 0, Math.PI*2); ctx.fill();
  // Beard (white)
  ctx.fillStyle = '#E8E0D0';
  ctx.beginPath(); ctx.ellipse(24, 27, 7, 5, 0, 0.7*Math.PI, 0.3*Math.PI, true); ctx.fill();
  // Eyes (wise, glowing)
  ctx.fillStyle = '#AADDFF';
  ctx.beginPath(); ctx.arc(20, 20, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(28, 20, 2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#66AAEE';
  ctx.beginPath(); ctx.arc(20, 20, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(28, 20, 1.2, 0, Math.PI*2); ctx.fill();
  // Eyebrows
  ctx.strokeStyle = '#E8E0D0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(17, 17.5); ctx.lineTo(23, 17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(25, 17); ctx.lineTo(31, 17.5); ctx.stroke();

  return c;
}

// ─── DRAUGR (Undead Viking) ────────────────────────────────────────────────────
export function makeDraugr() {
  const c = mkCanvas(48, 52); const ctx = c.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(22, 50, 12, 4, 0, 0, Math.PI*2); ctx.fill();

  // Decaying cloak/rags (dark green-grey)
  ctx.fillStyle = '#0A1A08';
  ctx.beginPath();
  ctx.moveTo(10, 28); ctx.lineTo(6, 50); ctx.lineTo(14, 49);
  ctx.lineTo(22, 36); ctx.lineTo(30, 49); ctx.lineTo(38, 50);
  ctx.lineTo(34, 28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#122218';
  ctx.beginPath();
  ctx.moveTo(12, 28); ctx.lineTo(9, 46); ctx.lineTo(16, 45);
  ctx.lineTo(22, 34); ctx.lineTo(28, 45); ctx.lineTo(35, 46);
  ctx.lineTo(32, 28); ctx.closePath(); ctx.fill();

  // Torn strips on cloak
  ctx.strokeStyle = '#091608'; ctx.lineWidth = 1;
  [[14,30,10,48],[20,32,18,46],[28,31,26,47]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  // Legs (exposed bone)
  ctx.fillStyle = '#1A2A18';
  ctx.fillRect(14, 38, 7, 12); ctx.fillRect(25, 38, 7, 12);
  // Bone highlights
  ctx.fillStyle = '#8A9A80'; // grey-green bone
  ctx.fillRect(15, 40, 2, 8); ctx.fillRect(26, 40, 2, 8);

  // Body armor (rusted, broken)
  ctx.fillStyle = '#1C2A1A';
  rr(ctx, 11, 24, 22, 16, 3); ctx.fill();
  ctx.fillStyle = '#2A3A28';
  rr(ctx, 13, 25, 18, 13, 2); ctx.fill();
  // Rust marks
  ctx.fillStyle = '#3A2010';
  ctx.fillRect(14, 26, 3, 2); ctx.fillRect(20, 29, 4, 2); ctx.fillRect(17, 32, 3, 3);
  // Chest crack
  ctx.strokeStyle = '#0A1208'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(22, 25); ctx.lineTo(20, 30); ctx.lineTo(22, 36); ctx.stroke();

  // Broken weapon (left arm, dragging)
  ctx.fillStyle = '#444A3A'; // handle
  ctx.fillRect(5, 32, 3, 18);
  ctx.fillStyle = '#5A5A4A'; // broken blade stump
  ctx.fillRect(3, 28, 7, 6);
  ctx.fillStyle = '#3A3A2A';
  ctx.fillRect(4, 29, 4, 4);
  // Rust on blade
  ctx.fillStyle = '#5A2010';
  ctx.fillRect(4, 29, 2, 3);

  // Right arm reaching forward
  ctx.fillStyle = '#1A2A18';
  ctx.fillRect(34, 28, 7, 12);
  // Clawed hand
  ctx.fillStyle = '#8A9A80';
  ctx.fillRect(38, 38, 2, 6); ctx.fillRect(40, 37, 2, 5); ctx.fillRect(42, 39, 2, 4);
  ctx.fillStyle = '#AABB99';
  ctx.fillRect(38, 42, 1, 2); ctx.fillRect(40, 41, 1, 2); ctx.fillRect(42, 43, 1, 1);

  // HEAD (skull-like)
  // Skull back (slightly larger)
  ctx.fillStyle = '#0A1A0A';
  ctx.beginPath(); ctx.ellipse(22, 16, 13, 12, 0, 0, Math.PI*2); ctx.fill();
  // Main skull
  ctx.fillStyle = '#3A4A38';
  ctx.beginPath(); ctx.ellipse(22, 15, 11, 10, 0, 0, Math.PI*2); ctx.fill();
  // Skull highlight (pale top)
  ctx.fillStyle = '#6A7A68';
  ctx.beginPath(); ctx.ellipse(20, 12, 7, 6, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8A9A88';
  ctx.beginPath(); ctx.ellipse(19, 11, 4, 3, -0.3, 0, Math.PI*2); ctx.fill();

  // Broken helmet pieces
  ctx.fillStyle = '#2A2015';
  rr(ctx, 12, 10, 8, 6, 2); ctx.fill();
  ctx.fillStyle = '#1A1510';
  rr(ctx, 26, 10, 7, 5, 2); ctx.fill();

  // Jaw (dropped open menacingly)
  ctx.fillStyle = '#2A3A28';
  ctx.beginPath(); ctx.ellipse(22, 24, 8, 4, 0, 0, Math.PI*2); ctx.fill();
  // Teeth (broken)
  ctx.fillStyle = '#9A9A88';
  [[17,22],[20,21],[22,21],[25,22],[28,22]].forEach(([x,y]) => {
    ctx.fillRect(x, y, 2, 4);
  });
  ctx.fillStyle = '#3A3A28'; // gaps/missing teeth
  ctx.fillRect(19, 22, 1, 3); ctx.fillRect(24, 22, 1, 3);

  // GLOWING EYES (most important feature)
  // Outer glow
  ctx.fillStyle = 'rgba(0,220,40,0.2)';
  ctx.beginPath(); ctx.ellipse(17, 15, 6, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(27, 15, 6, 4, 0, 0, Math.PI*2); ctx.fill();
  // Eye socket darkness
  ctx.fillStyle = '#050A05';
  ctx.beginPath(); ctx.ellipse(17, 15, 4, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(27, 15, 4, 3, 0, 0, Math.PI*2); ctx.fill();
  // Glowing orb
  ctx.fillStyle = '#00CC22';
  ctx.beginPath(); ctx.ellipse(17, 15, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(27, 15, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
  // Bright center
  ctx.fillStyle = '#88FFAA';
  ctx.beginPath(); ctx.arc(17, 14.5, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(27, 14.5, 1, 0, Math.PI*2); ctx.fill();

  return c;
}

// ─── JOTUNN (Frost Giant) ─────────────────────────────────────────────────────
export function makeJotunn() {
  const c = mkCanvas(80, 88); const ctx = c.getContext('2d');

  // Shadow (massive)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(38, 85, 24, 7, 0, 0, Math.PI*2); ctx.fill();

  // Ice-frost ground aura
  ctx.fillStyle = 'rgba(80,160,220,0.08)';
  ctx.beginPath(); ctx.ellipse(38, 80, 30, 10, 0, 0, Math.PI*2); ctx.fill();

  // Legs (tree-trunk thick)
  ctx.fillStyle = '#1A2A3A';
  ctx.fillRect(18, 58, 16, 24); ctx.fillRect(42, 58, 16, 24);
  ctx.fillStyle = '#2A3A4A';
  ctx.fillRect(19, 59, 12, 20); ctx.fillRect(43, 59, 12, 20);
  // Ice crystal on legs
  ctx.fillStyle = '#88CCEE';
  ctx.fillRect(20, 65, 3, 6); ctx.fillRect(44, 68, 3, 6);
  ctx.fillStyle = '#AADDFF';
  ctx.fillRect(20, 66, 2, 4); ctx.fillRect(44, 69, 2, 4);

  // Giant fur boots
  ctx.fillStyle = '#2A1A0A';
  ctx.fillRect(16, 74, 20, 12); ctx.fillRect(40, 74, 20, 12);
  ctx.fillStyle = '#4A3020';
  ctx.fillRect(17, 75, 16, 5); ctx.fillRect(41, 75, 16, 5);
  // Ice spikes on boots
  ctx.fillStyle = '#99DDFF';
  ctx.beginPath(); ctx.moveTo(16,74); ctx.lineTo(13,68); ctx.lineTo(18,74); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(60,74); ctx.lineTo(63,68); ctx.lineTo(58,74); ctx.closePath(); ctx.fill();

  // Belt (massive leather + ice clasp)
  ctx.fillStyle = '#2A1A0A';
  ctx.fillRect(16, 55, 44, 6);
  ctx.fillStyle = '#4A3020';
  ctx.fillRect(17, 56, 42, 4);
  ctx.fillStyle = '#66AACC'; // ice clasp
  rr(ctx, 30, 54, 16, 8, 3); ctx.fill();
  ctx.fillStyle = '#AADDFF';
  rr(ctx, 32, 55, 12, 6, 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(38, 58, 3, 0, Math.PI*2); ctx.fill();

  // Torso (massive, blue-grey skin with frost)
  ctx.fillStyle = '#1A2830';
  rr(ctx, 10, 22, 56, 36, 6); ctx.fill();
  ctx.fillStyle = '#2A3840';
  rr(ctx, 12, 24, 52, 32, 5); ctx.fill();
  // Skin texture / abs
  ctx.fillStyle = '#354A56';
  rr(ctx, 18, 26, 20, 14, 3); ctx.fill();
  rr(ctx, 42, 26, 16, 14, 3); ctx.fill();
  // Ice veins
  ctx.strokeStyle = 'rgba(100,200,255,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(24, 28); ctx.lineTo(28, 38); ctx.lineTo(24, 50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(46, 30); ctx.lineTo(48, 40); ctx.lineTo(44, 50); ctx.stroke();
  // Ice crystals growing from body
  ctx.fillStyle = '#88CCEE';
  [[14,30,4,12],[64,35,4,10],[22,22,3,9],[52,24,3,8]].forEach(([x,y,w,h]) => {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y+4); ctx.lineTo(x+w/2,y-h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#AADDFF';
    ctx.beginPath(); ctx.moveTo(x+1,y-1); ctx.lineTo(x+w-1,y+3); ctx.lineTo(x+w/2,y-h+3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#88CCEE';
  });

  // Left arm (reaching) — massive
  ctx.fillStyle = '#1A2830'; ctx.fillRect(2, 26, 14, 36); // upper arm
  ctx.fillStyle = '#2A3840'; ctx.fillRect(3, 28, 11, 30);
  // Fist (right side — club)
  ctx.fillStyle = '#1A2830'; ctx.fillRect(62, 26, 14, 36);
  ctx.fillStyle = '#2A3840'; ctx.fillRect(63, 28, 11, 30);

  // GIANT CLUB (right hand)
  ctx.fillStyle = '#3A2810'; // handle
  ctx.fillRect(70, 10, 6, 32);
  ctx.fillStyle = '#5A4020'; ctx.fillRect(71, 11, 4, 30);
  // Club head (stone/ice bound)
  ctx.fillStyle = '#4A4A4A';
  ctx.beginPath(); ctx.ellipse(73, 12, 10, 8, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#686868';
  ctx.beginPath(); ctx.ellipse(72, 11, 8, 6, 0, 0, Math.PI*2); ctx.fill();
  // Ice around club head
  ctx.fillStyle = '#66AACC';
  [[66,7,5,8],[76,6,5,8],[70,4,4,6],[77,9,3,5]].forEach(([x,y,w,h]) => {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y+3); ctx.lineTo(x+w/2,y-h); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#AADDFF';
  ctx.beginPath(); ctx.arc(71, 9, 3, 0, Math.PI*2); ctx.fill();

  // Massive hands (knuckles)
  ctx.fillStyle = '#283848';
  [[2,58,14,8],[62,58,14,8]].forEach(([x,y,w,h]) => { rr(ctx,x,y,w,h,3); ctx.fill(); });
  ctx.fillStyle = '#384858';
  [4,8,12].forEach(x => { ctx.beginPath(); ctx.arc(x, 62, 3, 0, Math.PI*2); ctx.fill(); });
  [64,68,72].forEach(x => { ctx.beginPath(); ctx.arc(x, 62, 3, 0, Math.PI*2); ctx.fill(); });

  // Shoulders (pauldrons of ice)
  ctx.fillStyle = '#1A3040';
  ctx.beginPath(); ctx.arc(12, 24, 12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 24, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2A4050';
  ctx.beginPath(); ctx.arc(12, 23, 9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 23, 9, 0, Math.PI*2); ctx.fill();
  // Ice spike on shoulders
  ctx.fillStyle = '#88CCEE';
  ctx.beginPath(); ctx.moveTo(5,18); ctx.lineTo(9,12); ctx.lineTo(13,18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(57,18); ctx.lineTo(61,12); ctx.lineTo(65,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#AADDFF';
  ctx.beginPath(); ctx.arc(9, 13, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(61, 13, 2, 0, Math.PI*2); ctx.fill();

  // HEAD
  // Skull (massive, angular)
  ctx.fillStyle = '#141E28';
  ctx.beginPath(); ctx.ellipse(38, 14, 20, 18, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1E2E3A';
  ctx.beginPath(); ctx.ellipse(38, 13, 18, 16, 0, 0, Math.PI*2); ctx.fill();
  // Skull highlight
  ctx.fillStyle = '#2E3E4A';
  ctx.beginPath(); ctx.ellipse(34, 10, 11, 9, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3A4A5A';
  ctx.beginPath(); ctx.ellipse(33, 8, 7, 6, -0.3, 0, Math.PI*2); ctx.fill();
  // Ice crown / horns
  ctx.fillStyle = '#66AACC';
  [[26,4,5,14],[32,2,5,12],[38,2,5,14],[44,3,5,12],[50,5,5,10]].forEach(([x,y,w,h]) => {
    ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w/2,y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#AADDFF';
    ctx.beginPath(); ctx.arc(x+w/2, y+2, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#66AACC';
  });
  // Beard (frost-covered)
  ctx.fillStyle = '#E8EAF0';
  ctx.beginPath(); ctx.ellipse(38, 27, 14, 8, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#C8CCDA';
  ctx.beginPath(); ctx.ellipse(38, 27, 10, 5, 0, 0, Math.PI); ctx.fill();
  // Ice in beard
  ctx.fillStyle = '#AADDFF';
  ctx.fillRect(30,24,2,6); ctx.fillRect(36,23,2,8); ctx.fillRect(42,24,2,6);

  // EYES (cold, glowing blue)
  ctx.fillStyle = 'rgba(40,160,255,0.25)';
  ctx.beginPath(); ctx.ellipse(30, 14, 7, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(46, 14, 7, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0A1020';
  ctx.beginPath(); ctx.ellipse(30, 14, 5, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(46, 14, 5, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2288CC';
  ctx.beginPath(); ctx.ellipse(30, 14, 3.5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(46, 14, 3.5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#88EEFF';
  ctx.beginPath(); ctx.arc(30, 13, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(46, 13, 1.5, 0, Math.PI*2); ctx.fill();

  return c;
}

// ─── FENRIR WOLF ──────────────────────────────────────────────────────────────
export function makeFenrir() {
  const c = mkCanvas(80, 60); const ctx = c.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(40, 57, 28, 6, 0, 0, Math.PI*2); ctx.fill();

  // Body (main mass) — dark quadruped
  ctx.fillStyle = '#0A0810';
  ctx.beginPath(); ctx.ellipse(38, 36, 30, 16, 0, 0, Math.PI*2); ctx.fill();

  // Fur body (dark with slight purple)
  ctx.fillStyle = '#12101A';
  ctx.beginPath(); ctx.ellipse(38, 35, 27, 14, 0, 0, Math.PI*2); ctx.fill();
  // Underbelly (lighter)
  ctx.fillStyle = '#1E1C28';
  ctx.beginPath(); ctx.ellipse(38, 40, 20, 8, 0, 0, Math.PI*2); ctx.fill();
  // Fur texture lines
  ctx.strokeStyle = '#0A0814'; ctx.lineWidth = 1;
  [[18,30,28,38],[24,28,34,36],[32,27,42,35],[40,28,50,36],[48,30,58,38]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  // Back legs
  ctx.fillStyle = '#0E0C18';
  ctx.fillRect(48, 42, 12, 16); ctx.fillRect(60, 40, 10, 14);
  ctx.fillStyle = '#16141E';
  ctx.fillRect(49, 43, 9, 12); ctx.fillRect(61, 41, 8, 11);
  // Paws (back)
  ctx.fillStyle = '#1A1824';
  ctx.fillRect(46, 56, 14, 4); ctx.fillRect(58, 52, 12, 4);
  ctx.fillStyle = '#0A0812';
  [48,51,54].forEach(x => { ctx.fillRect(x, 57, 2, 3); });
  [60,63,66].forEach(x => { ctx.fillRect(x, 53, 2, 3); });

  // Front legs
  ctx.fillStyle = '#0E0C18';
  ctx.fillRect(14, 40, 12, 18); ctx.fillRect(24, 38, 10, 16);
  ctx.fillStyle = '#16141E';
  ctx.fillRect(15, 41, 9, 14); ctx.fillRect(25, 39, 8, 13);
  // Paws (front)
  ctx.fillStyle = '#1A1824';
  ctx.fillRect(12, 56, 14, 4); ctx.fillRect(22, 52, 12, 4);
  ctx.fillStyle = '#0A0812';
  [14,17,20].forEach(x => { ctx.fillRect(x, 57, 2, 3); });
  [24,27,30].forEach(x => { ctx.fillRect(x, 53, 2, 3); });

  // TAIL (curling up)
  ctx.strokeStyle = '#12101A'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(66, 30); ctx.quadraticCurveTo(76, 20, 70, 14); ctx.stroke();
  ctx.strokeStyle = '#1A1824'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(66, 30); ctx.quadraticCurveTo(76, 20, 70, 14); ctx.stroke();
  ctx.strokeStyle = '#242230'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(66, 30); ctx.quadraticCurveTo(76, 20, 70, 14); ctx.stroke();

  // NECK / HEAD area (left side — wolf faces left)
  ctx.fillStyle = '#0E0C18';
  ctx.beginPath(); ctx.ellipse(16, 30, 14, 11, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#14121E';
  ctx.beginPath(); ctx.ellipse(16, 29, 12, 9, -0.3, 0, Math.PI*2); ctx.fill();

  // HEAD (wolf skull, snarling)
  ctx.fillStyle = '#0A0810';
  ctx.beginPath(); ctx.ellipse(8, 22, 13, 10, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#12101A';
  ctx.beginPath(); ctx.ellipse(8, 21, 11, 8, -0.2, 0, Math.PI*2); ctx.fill();
  // Snout
  ctx.fillStyle = '#0E0C18';
  ctx.beginPath(); ctx.ellipse(2, 26, 8, 5, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#16141E';
  ctx.beginPath(); ctx.ellipse(2, 25, 6, 4, 0.2, 0, Math.PI*2); ctx.fill();
  // Nose
  ctx.fillStyle = '#0A0810';
  ctx.beginPath(); ctx.arc(-1, 24, 3, 0, Math.PI*2); ctx.fill();
  // Nose shine
  ctx.fillStyle = '#2A283A';
  ctx.beginPath(); ctx.arc(-1, 23, 1.5, 0, Math.PI*2); ctx.fill();

  // EARS (pointed, aggressive)
  ctx.fillStyle = '#0A0810';
  ctx.beginPath(); ctx.moveTo(4, 14); ctx.lineTo(-2, 4); ctx.lineTo(10, 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#12101A';
  ctx.beginPath(); ctx.moveTo(5, 14); ctx.lineTo(0, 6); ctx.lineTo(9, 13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A1820'; // inner ear
  ctx.beginPath(); ctx.moveTo(5, 13); ctx.lineTo(1, 7); ctx.lineTo(8, 12); ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#0A0810';
  ctx.beginPath(); ctx.moveTo(13, 12); ctx.lineTo(10, 2); ctx.lineTo(18, 11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#12101A';
  ctx.beginPath(); ctx.moveTo(14, 12); ctx.lineTo(11, 4); ctx.lineTo(17, 11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A1820';
  ctx.beginPath(); ctx.moveTo(14, 12); ctx.lineTo(12, 5); ctx.lineTo(16, 11); ctx.closePath(); ctx.fill();

  // OPEN JAW (teeth)
  ctx.fillStyle = '#0E0C18';
  ctx.beginPath(); ctx.ellipse(1, 30, 7, 4, 0.3, 0, Math.PI*2); ctx.fill();
  // Teeth (fangs, sharp)
  ctx.fillStyle = '#E0DDD0';
  [[-3,27],[-1,26],[1,26],[3,27],[5,27]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+2,y); ctx.lineTo(x+1,y+5); ctx.closePath(); ctx.fill();
  });
  // Lower teeth
  ctx.fillStyle = '#C8C5BA';
  [[-2,32],[1,33],[4,32]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+2,y); ctx.lineTo(x+1,y-4); ctx.closePath(); ctx.fill();
  });
  // Drool
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(2,32); ctx.lineTo(2,36); ctx.stroke();

  // EYES (glowing red/orange — demonic)
  // Outer glow
  ctx.fillStyle = 'rgba(255,60,0,0.25)';
  ctx.beginPath(); ctx.ellipse(7, 20, 5, 4, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, 18, 5, 4, -0.2, 0, Math.PI*2); ctx.fill();
  // Eye socket
  ctx.fillStyle = '#050308';
  ctx.beginPath(); ctx.ellipse(7, 20, 4, 3, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, 18, 4, 3, -0.2, 0, Math.PI*2); ctx.fill();
  // Glowing iris
  ctx.fillStyle = '#CC2200';
  ctx.beginPath(); ctx.ellipse(7, 20, 2.5, 2, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(14, 18, 2.5, 2, -0.2, 0, Math.PI*2); ctx.fill();
  // Slit pupil
  ctx.fillStyle = '#FF4400';
  ctx.beginPath(); ctx.arc(7, 20, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(14, 18, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FF8844'; // bright center
  ctx.beginPath(); ctx.arc(7, 19.5, 0.7, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(14, 17.5, 0.7, 0, Math.PI*2); ctx.fill();

  // Mane spikes
  ctx.fillStyle = '#0A0810';
  [[10,12,14,4],[15,16,20,8],[20,18,26,11],[25,20,30,14]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x1+4,y1+2); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#181624';
  [[11,13,14,6],[16,16,20,9],[21,19,26,12]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x1+3,y1+1); ctx.closePath(); ctx.fill();
  });

  return c;
}

// ─── PROJECTILE (Rune Bolt) ──────────────────────────────────────────────────
export function makeProjectile() {
  const c = mkCanvas(20, 20); const ctx = c.getContext('2d');
  // Outer glow
  ctx.fillStyle = 'rgba(100,200,255,0.15)';
  ctx.beginPath(); ctx.arc(10, 10, 10, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(100,160,255,0.3)';
  ctx.beginPath(); ctx.arc(10, 10, 7, 0, Math.PI*2); ctx.fill();
  // Core
  ctx.fillStyle = '#4488EE';
  ctx.beginPath(); ctx.arc(10, 10, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#88CCFF';
  ctx.beginPath(); ctx.arc(10, 10, 3, 0, Math.PI*2); ctx.fill();
  // Bright center
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(10, 10, 1.5, 0, Math.PI*2); ctx.fill();
  // Rune cross
  ctx.strokeStyle = 'rgba(200,230,255,0.6)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(10,5); ctx.lineTo(10,15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5,10); ctx.lineTo(15,10); ctx.stroke();
  return c;
}

// ─── XP ORB ──────────────────────────────────────────────────────────────────
export function makeXpOrb() {
  const c = mkCanvas(14, 14); const ctx = c.getContext('2d');
  // Glow
  ctx.fillStyle = 'rgba(0,220,120,0.2)';
  ctx.beginPath(); ctx.arc(7, 7, 7, 0, Math.PI*2); ctx.fill();
  // Crystal facets
  ctx.fillStyle = '#00AA66';
  ctx.beginPath();
  ctx.moveTo(7,1); ctx.lineTo(12,7); ctx.lineTo(7,13); ctx.lineTo(2,7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#00CC88';
  ctx.beginPath();
  ctx.moveTo(7,1); ctx.lineTo(12,7); ctx.lineTo(7,8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#44FFAA';
  ctx.beginPath();
  ctx.moveTo(7,2); ctx.lineTo(11,7); ctx.lineTo(7,7); ctx.closePath(); ctx.fill();
  // Sparkle
  ctx.fillStyle = '#AAFFDD';
  ctx.beginPath(); ctx.arc(5, 4, 1.5, 0, Math.PI*2); ctx.fill();
  return c;
}

// ─── CHEST (Treasure Chest) ──────────────────────────────────────────────────
export function makeChest() {
  const c = mkCanvas(32, 28); const ctx = c.getContext('2d');
  // Wood base
  ctx.fillStyle = '#5A3A18';
  rr(ctx, 2, 10, 28, 16, 3); ctx.fill();
  ctx.fillStyle = '#7A5A28';
  rr(ctx, 3, 11, 26, 14, 2); ctx.fill();
  // Lid
  ctx.fillStyle = '#5A3A18';
  rr(ctx, 2, 2, 28, 10, 3); ctx.fill();
  ctx.fillStyle = '#7A5A28';
  rr(ctx, 3, 3, 26, 8, 2); ctx.fill();
  // Gold bands
  ctx.fillStyle = '#C4942A';
  ctx.fillRect(2, 9, 28, 3);
  ctx.fillRect(8, 2, 3, 24);
  ctx.fillRect(21, 2, 3, 24);
  // Lock
  ctx.fillStyle = '#C4942A';
  ctx.beginPath(); ctx.arc(16, 15, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#E5C05A';
  ctx.beginPath(); ctx.arc(16, 15, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8A6010';
  ctx.fillRect(14, 15, 4, 4); // keyhole
  ctx.beginPath(); ctx.arc(16, 14, 2, 0, Math.PI*2); ctx.fill();
  // Gold trim
  ctx.strokeStyle = '#C4942A'; ctx.lineWidth = 1;
  rr(ctx, 2, 2, 28, 24, 3); ctx.stroke();
  // Shine
  ctx.fillStyle = 'rgba(255,220,100,0.15)';
  rr(ctx, 4, 4, 10, 5, 2); ctx.fill();
  return c;
}

// ─── GOD PORTRAITS (96×96, circle-clipped pixel-art faces) ───────────────────
export function makePortraitOdin() {
  const c = mkCanvas(96, 96); const ctx = c.getContext('2d');
  // Background
  ctx.fillStyle = '#0d0620'; ctx.fillRect(0, 0, 96, 96);
  const bg = ctx.createRadialGradient(48, 40, 5, 48, 52, 52);
  bg.addColorStop(0, 'rgba(60,20,120,0.45)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 96, 96);
  // Shoulders / cloak
  ctx.fillStyle = '#120830';
  ctx.beginPath(); ctx.moveTo(0,96); ctx.lineTo(96,96); ctx.lineTo(82,70);
  ctx.lineTo(58,64); ctx.lineTo(48,66); ctx.lineTo(38,64); ctx.lineTo(14,70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1e1045';
  ctx.beginPath(); ctx.moveTo(16,72); ctx.lineTo(36,66); ctx.lineTo(48,68);
  ctx.lineTo(62,66); ctx.lineTo(80,72); ctx.lineTo(80,96); ctx.lineTo(16,96); ctx.closePath(); ctx.fill();
  // Gold clasp
  ctx.fillStyle = '#c4942a'; ctx.beginPath(); ctx.arc(48,66,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e5c05a'; ctx.beginPath(); ctx.arc(48,65,3,0,Math.PI*2); ctx.fill();
  // Beard
  ctx.fillStyle = '#b0a898';
  ctx.beginPath(); ctx.moveTo(28,52); ctx.lineTo(22,70); ctx.lineTo(35,76);
  ctx.lineTo(48,80); ctx.lineTo(61,76); ctx.lineTo(74,70); ctx.lineTo(68,52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d0c8c0';
  ctx.beginPath(); ctx.moveTo(32,52); ctx.lineTo(27,68); ctx.lineTo(38,74);
  ctx.lineTo(48,78); ctx.lineTo(58,74); ctx.lineTo(69,68); ctx.lineTo(64,52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#a09888'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(40,53); ctx.lineTo(37,72); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(48,54); ctx.lineTo(48,78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(56,53); ctx.lineTo(59,72); ctx.stroke();
  // Face
  ctx.fillStyle = '#9a8060'; ctx.beginPath(); ctx.ellipse(48,44,24,22,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8a7050'; ctx.beginPath(); ctx.ellipse(48,46,22,18,0,0.7*Math.PI,2.5*Math.PI); ctx.fill();
  // Grey hair sides
  ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(24,24); ctx.lineTo(20,38); ctx.lineTo(22,52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22,26); ctx.lineTo(19,40); ctx.lineTo(21,54); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(72,24); ctx.lineTo(76,38); ctx.lineTo(74,52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(74,26); ctx.lineTo(77,40); ctx.lineTo(75,54); ctx.stroke();
  // Hat brim
  ctx.fillStyle = '#15120a'; ctx.beginPath(); ctx.ellipse(48,24,34,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#201a10'; ctx.beginPath(); ctx.ellipse(48,23,31,5.5,0,0,Math.PI*2); ctx.fill();
  // Hat crown
  ctx.fillStyle = '#15120a';
  ctx.beginPath(); ctx.moveTo(20,24); ctx.lineTo(26,6); ctx.lineTo(70,6); ctx.lineTo(76,24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#201a10';
  ctx.beginPath(); ctx.moveTo(23,24); ctx.lineTo(28,8); ctx.lineTo(68,8); ctx.lineTo(73,24); ctx.closePath(); ctx.fill();
  // Gold hat band
  ctx.fillStyle = '#c4942a'; ctx.beginPath(); ctx.ellipse(48,24,32,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e5c05a'; ctx.fillRect(26,22,44,2);
  ctx.fillStyle = '#9977cc'; ctx.font = 'bold 11px serif'; ctx.textAlign = 'center'; ctx.fillText('ᚩ',48,20); ctx.textAlign = 'left';
  // Left eye (seeing eye — bright blue)
  ctx.fillStyle = '#7a5a30'; ctx.beginPath(); ctx.ellipse(37,43,9,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2255aa'; ctx.beginPath(); ctx.ellipse(37,43,7,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1133aa'; ctx.beginPath(); ctx.ellipse(37,43,5,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#88bbff'; ctx.beginPath(); ctx.arc(37,43,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(150,200,255,0.6)'; ctx.beginPath(); ctx.arc(35,41,1.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#c8c0b0'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(28,37); ctx.lineTo(46,36); ctx.stroke();
  // Right eye (empty socket — given to Mimir)
  ctx.fillStyle = '#5a3a18'; ctx.beginPath(); ctx.ellipse(59,43,9,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a0808'; ctx.beginPath(); ctx.ellipse(59,43,7,4.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0a0404'; ctx.beginPath(); ctx.ellipse(59,43,5,3,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#6a3818'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(50,40); ctx.quadraticCurveTo(59,38,68,40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50,47); ctx.quadraticCurveTo(59,49,68,47); ctx.stroke();
  ctx.strokeStyle = '#c8c0b0'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(50,37); ctx.lineTo(68,36); ctx.stroke();
  // Nose
  ctx.fillStyle = '#806040';
  ctx.beginPath(); ctx.moveTo(44,48); ctx.lineTo(42,56); ctx.lineTo(54,56); ctx.lineTo(52,48); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6a5030';
  ctx.beginPath(); ctx.ellipse(44,56,3,2,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(52,56,3,2,0.2,0,Math.PI*2); ctx.fill();
  // Mouth (stern)
  ctx.fillStyle = '#6a4020'; ctx.fillRect(38,59,20,3);
  ctx.fillStyle = '#4a2810'; ctx.fillRect(39,60,18,1.5);
  // Circle clip
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48,48,48,0,Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

export function makePortraitThor() {
  const c = mkCanvas(96, 96); const ctx = c.getContext('2d');
  // Background
  ctx.fillStyle = '#150800'; ctx.fillRect(0, 0, 96, 96);
  const bg = ctx.createRadialGradient(48,40,5,48,52,52);
  bg.addColorStop(0,'rgba(255,160,0,0.15)'); bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,96,96);
  // Lightning (bg)
  ctx.strokeStyle = 'rgba(255,200,50,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(12,8); ctx.lineTo(18,22); ctx.lineTo(14,22); ctx.lineTo(20,36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(76,10); ctx.lineTo(80,24); ctx.lineTo(76,24); ctx.lineTo(82,38); ctx.stroke();
  // Shoulders
  ctx.fillStyle = '#2a2018';
  ctx.beginPath(); ctx.moveTo(0,96); ctx.lineTo(96,96); ctx.lineTo(84,68);
  ctx.lineTo(60,62); ctx.lineTo(48,64); ctx.lineTo(36,62); ctx.lineTo(12,68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a3028';
  ctx.beginPath(); ctx.moveTo(14,70); ctx.lineTo(36,64); ctx.lineTo(48,66);
  ctx.lineTo(60,64); ctx.lineTo(82,70); ctx.lineTo(82,96); ctx.lineTo(14,96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#555040';
  [[20,72],[36,68],[60,68],[76,72],[28,80],[68,80]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
  });
  // Red hair (sides)
  ctx.fillStyle = '#8a2800';
  ctx.beginPath(); ctx.moveTo(16,24); ctx.lineTo(10,44); ctx.lineTo(14,60); ctx.lineTo(22,60); ctx.lineTo(26,46); ctx.lineTo(24,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#aa3800';
  ctx.beginPath(); ctx.moveTo(18,24); ctx.lineTo(13,42); ctx.lineTo(16,58); ctx.lineTo(22,58); ctx.lineTo(25,44); ctx.lineTo(23,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a2800';
  ctx.beginPath(); ctx.moveTo(80,24); ctx.lineTo(86,44); ctx.lineTo(82,60); ctx.lineTo(74,60); ctx.lineTo(70,46); ctx.lineTo(72,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#aa3800';
  ctx.beginPath(); ctx.moveTo(78,24); ctx.lineTo(83,42); ctx.lineTo(80,58); ctx.lineTo(74,58); ctx.lineTo(71,44); ctx.lineTo(73,28); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#cc5522'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(19,26); ctx.lineTo(15,50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(77,26); ctx.lineTo(81,50); ctx.stroke();
  // Iron helmet
  ctx.fillStyle = '#3a3828'; ctx.beginPath(); ctx.ellipse(48,28,28,18,0,Math.PI,0,true); ctx.fill();
  ctx.fillStyle = '#3a3828'; ctx.beginPath(); ctx.ellipse(48,26,26,20,0,0,Math.PI); ctx.fill();
  ctx.fillStyle = '#4a4838'; ctx.beginPath(); ctx.ellipse(48,26,24,18,0,0,Math.PI); ctx.fill();
  // Ridge
  ctx.fillStyle = '#5a5040'; ctx.fillRect(44,6,8,24); ctx.fillStyle = '#6a6050'; ctx.fillRect(45,7,6,22);
  // Brim
  ctx.fillStyle = '#2a2818'; ctx.beginPath(); ctx.ellipse(48,28,30,6,0,0,Math.PI); ctx.fill();
  ctx.fillStyle = '#3a3828'; ctx.beginPath(); ctx.ellipse(48,27,28,5,0,0,Math.PI); ctx.fill();
  // Nasal guard
  ctx.fillStyle = '#4a4838'; ctx.fillRect(45,28,6,16); ctx.fillStyle = '#5a5848'; ctx.fillRect(46,28,4,14);
  // Cheek guards
  ctx.fillStyle = '#383628'; ctx.fillRect(20,28,8,20); ctx.fillRect(68,28,8,20);
  ctx.fillStyle = '#484638'; ctx.fillRect(21,29,6,17); ctx.fillRect(69,29,6,17);
  // Wings on helmet
  ctx.fillStyle = '#c0a840';
  ctx.beginPath(); ctx.moveTo(19,22); ctx.lineTo(8,12); ctx.lineTo(22,20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(77,22); ctx.lineTo(88,12); ctx.lineTo(74,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0c860';
  ctx.beginPath(); ctx.moveTo(20,22); ctx.lineTo(10,13); ctx.lineTo(22,21); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(76,22); ctx.lineTo(86,13); ctx.lineTo(74,21); ctx.closePath(); ctx.fill();
  // Face
  ctx.fillStyle = '#c06040'; ctx.beginPath(); ctx.ellipse(48,44,22,18,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d07050'; ctx.beginPath(); ctx.ellipse(46,42,19,15,-0.1,0,Math.PI*2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#5a3010'; ctx.beginPath(); ctx.ellipse(37,40,8,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4477aa'; ctx.beginPath(); ctx.ellipse(37,40,6,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2255aa'; ctx.beginPath(); ctx.ellipse(37,40,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#88bbff'; ctx.beginPath(); ctx.arc(36,39,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#5a3010'; ctx.beginPath(); ctx.ellipse(59,40,8,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4477aa'; ctx.beginPath(); ctx.ellipse(59,40,6,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#2255aa'; ctx.beginPath(); ctx.ellipse(59,40,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#88bbff'; ctx.beginPath(); ctx.arc(58,39,1.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#aa4422'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(29,34); ctx.lineTo(45,35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(51,35); ctx.lineTo(67,34); ctx.stroke();
  // Nose
  ctx.fillStyle = '#b05030';
  ctx.beginPath(); ctx.moveTo(44,44); ctx.lineTo(42,53); ctx.lineTo(54,53); ctx.lineTo(52,44); ctx.closePath(); ctx.fill();
  // Red beard
  ctx.fillStyle = '#6a1800';
  ctx.beginPath(); ctx.moveTo(26,52); ctx.lineTo(20,68); ctx.lineTo(30,74); ctx.lineTo(48,78); ctx.lineTo(66,74); ctx.lineTo(76,68); ctx.lineTo(70,52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a2800';
  ctx.beginPath(); ctx.moveTo(30,52); ctx.lineTo(25,66); ctx.lineTo(34,72); ctx.lineTo(48,76); ctx.lineTo(62,72); ctx.lineTo(71,66); ctx.lineTo(66,52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#aa3800';
  ctx.beginPath(); ctx.moveTo(34,52); ctx.lineTo(30,64); ctx.lineTo(38,70); ctx.lineTo(48,74); ctx.lineTo(58,70); ctx.lineTo(66,64); ctx.lineTo(62,52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#cc5522'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(40,53); ctx.lineTo(37,70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(48,53); ctx.lineTo(48,76); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(56,53); ctx.lineTo(59,70); ctx.stroke();
  // Braid clasp
  ctx.fillStyle = '#c4942a'; ctx.beginPath(); ctx.arc(48,66,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e5c05a'; ctx.beginPath(); ctx.arc(48,65,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6a2010'; ctx.fillRect(38,52,20,3);
  // Circle clip
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48,48,48,0,Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

export function makePortraitFreya() {
  const c = mkCanvas(96, 96); const ctx = c.getContext('2d');
  // Background
  ctx.fillStyle = '#150010'; ctx.fillRect(0,0,96,96);
  const bg = ctx.createRadialGradient(48,40,5,48,52,52);
  bg.addColorStop(0,'rgba(180,60,100,0.22)'); bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,96,96);
  // Shoulders / dress
  ctx.fillStyle = '#1a0814';
  ctx.beginPath(); ctx.moveTo(0,96); ctx.lineTo(96,96); ctx.lineTo(82,70); ctx.lineTo(58,64); ctx.lineTo(48,65); ctx.lineTo(38,64); ctx.lineTo(14,70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1020';
  ctx.beginPath(); ctx.moveTo(14,72); ctx.lineTo(36,66); ctx.lineTo(48,67); ctx.lineTo(60,66); ctx.lineTo(82,72); ctx.lineTo(82,96); ctx.lineTo(14,96); ctx.closePath(); ctx.fill();
  // Brisingamen necklace
  ctx.strokeStyle = '#c4942a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(48,64,12,0.1*Math.PI,0.9*Math.PI); ctx.stroke();
  ctx.fillStyle = '#c4942a';
  [[36,68],[42,71],[48,72],[54,71],[60,68]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle = '#ff88cc';
  [[36,68],[42,71],[48,72],[54,71],[60,68]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); });
  // Golden hair left
  ctx.fillStyle = '#8a6a10';
  ctx.beginPath(); ctx.moveTo(24,16); ctx.lineTo(8,34); ctx.lineTo(6,56); ctx.lineTo(14,66); ctx.lineTo(22,62); ctx.lineTo(26,48); ctx.lineTo(24,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b08820';
  ctx.beginPath(); ctx.moveTo(26,16); ctx.lineTo(12,34); ctx.lineTo(10,54); ctx.lineTo(17,63); ctx.lineTo(24,60); ctx.lineTo(28,46); ctx.lineTo(26,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d4aa2a';
  ctx.beginPath(); ctx.moveTo(28,17); ctx.lineTo(16,34); ctx.lineTo(14,52); ctx.lineTo(20,62); ctx.lineTo(26,59); ctx.lineTo(30,46); ctx.lineTo(28,28); ctx.closePath(); ctx.fill();
  // Golden hair right
  ctx.fillStyle = '#8a6a10';
  ctx.beginPath(); ctx.moveTo(72,16); ctx.lineTo(88,34); ctx.lineTo(90,56); ctx.lineTo(82,66); ctx.lineTo(74,62); ctx.lineTo(70,48); ctx.lineTo(72,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b08820';
  ctx.beginPath(); ctx.moveTo(70,16); ctx.lineTo(84,34); ctx.lineTo(86,54); ctx.lineTo(79,63); ctx.lineTo(72,60); ctx.lineTo(68,46); ctx.lineTo(70,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d4aa2a';
  ctx.beginPath(); ctx.moveTo(68,17); ctx.lineTo(80,34); ctx.lineTo(82,52); ctx.lineTo(76,62); ctx.lineTo(70,59); ctx.lineTo(66,46); ctx.lineTo(68,28); ctx.closePath(); ctx.fill();
  // Hair top
  ctx.fillStyle = '#c09020';
  ctx.beginPath(); ctx.moveTo(28,14); ctx.lineTo(48,10); ctx.lineTo(68,14); ctx.lineTo(66,28); ctx.lineTo(48,26); ctx.lineTo(30,28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0b830';
  ctx.beginPath(); ctx.moveTo(30,14); ctx.lineTo(48,11); ctx.lineTo(66,14); ctx.lineTo(64,26); ctx.lineTo(48,24); ctx.lineTo(32,26); ctx.closePath(); ctx.fill();
  // Flower crown
  ctx.fillStyle = '#cc4488';
  [[34,14],[42,10],[52,10],[60,14],[48,8]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle = '#ff88cc';
  [[34,14],[42,10],[52,10],[60,14],[48,8]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle = '#ffeeaa';
  [[34,14],[42,10],[52,10],[60,14],[48,8]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill(); });
  // Face
  ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.ellipse(48,44,20,22,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f8d8b0'; ctx.beginPath(); ctx.ellipse(46,42,17,19,-0.05,0,Math.PI*2); ctx.fill();
  // Eyes (green)
  ctx.fillStyle = '#b08878'; ctx.beginPath(); ctx.ellipse(37,42,8,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#22aa88'; ctx.beginPath(); ctx.ellipse(37,42,6,4.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#118855'; ctx.beginPath(); ctx.ellipse(37,42,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aaffdd'; ctx.beginPath(); ctx.arc(36,41,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#b08878'; ctx.beginPath(); ctx.ellipse(59,42,8,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#22aa88'; ctx.beginPath(); ctx.ellipse(59,42,6,4.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#118855'; ctx.beginPath(); ctx.ellipse(59,42,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aaffdd'; ctx.beginPath(); ctx.arc(58,41,1.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#6a3820'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(29,40); ctx.quadraticCurveTo(37,37,45,40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(51,40); ctx.quadraticCurveTo(59,37,67,40); ctx.stroke();
  ctx.strokeStyle = '#b08828'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(29,36); ctx.quadraticCurveTo(37,33,45,36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(51,36); ctx.quadraticCurveTo(59,33,67,36); ctx.stroke();
  // Nose
  ctx.fillStyle = '#d0a888';
  ctx.beginPath(); ctx.moveTo(45,46); ctx.lineTo(43,54); ctx.lineTo(53,54); ctx.lineTo(51,46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c09878';
  ctx.beginPath(); ctx.ellipse(44,54,3,2,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(52,54,3,2,0.2,0,Math.PI*2); ctx.fill();
  // Smile
  ctx.fillStyle = '#cc6688';
  ctx.beginPath(); ctx.moveTo(38,60); ctx.quadraticCurveTo(48,65,58,60); ctx.quadraticCurveTo(56,58,48,58); ctx.quadraticCurveTo(40,58,38,60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff88aa';
  ctx.beginPath(); ctx.moveTo(40,60); ctx.quadraticCurveTo(48,63,56,60); ctx.quadraticCurveTo(54,59,48,59); ctx.quadraticCurveTo(42,59,40,60); ctx.closePath(); ctx.fill();
  // Circle clip
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48,48,48,0,Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

export function makePortraitLoki() {
  const c = mkCanvas(96, 96); const ctx = c.getContext('2d');
  // Background
  ctx.fillStyle = '#020e10'; ctx.fillRect(0,0,96,96);
  const bg = ctx.createRadialGradient(48,40,5,48,52,52);
  bg.addColorStop(0,'rgba(0,180,80,0.18)'); bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,96,96);
  // Snake bg
  ctx.strokeStyle = 'rgba(0,120,60,0.2)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(80,6); ctx.quadraticCurveTo(90,30,82,48); ctx.quadraticCurveTo(72,62,82,78); ctx.stroke();
  // Shoulders
  ctx.fillStyle = '#080f0c';
  ctx.beginPath(); ctx.moveTo(0,96); ctx.lineTo(96,96); ctx.lineTo(82,68); ctx.lineTo(58,62); ctx.lineTo(48,64); ctx.lineTo(38,62); ctx.lineTo(14,68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0f1a16';
  ctx.beginPath(); ctx.moveTo(14,70); ctx.lineTo(36,64); ctx.lineTo(48,66); ctx.lineTo(60,64); ctx.lineTo(82,70); ctx.lineTo(82,96); ctx.lineTo(14,96); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,200,80,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(14,70); ctx.lineTo(36,64); ctx.lineTo(48,66); ctx.lineTo(60,64); ctx.lineTo(82,70); ctx.stroke();
  // Dark hair left
  ctx.fillStyle = '#060e0c';
  ctx.beginPath(); ctx.moveTo(22,14); ctx.lineTo(18,34); ctx.lineTo(20,48); ctx.lineTo(26,52); ctx.lineTo(28,38); ctx.lineTo(26,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a1a14';
  ctx.beginPath(); ctx.moveTo(24,14); ctx.lineTo(21,33); ctx.lineTo(22,47); ctx.lineTo(27,51); ctx.lineTo(29,37); ctx.lineTo(27,20); ctx.closePath(); ctx.fill();
  // Dark hair right (shorter)
  ctx.fillStyle = '#060e0c';
  ctx.beginPath(); ctx.moveTo(70,14); ctx.lineTo(76,28); ctx.lineTo(74,40); ctx.lineTo(68,44); ctx.lineTo(66,34); ctx.lineTo(68,18); ctx.closePath(); ctx.fill();
  // Hair top
  ctx.fillStyle = '#080f0c';
  ctx.beginPath(); ctx.moveTo(26,12); ctx.lineTo(48,8); ctx.lineTo(68,14); ctx.lineTo(66,26); ctx.lineTo(48,22); ctx.lineTo(28,18); ctx.closePath(); ctx.fill();
  // Green highlight on hair
  ctx.strokeStyle = 'rgba(0,200,80,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(26,14); ctx.lineTo(23,34); ctx.lineTo(25,48); ctx.stroke();
  // Face (pale, angular)
  ctx.fillStyle = '#c0c8b8'; ctx.beginPath(); ctx.ellipse(48,44,22,22,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d0d8c8'; ctx.beginPath(); ctx.ellipse(46,42,19,19,-0.05,0,Math.PI*2); ctx.fill();
  // Angular jaw
  ctx.fillStyle = '#b0b8a8';
  ctx.beginPath(); ctx.moveTo(28,44); ctx.lineTo(26,58); ctx.lineTo(48,66); ctx.lineTo(70,58); ctx.lineTo(68,44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c0c8b8';
  ctx.beginPath(); ctx.moveTo(30,44); ctx.lineTo(29,57); ctx.lineTo(48,64); ctx.lineTo(67,57); ctx.lineTo(66,44); ctx.closePath(); ctx.fill();
  // Left eye (green)
  ctx.fillStyle = '#6a7a60'; ctx.beginPath(); ctx.ellipse(36,42,9,5.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#00aa44'; ctx.beginPath(); ctx.ellipse(36,42,7,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#008833'; ctx.beginPath(); ctx.ellipse(36,42,4.5,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aaffcc'; ctx.beginPath(); ctx.arc(35,41,1.5,0,Math.PI*2); ctx.fill();
  // Right eye (amber — mischievous)
  ctx.fillStyle = '#6a7a60'; ctx.beginPath(); ctx.ellipse(60,41,9,5.5,0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#cc8800'; ctx.beginPath(); ctx.ellipse(60,41,7,4,0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#996600'; ctx.beginPath(); ctx.ellipse(60,41,4.5,3,0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffdd88'; ctx.beginPath(); ctx.arc(59,40,1.5,0,Math.PI*2); ctx.fill();
  // Eyebrows (sharp, asymmetric)
  ctx.strokeStyle = '#222a20'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(27,35); ctx.lineTo(43,37); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(53,36); ctx.lineTo(69,33); ctx.stroke();
  // Nose (sharp)
  ctx.fillStyle = '#a0a898';
  ctx.beginPath(); ctx.moveTo(46,46); ctx.lineTo(44,55); ctx.lineTo(52,55); ctx.lineTo(50,46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#909888';
  ctx.beginPath(); ctx.ellipse(45,55,2.5,1.5,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(51,55,2.5,1.5,0.2,0,Math.PI*2); ctx.fill();
  // Sewn mouth (Loki's lips were stitched shut)
  ctx.fillStyle = '#6a6860'; ctx.fillRect(34,60,28,3);
  ctx.strokeStyle = '#505848'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(34,61); ctx.quadraticCurveTo(48,59,62,61); ctx.stroke();
  ctx.strokeStyle = '#2a3828'; ctx.lineWidth = 1;
  for (let x = 36; x <= 60; x += 6) {
    ctx.beginPath(); ctx.moveTo(x,58); ctx.lineTo(x,64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-2,58); ctx.lineTo(x+2,58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-2,64); ctx.lineTo(x+2,64); ctx.stroke();
  }
  // Smirk at right corner
  ctx.strokeStyle = '#404838'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(58,60); ctx.quadraticCurveTo(64,58,66,56); ctx.stroke();
  // Circle clip
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48,48,48,0,Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

// ─── Register all sprites in a Phaser scene ──────────────────────────────────
// ─── BIOME TILE TEXTURES ──────────────────────────────────────────────────────
export function makeTileMidgard() {
  const c = mkCanvas(128, 128); const ctx = c.getContext('2d');
  const tiles = [[0,0,'#111a11'],[64,0,'#141e14'],[0,64,'#141e14'],[64,64,'#111a11']];
  tiles.forEach(([tx,ty,col]) => {
    ctx.fillStyle = col; ctx.fillRect(tx+1, ty+1, 62, 62);
  });
  // Moss patches
  ctx.fillStyle = 'rgba(28,52,25,0.75)'; ctx.fillRect(1,1,18,18); ctx.fillRect(65,65,18,18);
  ctx.fillStyle = 'rgba(26,48,23,0.55)'; ctx.fillRect(109,5,17,17); ctx.fillRect(5,109,17,17);
  // Grout
  ctx.strokeStyle = '#090f09'; ctx.lineWidth = 1;
  [[0,0],[64,0],[0,64],[64,64]].forEach(([tx,ty]) => ctx.strokeRect(tx+0.5,ty+0.5,63,63));
  // Stone crack
  ctx.strokeStyle = 'rgba(13,22,13,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(74,22); ctx.lineTo(110,54); ctx.stroke();
  return c;
}

export function makeTileJotunheim() {
  const c = mkCanvas(128, 128); const ctx = c.getContext('2d');
  const tiles = [[0,0,'#080f1c'],[64,0,'#0e1a2c'],[0,64,'#0e1a2c'],[64,64,'#080f1c']];
  tiles.forEach(([tx,ty,col]) => {
    ctx.fillStyle = col; ctx.fillRect(tx+1, ty+1, 62, 62);
  });
  // Frost crack veins
  ctx.strokeStyle = 'rgba(30,68,136,0.38)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(6,24); ctx.lineTo(46,56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(84,8); ctx.lineTo(124,40); ctx.stroke();
  ctx.strokeStyle = 'rgba(34,85,170,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(18,64+5); ctx.lineTo(58,64+42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(64+20,64+3); ctx.lineTo(64+58,64+38); ctx.stroke();
  // Frost corner shards
  ctx.fillStyle = 'rgba(51,102,187,0.18)';
  ctx.beginPath(); ctx.moveTo(1,1); ctx.lineTo(22,1); ctx.lineTo(1,22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(65,65); ctx.lineTo(86,65); ctx.lineTo(65,86); ctx.closePath(); ctx.fill();
  // Grout
  ctx.strokeStyle = '#050c18'; ctx.lineWidth = 1;
  [[0,0],[64,0],[0,64],[64,64]].forEach(([tx,ty]) => ctx.strokeRect(tx+0.5,ty+0.5,63,63));
  return c;
}

export function makeTileHelheim() {
  const c = mkCanvas(128, 128); const ctx = c.getContext('2d');
  const tiles = [[0,0,'#130808'],[64,0,'#1b0d0d'],[0,64,'#1b0d0d'],[64,64,'#130808']];
  tiles.forEach(([tx,ty,col]) => {
    ctx.fillStyle = col; ctx.fillRect(tx+1, ty+1, 62, 62);
  });
  // Ash patches
  ctx.fillStyle = 'rgba(34,16,16,0.55)'; ctx.fillRect(8,8,14,14); ctx.fillRect(80,74,12,12);
  // Ember dots
  ctx.fillStyle = 'rgba(204,34,0,0.18)';
  ctx.beginPath(); ctx.arc(48,48,7,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(110,110,6,0,Math.PI*2); ctx.fill();
  // Bone seam lines
  ctx.strokeStyle = 'rgba(64,64,60,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(8,32); ctx.lineTo(56,36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(72,96); ctx.lineTo(120,100); ctx.stroke();
  // Grout
  ctx.strokeStyle = '#0e0606'; ctx.lineWidth = 1;
  [[0,0],[64,0],[0,64],[64,64]].forEach(([tx,ty]) => ctx.strokeRect(tx+0.5,ty+0.5,63,63));
  return c;
}

export function registerAllSprites(scene) {
  const pairs = [
    ['krieger',      makeKrieger()],
    ['player',       makeKrieger()],   // default player = krieger
    ['schatten',     makeSchatten()],
    ['magier',       makeMagier()],
    ['enemy_draugr', makeDraugr()],
    ['enemy_fenrir_wolf', makeFenrir()],
    ['enemy_jotunn', makeJotunn()],
    ['projectile',   makeProjectile()],
    ['xp_orb',       makeXpOrb()],
    ['chest',        makeChest()],
    ['tile_midgard',    makeTileMidgard()],
    ['tile_jotunheim',  makeTileJotunheim()],
    ['tile_helheim',    makeTileHelheim()],
    ['portrait_odin',   makePortraitOdin()],
    ['portrait_thor',   makePortraitThor()],
    ['portrait_freya',  makePortraitFreya()],
    ['portrait_loki',   makePortraitLoki()],
  ];
  for (const [key, canvas] of pairs) {
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, canvas);
    }
  }
}
