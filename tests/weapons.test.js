// tests/weapons.test.js
// Ausführen mit: node tests/weapons.test.js

import { getWeapon, getScaledWeapon, WEAPONS } from '../src/data/weapons.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Expected ${b}, got ${a}`);
}

console.log('\n=== weapons.test.js ===\n');

test('getWeapon gibt korrekte Waffe zurück', () => {
  const w = getWeapon('runen_axt');
  assert(w !== null, 'sollte nicht null sein');
  assertEqual(w.id, 'runen_axt');
  assertEqual(w.type, 'melee_aoe');
});

test('getWeapon gibt null für unbekannte ID zurück', () => {
  const w = getWeapon('nonexistent');
  assertEqual(w, null);
});

test('getScaledWeapon erhöht Schaden pro Level', () => {
  const lv1 = getScaledWeapon('runen_axt', 1);
  const lv2 = getScaledWeapon('runen_axt', 2);
  assert(lv2.damage > lv1.damage, 'Level 2 soll mehr Schaden machen');
  assertEqual(lv2.damage, 30, 'Level 2: 25 * 1.2 = 30');
});

test('getScaledWeapon verringert Cooldown pro Level', () => {
  const lv1 = getScaledWeapon('runen_axt', 1);
  const lv3 = getScaledWeapon('runen_axt', 3);
  assert(lv3.cooldown < lv1.cooldown, 'Level 3 soll schneller sein');
});

test('alle Waffen haben required fields', () => {
  for (const [id, w] of Object.entries(WEAPONS)) {
    assert(w.damage > 0, `${id}: damage muss > 0 sein`);
    assert(w.cooldown > 0, `${id}: cooldown muss > 0 sein`);
    assert(w.type, `${id}: type muss gesetzt sein`);
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
