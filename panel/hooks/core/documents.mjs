// RelAI core / panel: documents — the project's documents as a shelf of tiles, and what changed
// (plan PANEL_CLAUDE, E6, Aneks E).
//
// The shelf: CLAUDE.md, AGENTS.md and every .md / .html under docs/, grouped by a closed list of
// RelAI names (core, knowledge, the active plan, other plans, resources, the archive folded).
// A tile is a document icon, its name and extension, size and last edit; a document the turn's
// writing tools named is marked (turn.step toolUses: probe relai-probe-e6, 2026-10-09), and every
// document changed since the last commit carries its added and removed lines (git diff --numstat).
// A chosen tile opens the document below the shelf: its changes since the last commit as a
// unified diff, or the document itself. git runs only through the two closed argv here; a path
// reaches git only when it is one of the shelf's own documents (as CLEAN_ARGV in E5).
//
// Pure logic only; the mod lists the files, runs the process and draws. Same ESM rule and same
// copy as plan-state.mjs (source here, synced copies in the plugins' hooks/core/).

import { LABELS, LABEL_CAP } from './headings.mjs';

/**
 * @typedef {{ path: string, bytes: number, mtimeMs: number }} FileEntry  path relative to the root, with "/"
 * @typedef {{ path: string, name: string, ext: string, bytes: number, mtimeMs: number,
 *   isChanged: boolean, added: number | null, removed: number | null }} Doc
 *   added / removed: lines since the last commit; null when git does not list the file as changed
 * @typedef {{ key: string, title: string, docs: Doc[], isFolded: boolean }} Group
 * @typedef {{ source: string, hunks: number, shown: number, isEmpty: boolean }} DiffView
 */

/** The tools whose call changes a file, and the field that names it. */
export const WRITING_TOOLS = Object.freeze({ Edit: 'file_path', Write: 'file_path', MultiEdit: 'file_path', NotebookEdit: 'notebook_path' });

/** The one argv of the shelf's line counts: every document changed since the last commit. */
export const NUMSTAT_ARGV = Object.freeze(['git', '-c', 'core.quotepath=false', 'diff', '--numstat', '--no-color', '--no-ext-diff', 'HEAD', '--', 'CLAUDE.md', 'AGENTS.md', 'docs']);

/** The engine draws at most 100 000 characters in one drawing (Code, Markdown): room for the rest. */
export const DRAW_CHARS = 60_000;

/** Folders under docs/ the shelf walks into, and how deep. */
export const MAX_DEPTH = 5;

/**
 * The kinds of file the shelf holds (calibration 2026-10-09: "PDF, TXT, JS i tak dalej"), each with
 * the label its icon carries and how its window shows it: Markdown drawn, text as code with its
 * language, a binary file not at all. Images, fonts and media stay off the shelf.
 * @type {Readonly<Record<string, { label: string, show: 'markdown' | 'code' | 'none', language?: string }>>}
 */
export const KINDS = Object.freeze({
  md: { label: 'MD', show: 'markdown' }, markdown: { label: 'MD', show: 'markdown' },
  html: { label: 'HTML', show: 'code', language: 'html' }, htm: { label: 'HTML', show: 'code', language: 'html' },
  pdf: { label: 'PDF', show: 'none' }, txt: { label: 'TXT', show: 'code' }, csv: { label: 'CSV', show: 'code' },
  json: { label: 'JSON', show: 'code', language: 'json' }, yml: { label: 'YML', show: 'code', language: 'yaml' }, yaml: { label: 'YML', show: 'code', language: 'yaml' },
  js: { label: 'JS', show: 'code', language: 'javascript' }, mjs: { label: 'JS', show: 'code', language: 'javascript' },
  ts: { label: 'TS', show: 'code', language: 'typescript' }, py: { label: 'PY', show: 'code', language: 'python' },
  svg: { label: 'SVG', show: 'code', language: 'xml' },
});

/** A file's kind from its name; null for a file the shelf does not hold. @param {string} name */
export function kindOf(name) {
  const m = /\.([A-Za-z0-9]+)$/.exec(name);
  const ext = m && m[1] ? m[1].toLowerCase() : '';
  return Object.prototype.hasOwnProperty.call(KINDS, ext) ? ext : null;
}

// A path git may be given: the shelf's own documents only, never an option or a parent folder
const SAFE_PATH = /^(?!-)(?!.*\.\.)[A-Za-z0-9._ \/ąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]+\.[A-Za-z0-9]+$/;

