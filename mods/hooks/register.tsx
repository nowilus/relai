// relai-mods: the plugins installed for this machine and a switch for them, beside the chat
// (plan RELAI_MODS). Spike build of E1: the bare list from installed_plugins.json, one switch for
// filetree through `claude plugin disable/enable`, one Reload — and the spike's probe
// (`/relai-mods pomiar`), which goes away with E2. The pane never writes settings.json or
// installed_plugins.json: the CLI does (brief, Łukasz's decisions). Pure logic in ./inventory.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import { STATE_WORD, cliError, enabledOf, listBlock, median, parseInstalled, toggleArgv } from './inventory'
import type { CliResult, PluginRow } from './inventory'

type $T = EngineInterface

const PANE_ID = 'relai-mods'
const PANE_TITLE = 'RelAI Mods'
const TARGET = 'filetree@claude-code-filetree' // the spike's one switch (plan, E1)
const CLI = 'claude'
const CLI_TIMEOUT_MS = 60_000
const PROBE_TIMEOUT_MS = 20_000
const PERSIST_WAIT_MS = 60_000 // (c): the CLI's write read again after a minute of the running app
const PROBE_FILE = '.claude/relai/work/RELAI_MODS/E1/probe.json' // spike only, gone with E2
// Theme keys only (P-042, P-044); the core's KEY comes with the sync in E5
const KEY = { text: 'text', muted: 'inactive', done: 'success', failed: 'error' } as const

const busy = atom({ plugin: 'relai-mods', key: 'busy' } as const, false)
const note = atom({ plugin: 'relai-mods', key: 'note' } as const, '')

// The module's own; a reload starts it over and session.start sets it again
let root = ''

async function readText($: $T, path: string): Promise<string | null> {
  try {
    return (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    return null
  }
}

// The home folder from the environment, never from $.plugin.root (plan, section 5)
async function homeDir($: $T): Promise<string> {
  return (await $.env.get('USERPROFILE').catch(() => '')) || (await $.env.get('HOME').catch(() => '')) || ''
}

async function userSettingsPath($: $T): Promise<string> {
  return `${await homeDir($)}/.claude/settings.json`
}

async function readRows($: $T): Promise<PluginRow[]> {
  const home = await homeDir($)
  const installed = await readText($, `${home}/.claude/plugins/installed_plugins.json`)
  return parseInstalled(installed, enabledOf(await readText($, `${home}/.claude/settings.json`)))
}

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err))

async function runCli($: $T, argv: string[], cwd?: string): Promise<CliResult & { ms: number }> {
  const t0 = await $.clock.now()
  const r = await $.process.run(argv, { timeoutMs: CLI_TIMEOUT_MS, ...(cwd ? { cwd } : {}) })
  return { exitCode: r.exitCode, stdout: r.stdout, stderr: r.stderr, ms: (await $.clock.now()) - t0 }
}

// One CLI call at a time (plan, section 8: a press during a call waits for none, it is ignored)
async function flip($: $T, row: Pick<PluginRow, 'id' | 'scope' | 'state'>): Promise<void> {
  if (await read($, busy)) return
  await update($, busy, () => true)
  try {
    const r = await runCli($, toggleArgv(CLI, row))
    const verb = row.state === 'on' ? 'Wyłączony' : 'Włączony'
    await update($, note, () => (r.exitCode === 0 ? `${verb}: ${row.id} (${r.ms} ms). Przeładuj, żeby zadziałało.` : cliError(r)))
  } catch (err) {
    await update($, note, () => `Nie uruchomiono CLI: ${errorText(err)}`)
  } finally {
    await update($, busy, () => false)
  }
}

