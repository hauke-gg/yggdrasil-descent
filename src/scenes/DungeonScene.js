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
import { WEAPONS, PASSIVES } from '../data/weapons.js';

export default class DungeonScene extends Phaser.Scene {
  constructor() { super('DungeonScene'); }

  create() {
    const savedPlayer = JSON.parse(localStorage.getItem('ygg_player') || '{}');
    this._playerName = savedPlayer.name || 'Krieger';
    this._playerClass = savedPlayer.class || 'krieger';

    this._currentFloor = 1;
    this._kills = 0;
    this._levelUpPending = false;
    this._bossSpawned = false;

    // Dungeon generieren
    this._generator = new DungeonGenerator();
    const { floors } = this._generator.generate(this);
    this._floors = floors;

    // Aktuelle Floor zeichnen
    this._currentFloorGfx = this._generator.drawFloor(this, this._floors[0]);

    // Spieler
    this._player = new Player(this, 480, 270);

    // Feind-Gruppe
    this._enemies = this.physics.add.group();

    // Systeme
    this._weaponSystem = new WeaponSystem(this, this._player, this._enemies);
    this._waveSystem = new WaveSystem(1);
    this._evolutionSystem = new EvolutionSystem();

    // UI
    this._joystick = new VirtualJoystick(this);
    this._skillButtons = new SkillButtons(this);
    this._hud = new HUD(this);
    this._levelUpUI = new LevelUpUI(this);

    // Dash
    this._dashCooldown = false;
    this._skillButtons.onSkill(0, () => this._doDash());

    // Kollision: Feind trifft Spieler
    this.physics.add.overlap(this._player, this._enemies, (player, enemy) => {
      if (player._invincible) return;
      const dead = player.takeDamage(enemy.damage);
      if (dead) this._onPlayerDie();
    });

    // Events
    this.events.on('levelUp', () => this._onLevelUp());
    this.events.on('weaponEvolved', (evo) => this._showEvolutionNotice(evo));

    // Erste Welle starten
    this.time.delayedCall(1000, () => this._spawnNextWave());
  }

  update(time, delta) {
    if (!this._player.active) return;

    // Bewegung
    const vec = this._joystick.getVector();
    this._player.move(vec.x * 180, vec.y * 180);

    // Waffen
    this._weaponSystem.update(time);

    // Feinde updaten
    this._enemies.getChildren().forEach(e => e.update(this._player));

    // HUD
    this._hud.update(this._player);

    // Prüfen ob Welle erledigt
    if (this._enemies.countActive() === 0 && !this._levelUpPending) {
      if (this._waveSystem.isBossFloor() && !this._bossSpawned) {
        this._spawnBoss();
      } else if (this._waveSystem.isBossFloor() && this._bossSpawned) {
        this._onBossDefeated();
      } else if (this._waveSystem.hasMoreWaves()) {
        this.time.delayedCall(1500, () => this._spawnNextWave());
      } else if (!this._waveSystem.isBossFloor()) {
        this._onFloorComplete();
      }
    }
  }

