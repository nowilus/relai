// relai-panel: the RelAI band above the prompt. Active plan and stage from CLAUDE.md and the
// plan's STATUS.md, in one card of the RelAI cards above the prompt (BAND, E9), with a second row
// while a confirmation card waits (brief v2, AUDYT_MODOW Z1). The /relai-panel
// command opens a side pane with the forms of the 14 RelAI commands, the cheat sheet and the
// session phrases, drawn in the RelAI motif (E8): cards with the command icons, Kalam headings.
// Brief v2 (AUDYT_MODOW Z2): the title and the tabs in one row, "Teraz" with one main action, two
// recommended cards and twelve one-line rows, the costs' sections folded, "Pomoc" for the sheet
// and the phrases. A desktop draws the SVG; the terminal gets the same as text, in the same colors.
//
// The mod draws and calls; the core counts (plan PANEL_CLAUDE, section 5). Everything the band
// reckons with lives in ./core/*.mjs: a byte-identical copy of core/panel/ written by
// core/tools/sync-panel-core.js, because the engine refuses imports from outside the plugin.
//
// Silent outside a RelAI project. Never calls a model, never adds to the system prompt (R7).
// The network once, in one function (fetchPricingPage, E6, Aneks D): the Anthropic pricing page,
// only after "Tak" on the price-list card, never in the background. The documents tab (E6) shows
// the session-start layer and marks what the turn's writing tools changed.
// The prompt-cache timer is relai-cache-keeper's alone (E9, Aneks C):
// the band no longer draws one, so the same countdown never shows twice above the prompt.
//
// Split in E7 without a change of behavior: this file keeps the state, the collector, the reads
// and the presses, everything that takes `$` (P-023 pkt 10); band.tsx draws the plan bar,
// pane-parts.tsx the parts of every tab, pane-commands / -now / -help / -map / -docs / -costs.tsx the tabs.
// Split again in Z6 (AUDYT_MODOW), the same rule: what makes no `$` call of its own went out and
// acts through closures made here (ioOf, actsOf) — pane-io.ts the session, the root and the plan,
// tab-data.ts the tabs' data, card-answer.ts the answer to a card, memo.ts the tabs' memory. The
// $.state atoms stay here: the validator reads them only from this file.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import { join } from './fmt'
import type { PanelView } from '../types'
import { formOf } from './core/commands.mjs'
import { THEME } from './core/theme.mjs'
import { compactRecord, fileName, isFileOf, mergeRecords, parseRecords, serializeRecords, stepRecord } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { PRICING_PAGE, pricingCard } from './core/pricing.mjs'
import { MAX_DEPTH, NUMSTAT_ARGV, changedPaths, kindOf, parseNumstat, shelf } from './core/documents.mjs'
import type { FileEntry } from './core/documents.mjs'
import { crewTag, stageTag } from './core/attribution.mjs'
import { MERGE_FILE, serializeMerges } from './core/flow.mjs'
import type { Merges } from './core/flow.mjs'
import { CLEAN_ARGV, cleanCard, cleanChoices, commandCard, crewCard, crewDraft, crewTasksPath, hasConsent, togglePick, stageCard, stageToStart, stripConsent } from './core/decisions.mjs'
import { promptLink } from './core/progress.mjs'
import type { Action, Card, CardResult, CleanChoices, CrewDraft } from './core/decisions.mjs'
import type { DocsData, PaneData } from './data'
import { bump, epochNow, forget, remember } from './memo'
import { CREW_DIR, FRESH, MEASURE_DIR, forgetPlan, readPlan, relaiRoot } from './pane-io'
import type { Ledger, PaneIo, Session } from './pane-io'
import { commandFacts, costData, docOpen, loadPrices, mapData, nowData, paneData, pricingState } from './tab-data'
import type { Shelf } from './tab-data'
import { answerCard } from './card-answer'
import type { Acts } from './card-answer'
import { band } from './band'
import { failure, isPassing, parts, tabOf } from './pane-parts'
import type { Ctx } from './pane-parts'
import { costsView } from './pane-costs'
import { mapView } from './pane-map'
import { docsView } from './pane-docs'
import { commandTabs } from './pane-commands'
import { helpView } from './pane-help'
import { nowBar } from './pane-now'

type $T = EngineInterface

// Replaced, never mutated in place; a reload starts it over and session.start sets it again
let S: Session = FRESH

const set = (patch: Partial<Session>) => { S = { ...S, ...patch } }

// One call: a file that is not there rejects the read (AUDYT_MODOW Z4, was exists + read)
async function readText($: $T, path: string): Promise<string | null> {
  try {
    return await $.fs.read(path)
  } catch {
    return null
  }
}

// The files a read went through and their times: null when one cannot be asked, which reads again
async function stampOf($: $T, paths: readonly string[]): Promise<string | null> {
  try {
    return (await Promise.all(paths.map((p) => $.fs.stat(p).then((s) => `${s.mtimeMs}:${s.size}`)))).join('|')
  } catch {
    return null
  }
}

