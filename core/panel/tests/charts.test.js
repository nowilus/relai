'use strict';

// Rysunki raportu kosztow (plan PANEL_CLAUDE, E3): liczby Kalamem o szerokosci z metryk fontu,
// paski i kolumny bez tekstu w geometrii, odpowiedniki tekstowe dla terminala.

const assert = require('node:assert/strict');
const test = require('node:test');

const c = require('../charts.mjs');
const { NUMERALS } = require('../headings.mjs');
const { NUMERAL_GLYPHS } = require('../theme.mjs');

test('the cut font carries every glyph a figure may hold, and nothing is guessed', () => {
  assert.deepEqual(Object.keys(NUMERALS.advances).sort(), [...NUMERAL_GLYPHS].sort());
  assert.ok(NUMERALS.font.length > 1000);
});

test('a figure is as wide as its advances; a character outside the cut font gives null', () => {
  const a = c.figureArt('$0.42', 40, '#d9a134');
  const em = ['$', '0', '.', '4', '2'].reduce((s, ch) => s + NUMERALS.advances[ch], 0);
  assert.ok(a.width >= em * 40 && a.width <= em * 40 + 40 * 0.5, `width ${a.width} for ${em} em`);
  assert.match(a.svg, /viewBox="0 0 \d+ \d+"/);
  assert.match(a.svg, />\$0\.42<\/text>/);
  assert.ok(c.figureArt('$1.00', 40, '#000').width > c.figureArt('$1', 40, '#000').width, 'longer figure, wider art');
  assert.equal(c.figureArt('12 zł', 40, '#000'), null, 'ł is not in the cut font');
});

test('the stack bar has a slice per non-zero value and no text', () => {
  const svg = c.stackBar([{ value: 3, color: '#a' }, { value: 0, color: '#b' }, { value: 1, color: '#c' }], '#t', 12);
  assert.equal((svg.match(/fill="#a"|fill="#c"/g) || []).length, 2);
  assert.ok(!svg.includes('fill="#b"'), 'a zero slice is not drawn');
  assert.ok(!/<text/.test(svg));
  assert.match(svg, /preserveAspectRatio="none"/);
  assert.equal((c.stackBar([], '#t', 12).match(/<rect/g) || []).length, 2, 'clip and track only');
});

test('columns: the tallest is full height, the marked one has its own color, a gap is the track', () => {
  const svg = c.columns([1, 4, null, 2], { color: '#a', markColor: '#m', track: '#t', mark: 1, height: 50 });
  const rects = [...svg.matchAll(/<rect [^>]*height="([\d.]+)"[^>]*fill="([^"]+)"/g)].map((m) => [Number(m[1]), m[2]]);
  assert.equal(rects.length, 4);
  assert.deepEqual(rects[1], [48, '#m']);
  assert.equal(rects[2][1], '#t');
  assert.ok(!/<text/.test(svg));
});

test('a round scale step: 1, 2 or 5 times a power of ten', () => {
  assert.equal(c.niceStep(0.22), 0.1);
  assert.equal(c.niceStep(0.18), 0.05);
  assert.equal(c.niceStep(3.7), 1);
  assert.equal(c.niceStep(0), 0);
});

const OPT = { color: '#a', markColor: '#m', track: '#t', grid: '#g', background: '#bg', card: '#k', line: '#l', text: '#x', muted: '#u', mark: 1, height: 120, step: 0.1 };
const point = (value, head) => ({ value, head, figure: value === null ? 'brak' : '$' + value, rows: [
  { color: '#1', label: 'wejście', value: '2 · <$0.01' }, { color: '#2', label: 'odczyt cache', value: '14.2M · $2.84' },
  { color: '#3', label: 'zapis cache', value: '1k · $0.01' }, { color: '#4', label: 'wyjście', value: '500 · $0.01' }] });

test('scale labels: $0 at the base, as many decimals as the step needs', () => {
  assert.equal(c.scaleLabel(0, 0.1), '$0');
  assert.equal(c.scaleLabel(0.1, 0.1), '$0.10');
  assert.equal(c.scaleLabel(0.05, 0.05), '$0.05');
  assert.equal(c.scaleLabel(0.005, 0.005), '$0.005');
  assert.equal(c.scaleLabel(2, 1), '$2');
});

test('past MAX_COLUMNS neighbouring calls share a column, every call in exactly one', () => {
  assert.deepEqual(c.bucketRanges(3), [[0, 0], [1, 1], [2, 2]]);
  const r = c.bucketRanges(150);
  assert.ok(r.length <= c.MAX_COLUMNS, `${r.length} columns`);
  assert.equal(r[0][0], 0);
  assert.equal(r[r.length - 1][1], 149);
  for (let i = 1; i < r.length; i += 1) assert.equal(r[i][0], r[i - 1][1] + 1, 'no gap, no overlap');
  assert.deepEqual(c.bucketRanges(0), []);
});

