const test = require('node:test');
const assert = require('node:assert/strict');
const { resolvePlayType } = require('../js/utils/play');

test('a script played by ID needs no --type', () => {
  assert.deepEqual(resolvePlayType({ id: 'abc123' }), { type: null });
});

test('a script played by ID keeps an explicit --type', () => {
  assert.deepEqual(resolvePlayType({ id: 'abc123', type: 'browser' }), { type: 'browser' });
});

test('a local file defaults to protocol', () => {
  assert.deepEqual(resolvePlayType({ file: './script.js' }), { type: 'protocol' });
});

test('a local file honors --type, in any case', () => {
  assert.deepEqual(resolvePlayType({ file: './script.js', type: 'browser' }), { type: 'browser' });
  assert.deepEqual(resolvePlayType({ file: './script.js', type: 'Browser' }), { type: 'browser' });
});

test('an unknown --type is an error', () => {
  assert.ok(resolvePlayType({ file: './script.js', type: 'chrome' }).error);
  assert.ok(resolvePlayType({ id: 'abc123', type: 'chrome' }).error);
});
