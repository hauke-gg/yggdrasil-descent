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
    const g = this.add.graphics().setDepth(-2);

    g.fillStyle(0x1a0500);
    g.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    g.fillStyle(0x050a1a);
    g.fillCircle(2000, 2000, 1600);

    g.fillStyle(0x080f08);
    g.fillCircle(2000, 2000, 800);

    const gridG = this.add.graphics().setDepth(-1);
    gridG.lineStyle(1, 0x1a3a1a, 0.2);
    for (let x = 0; x <= WORLD_SIZE; x += 48) gridG.lineBetween(x, 0, x, WORLD_SIZE);
    for (let y = 0; y <= WORLD_SIZE; y += 48) gridG.lineBetween(0, y, WORLD_SIZE, y);
  }

  _createPlayer() {
    this._player = new Player(this, 2000, 2000);
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
