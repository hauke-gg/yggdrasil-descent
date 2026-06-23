/**
 * AudioBus — Web Audio API-based SFX layer (no external deps yet).
 *
 * For Sprint 1 we generate everything procedurally — this keeps the prototype
 * shippable in one session and proves the audio direction. Real Wardruna stems
 * + Howler.js come in Sprint 2 when we have the music budget.
 *
 * Browser audio policy: must be unlocked by user gesture. Call unlock() on
 * first click.
 */

const PENTATONIC_C = [261.63, 293.66, 329.63, 392.00, 440.00];

class AudioBus {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.pickupCounter = 0;
    this.lastPickupAt = 0;
    this._unlocked = false;
  }

  unlock() {
    if (this._unlocked) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.4;
    this.sfxGain.connect(this.master);
    this.musicGain.connect(this.master);
    this.master.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
    this._unlocked = true;
  }

  _now() { return this.ctx.currentTime; }

  /**
   * Krieger-Axt-Hit — 3 layer: 80Hz sub-boom + 2.4kHz snap + 400Hz wood body.
   */
  hitHeavy() {
    if (!this._unlocked) return;
    const t = this._now();
    this._impact(t, 80,   0.005, 0.080, 'sine',     0.9);
    this._impact(t, 2400, 0.002, 0.080, 'square',   0.25);
    this._impact(t, 400,  0.010, 0.150, 'triangle', 0.4);
  }

  /**
   * Schatten-Dolch — leise, elegant. 800Hz Klingen-Schwirren + 180Hz Fleisch-Stich.
   */
  hitLight() {
    if (!this._unlocked) return;
    const t = this._now();
    this._impact(t, 800, 0.002, 0.040, 'sawtooth', 0.18);
    this._impact(t, 180, 0.005, 0.060, 'sine',     0.45);
  }

  /**
   * Magier-Runen-Cast — build-up 400ms granular drone, then crack at 4kHz + sub-drop at 50Hz.
   */
  cast() {
    if (!this._unlocked) return;
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(t); osc.stop(t + 0.5);
    this._impact(t + 0.4, 4000, 0.001, 0.080, 'square', 0.4);
    this._impact(t + 0.4, 50,   0.005, 0.250, 'sine',   0.9);
  }

  /**
   * Boss-Death-Sting — 200ms wal-groan, 400ms stille (audio hit-pause), then sub-bass boom + reverse-cymbal.
   */
  bossDeath() {
    if (!this._unlocked) return;
    const t = this._now();
    this._impact(t, 120, 0.020, 0.180, 'sine', 0.7);
    this._impact(t + 0.6, 60, 0.010, 0.800, 'sine', 1.0);
    const noise = this._noise(t + 0.6, 0.6, 'reverse');
    if (noise) noise.connect(this.sfxGain);
  }

  /**
   * XP-Pickup — pentatonic ping. Every 10th pickup goes one step up the scale.
   * Round-robin pitch ±15 cents prevents ear fatigue at 200/min.
   */
  pickup() {
    if (!this._unlocked) return;
    const t = this._now();
    const now = performance.now();
    const sinceLast = now - this.lastPickupAt;
    this.lastPickupAt = now;
    let vol = 0.18;
    if (sinceLast < 100) vol *= 0.5;
    if (sinceLast < 50)  vol *= 0.5;

    this.pickupCounter++;
    const step = Math.floor(this.pickupCounter / 10) % 5;
    const baseFreq = PENTATONIC_C[step];
    const cents = (Math.random() - 0.5) * 30;
    const freq = baseFreq * Math.pow(2, cents / 1200);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;
    osc.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    osc.start(t); osc.stop(t + 0.2);
  }

  /**
   * Menu drone — slow Kraviklyra-style sustain at 60 BPM-equivalent. Loops.
   */
  startMenuDrone() {
    if (!this._unlocked || this._menuDrone) return;
    const t = this._now();
    const root = 130.81;
    const fifth = root * 1.5;
    const o1 = this.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = root;
    const o2 = this.ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = root * 1.005;
    const o3 = this.ctx.createOscillator(); o3.type = 'triangle'; o3.frequency.value = fifth;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 3.0);
    o1.connect(lp); o2.connect(lp); o3.connect(lp);
    lp.connect(g); g.connect(this.musicGain);
    o1.start(t); o2.start(t); o3.start(t);
    this._menuDrone = { osc: [o1, o2, o3], gain: g };
  }

  stopMenuDrone() {
    if (!this._menuDrone) return;
    const t = this._now();
    this._menuDrone.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    setTimeout(() => {
      try { this._menuDrone.osc.forEach(o => o.stop()); } catch {}
      this._menuDrone = null;
    }, 1600);
  }

  /**
   * Combat drone — faster pulse, frame-drum 105 BPM.
   */
  startCombatPulse() {
    if (!this._unlocked || this._combat) return;
    const interval = 60000 / 105;
    this._combat = setInterval(() => this._frameDrum(), interval);
  }

  stopCombatPulse() {
    if (this._combat) { clearInterval(this._combat); this._combat = null; }
  }

  /**
   * Ambient Wardruna-style drone — sustained, slow, atmospheric.
   * Layered with combat pulse for fuller texture during gameplay.
   */
  startAmbientDrone() {
    if (!this._unlocked || this._ambient) return;
    const t = this._now();
    const root = 65.41;        // low C2
    const fifth = root * 1.5;
    const oct  = root * 2;

    const o1 = this.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = root;
    const o2 = this.ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = root * 1.008;
    const o3 = this.ctx.createOscillator(); o3.type = 'triangle'; o3.frequency.value = oct;
    const o4 = this.ctx.createOscillator(); o4.type = 'sine';     o4.frequency.value = fifth;

    // Slow LFO on the fifth — gives it the breath of a sustained vocal
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.6;
    lfo.connect(lfoGain);
    lfoGain.connect(o4.frequency);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 4.0);

    o1.connect(lp); o2.connect(lp); o3.connect(lp); o4.connect(lp);
    lp.connect(g); g.connect(this.musicGain);
    o1.start(t); o2.start(t); o3.start(t); o4.start(t); lfo.start(t);

    this._ambient = { osc: [o1, o2, o3, o4, lfo], gain: g };
  }

  stopAmbientDrone() {
    if (!this._ambient) return;
    const t = this._now();
    this._ambient.gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    setTimeout(() => {
      try { this._ambient.osc.forEach(o => o.stop()); } catch {}
      this._ambient = null;
    }, 2000);
  }

  /**
   * Boss-appearance horn — long, low, dread-inducing.
   */
  bossHorn() {
    if (!this._unlocked) return;
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    osc.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    osc.start(t); osc.stop(t + 1.7);
  }

  _frameDrum() {
    if (!this._unlocked) return;
    const t = this._now();
    this._impact(t, 70, 0.002, 0.110, 'sine', 0.35);
    this._impact(t, 180, 0.001, 0.040, 'triangle', 0.12);
  }

  _impact(t, freq, attack, decay, type, vol) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + decay);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(t); osc.stop(t + attack + decay + 0.02);
  }

  _noise(t, dur, mode = 'forward') {
    if (!this._unlocked) return null;
    const sampleRate = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sampleRate * dur, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = mode === 'reverse'
        ? i / data.length
        : 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * env * 0.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2000;
    src.connect(hp);
    src.start(t);
    return hp;
  }
}

export const audio = new AudioBus();
