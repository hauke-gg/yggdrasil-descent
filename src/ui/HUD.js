export default class HUD {
  constructor(scene) {
    this.scene = scene;

    this._hpLabel = scene.add.text(12, 12, 'HP', {
      fontSize: '11px', color: '#ff6666', fontFamily: 'monospace', fontStyle: 'bold'
    }).setDepth(52).setScrollFactor(0);

    this._hpBg = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._hpFill = scene.add.graphics().setDepth(52).setScrollFactor(0);

    this._hpText = scene.add.text(240, 18, '', {
      fontSize: '12px', color: '#ffaaaa', fontFamily: 'monospace'
    }).setOrigin(0, 0.5).setDepth(53).setScrollFactor(0);

    this._xpLabel = scene.add.text(12, 32, 'XP', {
      fontSize: '11px', color: '#88ff99', fontFamily: 'monospace', fontStyle: 'bold'
    }).setDepth(52).setScrollFactor(0);

    this._xpBg = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._xpFill = scene.add.graphics().setDepth(52).setScrollFactor(0);

    this._levelBadge = scene.add.text(244, 36, 'Lv.1', {
      fontSize: '11px', color: '#cc88ff', fontFamily: 'monospace'
    }).setOrigin(0, 0.5).setDepth(53).setScrollFactor(0);

    this._killBg = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._killText = scene.add.text(948, 14, '☠ 0', {
      fontSize: '14px', color: '#ffaaaa', fontFamily: 'monospace'
    }).setOrigin(1, 0.5).setDepth(53).setScrollFactor(0);

    this._drawStatic();
  }

  _drawStatic() {
    this._hpBg.clear();
    this._hpBg.fillStyle(0x000000, 0.6);
    this._hpBg.fillRoundedRect(28, 10, 200, 14, 4);
    this._hpBg.lineStyle(1, 0x663333, 0.8);
    this._hpBg.strokeRoundedRect(28, 10, 200, 14, 4);

    this._xpBg.clear();
    this._xpBg.fillStyle(0x000000, 0.6);
    this._xpBg.fillRoundedRect(28, 30, 200, 8, 3);
    this._xpBg.lineStyle(1, 0x334433, 0.8);
    this._xpBg.strokeRoundedRect(28, 30, 200, 8, 3);

    this._killBg.clear();
    this._killBg.fillStyle(0x000000, 0.6);
    this._killBg.fillRoundedRect(880, 6, 76, 22, 4);
  }

  update(player) {
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    const xpRatio = Math.min(1, player.xp / player.xpToNext);

    this._hpFill.clear();
    const hpColor = hpRatio > 0.5 ? 0xee3333 : hpRatio > 0.25 ? 0xff8800 : 0xff2222;
    this._hpFill.fillStyle(hpColor);
    this._hpFill.fillRoundedRect(29, 11, Math.max(2, 198 * hpRatio), 12, 3);

    this._xpFill.clear();
    this._xpFill.fillStyle(0x44cc66);
    if (xpRatio > 0) this._xpFill.fillRoundedRect(29, 31, 198 * xpRatio, 6, 2);

    this._hpText.setText(`${player.hp}/${player.maxHp}`);
    this._levelBadge.setText(`Lv.${player.level}`);
    this._killText.setText(`☠ ${player.kills}`);
  }

  destroy() {
    [
      this._hpLabel, this._xpLabel, this._hpBg, this._hpFill,
      this._xpBg, this._xpFill, this._hpText, this._levelBadge,
      this._killBg, this._killText
    ].forEach(o => o && o.destroy());
  }
}
