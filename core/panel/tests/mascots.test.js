'use strict';

// Postacie agentow RelAI Agents (odnoga AGENTS_KRABY, 2026-10-23): dziewiec rol, kazda innym
// zwierzeciem ze strojem roli i jednym elementem w barwie agenta; rola z typu i opisu zadania,
// imie z puli roli. Rysunek wlasny, nie kopia Helper Desku (brak licencji wzorca).

const assert = require('node:assert/strict');
const test = require('node:test');

const m = require('../mascots.mjs');
const { ROOT, THEME, twoTone } = require('../theme.mjs');

// WCAG 2.x contrast ratio of two #rrggbb colors
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// The sheet the pane stands on in each look (SHEET in theme.mjs)
const SHEET_DARK = THEME.card;
const SHEET_LIGHT = ROOT.kartka;

test('nine roles, each a grid of 16 rows of 20 cells, every mark painted', () => {
  assert.deepEqual([...m.ROLE_KEYS], ['reviewer', 'auditor', 'developer', 'manager', 'architect', 'analyst', 'tester', 'writer', 'worker']);
  for (const k of m.ROLE_KEYS) {
    const r = m.ROLES[k];
    assert.equal(r.grid.length, m.MASCOT.rows, k);
    r.grid.forEach((row, y) => {
      assert.equal(row.length, m.MASCOT.cols, `${k} row ${y}`);
      for (const ch of row) assert.ok(ch === '.' || 'wpXx'.includes(ch) || ch in r.paint, `${k} row ${y}: "${ch}" has a paint`);
    });
    assert.ok(r.grid.join('').includes('X'), `${k} wears the agent's colour`);
    assert.ok(r.grid.join('').includes('w') && r.grid.join('').includes('p'), `${k} has eyes`);
    assert.ok(r.names.length >= 4 && new Set(r.names).size === r.names.length, `${k} has a pool of names`);
  }
  assert.equal(new Set(m.ROLE_KEYS.map((k) => m.ROLES[k].animal)).size, 9, 'every role a different animal');
});

test('roleOf reads the subagent type first, then the words of its task; nothing known is a worker', () => {
  const cases = [
    [{ type: 'security-reviewer' }, 'auditor'],
    [{ type: 'code-reviewer' }, 'reviewer'],
    [{ type: 'relai:relai-reviewer' }, 'reviewer'],
    [{ type: 'tdd-guide' }, 'tester'],
    [{ type: 'pr-test-analyzer' }, 'tester'],
    [{ type: 'Plan' }, 'architect'],
    [{ type: 'architect' }, 'architect'],
    [{ type: 'Explore' }, 'analyst'],
    [{ type: 'docs-lookup' }, 'analyst'],
    [{ type: 'doc-updater' }, 'writer'],
    [{ type: 'loop-operator' }, 'manager'],
    [{ type: 'relai:relai-coder' }, 'developer'],
    [{ type: 'build-error-resolver' }, 'developer'],
    [{ type: 'general-purpose', description: 'Zbadaj pliki panelu' }, 'analyst'],
    [{ type: 'general-purpose', description: 'Napraw test parytetu' }, 'tester'],
    [{ type: 'general-purpose', description: 'Napraw parser modelu' }, 'developer'],
    [{ type: 'general-purpose', description: 'Audyt Cloudflare' }, 'auditor'],
    [{ type: 'claude', description: 'Ułóż listę zakupów' }, 'worker'],
    [{}, 'worker'],
  ];
  for (const [a, want] of cases) assert.equal(m.roleOf(a), want, JSON.stringify(a));
});

test('nameFor hands out the pool in order, never twice, and numbers past its end', () => {
  assert.equal(m.nameFor('reviewer', []), 'Sowa Zofia');
  assert.equal(m.nameFor('reviewer', ['Sowa Zofia']), 'Sowa Sabina');
  const all = [...m.ROLES.worker.names];
  assert.equal(m.nameFor('worker', all), `${all[0]} 2`);
  assert.equal(m.nameFor('worker', [...all, `${all[0]} 2`]), `${all[0]} 3`);
});

test('pickHue takes the next colour no running agent wears, and wraps when all are taken', () => {
  assert.equal(m.pickHue([], 0), 0);
  assert.equal(m.pickHue([0, 1], 0), 2);
  assert.equal(m.pickHue([7], 7), 0);
  assert.equal(m.pickHue([0, 1, 2, 3, 4, 5, 6, 7], 5), 5);
});