/** Closed lists of RelAI names: a document named here goes to its group, any other to "Pozostałe". */
const CORE = Object.freeze(['CLAUDE.md', 'AGENTS.md', 'docs/STATE.md', 'docs/USTAWIENIA.md', 'docs/KOMENDY.md']);
const KNOWLEDGE = Object.freeze(['docs/DZIENNIK.md', 'docs/LEKCJE.md', 'docs/DECYZJE.md', 'docs/PULAPKI.md', 'docs/ARTEFAKTY.md']);

/** @param {string} p */
const keyOf = (p) => String(p).replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\.\//, '').toLowerCase();

/**
 * The paths a turn's tool calls asked to change, relative to the project root where they lie in
 * it, as keys that compare on Windows (slashes and case folded).
 * @param {readonly { name: string, input: unknown }[]} uses
 * @param {string} root
 * @returns {string[]}
 */
export function changedPaths(uses, root) {
  const base = keyOf(root).replace(/\/$/, '') + '/';
  /** @type {string[]} */
  const out = [];
  for (const u of uses) {
    const field = /** @type {Record<string, string>} */ (WRITING_TOOLS)[u.name];
    const value = field && u.input && typeof u.input === 'object' ? /** @type {Record<string, unknown>} */ (u.input)[field] : undefined;
    if (typeof value !== 'string' || value === '') continue;
    const k = keyOf(value);
    const rel = k.startsWith(base) ? k.slice(base.length) : k;
    if (!out.includes(rel)) out.push(rel);
  }
  return out;
}

/**
 * git's line counts: "added<TAB>removed<TAB>path" per changed file; a binary file ("-") counts
 * as no lines. Keyed like changedPaths.
 * @param {string | null} text
 * @returns {Map<string, { added: number, removed: number }>}
 */
export function parseNumstat(text) {
  /** @type {Map<string, { added: number, removed: number }>} */
  const out = new Map();
  for (const line of String(text ?? '').split(/\r?\n/)) {
    const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
    if (!m || !m[3]) continue;
    out.set(keyOf(m[3]), { added: m[1] === '-' ? 0 : Number(m[1]), removed: m[2] === '-' ? 0 : Number(m[2]) });
  }
  return out;
}

/**
 * The argv that shows one document's changes since the last commit, or null when the path is not
 * one of the shelf's documents or not a plain path: nothing from elsewhere reaches git.
 * @param {string} path @param {readonly Doc[]} docs
 * @returns {string[] | null}
 */
export function diffArgv(path, docs) {
  if (!SAFE_PATH.test(path) || !docs.some((d) => d.path === path)) return null;
  return ['git', '-c', 'core.quotepath=false', 'diff', '--no-color', '--no-ext-diff', 'HEAD', '--', path];
}

/**
 * A unified diff as the engine's Code element draws it (format "diff"): the hunks only, the file
 * headers dropped, whole hunks up to `max` characters — a hunk cut in the middle does not parse.
 * @param {string | null} text @param {number} [max]
 * @returns {DiffView}
 */
export function diffView(text, max = DRAW_CHARS) {
  const lines = String(text ?? '').split(/\r?\n/);
  /** @type {string[][]} */
  const hunks = [];
  for (const line of lines) {
    if (line.startsWith('@@')) hunks.push([line]);
    else if (hunks.length && !/^(diff --git|index |--- |\+\+\+ |new file|deleted file|similarity|rename )/.test(line)) hunks[hunks.length - 1]?.push(line);
  }
  const texts = hunks.map((h) => { const end = h.reduce((n, l, i) => (l !== '' ? i : n), 0); return h.slice(0, end + 1).join('\n'); });
  /** @type {string[]} */
  const kept = [];
  let size = 0;
  for (const t of texts) {
    if (kept.length && size + t.length + 1 > max) break;
    kept.push(t);
    size += t.length + 1;
  }
  return { source: kept.join('\n'), hunks: texts.length, shown: kept.length, isEmpty: texts.length === 0 };
}

/** Rows of a diff the window draws; the rest is counted, never dropped silently. */
export const DIFF_ROWS = 400;

