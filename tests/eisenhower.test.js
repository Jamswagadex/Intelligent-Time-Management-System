const { test } = require('node:test');
const assert = require('node:assert');
const { classify } = require('../src/services/eisenhower');

test('Q1: important + urgent → DO FIRST', () => {
  const r = classify(1, 1);
  assert.strictEqual(r.quadrant, 1);
  assert.strictEqual(r.action, 'DO FIRST');
});

test('Q2: important + not urgent → SCHEDULE', () => {
  const r = classify(1, 0);
  assert.strictEqual(r.quadrant, 2);
  assert.strictEqual(r.action, 'SCHEDULE');
});

test('Q3: not important + urgent → DELEGATE', () => {
  const r = classify(0, 1);
  assert.strictEqual(r.quadrant, 3);
  assert.strictEqual(r.action, 'DELEGATE');
});

test('Q4: not important + not urgent → DELETE/MINIMIZE', () => {
  const r = classify(0, 0);
  assert.strictEqual(r.quadrant, 4);
  assert.strictEqual(r.action, 'DELETE/MINIMIZE');
});
