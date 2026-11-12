// relai-model-router 0.1.0 — a cheap judge reads each subagent's task and names the cheapest model
// tier that will do it well (plan MODY_OSZCZEDZANIA, E5; spec, section 5). A model the caller named
// is protected: a different suggestion asks the person by a card. The main chat's model is never
// touched; forks, resumes and a mod's own spawns are left alone. This module holds only $ and on
// (rule 13); the logic lives in judge.ts, gate.ts, pane.ts and the core copies in ./core.

import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { CrewDecisionState, RouteChoice } from '../types'
import { CREW_DESCRIPTION, CREW_HEADER, STACK_BELOW, CREW_JUDGES_AT_ONCE, CREW_SCHEMA, CREW_TOOL, acceptAll, baseOf, crewAction, crewAnswerOf, crewOptions, crewPaneRows, crewQuestion, crewReply, crewTasksOf, decisionFor, decisionsOf, differs, isDecidedSpawn, keepRuns, mapLimit, markIn, mineAll, rowOf, runTokenOf, sessionAll, togglePick } from './crew'
import type { CrewDecision, CrewJudged, CrewRow, CrewTask } from './crew'
import { consentRow, guardHelper, hasMarker, isHumanOrigin, isTwinActive, readConsent, settingsCandidates, withConsentRow } from './core/savings-gates.mjs'
import { scanText } from './core/secret-scan.mjs'
import { createQueue, ledgerFile } from './core/savings-ledger.mjs'
import { CARD_HEADER, CARD_OPTIONS, DEFAULT_TIERS, JUDGE_ID, aliasOf, answerOf, cardQuestion, chooseTier, defaultAnswerOf, defaultCardOptions, defaultCardQuestion, explicitAction, judgeRequest, parseVerdict, routeRecord, skipOf, subagentDefaultOf, tierOfModel, tiersOf, usageOf } from './judge'
import type { Alias, Pref, Tier, Tiers, Usage } from './judge'
import { CONSENT_NO_LABEL, CONSENT_QUESTION, CONSENT_YES_LABEL, decide } from './gate'
import type { Gate } from './gate'
import { WIDE_COLUMNS, cardsOf, listsOf, prefWord, summaryOf } from './pane'
import type { Lists } from './pane'

const MOD = 'relai-model-router'
const STORE_KEY = 'settings'
const PANE = 'relai-model-router'
const FAIL_FILE = 'relai/oszczednosci/model-router/ostatni-blad.txt'
const MODEL_LIST = '.claude/relai/MODELE-claude-code.md'
const choices = atom({ plugin: 'relai-model-router', key: 'choices' } as const, [] as RouteChoice[], { shape: 'choices-1' })
const idle = atom({ plugin: 'relai-model-router', key: 'idle' } as const, '', { shape: 'idle-1' })
const pref = atom({ plugin: 'relai-model-router', key: 'pref' } as const, 'ask', { shape: 'pref-1' })
/** The crew card's decisions (E6), kept in $.state too: a reload must not give a decided member a second card. */
const crew = atom({ plugin: 'relai-model-router', key: 'crew' } as const, [] as CrewDecisionState[], { shape: 'crew-1' })
/** Bumped on every change of the crew rows: the pane reads it, so a write redraws it (a test showed invalidate alone does not). */
const crewTick = atom({ plugin: 'relai-model-router', key: 'crewTick' } as const, 0, { shape: 'crew-tick-1' })
const CREW_PANE = 'relai-crew-models'
/** A literal, so the validator sees the matcher: `mcp__<plugin>__<CREW_TOOL>`. */
const CREW_TOOL_FULL = 'mcp__relai-model-router__crew_models'
const KEEP_DECISIONS = 50
/** Crew cards whose decisions are kept, whole: a later card never drops some members of an earlier one. */
const KEEP_RUNS = 8

// Session facts, set at session.start; a reload runs it again
let cwd = ''
let claudeDir = ''
let session = 'unknown'
let isWindows = false
let gate: Gate = { isTwinActive: false, projectRoot: null, consent: null, hasHuman: false, isOn: true }
let tiers: Tiers = DEFAULT_TIERS
/** env.CLAUDE_CODE_SUBAGENT_MODEL from the settings, or null (the parent's model then). */
let subagentDefault: string | null = null
let toldIdle = ''
let lastFailure = ''
let queue: ReturnType<typeof createQueue> | null = null
let prices: Lists = listsOf(null)
/** Judged subagents still running, by agentId: their record waits for their own usage. */
let running = new Map<string, { rec: Parameters<typeof routeRecord>[0], used: Usage | null }>()
/** Subagents remembered at once: their summed step usage, and those that ended before their spawn resolved. */
const KEEP_AGENTS = 50
let stepUsage = new Map<string, Usage>()
let finished = new Set<string>()
const capped = (m: Map<string, Usage>, id: string, u: Usage): Map<string, Usage> => {
  const out = new Map(m)
  out.delete(id)
  out.set(id, u)
  return out.size > KEEP_AGENTS ? new Map([...out].slice(-KEEP_AGENTS)) : out
}

