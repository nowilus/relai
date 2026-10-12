// RelAI core / panel: decisions — the confirmation card and what it may send (plan PANEL_CLAUDE, E5).
//
// R4: every panel action that changes state goes through a card; nothing is sent before "tak".
// D-35: the card in the panel is the consent to start a stage; /relai-stage reads it from a token
// in its arguments (--zgoda-panelu <card id>). The panel's own $.command.run does not pass through
// its own command.run hook (2.1.293, P-022), so the hook strips the token from everything it sees:
// typed text and other plugins' sends never carry a consent, the panel's send carries it whole.
// Aneks D: a card may have a second step (E6 asks again before writing the price list).
// NOWA_SESJA (2026-10-12): a stage may start in a new desktop session (step `newSession`). The
// command typed there passes that session's own hook, which cuts any token, so the consent goes
// by a file instead: one per stage, valid ten minutes, in this folder, once (consentOf).
//
// Pure logic only; the mod draws the card and runs the steps. Same ESM rule and same copy as
// plan-state.mjs (source here, synced copies in the plugins' hooks/core/).

import { parseStatus } from './plan-state.mjs';
import { checklistItems, promptLink } from './progress.mjs';
import { crewWaves } from './flow.mjs';

/**
 * @typedef {{ label: string, value: string, tone?: 'ok' | 'warn' }} Fact
 * @typedef {{ question: string, facts: Fact[] }} Step
 * @typedef {{ kind: 'clear' } | { kind: 'command', command: string, args: string } | { kind: 'submit', text: string }
 *   | { kind: 'write', path: string, text: string }
 *   | { kind: 'newSession', command: string, args: string, topic: string, stage: string, card: string }} Action
 *   write: a path relative to the project root; newSession: a new desktop session with the command
 *   ready in it, the card's consent left in consentPath(topic, stage)
 * @typedef {'open' | 'second' | 'confirmed' | 'cancelled'} CardState
 * @typedef {{ id: string, title: string, facts: Fact[], question: string, second: Step | null,
 *   actions: Action[], state: CardState, fetch: string | null }} Card
 *   fetch: a page the mod reads on the first "tak" to build the second step (E6, the price list);
 *   such a card has no actions until withSecond gives it the ones its second "tak" runs
 * @typedef {{ kind: 'card', card: Card } | { kind: 'blocked', reason: string }} CardResult
 * @typedef {{ id: string, title: string, files: string[], dependsOn: string[], role: string, runtime: string, model: string }} DraftTask
 * @typedef {{ run: string, tasks: DraftTask[], isEditable: boolean, reason: string }} CrewDraft
 * @typedef {{ id: string, name: string, bytes: number, count: number, question: string, isPicked: boolean }} CleanGroup
 * @typedef {{ path: string, reason: string }} Kept
 * @typedef {{ groups: CleanGroup[], kept: Kept[], error: string }} CleanChoices
 */

/** The consent token /relai-stage reads; only a card's send carries it (P-022). */
export const CONSENT_FLAG = '--zgoda-panelu';

/** The only process the panel runs: the clean report as JSON. Nothing from a form enters it. */
export const CLEAN_ARGV = Object.freeze(['node', '.claude/relai/tools/clean-work.js', 'raport', '--json']);

/** Closed lists of a crew task, as core/process/crew.js knows them. */
export const ROLES = Object.freeze(['coder', 'tester', 'reviewer']);
export const RUNTIMES = Object.freeze(['claude-code', 'codex', 'cursor']);

const CARD_ID = /^[a-z0-9][a-z0-9-]{5,39}$/;
const MODEL = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const TASK_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
/** The only file a card may write: a crew run's task list. */
const CREW_TASKS = /^\.claude\/relai\/work\/CREW\/[A-Za-z0-9][A-Za-z0-9._-]*\/zadania\.json$/;

/** The folder of a crew run's files, relative to the project root. @param {string} run */
export function crewTasksPath(run) {
  return `.claude/relai/work/CREW/${run}/zadania.json`;
}

