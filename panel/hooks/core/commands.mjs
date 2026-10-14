// RelAI core / panel: commands — the form of each of the 15 RelAI commands and the exact text it sends.
//
// Each form is written from the command's YAML header (adapters/claude-code/commands/*.md,
// `argument-hint`) and from the command table of docs/zasoby/PANEL_RELAI/WYWIAD.md. A form carries
// the argument-hint it was written from, verbatim: checkForms() holds every form to the headers of
// the repo, so a hint that changed, a command without a form and a form without a command are
// reported, never guessed (plan PANEL_CLAUDE, E2). Same ESM rule and same copy as plan-state.mjs.
//
// A value outside a closed list, a text with a line break, a value that fails its pattern: the
// command is not built and the reason is said. The panel sends nothing it could not show first.

/**
 * @typedef {{ value: string, label: string }} Choice
 * @typedef {{ key: string, values: readonly string[] }} When
 * @typedef {{ kind: 'choice', key: string, label: string, options: readonly Choice[], emit: boolean, when?: When }} ChoiceField
 * @typedef {{ kind: 'text' | 'path', key: string, label: string, prefix?: string, pattern?: RegExp,
 *   patternHint?: string, isRequired?: boolean, when?: When }} TextField
 * @typedef {ChoiceField | TextField} Field
 * @typedef {{ command: string, argumentHint: string, fields: readonly Field[] }} Form
 * @typedef {{ isOk: boolean, args: string, text: string, errors: string[] }} Built
 * @typedef {{ command: string, description: string, argumentHint: string }} Header
 */

const EN = /^E\d+$/;
const TOPIC = /^[A-Z][A-Z0-9_]*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const COUNT = /^[1-9]\d*$/;