test('the outline reads at least 3:1 on the sheet of each look, and so do the eight agent colours on dark', () => {
  assert.ok(ratio(m.OUTLINE.dark, SHEET_DARK) >= 3, `dark ${ratio(m.OUTLINE.dark, SHEET_DARK).toFixed(2)}`);
  assert.ok(ratio(m.OUTLINE.light, SHEET_LIGHT) >= 3, `light ${ratio(m.OUTLINE.light, SHEET_LIGHT).toFixed(2)}`);
  assert.equal(new Set(m.AGENT_HUES.map((h) => h.color)).size, 8);
  for (const h of m.AGENT_HUES) assert.ok(ratio(h.color, SHEET_DARK) >= 3, `${h.name} on dark`);
});

test('frames: a crouch moves all but the feet a cell down, a blink leaves no eye white', () => {
  for (const k of m.ROLE_KEYS) {
    const stand = m.mascotCells(k, 0, 0);
    const crouch = m.mascotCells(k, 0, 1);
    const blink = m.mascotCells(k, 0, 2);
    // Feet stay put and on top; the head moves down a cell
    const feet = m.ROLES[k].paint.f;
    for (const [key, c] of stand) if (c === feet && Number(key.split(',')[1]) === m.MASCOT.rows) assert.equal(crouch.get(key), feet, `${k}: foot ${key} stays`);
    const top = (cells) => Math.min(...[...cells.keys()].map((key) => Number(key.split(',')[1])));
    assert.equal(top(crouch), top(stand) + 1, `${k}: crouch lowers the head`);
    assert.ok([...stand.values()].includes(ROOT.kartka), `${k}: eyes open show their white`);
    assert.ok(![...blink.values()].includes(ROOT.kartka) || k === 'developer' || k === 'worker' || k === 'manager', `${k}: blink hides the white`);
    for (const key of stand.keys()) {
      const [x, y] = key.split(',').map(Number);
      assert.ok(x >= 0 && x < m.MASCOT.cols + 2 && y >= 0 && y < m.MASCOT.rows + 3, `${k}: ${key} inside`);
    }
  }
});

test('the agent colour paints the X marks, so two agents of one role differ', () => {
  const a = [...m.mascotCells('manager', 0, 0).values()];
  const b = [...m.mascotCells('manager', 4, 0).values()];
  assert.ok(a.includes(m.AGENT_HUES[0].color) && !a.includes(m.AGENT_HUES[4].color));
  assert.ok(b.includes(m.AGENT_HUES[4].color));
});

test('runsPath draws one run per stretch of a row', () => {
  assert.equal(m.runsPath([[1, 2], [2, 2], [3, 2], [5, 2], [0, 4]]), 'M1 2h3v1h-3zM5 2h1v1h-1zM0 4h1v1h-1z');
  assert.equal(m.runsPath([]), '');
});

test('a working agent steps four CSS frames and stands still under reduced motion; a finished one is one frame', () => {
  for (const k of m.ROLE_KEYS) {
    const walk = m.mascotSvg(k, 3, { isWalking: true, phase: 0.3 });
    assert.equal((walk.match(/class="mascot-f mascot-f\d"/g) ?? []).length, 4, k);
    assert.match(walk, /prefers-reduced-motion: reduce\)\{\.mascot-f\{animation:none\}\.mascot-f0\{opacity:1\}/);
    assert.match(walk, /prefers-color-scheme: light\)\{\.mascot-o\{fill:#2a241d\}/);
    assert.ok(walk.length < 16000, `${k}: walking drawing weighs ${walk.length} chars`);
    assert.equal(twoTone(walk), walk, 'twoTone leaves a two-look drawing as it is');
    const still = m.mascotSvg(k, 3, { isWalking: false, still: m.STILL_FRAME.done });
    assert.doesNotMatch(still, /@keyframes|animation/);
    assert.ok(still.length < 4500, `${k}: still drawing weighs ${still.length} chars`);
  }
});

test('the card bar moves only while running, ids are its own, failed is clay', () => {
  const run = m.cardBarSvg('running', 2, 300, 'a1');
  assert.match(run, /@keyframes agent-bar-a1-run/);
  assert.match(run, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(m.cardBarSvg('running', 2, 300, 'a2'), /agent-bar-a1/);
  for (const s of ['done', 'stopped', 'failed']) assert.doesNotMatch(m.cardBarSvg(s, 2, 300, 'x'), /animation|@keyframes/, s);
  assert.match(m.cardBarSvg('failed', 2, 300, 'x'), new RegExp(`stop-color="${ROOT.glina}"`));
  assert.equal(m.cardBarSvg('done', 1, 300, 'k'), m.cardBarSvg('done', 1, 300, 'k'), 'the same on every redraw');
  assert.match(m.cardBarSvg('done', 1, 10, 'k'), /width="40"/, 'never narrower than 40 px');
});

test('the terminal glyph is two lines of four columns for every slot', () => {
  for (let s = 0; s < 4; s++) {
    const g = m.mascotGlyph(s);
    assert.equal(g.length, 2);
    for (const line of g) assert.equal([...line].length, m.MASCOT.terminalWidth);
  }
});
