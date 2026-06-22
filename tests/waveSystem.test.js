import WaveSystem from '../src/systems/WaveSystem.js';

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch(e) { console.error(`  ✗ ${name}: ${e.message}`); failed++; }
}
function assert(c, m) { if (!c) throw new Error(m || 'fail'); }
function assertEqual(a, b, m) { if (a !== b) throw new Error(m || `${a} !== ${b}`); }

console.log('\n=== waveSystem.test.js ===\n');

test('Floor 1 spawnt Draugr', () => {
  const ws = new WaveSystem(1);
  const wave = ws.getNextWave();
  assertEqual(wave[0].enemyId, 'draugr');
  assert(wave[0].count >= 4, 'mindestens 4 Feinde');
});

test('Floor 3 spawnt Draugr und Jotunn', () => {
  const ws = new WaveSystem(3);
  const wave = ws.getNextWave();
  const ids = wave.map(w => w.enemyId);
  assert(ids.includes('draugr'), 'Draugr fehlt');
  assert(ids.includes('jotunn'), 'Jotunn fehlt');
});

test('Floor 5 ist Boss-Floor', () => {
  const ws = new WaveSystem(5);
  assert(ws.isBossFloor(), 'soll Boss-Floor sein');
  assertEqual(ws.maxWaves, 1);
});

test('spätere Wellen haben mehr Feinde', () => {
  const ws = new WaveSystem(1);
  const wave1 = ws.getNextWave();
  const wave2 = ws.getNextWave();
  const count1 = wave1.reduce((s, w) => s + w.count, 0);
  const count2 = wave2.reduce((s, w) => s + w.count, 0);
  assert(count2 > count1, 'Welle 2 soll mehr Feinde haben');
});

test('getEnemyStats skaliert HP mit Floor', () => {
  const ws1 = new WaveSystem(1);
  const ws3 = new WaveSystem(3);
  const hp1 = ws1.getEnemyStats('draugr').hp;
  const hp3 = ws3.getEnemyStats('draugr').hp;
  assert(hp3 > hp1, 'Floor 3 Draugr soll mehr HP haben');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