// The reads the moved readers make (pane-io.ts, tab-data.ts, Z6), as closures over `$` made here:
// the callee never receives `$` itself (P-023 pkt 10). The session is read at each call, as before.
function ioOf($: $T): PaneIo {
  return {
    session: () => S,
    read: (path) => readText($, path),
    stamp: (paths) => stampOf($, paths),
    folders: (rel) => folders($, rel),
    records: () => projectRecords($),
    git: (argv) => runGit($, argv),
    now: () => $.clock.now(),
    writeError: () => writeError,
  }
}

// Refresh what the band reads from the project and the session after each turn
async function refresh($: $T) {
  const [plan, usage] = await Promise.all([readPlan(ioOf($), true), $.session.usage().catch(() => null)])
  set({
    plan,
    costUsd: usage?.cost ? usage.cost.usd : S.costUsd,
    startedAt: usage?.startedAt || S.startedAt,
  })
}

// ---------- the collector ----------
// Every model request of a RelAI session, main loop and subagents (turn.step) and each
// compaction's own request (session.compact, which no step carries: relai-probe-e3, 2026-10-08),
// goes to .claude/relai/pomiary/<date>-<session>.jsonl, a file per session (plan, section 8).
// $.fs has no append: the session's records are held here and the file is written whole, by
// one writer, in order. The session id is asked at each write: /clear changes it within the
// process and raises no session.start (probe). A reload or a resume reads the file back first.

let ledger: Ledger | null = null // replaced, never mutated in place
let writes: Promise<void> = Promise.resolve()
let lastModel: string | null = null // the main loop's, which a compaction runs on
// The crew task the main loop works on: set by a prompt carrying crew.js's line (a crew task run
// as its own session), cleared by the next prompt without it (E4)
let mainTask: string | null = null

// Each subagent's crew task, from the line under its prompt (agent.spawn): kept by the host in
// $.state, so a reload mid-run does not lose which agent works on which task (plan, section 8)
const agentTasks = atom({ plugin: 'relai-panel', key: 'agentTasks' } as const, {} as Record<string, string>)

async function ledgerFor($: $T, session: string): Promise<Ledger> {
  if (ledger && ledger.session === session) return ledger
  const dir = join(S.cwd, MEASURE_DIR)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  const found = entries.find((x) => x.kind === 'file' && isFileOf(x.name, session))
  const name = found ? found.name : fileName(new Date(await $.clock.now()), session)
  const read = found ? parseRecords(await readText($, join(dir, name))) : { records: [], bad: [] }
  ledger = { session, path: join(dir, name), name, records: read.records, bad: read.bad }
  return ledger
}

// Z4: the records are kept here and the file written at the end of a turn, after a compaction and
// FLUSH_MS after a record nothing wrote yet — never at each request. A reload mid-turn loses at most
// those last seconds. A write that fails is said in the costs tab and tried again at the next flush.
const FLUSH_MS = 5_000
let isDirty = false
let isFlushQueued = false
let writeError = ''

// A session left by /clear whose file could not be written yet: kept until a write succeeds
let unwritten: Ledger[] = []

async function writeOne($: $T, l: Ledger): Promise<boolean> {
  try {
    await $.fs.write(l.path, serializeRecords(l.records, l.bad))
    return true
  } catch (err) {
    writeError = `${l.name}: ${err instanceof Error ? err.message : String(err)}`
    return false
  }
}

async function writeLedger($: $T) {
  const left: Ledger[] = []
  for (const l of unwritten) if (!(await writeOne($, l))) left.push(l)
  unwritten = left
  if (ledger && isDirty && (await writeOne($, ledger))) isDirty = false
  if (!unwritten.length && !isDirty) writeError = ''
}

function flush($: $T): Promise<void> {
  writes = writes.then(() => writeLedger($)).catch(() => undefined)
  return writes
}

function collect($: $T, make: (session: string) => MeasureRecord): Promise<void> {
  writes = writes.then(async () => {
    const session = await $.session.id()
    // /clear changed the session: the old one's records go to their own file first
    if (ledger && ledger.session !== session) {
      await writeLedger($)
      if (isDirty) unwritten = [...unwritten, ledger]
      isDirty = false
    }
    const current = await ledgerFor($, session)
    const records = mergeRecords(current.records, [make(session)])
    if (records.length === current.records.length) return
    ledger = { ...current, records }
    isDirty = true
  }).catch(() => undefined)
  if (!isFlushQueued) {
    $.clock.after(FLUSH_MS, () => { isFlushQueued = false; void flush($) })
    isFlushQueued = true
  }
  return writes
}

// This session's records from the collector's memory, every other session's read back from its file
// A tab that reads the measurements opened: the session's file is written first, so the file holds
// what the tab shows
async function projectRecords($: $T): Promise<{ current: Ledger, others: MeasureRecord[][] }> {
  await flush($)
  const current = await ledgerFor($, await $.session.id().catch(() => S.id))
  const dir = join(S.cwd, MEASURE_DIR)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  const others = entries.filter((x) => x.kind === 'file' && x.name.endsWith('.jsonl') && x.name !== current.name)
  return { current, others: await Promise.all(others.map(async (x) => parseRecords(await readText($, join(dir, x.name))).records)) }
}