async function toggleTarget($: $T): Promise<void> {
  const row = (await readRows($)).find((r) => r.id === TARGET)
  if (!row) return update($, note, () => `Brak ${TARGET} w installed_plugins.json.`)
  return flip($, row)
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

async function togglePane($: $T): Promise<string> {
  if ((await $.ui.panes()).some((p) => p.id === PANE_ID)) {
    await $.ui.close({ id: PANE_ID })
    return 'Panel RelAI Mods zamknięty.'
  }
  const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
  return opened.isPlaced ? 'Panel RelAI Mods otwarty.' : `Panel RelAI Mods czeka na miejsce: ${opened.reason}`
}

// ---------- the spike's probe (E1, measurements a–d and f); gone with E2 ----------

async function tryRun($: $T, argv: string[], cwd?: string): Promise<Record<string, unknown>> {
  const t0 = await $.clock.now()
  try {
    const r = await $.process.run(argv, { timeoutMs: PROBE_TIMEOUT_MS, ...(cwd ? { cwd } : {}) })
    const ms = (await $.clock.now()) - t0
    return { argv, cwd: cwd ?? null, exitCode: r.exitCode, ms, stdout: r.stdout.slice(0, 4000), stderr: r.stderr.slice(0, 600) }
  } catch (err) {
    return { argv, cwd: cwd ?? null, error: errorText(err), ms: (await $.clock.now()) - t0 }
  }
}

const sleep = ($: $T, ms: number) => new Promise<void>((resolve) => { $.clock.after(ms, () => resolve()) })

async function persisted($: $T): Promise<Record<string, unknown>> {
  const disk = enabledOf(await readText($, await userSettingsPath($)))[TARGET] ?? null
  const user = await $.settings.read({ source: 'user' }).catch((err: unknown) => ({ error: errorText(err) }))
  const viaRead = (user as { enabledPlugins?: Record<string, unknown> }).enabledPlugins?.[TARGET] ?? null
  return { at: await $.clock.now(), disk, settingsRead: viaRead }
}

async function probe($: $T): Promise<string> {
  const out: Record<string, unknown> = { at: new Date(await $.clock.now()).toISOString(), version: await $.session.version().catch(() => null) }
  const exec = await $.env.get('CLAUDE_CODE_EXECPATH').catch(() => '')
  // (a) which claude the argv resolves
  out.a = await Promise.all(['claude', 'claude.exe', 'claude.cmd', ...(exec ? [exec] : [])].map((c) => tryRun($, [c, '--version'])))
  // (b) without the app's login: what auth status says, then three flips each way, timed
  out.auth = await tryRun($, [CLI, 'auth', 'status'])
  // (d) cwd, and (f) what plugin list says of a local-scope plugin from here and from its project
  const local = (await readRows($)).find((r) => r.scope === 'local' && r.projectPath)
  const dirs = [root, ...(local ? [local.projectPath] : [])]
  out.d = await Promise.all(dirs.map((dir) => tryRun($, ['cmd', '/c', 'cd'], dir)))
  out.f = await Promise.all(dirs.map(async (dir) => {
    const r = await tryRun($, [CLI, 'plugin', 'list'], dir)
    return { cwd: dir, id: local?.id ?? null, exitCode: r.exitCode ?? null, block: local ? listBlock(String(r.stdout ?? ''), local.id) : '' }
  }))
  // (c) the first enable, read at once and after a minute of the running app; then (b)'s timings
  const enable = await runCli($, toggleArgv(CLI, { id: TARGET, scope: 'user', state: 'off' }))
  const c: Record<string, unknown> = { enable: { exitCode: enable.exitCode, ms: enable.ms, err: enable.exitCode ? cliError(enable) : '' }, now: await persisted($) }
  await sleep($, PERSIST_WAIT_MS)
  c.later = await persisted($)
  const disable = await runCli($, toggleArgv(CLI, { id: TARGET, scope: 'user', state: 'on' }))
  c.disable = { exitCode: disable.exitCode, ms: disable.ms }
  c.after = await persisted($)
  out.c = c
  const timings: { enable: number[], disable: number[], codes: (number | null)[] } = { enable: [enable.ms], disable: [disable.ms], codes: [enable.exitCode, disable.exitCode] }
  for (let i = 0; i < 2; i += 1) {
    const on = await runCli($, toggleArgv(CLI, { id: TARGET, scope: 'user', state: 'off' }))
    const off = await runCli($, toggleArgv(CLI, { id: TARGET, scope: 'user', state: 'on' }))
    timings.enable.push(on.ms)
    timings.disable.push(off.ms)
    timings.codes.push(on.exitCode, off.exitCode)
  }
  out.b = { ...timings, medianEnable: median(timings.enable), medianDisable: median(timings.disable), final: await persisted($) }
  await $.fs.write(`${root}/${PROBE_FILE}`, JSON.stringify(out, null, 2))
  return `Pomiar zapisany: ${PROBE_FILE} (mediana włączenia ${median(timings.enable)} ms, wyłączenia ${median(timings.disable)} ms).`
}

async function startProbe($: $T): Promise<string> {
  if (await read($, busy)) return 'Trwa inne wywołanie CLI — spróbuj za chwilę.'
  await update($, busy, () => true)
  await update($, note, () => 'Pomiar trwa (ok. 1,5 min)…')
  // The probe outlives the command's answer: the turn never waits on it
  $.clock.after(0, () => {
    probe($)
      .then((text) => update($, note, () => text))
      .catch((err: unknown) => update($, note, () => `Pomiar przerwany: ${errorText(err)}`))
      .finally(() => update($, busy, () => false).catch(() => undefined))
  })
  return 'Pomiar ruszył; wynik pojawi się w panelu.'
}

// ---------- the pane ----------

const stateKey = (r: PluginRow) => (r.state === 'on' ? KEY.done : KEY.muted)

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    root = await $.session.cwd()
    await $.command.register({ name: 'relai-mods', description: 'RelAI Mods: zainstalowane pluginy z dysku, ich zakres i stan' }).catch(() => undefined)
    return next(e)
  })

  on('command.run', { command: 'relai-mods' }, async ($, e) => {
    if (!root) root = await $.session.cwd()
    const arg = e.args.trim()
    if (arg === 'pomiar') return { text: await startProbe($) }
    // Punkt 5 Weryfikacji: an id the CLI refuses, through the same path as the switch. Not
    // "x@unknown": `plugin enable` takes any plugin@marketplace with exit 0 and writes it (P-052)
    if (arg === 'blad') {
      await flip($, { id: 'nie-ma-takiego', scope: 'user', state: 'off' })
      return { text: await read($, note) }
    }
    return { text: await togglePane($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const rows = await readRows($)
    const target = rows.find((r) => r.id === TARGET)
    const isBusy = await read($, busy)
    const said = await read($, note)
    const hasFiletree = (await $.command.list().catch(() => [])).some((c) => c.name === 'filetree')
    return (
      <Box flexDirection="column">
        <Box key="head"><Text bold color={KEY.text}>{`Pluginy z installed_plugins.json · ${rows.length}`}</Text></Box>
        {rows.map((r) => (
          <Box key={`row-${r.id}-${r.scope}`} flexDirection="row" columnGap={1}>
            <Box key="id"><Text color={KEY.text}>{r.id}</Text></Box>
            <Box key="meta"><Text color={stateKey(r)}>{`${r.scope} · ${r.version || 'bez wersji'} · ${STATE_WORD[r.state]}`}</Text></Box>
          </Box>
        ))}
        <Box key="actions" flexDirection="row" columnGap={1} marginTop={1}>
          {target
            ? <Button key="flip" variant="secondary" label={isBusy ? 'Czekam na CLI…' : target.state === 'on' ? 'Wyłącz filetree' : 'Włącz filetree'} onPress={() => toggleTarget($).catch(() => undefined)} />
            : null}
          <Button key="reload" variant="secondary" label="Przeładuj" onPress={() => reloadPlugins($).catch(() => undefined)} />
        </Box>
        <Box key="loaded"><Text color={KEY.muted}>{`Komenda /filetree w tej sesji: ${hasFiletree ? 'jest' : 'nie ma'}`}</Text></Box>
        {said ? <Box key="note"><Text color={said.startsWith('Błąd') || said.startsWith('Nie ') ? KEY.failed : KEY.text}>{said}</Text></Box> : null}
      </Box>
    )
  })
}