/** The crew card's decisions (module copy: a parallel spawn's hook does not see a $.state write yet, P-067). */
let crewDecisions: CrewDecision[] = []
/** The rows of the open crew card (the pane toggles them) and each task's ledger record, by `run/id`. */
let crewRows: CrewRow[] = []
let crewRecs = new Map<string, Parameters<typeof routeRecord>[0]>()

const isOnStored = (stored: unknown): boolean => !(stored && typeof stored === 'object' && (stored as { on?: unknown }).on === false)
const asPref = (x: unknown): Pref => (x === 'mine' || x === 'suggestion' || x === 'session' ? x : 'ask')

async function readOr($: any, path: string): Promise<string | null> {
  try { return await $.fs.read(path) } catch { return null }
}

/** ~/.claude: the user folder is not given to mods, so it comes from a process's environment. */
async function findClaudeDir($: any): Promise<string> {
  const argv = isWindows ? ['cmd.exe', '/d', '/c', 'echo %USERPROFILE%'] : ['/bin/sh', '-c', 'printf %s "$HOME"']
  try {
    const r = await $.process.run(argv, { timeoutMs: 5000 })
    const home = String(r.stdout || '').trim()
    return home ? `${home.replace(/[\\/]+$/, '').replace(/\\/g, '/')}/.claude` : ''
  } catch { return '' }
}

async function loadGate($: any): Promise<void> {
  let projectRoot: string | null = null
  let consent: Gate['consent'] = null
  for (const c of settingsCandidates(cwd)) {
    const text = await readOr($, c.file)
    if (text !== null && hasMarker(text)) { projectRoot = c.root; consent = readConsent(text); break }
  }
  const settings = [
    claudeDir ? await readOr($, `${claudeDir}/settings.json`) : null,
    projectRoot ? await readOr($, `${projectRoot}/.claude/settings.json`) : null,
    projectRoot ? await readOr($, `${projectRoot}/.claude/settings.local.json`) : null,
  ]
  const switches = claudeDir ? await readOr($, `${claudeDir}/mods/switches.json`) : null
  gate = { ...gate, projectRoot, consent, isTwinActive: isTwinActive(MOD, settings, switches), isOn: isOnStored(await $.store.get(STORE_KEY)) }
  tiers = tiersOf(projectRoot ? await readOr($, `${projectRoot}/${MODEL_LIST}`) : null)
  subagentDefault = subagentDefaultOf(settings)
  prices = listsOf(projectRoot ? await readOr($, `${projectRoot}/.claude/relai/panel/cennik.json`) : null)
}

async function tellIdleOnce($: any, why: string): Promise<void> {
  await update($, idle, () => why)
  if (toldIdle === why) return
  toldIdle = why
  $.ui.toast(`relai-model-router ${why}`)
}

async function askConsent($: any): Promise<void> {
  if (!gate.projectRoot) return
  let answer = ''
  try { answer = await $.ui.ask(CONSENT_QUESTION, { header: 'RelAI', options: [CONSENT_YES_LABEL, CONSENT_NO_LABEL] }) } catch { return }
  const isYes = answer === CONSENT_YES_LABEL
  if (!isYes && answer !== CONSENT_NO_LABEL) return
  const file = `${gate.projectRoot}/docs/USTAWIENIA.md`
  const text = await readOr($, file)
  if (text === null) return
  // another session may have answered meanwhile: its row stands
  if (readConsent(text) !== null) { gate = { ...gate, consent: readConsent(text) }; return }
  await $.fs.write(file, withConsentRow(text, consentRow(new Date().toISOString().slice(0, 10), isYes)))
  gate = { ...gate, consent: isYes ? 'yes' : 'no' }
}

/** Whether a task may go to the judge now; asks for consent once, says why not once. */
async function mayRoute($: any): Promise<boolean> {
  let d = decide(gate)
  if (d.kind === 'ask') { await askConsent($); d = decide(gate) }
  if (d.kind === 'idle') { await tellIdleOnce($, d.why); return false }
  await update($, idle, () => '')
  return true
}

async function writeRecord($: any, rec: Record<string, unknown>): Promise<void> {
  if (!claudeDir) return
  const ts = new Date().toISOString()
  if (!queue) queue = createQueue({ read: (p: string) => $.fs.read(p), write: (p: string, t: string) => $.fs.write(p, t) }, ledgerFile(claudeDir, ts, session))
  try {
    await queue.push({ ts, session, mod: MOD, ...rec })
  } catch (err) {
    $.ui.log(`relai-model-router: ledger write failed: ${String(err)}`)
  }
}