async function folders($: $T, rel: string): Promise<string[]> {
  const dir = join(S.cwd, rel)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  return entries.filter((x) => x.kind === 'dir').map((x) => x.name).sort()
}

// The panel's own file; the files of a crew run are never written (decision of 2026-10-09)
async function saveMerges($: $T, m: Merges) {
  await $.fs.write(join(S.cwd, MERGE_FILE), serializeMerges(m))
  bump()
  $.ui.invalidate('ui.render')
}

// ---------- documents (E6, Aneks E) ----------
// A shelf of tiles: CLAUDE.md, AGENTS.md and every .md / .html under docs/, grouped in
// ./core/documents.mjs. "Changed in this turn": the paths the writing tools of the turn's steps
// named (turn.step toolUses, main loop and subagents alike), kept from the first step of a main
// turn to the next. Lines changed since the last commit and a chosen document's diff come from
// git through the two closed argv of the core (NUMSTAT_ARGV, diffArgv): a read, no card needed.

// Kept by the host in $.state (Z4): the documents tab reads it and is drawn again when it moves,
// nothing else is; a reload keeps the turn's set
const turnChanged = atom({ plugin: 'relai-panel', key: 'turnChanged' } as const, { turn: '', paths: [] as string[] })

// The document open under the shelf: "<group>|<path>", the group it was opened from; '' for none
const docPick = atom({ plugin: 'relai-panel', key: 'docPick' } as const, '')
const docMode = atom({ plugin: 'relai-panel', key: 'docMode' } as const, 'diff' as 'diff' | 'preview')
// Calibration 2026-10-09: the edited documents on top and the rest folded ("changed"), or every
// group open ("all"); tiles or a file tree
const docFilter = atom({ plugin: 'relai-panel', key: 'docFilter' } as const, 'changed' as 'changed' | 'all')
const docLayout = atom({ plugin: 'relai-panel', key: 'docLayout' } as const, 'tiles' as 'tiles' | 'tree')
// The page of the open document's diff (AUDYT_MODOW Z3: DIFF_PAGE rows a drawing), 0 for the first
const diffPage = atom({ plugin: 'relai-panel', key: 'diffPage' } as const, 0)


async function walkDocs($: $T, rel: string, depth: number): Promise<FileEntry[]> {
  const entries = await $.fs.list(join(S.cwd, rel)).catch(() => [])
  const nested = await Promise.all(entries.map(async (x): Promise<FileEntry[]> => {
    const p = `${rel}/${x.name}`
    if (x.kind === 'file' && kindOf(x.name) !== null) return [{ path: p, bytes: x.size, mtimeMs: x.mtimeMs }]
    return x.kind === 'dir' && depth < MAX_DEPTH ? walkDocs($, p, depth + 1) : []
  }))
  return nested.flat()
}

// git through a closed argv only; a failure is words, never a silent empty shelf
// The timeout stays under the hook's own budget (10 s, HookBudget): a git that hangs is said in
// words in the tab instead of taking the drawing down with it
async function runGit($: $T, argv: readonly string[]): Promise<{ text: string, error: string }> {
  try {
    const r = await $.process.run([...argv], { cwd: S.cwd, timeoutMs: 8_000 })
    return r.exitCode === 0 ? { text: r.stdout, error: '' } : { text: '', error: `git zakończył się kodem ${r.exitCode}${r.stderr ? ': ' + r.stderr.split(/\r?\n/).filter((l) => !/^warning:/.test(l))[0] : ''}` }
  } catch (err) {
    return { text: '', error: `git niedostępny: ${err instanceof Error ? err.message : String(err)}` }
  }
}

// The shelf: the documents' listing and their line counts, one git
async function docsShelf($: $T, changed: readonly string[]): Promise<Shelf> {
  const root = (await $.fs.list(S.cwd).catch(() => [])).filter((x) => x.kind === 'file' && (x.name === 'CLAUDE.md' || x.name === 'AGENTS.md'))
    .map((x) => ({ path: x.name, bytes: x.size, mtimeMs: x.mtimeMs }))
  const files = [...root, ...(await walkDocs($, 'docs', 1))]
  const counts = await runGit($, NUMSTAT_ARGV)
  const planDir = S.plan.kind === 'ok' && S.plan.statusPath.includes('/') ? S.plan.statusPath.slice(0, S.plan.statusPath.lastIndexOf('/')) : null
  return { ...shelf(files, { planDir, changed: [...changed], counts: parseNumstat(counts.text) }), gitError: counts.error }
}

async function docsData($: $T, key: string, pick: string, mode: 'diff' | 'preview', changed: readonly string[]): Promise<DocsData> {
  const s = await remember('docs', key, () => docsShelf($, changed))
  const open = pick ? await remember('doc', `${key}|${pick}|${mode}`, () => docOpen(ioOf($), s, pick, mode)) : null
  return { ...s, now: await $.clock.now(), open }
}

