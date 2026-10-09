// RelAI core / panel: phrases — the session phrases and the cheat sheet, read from docs/KOMENDY.md.
//
// The source is the project's own KOMENDY.md, never a list in code (WYWIAD.md: "the sources are
// the real procedures and the project's cheat sheet"). One row of the "Frazy, które działają"
// table is one action: its phrases as the file quotes them („…"), the first one sent; a phrase with
// an ellipsis is a template the person completes before sending. Rows the parser does not
// recognise are counted, never dropped in silence. Same ESM rule and same copy as plan-state.mjs.

import { cells } from './plan-state.mjs';

/**
 * @typedef {{ phrases: string[], phrase: string, isTemplate: boolean, effect: string }} Phrase
 * @typedef {{ command: string, forms: string[], what: string, when: string }} SheetRow
 * @typedef {{ phrases: Phrase[], commands: SheetRow[], rejected: number, reason: string | null }} Sheet
 */

const PHRASES_HEADING = '## Frazy, które działają';
const COMMANDS_HEADING = '## Komendy';
const ELLIPSIS = '…';

/**
 * The table rows of one "## " section: the lines from its heading to the next "## ".
 * @param {string[]} all
 * @param {string} heading
 * @returns {string[] | null}  null when the section is missing
 */
function sectionRows(all, heading) {
  const start = all.findIndex((l) => l.trim() === heading);
  if (start < 0) return null;
  const rest = all.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith('## '));
  return (end < 0 ? rest : rest.slice(0, end))
    .filter((l) => l.trim().startsWith('|'))
    .slice(2); // header and separator
}

/**
 * Phrases quoted in a cell („…" or „…”), examples in parentheses left out.
 * @param {string} cell
 * @returns {string[]}
 */
export function quoted(cell) {
  const bare = cell.replace(/\([^)]*\)/g, '');
  return [...bare.matchAll(/„([^"”]+)["”]/g)].map((m) => (m[1] ?? '').trim()).filter(Boolean);
}

/**
 * The phrase sent for a template: the ellipsis replaced by the person's words.
 * A phrase without an ellipsis is sent as it is; a template with nothing to put in is not sent.
 * @param {Phrase} p
 * @param {string} fill
 * @returns {{ isOk: boolean, text: string, error: string | null }}
 */
export function buildPhrase(p, fill) {
  if (!p.isTemplate) return { isOk: true, text: p.phrase, error: null };
  const v = String(fill ?? '').trim();
  if (!v) return { isOk: false, text: p.phrase, error: 'uzupełnij miejsce „…”' };
  if (/[\r\n]/.test(v)) return { isOk: false, text: p.phrase, error: 'jedna linia, bez znaku nowej linii' };
  const i = p.phrase.indexOf(ELLIPSIS);
  const before = p.phrase.slice(0, i).replace(/\s+$/, '');
  const after = p.phrase.slice(i + 1).replace(/^\s+/, '');
  const text = [before, v, after].filter(Boolean).join(' ');
  return { isOk: true, text, error: null };
}

/**
 * The cheat sheet of a project: its phrases and its command rows, from the text of KOMENDY.md.
 * @param {string | null} text
 * @returns {Sheet}
 */
export function parseSheet(text) {
  if (text === null) return { phrases: [], commands: [], rejected: 0, reason: 'nie można odczytać docs/KOMENDY.md' };
  const all = String(text).split(/\r?\n/);
  const phraseRows = sectionRows(all, PHRASES_HEADING);
  const commandRows = sectionRows(all, COMMANDS_HEADING);
  if (phraseRows === null && commandRows === null) {
    return { phrases: [], commands: [], rejected: 0, reason: 'docs/KOMENDY.md bez sekcji „Komendy” i „Frazy, które działają”' };
  }
  let rejected = 0;

  /** @type {Phrase[]} */
  const phrases = [];
  for (const row of phraseRows ?? []) {
    const [said = '', effect = ''] = cells(row);
    const list = quoted(said);
    const first = list[0];
    if (first === undefined) { rejected += 1; continue; }
    phrases.push({ phrases: list, phrase: first, isTemplate: first.includes(ELLIPSIS), effect });
  }

  /** @type {SheetRow[]} */
  const commands = [];
  for (const row of commandRows ?? []) {
    const [cmd = '', what = '', when = ''] = cells(row);
    const forms = [...cmd.matchAll(/`(\/relai-[^`]*)`/g)].map((m) => m[1] ?? '');
    const base = forms[0]?.match(/^\/(relai-[a-z]+)/)?.[1];
    if (base === undefined) { rejected += 1; continue; }
    commands.push({ command: base, forms, what, when });
  }
  return { phrases, commands, rejected, reason: null };
}

/**
 * Rows of the sheet holding the query, case-insensitive, in any of their texts.
 * @param {Sheet} sheet
 * @param {string} query
 * @returns {{ commands: SheetRow[], phrases: Phrase[] }}
 */
export function searchSheet(sheet, query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return { commands: sheet.commands, phrases: sheet.phrases };
  const has = (/** @type {string[]} */ texts) => texts.some((t) => t.toLowerCase().includes(q));
  return {
    commands: sheet.commands.filter((r) => has([...r.forms, r.what, r.when])),
    phrases: sheet.phrases.filter((p) => has([...p.phrases, p.effect])),
  };
}
