// RelAI core / panel: savings-gates — shared gates of the token-saving mods (plan
// MODY_OSZCZEDZANIA, E1). Pure logic: no `$`, no file access. The mod reads the files and
// hands their text in; the secret scanner is passed in too, so the same code runs under
// `node --test` (CommonJS core/guardrails/secret-scan.js) and in a mod (its ESM copy made by
// core/tools/sync-panel-core.js from that same file — one source of the patterns).
//
// Gates:
//   consent     — the row "Mody oszczednosci" in docs/USTAWIENIA.md, asked once per project (D-93)
//   verbatim    — RelAI process files and instruction files always reach Claude word for word
//   twin        — an active BenAI counterpart puts the RelAI mod to sleep (plan Annex A)
//   human       — whether a person sits at the session (probe E1: prompt.submit origin)
//   helper      — content with a secret never goes to a helper model

/** Row name in docs/USTAWIENIA.md. Machine-read: anchored, closed list of values (rule 7). */
export const CONSENT_ROW = 'Mody oszczędzania';
export const CONSENT_YES = 'zgoda';
export const CONSENT_NO = 'brak zgody';
/** Marker line of a RelAI project in docs/USTAWIENIA.md (Polish or English project). */
const MARKER_RE = /^(?:Wersja RelAI|RelAI version):/m;

const norm = (p) => String(p || '').replace(/\\/g, '/').replace(/\/+$/, '');

/** Settings files to look for, from cwd up to the root, nearest first (L-0146). */
export function settingsCandidates(cwd) {
  const parts = norm(cwd).split('/');
  const out = [];
  for (let i = parts.length; i > 0; i--) {
    const dir = parts.slice(0, i).join('/');
    if (dir) out.push({ root: dir, file: `${dir}/docs/USTAWIENIA.md` });
  }
  return out;
}

/** True when the settings text carries the RelAI marker. */
export function hasMarker(settingsText) {
  return MARKER_RE.test(String(settingsText || ''));
}

/**
 * Consent from the settings text: 'yes' | 'no' | null (never asked).
 * The row is `| <date> | Mody oszczędzania | zgoda … |` or `| … | brak zgody … |`; the last
 * row wins. A decision outside the closed list counts as not asked, so the card asks again.
 */
export function readConsent(settingsText) {
  let verdict = null;
  for (const line of String(settingsText || '').split(/\r?\n/)) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 4 || cells[2] !== CONSENT_ROW) continue;
    const decision = cells[3].toLowerCase();
    if (decision.startsWith(CONSENT_NO)) verdict = 'no';
    else if (decision.startsWith(CONSENT_YES)) verdict = 'yes';
    else verdict = null;
  }
  return verdict;
}

/** The settings row the consent card writes. `date` is YYYY-MM-DD. */
export function consentRow(date, isYes) {
  const decision = isYes
    ? `${CONSENT_YES} — treść może iść do modelu pomocniczego (po skanerze sekretów)`
    : `${CONSENT_NO} — mody oszczędzania nie wysyłają treści do modelu pomocniczego`;
  return `| ${date} | ${CONSENT_ROW} | ${decision} |`;
}

/** Settings text with the consent row appended after the last table row of the first table. */
export function withConsentRow(settingsText, row) {
  const lines = String(settingsText || '').split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('|')) last = i;
    else if (last >= 0 && lines[i].trim() === '') break;
  }
  if (last < 0) return `${String(settingsText || '').replace(/\n*$/, '\n')}\n${row}\n`;
  return [...lines.slice(0, last + 1), row, ...lines.slice(last + 1)].join('\n');
}

// Instruction files BenAI already passes word for word (spec, section 1).
const INSTRUCTION_RE = [
  /(?:^|\/)SKILL\.md$/i,
  /(?:^|\/)skills\//i,
  /(?:^|\/)(?:CLAUDE|AGENTS)\.md$/i,
  /(?:^|\/)\.claude\/projects\/[^/]+\/memory\//i,
  /(?:^|\/)settings[^/]*\.json$/i,
  /(?:^|\/)switches\.json$/i,
];
// RelAI process files (spec, section 1, column "Zmiana w RelAI").
const PROCESS_RE = [
  /(?:^|\/)\.claude\/relai\//i,
  /(?:^|\/)SPEC_[^/]*\.md$/i,
  /(?:^|\/)PROMPT_ETAP_[^/]*\.md$/i,
  /(?:^|\/)STATUS\.md$/i,
  /(?:^|\/)PLAN\.[^/]+$/i,
];

/**
 * True when the file must reach Claude word for word.
 * `relaiRoot` is the root of the RelAI project holding the file (null outside one): every
 * Markdown file under its docs/ is a process document.
 */
export function isVerbatimFile(filePath, relaiRoot = null) {
  const p = norm(filePath);
  if (INSTRUCTION_RE.some((re) => re.test(p)) || PROCESS_RE.some((re) => re.test(p))) return true;
  if (!relaiRoot) return false;
  const docs = `${norm(relaiRoot)}/docs/`.toLowerCase();
  return p.toLowerCase().startsWith(docs) && /\.md$/i.test(p);
}

/** RelAI mod → its BenAI counterpart (plugin name in the token-saving-mods marketplace). */
export const TWINS = Object.freeze({
  'relai-browser': 'efficient-browser-use',
  'relai-input-router': 'input-router',
  'relai-effort': 'effort-optimizer',
  'relai-model-router': 'model-router',
  'relai-research': 'research-router',
  'relai-panel-savings': 'savings-proof',
});
const BENAI = 'token-saving-mods';

function enabledEntry(settingsText, id) {
  let parsed;
  // settings.json may start with a BOM (relai-mods measured it, E2 of plan RELAI_MODS)
  try { parsed = JSON.parse(String(settingsText || '').replace(/^﻿/, '')); } catch { return undefined; }
  const map = parsed && typeof parsed === 'object' ? parsed.enabledPlugins : undefined;
  if (!map || typeof map !== 'object' || !(id in map)) return undefined;
  return map[id] === true;
}

/**
 * Whether the BenAI twin of `mod` is active (plan Annex A). `settingsTexts` are the texts of
 * ~/.claude/settings.json, <project>/.claude/settings.json and settings.local.json, in that
 * order (missing file → null); the last one naming the twin decides. `switchesText` is
 * ~/.claude/mods/switches.json or null; there only `false` counts, as an off switch.
 */
export function isTwinActive(mod, settingsTexts, switchesText = null) {
  const twin = TWINS[mod];
  if (!twin) return false;
  let active = false;
  for (const text of settingsTexts || []) {
    const v = enabledEntry(text, `${twin}@${BENAI}`);
    if (v !== undefined) active = v;
  }
  if (active && switchesText) {
    try { if (JSON.parse(switchesText)[twin] === false) active = false; } catch { /* unreadable → ignore */ }
  }
  return active;
}

/**
 * Whether a person sits at the session, from prompt.submit `origin.kind` (probe E1, point 5).
 * Closed list: 'composer' is a person; 'sdk' is `claude -p`; anything else (task notices,
 * bridges, unknown kinds) counts as no person, so the mod stays passive before consent.
 */
export function isHumanOrigin(origin) {
  return Boolean(origin && origin.kind === 'composer');
}

/**
 * Sends `text` to a helper model only when the secret scanner stays silent.
 * `scan(text)` → null | label; `send(text)` → Promise. Returns { sent, label?, result? }.
 * The label never carries the secret's value (D-42).
 */
export async function guardHelper(text, scan, send) {
  const label = scan(String(text || ''));
  if (label) return { sent: false, label };
  return { sent: true, result: await send(text) };
}
