const test = require('node:test');
const assert = require('node:assert/strict');
const { parseAssertion } = require('../js/utils/assertions');

test('parses integer assertions', () => {
  assert.deepEqual(parseAssertion('totalErrors == 0'), { name: 'totalErrors', operator: '==', value: 0 });
  assert.deepEqual(parseAssertion('avgBytesPerSecond <= 10000'), { name: 'avgBytesPerSecond', operator: '<=', value: 10000 });
});

test('parses decimal assertions', () => {
  assert.deepEqual(parseAssertion('responseTimeAvg < 0.5'), { name: 'responseTimeAvg', operator: '<', value: 0.5 });
  assert.deepEqual(parseAssertion('avgHitsPerSecond >= 24.5'), { name: 'avgHitsPerSecond', operator: '>=', value: 24.5 });
  assert.deepEqual(parseAssertion('avgHitsPerSecond > 7.5'), { name: 'avgHitsPerSecond', operator: '>', value: 7.5 });
  assert.deepEqual(parseAssertion('responseTimeP95<.25'), { name: 'responseTimeP95', operator: '<', value: 0.25 });
});

test('tolerates surrounding whitespace', () => {
  assert.deepEqual(parseAssertion('  totalPages   >=   1500  '), { name: 'totalPages', operator: '>=', value: 1500 });
});

test('rejects unparseable assertions with a readable error', () => {
  for (const bad of ['', 'totalErrors', 'totalErrors == abc', 'totalErrors = 0', 'totalErrors => 0', 'totalErrors == 1.2.3', '== 0']) {
    assert.throws(() => parseAssertion(bad), (err) => {
      assert.ok(!(err instanceof TypeError), `TypeError for '${bad}'`);
      assert.match(err.message, /^Invalid assertion/);
      return true;
    });
  }
});