/**
 * A count with its Polish noun: 1 punkt, 2–4 punkty, 5+ punktów (12–14 too).
 * @param {number} n @param {string} one @param {string} few @param {string} many
 */
export function count(n, one, few, many) {
  if (n === 1) return `1 ${one}`;
  const tens = n % 100;
  const last = n % 10;
  return `${n} ${last >= 2 && last <= 4 && (tens < 12 || tens > 14) ? few : many}`;
}

// ---------- the card ----------

/**
 * A card in its first state. The id is the caller's (it has the clock and randomness); a bad id
 * or an empty action list is an error, because a card that cannot be told apart or sends nothing
 * must not be shown as a decision.
 * @param {{ id: string, title: string, facts: Fact[], question: string, actions: Action[], second?: Step | null, fetch?: string | null }} c
 * @returns {Card}
 */
export function makeCard(c) {
  if (!CARD_ID.test(String(c.id))) throw new Error('karta: niepoprawne id ' + c.id);
  const fetch = c.fetch ?? null;
  if (fetch !== null && !c.second) throw new Error('karta z odczytem bez drugiego kroku');
  if (!Array.isArray(c.actions) || (c.actions.length === 0 && fetch === null)) throw new Error('karta bez działania');
  return { id: c.id, title: c.title, facts: [...c.facts], question: c.question, second: c.second ?? null, actions: [...c.actions], state: 'open', fetch };
}

/**
 * A card in its second step with what that step shows and what its "tak" runs: the step a read
 * of `fetch` produced. Only a card already in its second step moves; any other comes back as it was.
 * @param {Card} card @param {Step} step @param {Action[]} actions
 * @returns {Card}
 */
export function withSecond(card, step, actions) {
  if (card.state !== 'second') return card;
  return { ...card, second: { question: step.question, facts: [...step.facts] }, actions: [...actions] };
}

/**
 * The card after one answer. "nie" cancels from any live state; "tak" moves open → second (when
 * the card has one) → confirmed. A closed card does not move: an answer after the end changes nothing.
 * @param {Card} card @param {'tak' | 'nie'} answer
 * @returns {Card}
 */
export function answer(card, answer) {
  if (card.state === 'confirmed' || card.state === 'cancelled') return card;
  if (answer !== 'tak') return { ...card, state: 'cancelled' };
  if (card.state === 'open' && card.second) return { ...card, state: 'second' };
  return { ...card, state: 'confirmed' };
}

/**
 * What the mod may run now: the card's actions once confirmed, nothing in any other state.
 * @param {Card} card
 * @returns {Action[]}
 */
export function stepsToRun(card) {
  return card.state === 'confirmed' ? [...card.actions] : [];
}

/** The question and facts the card shows in its current state. @param {Card} card @returns {Step} */
export function shown(card) {
  return card.state === 'second' && card.second ? card.second : { question: card.question, facts: card.facts };
}

// ---------- the consent token ----------

/** @param {string} args @param {string} id */
export function withConsent(args, id) {
  if (!CARD_ID.test(id)) throw new Error('zgoda: niepoprawne id ' + id);
  return [stripConsent(args), CONSENT_FLAG, id].filter((x) => x !== '').join(' ');
}

/**
 * The arguments without any consent token, its value included; the hook runs this on every
 * command it sees (typed or sent by another plugin), so none of them carries a consent.
 * @param {string} args
 */
export function stripConsent(args) {
  return String(args).split(/\s+/).filter((x) => x !== '').reduce((/** @type {{ out: string[], skip: boolean }} */ s, w) => {
    if (s.skip) return { out: s.out, skip: false };
    if (w === CONSENT_FLAG) return { out: s.out, skip: true };
    if (w.startsWith(CONSENT_FLAG + '=')) return s;
    return { out: [...s.out, w], skip: false };
  }, { out: [], skip: false }).out.join(' ');
}

/** @param {string} args */
export function hasConsent(args) {
  return String(args).split(/\s+/).some((w) => w === CONSENT_FLAG || w.startsWith(CONSENT_FLAG + '='));
}