/**
 * A diff as rows the pane lays out itself (code review: old and new line numbers, the marker, the
 * text): the engine's Code drops `format: 'diff'` in 2.1.293 (plugin test, E6), so the panel does
 * not lean on it. A hunk header is a row of its own; "\ No newline" is read past.
 * @param {string} source  hunks, as diffView returns them
 * @param {number} [max]
 * @returns {{ rows: { kind: 'hunk' | 'add' | 'del' | 'ctx', old: number | null, new: number | null, text: string }[], hidden: number, added: number, removed: number }}
 */
export function diffRows(source, max = DIFF_ROWS) {
  /** @type {{ kind: 'hunk' | 'add' | 'del' | 'ctx', old: number | null, new: number | null, text: string }[]} */
  const rows = [];
  let oldN = 0, newN = 0, added = 0, removed = 0;
  for (const line of String(source).split('\n')) {
    const h = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/.exec(line);
    if (h) { oldN = Number(h[1]); newN = Number(h[2]); rows.push({ kind: 'hunk', old: null, new: null, text: line }); continue; }
    if (line.startsWith('\\')) continue;
    if (line.startsWith('+')) { rows.push({ kind: 'add', old: null, new: newN++, text: line.slice(1) }); added += 1; continue; }
    if (line.startsWith('-')) { rows.push({ kind: 'del', old: oldN++, new: null, text: line.slice(1) }); removed += 1; continue; }
    rows.push({ kind: 'ctx', old: oldN++, new: newN++, text: line.startsWith(' ') ? line.slice(1) : line });
  }
  return { rows: rows.slice(0, max), hidden: Math.max(0, rows.length - max), added, removed };
}

/**
 * The document as the Markdown element draws it, within what one drawing holds: whole when it
 * fits, else cut at a heading — the journal from its end (its newest entries), any other from
 * its start; `cut` says how much was left out.
 * @param {string} path @param {string | null} text @param {number} [max]
 * @returns {{ text: string, cut: number, isTail: boolean }}
 */
export function previewOf(path, text, max = DRAW_CHARS) {
  const all = String(text ?? '');
  if (all.length <= max) return { text: all, cut: 0, isTail: false };
  const isTail = /(^|\/)DZIENNIK\.md$/i.test(path);
  if (isTail) {
    const from = all.length - max;
    const at = all.indexOf('\n#', from);
    const start = at === -1 ? from : at + 1;
    return { text: all.slice(start), cut: start, isTail };
  }
  const at = all.lastIndexOf('\n#', max);
  const end = at > 0 ? at : max;
  return { text: all.slice(0, end), cut: all.length - end, isTail };
}

/**
 * The shelf: every document in its group, the edited ones first in each, the rest by name; the
 * edited ones also apart, on top (calibration 2026-10-09: "wylistowane na górze, żebym nie musiał
 * się przeklikiwać"), the turn's first; and the file tree. Groups in a fixed order;
 * the resources and the archive fold by default.
 * @param {readonly FileEntry[]} files
 * @param {{ planDir: string | null, changed: readonly string[], counts: Map<string, { added: number, removed: number }> }} x
 * @returns {{ changed: Doc[], edited: Doc[], groups: Group[], tree: TreeNode }}
 */
export function shelf(files, x) {
  const planDir = x.planDir ? x.planDir.replace(/\/$/, '') + '/' : null;
  /** @type {Doc[]} */
  const docs = files.filter((f) => kindOf(f.path) !== null).map((f) => {
    const k = keyOf(f.path);
    const n = x.counts.get(k);
    const name = f.path.slice(f.path.lastIndexOf('/') + 1);
    return {
      path: f.path, name, ext: /** @type {string} */ (kindOf(name)),
      bytes: f.bytes, mtimeMs: f.mtimeMs, isChanged: x.changed.includes(k), added: n ? n.added : null, removed: n ? n.removed : null,
    };
  });
  /** @param {Doc} d */
  const groupOf = (d) => {
    if (CORE.includes(d.path)) return 'core';
    if (KNOWLEDGE.includes(d.path)) return 'knowledge';
    if (planDir && d.path.startsWith(planDir)) return 'plan';
    if (d.path.startsWith('docs/plany/')) return 'plans';
    if (d.path.startsWith('docs/zasoby/')) return 'resources';
    if (d.path.startsWith('docs/archiwum/')) return 'archive';
    return 'other';
  };
  const order = /** @type {const} */ ([['core', 'Rdzeń', false], ['knowledge', 'Wiedza projektu', false], ['plan', 'Plan aktywny', false],
    ['other', 'Pozostałe', false], ['plans', 'Inne plany', false], ['resources', 'Zasoby', true], ['archive', 'Archiwum', true]]);
  /** @param {Doc} a @param {Doc} b */
  const sort = (a, b) => Number(b.isChanged) - Number(a.isChanged) || Number(b.added !== null) - Number(a.added !== null) || a.path.localeCompare(b.path);
  const groups = order.map(([key, title, isFolded]) => ({ key, title, isFolded, docs: docs.filter((d) => groupOf(d) === key).sort(sort) }))
    .filter((g) => g.docs.length > 0);
  return {
    changed: docs.filter((d) => d.isChanged).sort((a, b) => a.path.localeCompare(b.path)),
    edited: docs.filter((d) => d.isChanged || d.added !== null).sort(sort),
    groups,
    tree: docTree(docs),
  };
}

