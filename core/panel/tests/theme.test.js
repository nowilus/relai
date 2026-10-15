'use strict';

// Motyw panelu relai-panel (plan PANEL_CLAUDE, E8): kolory z :root szablonu planow, ikony
// sparowane z komendami, czytelnosc tekstu na kartach, naglowki Kalamem w swoich ramkach.
// Kazda kontrola ma druga strone: podlozony defekt musi zostac zgloszony (zasady 3 i 5).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const theme = require('../theme.mjs');
const { FORMS } = require('../commands.mjs');
const { HEADING_ART } = require('../headings.mjs');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const TEMPLATE = path.join(ROOT_DIR, 'core', 'templates', 'HTML_PLAN', 'szablon.html');
const ICONS = path.join(ROOT_DIR, 'docs', 'zasoby', 'branding', 'ikony');

// The `--name:#rrggbb` pairs of the template's :root block
function rootColors(html) {
  const block = html.match(/:root\s*\{([^}]*)\}/);
  if (!block) return null;
  const out = {};
  for (const m of (block[1] ?? '').matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) out[m[1]] = m[2].toLowerCase();
  return out;
}

function rootMismatches(html, root) {
  const found = rootColors(html);
  if (found === null) return ['no :root block'];
  return Object.entries(root).filter(([k, v]) => found[k] !== v).map(([k, v]) => `--${k}: theme ${v}, template ${found[k] ?? 'missing'}`);
}

test('every ROOT color is the template :root color of the same name', () => {
  const html = fs.readFileSync(TEMPLATE, 'utf8');
  const found = rootColors(html);
  assert.ok(found && Object.keys(found).length >= 12, 'colors read from :root: ' + Object.keys(found ?? {}).length);
  assert.deepEqual(rootMismatches(html, theme.ROOT), []);
});

test('a color changed in the template is reported (planted defect)', () => {
  const html = fs.readFileSync(TEMPLATE, 'utf8').replace('--glina:#c4643c', '--glina:#c4643d');
  assert.deepEqual(rootMismatches(html, theme.ROOT), ['--glina: theme #c4643c, template #c4643d']);
});

function pairing(commands, iconFiles, names) {
  const icons = new Set(iconFiles.map((f) => f.replace(/\.svg$/, '')));
  const used = new Set(commands.map(theme.iconName));
  return {
    noIcon: commands.filter((c) => !icons.has(theme.iconName(c))),
    noCommand: [...icons].filter((i) => !used.has(i)),
    noName: commands.filter((c) => !names[c]),
    paired: commands.filter((c) => icons.has(theme.iconName(c)) && names[c]).length,
  };
}

test('each command of FORMS has an icon and a name, each icon file a command', () => {
  const commands = FORMS.map((f) => f.command);
  const files = fs.readdirSync(ICONS).filter((n) => n.endsWith('.svg'));
  const r = pairing(commands, files, theme.NAMES);
  assert.deepEqual({ noIcon: r.noIcon, noCommand: r.noCommand, noName: r.noName }, { noIcon: [], noCommand: [], noName: [] },
    `paired ${r.paired} of ${commands.length} commands with ${files.length} icon files`);
  assert.equal(r.paired, commands.length, `paired ${r.paired} of ${commands.length} commands`);
  assert.equal(files.length, commands.length, `${files.length} icon files for ${commands.length} commands`);
});

test('a command without an icon and an icon without a command are reported (planted defect)', () => {
  const r = pairing(['relai-stage', 'relai-new'], ['stage.svg', 'old.svg'], { 'relai-stage': ['x', 'y'], 'relai-new': ['x', 'y'] });
  assert.deepEqual(r.noIcon, ['relai-new']);
  assert.deepEqual(r.noCommand, ['old']);
});

test('featured and grouped commands cover FORMS exactly once', () => {
  const placed = [...theme.FEATURED, ...theme.GROUPS.flatMap((g) => g.commands)];
  const all = FORMS.map((f) => f.command);
  assert.deepEqual([...placed].sort(), [...all].sort(), `placed ${placed.length} of ${all.length}`);
  assert.equal(new Set(placed).size, placed.length, 'a command placed twice');
});

