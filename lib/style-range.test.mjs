import assert from 'node:assert/strict';
import test from 'node:test';
import { createStyleRange } from './style-range.mjs';

test('generates missing styles and SKU codes without overwriting existing styles', () => {
  const result = createStyleRange(
    { start: '1001', end: '1003', name: 'Cotton top', colors: 'Olive, Black', skuPattern: 'NY-{style}-{color}-{size}' },
    { 1001: [['Existing', []]] },
    ['TAKEN'],
    ['S', 'M'],
  );
  assert.deepEqual(Object.keys(result.catalog), ['1002', '1003']);
  assert.equal(result.firstStyle, '1002');
  assert.equal(result.catalog['1002'][0][1][0][0], 'NY-1002-OLIVE-S');
  assert.deepEqual(result.names, { 1002: 'Cotton top', 1003: 'Cotton top' });
});

test('rejects duplicate generated codes before creation', () => {
  assert.throws(() => createStyleRange(
    { start: '1', end: '1', name: 'Top', colors: 'Black, black', skuPattern: '{style}-{color}-{size}' },
    {},
    [],
    ['S'],
  ), /unique colors/);
});
