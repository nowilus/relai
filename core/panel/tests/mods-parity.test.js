'use strict';

// Jedno zrodlo, jeden format (AUDYT_MODOW Z6): trzy mody nad promptem maja ten sam `fmt.ts`
// i ten sam `bar-card.tsx`, bajt w bajt po zamianie CRLF na LF. Plugin importuje tylko pliki
// z wlasnego folderu (P-017 pkt 1), wiec kopie sa trzy, a pilnuje ich ten test.
// Druga strona kontroli: zmiana podlozona w pamieci musi zostac zgloszona.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const PLUGINS = ['panel', 'progress', 'cache-keeper'];
const SHARED = ['fmt.ts', 'bar-card.tsx'];

const normalize = (text) => text.replace(/\r\n/g, '\n');
const read = (plugin, file) => normalize(fs.readFileSync(path.join(ROOT, plugin, 'hooks', file), 'utf8'));

// The plugins whose copy differs from the first one's; empty when all agree
function differing(copies) {
  const [first, ...rest] = copies;
  return rest.filter((c) => c.text !== first.text).map((c) => c.plugin);
}

for (const file of SHARED) {
  test(`${file} is the same in ${PLUGINS.join(', ')}`, () => {
    const copies = PLUGINS.map((plugin) => ({ plugin, text: read(plugin, file) }));
    assert.ok(copies[0].text.length > 0, `${file} is empty`);
    assert.deepEqual(differing(copies), []);
  });

  test(`a changed copy of ${file} is reported (planted difference)`, () => {
    const copies = PLUGINS.map((plugin) => ({ plugin, text: read(plugin, file) }));
    const planted = copies.map((c) => (c.plugin === 'progress' ? { ...c, text: c.text.replace('export function', 'export  function') } : c));
    assert.notEqual(planted[1].text, copies[1].text, 'the plant did not change the copy');
    assert.deepEqual(differing(planted), ['progress']);
  });
}

test('a CRLF copy counts as the same (line endings are not a difference)', () => {
  const text = read('panel', 'fmt.ts');
  const crlf = text.replace(/\n/g, '\r\n');
  assert.notEqual(crlf, text);
  assert.deepEqual(differing([{ plugin: 'a', text }, { plugin: 'b', text: normalize(crlf) }]), []);
});

// AUDYT_MODOW Z12: the session's focus is written by relai-panel and read by relai-progress — one
// module, the same in both, or the two bars would count one session under two works
test('focus.ts is the same in panel and progress', () => {
  const copies = ['panel', 'progress'].map((plugin) => ({ plugin, text: read(plugin, 'focus.ts') }));
  assert.ok(copies[0].text.includes('export function workOf'), 'focus.ts lost workOf');
  assert.deepEqual(differing(copies), []);
});