/** A failure goes where a person or Claude sees it (L-0321): the stats, the pane and a file. */
async function fail($: any, why: string): Promise<void> {
  lastFailure = `${new Date().toISOString()} ${why}`
  $.ui.log(`relai-model-router: ${why}`)
  if (claudeDir) { try { await $.fs.write(`${claudeDir}/${FAIL_FILE}`, `${lastFailure}\n`) } catch { /* the log line stays */ } }
}

type Choice = Omit<RouteChoice, 'at'>
async function remember($: any, c: Choice): Promise<void> {
  await update($, choices, (list) => [...list, { at: new Date().toISOString(), ...c }].slice(-50))
}

type Judged = { usage: Usage | null, ms: number, verdictOrWhy: ReturnType<typeof parseVerdict> }

async function callJudge($: any, task: string, description: string): Promise<Judged> {
  const started = Date.now()
  const r: any = await $.model.complete(judgeRequest(task, description))
  const ms = Date.now() - started
  const usage = usageOf(JUDGE_ID, r?.usage)
  if (!r?.isAnswered) return { usage, ms, verdictOrWhy: { ok: false, why: `judge gave no answer: ${String(r?.reason ?? 'no result')}${r?.status ? ` (${r.status})` : ''}` } }
  return { usage, ms, verdictOrWhy: parseVerdict(String(r.text ?? '')) }
}

/** The card for a model the caller named: the person decides; the session may remember it. */
async function askPerson($: any, description: string, mine: Alias, suggestion: Alias, rule: string): Promise<boolean> {
  let label = ''
  try {
    label = await $.ui.ask(cardQuestion({ description, mine, suggestion, rule }), { header: CARD_HEADER, options: [...CARD_OPTIONS] })
  } catch (err) {
    await fail($, `card not shown: ${String(err)}; the named model stays`)
    return false
  }
  const a = answerOf(label)
  if (a.pref) { prefNow = a.pref; await update($, pref, () => a.pref as Pref) }
  return a.apply
}

/** The session's answer to the card, kept here too: a $.state write is not seen by a parallel spawn's hook until its own ends (test E5). */
let prefNow: Pref = 'ask'
let cardChain: Promise<unknown> = Promise.resolve()
/** Runs `work` after every earlier card's work has settled. */
function oneAtATime<T>(work: () => Promise<T>): Promise<T> {
  const run = cardChain.then(work, work)
  cardChain = run.catch(() => undefined)
  return run
}

type Spawned = { model: Alias | null, rec: Parameters<typeof routeRecord>[0] | null }

/** The model a judged spawn runs on (null: unchanged) and its ledger record (null: none to write). */
async function route($: any, x: any): Promise<Spawned> {
  const description = String(x.description ?? '')
  const task = String(x.prompt ?? '')
  const isExplicit = typeof x.model === 'string' && x.model !== ''
  // No model named: the subagent default from the settings, else the parent's (live E5: the default, not the parent, ran)
  const from = isExplicit ? String(x.model) : (subagentDefault ?? String(x.parentModel ?? ''))
  const current: Tier | null = tierOfModel(from, tiers)
  if (current === null) return { model: null, rec: null } // a model outside the list: not the router's to judge
  const fromAlias = tiers.alias[current]
  const base = { description, from: fromAlias, isExplicit }
  const g = await guardHelper(`${description}\n${task}`, (t: string) => scanText(t), () => callJudge($, task, description))
  if (!g.sent || !g.result) {
    await remember($, { ...base, to: fromAlias, outcome: 'secret', why: `secret scanner: ${g.label}`, judgeIn: 0, judgeOut: 0, ms: 0 })
    $.ui.log(`relai-model-router: secret scanner (${g.label}) — the task stays here, model unchanged`)
    return { model: null, rec: null }
  }
  const j = g.result
  const id = String(x.tool_use_id ?? '')
  const used = { judgeIn: j.usage?.in ?? 0, judgeOut: j.usage?.out ?? 0, ms: j.ms }
  if (!j.verdictOrWhy.ok) {
    await fail($, `${description}: ${j.verdictOrWhy.why}; model unchanged`)
    await remember($, { ...base, to: fromAlias, outcome: 'failed', why: j.verdictOrWhy.why, ...used })
    return { model: null, rec: j.usage ? { toolUseId: id, action: 'route-failed', from, to: from, usage: j.usage, ms: j.ms, why: j.verdictOrWhy.why } : null }
  }
  const chosen = chooseTier(current, j.verdictOrWhy.verdict)
  const suggestion = tiers.alias[chosen.tier]
  const session = aliasOf(x.parentModel)
  const isProtected = isExplicit || subagentDefault !== null
  // No model of anyone's choosing: the chosen tier is always pinned, so a risky task never falls to a lighter default
  const settled: Settled = isProtected
    ? await oneAtATime(() => protectedChoice($, { description, isExplicit, current, chosenTier: chosen.tier, rule: chosen.rule, fromAlias, suggestion, session }))
    : { model: suggestion, how: `judge: ${chosen.rule}` }
  const isChanged = settled.model !== null && settled.model !== fromAlias
  await remember($, { ...base, to: settled.model ?? fromAlias, outcome: isChanged ? 'changed' : 'kept', why: settled.how, ...used })
  return { model: settled.model, rec: { toolUseId: id, action: isChanged ? 'route-changed' : 'route-kept', from, to: settled.model ?? from, usage: j.usage, ms: j.ms, why: settled.how } }
}

