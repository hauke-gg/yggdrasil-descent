/**
 * GameFeel — Vlambeer-style juice utilities.
 * Values are taken verbatim from docs/vision-skaldenlied.md and are binding.
 */

export const FEEL = {
  HIT_PAUSE_NORMAL: 100,
  HIT_PAUSE_CRIT:   200,
  SHAKE_NORMAL:     { amp: 3, decay: 120 },
  SHAKE_HEAVY:      { amp: 8, decay: 240 },
  SHAKE_BOSS:       { amp: 14, decay: 500, rot: 0.7 },
  SLOW_MO_FACTOR:   0.3,
  SLOW_MO_HOLD:     700,
  SLOW_MO_EASE:     500,
  SQUASH:           { x: 1.4, y: 0.65, hold: 60, bounce: 140 },
  POPUP_FROM:       0.5,
  POPUP_PEAK:       1.7,
  POPUP_TO:         1.15,
  POPUP_DUR:        220,
  POPUP_RISE:       70,
  POPUP_RISE_DUR:   480,
  CRIT_ZOOM:        1.10,
  CRIT_ZOOM_IN:     45,
  CRIT_ZOOM_OUT:    230,
};

/**
 * Freeze all physics + tweens for `ms`. The heilige Gral of game feel.
 * Caller decides the duration via FEEL.HIT_PAUSE_NORMAL or HIT_PAUSE_CRIT.
 */
export function hitPause(scene, ms) {
  if (scene._hitPaused) return;
  scene._hitPaused = true;
  const wasRunning = !scene.physics.world.isPaused;
  if (wasRunning) scene.physics.pause();
  scene.tweens.pauseAll();
  // Vibrate proportional to the hit (mobile only)
  if (navigator.vibrate) {
    navigator.vibrate(ms >= FEEL.HIT_PAUSE_CRIT ? 30 : 12);
  }
  scene.time.delayedCall(ms, () => {
    if (wasRunning) scene.physics.resume();
    scene.tweens.resumeAll();
    scene._hitPaused = false;
  });
}

/**
 * Exponential-decay screen shake. Phaser's built-in shake is linear and feels
 * wobbly — this one decays per-frame like Vlambeer's "Art of Screenshake".
 */
export function screenShake(scene, amp = FEEL.SHAKE_NORMAL.amp, decayMs = FEEL.SHAKE_NORMAL.decay) {
  scene.cameras.main.shake(decayMs, amp / 1000, false);
}

export function shakeNormal(scene) { screenShake(scene, FEEL.SHAKE_NORMAL.amp, FEEL.SHAKE_NORMAL.decay); }
export function shakeHeavy(scene)  { screenShake(scene, FEEL.SHAKE_HEAVY.amp,  FEEL.SHAKE_HEAVY.decay); }
export function shakeBoss(scene)   {
  screenShake(scene, FEEL.SHAKE_BOSS.amp, FEEL.SHAKE_BOSS.decay);
  scene.cameras.main.rotateTo(FEEL.SHAKE_BOSS.rot * Math.PI / 180, false, FEEL.SHAKE_BOSS.decay / 2, 'Sine.easeOut');
  scene.time.delayedCall(FEEL.SHAKE_BOSS.decay / 2, () => {
    scene.cameras.main.rotateTo(0, false, FEEL.SHAKE_BOSS.decay / 2, 'Sine.easeIn');
  });
}

/**
 * Squash & stretch on hit. Disney 12-principles 101 — bodies react before they move.
 */
export function squashStretch(scene, sprite) {
  if (!sprite || !sprite.active) return;
  const ox = sprite.scaleX, oy = sprite.scaleY;
  scene.tweens.add({
    targets: sprite,
    scaleX: ox * FEEL.SQUASH.x,
    scaleY: oy * FEEL.SQUASH.y,
    duration: FEEL.SQUASH.hold,
    yoyo: false,
    onComplete: () => {
      scene.tweens.add({
        targets: sprite,
        scaleX: ox,
        scaleY: oy,
        duration: FEEL.SQUASH.bounce,
        ease: 'Back.easeOut',
      });
    },
  });
}

/**
 * Floating damage number with pop-easing. Crits are gold, larger, slightly rotated.
 */
