import { COLORS, TEXT_STYLES } from '../data/design-system.js';
import { HUD as HUD_COPY } from '../data/copy.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;

    this._hpLabel = scene.add.text(12, 12, HUD_COPY.hp, {
      ...TEXT_STYLES.hud, color: '#ff6666', fontStyle: 'bold'
    }).setDepth(52).setScrollFactor(0);

    this._hpBg   = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._hpFill = scene.add.graphics().setDepth(52).setScrollFactor(0);

    this._hpText = scene.add.text(240, 18, '', TEXT_STYLES.hudValue)
      .setOrigin(0, 0.5).setDepth(53).setScrollFactor(0);

    this._xpLabel = scene.add.text(12, 32, HUD_COPY.xp, {
      ...TEXT_STYLES.hud, color: '#88ff99'
    }).setDepth(52).setScrollFactor(0);

    this._xpBg   = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._xpFill = scene.add.graphics().setDepth(52).setScrollFactor(0);

    this._levelBadge = scene.add.text(244, 36, `${HUD_COPY.level} 1`, TEXT_STYLES.hud)
      .setOrigin(0, 0.5).setDepth(53).setScrollFactor(0)
      .setStyle({ color: COLORS.purpleCSS });

    this._killBg   = scene.add.graphics().setDepth(51).setScrollFactor(0);
    this._killText = scene.add.text(948, 14, `${HUD_COPY.kills}: 0`, TEXT_STYLES.hudValue)
      .setOrigin(1, 0.5).setDepth(53).setScrollFactor(0)
      .setStyle({ color: '#ffaaaa' });

    this._biomeText = scene.add.text(948, 30, 'Midgard', TEXT_STYLES.hud)
      .setOrigin(1, 0.5).setDepth(53).setScrollFactor(0)
      .setStyle({ color: '#88cc88' });

    this._timerText = scene.add.text(480, 12, '00:00', {
      ...TEXT_STYLES.hudValue, fontSize: '16px', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(53).setScrollFactor(0);

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
    this._killBg.fillRoundedRect(880, 6, 76, 38, 4);
  }

  update(player, survivalSeconds, biomeName) {
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    const xpRatio = Math.min(1, player.xp / player.xpToNext);

    this._hpFill.clear();
    const hpColor = hpRatio > 0.5 ? 0xee3333 : hpRatio > 0.25 ? 0xff8800 : 0xff2222;
    this._hpFill.fillStyle(hpColor);
    this._hpFill.fillRoundedRect(29, 11, Math.max(2, 198 * hpRatio), 12, 3);

    this._xpFill.clear();
    this._xpFill.fillStyle(COLORS.frost);
    if (xpRatio > 0) this._xpFill.fillRoundedRect(29, 31, 198 * xpRatio, 6, 2);

    this._hpText.setText(`${player.hp}/${player.maxHp}`);
    this._levelBadge.setText(`${HUD_COPY.level} ${player.level}`);
    this._killText.setText(`${HUD_COPY.kills}: ${player.kills}`);

    if (survivalSeconds !== undefined) {
      const mins = Math.floor(survivalSeconds / 60).toString().padStart(2, '0');
      const secs = (survivalSeconds % 60).toString().padStart(2, '0');
      this._timerText.setText(`${mins}:${secs}`);
    }

    if (biomeName !== undefined) {
      this._biomeText.setText(biomeName);
    }
  }

  destroy() {
    [
      this._hpLabel, this._xpLabel, this._hpBg, this._hpFill,
      this._xpBg, this._xpFill, this._hpText, this._levelBadge,
      this._killBg, this._killText, this._timerText, this._biomeText
    ].forEach(o => o && o.destroy());
  }
}