/** The model to pin (null: the chosen one stays) and why. */
type Settled = { model: Alias | null, how: string }

/**
 * A model someone chose — named in the call, or the subagent default from the settings (Annex B).
 * Runs one at a time (oneAtATime): parallel spawns wait, and each reads the session's answer anew.
 */
async function protectedChoice($: any, o: { description: string, isExplicit: boolean, current: Tier, chosenTier: Tier, rule: string, fromAlias: Alias, suggestion: Alias, session: Alias | null }): Promise<Settled> {
  const act = explicitAction({ explicit: o.current, suggested: o.chosenTier, pref: prefNow, hasHuman: gate.hasHuman })
  const whose = o.isExplicit ? 'yours' : 'the subagent default'
  if (act === 'keep') return { model: null, how: o.chosenTier === o.current ? `judge agrees with ${whose}: ${o.rule}` : `your session choice: always ${whose} (${o.rule})` }
  if (act === 'apply') return { model: o.suggestion, how: gate.hasHuman ? `your session choice: always the suggestion (${o.rule})` : `no person in the session: suggestion applied (${o.rule})` }
  if (act === 'session') return o.session ? { model: o.session, how: `your session choice: always the session's model (${o.rule})` } : { model: null, how: `session model unknown: ${whose} kept (${o.rule})` }
  if (o.isExplicit) {
    const isYes = await askPerson($, o.description, o.fromAlias, o.suggestion, o.rule)
    return { model: isYes ? o.suggestion : null, how: `card: ${isYes ? 'suggestion' : 'yours'} (${o.rule})` }
  }
  return askDefault($, o.description, o.fromAlias, o.suggestion, o.session, o.rule)
}

/** The card for the subagent default from the settings (Annex B). A card that fails keeps the default. */
async function askDefault($: any, description: string, dflt: Alias, suggestion: Alias, session: Alias | null, rule: string): Promise<Settled> {
  const options = defaultCardOptions({ suggestion, dflt, session })
  let label = ''
  try {
    label = await $.ui.ask(defaultCardQuestion({ description, dflt, suggestion, session, rule }), { header: CARD_HEADER, options: options.map((x) => x.label) })
  } catch (err) {
    await fail($, `card not shown: ${String(err)}; the subagent default stays`)
    return { model: null, how: `card not shown: the subagent default kept (${rule})` }
  }
  const a = defaultAnswerOf(label, options, { suggestion, session })
  if (a.pref) { prefNow = a.pref; await update($, pref, () => a.pref as Pref) }
  return { model: a.model, how: `card: ${a.word} (${rule})` }
}

// ---- The crew card (E6): /relai-crew sends its task list once, before any member starts ----

type CrewJudgedTask = { row: CrewRow, from: string, usage: Usage | null, ms: number }

/** One crew task through the secret scanner and the judge, as a single spawn (E5). Never throws. */
async function judgeCrewTask($: any, t: CrewTask, sessionModel: string | null): Promise<CrewJudgedTask> {
  const b = baseOf(t, subagentDefault, sessionModel)
  const current = tierOfModel(b.from, tiers)
  const mine = current === null ? null : tiers.alias[current]
  const make = (j: CrewJudged, usage: Usage | null = null, ms = 0): CrewJudgedTask => ({ row: rowOf(t, mine, b.isExplicit, j, tiers), from: b.from, usage, ms })
  if (current === null) return make({ kind: 'outside' })
  const text = t.task || t.title
  try {
    const g = await guardHelper(`${t.title}\n${text}`, (s: string) => scanText(s), () => callJudge($, text, t.title))
    if (!g.sent || !g.result) return make({ kind: 'secret', label: String(g.label) })
    const j = g.result
    if (!j.verdictOrWhy.ok) return make({ kind: 'failed', why: j.verdictOrWhy.why }, j.usage, j.ms)
    const chosen = chooseTier(current, j.verdictOrWhy.verdict)
    return make({ kind: 'judged', tier: chosen.tier, rule: chosen.rule }, j.usage, j.ms)
  } catch (err) {
    return make({ kind: 'failed', why: String(err) })
  }
}

