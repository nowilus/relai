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
