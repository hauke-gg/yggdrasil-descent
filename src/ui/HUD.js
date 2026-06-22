export default class HUD {
  constructor(scene) {
    this.scene = scene;

    // HP-Bar oben links
    this._hpBg = scene.add.rectangle(10, 16, 200, 16, 0x333333).setOrigin(0, 0.5).setDepth(50).setScrollFactor(0);
    this._hpBar = scene.add.rectangle(10, 16, 200, 16, 0xff3333).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0);
    this._hpText = scene.add.text(215, 16, 'HP', { fontSize: '13px', color: '#fff', fontFamily: 'sans-serif' }).setOrigin(0, 0.5).setDepth(52).setScrollFactor(0);

    // XP-Bar darunter
    this._xpBg = scene.add.rectangle(10, 36, 200, 8, 0x222222).setOrigin(0, 0.5).setDepth(50).setScrollFactor(0);
    this._xpBar = scene.add.rectangle(10, 36, 0, 8, 0x8844ff).setOrigin(0, 0.5).setDepth(51).setScrollFactor(0);

    // Level-Anzeige
    this._levelText = scene.add.text(215, 36, 'Lv.1', { fontSize: '12px', color: '#cc88ff', fontFamily: 'sans-serif' }).setOrigin(0, 0.5).setDepth(52).setScrollFactor(0);

    // Kill-Counter oben rechts
    this._killText = scene.add.text(950, 10, '☠ 0', { fontSize: '14px', color: '#ffaaaa', fontFamily: 'sans-serif' }).setOrigin(1, 0).setDepth(52).setScrollFactor(0);
  }

  update(player) {
    const hpRatio = player.hp / player.maxHp;
    this._hpBar.setSize(200 * hpRatio, 16);
    this._hpText.setText(`${player.hp}/${player.maxHp}`);

    const xpRatio = player.xp / player.xpToNext;
    this._xpBar.setSize(200 * xpRatio, 8);
    this._levelText.setText(`Lv.${player.level}`);

    this._killText.setText(`☠ ${player.kills}`);
  }

  destroy() {
    [this._hpBg, this._hpBar, this._hpText, this._xpBg, this._xpBar, this._levelText, this._killText].forEach(o => o.destroy());
  }
}