/** Whether the crew pane's buttons act: only while its card waits for the person. */
let isCrewOpen = false

/** The card: the table in the pane (a pick per row), closed by one $.ui.ask (probe E6: own waiting outruns the hook's budget, a $ call does not). */
async function askCrew($: any, rows: CrewRow[]): Promise<{ rows: CrewRow[], how: string }> {
  crewRows = rows
  await bumpCrewPane($)
  let isPane = false
  try { isPane = Boolean((await $.ui.open({ id: CREW_PANE, title: 'RelAI crew models' }))?.isPlaced) } catch { isPane = false }
  isCrewOpen = isPane
  let label = ''
  try {
    label = await $.ui.ask(crewQuestion(crewRows, isPane), { header: CREW_HEADER, options: crewOptions(isPane) })
  } catch (err) {
    isCrewOpen = false
    await fail($, `crew card not shown: ${String(err)}; every chosen model stays`)
    crewRows = mineAll(rows)
    return { rows: crewRows, how: 'crew card not shown: yours kept' }
  }
  isCrewOpen = false
  const a = crewAnswerOf(label, crewRows, isPane)
  crewRows = a.rows
  await bumpCrewPane($)
  return { rows: a.rows, how: `crew card: ${a.word}` }
}

/** Redraws the crew pane; a failed write only costs the redraw, never the person's answer (review E6). */
async function bumpCrewPane($: any): Promise<void> {
  try { await update($, crewTick, (n) => n + 1) } catch (err) { $.ui.log(`relai-model-router: crew pane redraw failed: ${String(err)}`) }
}

/** The rows as they run: quiet, the session's answer, no person, or the card. */
async function settleCrew($: any, rows: CrewRow[], sessionModel: string | null): Promise<{ rows: CrewRow[], how: string }> {
  const act = crewAction(rows, { pref: prefNow, hasHuman: gate.hasHuman })
  if (act === 'quiet') return { rows, how: 'judge agrees with every chosen model' }
  if (act === 'keep') return { rows: mineAll(rows), how: 'your session choice: always yours' }
  if (act === 'apply') return { rows: acceptAll(rows), how: gate.hasHuman ? 'your session choice: always the suggestion' : 'no person in the session: suggestions applied' }
  if (act === 'session') {
    const s = aliasOf(sessionModel)
    return s ? { rows: sessionAll(rows, s), how: "your session choice: always the session's model" } : { rows: mineAll(rows), how: 'session model unknown: yours kept' }
  }
  // not queued behind other cards: a plain wait counts against the hook's 10 s budget, a $.ui.ask does not (probe E6, review E6)
  return askCrew($, rows)
}

/** One task's choice for the pane and the ledger; the record waits in crewRecs for the member's own usage. */
async function recordCrewRow($: any, o: { toolUseId: string, run: string, row: CrewRow, judged: CrewJudgedTask, how: string }): Promise<void> {
  const r = o.row
  if (r.outcome === 'outside') return
  const isChanged = r.pick !== null && r.pick !== r.mine
  const outcome = r.outcome === 'secret' ? 'secret' : r.outcome === 'failed' ? 'failed' : isChanged ? 'changed' : 'kept'
  const why = r.outcome === 'judged' ? `${o.how}; ${r.rule}` : r.rule
  if (r.outcome === 'failed') await fail($, `crew ${r.id}: ${r.rule}; model unchanged`)
  await remember($, { description: `crew ${r.id}: ${r.title}`, from: r.mine ?? o.judged.from, to: r.pick ?? r.mine ?? o.judged.from, outcome, why, isExplicit: r.isExplicit, judgeIn: o.judged.usage?.in ?? 0, judgeOut: o.judged.usage?.out ?? 0, ms: o.judged.ms })
  if (!o.judged.usage) return
  const rec = { toolUseId: o.toolUseId, part: `crew-${r.id}`, action: r.outcome === 'failed' ? 'route-failed' : isChanged ? 'route-changed' : 'route-kept', from: o.judged.from, to: r.pick ?? o.judged.from, usage: o.judged.usage, ms: o.judged.ms, why }
  crewRecs = new Map([...crewRecs, [`${o.run}/${r.id}`, rec] as const].slice(-KEEP_DECISIONS))
  await writeRecord($, routeRecord(rec))
}

/** Crew cards this session: the run token's counter, and whether a card is being settled now. */
let crewRuns = 0
let isCrewBusy = false

