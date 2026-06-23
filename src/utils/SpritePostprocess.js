/**
 * SpritePostprocess — turn Higgsfield JPG sprites into transparent PNGs in-memory.
 *
 * The JPG portraits from Higgsfield have a pitch-black background. Rendered as
 * Phaser sprites they show a hard black rectangle around the character. This
 * helper walks every pixel, sets alpha=0 wherever RGB is below `threshold`,
 * and registers the result as a new CanvasTexture the scene can use.
 *
 * Result is cached by target key so this only runs once per source.
 */

export function makeBlackTransparent(scene, sourceKey, targetKey = null, threshold = 28) {
  const finalKey = targetKey || (sourceKey + '_clean');
  if (scene.textures.exists(finalKey)) return finalKey;
  const sourceTex = scene.textures.get(sourceKey);
  if (!sourceTex || sourceTex.key === '__MISSING') return sourceKey;
  const sourceImage = sourceTex.getSourceImage();
  if (!sourceImage) return sourceKey;
  const w = sourceImage.width, h = sourceImage.height;

  const canvasTex = scene.textures.createCanvas(finalKey, w, h);
  const ctx = canvasTex.getContext();
  ctx.drawImage(sourceImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  // Two-pass with soft edge: pure-black → alpha 0, near-black → faded alpha
  const softLimit = threshold + 14;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const maxC = Math.max(r, g, b);
    if (maxC < threshold) {
      data[i + 3] = 0;
    } else if (maxC < softLimit) {
      const fade = (maxC - threshold) / (softLimit - threshold);
      data[i + 3] = Math.round(255 * fade);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  canvasTex.refresh();
  return finalKey;
}

/**
 * Run black-to-alpha on a list of texture keys, return parallel array of
 * cleaned keys (or the original if the source wasn't loaded).
 */
export function cleanAll(scene, keys) {
  return keys.map(k => makeBlackTransparent(scene, k));
}