/**
 * @typedef {{ name: string, dir: string, folders: TreeNode[], docs: Doc[], edited: number }} TreeNode
 *   name: the folder's own name ('' for the root); dir: its path; edited: edited documents in it and below
 */

/**
 * The documents as a file tree, as an editor's explorer draws it (calibration 2026-10-09: "jak w
 * VS Code"): folders nested by name, each with its subfolders first, then its documents, both in
 * name order; the edited count of a folder covers everything below it.
 * @param {readonly Doc[]} docs
 * @returns {TreeNode}
 */
export function docTree(docs) {
  /** @type {TreeNode} */
  const root = { name: '', dir: '', folders: [], docs: [], edited: 0 };
  /** @type {Map<string, TreeNode>} */
  const nodes = new Map([['', root]]);
  /** @param {string} dir @returns {TreeNode} */
  const nodeOf = (dir) => {
    const found = nodes.get(dir);
    if (found) return found;
    const cut = dir.lastIndexOf('/');
    const parent = nodeOf(cut === -1 ? '' : dir.slice(0, cut));
    /** @type {TreeNode} */
    const node = { name: dir.slice(cut + 1), dir, folders: [], docs: [], edited: 0 };
    parent.folders.push(node);
    nodes.set(dir, node);
    return node;
  };
  for (const d of docs) {
    const dir = d.path.includes('/') ? d.path.slice(0, d.path.lastIndexOf('/')) : '';
    nodeOf(dir).docs.push(d);
  }
  /** @param {TreeNode} n @returns {number} */
  const settle = (n) => {
    n.folders.sort((a, b) => a.name.localeCompare(b.name));
    n.docs.sort((a, b) => a.name.localeCompare(b.name));
    n.edited = n.docs.filter((d) => d.isChanged || d.added !== null).length + n.folders.reduce((s, f) => s + settle(f), 0);
    return n.edited;
  };
  settle(root);
  return root;
}

/** The link a tree row's name carries: an https address no one serves (.invalid), pressed in the panel. */
export const TREE_LINK = 'https://relai.invalid/';

/** @param {'dir' | 'doc'} kind @param {string} path */
export function treeHref(kind, path) {
  return `${TREE_LINK}${kind}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** What a pressed tree link names, or null for any other link. @param {string} href @returns {{ kind: 'dir' | 'doc', path: string } | null} */
export function treeTarget(href) {
  if (!String(href).startsWith(TREE_LINK)) return null;
  const rest = String(href).slice(TREE_LINK.length);
  const m = /^(dir|doc)\/(.*)$/.exec(rest);
  if (!m || m[2] === undefined) return null;
  try {
    return { kind: /** @type {'dir' | 'doc'} */ (m[1]), path: m[2].split('/').map(decodeURIComponent).join('/') };
  } catch {
    return null;
  }
}

/**
 * A folder icon, closed or open, as an explorer draws one; a dot in its corner when something in
 * it is edited.
 * it is edited. `light`: the body and edge in the light look, a media rule of the drawing's own.
 * @param {boolean} isOpen @param {{ fill: string, edge: string, dot: string | null, light?: { fill: string, edge: string } }} c @param {number} px  height
 */
export function folderIcon(isOpen, c, px) {
  const w = Math.round((px * 24) / 20);
  const shape = isOpen
    ? `<path class="e" d="M2 5.5A1.5 1.5 0 0 1 3.5 4h5l2 2h8A1.5 1.5 0 0 1 20 7.5V9H6.2a1.5 1.5 0 0 0-1.4 1L2 17.5z" fill="${c.edge}"/>`
      + `<path class="f" d="M4.8 10a1.5 1.5 0 0 1 1.4-1H22a1 1 0 0 1 .95 1.3l-2.4 7.2a1.5 1.5 0 0 1-1.4 1H3a1 1 0 0 1-.95-1.3z" fill="${c.fill}"/>`
    : `<path class="f" d="M2 5.5A1.5 1.5 0 0 1 3.5 4h5l2 2h9A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 2 16.5z" fill="${c.fill}"/>`
      + `<path class="e" d="M2 8h19" stroke="${c.edge}" stroke-width="1.2"/>`;
  const dot = c.dot ? `<circle cx="20" cy="5" r="3.2" fill="${c.dot}"/>` : '';
  const light = c.light
    ? `<style>@media (prefers-color-scheme: light){.f{fill:${c.light.fill}}.e{${isOpen ? 'fill' : 'stroke'}:${c.light.edge}}}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20" width="${w}" height="${px}">${light}${shape}${dot}</svg>`;
}