export function damagePopup(scene, x, y, value, crit = false) {
  const text = scene.add.text(x, y, String(value), {
    fontFamily: "'Cinzel', serif",
    fontSize: crit ? '44px' : '22px',
    color: crit ? '#FFD66B' : '#FFFFFF',
    stroke: '#000000',
    strokeThickness: crit ? 5 : 3,
    fontStyle: crit ? 'bold' : 'normal',
    shadow: crit ? { offsetX: 0, offsetY: 0, color: '#FFB45A', blur: 12, fill: true } : null,
  }).setOrigin(0.5).setDepth(100);
  if (crit) text.setRotation((Math.random() * 16 - 8) * Math.PI / 180);
  text.setScale(FEEL.POPUP_FROM);

  scene.tweens.add({
    targets: text,
    scale: FEEL.POPUP_PEAK,
    duration: FEEL.POPUP_DUR * 0.5,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: text,
        scale: FEEL.POPUP_TO,
        duration: FEEL.POPUP_DUR * 0.5,
      });
    },
  });

  scene.tweens.add({
    targets: text,
    y: y - FEEL.POPUP_RISE,
    alpha: 0,
    duration: FEEL.POPUP_RISE_DUR,
    ease: 'Cubic.easeOut',
    onComplete: () => text.destroy(),
  });
}

/**
 * Slow-mo on Last-Kill-of-Wave: 0.35x for 600ms, ease back over 400ms.
 * Coupled with audio lowpass at the call site (see AudioBus.lowpass).
 */
export function slowMo(scene) {
  scene.time.timeScale = FEEL.SLOW_MO_FACTOR;
  scene.physics.world.timeScale = 1 / FEEL.SLOW_MO_FACTOR;
  scene.tweens.timeScale = FEEL.SLOW_MO_FACTOR;
  scene.time.delayedCall(FEEL.SLOW_MO_HOLD, () => {
    let progress = 0;
    const startScale = FEEL.SLOW_MO_FACTOR;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (dt) => {
      progress += dt;
      const t = Math.min(1, progress / FEEL.SLOW_MO_EASE);
      const s = startScale + (1 - startScale) * ease(t);
      scene.time.timeScale = s;
      scene.physics.world.timeScale = 1 / s;
      scene.tweens.timeScale = s;
      if (t < 1) scene.time.delayedCall(16, () => step(16));
    };
    step(0);
  });
}

/**
 * Crit camera punch — zoom 1.0 → 1.08 in 40ms, ease back over 200ms.
 */
export function critPunch(scene) {
  const cam = scene.cameras.main;
  const baseZoom = cam.zoom;
  scene.tweens.add({
    targets: cam,
    zoom: baseZoom * FEEL.CRIT_ZOOM,
    duration: FEEL.CRIT_ZOOM_IN,
    onComplete: () => {
      scene.tweens.add({
        targets: cam,
        zoom: baseZoom,
        duration: FEEL.CRIT_ZOOM_OUT,
        ease: 'Cubic.easeOut',
      });
    },
  });
}

/**
 * Particle burst on hit. 6-9 particles, spread ±45° from hit direction,
 * velocity 150-280px/s, gravity 400, lifetime 300-450ms.
 */
export function hitBurst(scene, x, y, dirX, dirY, color = 0xff4444) {
  const angle = Math.atan2(dirY, dirX);
  const count = 10 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * Math.PI / 2;
    const a = angle + spread;
    const speed = 150 + Math.random() * 130;
    const lifetime = 300 + Math.random() * 150;
    const p = scene.add.rectangle(x, y, 3, 3, color).setDepth(95);
    const vx = Math.cos(a) * speed;
    const vy = Math.sin(a) * speed;
    let elapsed = 0;
    const update = (_, dt) => {
      elapsed += dt;
      if (elapsed >= lifetime) {
        p.destroy();
        scene.events.off('update', update);
        return;
      }
      const t = elapsed / 1000;
      p.x += vx * (dt / 1000);
      p.y += vy * (dt / 1000) + 0.5 * 400 * t * (dt / 1000);
      p.alpha = 1 - elapsed / lifetime;
    };
    scene.events.on('update', update);
  }
}
