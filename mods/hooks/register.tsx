// relai-mods: what is installed on this machine and what fires in it, beside the chat (plan
// RELAI_MODS). E3: the cockpit of mockup C on the desktop — a header with the count, a search and
// filters, the list on the left with a fading rule between rows, the details of the chosen row on
// the right, a switch in every row that has one, locks with their reason, and the bar of changes
// waiting for /reload-plugins. The pane never writes settings.json or installed_plugins.json: the
// CLI does, one call at a time (brief, Łukasz's decisions). Pure logic in ./inventory, ./cockpit
// and ./look. E4: one layout decision for the pane by its width (STACK_BELOW), the terminal's glyphs,
// a refresh from disk every REFRESH_MS while the pane is open, and a press that carries its target.
// ZASIEG_PLUGINU E3: the row "RelAI w tym projekcie" — the set enabled or disabled in the session's
// folder with `--scope local`, after a "Tak" card; its one write of its own is the line in .worktreeinclude.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import {
  buildInventory, cliError, enabledOf, filesOf, foldersOf, joinPath, parseInstalls, settingsFilesOf, sourcesOf,
} from './inventory'
import type { DirEntry, Install, Inventory, PluginFiles } from './inventory'
import {
  DRAW_LIMIT, EMPTY_QUEUE, REFRESH_MS, SCOPE_KEY, enqueue, finish, flipCall, isFilter, isSettled, itemKey, lockOf,
  oppositeArgv, outcomeOf, pendingCount, scopeKey, scopePlan, scopeRowOf, snapshotOf, startNext, treeWeight, visible,
  withWorktreeLine,
} from './cockpit'
import type { Queue, ScopeCall, ScopeRow } from './cockpit'
import { cockpit, mobileList } from './views'
import type { SvgTag, View } from './views'

type $T = EngineInterface

const PANE_ID = 'relai-mods'
const PANE_TITLE = 'RelAI Mods'
const CLI = 'claude' // from PATH: the mod does not see CLAUDE_CODE_EXECPATH (P-052, Annex B)
const CLI_TIMEOUT_MS = 20_000 // SZACUNEK from the plan, section 8; E1 measured ~0.7 s

const S = { plugin: 'relai-mods' } as const
const note = atom({ ...S, key: 'note' } as const, '')
const query = atom({ ...S, key: 'query' } as const, '')
const filterAtom = atom({ ...S, key: 'filter' } as const, 'all')
const selected = atom({ ...S, key: 'selected' } as const, '')
const queue = atom({ ...S, key: 'queue' } as const, EMPTY_QUEUE as Queue)
const errors = atom({ ...S, key: 'errors' } as const, {} as Record<string, string>)
const cli = atom({ ...S, key: 'cli' } as const, '')
const loaded = atom({ ...S, key: 'loaded' } as const, {} as Record<string, boolean>)
const wants = atom({ ...S, key: 'wants' } as const, {} as Record<string, boolean>)
const tick = atom({ ...S, key: 'tick' } as const, 0)
const ask = atom({ ...S, key: 'ask' } as const, '')
// The module's own; a reload of its code starts them over (and cancels the timer's waits) and
// session.start sets root again
let root = ''
let isCliAsked = false
let refresher: { cancel: () => void } | null = null

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err))