  _spawnNextWave() {
    const wave = this._waveSystem.getNextWave();
    if (!wave) return;

    wave.forEach(({ enemyId, count, delayBetween }) => {
      for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * (delayBetween || 300), () => {
          const floorData = this._floors[this._currentFloor - 1];
          const spawnPts = floorData.spawnPoints || [
            { x: 100, y: 100 }, { x: 860, y: 100 },
            { x: 100, y: 440 }, { x: 860, y: 440 }
          ];
          const pt = spawnPts[Phaser.Math.Between(0, spawnPts.length - 1)];
          const stats = this._waveSystem.getEnemyStats(enemyId);
          let enemy;
          if (enemyId === 'draugr' || enemyId === 'fenrir_wolf') {
            enemy = new Draugr(this, pt.x, pt.y, stats);
          } else if (enemyId === 'jotunn') {
            enemy = new Jotunn(this, pt.x, pt.y, stats);
          }
          if (enemy) this._enemies.add(enemy);
        });
      }
    });
  }

  _spawnBoss() {
    this._bossSpawned = true;
    const boss = new FenrirBoss(this, 480, 100);
    boss.onWolfSpawn = () => {
      for (let i = 0; i < 3; i++) {
        const stats = this._waveSystem.getEnemyStats('fenrir_wolf');
        const wolf = new Draugr(this, boss.x + Phaser.Math.Between(-60, 60), boss.y + 40, stats);
        this._enemies.add(wolf);
      }
    };
    this._enemies.add(boss);

    this.add.text(480, 60, '⚔  FENRIR  ⚔', {
      fontSize: '28px', color: '#ff8800', fontStyle: 'bold', fontFamily: 'serif'
    }).setOrigin(0.5).setDepth(20);
  }

  _onFloorComplete() {
    if (this._currentFloor >= 4) {
      // Nächster Floor ist 5 (Boss-Floor) — nicht rekursiv aufrufen
      this._currentFloor = 5;
      this._startFloor(5);
      return;
    }
    this._currentFloor++;
    this._startFloor(this._currentFloor);
  }

  _startFloor(floorNumber) {
    // Alte Grafik entfernen
    if (this._currentFloorGfx) this._currentFloorGfx.destroy();
    this._currentFloorGfx = this._generator.drawFloor(this, this._floors[floorNumber - 1]);

    // Wave-System neu initialisieren
    this._waveSystem = new WaveSystem(floorNumber);
    this._bossSpawned = false;

    // Spieler heilen
    this._player.hp = Math.min(this._player.maxHp, this._player.hp + 20);

    this.time.delayedCall(1500, () => this._spawnNextWave());
  }

  _onLevelUp() {
    this._levelUpPending = true;
    const options = this._buildLevelUpOptions();
    this._levelUpUI.show(options, (choice) => {
      this._applyLevelUpChoice(choice);
      this._levelUpPending = false;

      // Evolutions prüfen
      const evos = this._evolutionSystem.checkAll(this._player);
      evos.forEach(({ weaponSlot, evo }) => {
        this._evolutionSystem.apply(this._player, weaponSlot, evo);
        this._showEvolutionNotice(evo);
      });
    });
  }

  _buildLevelUpOptions() {
    const options = [];
    const allWeaponIds = Object.keys(WEAPONS);
    const allPassiveIds = Object.keys(PASSIVES);

    // Upgrade vorhandene Waffe
    const upgradeable = (this._player.weapons || []).filter(w => w.level < 5);
    if (upgradeable.length > 0) {
      const w = upgradeable[Phaser.Math.Between(0, upgradeable.length - 1)];
      options.push({ type: 'upgrade', id: w.id });
    }

    // Neue Waffe (die noch nicht dabei ist)
    const existing = (this._player.weapons || []).map(w => w.id);
    const missing = allWeaponIds.filter(id => !existing.includes(id));
    if (missing.length > 0 && options.length < 3) {
      options.push({ type: 'weapon', id: missing[Phaser.Math.Between(0, missing.length - 1)] });
    }

    // Passiv
    const missingPassives = allPassiveIds.filter(id => !(this._player.passives || []).includes(id));
    if (missingPassives.length > 0 && options.length < 3) {
      options.push({ type: 'passive', id: missingPassives[Phaser.Math.Between(0, missingPassives.length - 1)] });
    }

    // Auffüllen auf 3 Optionen wenn zu wenig
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

    // Kurze Unverwundbarkeit + Geschwindigkeitsboost in Bewegungsrichtung
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
    const text = this.add.text(480, 200, `✦ EVOLUTION: ${evo.name} ✦`, {
      fontSize: '22px', color: '#00ffcc', fontStyle: 'bold',
      fontFamily: 'serif', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: text,
      y: 160,
      alpha: 0,
      duration: 2500,
      onComplete: () => text.destroy()
    });
  }

  _onBossDefeated() {
    this._bossSpawned = false;
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', {
        floor: this._currentFloor,
        kills: this._player.kills,
        victory: true
      });
    });
  }

  _onPlayerDie() {
    this._player.setActive(false).setVisible(false);
    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', {
        floor: this._currentFloor,
        kills: this._player.kills
      });
    });
  }
}
