import Player from '../entities/Player.js';
import Draugr from '../entities/enemies/Draugr.js';
import Jotunn from '../entities/enemies/Jotunn.js';
import FenrirBoss from '../entities/enemies/FenrirBoss.js';
import WeaponSystem from '../systems/WeaponSystem.js';
import WaveSystem from '../systems/WaveSystem.js';
import DungeonGenerator from '../systems/DungeonGenerator.js';
import EvolutionSystem from '../systems/EvolutionSystem.js';
import VirtualJoystick from '../ui/VirtualJoystick.js';
import SkillButtons from '../ui/SkillButtons.js';
import HUD from '../ui/HUD.js';
import LevelUpUI from '../ui/LevelUpUI.js';
import Chest from '../entities/Chest.js';
import GodSpeechUI from '../ui/GodSpeechUI.js';
import { WEAPONS, PASSIVES } from '../data/weapons.js';

const WORLD_SIZE = 4000;

export default class DungeonScene extends Phaser.Scene {
  constructor() { super('DungeonScene'); }

  create() {
    // Remove any stale DOM elements from CharacterScene
    document.getElementById('ygg-name-input')?.remove();
    document.querySelectorAll('style').forEach(s => { if (s.textContent.includes('ygg-name-input')) s.remove(); });

    const savedPlayer = JSON.parse(localStorage.getItem('ygg_player') || '{}');
    this._playerName = savedPlayer.name || 'Krieger';
    this._playerClass = savedPlayer.class || 'krieger';

    this._survivalSeconds = 0;
    this._waveLevel = 0;
    this._spawnInterval = 3000;
    this._nextSpawnTime = 0;
    this._spawnGrace = true;
    this._levelUpPending = false;
    this._lastMiniBossTime = 0;

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this._drawWorld();
    this._createPlayer();
    this._applyClassStats();
    this._createSystems();
    this._setupPhysics();
    this._setupCamera();
    this._setupTimer();
    this._spawnInitialEnemies();
  }