// ---------- the consent file (NOWA_SESJA) ----------

/** Where a card leaves its consent for a stage started in a new session. */
export const CONSENT_DIR = '.claude/relai/zgoda-etapu';

/** How long such a consent counts: the person presses Enter in the new session within it. */
export const CONSENT_TTL_MS = 10 * 60_000;

const TOPIC = /^[A-Za-z0-9_-]+$/;
const STAGE = /^E\d+$/;

/** The consent file of one stage, relative to the project root. @param {string} topic @param {string} stage */
export function consentPath(topic, stage) {
  if (!TOPIC.test(topic) || !STAGE.test(stage)) throw new Error(`zgoda: niepoprawny etap ${topic} ${stage}`);
  return `${CONSENT_DIR}/${topic}-${stage}.json`;
}

/**
 * A folder as one spelling: slashes forward, no trailing one, a Windows drive path in lower case.
 * @param {string} p
 */
export function samePath(p) {
  const s = String(p).replace(/\\/g, '/').replace(/\/+$/, '');
  return /^[A-Za-z]:\//.test(s) ? s.toLowerCase() : s;
}

/**
 * The file's text: the card that gave the consent, the stage, the folder and the time.
 * @param {{ card: string, topic: string, stage: string, cwd: string, at: number }} c
 */
export function consentFile(c) {
  if (!CARD_ID.test(c.card)) throw new Error('zgoda: niepoprawne id ' + c.card);
  consentPath(c.topic, c.stage);
  return JSON.stringify({ card: c.card, topic: c.topic, stage: c.stage, cwd: c.cwd, at: c.at }) + '\n';
}

/**
 * Does the file give the consent for this stage now? Only when it parses, names this stage and
 * this folder, is not older than CONSENT_TTL_MS (nor from the future) and was never used.
 * @param {string | null} text @param {{ now: number, cwd: string, topic: string, stage: string }} w
 * @returns {{ ok: true, card: string } | { ok: false, reason: string }}
 */
export function consentOf(text, w) {
  if (text === null) return { ok: false, reason: 'brak pliku zgody' };
  /** @type {any} */
  let v;
  try { v = JSON.parse(text); } catch { return { ok: false, reason: 'plik zgody nieczytelny' }; }
  if (!v || typeof v !== 'object' || typeof v.card !== 'string' || !CARD_ID.test(v.card) || typeof v.at !== 'number') return { ok: false, reason: 'plik zgody nieczytelny' };
  if (v.topic !== w.topic || v.stage !== w.stage) return { ok: false, reason: 'zgoda na inny etap' };
  if (typeof v.cwd !== 'string' || samePath(v.cwd) !== samePath(w.cwd)) return { ok: false, reason: 'zgoda z innego folderu' };
  if (v.usedAt !== undefined) return { ok: false, reason: 'zgoda już użyta' };
  const age = w.now - v.at;
  if (!(age >= 0 && age <= CONSENT_TTL_MS)) return { ok: false, reason: 'zgoda wygasła' };
  return { ok: true, card: v.card };
}

/** The file after its one use: the same consent with the time it was used. @param {string} text @param {number} at */
export function usedConsent(text, at) {
  return JSON.stringify({ ...JSON.parse(text), usedAt: at }) + '\n';
}

/**
 * The topic and stage of a /relai-stage typed as the new session has it ("TEMAT EN"); null for any
 * other shape, which no consent file may serve.
 * @param {string} args
 */
export function stageArgs(args) {
  const w = String(args).split(/\s+/).filter((x) => x !== '');
  return w.length === 2 && TOPIC.test(w[0] ?? '') && STAGE.test(w[1] ?? '') ? { topic: w[0] ?? '', stage: w[1] ?? '' } : null;
}

// ---------- the stage card ----------

/**
 * The executing model from STATUS.md's metric line ("model wykonawczy: Opus, w Claude Code"),
 * cut before the first comma, bracket or middle dot; null when the line does not say it.
 * @param {string} statusMd
 */