/** @type {readonly Form[]} In the order of the WYWIAD.md table. */
export const FORMS = Object.freeze([
  {
    command: 'relai-stage',
    argumentHint: '[TEMAT] [EN] — oba opcjonalne, np. /relai-stage albo /relai-stage E5 albo /relai-stage PLATNOSCI E2',
    fields: [
      { kind: 'text', key: 'topic', label: 'plan (TEMAT), puste = automatycznie', pattern: TOPIC, patternHint: 'wielkie litery, cyfry i _, np. PLATNOSCI' },
      { kind: 'text', key: 'stage', label: 'etap (EN), puste = automatycznie', pattern: EN, patternHint: 'E i numer, np. E5' },
    ],
  },
  {
    command: 'relai-prompt',
    argumentHint: '[--model <nazwa>] [--dla <nazwa>] [tekst do przerobienia] albo on / off [--globalnie] — np. /relai-prompt --model opus popraw walidację w formularzu logowania, bo się sypie',
    fields: [
      { kind: 'choice', key: 'mode', label: 'tryb', emit: true, options: [
        { value: '', label: 'przerób tekst' },
        { value: 'on', label: 'on — włącz tryb ciągły' },
        { value: 'off', label: 'off — wyłącz tryb ciągły' },
      ] },
      { kind: 'choice', key: 'scope', label: 'zasięg', emit: true, when: { key: 'mode', values: ['on', 'off'] }, options: [
        { value: '', label: 'ten projekt' },
        { value: '--globalnie', label: '--globalnie — wszystkie projekty' },
      ] },
      { kind: 'text', key: 'model', label: '--model: model, który przerabia', prefix: '--model', when: { key: 'mode', values: [''] } },
      { kind: 'text', key: 'target', label: '--dla: model, który wykona', prefix: '--dla', when: { key: 'mode', values: [''] } },
      { kind: 'text', key: 'text', label: 'tekst do przerobienia', isRequired: true, when: { key: 'mode', values: [''] } },
    ],
  },
  {
    // HUMANIZACJA E4: "przerób tekst" plus the three settings words of the command's Step 0a.
    command: 'relai-humanize',
    argumentHint: '[tekst albo ścieżka pliku] | on | off | ustawienia',
    fields: [
      { kind: 'choice', key: 'mode', label: 'tryb', emit: true, options: [
        { value: '', label: 'przerób tekst' },
        { value: 'on', label: 'on — włącz tryb ciągły' },
        { value: 'off', label: 'off — wyłącz tryb ciągły' },
        { value: 'ustawienia', label: 'ustawienia — wywiad od nowa' },
      ] },
      { kind: 'text', key: 'text', label: 'tekst albo ścieżka pliku', isRequired: true, when: { key: 'mode', values: [''] } },
    ],
  },
  {
    command: 'relai-crew',
    argumentHint: '[cel] | setup | status | review [--base GAŁĄŹ] | rescue <zadanie>',
    fields: [
      { kind: 'choice', key: 'mode', label: 'tryb', emit: true, options: [
        { value: '', label: 'pełny przebieg' },
        { value: 'review', label: 'review — przegląd krzyżowy' },
        { value: 'rescue', label: 'rescue — jedno zadanie drugiemu narzędziu' },
        { value: 'setup', label: 'setup — raport gotowości' },
        { value: 'status', label: 'status — stan przebiegów' },
      ] },
      { kind: 'text', key: 'goal', label: 'cel (puste = wywiad o cel)', when: { key: 'mode', values: [''] } },
      { kind: 'text', key: 'base', label: '--base: gałąź bazowa (puste = domyślna)', prefix: '--base', when: { key: 'mode', values: ['review'] } },
      { kind: 'text', key: 'task', label: 'zadanie', isRequired: true, when: { key: 'mode', values: ['rescue'] } },
    ],
  },
  {
    command: 'relai-branch',
    argumentHint: '[NAZWA] [cel w jednym zdaniu] — oba opcjonalne, np. /relai-branch albo /relai-branch OPIS_REPO opis repozytorium na GitHubie',
    fields: [
      { kind: 'text', key: 'name', label: 'nazwa odnogi (puste = propozycja z kontekstu)', pattern: TOPIC, patternHint: 'wielkie litery, cyfry i _, np. OPIS_REPO' },
      { kind: 'text', key: 'goal', label: 'cel w jednym zdaniu', when: { key: 'name', values: [] } },
    ],
  },
  {
    command: 'relai-backup',
    argumentHint: '[ŚCIEŻKA] — opcjonalna, jednorazowa lokalizacja docelowa dla tego jednego backupu',
    fields: [
      { kind: 'path', key: 'path', label: 'folder docelowy (puste = z ustawień)' },
    ],
  },
  {
    command: 'relai-audit',
    argumentHint: '[porzadki|zdrowie] — opcjonalne zawężenie do jednej części raportu',
    fields: [
      { kind: 'choice', key: 'part', label: 'zakres', emit: true, options: [
        { value: '', label: 'pełny raport' },
        { value: 'porzadki', label: 'porzadki' },
        { value: 'zdrowie', label: 'zdrowie' },
      ] },
    ],
  },
  {
    command: 'relai-changelog',
    argumentHint: '[od 2026-07-01] [od 0.5.0] [ostatnie 10] — zakres opcjonalny, domyślnie cały dziennik',
    fields: [
      { kind: 'choice', key: 'range', label: 'zakres', emit: false, options: [
        { value: '', label: 'cały dziennik' },
        { value: 'date', label: 'od daty' },
        { value: 'version', label: 'od wersji' },
        { value: 'last', label: 'ostatnie N wpisów' },
      ] },
      { kind: 'text', key: 'date', label: 'od daty', prefix: 'od', isRequired: true, pattern: DATE, patternHint: 'RRRR-MM-DD', when: { key: 'range', values: ['date'] } },
      { kind: 'text', key: 'version', label: 'od wersji', prefix: 'od', isRequired: true, pattern: VERSION, patternHint: 'np. 2.7.0', when: { key: 'range', values: ['version'] } },
      { kind: 'text', key: 'last', label: 'ile ostatnich wpisów', prefix: 'ostatnie', isRequired: true, pattern: COUNT, patternHint: 'liczba dodatnia', when: { key: 'range', values: ['last'] } },
    ],
  },
  {
    command: 'relai-handover',
    argumentHint: '[ŚCIEŻKA] — opcjonalna, gdzie zapisać plik; domyślnie docs/zasoby/',
    fields: [
      { kind: 'path', key: 'path', label: 'gdzie zapisać (puste = docs/zasoby/)' },
    ],
  },
  {
    command: 'relai-tour',
    argumentHint: '[krotko] — opcjonalnie skrócona wersja, sam stan i pierwszy krok',
    fields: [
      { kind: 'choice', key: 'length', label: 'wersja', emit: true, options: [
        { value: '', label: 'pełne oprowadzenie' },
        { value: 'krotko', label: 'krotko — sam stan i pierwszy krok' },
      ] },
    ],
  },
  {
    command: 'relai-help',
    argumentHint: '[fraza] — opcjonalnie filtruje ściągę do pozycji zawierających podany tekst',
    fields: [
      { kind: 'text', key: 'filter', label: 'filtr ściągi (puste = cała)' },
    ],
  },
  {
    command: 'relai-adopt',
    argumentHint: '[ŚCIEŻKA_BACKUPU] — opcjonalna, jednorazowa lokalizacja archiwum dla tego backupu',
    fields: [
      { kind: 'path', key: 'path', label: 'folder backupu (puste = z ustawień)' },
    ],
  },
  { command: 'relai-update', argumentHint: '', fields: [] },
  { command: 'relai-models', argumentHint: '', fields: [] },
  {
    command: 'relai-clean',
    argumentHint: '[raport] — sam raport, bez pytań i bez kasowania',
    fields: [
      { kind: 'choice', key: 'mode', label: 'tryb', emit: true, options: [
        { value: '', label: 'raport i pytania o kasowanie' },
        { value: 'raport', label: 'raport — bez pytań i bez kasowania' },
      ] },
    ],
  },
]);