/** The tool's answer for the orchestrator (JSON text): per task the model and the mark, or why the router stays out. */
async function crewTool($: any, x: any): Promise<string> {
  const keep = "keep the interview's models"
  const parsed = crewTasksOf(x)
  if (!parsed.ok) return JSON.stringify({ router: MOD, error: parsed.why, use: keep })
  // one crew card at a time, refused at once rather than queued (a queued wait would outrun the hook's budget)
  if (isCrewBusy) return JSON.stringify({ router: MOD, error: 'another crew card is open', use: keep })
  isCrewBusy = true
  try {
    if (!(await mayRoute($))) return JSON.stringify({ router: MOD, asleep: (await read($, idle)) || 'not routing', use: keep })
    const toolUseId = String(x.tool_use_id ?? '')
    crewRuns += 1
    const run = runTokenOf(toolUseId, crewRuns)
    let sessionModel: string | null = null
    try { sessionModel = String(await $.session.model()) || null } catch { sessionModel = null }
    const judged = await mapLimit(parsed.tasks, CREW_JUDGES_AT_ONCE, (t) => judgeCrewTask($, t, sessionModel))
    const settled = await settleCrew($, judged.map((j) => j.row), sessionModel)
    // the person's answer is final here: the reply and the module's decisions come before any write that may fail (review E6)
    const mine = decisionsOf(run, settled.rows)
    crewDecisions = keepRuns(crewDecisions, run, mine, KEEP_RUNS)
    const reply = crewReply(run, settled.rows, settled.how)
    try {
      await update($, crew, (prev) => keepRuns(prev.map(decisionOfState), run, mine, KEEP_RUNS).map((d) => ({ ...d })))
    } catch (err) {
      await fail($, `crew decisions not kept in the session state: ${String(err)}; they hold until a reload`)
    }
    for (const [i, j] of judged.entries()) {
      try {
        await recordCrewRow($, { toolUseId, run, row: settled.rows[i], judged: j, how: settled.how })
      } catch (err) {
        $.ui.log(`relai-model-router: crew ${settled.rows[i].id}: record not written: ${String(err)}`)
      }
    }
    return reply
  } finally {
    isCrewBusy = false
  }
}

/** A decision as $.state keeps it (the model as an alias again). */
function decisionOfState(d: CrewDecisionState): CrewDecision {
  return { run: d.run, id: d.id, model: aliasOf(d.model), replied: d.replied ?? null, given: d.given ?? null, rowIndex: d.rowIndex }
}

/** A member decided on the crew card: the card's model, no judge, no second card; its usage joins the task's record. */
async function spawnDecided($: any, e: any, next: any, d: CrewDecision): Promise<any> {
  const ran = await next(d.model ? { ...e, model: d.model } : e)
  const rec = crewRecs.get(`${d.run}/${d.id}`)
  const id = String(ran?.agentId ?? '')
  if (!rec || !id) return ran
  if (finished.has(id)) await writeRecord($, routeRecord({ ...rec, subagent: stepUsage.get(id) ?? null }))
  else running.set(id, { rec, used: null })
  return ran
}

async function setOn($: any, on: boolean): Promise<string> {
  await $.store.set(STORE_KEY, { on })
  gate = { ...gate, isOn: on }
  $.ui.invalidate('ui.render')
  return on ? 'relai-model-router: on — each subagent task goes to the judge first.' : 'relai-model-router: off — subagents run on the model they were given.'
}