  _drawWorld() {
    const g = this.add.graphics().setDepth(-3);
    const cx = WORLD_SIZE / 2, cy = WORLD_SIZE / 2;

    // Outer void
    g.fillStyle(0x020104, 1);
    g.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Biome base fills (behind tiles)
    g.fillStyle(0x130a0a, 1); // Helheim base: blood ash
    g.fillCircle(cx, cy, 2100);
    g.fillStyle(0x060c16, 1); // Jötunheim base: deep ice navy
    g.fillCircle(cx, cy, 1600);
    g.fillStyle(0x0a140a, 1); // Midgard base: dark forest
    g.fillCircle(cx, cy, 800);

    // --- TILE LAYER ---
    const tileG = this.add.graphics().setDepth(-2);
    const TILE = 64;
    for (let tx = 0; tx < WORLD_SIZE; tx += TILE) {
      for (let ty = 0; ty < WORLD_SIZE; ty += TILE) {
        const dx = tx + TILE / 2 - cx;
        const dy = ty + TILE / 2 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2080) continue;

        const h1 = (tx * 7 + ty * 13) % 100;
        const h2 = (tx * 11 + ty * 19) % 100;

        if (dist < 800) {
          // MIDGARD: dark green mossy stone
          const shade = h1 < 25 ? 0x111a11 : h1 < 60 ? 0x141e14 : 0x182218;
          tileG.fillStyle(shade, 1);
          tileG.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
          // Moss patches in tile corners
          if (h1 < 14) {
            tileG.fillStyle(0x1c3419, 0.75);
            tileG.fillRect(tx + 1, ty + 1, 18, 18);
          }
          if (h2 < 10) {
            tileG.fillStyle(0x1a3017, 0.6);
            tileG.fillRect(tx + TILE - 19, ty + TILE - 19, 18, 18);
          }
          // Green grout
          tileG.lineStyle(1, 0x090f09, 0.9);
          tileG.strokeRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
          // Stone crack on some tiles
          if (h1 > 90) {
            tileG.lineStyle(1, 0x0d160d, 0.55);
            tileG.lineBetween(tx + 10, ty + 22, tx + 42, ty + 52);
          }
          // Faint rune shimmer near altar
          if (h1 < 5 && dist < 560) {
            tileG.fillStyle(0x33cc55, 0.05);
            tileG.fillRect(tx, ty, TILE, TILE);
          }
        } else if (dist < 1600) {
          // JÖTUNHEIM: ice-blue crystalline
          const shade = h1 < 25 ? 0x080f1c : h1 < 60 ? 0x0b1422 : 0x0e1a2c;
          tileG.fillStyle(shade, 1);
          tileG.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
          // Frost crack veins
          if (h1 < 22) {
            tileG.lineStyle(1, 0x1e4488, 0.38);
            tileG.lineBetween(tx + 6, ty + TILE * 0.38, tx + TILE * 0.72, ty + TILE - 6);
          }
          if (h2 < 16) {
            tileG.lineStyle(1, 0x2255aa, 0.3);
            tileG.lineBetween(tx + TILE * 0.28, ty + 5, tx + TILE - 6, ty + TILE * 0.62);
          }
          // Frost corner shard
          if (h1 > 86) {
            tileG.fillStyle(0x3366bb, 0.18);
            tileG.fillTriangle(tx + 1, ty + 1, tx + 22, ty + 1, tx + 1, ty + 22);
          }
          // Ice grout
          tileG.lineStyle(1, 0x050c18, 0.9);
          tileG.strokeRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
        } else {
          // HELHEIM: dark ash red bone
          const shade = h1 < 25 ? 0x130808 : h1 < 60 ? 0x170b0b : 0x1b0d0d;
          tileG.fillStyle(shade, 1);
          tileG.fillRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
          // Ash patch
          if (h1 < 18) {
            tileG.fillStyle(0x221010, 0.55);
            tileG.fillRect(tx + (h1 % 36), ty + (h2 % 36), 14, 14);
          }
          // Ember glow on tile surface
          if (h1 > 93) {
            tileG.fillStyle(0xcc2200, 0.14);
            tileG.fillCircle(tx + TILE / 2, ty + TILE / 2, 9);
          }
          // Bone-gray seam
          tileG.lineStyle(1, 0x0e0606, 0.9);
          tileG.strokeRect(tx + 1, ty + 1, TILE - 2, TILE - 2);
          if (h2 > 89) {
            tileG.lineStyle(1, 0x404040, 0.18);
            tileG.lineBetween(tx + 8, ty + 32, tx + 56, ty + 40);
          }
        }
      }
    }

    // --- DECORATIONS ---
    const decoG = this.add.graphics().setDepth(-1);

    // === MIDGARD: Green runic altar ===
    decoG.fillStyle(0x22aa33, 0.07);
    decoG.fillCircle(cx, cy, 290);
    decoG.lineStyle(3, 0x44cc55, 0.85);
    decoG.strokeCircle(cx, cy, 290);
    // Inner glow ring
    decoG.lineStyle(2, 0x33aa44, 0.5);
    decoG.strokeCircle(cx, cy, 560);
    // 8 runic notch dots
    for (let a = 0; a < 8; a++) {
      const r = (a / 8) * Math.PI * 2;
      decoG.fillStyle(0x66ff88, 0.75);
      decoG.fillCircle(cx + Math.cos(r) * 290, cy + Math.sin(r) * 290, 5);
    }
    // Cardinal lines
    decoG.lineStyle(1, 0x33aa44, 0.3);
    [0, 45, 90, 135].forEach(deg => {
      const r = deg * Math.PI / 180;
      decoG.lineBetween(cx + Math.cos(r) * 100, cy + Math.sin(r) * 100,
                        cx + Math.cos(r) * 720, cy + Math.sin(r) * 720);
      decoG.lineBetween(cx - Math.cos(r) * 100, cy - Math.sin(r) * 100,
                        cx - Math.cos(r) * 720, cy - Math.sin(r) * 720);
    });
    // Midgard stone pillars with green glow
    [
      [cx - 190, cy - 230], [cx + 210, cy - 185],
      [cx - 225, cy + 195], [cx + 185, cy + 230],
      [cx + 430, cy - 70],  [cx - 450, cy + 90],
      [cx + 70,  cy - 440], [cx - 85,  cy + 450],
    ].forEach(([rx, ry]) => {
      decoG.fillStyle(0x121e12, 1);
      decoG.fillRect(rx - 14, ry - 14, 28, 28);
      decoG.fillStyle(0x1e2e1e, 1);
      decoG.fillRect(rx - 10, ry - 10, 16, 16);
      decoG.fillStyle(0x253a25, 1);
      decoG.fillRect(rx - 6, ry - 6, 8, 8);
      decoG.lineStyle(1, 0x44aa44, 0.5);
      decoG.strokeRect(rx - 14, ry - 14, 28, 28);
      decoG.fillStyle(0x33cc55, 0.11);
      decoG.fillCircle(rx, ry, 22);
      decoG.fillStyle(0x44dd66, 0.05);
      decoG.fillCircle(rx, ry, 36);
    });

