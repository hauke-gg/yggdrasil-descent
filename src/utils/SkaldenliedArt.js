/**
 * SkaldenliedArt — painterly procedural art for the Skaldenlied prototype.
 *
 * Uses raw Canvas 2D (radial gradients, blend modes, multi-pass shading) to
 * push the procedural sprites and environment past the "Lego-Roboter" stage
 * without yet committing to Aseprite asset budget. Sprint 1.5 polish, before
 * the proper Aseprite pipeline in Sprint 2.
 */

const NEAR_BLACK = '#1A1820';
const MIDGARD_GOLD = '#C9A961';
const GOLD_LIGHT = '#FFD66B';
const PALE_BONE = '#E8DCC0';

/**
 * Painterly skald — hooded silhouette, bone-staff, pale face under the hood,
 * subtle Vegvísir-glow on the forehead. 96×96 canvas, character ~80px tall.
 */
export function createSkaldTexture(scene, key = 'skald_sprite') {
  if (scene.textures.exists(key)) return key;
  const size = 96;
  const tex = scene.textures.createCanvas(key, size, size);
  const ctx = tex.getContext();

  // === Drop shadow ===
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(48, 86, 0, 48, 86, 24);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.55)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(20, 78, 56, 16);
  ctx.restore();

  // === Cloak base (silhouette, dark midnight blue with gradient) ===
  ctx.save();
  const cloakGrad = ctx.createLinearGradient(0, 18, 0, 86);
  cloakGrad.addColorStop(0, '#2C2540');
  cloakGrad.addColorStop(0.5, '#1F1A30');
  cloakGrad.addColorStop(1, '#0E0A18');
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  // Hood-tipped cloak: pyramid top widens to bottom drop
  ctx.moveTo(48, 12);
  ctx.lineTo(36, 24);
  ctx.bezierCurveTo(24, 32, 18, 50, 22, 78);
  ctx.bezierCurveTo(26, 86, 70, 86, 74, 78);
  ctx.bezierCurveTo(78, 50, 72, 32, 60, 24);
  ctx.lineTo(48, 12);
  ctx.closePath();
  ctx.fill();
  // Inner shadow at left side
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.moveTo(42, 18);
  ctx.bezierCurveTo(30, 30, 24, 55, 28, 80);
  ctx.lineTo(40, 80);
  ctx.bezierCurveTo(36, 55, 40, 30, 48, 18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === Gold rim of the hood (the only catch-light) ===
  ctx.save();
  ctx.strokeStyle = MIDGARD_GOLD;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(36, 24);
  ctx.bezierCurveTo(42, 18, 54, 18, 60, 24);
  ctx.stroke();
  // Subtle thread down the cloak
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(48, 24);
  ctx.lineTo(48, 76);
  ctx.stroke();
  ctx.restore();

  // === Pale face under the hood ===
  ctx.save();
  const faceGrad = ctx.createRadialGradient(48, 32, 0, 48, 32, 10);
  faceGrad.addColorStop(0, '#D8CDB9');
  faceGrad.addColorStop(1, '#3A3242');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(48, 32, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lower-face shadow (hood occlusion)
  ctx.fillStyle = 'rgba(8,4,18,0.6)';
  ctx.beginPath();
  ctx.ellipse(48, 36, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === Vegvísir rune glow on forehead ===
  ctx.save();
  ctx.fillStyle = GOLD_LIGHT;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(48, 28, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Soft outer glow
  const glow = ctx.createRadialGradient(48, 28, 0, 48, 28, 6);
  glow.addColorStop(0, 'rgba(255,214,107,0.45)');
  glow.addColorStop(1, 'rgba(255,214,107,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(38, 18, 20, 20);
  ctx.restore();

  // === Bone-staff (rises diagonally up-right) ===
  ctx.save();
  // Staff shaft
  const shaftGrad = ctx.createLinearGradient(60, 60, 78, 16);
  shaftGrad.addColorStop(0, '#A89A78');
  shaftGrad.addColorStop(0.5, PALE_BONE);
  shaftGrad.addColorStop(1, '#7A6E50');
  ctx.strokeStyle = shaftGrad;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(60, 62);
  ctx.lineTo(78, 16);
  ctx.stroke();
  // Bone-wrap rings
  ctx.strokeStyle = '#3A3024';
  ctx.lineWidth = 0.8;
  [40, 32, 24].forEach((y) => {
    const xc = 60 + (78 - 60) * ((62 - y) / (62 - 16));
    ctx.beginPath();
    ctx.moveTo(xc - 2.4, y - 0.6);
    ctx.lineTo(xc + 2.4, y + 0.6);
    ctx.stroke();
  });
  // Crystal at the top — amber glow
  ctx.fillStyle = '#FFB45A';
  ctx.beginPath();
  ctx.arc(78, 16, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFE5B0';
  ctx.beginPath();
  ctx.arc(77.2, 15.3, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Outer crystal glow
  const crystalGlow = ctx.createRadialGradient(78, 16, 0, 78, 16, 12);
  crystalGlow.addColorStop(0, 'rgba(255,180,90,0.45)');
  crystalGlow.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.fillStyle = crystalGlow;
  ctx.fillRect(66, 4, 24, 24);
  ctx.restore();

  tex.refresh();
  return key;
}

/**
 * Painterly draugr — hunched skull-corpse with pulsing red eye-sockets and
 * tattered shroud. 80×80 canvas, character ~64px tall.
 */
export function createDraugrTexture(scene, key = 'draugr_sprite') {
  if (scene.textures.exists(key)) return key;
  const size = 80;
  const tex = scene.textures.createCanvas(key, size, size);
  const ctx = tex.getContext();

  // === Drop shadow ===
  ctx.save();
  const shadowGrad = ctx.createRadialGradient(40, 72, 0, 40, 72, 22);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(14, 66, 52, 14);
  ctx.restore();

  // === Tattered shroud silhouette ===
  ctx.save();
  const bodyGrad = ctx.createLinearGradient(0, 18, 0, 70);
  bodyGrad.addColorStop(0, '#4A4254');
  bodyGrad.addColorStop(0.6, '#322A3E');
  bodyGrad.addColorStop(1, '#1A1422');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Hunched torso silhouette
  ctx.moveTo(40, 18);
  ctx.bezierCurveTo(28, 22, 22, 32, 22, 46);
  ctx.bezierCurveTo(20, 56, 24, 70, 30, 72);
  // Tattered bottom edge
  ctx.lineTo(34, 66);
  ctx.lineTo(38, 72);
  ctx.lineTo(42, 64);
  ctx.lineTo(46, 70);
  ctx.lineTo(50, 66);
  ctx.bezierCurveTo(56, 70, 60, 56, 58, 46);
  ctx.bezierCurveTo(58, 32, 52, 22, 40, 18);
  ctx.closePath();
  ctx.fill();
  // Rotten green tint in shadow recess
  ctx.fillStyle = 'rgba(60,80,40,0.18)';
  ctx.beginPath();
  ctx.moveTo(28, 36);
  ctx.bezierCurveTo(24, 50, 28, 64, 34, 66);
  ctx.lineTo(40, 66);
  ctx.lineTo(40, 36);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === Skull head ===
  ctx.save();
  const skullGrad = ctx.createRadialGradient(40, 14, 0, 40, 14, 12);
  skullGrad.addColorStop(0, '#B8AEB8');
  skullGrad.addColorStop(0.5, '#7A6E80');
  skullGrad.addColorStop(1, '#3E3448');
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(40, 14, 11, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Jaw shadow
  ctx.fillStyle = 'rgba(20,16,30,0.5)';
  ctx.beginPath();
  ctx.ellipse(40, 20, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Skull cracks
  ctx.strokeStyle = 'rgba(20,16,30,0.6)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(36, 8);
  ctx.lineTo(38, 14);
  ctx.lineTo(36, 18);
  ctx.stroke();
  ctx.restore();

  // === Eye-sockets — hollow with pulsing red core ===
  ctx.save();
  // Deep socket
  ctx.fillStyle = '#08040E';
  ctx.beginPath();
  ctx.arc(36, 13, 2.5, 0, Math.PI * 2);
  ctx.arc(44, 13, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Red core
  ctx.fillStyle = '#FF3322';
  ctx.beginPath();
  ctx.arc(36, 13, 1.1, 0, Math.PI * 2);
  ctx.arc(44, 13, 1.1, 0, Math.PI * 2);
  ctx.fill();
  // Soft outer glow
  const eyeGlow = ctx.createRadialGradient(40, 13, 0, 40, 13, 16);
  eyeGlow.addColorStop(0, 'rgba(255,51,34,0.25)');
  eyeGlow.addColorStop(1, 'rgba(255,51,34,0)');
  ctx.fillStyle = eyeGlow;
  ctx.fillRect(20, 0, 40, 26);
  ctx.restore();

  // === Bone fragment on shoulder (right) ===
  ctx.save();
  ctx.fillStyle = '#D8CDB0';
  ctx.beginPath();
  ctx.ellipse(54, 28, 4, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(40,30,40,0.4)';
  ctx.beginPath();
  ctx.ellipse(55, 29, 3, 1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  tex.refresh();
  return key;
}

/**
 * Painterly floor with carved runic glyphs and Yggdrasil-root cracks.
 * Draws directly onto a Phaser Graphics object passed in.
 */
export function drawWurzelkammerFloor(g, W, H) {
  // Base stone — cold midgard
  g.fillStyle(0x1A1422, 1).fillRect(0, 0, W, H);

  // Inner brighter zone (light pool from above)
  const centerX = W / 2, centerY = H / 2;
  for (let r = 380; r > 0; r -= 16) {
    const alpha = (380 - r) / 380 * 0.07;
    g.fillStyle(0x3D3245, alpha).fillCircle(centerX, centerY, r);
  }

  // Yggdrasil-root cracks across the floor (more, deliberate, with branches)
  g.lineStyle(2, 0x2E2418, 0.85);
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    g.beginPath();
    g.moveTo(x, y);
    let cx = x, cy = y;
    for (let s = 0; s < 10; s++) {
      cx += (Math.random() - 0.5) * 70;
      cy += (Math.random() - 0.5) * 70;
      g.lineTo(cx, cy);
    }
    g.strokePath();
    // Side branch
    if (Math.random() < 0.6) {
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 80);
      g.strokePath();
    }
  }

  // Subtle rune-glyph carvings — Elder Futhark stylized
  g.lineStyle(1, 0xC9A961, 0.22);
  const runes = [
    [[-8, -10], [8, -10], [-8, 10], [8, 10]], // dagaz
    [[0, -10], [-8, 10], [8, 10]],            // tiwaz-like
    [[-6, -10], [-6, 10], [6, -10], [-6, 0]], // berkanan-like
    [[-8, -10], [-8, 10], [8, 0]],            // raidho-fragment
  ];
  for (let i = 0; i < 8; i++) {
    const rx = 80 + Math.random() * (W - 160);
    const ry = 80 + Math.random() * (H - 160);
    const rune = runes[Math.floor(Math.random() * runes.length)];
    g.beginPath();
    g.moveTo(rx + rune[0][0], ry + rune[0][1]);
    for (let p = 1; p < rune.length; p++) {
      g.lineTo(rx + rune[p][0], ry + rune[p][1]);
    }
    g.strokePath();
  }

  // Central gold ring (light from above)
  g.lineStyle(3, 0xC9A961, 0.18);
  g.strokeCircle(centerX, centerY, 280);
  g.lineStyle(1, 0xC9A961, 0.10);
  g.strokeCircle(centerX, centerY, 340);

  // Outer wall — helheim mauve creeping in
  for (let i = 0; i < 60; i++) {
    const alpha = i / 60 * 0.6;
    g.fillStyle(0x1A1820, alpha)
      .fillRect(i, 0, 1, H)
      .fillRect(W - i - 1, 0, 1, H)
      .fillRect(0, i, W, 1)
      .fillRect(0, H - i - 1, W, 1);
  }

  // Three Yggdrasil-root altars in corners
  const altars = [
    { x: 120, y: 120 },
    { x: W - 120, y: 120 },
    { x: W / 2, y: H - 120 },
  ];
  altars.forEach((n) => {
    // Base socket
    g.fillStyle(0x0E0A18, 1).fillCircle(n.x, n.y, 36);
    g.fillStyle(0x2A1C36, 0.8).fillCircle(n.x, n.y, 28);
    g.lineStyle(2, 0xC9A961, 0.55).strokeCircle(n.x, n.y, 36);
    g.lineStyle(1, 0x6B4F5C, 0.7).strokeCircle(n.x, n.y, 24);
    // Inner glow
    g.fillStyle(0xC9A961, 0.18).fillCircle(n.x, n.y, 14);
    g.fillStyle(0xFFD66B, 0.35).fillCircle(n.x, n.y, 6);
  });
}

/**
 * Spawn an ongoing drift of mist particles across the room.
 */
export function spawnMist(scene, W, H, depth = 35) {
  const count = 18;
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 60;
    const blob = scene.add.circle(x, y, r, 0xC9C4D1, 0.04).setDepth(depth);
    const drift = 12 + Math.random() * 14;
    const tween = scene.tweens.add({
      targets: blob,
      x: x + (Math.random() < 0.5 ? -drift * 4 : drift * 4),
      duration: 14000 + Math.random() * 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: blob,
      alpha: { from: 0.02, to: 0.07 },
      duration: 4000 + Math.random() * 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    out.push({ blob, tween });
  }
  return out;
}

/**
 * Volumetric light shaft — a vertical translucent gold gradient column.
 */
export function spawnLightShaft(scene, x, topY, height, width = 80, depth = 30) {
  const shaft = scene.add.graphics().setDepth(depth);
  // Gradient simulation: stacked thin rects
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const yT = topY + (height / steps) * i;
    const t = i / steps;
    const alpha = 0.18 * (1 - t) + 0.02;
    const w = width * (1 - t * 0.3);
    shaft.fillStyle(0xFFD66B, alpha).fillRect(x - w / 2, yT, w, height / steps + 1);
  }
  // Mid-shaft particles slowly rise
  for (let i = 0; i < 6; i++) {
    const p = scene.add.circle(
      x + (Math.random() - 0.5) * width * 0.6,
      topY + Math.random() * height,
      0.8 + Math.random() * 0.8,
      0xFFE5B0,
      0.5
    ).setDepth(depth + 1);
    scene.tweens.add({
      targets: p,
      y: p.y - height * 0.6,
      duration: 6000 + Math.random() * 4000,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onRepeat: () => { p.y = topY + height; p.alpha = 0.5; },
    });
    scene.tweens.add({
      targets: p,
      alpha: 0,
      duration: 6000 + Math.random() * 4000,
      repeat: -1,
      ease: 'Sine.easeIn',
    });
  }
  return shaft;
}

/**
 * Vignette overlay — radial darkening from the corners.
 * Pinned to the camera (setScrollFactor 0).
 */
export function drawVignette(scene, W, H, depth = 60) {
  const v = scene.add.graphics().setDepth(depth).setScrollFactor(0);
  // Simulate radial vignette with concentric rings
  const cx = W / 2, cy = H / 2;
  const maxR = Math.hypot(cx, cy);
  for (let r = maxR; r > maxR * 0.55; r -= 14) {
    const t = (r - maxR * 0.55) / (maxR - maxR * 0.55);
    v.fillStyle(0x000000, t * 0.025).fillCircle(cx, cy, r);
  }
  return v;
}

/**
 * Norse knot ornament along the strophe panel border.
 */
export function drawNorseOrnament(g, x, y, w, h) {
  // Top border line
  g.lineStyle(1.5, 0xC9A961, 0.6);
  g.lineBetween(x + 20, y, x + w - 20, y);
  // Corner knots
  const knotSize = 8;
  [{ kx: x + 8, ky: y - 4 }, { kx: x + w - 8, ky: y - 4 }].forEach(({ kx, ky }) => {
    g.lineStyle(1, 0xC9A961, 0.85);
    g.strokeCircle(kx, ky, knotSize);
    g.lineStyle(1, 0x8A6A12, 0.7);
    g.strokeCircle(kx, ky, knotSize - 3);
    g.fillStyle(0xC9A961, 0.4);
    g.fillCircle(kx, ky, 2);
  });
  // Subtle Stab-rhyme glyphs along the line
  g.lineStyle(0.8, 0xC9A961, 0.35);
  for (let i = 0; i < 5; i++) {
    const gx = x + 60 + i * ((w - 120) / 4);
    g.beginPath();
    g.moveTo(gx - 3, y - 3);
    g.lineTo(gx, y + 3);
    g.lineTo(gx + 3, y - 3);
    g.strokePath();
  }
}

/**
 * Verse-trigger VFX — gold ring expands around the skald, his staff crystal pulses,
 * the matching verse-text glows. Caller passes (scene, x, y, verseIdx, verseTexts).
 */
export function playVerseTriggerFx(scene, x, y, color = 0xFFD66B) {
  // Gold expanding ring
  const ring = scene.add.circle(x, y, 8, color, 0)
    .setStrokeStyle(2.5, color, 1)
    .setDepth(28);
  scene.tweens.add({
    targets: ring,
    radius: 56,
    alpha: 0,
    duration: 480,
    ease: 'Cubic.easeOut',
    onComplete: () => ring.destroy(),
  });
  // Inner soft pulse
  const pulse = scene.add.circle(x, y, 24, color, 0.4).setDepth(27);
  scene.tweens.add({
    targets: pulse,
    radius: 4,
    alpha: 0,
    duration: 280,
    ease: 'Cubic.easeIn',
    onComplete: () => pulse.destroy(),
  });
  // Tiny rune-spark above the head
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const spark = scene.add.circle(x, y - 18, 1.5, 0xFFE5B0, 1).setDepth(28);
    const dx = Math.cos(a) * (30 + Math.random() * 16);
    const dy = Math.sin(a) * (30 + Math.random() * 16);
    scene.tweens.add({
      targets: spark,
      x: x + dx,
      y: y - 18 + dy,
      alpha: 0,
      duration: 600 + Math.random() * 200,
      ease: 'Cubic.easeOut',
      onComplete: () => spark.destroy(),
    });
  }
}