// Where a column lands in pixels when the chart is `width` wide: its nested drawing at x% of
// the width, the rect shifted inside it by pixels, as wide as a percent of the width.
function columnsAt(svg, width) {
  return [...svg.matchAll(/<svg class="b b\d+" x="([\d.]+)%"[^>]*><rect [^>]*\/><rect class="c" x="(-?[\d.]+)"[^>]*width="([\d.]+)%"/g)]
    .map((m) => { const left = (Number(m[1]) / 100) * width + Number(m[2]); return [left, left + (Number(m[3]) / 100) * width]; });
}

test('the Y axis: values right-aligned in a gutter of their own; no column ever enters it or the right margin', () => {
  for (const n of [1, 2, 10, 43, 60]) {
    const pts = Array.from({ length: n }, (_, i) => point(0.02 * (i + 1), `23:0${i % 10} · wątek główny`));
    const svg = c.hoverColumns(pts, { ...OPT, step: c.niceStep(0.02 * n) });
    const ys = [...svg.matchAll(/<text class="a" x="(\d+)"[^>]*text-anchor="end"[^>]*>([^<]*)<\/text>/g)];
    assert.equal(ys[0][2], '$0');
    assert.ok(ys.every((m) => Number(m[1]) === c.AXIS.gutter - c.AXIS.gap), 'every value ends a gap before the plot');
    for (const width of [300, 560, 900]) {
      const cols = columnsAt(svg, width);
      assert.equal(cols.length, n);
      const first = Math.min(...cols.map((x) => x[0]));
      const last = Math.max(...cols.map((x) => x[1]));
      assert.ok(first >= c.AXIS.gutter, `${n} columns at ${width}px: the first starts at ${first.toFixed(1)}`);
      assert.ok(last <= width - c.AXIS.right, `${n} columns at ${width}px: the last ends at ${last.toFixed(1)}`);
      for (let i = 1; i < cols.length; i += 1) assert.ok(cols[i][0] >= cols[i - 1][1], `columns ${i - 1} and ${i} overlap at ${width}px`);
    }
  }
  assert.ok(!/x="[\d.]+%"[^>]*>\d\d:\d\d</.test(c.hoverColumns([point(0.1, '23:00 · x')], OPT)), 'no X axis');
});

test('the instrument catches a column in the gutter (planted defect)', () => {
  const planted = '<svg class="b b0" x="0.000%" y="0" overflow="visible"><rect x="0" y="0" width="1%" height="1" fill="transparent"/><rect class="c" x="10" y="0" width="5%" height="1" rx="2" fill="#a"/></svg>';
  assert.ok(columnsAt(planted, 900)[0][0] < c.AXIS.gutter);
});

test('hover columns: a card per column, shown by its own column, pinned inside the plot', () => {
  const svg = c.hoverColumns([point(0.1, '22:54 · wątek główny'), point(0.22, '22:55 · subagent <x>'), point(null, '22:56 · kompakcja')], OPT);
  assert.match(svg, /^<svg[^>]* width="100%"/, 'not stretched: no viewBox, percent columns, pixel cards');
  assert.ok(!/preserveAspectRatio|viewBox/.test(svg));
  assert.match(svg, /<rect width="100%" height="100%" fill="#bg"\/>/, 'its own background over the white frame');
  assert.equal((svg.match(/<line [^>]*stroke="#g"/g) || []).length, 3, '0.1, 0.2, 0.3: the top is rounded up to a step');
  assert.ok(svg.includes('fill="#m"'), 'the marked column');
  assert.match(svg, /\.b0:hover~\.t0,\.b1:hover~\.t1,\.b2:hover~\.t2\{display:inline\}/);
  assert.ok(svg.lastIndexOf('class="b ') < svg.indexOf('class="t '), 'the cards follow every column, as siblings');
  assert.ok(svg.includes('22:55 · subagent &lt;x>'));
  assert.equal((svg.match(/<circle /g) || []).length, 12, 'a dot per category on each card');
  // a card's left and right edge at a given width: inside the plot, at every width it is drawn in
  const cards = [...svg.matchAll(/<svg class="t t\d+" x="([^"]+)"[^>]*><g transform="translate\((-?\d+) 0\)">/g)];
  // a card needs gutter + TIP.width + margins = 318 px: the narrowest desktop pane measured is wider
  for (const width of [360, 560, 900]) {
    for (const [, x, dx] of cards) {
      const left = (x.endsWith('%') ? (Number(x.slice(0, -1)) / 100) * width : Number(x)) + Number(dx);
      assert.ok(left >= c.AXIS.gutter && left + c.TIP.width <= width - c.AXIS.right, `a card at ${left}px in ${width}px`);
    }
  }
  assert.equal(cards[0][1], '100%', 'a column on the left half: its card in the right corner');
  assert.equal(cards[2][1], String(c.AXIS.gutter + 4), 'and the other way round');
});

test('the card is wide enough for its longest line, with a margin for the widest glyphs', () => {
  // Segoe UI at 12 px: digits and lower case average under 0.6 em; 0.62 em per character is the bound
  const need = c.TIP.pad * 2 + 14 + c.TIP_MAX_CHARS * 0.62 * c.TIP.font;
  assert.ok(need <= c.TIP.width, `${need.toFixed(0)} px needed, ${c.TIP.width} px drawn`);
  const longest = ['22:54 · subagent a9f599bd', 'odczyt cache ' + '14.2M · $2.84'];
  for (const s of longest) assert.ok(s.length <= c.TIP_MAX_CHARS, `${s} (${s.length})`);
});