export function requiredModel(statusMd) {
  const metric = String(statusMd).split(/\r?\n/).find((l) => l.includes('PLAN.html')) ?? '';
  const m = metric.match(/model wykonawczy:\s*([^,(·]+)/);
  const v = m && m[1] ? m[1].replace(/\*\*/g, '').trim() : '';
  return v === '' ? null : v;
}

/** @param {string} s */
const words = (s) => ' ' + String(s).toLowerCase().replace(/^claude[-\s]/, '').replace(/[-_.\s/]+/g, ' ').trim() + ' ';

/**
 * Does the session's model (as /model shows it, or its id) name the required one? "Opus" is met
 * by "Opus 5.5" and "claude-opus-5-5"; "Opus 5.5" by both, not by "Opus 6". Unknown when either
 * side is missing — never a guess.
 * @param {string | null} required @param {string | null} session
 * @returns {'match' | 'mismatch' | 'unknown'}
 */
export function modelMatch(required, session) {
  if (!required || !session || !String(session).trim()) return 'unknown';
  return words(session).includes(words(required)) ? 'match' : 'mismatch';
}

/**
 * The stage a start without arguments takes: the one GOTOWY DO STARTU, else the one W TOKU
 * (the command then asks "dokończyć czy od nowa").
 * @param {ReturnType<typeof parseStatus>['stages']} stages @param {string | null} wanted
 */
function stageOf(stages, wanted) {
  if (wanted) return stages.find((s) => s.id === wanted) ?? null;
  return stages.find((s) => s.status === 'GOTOWY DO STARTU') ?? stages.find((s) => s.status === 'W TOKU') ?? null;
}

/** The id of the stage a card would start, null when none; the mod reads its prompt by it. @param {string} statusMd @param {string | null} wanted */
export function stageToStart(statusMd, wanted) {
  return stageOf(parseStatus(statusMd).stages, wanted)?.id ?? null;
}

/** The topic from a STATUS.md path: the plan folder. @param {string} statusPath */
export function topicOf(statusPath) {
  const parts = String(statusPath).replace(/\\/g, '/').split('/');
  return parts.length >= 2 ? parts[parts.length - 2] ?? '' : '';
}

/** "E5 z E9": the highest stage number of the table. @param {{ id: string }[]} stages @param {string} id */
function ofAll(stages, id) {
  const top = Math.max(...stages.map((s) => Number(s.id.slice(1)) || 0));
  return `${id} z E${top}`;
}

/**
 * The working folder from the prompt's "Zakres etapu" opening line, else derived from topic and
 * stage and said so.
 * @param {string | null} promptText @param {string} topic @param {string} id
 */
export function workDir(promptText, topic, id) {
  const m = String(promptText ?? '').match(/Katalog roboczy tego etapu:\s*`([^`]+)`/);
  if (m && m[1]) return { path: m[1], isDerived: false };
  return { path: `.claude/relai/work/${topic}/${id}/`, isDerived: true };
}

/** Boxes of the prompt's "Weryfikacja" section only. @param {string | null} promptText */
export function verificationCount(promptText) {
  if (promptText === null) return null;
  const lines = String(promptText).split(/\r?\n/);
  const start = lines.findIndex((l) => /^## Weryfikacja/.test(l));
  if (start < 0) return 0;
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return checklistItems(lines.slice(start, end < 0 ? undefined : end).join('\n'), 'v').length;
}

/**
 * What the card says of the chat. A new session is opened by the app's own start_session when the
 * app offers it ('app'), else by a deep link the person sends with Enter ('link').
 * @param {boolean} isFresh @param {boolean} isNew @param {'link' | 'app'} via
 */
function chatWords(isFresh, isNew, via) {
  if (isNew) {
    return via === 'app'
      ? 'nowa sesja w aplikacji — aplikacja pokaże swoją kartę zgody; ta rozmowa zostaje'
      : 'nowa sesja w aplikacji — komenda czeka w polu, Enter tam; ta rozmowa zostaje; zgoda ważna 10 min';
  }
  return isFresh ? 'świeży — /clear, potem komenda etapu' : 'bieżący — komenda w tej rozmowie';
}

/**
 * The /relai-stage card from real files. Blocked, with the reason, when the command would not
 * start a stage anyway: plan waiting for acceptance, no stage to start, the asked stage absent.
 * isNew (NOWA_SESJA): the card's one step opens a new session; isFresh then means nothing.
 * @param {{ id: string, statusMd: string, statusPath: string, promptText: string | null,
 *   stage?: string | null, sessionModel: string | null, isFresh: boolean, isNew?: boolean, via?: 'link' | 'app' }} x
 * @returns {CardResult}
 */
export function stageCard(x) {
  const { planStatus, stages } = parseStatus(x.statusMd);
  const topic = topicOf(x.statusPath);
  if (planStatus === 'DO AKCEPTACJI') return { kind: 'blocked', reason: `plan ${topic} czeka na akceptację — żaden etap nie startuje` };
  const s = stageOf(stages, x.stage ?? null);
  if (!s) return { kind: 'blocked', reason: x.stage ? `w planie ${topic} nie ma etapu ${x.stage}` : `plan ${topic} nie ma etapu do startu` };
  // The consent file is named by them: a name it cannot carry is said now, not after "Tak" (review)
  if (x.isNew === true && !(TOPIC.test(topic) && STAGE.test(s.id))) return { kind: 'blocked', reason: `nowa sesja nie przyjmie ${topic} ${s.id} — wybierz czat „świeży”` };
  const required = requiredModel(x.statusMd);
  const match = modelMatch(required, x.sessionModel);
  const dir = workDir(x.promptText, topic, s.id);
  const checks = verificationCount(x.promptText);
  const prompt = promptLink(x.statusMd, s.id, x.statusPath);
  /** @type {Fact[]} */
  const facts = [
    match === 'mismatch'
      ? { label: 'Model', value: `sesja: ${x.sessionModel}, plan wymaga: ${required} — przełącz przed startem`, tone: 'warn' }
      : match === 'match'
        ? { label: 'Model', value: `${x.sessionModel} — zgodny z planem (${required})`, tone: 'ok' }
        : { label: 'Model', value: required ? `plan wymaga: ${required}; modelu sesji nie odczytano` : 'plan nie wskazuje modelu', tone: 'warn' },
    { label: 'Plan', value: `${topic} · ${planStatus ?? 'status nierozpoznany'}` },
    { label: 'Etap', value: `${ofAll(stages, s.id)} · ${s.name} · ${s.status}`, ...(s.status === 'GOTOWY DO STARTU' ? {} : { tone: /** @type {const} */ ('warn') }) },
    { label: 'Katalog roboczy', value: dir.isDerived ? `${dir.path} (prompt go nie podaje)` : dir.path },
    { label: 'Weryfikacja', value: checks === null ? 'brak promptu etapu — komenda go wygeneruje' : count(checks, 'punkt', 'punkty', 'punktów') },
    { label: 'Czat', value: chatWords(x.isFresh, x.isNew === true, x.via ?? 'link') },
  ];
  if (s.status === 'W TOKU') facts.push({ label: 'Uwaga', value: 'etap w toku — komenda zapyta: dokończyć czy od nowa', tone: 'warn' });
  const args = withConsent(`${topic} ${s.id}`, x.id);
  /** @type {Action[]} */
  const actions = x.isNew === true
    ? [{ kind: 'newSession', command: 'relai-stage', args: `${topic} ${s.id}`, topic, stage: s.id, card: x.id }]
    : [...(x.isFresh ? [/** @type {Action} */ ({ kind: 'clear' })] : []), { kind: 'command', command: 'relai-stage', args }];
  return { kind: 'card', card: makeCard({ id: x.id, title: `Start etapu ${s.id}${prompt ? '' : ' (bez promptu)'}`, facts, question: 'Zaczynamy?', actions }) };
}

/** The text of the stage prompt to copy: the command a fresh session runs, without consent. @param {string} statusPath @param {string} stage */
export function copyText(statusPath, stage) {
  return `/relai-stage ${topicOf(statusPath)} ${stage}`;
}

// ---------- the crew draft ----------

/** @param {unknown} x @returns {string[]} */
const strings = (x) => (Array.isArray(x) ? x.filter((v) => typeof v === 'string') : []);

/**
 * A run's tasks as a draft. Editable only before the start: a run with a manifest.json is
 * running or done, and its files stay untouched (E5, 1c).
 * @param {string} run @param {string | null} tasksText @param {string | null} manifestText
 * @returns {CrewDraft}
 */
export function crewDraft(run, tasksText, manifestText) {
  /** @type {unknown} */
  let raw;
  try { raw = tasksText === null ? undefined : JSON.parse(tasksText); } catch { raw = undefined; }
  if (!Array.isArray(raw)) return { run, tasks: [], isEditable: false, reason: 'zadania.json nieczytelny' };
  const tasks = raw.filter((t) => t && typeof t === 'object' && typeof t.id === 'string').map((t) => ({
    id: t.id, title: typeof t.title === 'string' ? t.title : '', files: strings(t.files), dependsOn: strings(t.dependsOn),
    role: typeof t.role === 'string' ? t.role : '', runtime: typeof t.runtime === 'string' ? t.runtime : '', model: typeof t.model === 'string' ? t.model : '',
  }));
  if (manifestText !== null) return { run, tasks, isEditable: false, reason: 'przebieg wystartował — pliki przebiegu nietknięte' };
  return { run, tasks, isEditable: true, reason: '' };
}

/**
 * Validate one field's value; '' when fine, else the reason.
 * @param {'role' | 'runtime' | 'model' | 'title' | 'files' | 'dependsOn'} key @param {unknown} value
 */
function badValue(key, value) {
  if (key === 'role') return ROLES.includes(/** @type {string} */ (value)) ? '' : 'rola spoza listy: ' + value;
  if (key === 'runtime') return RUNTIMES.includes(/** @type {string} */ (value)) ? '' : 'narzędzie spoza listy: ' + value;
  if (key === 'model') return value === '' || MODEL.test(String(value)) ? '' : 'niepoprawna nazwa modelu: ' + value;
  if (key === 'title') return typeof value === 'string' && !/[\r\n]/.test(value) ? '' : 'tytuł z łamaniem wiersza';
  const arr = strings(value);
  if (!Array.isArray(value) || arr.length !== value.length) return 'lista z wartością niebędącą tekstem';
  if (key === 'files') return arr.some((f) => f.split(/[\\/]/).includes('..')) ? 'ścieżka wychodzi poza projekt' : '';
  return '';
}

/**
 * The draft with one task's field changed; an error (and the draft unchanged) when it is closed,
 * the task is absent or the value fails its list.
 * @param {CrewDraft} d @param {string} id @param {'role' | 'runtime' | 'model' | 'title' | 'files' | 'dependsOn'} key @param {unknown} value
 * @returns {{ draft: CrewDraft, error: string }}
 */
export function setTask(d, id, key, value) {
  if (!d.isEditable) return { draft: d, error: d.reason || 'szkic zamknięty' };
  if (!d.tasks.some((t) => t.id === id)) return { draft: d, error: 'nie ma zadania ' + id };
  const bad = badValue(key, value);
  if (bad) return { draft: d, error: bad };
  const v = Array.isArray(value) ? [...value] : value;
  return { draft: { ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, [key]: v } : t)) }, error: '' };
}

/**
 * @param {CrewDraft} d @param {DraftTask} task
 * @returns {{ draft: CrewDraft, error: string }}
 */
export function addTask(d, task) {
  if (!d.isEditable) return { draft: d, error: d.reason || 'szkic zamknięty' };
  if (!TASK_ID.test(task.id)) return { draft: d, error: 'niepoprawne id zadania: ' + task.id };
  if (d.tasks.some((t) => t.id === task.id)) return { draft: d, error: 'powtórzone id: ' + task.id };
  for (const key of /** @type {const} */ (['role', 'runtime', 'model', 'title', 'files', 'dependsOn'])) {
    const bad = badValue(key, task[key]);
    if (bad) return { draft: d, error: bad };
  }
  return { draft: { ...d, tasks: [...d.tasks, { ...task, files: [...task.files], dependsOn: [...task.dependsOn] }] }, error: '' };
}

/** The draft without a task; the others lose their dependency on it. @param {CrewDraft} d @param {string} id */
export function removeTask(d, id) {
  if (!d.isEditable) return { draft: d, error: d.reason || 'szkic zamknięty' };
  return { draft: { ...d, tasks: d.tasks.filter((t) => t.id !== id).map((t) => ({ ...t, dependsOn: t.dependsOn.filter((x) => x !== id) })) }, error: '' };
}

/** Waves of the draft by the rule the run uses. @param {CrewDraft} d */
export function draftWaves(d) {
  return crewWaves(d.tasks);
}

/** The draft as zadania.json, two-space JSON with a newline. @param {CrewDraft} d */
export function serializeDraft(d) {
  return JSON.stringify(d.tasks, null, 2) + '\n';
}

/**
 * The card that approves a draft: the panel writes zadania.json and tells the chat. Blocked while
 * the waves have an error (a cycle) or the draft is closed.
 * @param {string} id @param {CrewDraft} d
 * @returns {CardResult}
 */
export function crewCard(id, d) {
  if (!d.isEditable) return { kind: 'blocked', reason: d.reason };
  const tasksPath = crewTasksPath(d.run);
  if (!CREW_TASKS.test(tasksPath)) return { kind: 'blocked', reason: 'niepoprawna nazwa przebiegu: ' + d.run };
  const w = draftWaves(d);
  if (w.error) return { kind: 'blocked', reason: w.error };
  const facts = w.waves.map((wave, i) => ({ label: `Fala ${i + 1}`, value: wave.map((tid) => {
    const t = d.tasks.find((x) => x.id === tid);
    return `${tid} @${t?.runtime || '?'}/${t?.role || '?'}${t?.model ? ' [' + t.model + ']' : ''}`;
  }).join(', ') }));
  const text = `Załoga, przebieg ${d.run}: skład zatwierdzony w panelu (${count(d.tasks.length, 'zadanie', 'zadania', 'zadań')}, ${count(w.waves.length, 'fala', 'fale', 'fal')}) i zapisany w ${tasksPath}. Zaczynamy według tego pliku.`;
  return { kind: 'card', card: makeCard({ id, title: `Załoga ${d.run}`, facts, question: 'Zapisać skład i zacząć?', actions: [{ kind: 'write', path: tasksPath, text: serializeDraft(d) }, { kind: 'submit', text }] }) };
}

// ---------- the clean list ----------

/** @param {number} b */
const mb = (b) => (b / (1024 * 1024)).toFixed(2).replace('.', ',') + ' MB';

/**
 * The groups of the clean report, none picked; protected entries listed apart with their reason.
 * @param {string | null} reportText
 * @returns {CleanChoices}
 */
export function cleanChoices(reportText) {
  /** @type {any} */
  let r;
  try { r = reportText === null ? null : JSON.parse(reportText); } catch { r = null; }
  if (!r || !Array.isArray(r.grupy)) return { groups: [], kept: [], error: 'raport sprzątania nieczytelny' };
  const groups = r.grupy.filter((/** @type {any} */ g) => g && typeof g.id === 'string').map((/** @type {any} */ g) => ({
    id: g.id, name: String(g.nazwa ?? g.id), bytes: Number(g.bajty) || 0, count: Array.isArray(g.pozycje) ? g.pozycje.length : 0,
    question: String(g.pytanie ?? ''), isPicked: false,
  }));
  const kept = (Array.isArray(r.chronione) ? r.chronione : []).map((/** @type {any} */ p) => ({
    path: String(p?.wzgledna ?? p?.sciezka ?? '?'), reason: String(p?.chronione?.powod ?? 'chronione'),
  }));
  return { groups, kept, error: '' };
}

/** @param {CleanChoices} c @param {string} id @returns {CleanChoices} */
export function togglePick(c, id) {
  return { ...c, groups: c.groups.map((g) => (g.id === id ? { ...g, isPicked: !g.isPicked } : g)) };
}

/**
 * The card for picked groups: /relai-clean runs with the decision in its argument. Blocked when
 * nothing is picked — there is nothing to confirm.
 * @param {string} id @param {CleanChoices} c
 * @returns {CardResult}
 */
export function cleanCard(id, c) {
  const picked = c.groups.filter((g) => g.isPicked);
  if (!picked.length) return { kind: 'blocked', reason: 'nic nie zaznaczono' };
  const left = c.groups.filter((g) => !g.isPicked);
  const total = picked.reduce((s, g) => s + g.bytes, 0);
  /** @type {Fact[]} */
  const facts = picked.map((g) => ({ label: 'Skasować', value: `${g.name} — ${g.count} poz., ${mb(g.bytes)}`, tone: /** @type {const} */ ('warn') }));
  if (left.length) facts.push({ label: 'Zostaje', value: left.map((g) => g.name).join('; ') });
  // The command itself, the decision as its argument: the host refuses a prompt that begins with
  // "/" from a plugin (2.1.293, P-022), and the command's own procedure must load with it
  const args = [
    `decyzja z karty panelu, potwierdzona przez człowieka: skasować grupy ${picked.map((g) => '`' + g.id + '`').join(', ')} (${mb(total)})`,
    left.length ? `; zostawić tym razem ${left.map((g) => '`' + g.id + '`').join(', ')}` : '',
    '; grupy chronione bez zmian',
  ].join('');
  return { kind: 'card', card: makeCard({ id, title: 'Sprzątanie artefaktów', facts, question: `Skasować ${count(picked.length, 'grupę', 'grupy', 'grup')} (${mb(total)})?`, actions: [{ kind: 'command', command: 'relai-clean', args }] }) };
}

// ---------- /relai-update and /relai-models ----------

/** "Wersja RelAI:" from docs/USTAWIENIA.md; null when absent. @param {string | null} md */
export function projectVersion(md) {
  const line = String(md ?? '').split(/\r?\n/).find((l) => /Wersja RelAI:/.test(l));
  const m = line ? line.match(/Wersja RelAI:\**\s*\**\s*(\d+\.\d+\.\d+)/) : null;
  return m && m[1] ? m[1] : null;
}

/** "list-date:" of a MODELE file; null when absent. @param {string | null} md */
export function listDate(md) {
  const m = String(md ?? '').match(/^list-date:\s*(\d{4}-\d{2}-\d{2})/m);
  return m && m[1] ? m[1] : null;
}

/**
 * The card that sends /relai-update or /relai-models; the choice of changes stays in the chat.
 * @param {string} id @param {'relai-update' | 'relai-models'} command @param {Fact[]} facts
 * @returns {CardResult}
 */
export function commandCard(id, command, facts) {
  const question = command === 'relai-update' ? 'Uruchomić aktualizację? Zmiany wybierzesz w czacie.' : 'Odświeżyć listę modeli? Komenda zapyta o ruch sieciowy.';
  return { kind: 'card', card: makeCard({ id, title: '/' + command, facts, question, actions: [{ kind: 'command', command, args: '' }] }) };
}

/** Whole days between two YYYY-MM-DD dates (b − a); null when either is not a date. @param {string | null} a @param {string | null} b */
export function daysBetween(a, b) {
  if (!a || !b) return null;
  const t = (/** @type {string} */ s) => Date.parse(s + 'T00:00:00Z');
  const d = (t(b) - t(a)) / 86400000;
  return Number.isFinite(d) ? Math.round(d) : null;
}
