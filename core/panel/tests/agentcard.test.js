'use strict';

// Karta agenta RelAI Agents (odnoga AGENTS_KRABY, przebudowa 2026-10-23 po przegladzie na zywo):
// slowa karty to tekst modu, rysowane jest tylko imie (Hanken Grotesk, kontury liter) i ramka
// z cieniem w barwie agenta; okno kontekstu z nazwy modelu.

const assert = require('node:assert/strict');
const test = require('node:test');

const c = require('../agentcard.mjs');
const { HANKEN } = require('../hanken.mjs');
const { twoTone } = require('../theme.mjs');

const HUE = '#8a5aa8';

test('the window comes from the model name: [1m] is the long one, anything else 200K', () => {
  assert.equal(c.windowOf('claude-opus-5-5[1m]'), 1_000_000);
  assert.equal(c.windowOf('claude-haiku-5-5'), 200_000);
  assert.equal(c.windowOf(''), 200_000);
  assert.equal(c.modelName('claude-haiku-5-5'), 'Haiku 5.5');
  assert.equal(c.modelName('claude-opus-5-5[1m]'), 'Opus 5.5 · 1M');
  assert.equal(c.modelName('gpt-x'), 'gpt-x');
  assert.equal(c.kTokens(183_400), '183K');
  assert.equal(c.kTokens(1_000_000), '1M');
  assert.equal(c.contextWords(122_000, 'claude-haiku-5-5'), 'Kontekst: 122K z 200K tokenów okna modelu');
  assert.equal(c.contextWords(500_000, 'claude-opus-5-5[1m]'), 'Kontekst: 500K z 1M tokenów okna modelu');
});

test('Hanken has every letter of a Polish name, and the outlines are its own (SIL OFL)', () => {
  for (const ch of 'ĄĆĘŁŃÓŚŹŻąćęłńóśźżABCZabcz0123456789 …') assert.ok(HANKEN[ch], ch);
  assert.match(HANKEN.A[0], /^M/);
});

test('the name is drawn once a letter, in the text colour of each look, and twoTone leaves it alone', () => {
  const n = c.nameSvg('Anna Ania', 400);
  assert.equal(n.svg.split('<path id="hk41"').length - 1, 1);
  assert.equal(n.svg.split('href="#hk6e"').length - 1, 3);
  assert.match(n.svg, /\.n\{fill:#f0efec\}@media \(prefers-color-scheme: light\)\{\.n\{fill:#0b0b0b\}\}/);
  assert.equal(twoTone(n.svg), n.svg);
  assert.equal(n.height, Math.ceil((c.NAME_FONT.top + c.NAME_FONT.bottom) * c.NAME_FONT.size / 1000));
  assert.equal(n.width, c.nameWidth('Anna Ania'));
});

test('a name wider than its room ends with an ellipsis and keeps to the room', () => {
  const long = c.nameSvg('Bóbr Bartłomiej Długie Imię Agenta', 90);
  assert.ok(long.width <= 90, String(long.width));
  assert.ok(long.svg.includes('href="#hk2026"'));
  // Positive control: a short name is whole, no ellipsis
  assert.ok(!c.nameSvg('Lis', 90).svg.includes('hk2026'));
});

test('a drawn name costs the tree a few thousand characters (DESIGN.md §9)', () => {
  const n = c.nameSvg('Bóbr Bartłomiej', 400);
  assert.ok(n.svg.length < 5000, String(n.svg.length));
});

test('the frame pieces: a fine line in the app\'s subtle colour of each look, the shadow in the agent\'s', () => {
  for (const svg of [c.cardFrameTopSvg(HUE), c.cardFrameMiddleSvg(HUE), c.cardFrameEndSvg(HUE)]) {
    assert.match(svg, new RegExp(`\\.h\\{fill:${HUE}\\}`));
    assert.match(svg, /stroke:#898781;stroke-width:1px/);
    assert.match(svg, /prefers-color-scheme: light\)\{\.f\{fill:#[0-9a-f]{6};stroke:#888781\}/);
  }
});
