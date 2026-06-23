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

/**
 * Edge-based black background removal. Threshold is intentionally low so
 * we don't eat into the dark parts of the figure itself (skin in shadow,
 * black hair, deep folds). Instead we flood-fill from the canvas edges
 * inward — only "outside" black pixels become transparent.
 */
export function makeBlackTransparent(scene, sourceKey, targetKey = null, threshold = 38) {
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
  const softLimit = threshold + 18;
  const isBlackish = (i) => Math.max(data[i], data[i + 1], data[i + 2]) < threshold;
  const isSoftBlack = (i) => Math.max(data[i], data[i + 1], data[i + 2]) < softLimit;

  // BFS flood-fill from all edge pixels — only mark "outside" black regions
  // (the painted figure's shadows stay opaque).
  const visited = new Uint8Array(w * h);
  const queue = [];

  const push = (px, py) => {
    if (px < 0 || py < 0 || px >= w || py >= h) return;
    const flat = py * w + px;
    if (visited[flat]) return;
    const i = flat * 4;
    if (!isSoftBlack(i)) return;
    visited[flat] = 1;
    queue.push(flat);
  };

  for (let px = 0; px < w; px++) {
    push(px, 0);
    push(px, h - 1);
  }
  for (let py = 0; py < h; py++) {
    push(0, py);
    push(w - 1, py);
  }

  while (queue.length) {
    const flat = queue.pop();
    const px = flat % w;
    const py = (flat - px) / w;
    const i = flat * 4;
    // Hard cut for solid black, soft fade for near-black at the silhouette edge
    if (isBlackish(i)) {
      data[i + 3] = 0;
    } else {
      const maxC = Math.max(data[i], data[i + 1], data[i + 2]);
      const fade = (maxC - threshold) / (softLimit - threshold);
      data[i + 3] = Math.round(255 * fade);
    }
    push(px - 1, py);
    push(px + 1, py);
    push(px, py - 1);
    push(px, py + 1);
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