/**
 * A label outline at two decimals of the em: a hundredth of the em is a tenth of a pixel on the
 * largest icon, and the tree draws a hundred icons a turn (2026-10-09: 4-decimal outlines made the
 * tree 256 KB and the desktop stopped showing the pane).
 * @param {string} d
 */
const lean = (d) => d.replace(/-?\d*\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));

/** "12,4 KB". @param {number} bytes */
export function kb(bytes) {
  return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
}

/**
 * When a document was last edited, in words: "dziś 11:42", "wczoraj 18:05", "07.10".
 * @param {number} at @param {number} now  ms
 */
export function edited(at, now) {
  const d = new Date(at), n = new Date(now);
  const day = (/** @type {Date} */ x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((day(n) - day(d)) / 86_400_000);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (days === 0) return `dziś ${hm}`;
  if (days === 1) return `wczoraj ${hm}`;
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear() === n.getFullYear() ? '' : '.' + d.getFullYear()}`;
}

/** The badge of an icon, in the icon's 42 × 48 units. */
const BADGE = Object.freeze({ x: 6, y: 24, w: 30, h: 15, pad: 3, max: 12 });

/**
 * A document icon: a page with a folded corner and a badge with the file's type (MD, HTML, PDF…)
 * in Kalam letters drawn as outlines — no font and no <text> in the SVG; the label's width is
 * the sum of the glyphs' advances from the font, scaled down into the badge when it is long
 * (L-0137: text placed by a guess at its width overflows).
 * @param {string} ext  a key of KINDS
 * @param {{ paper: string, edge: string, badge: string, ink: string }} c
 * @param {number} px  height; the width is 5/6 of it
 */
export function docIcon(ext, c, px) {
  const w = Math.round((px * 40) / 48);
  const label = (KINDS[ext] ?? { label: ext.toUpperCase().slice(0, 4) }).label;
  const glyphs = [...label].map((ch) => LABELS[ch]).filter((g) => g !== undefined);
  const em = glyphs.reduce((s, g) => s + g.advance, 0);
  // Rounded down to what the SVG writes (3 places): a label never exceeds its badge by a rounding
  const size = Math.floor(Math.min(BADGE.max, em ? (BADGE.w - 2 * BADGE.pad) / em : BADGE.max) * 1000) / 1000;
  const x0 = BADGE.x + (BADGE.w - em * size) / 2;
  const base = BADGE.y + (BADGE.h + LABEL_CAP * size) / 2;
  let x = x0;
  const letters = glyphs.map((g) => {
    const p = `<path transform="translate(${x.toFixed(2)} ${base.toFixed(2)}) scale(${size.toFixed(3)} ${(-size).toFixed(3)})" d="${lean(g.d)}"/>`;
    x += g.advance * size;
    return p;
  }).join('');
  const page = `<path d="M7 3h20l10 10v31a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="${c.paper}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M27 3v8a2 2 0 0 0 2 2h8" fill="none" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"/>`;
  const badge = `<rect x="${BADGE.x}" y="${BADGE.y}" width="${BADGE.w}" height="${BADGE.h}" rx="3" fill="${c.badge}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 48" width="${w}" height="${px}">${page}${badge}<g fill="${c.ink}">${letters}</g></svg>`;
}