test('terminal blocks fill exactly the width and keep every non-zero slice visible', () => {
  const runs = c.blocks([{ value: 1000, color: 'a' }, { value: 1, color: 'b' }, { value: 0, color: 'z' }], 20);
  assert.equal(runs.map((r) => r.text).join('').length, 20);
  assert.deepEqual(runs.map((r) => r.color), ['a', 'b'], 'the tiny slice keeps one cell, the zero one none');
  assert.deepEqual(c.blocks([], 20), []);
});

test('the spark line: one character per value, the tallest is █, a gap a space', () => {
  assert.equal(c.spark([0, 7, null, 14]), '▁▅ █');
  assert.equal(c.spark([]), '');
});

// E9 (calibration 2026-10-09, "Pola i segmenty"): the progress as one bar cut into a segment per
// item, each in the color of its own state, in source order
test('segments: one rounded rect per item, in order, each in its own color, the markup with a width', () => {
  const svg = c.segments(['#aaa', '#bbb', '#aaa'], 10);
  const fills = [...svg.matchAll(/<rect [^>]*fill="(#[0-9a-f]+)"/g)].map((m) => m[1]);
  assert.deepEqual(fills, ['#aaa', '#bbb', '#aaa']);
  assert.match(svg, /^<svg [^>]*width="1000"/);
  assert.match(svg, /preserveAspectRatio="none"/);
  assert.equal(c.segments([], 10), null);
});

test('segmentText: the terminal\'s segments fill the width, one cell apart, never wider than it', () => {
  const { runs, gap } = c.segmentText(['a', 'b', 'a', 'b'], 23);
  assert.equal(runs.length, 4);
  assert.equal(gap, 1);
  assert.deepEqual(runs.map((r) => r.color), ['a', 'b', 'a', 'b']);
  const width = runs.reduce((s, r) => s + r.text.length, 0) + gap * (runs.length - 1);
  assert.ok(width <= 23 && width >= 20, 'width ' + width);
  assert.ok(runs.every((r) => /^█+$/.test(r.text)));
  const many = c.segmentText(Array(40).fill('x'), 20);
  assert.equal(many.runs.length, 40, 'every item keeps a cell, even when the width is short (the row wraps)');
  assert.equal(many.gap, 0);
  assert.ok(many.runs.every((r) => r.text === '█'));
});

// E9 (calibration 2026-10-09): hovering a segment shows which item it is; the line under the bar
// names the next item to tick while nothing is hovered
test('hoverSegments: a hover target and a card per item, the card shown by its own segment\'s hover', () => {
  const segs = [
    { color: '#a1a1a1', head: '✓ 1/2 · ukończone — Testy', detail: 'Testy repo — komenda <bez> błędu' },
    { color: '#b2b2b2', head: '○ 2/2 · oczekuje — Typy', detail: 'tsc strict' },
  ];
  const { svg, height } = c.hoverSegments(segs, { background: '#262c27', text: '#eee8dc', muted: '#b8b0a3', idle: ['Następny: Typy', 'tsc strict'] });
  assert.ok(height >= 40 && height <= 56, 'height ' + height);
  assert.match(svg, /^<svg [^>]*width="100%"/);
  assert.deepEqual([...svg.matchAll(/class="c" [^>]*fill="(#[0-9a-f]+)"/g)].map((m) => m[1]), ['#a1a1a1', '#b2b2b2']);
  assert.match(svg, /\.b0:hover~\.t0,\.b1:hover~\.t1\{display:inline\}/);
  assert.match(svg, /\.b0:hover~\.d,\.b1:hover~\.d\{display:none\}/);
  assert.ok(svg.includes('Testy repo — komenda &lt;bez> błędu'), 'the detail escaped (< as &lt;, as esc does)');
  assert.ok(svg.includes('Następny: Typy'));
  assert.equal(svg.indexOf('class="t t0"') > svg.indexOf('class="b b1"'), true, 'cards follow every segment, so ~ reaches them');
  const long = c.hoverSegments([{ color: '#a1a1a1', head: 'x', detail: 'y'.repeat(400) }], { background: '#000000', text: '#ffffff', muted: '#cccccc', idle: ['', ''] });
  assert.ok(!long.svg.includes('y'.repeat(200)), 'a long detail is clipped');
  const narrow = c.hoverSegments([{ color: '#a1a1a1', head: 'x', detail: 'y'.repeat(400) }], { background: '#000000', text: '#ffffff', muted: '#cccccc', idle: ['', ''], chars: 40 });
  assert.ok(narrow.svg.includes('y'.repeat(39) + '…') && !narrow.svg.includes('y'.repeat(40)), 'the line fits the slot it is given');
  assert.equal(c.hoverSegments([], { background: '#000000', text: '#ffffff', muted: '#cccccc', idle: ['', ''] }), null);
});