// ---------- the price-list card (E6, Aneks D) ----------
// "Tak" on the card reads the page (fetchPricingPage), the second step shows the difference
// old–new per model and category, the second "Tak" writes PRICE_FILE. "Nie" at either step
// mutes the reminder of the models it asked about until the list's date changes.

// The panel's one network call, R7's single exception (Aneks D): the Anthropic pricing page, GET,
// no header, no body — nothing of the project leaves with it. Called from decide alone, after "Tak".
async function fetchPricingPage($: $T): Promise<{ ok: boolean, status: number, text: string } | { error: string }> {
  try {
    const r = await $.http.fetch(PRICING_PAGE)
    return { ok: r.ok, status: r.status, text: r.text }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

const muted = atom({ plugin: 'relai-panel', key: 'muted' } as const, {} as Record<string, string>)

// The models the open price-list card asked about: muted on its "Nie"
let pricingAsked: string[] = []

async function preparePricing($: $T) {
  const { prices, unpriced } = await pricingState(ioOf($))
  pricingAsked = unpriced.map((u) => u.model)
  return offer($, pricingCard(await cardId($), { unpriced, date: prices.date, warning: prices.warning }))
}

async function mutePricing($: $T) {
  const date = (await loadPrices(ioOf($))).date
  const asked = pricingAsked
  await update($, muted, (m) => ({ ...m, ...Object.fromEntries(asked.map((x) => [x, date])) }))
}

// ---------- the pane ----------
// The forms and the sheet are reckoned in ./core (commands.mjs, phrases.mjs); the tabs are drawn by
// pane-*.tsx and this file calls. Nothing reaches the chat but on a press of "Wyślij" or of a
// phrase: a command through $.command.run, a phrase through $.prompt.submit as the person's own
// words (plan, section 5). Without the relai plugin in the session the pane says so and sends
// nothing (plan, section 8). Everything that takes `$` stays in this file: the engine follows `$`
// only into functions declared in it and refuses the module otherwise (P-023 pkt 10).

const PANE_ID = 'relai-panel'
const PANE_TITLE = 'RelAI'

const view = atom({ plugin: 'relai-panel', key: 'view' } as const, 'commands' as PanelView)
const selected = atom({ plugin: 'relai-panel', key: 'selected' } as const, '')
const values = atom({ plugin: 'relai-panel', key: 'values' } as const, {} as Record<string, string>)
const query = atom({ plugin: 'relai-panel', key: 'query' } as const, '')
const fills = atom({ plugin: 'relai-panel', key: 'fills' } as const, {} as Record<string, string>)
const sent = atom({ plugin: 'relai-panel', key: 'sent' } as const, '')
const pressed = atom({ plugin: 'relai-panel', key: 'pressed' } as const, '')
const unfolded = atom({ plugin: 'relai-panel', key: 'unfolded' } as const, {} as Record<string, boolean>)
const picks = atom({ plugin: 'relai-panel', key: 'picks' } as const, [] as string[])
// Decisions (E5): the card waiting for "tak", the chat a stage starts in, the clean list, crew drafts
const confirm = atom({ plugin: 'relai-panel', key: 'confirm' } as const, null as Card | null)
const freshChat = atom({ plugin: 'relai-panel', key: 'freshChat' } as const, true)
const cleanList = atom({ plugin: 'relai-panel', key: 'cleanList' } as const, null as CleanChoices | null)
const drafts = atom({ plugin: 'relai-panel', key: 'drafts' } as const, {} as Record<string, CrewDraft>)

// How long a press answers: the card of the pressed control flashes, a send says "Wysłano"
const FLASH_MS = 900

function flash($: $T, key: string) {
  void update($, pressed, () => key)
  $.clock.after(FLASH_MS, () => { void update($, pressed, (k) => (k === key ? '' : k)) })
}

// The sent line (AUDYT_MODOW Z2, UX-16): a success goes after SENT_MS unless something newer took
// its place (compared before it is cleared, as the flash is); a failure stays until the next
// action. A tab chosen or a form opened or closed clears either. A reload cancels the wait and
// keeps the line in $.state: the next action clears it then.
const SENT_MS = 10_000
let saidSeq = 0 // module memory: which say the timer belongs to

async function say($: $T, text: string) {
  saidSeq += 1
  const seq = saidSeq
  await update($, sent, () => text)
  if (text && isPassing(text)) $.clock.after(SENT_MS, () => { if (seq === saidSeq) void update($, sent, (t) => (t === text ? '' : t)) })
}

function unsay($: $T) {
  saidSeq += 1
  return update($, sent, (t) => (t ? '' : t))
}

const NO_RELAI = 'Plugin relai nie jest zainstalowany w tej sesji — panel pokazuje formularze, ale niczego nie wyśle.'
const NOT_RELAI = 'Ten folder nie jest projektem RelAI, więc panel nie ma czego pokazać — napisz „zacznijmy projekt”, żeby go zainicjować.'


// Read once per /relai-panel and after a reload: commands and KOMENDY.md change rarely mid-session
let data: PaneData | null = null

async function loadData($: $T, cwd: string): Promise<PaneData> {
  const list = await $.command.list().catch(() => [])
  let text: string | null = null
  try {
    const path = join(cwd, 'docs/KOMENDY.md')
    text = (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    text = null
  }
  data = paneData(list, text)
  return data
}

async function sendCommand($: $T, name: string, args: string, text: string) {
  try {
    await $.command.run({ command: name, args })
    await say($, `Wysłano do czatu: ${text}`)
  } catch (err) {
    await say($, failure('Spróbuj ponownie albo wpisz komendę w czacie.', `Nie wysłano ${text}`, err))
  }
}

async function sendPhrase($: $T, text: string) {
  try {
    await $.prompt.submit({ text, asUser: true })
    await say($, `Wysłano do czatu: ${text}`)
  } catch (err) {
    await say($, failure('Spróbuj ponownie albo napisz frazę w czacie.', `Nie wysłano „${text}”`, err))
  }
}

// ---------- decisions (E5) ----------
// R4: nothing that changes state leaves the pane before "tak" on a card. The core builds the card
// and answers what may run (stepsToRun: nothing unless confirmed); the mod only draws and runs it.

async function cardId($: $T): Promise<string> {
  return `karta-${(await $.clock.now()).toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

async function offer($: $T, r: CardResult) {
  if (r.kind === 'blocked') {
    await say($, failure('Popraw formularz albo plan i przygotuj kartę ponownie.', `Nie przygotowano karty: ${r.reason}`))
    return
  }
  await unsay($)
  await update($, confirm, () => r.card)
}

// One step of a confirmed card; a command goes by the name the session knows it under
async function runStep($: $T, a: Action, names: Record<string, string | null>) {
  if (a.kind === 'clear') return $.command.run({ command: 'clear' })
  if (a.kind === 'command') return $.command.run({ command: names[a.command] ?? a.command, args: a.args })
  if (a.kind === 'write') return $.fs.write(join(S.cwd, a.path), a.text)
  return $.prompt.submit({ text: a.text, asUser: true })
}

// The answer to the card (card-answer.ts, Z6): its effects as closures over `$` made here
function actsOf($: $T): Acts {
  return {
    io: ioOf($),
    setCard: (card) => update($, confirm, () => card),
    say: (text) => say($, text),
    mutePricing: () => mutePricing($),
    fetchPricingPage: () => fetchPricingPage($),
    runStep: (a, names) => runStep($, a, names),
  }
}

async function decide($: $T, card: Card, said: 'tak' | 'nie', names: Record<string, string | null>) {
  return answerCard(actsOf($), card, said, names)
}

// The stage card from the plan the form names, else the active one
async function prepareStage($: $T, topic: string, stage: string, isFresh: boolean) {
  const statusPath = topic ? `docs/plany/${topic}/STATUS.md` : S.plan.kind === 'ok' ? S.plan.statusPath : null
  if (statusPath === null) return offer($, { kind: 'blocked', reason: 'brak aktywnego planu — wpisz TEMAT planu' })
  const statusMd = await readText($, join(S.cwd, statusPath))
  if (statusMd === null) return offer($, { kind: 'blocked', reason: `nie można odczytać ${statusPath}` })
  const id = stageToStart(statusMd, stage || null)
  const link = id ? promptLink(statusMd, id, statusPath) : null
  const promptText = link ? await readText($, join(S.cwd, link)) : null
  const sessionModel = await $.session.model().catch(() => null)
  return offer($, stageCard({ id: await cardId($), statusMd, statusPath, promptText, stage: stage || null, sessionModel, isFresh }))
}

const CLEAN_TODO = 'Spróbuj „Wczytaj ponownie” albo wpisz /relai-clean w czacie.'

// The clean report through the one fixed argv (CLEAN_ARGV); nothing from a form enters it
async function loadClean($: $T) {
  try {
    const r = await $.process.run([...CLEAN_ARGV], { cwd: S.cwd, timeoutMs: 120_000 })
    const list = cleanChoices(r.exitCode === 0 ? r.stdout : null)
    await update($, cleanList, () => list)
    await say($, list.error ? failure(CLEAN_TODO, `Nie wczytano listy: ${list.error}${r.stderr ? ' — ' + r.stderr.slice(0, 120) : ''}`) : '')
  } catch (err) {
    await say($, failure(CLEAN_TODO, 'Nie wczytano listy', err))
  }
}

// A crew run's draft: editable only while the run has no manifest.json (E5, 1c)
async function editCrew($: $T, run: string) {
  const dir = join(S.cwd, `${CREW_DIR}/${run}`)
  const draft = crewDraft(run, await readText($, join(S.cwd, crewTasksPath(run))), await readText($, join(dir, 'manifest.json')))
  if (!draft.isEditable) return say($, failure('Skład zmienisz tylko przed startem przebiegu.', `Skład przebiegu ${run} bez edycji: ${draft.reason}`))
  await unsay($)
  return update($, drafts, (m) => ({ ...m, [run]: draft }))
}

// ---------- hooks ----------

export const register: Register = (on) => {
  // D-35 (E5): a consent token reaches /relai-stage only in the pane's own send, which this hook
  // never sees (2.1.293, P-022). Typed text and other plugins' sends lose it here.
  on('command.run', async ($, e, next) => {
    if (e.command.endsWith('relai-stage') && hasConsent(e.args)) return next({ ...e, args: stripConsent(e.args) })
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    const here = await $.session.cwd()
    const root = await relaiRoot(ioOf($), here)
    const isRelai = root !== null
    const cwd = root ?? here
    S = { ...FRESH, id: await $.session.id(), cwd, isRelai, loadedAt: await $.clock.now() }
    forget()
    forgetPlan()
    bump()
    // Registered everywhere, so outside RelAI the command can say so in one sentence (plan, section 8)
    await $.command.register({ name: 'relai-panel', description: 'Panel RelAI: formularze komend, ściąga i frazy sesji' }).catch(() => undefined)
    if (!isRelai) return next(e)
    await refresh($)
    return next(e)
  })

  // The pane opens only from the command, the person's own act: it seats at any width and never
  // pops up by itself in a narrow terminal (plan, section 8)
  on('command.run', { command: 'relai-panel' }, async ($) => {
    // Typed right after a reload, before session.start has found the root: look once more first
    if (!S.isRelai) {
      const root = await relaiRoot(ioOf($), await $.session.cwd())
      if (root !== null) set({ isRelai: true, cwd: root })
    }
    if (!S.isRelai) return { text: NOT_RELAI }
    await loadData($, S.cwd)
    bump() // the pane opened again shows the project as it is now
    $.ui.invalidate('ui.render')
    const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
    return { text: opened.isPlaced ? 'Panel RelAI otwarty.' : `Panel RelAI czeka na miejsce: ${opened.reason}` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { isRelai, cwd } = S
    if (e.surface === 'mobile') {
      const { Text } = $.ui.resolve(e)
      return <Text>Formularze RelAI wymagają terminala albo aplikacji desktopowej.</Text>
    }
    const el = $.ui.resolve(e)
    const { Box, Text } = el
    // A desktop draws SVG: icons and Kalam headings. The terminal gets text in the same colors.
    // Decided by the surface, not by `'Svg' in el`: the terminal's table carries the key at run
    // time and drops what it draws (2.1.293, measured by theme.test.ts in E8).
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null
    const isGui = Svg !== null
    if (!isRelai) return <Box key="not-relai"><Text>{NOT_RELAI}</Text></Box>
    const d = data ?? (await loadData($, cwd))
    const width = Math.max(30, e.props.bodyColumns)
    const [kept, picked, all, q, filled, last, flashed, folds, chosen, pending, isFresh, clean, crewDrafts, mutedNow] = await Promise.all([
      read($, view), read($, selected), read($, values), read($, query), read($, fills), read($, sent), read($, pressed), read($, unfolded), read($, picks),
      read($, confirm), read($, freshChat), read($, cleanList), read($, drafts), read($, muted),
    ])
    const tab = tabOf(kept)
    // Opening or closing a form, or choosing a tab, clears the sent line: it spoke of the last one (UX-16)
    const pick = (c: string) => { void unsay($).then(() => update($, selected, (s) => (s === c ? '' : c))) }
    const choose = (v: PanelView) => { bump(); void unsay($).then(() => update($, view, () => v)) }

    // The tabs are drawn by pane-*.tsx, which never see `$` (P-023 pkt 10, E7): each gets the
    // element table and the pane's parts (pane-parts.tsx), its data, and callbacks made here
    const c: Ctx = { el, Svg, isGui, width, flashed, last, flash: (key) => flash($, key) }
    const p = parts(c)
    const { heading, sentLine } = p
    // Folds: the map's plans and stages, the documents' groups and folders, the costs' sections
    const isUnfolded = (key: string, byDefault: boolean) => folds[key] ?? byDefault
    const fold = (key: string, byDefault: boolean) => { void update($, unfolded, (m) => ({ ...m, [key]: !(m[key] ?? byDefault) })) }

    // The tab's data from memory (Z3): read again only when its key moves on
    const key = tab === 'help' ? '' : `${await $.session.id()}|${epochNow()}`
    const now = tab === 'commands' ? await remember('now', key, () => nowData(ioOf($))) : null
    const costs = tab === 'costs' ? await remember('costs', key, () => costData(ioOf($))) : null
    const map = tab === 'map' ? await remember('map', key, () => mapData(ioOf($))) : null
    const [pickNow, modeNow, filterNow, layoutNow, pageNow, changedNow] = tab === 'docs'
      ? await Promise.all([read($, docPick), read($, docMode), read($, docFilter), read($, docLayout), read($, diffPage), read($, turnChanged)])
      : ['', 'diff' as const, 'changed' as const, 'tiles' as const, 0, { turn: '', paths: [] as string[] }]
    const docs = tab === 'docs' ? await docsData($, key, pickNow, modeNow, changedNow.paths) : null
    const body = now ? commandTabs(c, p, {
      data: d, plan: S.plan, picked, values: all, isFresh, clean, pick,
      setValue: (k, v) => { void update($, values, (m) => ({ ...m, [k]: v })) },
      setFresh: (x) => { void update($, freshChat, () => x) },
      prepareStage: (topic, stage, fresh) => { void prepareStage($, topic, stage, fresh) },
      copy: (text) => { void $.ui.copy({ text, surface: e.surface }).then(() => say($, `Wysłano do schowka: ${text}`), (err) => say($, failure('Zaznacz tekst w podglądzie i skopiuj go ręcznie.', 'Nie skopiowano', err))) },
      prepareCommand: (command) => { void commandFacts(ioOf($), command).then(async (facts) => offer($, commandCard(await cardId($), command, facts))) },
      sendCommand: (name, args, text) => { void sendCommand($, name, args, text) },
      loadClean: () => { void loadClean($) },
      toggleClean: (id) => { void update($, cleanList, (l) => (l ? togglePick(l, id) : l)) },
      prepareClean: (list) => { void cardId($).then((id) => offer($, cleanCard(id, list))) },
    }).commandsView() : costs ? costsView(c, p, costs, {
      session: S, muted: mutedNow, preparePricing: () => { void preparePricing($) }, isUnfolded, fold,
    }) : map ? mapView(c, p, map, {
      isUnfolded, fold, chosen, drafts: crewDrafts,
      togglePick: (id) => { void update($, picks, (x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id])) },
      clearPicks: (run) => update($, picks, (x) => x.filter((y) => !y.startsWith(run + '/'))),
      saveMerges: (m) => saveMerges($, m),
      editCrew: (run) => { void editCrew($, run) },
      setDraft: (run, draft) => { void update($, drafts, (m) => ({ ...m, [run]: draft })) },
      dropDraft: (run) => { void update($, drafts, (m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== run))) },
      confirmCrew: (draft) => { void cardId($).then((id) => offer($, crewCard(id, draft))) },
      say: (text) => { void say($, text) },
    }) : docs ? docsView(c, p, docs, {
      pick: pickNow, mode: modeNow, filter: filterNow, layout: layoutNow, page: pageNow, isUnfolded, fold,
      toggleDoc: (id) => { void update($, diffPage, () => 0).then(() => update($, docPick, (x) => (x === id ? '' : id))) },
      closeDoc: () => { void update($, diffPage, () => 0).then(() => update($, docPick, () => '')) },
      setPage: (n) => { void update($, diffPage, () => n) },
      setMode: (m) => { void update($, docMode, () => m) },
      setFilter: (f) => { void update($, docFilter, () => f) },
      setLayout: (l) => { void update($, docLayout, () => l) },
    }) : helpView(c, p, {
      data: d, query: q, fills: filled,
      setQuery: (x) => { void update($, query, () => x) },
      sendPhrase: (text) => { void sendPhrase($, text) },
      setFill: (phrase, v) => { void update($, fills, (m) => ({ ...m, [phrase]: v })) },
      openForm: (command) => { bump(); void unsay($).then(() => update($, selected, () => command)).then(() => update($, view, () => 'commands' as const)) },
    })
    // On the commands tab "Teraz" stands under the header and a waiting card takes its place; on
    // the other tabs the card stands there alone (brief v2 §6.2)
    const canStart = S.plan.kind === 'ok' && S.plan.stage !== null
    const top = pending ? p.confirmCard(pending, (said) => { void decide($, pending, said, d.names) })
      : now ? nowBar(c, p, now, canStart ? () => { void prepareStage($, '', '', isFresh) } : null) : null
    const isSentInDrawer = tab === 'commands' && picked !== '' && formOf(picked) !== undefined
    return (
      <Box key="relai-pane" flexDirection="column" gap={1} paddingX={isGui ? 1 : 0}>
        <Box key="pane-head" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          {heading('hero', THEME.accent)}
          {p.tabs(tab, choose)}
        </Box>
        {d.hasRelai ? [] : [<Box key="no-relai"><Text color={THEME.mark}>{NO_RELAI}</Text></Box>]}
        {top ? [top] : []}
        <Box key="body" flexDirection="column" gap={1}>{body}</Box>
        {sentLine && !isSentInDrawer ? [sentLine] : []}
      </Box>
    )
  }).catch(async ($, e, next) => {
    // A drawing that threw or overran its budget: the pane says so and keeps its tabs, so the
    // person can leave the tab, instead of the engine closing the pane without a word (Z3)
    if (e.surface === 'mobile') return next(e)
    const el = $.ui.resolve(e)
    const { Box, Text } = el
    const why = next.error.kind === 'timeout' ? 'liczyła się dłużej niż pozwala silnik' : next.error.message ?? 'nieznany błąd'
    const tab = tabOf(await read($, view).catch(() => 'commands'))
    const p = parts({ el, Svg: null, isGui: e.surface !== 'terminal', width: Math.max(30, e.props.bodyColumns), flashed: '', last: '', flash: () => undefined })
    return (
      <Box key="relai-pane" flexDirection="column" gap={1}>
        {p.tabs(tab, (v) => { bump(); void update($, view, () => v) })}
        <Box key="pane-error"><Text color={THEME.accentText}>{`⚠ Panel nie narysował tej zakładki: ${why}. Wybierz inną zakładkę albo otwórz /relai-panel ponownie.`}</Text></Box>
      </Box>
    )
  })

  // Each request, main loop and subagents, to the collector, tagged with the stage in progress and
  // the crew task (E4). The plan is read again at each request: a stage turns W TOKU mid-turn, and
  // the request that follows already belongs to it.
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (!S.isRelai) return result
    // Documents (E6): a main turn's first step starts the turn's set of changed files over; every
    // step, a subagent's too, adds the paths its writing tools name (probe relai-probe-e6)
    // (Z4: a write of its own state draws the documents tab again, never the bands above the prompt)
    // Reckoned inside the update, on the value as it stands: two agents' steps never lose a path
    const toolPaths = result ? changedPaths(result.toolUses, S.cwd) : []
    let isMoved = false
    await update($, turnChanged, (was) => {
      const base = !e.agentId && was.turn !== e.turnId ? { turn: e.turnId, paths: [] as string[] } : was
      const named = toolPaths.filter((p) => !base.paths.includes(p))
      if (base === was && !named.length) return was
      isMoved = was.paths.length > 0 || named.length > 0
      return { ...base, paths: [...base.paths, ...named] }
    })
    if (isMoved) bump() // the shelf's "w tej turze" moved
    const at = await $.clock.now()
    // No response at all (stopReason null): no request reached the API, nothing to measure.
    // A response without usage is a measurement missing, recorded as such.
    if (result && (result.usage || result.stopReason !== null)) {
      const usage = result.usage
      if (!e.agentId) lastModel = usage ? usage.model : e.model
      const plan = await readPlan(ioOf($))
      if (JSON.stringify(plan) !== JSON.stringify(S.plan)) bump() // the map and the shelf follow the active plan
      set({ plan })
      const stage = stageTag(plan)
      const task = e.agentId ? ((await read($, agentTasks))[e.agentId] ?? null) : mainTask
      void collect($, (session) => stepRecord({ session, turn: e.turnId, index: e.index, agent: e.agentId ?? null, model: e.model, at, usage, stage, task }))
    }
    return result
  })

  // A subagent started for a crew task: its id joined to the task named under its prompt
  on('agent.spawn', async ($, e, next) => {
    const r = await next(e)
    const task = S.isRelai ? crewTag(e.prompt) : null
    if (task && r && r.agentId) {
      const id = r.agentId
      await update($, agentTasks, (m) => ({ ...m, [id]: task }))
    }
    return r
  })

  on('prompt.submit', async ($, e, next) => {
    if (S.isRelai) mainTask = crewTag(e.text)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai) return r
    // A subagent's turn too, before it returns: relai-progress reads its cost from the file
    if (e.agentId) {
      await flush($)
      return r
    }
    void flush($)
    // The plan if its files moved; the cost comes with session.measure, not asked again (Z4)
    set({ plan: await readPlan(ioOf($)) })
    bump()
    $.ui.invalidate('ui.render')
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai) return r
    // Usage is absent when no request was made (a reused summary, a hook's own): nothing to measure
    const usage = r && 'usage' in r ? r.usage : undefined
    if (usage) {
      const at = await $.clock.now()
      const stage = stageTag(S.plan)
      // A /compact outside a turn has no turn.complete after it: the costs read again on their own
      void collect($, (session) => compactRecord({ session, agent: e.agentId ?? null, model: lastModel, at, usage, stage, task: e.agentId ? null : mainTask })).then(() => flush($)).then(bump)
    }
    return r
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    if (S.isRelai) {
      // The costs tab's engine counter comes from here, not from usage() after the turn (Z4); the
      // plan bar no longer shows a cost (Z1), so nothing above the prompt is drawn again for it
      if (e.cost) set({ costUsd: e.cost.usd })
    }
    return next(e)
  })

  // One band instance for every plugin: draw ours above whatever the plugins beneath draw
  // (the other RelAI cards among them), never instead of it
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!S.isRelai || e.props.hasSurvey) return next(e)
    const below = await next(e)
    // A card waiting for "Tak" opens the bar's second row (brief v2 §1). Read here, the atom
    // subscribes this drawing: the row comes and goes with the card, nobody invalidating. Its
    // answer is the pane's own decide (R4, D-35); the commands' names are asked on the press,
    // never in the drawing, when the pane has not loaded them since the module began.
    const pending = await read($, confirm)
    const waiting = pending ? {
      card: pending,
      decide: (said: 'tak' | 'nie') => { void (async () => decide($, pending, said, (data ?? await loadData($, S.cwd)).names))() },
    } : null
    const ours = band($.ui.resolve(e), e.surface !== 'terminal', e.props.bodyColumns, S.plan, waiting)
    if (!below) return ours
    const { Box } = $.ui.resolve(e)
    // No width here: the engine refuses its own node under a Box with "width" and draws its own
    // instead, which drops every band (live, desktop, 2.1.293; plugin test does not see it)
    return <Box key="relai-panel" flexDirection="column" gap={e.surface === 'terminal' ? 0 : 1}>{[ours, below]}</Box>
  })
}
