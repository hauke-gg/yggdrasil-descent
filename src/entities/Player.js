export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // Stats
    this.maxHp = 100;
    this.hp = 100;
    this.speed = 180;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    this.kills = 0;

    // Waffen & Passives: [{id, level}] bzw [id]
    this.weapons = [{ id: 'runen_axt', level: 1 }];
    this.passives = [];

    // Invincibility-Frames nach Treffer
    this._invincible = false;
  }

  takeDamage(amount) {
    if (this._invincible) return false;

    this.hp = Math.max(0, this.hp - amount);

    // Kurz blinken
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => this.clearTint());

    // 500ms Unverwundbarkeit nach Treffer
    this._invincible = true;
    this.scene.time.delayedCall(500, () => { this._invincible = false; });

    return this.hp <= 0;
  }

  // Gibt true zurück wenn Level-Up ausgelöst
  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.round(this.xpToNext * 1.4);
      return true;
    }
    return false;
  }

  addWeapon(weaponId) {
    const existing = this.weapons.find(w => w.id === weaponId);
    if (existing) {
      existing.level = Math.min(existing.level + 1, 5);
    } else {
      this.weapons.push({ id: weaponId, level: 1 });
    }
  }

  upgradeWeapon(weaponId) {
    const w = this.weapons.find(w => w.id === weaponId);
    if (w) w.level = Math.min(w.level + 1, 5);
  }

  getWeaponLevel(weaponId) {
    const w = this.weapons.find(w => w.id === weaponId);
    return w ? w.level : 0;
  }

  addPassive(passiveId) {
    if (!this.passives.includes(passiveId)) {
      this.passives.push(passiveId);
    }
  }

  // Wird von DungeonScene jeden Frame aufgerufen
  move(velocityX, velocityY) {
    if (velocityX === 0 && velocityY === 0) {
      this.setVelocity(0, 0);
      return;
    }
    // Normalisieren damit Diagonale nicht schneller ist
    const len = Math.sqrt(velocityX ** 2 + velocityY ** 2);
    this.setVelocity(
      (velocityX / len) * this.speed,
      (velocityY / len) * this.speed
    );
  }
}