async function setPref($: any, p: Pref): Promise<string> {
  prefNow = p
  await update($, pref, () => p)
  return `relai-model-router: for a model someone chose (named in the call or the subagent default), this session ${prefWord(p)}.`
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    cwd = String(e.cwd || '').replace(/\\/g, '/')
    isWindows = /^[A-Za-z]:\//.test(cwd)
    claudeDir = await findClaudeDir($)
    try { session = await $.session.id() } catch { session = 'unknown' }
    queue = null
    running = new Map()
    stepUsage = new Map()
    finished = new Set()
    prefNow = asPref(await read($, pref))
    // a reload keeps $.state: decided crew members still spawn with no second card
    crewDecisions = (await read($, crew)).map(decisionOfState)
    crewRows = []
    crewRecs = new Map()
    isCrewOpen = false
    await loadGate($)
    try {
      await $.tool.register({ name: CREW_TOOL, description: CREW_DESCRIPTION, inputSchema: CREW_SCHEMA as unknown as Record<string, unknown> })
    } catch (err) {
      await fail($, `crew tool not registered: ${String(err)}; /relai-crew keeps the interview's models`)
    }
    await $.command.register({ name: 'relai-model-router', description: 'RelAI Model Router: stats; on|off; pane; mine|suggestion|session|ask (this session, for a model named in the call or the subagent default)' })
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (isHumanOrigin((e as any).origin)) gate = { ...gate, hasHuman: true }
    return next(e)
  })

  on('command.run', { command: 'relai-model-router' }, async ($, e) => {
    if (isHumanOrigin((e as any).origin)) gate = { ...gate, hasHuman: true }
    const w = String(e.args || '').trim().toLowerCase()
    if (w === 'on' || w === 'off') return { text: await setOn($, w === 'on') }
    if (w === 'mine' || w === 'suggestion' || w === 'session' || w === 'ask') return { text: await setPref($, w) }
    if (w === 'pane') { await $.ui.open({ id: PANE, title: 'RelAI Model Router' }); return { text: 'relai-model-router: pane opened.' } }
    if (w !== '' && w !== 'stats') return { text: 'relai-model-router: use stats, on, off, pane, mine, suggestion, session or ask.' }
    const list = await read($, choices)
    const d = decide(gate)
    const state = d.kind === 'idle' ? d.why : d.kind === 'ask' ? 'asks at the next subagent' : 'on'
    return { text: `relai-model-router: ${state}; tiers fast ${tiers.alias.fast}, balanced ${tiers.alias.balanced}, deep ${tiers.alias.deep}; subagent default ${subagentDefault ?? 'none (the parent model)'}; a chosen model: ${prefWord(asPref(await read($, pref)))}. ${summaryOf(list, prices)}; ${list.filter((c) => c.outcome === 'failed').length} failed, ${list.filter((c) => c.outcome === 'secret').length} held back by the secret scanner.${lastFailure ? ` Last failure: ${lastFailure}` : ''}` }
  })

  // The crew card: /relai-crew calls this once, after its wave plan (E6)
  on('tool.call', { tool: CREW_TOOL_FULL }, async ($, e) => {
    let text: string
    try {
      text = await crewTool($, e)
    } catch (err) {
      await fail($, `crew card: ${String(err)}; the interview's models stay`)
      text = JSON.stringify({ router: MOD, error: String(err), use: "keep the interview's models" })
    }
    return { result: [{ type: 'text', text }] } as any
  })

  on('ui.render', { component: 'Pane', requestId: CREW_PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    // DESIGN.md 6: one layout decision per pane — under STACK_BELOW columns the button goes under the words
    const isWide = (e.viewport?.columns ?? STACK_BELOW) >= STACK_BELOW
    await read($, crewTick) // read so that a change of the rows redraws the pane
    const rows = crewPaneRows(crewRows)
    const toggle = (id: string) => {
      if (!isCrewOpen) return
      crewRows = togglePick(crewRows, id)
      void update($, crewTick, (n) => n + 1)
    }
    const n = crewRows.filter(differs).length
    return (
      <Box flexDirection="column" paddingX={1} rowGap={1}>
        <Box key="head" flexDirection="column">
          <Text color="text" bold>RelAI crew models — before the crew starts</Text>
          <Text color="inactive">{rows.length === 0 ? 'No crew card in this chat yet: /relai-crew shows its tasks here before any member starts.' : isCrewOpen ? `The judge suggests another model for ${n} of ${rows.length} tasks. Pick per row here, then answer the card in the chat.` : 'Decided: the crew runs on these models.'}</Text>
        </Box>
        {rows.map((r) => (
          <Box key={r.key} flexDirection={isWide ? 'row' : 'column'} columnGap={2} rowGap={1}>
            {/* zero base width only beside a button: stacked, flexGrow is vertical and width 0 puts each letter on its own line (live E6) */}
            <Box key={`${r.key}~w`} flexDirection="column" flexGrow={1} {...(isWide ? { width: 0 } : {})}>
              <Text color="text">{`${r.sign} ${r.state}`}</Text>
              <Text color="inactive" wrap="truncate">{r.title}</Text>
              <Text color="inactive">{r.why}</Text>
            </Box>
            {r.button !== null && isCrewOpen && (
              <Box key={`${r.key}~b`} flexShrink={0}><Button key={`${r.key}~p`} label={r.button} variant="secondary" onPress={() => toggle(r.key.slice('crew-'.length))} /></Box>
            )}
          </Box>
        ))}
      </Box>
    )
  })

  // The router itself: only a subagent's spawn; the main chat has no spawn and is never touched
  on('agent.spawn', async ($, e, next) => {
    const x: any = e
    if (skipOf({ fork: x.fork, resume: x.resume, origin: (next as any).origin ?? null }) !== null) return next(e)
    // A member the person decided on the crew card (E6): its model from the card, no judge, no second card.
    // Only with the router on, and only a spawn asking for the reply's or the interview's model (review E6)
    const decided = decisionFor(crewDecisions, markIn(String(x.prompt ?? '')))
    if (decided && gate.isOn && isDecidedSpawn(decided, x.model)) return spawnDecided($, e, next, decided)
    let picked: Spawned = { model: null, rec: null }
    try {
      if (await mayRoute($)) picked = await route($, x)
    } catch (err) {
      await fail($, `${String(x.description ?? '')}: ${String(err)}; model unchanged`)
      picked = { model: null, rec: null }
    }
    let ran: any
    try {
      ran = await next(picked.model ? { ...e, model: picked.model } : e)
    } catch (err) {
      // the spawn did not start: the judge was still paid, so its cost stays in the ledger (review E5)
      if (picked.rec) await writeRecord($, routeRecord({ ...picked.rec, action: 'route-failed', why: `spawn failed: ${String(err)}` }))
      throw err
    }
    if (!picked.rec) return ran
    await writeRecord($, routeRecord(picked.rec))
    const id = String(ran?.agentId ?? '')
    if (!id) return ran
    // A step or the end may come before next resolves (as relai-browser keeps them): settle now then
    if (finished.has(id)) await writeRecord($, routeRecord({ ...picked.rec, subagent: stepUsage.get(id) ?? null }))
    else running.set(id, { rec: picked.rec, used: null })
    return ran
  })

  // Every subagent's own usage, its steps summed by its id (P-063: a generator)
  on('turn.step', async function* ($, e, next) {
    const r: any = yield* next(e)
    const id = String((e as any).agentId ?? '')
    const u = id && r?.usage ? usageOf(String((e as any).model ?? ''), r.usage) : null
    if (u) {
      const was = stepUsage.get(id)
      stepUsage = capped(stepUsage, id, { model: u.model, in: (was?.in ?? 0) + u.in, out: (was?.out ?? 0) + u.out })
    }
    return r
  })

  // A judged subagent's record again with that usage: the same tool_use_id, so the later one counts
  on('turn.complete', async ($, e, next) => {
    const id = String((e as any).agentId ?? '')
    const run = id ? running.get(id) : undefined
    if (run) {
      running.delete(id)
      await writeRecord($, routeRecord({ ...run.rec, subagent: stepUsage.get(id) ?? null }))
    } else if (id) {
      finished = new Set([...finished, id].slice(-KEEP_AGENTS))
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, choices)
    const why = await read($, idle)
    const p = asPref(await read($, pref))
    const isWide = (e.viewport?.columns ?? WIDE_COLUMNS) >= WIDE_COLUMNS
    const room = Math.max(1, Math.floor(((e.viewport?.rows ?? 24) - 8) / 4))
    const cards = cardsOf(list, prices, room)
    const btn = (key: string, label: string, onPress: () => void) => (
      <Box key={`${key}~b`} flexShrink={0}><Button key={key} label={label} variant="secondary" onPress={onPress} /></Box>
    )
    const mark = (isSet: boolean, label: string) => (isSet ? `● ${label}` : label)
    return (
      <Box flexDirection="column" paddingX={1} rowGap={1}>
        <Box key="head" flexDirection="column">
          <Text color="text" bold>RelAI Model Router — subagent models</Text>
          <Text color="inactive">{summaryOf(list, prices)}</Text>
          <Text color="inactive">{`Tiers: fast ${tiers.alias.fast} · balanced ${tiers.alias.balanced} · deep ${tiers.alias.deep}`}</Text>
          {why !== '' && <Text color="warning">● {why}</Text>}
        </Box>
        <Box key="sw" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
          {btn('sw-on', gate.isOn ? '● Router on' : 'Router off', () => { void setOn($, !gate.isOn) })}
        </Box>
        <Box key="pref" flexDirection="column" rowGap={1}>
          <Text key="pref-t" color="inactive">{`A model someone chose (named in the call${subagentDefault ? `, or the subagent default ${aliasOf(subagentDefault) ?? subagentDefault}` : ''}), this session:`}</Text>
          <Box key="pref-b" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
            {btn('pref-ask', mark(p === 'ask', 'Ask me'), () => { void setPref($, 'ask') })}
            {btn('pref-mine', mark(p === 'mine', 'Always mine'), () => { void setPref($, 'mine') })}
            {btn('pref-sug', mark(p === 'suggestion', 'Always suggestion'), () => { void setPref($, 'suggestion') })}
            {btn('pref-ses', mark(p === 'session', 'Always session model'), () => { void setPref($, 'session') })}
          </Box>
        </Box>
        {cards.length === 0 && <Text key="none" color="inactive">No subagents judged yet: each subagent's model choice shows here.</Text>}
        {cards.map((c) => (
          <Box key={c.key} flexDirection={isWide ? 'row' : 'column'} columnGap={2}>
            <Box key={`${c.key}~w`} flexDirection="column" flexGrow={1} {...(isWide ? { width: 0 } : {})}>
              <Text color={c.tone === 'bad' ? 'error' : c.tone === 'ok' ? 'text' : 'inactive'}>{c.sign} {c.word} · {c.models}</Text>
              <Text color="inactive" wrap="truncate">{c.title}</Text>
              <Text color="inactive">{c.why}</Text>
              {c.cost !== '' && <Text color="inactive">{c.cost}</Text>}
            </Box>
          </Box>
        ))}
      </Box>
    )
  })
}