    // === BIOME BORDER: Midgard → Jötunheim (800) ===
    decoG.lineStyle(5, 0x11cc88, 0.55);
    decoG.strokeCircle(cx, cy, 800);
    decoG.lineStyle(2, 0x33ffbb, 0.22);
    decoG.strokeCircle(cx, cy, 824);

    // === JÖTUNHEIM: Ice crystal spires ===
    [
      [cx - 920, cy - 210], [cx + 880, cy + 250],
      [cx + 115, cy - 960], [cx - 130, cy + 900],
      [cx - 700, cy + 660], [cx + 715, cy - 680],
      [cx + 820, cy + 210], [cx - 770, cy - 230],
      [cx + 310, cy + 870], [cx - 330, cy - 850],
      [cx - 1050, cy + 350], [cx + 1060, cy - 330],
    ].forEach(([rx, ry]) => {
      const d = Math.hypot(rx - cx, ry - cy);
      if (d < 810 || d > 1580) return;
      // Main crystal spire
      decoG.fillStyle(0x1e4a8a, 0.9);
      decoG.fillTriangle(rx, ry - 26, rx - 11, ry + 6, rx + 11, ry + 6);
      // Left shard
      decoG.fillStyle(0x2860aa, 0.65);
      decoG.fillTriangle(rx - 10, ry - 12, rx - 18, ry + 10, rx - 2, ry + 10);
      // Right shard
      decoG.fillStyle(0x3a78cc, 0.5);
      decoG.fillTriangle(rx + 8, ry - 10, rx + 2, ry + 10, rx + 18, ry + 10);
      // Frost glow
      decoG.fillStyle(0x66aaff, 0.13);
      decoG.fillCircle(rx, ry, 22);
      decoG.fillStyle(0x88ccff, 0.06);
      decoG.fillCircle(rx, ry, 36);
    });
    // Inner frost ring
    decoG.lineStyle(2, 0x1a4888, 0.38);
    decoG.strokeCircle(cx, cy, 1200);

    // === BIOME BORDER: Jötunheim → Helheim (1600) ===
    decoG.lineStyle(5, 0x991100, 0.6);
    decoG.strokeCircle(cx, cy, 1600);
    decoG.lineStyle(2, 0xdd2200, 0.25);
    decoG.strokeCircle(cx, cy, 1628);

