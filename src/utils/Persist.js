/**
 * Persist — small localStorage wrapper for run-meta (best-run + settings).
 */

const KEY_BEST = 'ygg_best_run';
const KEY_SETTINGS = 'ygg_settings';
const KEY_INTRO = 'ygg_intro_seen';

export function loadBestRun() {
  try {
    const raw = localStorage.getItem(KEY_BEST);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveBestRun(record) {
  try {
    localStorage.setItem(KEY_BEST, JSON.stringify(record));
  } catch {}
}

/**
 * Merge the incoming record with the stored best — keep the strictly better
 * stats from each session: highest wave, most kills, first-time boss kill,
 * most boons / chests / level. Returns the merged record.
 */
export function mergeBestRun(record) {
  const prev = loadBestRun() || {};
  const merged = {
    wave: Math.max(prev.wave || 0, record.wave || 0),
    kills: Math.max(prev.kills || 0, record.kills || 0),
    level: Math.max(prev.level || 0, record.level || 0),
    bossKills: (prev.bossKills || 0) + (record.bossKilledThisRun ? 1 : 0),
    runs: (prev.runs || 0) + 1,
    bestSkald: record.kills > (prev.kills || 0) ? record.skaldId : (prev.bestSkald || record.skaldId),
  };
  saveBestRun(merged);
  return merged;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? JSON.parse(raw) : { muted: false };
  } catch { return { muted: false }; }
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY_SETTINGS, JSON.stringify(s)); } catch {}
}

export function isIntroSeen() {
  try { return localStorage.getItem(KEY_INTRO) === '1'; } catch { return false; }
}

export function markIntroSeen() {
  try { localStorage.setItem(KEY_INTRO, '1'); } catch {}
}