async function readText($: $T, path: string): Promise<string | null> {
  try {
    return (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    return null
  }
}

async function listDir($: $T, path: string): Promise<DirEntry[] | null> {
  try {
    return (await $.fs.exists(path)) ? (await $.fs.list(path)).map((x) => ({ name: x.name, kind: x.kind })) : null
  } catch {
    return null
  }
}

// The home folder from the environment, never from $.plugin.root (plan, section 5)
async function homeDir($: $T): Promise<string> {
  return (await $.env.get('USERPROFILE').catch(() => '')) || (await $.env.get('HOME').catch(() => '')) || ''
}

const booleansOf = (raw: unknown): Record<string, boolean> =>
  Object.fromEntries(Object.entries((raw ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === 'boolean')) as Record<string, boolean>

// Only the policy goes through $.settings.read for the disk state: the CLI never changes it (Annex A, P-052)
async function policyEnabled($: $T): Promise<Record<string, boolean>> {
  const policy = await $.settings.read({ source: 'policy' }).catch(() => ({}))
  return booleansOf((policy as { enabledPlugins?: unknown }).enabledPlugins)
}


// What one install has on disk: plugin.json, then the files and folders its manifest points at
async function readPlugin($: $T, install: Install): Promise<PluginFiles> {
  const base = joinPath(install.installPath)
  if (!base || !(await $.fs.exists(base).catch(() => false))) return { exists: false, manifest: null, texts: {}, lists: {} }
  const manifest = await readText($, joinPath(base, '.claude-plugin/plugin.json'))
  const sources = sourcesOf(manifest)
  const texts: PluginFiles['texts'] = {}
  for (const f of filesOf(sources)) texts[f] = await readText($, joinPath(base, f))
  const lists: PluginFiles['lists'] = {}
  for (const d of foldersOf(sources)) lists[d] = await listDir($, joinPath(base, d))
  return { exists: true, manifest, texts, lists }
}

const cwdOf = async ($: $T) => root || await $.session.cwd()

async function readInventory($: $T): Promise<Inventory> {
  const home = await homeDir($)
  const cwd = await cwdOf($)
  const installedText = await readText($, joinPath(home, '.claude/plugins/installed_plugins.json'))
  const { installs } = parseInstalls(installedText)
  const settings: Record<string, string | null> = {}
  for (const f of settingsFilesOf(installs, home, cwd)) settings[f] = await readText($, f)
  const files: Record<string, PluginFiles> = {}
  for (const i of installs) files[joinPath(i.installPath)] = await readPlugin($, i)
  return buildInventory({ home, cwd, installedText, settings, policy: await policyEnabled($), files })
}

// The row "RelAI w tym projekcie" (ZASIEG_PLUGINU E3): the set's values in the session's folder
async function readScope($: $T): Promise<ScopeRow | null> {
  const home = await homeDir($)
  const cwd = await cwdOf($)
  const { installs } = parseInstalls(await readText($, joinPath(home, '.claude/plugins/installed_plugins.json')))
  const git = await $.fs.stat(joinPath(cwd, '.git')).catch(() => null)
  return scopeRowOf({
    home, cwd, installs,
    userText: await readText($, joinPath(home, '.claude/settings.json')),
    localText: await readText($, joinPath(cwd, '.claude/settings.local.json')),
    gitKind: git ? git.kind : null,
    worktreeText: await readText($, joinPath(cwd, '.worktreeinclude')),
  })
}

// ---------- the switch: one CLI call at a time ----------

const setError = ($: $T, key: string, text: string) =>
  update($, errors, (all) => {
    const { [key]: _gone, ...rest } = all
    return text ? { ...rest, [key]: text } : rest
  })

// One call: the row read again from disk, never a lock, the id from installed_plugins.json only (P-052);
// a row whose disk already holds what the press asked for is skipped (a switch from another chat, E4)
// One plugin of the row: the call, the pair on the CLI's "already" refusal (Annex A, P-058 pt 5),
// then the file read again — the effect, not the exit code, says it is done. '' or the error
async function runScopeCall($: $T, c: ScopeCall, file: string): Promise<string> {
  const run = (argv: string[]) => $.process.run(argv, { timeoutMs: CLI_TIMEOUT_MS, cwd: c.cwd })
  const valueOf = async () => enabledOf(await readText($, file))[c.id]
  const r = await run(c.argv)
  const outcome = outcomeOf(r, await valueOf(), c.want)
  if (outcome === 'error') return cliError(r)
  if (outcome === 'pair') {
    const first = await run(oppositeArgv(c))
    if (first.exitCode !== 0) return cliError(first)
    const second = await run(c.argv)
    if (second.exitCode !== 0) return `${cliError(second)} — w ${file} został ${c.id} = ${!c.want}`
  }
  const after = await valueOf()
  return after === c.want ? '' : `Odczyt ${file}: ${c.id} = ${after ?? 'brak wpisu'}, oczekiwano ${c.want}.`
}

// The row's press after "Tak": the folder read again, only the plugins not yet holding the value,
// the first error stops the rest; the line for worktrees last, as relai-scope does
async function runScope($: $T, want: boolean): Promise<void> {
  const row = await readScope($)
  if (!row) return await setError($, SCOPE_KEY, 'RelAI nie da się przełączyć w tym folderze.')
  const plan = scopePlan(CLI, row, want)
  for (const c of plan.calls) {
    const failed = await runScopeCall($, c, row.file)
    if (failed) return await setError($, SCOPE_KEY, failed)
  }
  if (plan.isWorktreeLine) {
    const path = joinPath(row.folder, '.worktreeinclude')
    try {
      // Read outside readText, which turns an unreadable file into "no file": a read error stops
      // the write, so a file that is there is never replaced by the one line (review E3)
      const was = (await $.fs.exists(path)) ? await $.fs.read(path) : null
      await $.fs.write(path, withWorktreeLine(was))
    } catch (err) {
      return await setError($, SCOPE_KEY, `Pluginy włączone, ale nie dopisano linii do ${path}: ${errorText(err).split(/\r?\n/)[0]}`)
    }
  }
  await setError($, SCOPE_KEY, '')
}

async function runOne($: $T, key: string): Promise<void> {
  try {
    if (key === SCOPE_KEY) return await runScope($, (await read($, wants))[key] ?? true)
    const row = (await readInventory($)).items.find((i) => itemKey(i) === key)
    if (!row || row.kind === 'hook' || lockOf(row)) return await setError($, key, 'Tej pozycji nie da się przełączyć z panelu.')
    const want = (await read($, wants))[key]
    if (want !== undefined && isSettled(row, want)) return await setError($, key, '')
    const call = flipCall(CLI, row)
    const r = await $.process.run(call.argv, { timeoutMs: CLI_TIMEOUT_MS, ...(call.cwd ? { cwd: call.cwd } : {}) })
    await setError($, key, r.exitCode === 0 ? '' : cliError(r))
  } catch (err) {
    // $.process.run rejects when the command cannot start or runs past the limit
    await setError($, key, `Błąd CLI (bez kodu, limit ${CLI_TIMEOUT_MS / 1000} s): ${errorText(err).split(/\r?\n/)[0]}`).catch(() => undefined)
  }
}

// The press joins the queue; whoever finds no call running takes the next one, so the queue in
// $.state alone keeps one call at a time — no flag of the module's, which a press handler may not share
async function press($: $T, key: string, want: boolean): Promise<void> {
  await update($, wants, (all) => ({ ...all, [key]: want }))
  await update($, queue, (q) => enqueue(q, key))
  for (;;) {
    let next = ''
    await update($, queue, (q) => {
      const r = startNext(q)
      next = r.key
      return r.queue
    })
    if (!next) return
    const taken = next
    try {
      await runOne($, taken)
    } finally {
      await update($, queue, (q) => finish(q, taken)).catch(() => undefined)
    }
  }
}

// Measured 2026-10-23 (E1, e; P-052): in the desktop app $.command.run resolves, not rejects, with
// "/reload-plugins isn't available over a remote connection in this session", and
// $.prompt.submit refuses a text starting with "/" — so the answer's text decides, and plan B is
// the person typing /reload-plugins
const REFUSED = /isn't available|not available/i
const TYPE_IT = 'Wpisz /reload-plugins — aplikacja nie przeładowuje pluginów z panelu.'

async function reloadPlugins($: $T): Promise<void> {
  try {
    const r = await $.command.run({ command: 'reload-plugins' })
    const text = String((r as { text?: unknown }).text ?? '')
    await update($, note, () => (REFUSED.test(text) ? TYPE_IT : `Przeładowano z panelu: ${text || 'bez odpowiedzi'}`))
  } catch (err) {
    await update($, note, () => `${TYPE_IT} (${errorText(err)})`)
  }
}

// The CLI's version for the details (R1), asked once per module at session.start and never
// awaited: a state write made from a draw is refused by the host ("drawing is pure")
function askCliVersion($: $T): void {
  if (isCliAsked) return
  isCliAsked = true
  void $.process.run([CLI, '--version'], { timeoutMs: CLI_TIMEOUT_MS })
    .then((r) => update($, cli, () => r.stdout.split(/\r?\n/)[0]?.trim() || `kod ${r.exitCode ?? 'brak'}`))
    .catch((err) => update($, cli, () => `nie uruchomiono: ${errorText(err).split(/\r?\n/)[0]}`))
    .catch(() => undefined)
}

const isPaneUp = async ($: $T) => (await $.ui.panes().catch(() => [])).some((p) => p.id === PANE_ID)

function stopRefresh(): void {
  refresher?.cancel()
  refresher = null
}

// While the pane is open its drawing reads the disk again every REFRESH_MS: a write of `tick` redraws
// it. Started outside the drawing, which may not write (P-053); stopped when the pane closes, and by
// itself at the first tick that finds the pane gone
function startRefresh($: $T): void {
  if (refresher) return
  refresher = $.clock.every(REFRESH_MS, () => {
    void (async () => {
      if (!(await isPaneUp($))) return stopRefresh()
      await update($, tick, (n) => n + 1)
    })().catch(() => undefined)
  })
}

async function togglePane($: $T): Promise<string> {
  if (await isPaneUp($)) {
    await $.ui.close({ id: PANE_ID })
    stopRefresh()
    return 'Panel RelAI Mods zamknięty.'
  }
  const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
  startRefresh($)
  return opened.isPlaced ? 'Panel RelAI Mods otwarty.' : `Panel RelAI Mods czeka na miejsce: ${opened.reason}`
}

// The disk as this chat loads it: at session.start and at each plugin.register of a reload.
// Never awaited: until it lands, N is 0 (no loaded state to differ from)
function takeSnapshot($: $T): void {
  void (async () => {
    const [inv, cwd, scope] = await Promise.all([readInventory($), cwdOf($), readScope($)])
    const set = Object.fromEntries((scope?.plugins ?? []).map((p) => [scopeKey(p.id), p.isOn]))
    await update($, loaded, () => ({ ...snapshotOf(inv.items, cwd), ...set }))
    await update($, note, () => '')
  })().catch(() => undefined)
}

export const register: Register = (on) => {
  // The sign of a reload. /reload-plugins raises session.start only in modules it loads anew (a
  // mod just enabled), never in this unchanged one, but plugin.register for every other hooks
  // module each time: a probe saw relai-panel, relai-progress and relai-cache-keeper at both of two
  // typed reloads, session.start once (E3, live 2026-10-23). So the loaded state is taken again
  // here. An observer only: every module is let through
  on('plugin.register', ($, e, next) => {
    takeSnapshot($)
    return next(e)
  }).catch(($, e, next) => next(e)) // an observer never refuses a module, not even when it fails

  on('session.start', async ($, e, next) => {
    root = await $.session.cwd()
    await update($, queue, () => EMPTY_QUEUE)
    await update($, ask, () => '')
    askCliVersion($)
    takeSnapshot($)
    await $.command.register({ name: 'relai-mods', description: 'RelAI Mods: mody, pluginy i hooki z dysku — przełączanie, szczegóły i przeładowanie' }).catch(() => undefined)
    // A pane that stayed open through a reload of this module gets its refresh again
    if (await isPaneUp($)) startRefresh($)
    return next(e)
  })

  // The person's close mark, too: the timer stops with the pane
  on('ui.close', async ($, e, next) => {
    if (e.id === PANE_ID) stopRefresh()
    return next(e)
  })

  on('command.run', { command: 'relai-mods' }, async ($) => {
    if (!root) root = await $.session.cwd()
    return { text: await togglePane($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const el = $.ui.resolve(e)
    const inv = await readInventory($)
    if (e.surface === 'mobile') return mobileList(el, inv)
    // Drawings only where the surface draws them, decided by the surface (as relai-panel does)
    const Svg = ((e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null) as SvgTag
    // tick is read only so its write redraws the pane, which reads the disk again (the refresh)
    const [q, f, sel, qu, errs, said, version, cwd, was, asked, scope] = await Promise.all([
      read($, query), read($, filterAtom), read($, selected), read($, queue), read($, errors), read($, note), read($, cli),
      cwdOf($), read($, loaded), read($, ask), readScope($), read($, tick),
    ])
    const filter = isFilter(f) ? f : 'all'
    const shown = visible(inv.items, filter, q)
    const pending = pendingCount(inv.items, was, scope)
    const base: View = {
      el, Svg, isFull: Svg !== null, width: e.props.bodyColumns, inv, shown, filter, query: q, queue: qu, errors: errs, pending,
      cli: version, cliName: CLI, cwd, note: said,
      scope, ask: asked === 'on' || asked === 'off' ? asked : '',
      // The row's button only opens the card; "Tak" runs it through the queue, "Nie" folds it
      onAsk: (want) => { void update($, ask, () => (want ? 'on' : 'off')) },
      onDecide: (isYes, want) => {
        void (async () => {
          await update($, ask, () => '')
          if (isYes) await press($, SCOPE_KEY, want)
        })().catch(() => undefined)
      },
      // The accordion opens only what was picked; a second press folds it again
      chosen: shown.find((i) => itemKey(i) === sel),
      onPress: (key, want) => { void press($, key, want).catch(() => undefined) },
      onPick: (key) => { void update($, selected, (was) => (was === key ? '' : key)) },
      onFilter: (next) => { void update($, filterAtom, () => next) },
      onQuery: (next) => { void update($, query, () => next) },
      onReload: () => { void reloadPlugins($).catch(() => undefined) },
    }
    const full = cockpit(base)
    // Past the budget the rows lose their drawings, the details keep theirs (R7, P-023 pkt 7)
    return base.isFull && treeWeight(full) > DRAW_LIMIT ? cockpit({ ...base, isFull: false }) : full
  })
}
