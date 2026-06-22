// tests/evolutions.test.js
import { checkEvolution, EVOLUTIONS } from '../src/data/evolutions.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); failed++; }
}
function assert(c, m) { if (!c) throw new Error(m || 'fail'); }
function assertEqual(a, b, m) { if (a !== b) throw new Error(m || `${a} !== ${b}`); }

console.log('\n=== evolutions.test.js ===\n');

test('checkEvolution gibt Evolution zurück wenn alle Bedingungen erfüllt', () => {
  const evo = checkEvolution('runen_axt', 5, ['blut_rune']);
  assert(evo !== null);
  assertEqual(evo.id, 'berserker_axt');
});

test('checkEvolution gibt null wenn Waffe falsch', () => {
  const evo = checkEvolution('speer', 5, ['blut_rune']);
  assertEqual(evo, null);
});

test('checkEvolution gibt null wenn Level zu niedrig', () => {
  const evo = checkEvolution('runen_axt', 4, ['blut_rune']);
  assertEqual(evo, null);
});

test('checkEvolution gibt null wenn Passiv fehlt', () => {
  const evo = checkEvolution('runen_axt', 5, []);
  assertEqual(evo, null);
});

test('alle Evolutions haben required fields', () => {
  for (const e of EVOLUTIONS) {
    assert(e.id, 'id fehlt');
    assert(e.damage > 0, 'damage fehlt');
    assert(e.requiresWeapon, 'requiresWeapon fehlt');
    assert(e.requiresPassive, 'requiresPassive fehlt');
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