// WCAG 2.x contrast ratio of two #rrggbb colors
function contrast(a, b) {
  const lum = (c) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const TEXTS = ['title', 'body', 'accentText', 'mark', 'ok'];
const CARDS = ['card', 'cardOn', 'cardFeatured'];

function lowContrast(t, min) {
  return TEXTS.flatMap((x) => CARDS.map((c) => [x, c, contrast(t[x], t[c])])).filter(([, , r]) => r < min)
    .map(([x, c, r]) => `${x} on ${c}: ${r.toFixed(2)}`);
}

test('every text color reads on every card (WCAG AA, 4.5:1)', () => {
  assert.deepEqual(lowContrast(theme.THEME, 4.5), [], `checked ${TEXTS.length * CARDS.length} pairs`);
});

test('a text color too close to its card is reported (planted defect)', () => {
  const bad = { ...theme.THEME, body: theme.mix(theme.THEME.card, '#ffffff', 0.1) };
  assert.ok(lowContrast(bad, 4.5).some((l) => l.startsWith('body on card:')));
});

test('mix() walks from one color to the other', () => {
  assert.equal(theme.mix('#000000', '#ffffff', 0), '#000000');
  assert.equal(theme.mix('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(theme.mix('#c4643c', '#fffdf7', 0.25), '#d38a6b');
});

function headingProblems(headings, art) {
  const out = [];
  for (const h of headings) {
    const a = art[h.key];
    if (!a) { out.push(`${h.key}: not drawn`); continue; }
    if (a.text !== h.text) out.push(`${h.key}: drawn "${a.text}", wanted "${h.text}"`);
    if (!a.svg.includes(`fill="${h.color}"`)) out.push(`${h.key}: color is not ${h.color}`);
    const vb = a.svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    if (!vb || Number(vb[1]) !== a.width) out.push(`${h.key}: viewBox width is not ${a.width}`);
    if (a.x + a.textWidth > a.width) out.push(`${h.key}: text ${a.x}+${a.textWidth} px past ${a.width} px`);
  }
  for (const k of Object.keys(art)) if (!headings.some((h) => h.key === k)) out.push(`${k}: drawn but not in HEADINGS`);
  return out;
}

test('every Kalam heading is drawn from HEADINGS and fits its own box', () => {
  assert.deepEqual(headingProblems(theme.HEADINGS, HEADING_ART), [],
    `checked ${theme.HEADINGS.length} headings; rebuild: node core/tools/build-panel-headings.js`);
  const total = Object.values(HEADING_ART).reduce((n, a) => n + a.svg.length, 0);
  assert.ok(Object.values(HEADING_ART).every((a) => a.svg.length < 131072), 'an SVG past the engine limit of 131072 characters');
  assert.ok(total > 0);
});

test('a heading wider than its box and a stale heading text are reported (planted defect)', () => {
  const art = JSON.parse(JSON.stringify(HEADING_ART));
  art.hero.textWidth = art.hero.width;
  art.featured.text = 'Polecane wczoraj';
  const p = headingProblems(theme.HEADINGS, art);
  assert.ok(p.some((l) => l.startsWith('hero: text')), p.join('; '));
  assert.ok(p.some((l) => l.startsWith('featured: drawn')), p.join('; '));
});

// E9 bars above the prompt (STYL_PASKOW_CLAUDE.md): each label, text, muted text and tile text
// reads on the background it is drawn on
function barPairs(band, bar) {
  const pairs = [];
  for (const [k, c] of Object.entries(band)) {
    pairs.push([k + ' label', c.color, c.bg], [k + ' text', bar.text, c.bg], [k + ' muted', bar.muted, c.bg]);
  }
  for (const [k, t] of Object.entries(bar.tile)) pairs.push(['tile ' + k, t.text, t.bg]);
  return pairs.filter(([, fg, bg]) => contrast(fg, bg) < 4.5).map(([n, fg, bg]) => `${n}: ${contrast(fg, bg).toFixed(2)}`);
}

// Brief v2 (STYL_PASKOW_CLAUDE.md §2, §5, 2026-10-10): the label is the bar's own word, the brand
// stays in its color; the label column is 14 cells, wide enough for each label
test('BAND: three bars labelled plan, postęp and cache, with a label color and a background of their own', () => {
  assert.deepEqual(Object.keys(theme.BAND), ['cache', 'panel', 'progress']); // the brief's order
  assert.deepEqual(Object.values(theme.BAND).map((b) => b.label), ['cache', 'plan', 'postęp']);
  const bars = Object.values(theme.BAND);
  for (const b of bars) assert.doesNotMatch(b.label, /RelAI/);
  assert.equal(new Set(bars.map((b) => b.bg)).size, 3, 'two bars share a background');
  assert.equal(new Set(bars.map((b) => b.color)).size, 3, 'two bars share a label color');
});

test('BAR: the label column is 14 cells and holds every label', () => {
  assert.equal(theme.BAR.labelColumn, 14);
  for (const b of Object.values(theme.BAND)) assert.ok(b.label.length <= theme.BAR.labelColumn, b.label);
  assert.equal(theme.BAR.figureColumn, 11);
});

// Brief v2 §4: the rings of the cache bar and the colors of their thresholds
test('RING: a 22 px ring, 3.2 px stroke, 4.4 px on hover, on a #1d1b18 track', () => {
  assert.equal(theme.RING.diameter, 22);
  assert.equal(theme.RING.stroke, 3.2);
  assert.equal(theme.RING.hoverStroke, 4.4);
  assert.equal(theme.RING.track, '#1d1b18');
});

test('usageColor: sage below 70 %, mustard from 70 %, clay from 90 % (69/70/89/90)', () => {
  const sage = theme.BAR.segment.done;
  const mustard = theme.BAND.panel.color;
  const clay = theme.BAND.cache.color;
  assert.deepEqual([0, 69, 69.9, 70, 89, 89.9, 90, 100, 130].map(theme.usageColor),
    [sage, sage, sage, mustard, mustard, mustard, clay, clay, clay]);
  assert.equal(new Set([sage, mustard, clay]).size, 3, 'two thresholds share a color');
});

test('cacheColor: sage while the cache is warm, mustard at 35 % of TTL left or less, clay at 15 % or less and when cold', () => {
  const sage = theme.BAR.segment.done;
  const mustard = theme.BAND.panel.color;
  const clay = theme.BAND.cache.color;
  assert.deepEqual([100, 36, 35.1, 35, 16, 15.1, 15, 1, 0].map((p) => theme.cacheColor(p)),
    [sage, sage, sage, mustard, mustard, mustard, clay, clay, clay]);
  assert.equal(theme.cacheColor(100, true), clay); // cold whatever the share says
});

test('a missing figure draws the bare track, never a pretend color (brief §4: brak danych)', () => {
  for (const v of [null, undefined, Number.NaN, Infinity]) {
    assert.equal(theme.usageColor(/** @type {any} */ (v)), theme.RING.track);
    assert.equal(theme.cacheColor(/** @type {any} */ (v)), theme.RING.track);
  }
});

test('CHIP: the second rows\' chips read on their background (WCAG AA, 4.5:1)', () => {
  assert.deepEqual(Object.keys(theme.CHIP), ['warn', 'ok', 'run', 'info']);
  const low = Object.entries(theme.CHIP).filter(([, c]) => contrast(c.color, c.bg) < 4.5).map(([k]) => k);
  assert.deepEqual(low, []);
});

// Aneks Z11 (brief v3 §10.5): the Z9 event is information, not an alarm — the bar's own surface a
// shade lighter, its lead in the text color and the rest muted, both readable
test('CHIP.info: the cache bar\'s surface a tenth lighter, the text and the muted text read on it', () => {
  assert.equal(theme.CHIP.info.bg, theme.mix(theme.BAND.cache.bg, theme.BAR.text, 0.1));
  assert.equal(theme.CHIP.info.color, theme.BAR.text);
  assert.ok(contrast(theme.BAR.muted, theme.CHIP.info.bg) >= 4.5);
});

// Aneks Z11 (brief v3 §10.3): a battery shows what is LEFT; one rule of color for every battery
test('leftColor: sage above 30 % left, mustard at 30 % or less, clay at 10 % or less and when cold', () => {
  const sage = theme.BAR.segment.done;
  const mustard = theme.BAND.panel.color;
  const clay = theme.BAND.cache.color;
  assert.deepEqual([100, 31, 30.1, 30, 11, 10.1, 10, 1, 0].map((p) => theme.leftColor(p)),
    [sage, sage, sage, mustard, mustard, mustard, clay, clay, clay]);
  assert.equal(theme.leftColor(100, true), clay);
  for (const v of [null, undefined, Number.NaN]) assert.equal(theme.leftColor(/** @type {any} */ (v)), theme.RING.track);
});

test('BATTERY: the geometry of §10.3 and a card whose two lines read on it', () => {
  const b = theme.BATTERY;
  assert.deepEqual([b.height, b.font, b.textY, b.spanGap, b.itemGap], [24, 14.5, 17, 7, 30]);
  assert.deepEqual([b.icon.w, b.icon.h, b.icon.y, b.icon.gap], [26, 12, 6, 8]);
  assert.deepEqual([b.card.h, b.card.pad, b.card.gap, b.card.font, b.card.lineGap], [22, 11, 6, 13, 9]);
  assert.deepEqual([b.warn, b.alert], [30, 10]);
  assert.equal(b.card.bg, theme.mix(theme.BAND.cache.bg, theme.BAR.text, 0.14));
  for (const fg of [theme.BAR.text, theme.BAR.muted]) assert.ok(contrast(fg, b.card.bg) >= 4.5, fg);
});

test('every text of the bars reads on its background (WCAG AA, 4.5:1)', () => {
  assert.deepEqual(barPairs(theme.BAND, theme.BAR), []);
});

test('a bar text too close to its background is reported (planted defect)', () => {
  const bad = { ...theme.BAND, cache: { ...theme.BAND.cache, color: theme.mix(theme.BAND.cache.bg, '#ffffff', 0.1) } };
  assert.ok(barPairs(bad, theme.BAR).some((l) => l.startsWith('cache label:')));
});

// The documents tab's diff (E6, Aneks E): each row's text on its own background, the gutter too
function diffPairs(d, cardOn) {
  const pairs = [['add', d.addText, d.addBg], ['add gutter', d.gutter, d.addBg], ['del', d.delText, d.delBg], ['del gutter', d.gutter, d.delBg],
    ['context', d.ctxText, cardOn], ['gutter', d.gutter, cardOn], ['hunk', d.hunk, cardOn]];
  return pairs.filter(([, fg, bg]) => contrast(fg, bg) < 4.5).map(([n, fg, bg]) => `${n}: ${contrast(fg, bg).toFixed(2)}`);
}

test('every row of a diff reads on its background (WCAG AA, 4.5:1)', () => {
  assert.deepEqual(diffPairs(theme.DIFF, theme.THEME.cardOn), []);
  const bad = { ...theme.DIFF, addText: theme.mix(theme.DIFF.addBg, '#ffffff', 0.1) };
  assert.ok(diffPairs(bad, theme.THEME.cardOn).some((l) => l.startsWith('add:')), 'planted defect');
});

// ---------- WYGLAD_PANELU E3 (Aneks E, P-044): the pane in both appearances of the app ----------
// Text and frames go by theme keys, which the desktop paints by the app's appearance; the sheet and
// every drawing (Svg) carry the light palette under `@media (prefers-color-scheme: light)`.

const TONED = Object.keys(theme.TONE_ROLES);

function lowKeyContrast(roles, mode, bg, min = 4.5) {
  return roles.map((r) => [r, theme.KEY_SAMPLE[mode][theme.TONE_ROLES[r]] ?? r])
    .filter(([, fg]) => contrast(fg, bg) < min).map(([r, fg]) => `${mode} ${r}: ${contrast(fg, bg).toFixed(2)}`);
}

test('every text key reads on the sheet of both appearances (4.5:1)', () => {
  for (const mode of ['dark', 'light']) {
    assert.deepEqual(lowKeyContrast(TONED, mode, theme.SHEET[mode].sheet), []);
    // the diff's rows: their text key on the dimmed backgrounds
    for (const bg of ['diffAddedDimmed', 'diffRemovedDimmed']) {
      const fill = theme.KEY_SAMPLE[mode][bg];
      for (const k of ['text', 'inactive']) assert.ok(contrast(theme.KEY_SAMPLE[mode][k], fill) >= 4.5, `${mode} ${k} on ${bg}`);
    }
  }
});

test('the contrast check catches a key too weak for text (planted: claude)', () => {
  const planted = { ...theme.TONE_ROLES, planted: 'claude' };
  const low = Object.keys(planted).map((r) => [r, theme.KEY_SAMPLE.light[planted[r]]])
    .filter(([, fg]) => contrast(fg, theme.SHEET.light.sheet) < 4.5).map(([r]) => r);
  assert.deepEqual(low, ['planted']);
});

test('no raw color of the pane is left without a decision: text, frame, fill, drawing', () => {
  const raw = [...Object.values(theme.THEME), ...Object.values(theme.DIFF)];
  const undecided = (map) => raw.filter((c) => !(c in map));
  assert.deepEqual(undecided(theme.TONE_OF), [], 'a text color with no key');
  assert.deepEqual(undecided(theme.EDGE_OF), [], 'a frame color with no key');
  assert.deepEqual(undecided(theme.FILL_OF), [], 'a fill with no decision');
  assert.deepEqual(undecided(theme.SVG_LIGHT), [], 'a drawing color with no light value');
  for (const v of Object.values(theme.TONE_OF)) assert.match(v, /^[a-zA-Z]+$/, `${v} is a theme key`);
});

test('twoTone: a drawing in the dark palette gets the light one under the media query', () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect fill="${theme.THEME.card}"/><text fill="${theme.THEME.title}">a</text></svg>`;
  const out = theme.twoTone(svg);
  assert.match(out, /@media \(prefers-color-scheme: light\)/);
  assert.ok(out.includes(`[fill="${theme.THEME.card}"]{fill:${theme.SVG_LIGHT[theme.THEME.card]}}`));
  assert.ok(out.includes(`[fill="${theme.THEME.title}"]`));
  assert.ok(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>'));
  // a drawing that already carries both palettes (the bars) stays as it is; one with no color of ours too
  const both = theme.stepCss ? `<svg><style>${theme.stepCss()}</style></svg>` : '';
  assert.equal(theme.twoTone(both), both);
  const foreign = '<svg><rect fill="#123456"/></svg>';
  assert.equal(theme.twoTone(foreign), foreign);
});

test('the sheet: fill and frame in one drawing, top and end, both palettes (Aneks F, P-044)', () => {
  for (const svg of [theme.sheetTopSvg(), theme.sheetEndSvg()]) {
    assert.match(svg, /width="100%" height="100%"/); // the slot's width, never a fixed 1000 px (the seam)
    for (const mode of ['dark', 'light']) {
      assert.ok(svg.includes(theme.SHEET[mode].sheet) && svg.includes(theme.SHEET[mode].edge), mode);
    }
    assert.match(svg, /@media \(prefers-color-scheme: light\)/);
    assert.match(svg, /stroke-width:1px/);
  }
  // the top hides its bottom edge below the drawing, the end hides its top edge above it
  assert.match(theme.sheetTopSvg(), /height:calc\(100% \+ \d+px\)/);
  assert.match(theme.sheetEndSvg(), /y:-\d+px/);
});

// The paint a drawn shape shows in the light look: a rule of the light media query for its class
// or for its dark paint outranks the presentation attribute (P-044)
function lightPaints(svg) {
  const media = (svg.match(/@media \(prefers-color-scheme: light\)\{(.*)\}<\/style>/) ?? [])[1] ?? '';
  const rules = [...media.matchAll(/([^{}]+)\{([a-z-]+):(#[0-9a-f]{6})\}/g)].map((m) => ({ sel: m[1] ?? '', attr: m[2], value: m[3] }));
  return [...svg.matchAll(/<path ([^>]*)\/>/g)].map((m) => {
    const attrs = Object.fromEntries([...(m[1] ?? '').matchAll(/([a-z-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const attr = attrs.fill ? 'fill' : 'stroke';
    const hit = rules.find((r) => r.attr === attr && (r.sel === `.${attrs.class}` || r.sel === `[${attr}="${attrs[attr]}"]`));
    return hit ? hit.value : attrs[attr];
  });
}

// A folder that reads as a dark block on the light sheet: its body darker than a 2.5 : 1 contrast
// to the sheet, or its tab line lost in the body (Łukasz 2026-10-15: "wygląda to jak taki ciemny
// prostokąt")
function darkBlocks(svgs) {
  const sheet = theme.SHEET.light.sheet;
  return svgs.flatMap(([name, svg]) => {
    const [first, second] = lightPaints(svg);
    const [body, line] = name.startsWith('open') ? [second, first] : [first, second];
    return contrast(body, sheet) > 2.5 || contrast(body, line) < 1.3 ? [`${name}: ${body} / ${line}`] : [];
  });
}

test('folder icons: their own light palette, no dark block on the light sheet; the old palette is caught', () => {
  const doc = require('../documents.mjs');
  const f = theme.FOLDER;
  const drawn = (isOpen) => theme.twoTone(doc.folderIcon(isOpen, {
    fill: isOpen ? f.dark.front : f.dark.closed, edge: f.dark.back, dot: null,
    light: { fill: isOpen ? f.light.front : f.light.closed, edge: f.light.back },
  }, 20));
  assert.deepEqual(darkBlocks([['closed', drawn(false)], ['open', drawn(true)]]), []);
  // the dark look keeps the mustard it was calibrated in (2026-10-10)
  assert.equal(f.dark.closed, theme.ROOT.musztarda);
  // positive control: the palette before the fix, the closed body the text's mark, turns dark
  const before = theme.twoTone(doc.folderIcon(false, { fill: theme.ROOT.musztarda, edge: theme.mix(theme.ROOT.musztarda, '#000000', 0.35), dot: null }, 20));
  assert.equal(darkBlocks([['closed', before]]).length, 1);
});