    // === HELHEIM: Skull totems + ember pools ===
    [
      [cx - 1720, cy + 210], [cx + 1760, cy - 190],
      [cx + 215,  cy - 1740],[cx - 195,  cy + 1710],
      [cx - 1320, cy - 1120],[cx + 1340, cy + 1140],
      [cx + 1220, cy - 1310],[cx - 1260, cy + 1270],
      [cx + 1640, cy + 620], [cx - 1660, cy - 600],
      [cx - 800,  cy + 1580],[cx + 820,  cy - 1560],
    ].forEach(([rx, ry]) => {
      const d = Math.hypot(rx - cx, ry - cy);
      if (d < 1615 || d > 2060) return;
      // Totem pole
      decoG.fillStyle(0x1e1610, 1);
      decoG.fillRect(rx - 7, ry - 6, 14, 28);
      // Skull
      decoG.fillStyle(0x3a3028, 1);
      decoG.fillEllipse(rx, ry - 18, 22, 20, 8);
      decoG.lineStyle(1, 0xcc2200, 0.45);
      decoG.strokeEllipse(rx, ry - 18, 22, 20, 8);
      // Eye sockets
      decoG.fillStyle(0xcc2200, 0.35);
      decoG.fillCircle(rx - 5, ry - 20, 3);
      decoG.fillCircle(rx + 5, ry - 20, 3);
      // Ember pool beneath
      decoG.fillStyle(0xcc2200, 0.14);
      decoG.fillCircle(rx, ry + 6, 20);
      decoG.fillStyle(0xff4400, 0.07);
      decoG.fillCircle(rx, ry + 6, 34);
    });
    // Large atmospheric ember pools
    [
      [cx - 1820, cy - 410, 75], [cx + 1840, cy + 390, 60],
      [cx + 510,  cy + 1780, 68],[cx - 490,  cy - 1800, 72],
      [cx + 1450, cy - 820,  55],[cx - 1470, cy + 840,  58],
    ].forEach(([ex, ey, er]) => {
      const d = Math.hypot(ex - cx, ey - cy);
      if (d < 1600 || d > 2100) return;
      decoG.fillStyle(0xbb3300, 0.11);
      decoG.fillCircle(ex, ey, er);
      decoG.fillStyle(0xff5500, 0.05);
      decoG.fillCircle(ex, ey, er * 1.55);
    });
  }

  _createPlayer() {
    this._player = new Player(this, 2000, 2000, this._playerClass);
    this._player.setCollideWorldBounds(true);
  }

  _applyClassStats() {
    const classHp = { krieger: 120, schatten: 80, magier: 70 };
    const hp = classHp[this._playerClass] || 100;
    this._player.maxHp = hp;
    this._player.hp = hp;
    if (this._playerClass === 'krieger') this._player.dmgMultiplier = 1.2;
    if (this._playerClass === 'schatten') this._player.speed = 234;
    if (this._playerClass === 'magier') {
      this._player.dmgMultiplier = 1.5;
      this._player.speed = 162;
    }
  }

  _createSystems() {
    this._enemies = this.physics.add.group();
    this._waveSystem = new WaveSystem();
    this._evolutionSystem = new EvolutionSystem();
    this._weaponSystem = new WeaponSystem(this, this._player, this._enemies);
    this._joystick = new VirtualJoystick(this);
    this._skillButtons = new SkillButtons(this);
    this._hud = new HUD(this);
    this._levelUpUI = new LevelUpUI(this);
    this._godSpeechUI = new GodSpeechUI(this);

    this._chests = [];
    this._spawnChests(5);
    this.time.addEvent({
      delay: 60000,
      loop: true,
      callback: () => {
        if (this._chests.length < 3) this._spawnChests(1);
      }
    });

    this._dashCooldown = false;
    this._skillButtons.onSkill(0, () => this._doDash());

    this.events.on('levelUp', () => this._onLevelUp());
    this.events.on('weaponEvolved', (evo) => this._showEvolutionNotice(evo));
  }

  _setupPhysics() {
    this.physics.add.overlap(this._player, this._enemies, (player, enemy) => {
      if (player._invincible) return;
      const dead = player.takeDamage(enemy.damage);
      if (dead) this._onPlayerDie();
    });
  }

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);
  }

  _setupTimer() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this._survivalSeconds++;
        this._updateWaveLevel();
      }
    });
  }

  _updateWaveLevel() {
    const mins = this._survivalSeconds / 60;
    if (mins < 2) {
      this._waveLevel = 0;
    } else if (mins < 5) {
      this._waveLevel = 1;
    } else if (mins < 8) {
      this._waveLevel = 2;
    } else {
      this._waveLevel = 3;
    }

    if (this._survivalSeconds > 0 && this._survivalSeconds % 30 === 0) {
      this._spawnInterval = Math.max(800, this._spawnInterval - 200);
    }

    if (this._survivalSeconds > 0 && this._survivalSeconds % 60 === 0) {
      this._spawnMiniBoss();
    }
  }

  _spawnInitialEnemies() {
    // Single Draugr far enough to give player 2s to orient
    this.time.delayedCall(2000, () => {
      const angle = Math.random() * Math.PI * 2;
      const x = 2000 + Math.cos(angle) * 420;
      const y = 2000 + Math.sin(angle) * 420;
      const stats = this._waveSystem.getEnemyStats('draugr', 1);
      const enemy = new Draugr(this, x, y, stats);
      this._enemies.add(enemy);
      // Lift grace period so wave spawning begins
      this._spawnGrace = false;
    });
  }

  _getSpawnPoint() {
    const cam = this.cameras.main;
    const margin = 60;
    const side = Phaser.Math.Between(0, 3);
    const wx = cam.worldView.x, wy = cam.worldView.y;
    const ww = cam.worldView.width, wh = cam.worldView.height;
    let x, y;
    switch (side) {
      case 0: x = wx + Math.random() * ww; y = wy - margin; break;
      case 1: x = wx + Math.random() * ww; y = wy + wh + margin; break;
      case 2: x = wx - margin; y = wy + Math.random() * wh; break;
      case 3: x = wx + ww + margin; y = wy + Math.random() * wh; break;
    }
    x = Phaser.Math.Clamp(x, 10, WORLD_SIZE - 10);
    y = Phaser.Math.Clamp(y, 10, WORLD_SIZE - 10);
    return { x, y };
  }

  _spawnEnemy() {
    const pt = this._getSpawnPoint();
    const scaleFactor = 1 + this._waveLevel * 0.5;

    let enemy;
    if (this._waveLevel === 0) {
      enemy = new Draugr(this, pt.x, pt.y, this._waveSystem.getEnemyStats('draugr', scaleFactor));
    } else if (this._waveLevel === 1) {
      const useJotunn = Math.random() < 0.3;
      const id = useJotunn ? 'jotunn' : 'draugr';
      const Cls = useJotunn ? Jotunn : Draugr;
      enemy = new Cls(this, pt.x, pt.y, this._waveSystem.getEnemyStats(id, scaleFactor));
    } else {
      const roll = Math.random();
      if (roll < 0.5) {
        enemy = new Draugr(this, pt.x, pt.y, this._waveSystem.getEnemyStats('draugr', scaleFactor));
      } else {
        enemy = new Jotunn(this, pt.x, pt.y, this._waveSystem.getEnemyStats('jotunn', scaleFactor));
      }
    }
    if (enemy) this._enemies.add(enemy);
  }

  _spawnMiniBoss() {
    const pt = this._getSpawnPoint();
    const scaleFactor = 2 + this._waveLevel;
    const boss = new Jotunn(this, pt.x, pt.y, this._waveSystem.getEnemyStats('jotunn', scaleFactor));
    boss.setTint(0xff4400);
    boss.setScale(1.5);
    this._enemies.add(boss);
  }

  _getBiomeName() {
    const dx = this._player.x - 2000;
    const dy = this._player.y - 2000;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 800) return 'Midgard';
    if (dist < 1600) return 'Jötunheim';
    return 'Helheim';
  }

  update(time, delta) {
    if (!this._player.active) return;

    const vec = this._joystick.getVector();
    this._player.move(vec.x * 180, vec.y * 180);

    this._weaponSystem.update(time);

    this._enemies.getChildren().forEach(e => e.update(this._player));

    this._hud.update(this._player, this._survivalSeconds, this._getBiomeName());

    if (!this._spawnGrace && time > this._nextSpawnTime) {
      this._spawnEnemy();
      this._nextSpawnTime = time + this._spawnInterval;
    }

    // Chest proximity check
    if (this._chests) {
      for (let i = this._chests.length - 1; i >= 0; i--) {
        const chest = this._chests[i];
        if (chest.isNear(this._player.x, this._player.y)) {
          const loot = chest.open();
          if (loot) {
            this._chests.splice(i, 1);
            this._applyLoot(loot);
            this.time.delayedCall(30000, () => this._spawnChests(1));
          }
        }
      }
    }
  }

  _onLevelUp() {
    this._levelUpPending = true;
    const options = this._buildLevelUpOptions();
    this._godSpeechUI.show(() => {
      this._levelUpUI.show(options, (choice) => {
        this._applyLevelUpChoice(choice);
        this._levelUpPending = false;

        const evos = this._evolutionSystem.checkAll(this._player);
        evos.forEach(({ weaponSlot, evo }) => {
          this._evolutionSystem.apply(this._player, weaponSlot, evo);
          this._showEvolutionNotice(evo);
        });
      });
    });
  }

  _spawnChests(count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 300 + Math.random() * 1200;
      const cx = this._player ? this._player.x : 2000;
      const cy = this._player ? this._player.y : 2000;
      const x = Phaser.Math.Clamp(cx + Math.cos(angle) * dist, 50, WORLD_SIZE - 50);
      const y = Phaser.Math.Clamp(cy + Math.sin(angle) * dist, 50, WORLD_SIZE - 50);
      this._chests.push(new Chest(this, x, y));
    }
  }

  _applyLoot(loot) {
    const p = this._player;
    const effect = loot.effect;
    if (effect.healAmount) p.hp = Math.min(p.maxHp, (p.hp || 0) + effect.healAmount);
    if (effect.maxHpBonus) {
      p.maxHp = (p.maxHp || 100) + effect.maxHpBonus;
      p.hp = (p.hp || 0) + effect.maxHpBonus;
    }
    if (effect.speedBonus) p.speed = (p.speed || 160) * (1 + effect.speedBonus);
    if (effect.xpBonus) p._xpBonus = ((p._xpBonus || 0) + effect.xpBonus);
    this._showLootToast(loot);
  }

  _showLootToast(loot) {
    const cam = this.cameras.main;
    const W = cam.width;
    const toast = this.add.text(W / 2, 80, `${loot.icon} ${loot.name} — ${loot.desc}`, {
      fontSize: '16px', color: '#d4af37', fontFamily: 'serif',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#1a000066', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(95).setScrollFactor(0).setAlpha(0);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: 70,
      duration: 300,
      hold: 2000,
      yoyo: true,
      onComplete: () => toast.destroy()
    });
  }

  _buildLevelUpOptions() {
    const options = [];
    const allWeaponIds = Object.keys(WEAPONS);
    const allPassiveIds = Object.keys(PASSIVES);

    const upgradeable = (this._player.weapons || []).filter(w => w.level < 5);
    if (upgradeable.length > 0) {
      const w = upgradeable[Phaser.Math.Between(0, upgradeable.length - 1)];
      options.push({ type: 'upgrade', id: w.id });
    }

    const existing = (this._player.weapons || []).map(w => w.id);
    const missing = allWeaponIds.filter(id => !existing.includes(id));
    if (missing.length > 0 && options.length < 3) {
      options.push({ type: 'weapon', id: missing[Phaser.Math.Between(0, missing.length - 1)] });
    }

    const missingPassives = allPassiveIds.filter(id => !(this._player.passives || []).includes(id));
    if (missingPassives.length > 0 && options.length < 3) {
      options.push({ type: 'passive', id: missingPassives[Phaser.Math.Between(0, missingPassives.length - 1)] });
    }

    while (options.length < 3) {
      options.push({ type: 'weapon', id: allWeaponIds[options.length % allWeaponIds.length] });
    }

    return options.slice(0, 3);
  }

  _applyLevelUpChoice(choice) {
    if (choice.type === 'weapon') this._player.addWeapon(choice.id);
    else if (choice.type === 'passive') this._player.addPassive(choice.id);
    else if (choice.type === 'upgrade') this._player.upgradeWeapon(choice.id);
  }

  _doDash() {
    if (this._dashCooldown) return;
    this._dashCooldown = true;
    this._skillButtons.setCooldown(0, true);

    const vec = this._joystick.getVector();
    const hasInput = vec.x !== 0 || vec.y !== 0;
    const dx = hasInput ? vec.x : 0;
    const dy = hasInput ? vec.y : -1;

    this._player._invincible = true;
    this._player.setVelocity(dx * 500, dy * 500);
    this._player.setTint(0x8888ff);

    this.time.delayedCall(250, () => {
      this._player._invincible = false;
      this._player.clearTint();
    });

    this.time.delayedCall(2000, () => {
      this._dashCooldown = false;
      this._skillButtons.setCooldown(0, false);
    });
  }

  _showEvolutionNotice(evo) {
    const cam = this.cameras.main;
    const text = this.add.text(cam.worldView.centerX, cam.worldView.centerY - 80, `✦ EVOLUTION: ${evo.name} ✦`, {
      fontSize: '22px', color: '#00ffcc', fontStyle: 'bold',
      fontFamily: 'serif', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 2500,
      onComplete: () => text.destroy()
    });
  }

  _onPlayerDie() {
    this._player.setActive(false).setVisible(false);
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        floor: 0,
        kills: this._player.kills,
        survivalSeconds: this._survivalSeconds
      });
    });
  }
}