/**
 * The form of one command, by its name without the slash and without a plugin prefix.
 * @param {string} command
 * @returns {Form | undefined}
 */
export function formOf(command) {
  return FORMS.find((f) => f.command === command);
}

/**
 * A field shows when it has no condition, or when the field it depends on holds one of the values;
 * an empty list of values means "any non-empty value".
 * @param {Field} field
 * @param {Readonly<Record<string, string>>} values
 * @returns {boolean}
 */
export function isShown(field, values) {
  if (!field.when) return true;
  const v = (values[field.when.key] ?? '').trim();
  return field.when.values.length === 0 ? v !== '' : field.when.values.includes(v);
}

/**
 * The value a field holds: the first option of a choice when none was picked, trimmed text otherwise.
 * @param {Field} field
 * @param {Readonly<Record<string, string>>} values
 * @returns {string}
 */
export function valueOf(field, values) {
  const v = values[field.key];
  if (field.kind === 'choice') return v ?? field.options[0]?.value ?? '';
  return (v ?? '').trim();
}

/**
 * The exact text the panel sends: "/<name> <args>", or the bare command without arguments.
 * `name` is the command as the session lists it (relai:relai-tour in a plugin install).
 * @param {Form} form
 * @param {Readonly<Record<string, string>>} values
 * @param {string} [name]
 * @returns {Built}
 */
export function buildCommand(form, values, name = form.command) {
  /** @type {string[]} */
  const parts = [];
  /** @type {string[]} */
  const errors = [];
  for (const field of form.fields) {
    if (!isShown(field, values)) continue;
    const v = valueOf(field, values);
    if (field.kind === 'choice') {
      if (!field.options.some((o) => o.value === v)) errors.push(`${field.label}: wartość spoza listy („${v}”)`);
      else if (field.emit && v) parts.push(v);
      continue;
    }
    if (/[\r\n]/.test(v)) { errors.push(`${field.label}: jedna linia, bez znaku nowej linii`); continue; }
    if (!v) { if (field.isRequired) errors.push(`${field.label}: wymagane`); continue; }
    if (field.pattern && !field.pattern.test(v)) { errors.push(`${field.label}: ${field.patternHint ?? 'zły format'}`); continue; }
    parts.push(field.prefix ? `${field.prefix} ${v}` : v);
  }
  const args = parts.join(' ');
  return { isOk: errors.length === 0, args, text: '/' + name + (args ? ' ' + args : ''), errors };
}

/**
 * The name the session runs a RelAI command by: relai:<base> first, then the bare name, then any
 * other plugin prefix; null when the session does not list it (plugin relai not installed).
 * @param {string} base
 * @param {readonly { name: string }[]} list
 * @returns {string | null}
 */
export function resolveName(base, list) {
  const names = list.map((c) => c.name).filter((n) => n === base || n.endsWith(':' + base));
  return names.find((n) => n === 'relai:' + base) ?? names.find((n) => n === base) ?? names[0] ?? null;
}

/**
 * The YAML header of a command file: description and argument-hint (quotes stripped); null without one.
 * @param {string} text
 * @param {string} command  the file name without .md
 * @returns {Header | null}
 */
export function parseHeader(text, command) {
  const lines = String(text).split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end < 0) return null;
  /** @type {Record<string, string>} */
  const kv = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([a-z-]+):\s?(.*)$/);
    if (!m || !m[1]) continue;
    const raw = (m[2] ?? '').trim();
    kv[m[1]] = raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
  if (!('description' in kv)) return null;
  return { command, description: kv.description ?? '', argumentHint: kv['argument-hint'] ?? '' };
}

/**
 * Holds the forms to the commands' headers: every header has a form written from its very hint,
 * every form has a header. Whatever does not pair is rejected with the reason.
 * @param {readonly Header[]} headers
 * @param {readonly Form[]} [forms]
 * @returns {{ headers: number, paired: number, rejected: { command: string, reason: string }[] }}
 */
export function checkForms(headers, forms = FORMS) {
  /** @type {{ command: string, reason: string }[]} */
  const rejected = [];
  let paired = 0;
  for (const h of headers) {
    const form = forms.find((f) => f.command === h.command);
    if (!form) rejected.push({ command: h.command, reason: 'komenda bez formularza' });
    else if (form.argumentHint !== h.argumentHint) rejected.push({ command: h.command, reason: 'argument-hint inny niż ten, z którego powstał formularz' });
    else paired += 1;
  }
  for (const f of forms) {
    if (!headers.some((h) => h.command === f.command)) rejected.push({ command: f.command, reason: 'formularz bez komendy' });
  }
  return { headers: headers.length, paired, rejected };
}
