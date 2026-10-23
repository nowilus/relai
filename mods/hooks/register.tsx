// relai-mods: what is installed on this machine and what fires in it, beside the chat (plan
// RELAI_MODS). E2: the full list from disk — mods, plugins and the user's own hooks, with scope,
// version, state and a line of counts or events. The switch for filetree and Reload stay as E1 left
// them; E3 puts a switch in every row. The pane never writes settings.json or
// installed_plugins.json: the CLI does (brief, Łukasz's decisions). Pure logic in ./inventory.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import {
  STATE_WORD, buildInventory, cliError, filesOf, foldersOf, headerOf, joinPath, parseInstalls,
  settingsFilesOf, sourcesOf, summaryOf, toggleArgv,
} from './inventory'
import type { CliResult, DirEntry, Install, Inventory, Item, PluginFiles, PluginState } from './inventory'

type $T = EngineInterface

const PANE_ID = 'relai-mods'
const PANE_TITLE = 'RelAI Mods'
const TARGET = 'filetree@claude-code-filetree' // E1's one switch, until E3 puts one in every row
const CLI = 'claude'
const CLI_TIMEOUT_MS = 60_000
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

// Only the policy goes through $.settings.read: the CLI never changes it (Annex A, P-052)
async function policyEnabled($: $T): Promise<Record<string, boolean>> {
  const policy = await $.settings.read({ source: 'policy' }).catch(() => ({}))
  const raw = (policy as { enabledPlugins?: Record<string, unknown> }).enabledPlugins ?? {}
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'boolean')) as Record<string, boolean>
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

async function readInventory($: $T): Promise<Inventory> {
  const home = await homeDir($)
  const cwd = root || await $.session.cwd()
  const installedText = await readText($, joinPath(home, '.claude/plugins/installed_plugins.json'))
  const { installs } = parseInstalls(installedText)
  const settings: Record<string, string | null> = {}
  for (const f of settingsFilesOf(installs, home, cwd)) settings[f] = await readText($, f)
  const files: Record<string, PluginFiles> = {}
  for (const i of installs) files[joinPath(i.installPath)] = await readPlugin($, i)
  return buildInventory({ home, cwd, installedText, settings, policy: await policyEnabled($), files })
}

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err))

async function runCli($: $T, argv: string[], cwd?: string): Promise<CliResult & { ms: number }> {
  const t0 = await $.clock.now()
  const r = await $.process.run(argv, { timeoutMs: CLI_TIMEOUT_MS, ...(cwd ? { cwd } : {}) })
  return { exitCode: r.exitCode, stdout: r.stdout, stderr: r.stderr, ms: (await $.clock.now()) - t0 }
}

// One CLI call at a time (plan, section 8: a press during a call waits for none, it is ignored)
async function flip($: $T, row: { id: string, scope: string, state: PluginState }): Promise<void> {
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
  const row = (await readInventory($)).items.find((r) => r.kind !== 'hook' && r.id === TARGET)
  if (!row || row.kind === 'hook') return update($, note, () => `Brak ${TARGET} w installed_plugins.json.`)
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

// ---------- the pane ----------

const keyOf = (i: Item) => (i.kind === 'hook' ? `hook-${i.event}-${i.script}-${i.command}` : `${i.kind}-${i.id}-${i.scope}`)

// The row's two lines: what it is and its state; then its counts or events, and its notes
function rowText(i: Item): { title: string, meta: string, detail: string, isOn: boolean } {
  if (i.kind === 'hook') {
    return {
      title: i.event,
      meta: 'user · tylko podgląd',
      detail: [i.script || i.command, i.matcher ? `matcher: ${i.matcher}` : ''].filter(Boolean).join(' · '),
      isOn: true,
    }
  }
  return {
    title: i.id,
    meta: `${i.scope} · ${i.version || 'bez wersji'} · ${STATE_WORD[i.state]}`,
    detail: [summaryOf(i), ...i.notes].join(' · '),
    isOn: i.state === 'on',
  }
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    root = await $.session.cwd()
    await $.command.register({ name: 'relai-mods', description: 'RelAI Mods: mody, pluginy i hooki z dysku — zakres, wersja, stan i zawartość' }).catch(() => undefined)
    return next(e)
  })

  on('command.run', { command: 'relai-mods' }, async ($) => {
    if (!root) root = await $.session.cwd()
    return { text: await togglePane($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const inv = await readInventory($)
    const target = inv.items.find((r) => r.kind !== 'hook' && r.id === TARGET)
    const isBusy = await read($, busy)
    const said = await read($, note)
    return (
      <Box flexDirection="column">
        <Box key="head"><Text bold color={KEY.text}>{headerOf(inv)}</Text></Box>
        {inv.problem ? <Box key="problem"><Text color={KEY.failed}>{inv.problem}</Text></Box> : null}
        {inv.items.map((i) => {
          const t = rowText(i)
          return (
            <Box key={keyOf(i)} flexDirection="column" marginTop={1}>
              <Box key="top" flexDirection="row" columnGap={1}>
                <Box key="kind" flexShrink={0}><Text color={KEY.muted}>{i.kind}</Text></Box>
                <Box key="title" width={0} flexGrow={1}><Text color={t.isOn ? KEY.text : KEY.muted} wrap="truncate-end">{t.title}</Text></Box>
                <Box key="meta" flexShrink={0}><Text color={t.isOn ? KEY.done : KEY.muted}>{t.meta}</Text></Box>
              </Box>
              <Box key="detail"><Text color={KEY.muted}>{t.detail}</Text></Box>
            </Box>
          )
        })}
        <Box key="actions" flexDirection="row" columnGap={1} marginTop={1}>
          {target && target.kind !== 'hook'
            ? <Button key="flip" variant="secondary" label={isBusy ? 'Czekam na CLI…' : target.state === 'on' ? 'Wyłącz filetree' : 'Włącz filetree'} onPress={() => toggleTarget($).catch(() => undefined)} />
            : null}
          <Button key="reload" variant="secondary" label="Przeładuj" onPress={() => reloadPlugins($).catch(() => undefined)} />
        </Box>
        {said ? <Box key="note"><Text color={said.startsWith('Błąd') || said.startsWith('Nie ') ? KEY.failed : KEY.text}>{said}</Text></Box> : null}
      </Box>
    )
  })
}
