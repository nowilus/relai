// relai-browser 0.1.0 — shrinks pictures in tool results before Claude reads them (plan
// MODY_OSZCZEDZANIA, E1; spec, section 3). This module holds only $ and on (rule 13); the logic
// lives in shrink.ts, resize.ts, state.ts and the core copies in ./core (sync-panel-core.js).

import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { BrowserShrink } from '../types'
import { consentRow, hasMarker, isHumanOrigin, isTwinActive, readConsent, settingsCandidates, withConsentRow } from './core/savings-gates.mjs'
import { createQueue, ledgerFile } from './core/savings-ledger.mjs'
import { imageTokens, isUnreadable, outFormat, picturesOf, readSettings, replacePictures, rewriteCoordinates, skipReason, statedSize } from './shrink'
import type { Replacement } from './shrink'
import { LIMIT_MS, parseResize, platformOf, resizeArgv, resizeEnv } from './resize'
import type { Platform } from './resize'
import { CONSENT_NO_LABEL, CONSENT_QUESTION, CONSENT_YES_LABEL, decide, parseCommand } from './state'
import type { Gate } from './state'

const MOD = 'relai-browser'
const PANE = 'relai-browser'
const STORE_KEY = 'settings'
const shrinks = atom({ plugin: 'relai-browser', key: 'shrinks' } as const, [] as BrowserShrink[], { shape: 'shrinks-1' })
const idle = atom({ plugin: 'relai-browser', key: 'idle' } as const, '', { shape: 'idle-1' })

// Session facts, set at session.start; a reload runs it again
let cwd = ''
let claudeDir = ''
let session = 'unknown'
let platform: Platform = 'other'
let gate: Gate = { isTwinActive: false, projectRoot: null, consent: null, hasHuman: false, hasTool: false }
let isFullNext = false
let toldIdle = ''
let queue: ReturnType<typeof createQueue> | null = null

async function readOr($: any, path: string): Promise<string | null> {
  try { return await $.fs.read(path) } catch { return null }
}

/** ~/.claude from the cwd's drive and the user folder is not given to mods: take it from HOME-like env of a process. */
async function findClaudeDir($: any): Promise<string> {
  const argv = platform === 'windows' ? ['cmd.exe', '/d', '/c', 'echo %USERPROFILE%'] : ['/bin/sh', '-c', 'printf %s "$HOME"']
  try {
    const r = await $.process.run(argv, { timeoutMs: 5000 })
    const home = String(r.stdout || '').trim()
    return home ? `${home.replace(/[\\/]+$/, '')}/.claude` : ''
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
  gate = { ...gate, projectRoot, consent, isTwinActive: isTwinActive(MOD, settings, switches), hasTool: resizeArgv(platform) !== null }
}

async function tellIdleOnce($: any, why: string): Promise<void> {
  await update($, idle, () => why)
  if (toldIdle === why) return
  toldIdle = why
  $.ui.toast(`relai-browser ${why}`)
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

async function remember($: any, row: BrowserShrink): Promise<void> {
  await update($, shrinks, (list) => [...list, row].slice(-50))
}

async function record($: any, e: any, part: number, row: BrowserShrink): Promise<void> {
  if (!claudeDir || row.outcome !== 'shrunk') return
  const ts = new Date().toISOString()
  if (!queue) queue = createQueue({ read: (p: string) => $.fs.read(p), write: (p: string, t: string) => $.fs.write(p, t) }, ledgerFile(claudeDir, ts, session))
  try {
    await queue.push({ ts, session, tool_use_id: e.tool_use_id, mod: MOD, part: String(part), tool: e.tool, action: 'shrink', before: row.before, after: row.after, measured: false, detail: `${row.w}x${row.h} -> ${row.nw}x${row.nh}` })
  } catch (err) {
    $.ui.log(`relai-browser: ledger write failed: ${String(err)}`)
  }
}

async function shrinkOne($: any, data: string, mime: string): Promise<ReturnType<typeof parseResize>> {
  const argv = resizeArgv(platform)
  if (!argv) return null
  const s = readSettings(await $.store.get(STORE_KEY))
  const r = await $.process.run(argv, { stdin: data, env: resizeEnv(s.scale, s.min, outFormat(mime)), timeoutMs: platform === 'mac' ? LIMIT_MS.mac : LIMIT_MS.windows })
  return r.exitCode === 0 ? parseResize(r.stdout) : null
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    cwd = e.cwd
    platform = platformOf(cwd)
    claudeDir = await findClaudeDir($)
    try { session = await $.session.id() } catch { session = 'unknown' }
    queue = null
    await loadGate($)
    await $.command.register({ name: 'relai-browser', description: 'RelAI Browser: full lets the next picture through whole; scale 0.5, min 512, pane' })
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (isHumanOrigin((e as any).origin)) gate = { ...gate, hasHuman: true }
    return next(e)
  })

  on('command.run', { command: 'relai-browser' }, async ($, e) => {
    if (isHumanOrigin((e as any).origin)) gate = { ...gate, hasHuman: true }
    const c = parseCommand(e.args)
    const s = readSettings(await $.store.get(STORE_KEY))
    if (c.kind === 'full') { isFullNext = true; return { text: 'relai-browser: the next picture goes through whole.' } }
    if (c.kind === 'scale' || c.kind === 'min') {
      const next = readSettings({ ...s, [c.kind]: c.value })
      await $.store.set(STORE_KEY, next)
      return { text: `relai-browser: scale ${next.scale}, never under ${next.min} px.` }
    }
    if (c.kind === 'pane') { await $.ui.open({ id: PANE, title: 'RelAI Browser' }); return { text: 'relai-browser: list opened.' } }
    if (c.kind === 'bad') return { text: c.text }
    const list = await read($, shrinks)
    const why = decide(gate)
    const state = why.kind === 'idle' ? why.why : why.kind === 'ask' ? 'asks at the next picture' : 'on'
    return { text: `relai-browser: ${state}; scale ${s.scale}, min ${s.min} px; ${list.length} pictures this chat.` }
  })

  on('tool.call', async ($, e, next) => {
    const ran: any = await next(e)
    const pics = picturesOf(ran?.result)
    if (!pics.length) return ran
    if (skipReason(e.tool, e as any)) return ran
    if (isFullNext) {
      isFullNext = false
      const size = statedSize(ran.result)
      await remember($, { tool: e.tool, w: size?.w ?? 0, h: size?.h ?? 0, nw: size?.w ?? 0, nh: size?.h ?? 0, before: 0, after: 0, outcome: 'full' })
      return ran
    }
    let d = decide(gate)
    if (d.kind === 'ask') { await askConsent($); d = decide(gate) }
    if (d.kind === 'idle') { await tellIdleOnce($, d.why); return ran }
    await update($, idle, () => '')

    const repl: Replacement[] = []
    let result = ran.result
    let note: string | null = null
    for (let i = 0; i < pics.length; i++) {
      const p = pics[i]
      if (isUnreadable(p.mime)) { repl.push(null); await remember($, { tool: e.tool, w: 0, h: 0, nw: 0, nh: 0, before: 0, after: 0, outcome: 'webp' }); continue }
      let out: ReturnType<typeof parseResize> = null
      try { out = await shrinkOne($, p.data, p.mime) } catch (err) { $.ui.log(`relai-browser: shrink failed: ${String(err)}`) }
      if (!out) { repl.push(null); await remember($, { tool: e.tool, w: 0, h: 0, nw: 0, nh: 0, before: 0, after: 0, outcome: 'failed' }); continue }
      if (out.kind === 'same') {
        repl.push(null)
        const t = imageTokens(out.w, out.h)
        await remember($, { tool: e.tool, w: out.w, h: out.h, nw: out.w, nh: out.h, before: t, after: t, outcome: 'same' })
        continue
      }
      repl.push({ data: out.data, mime: `image/${outFormat(p.mime)}`, w: out.nw, h: out.nh })
      const row: BrowserShrink = { tool: e.tool, w: out.w, h: out.h, nw: out.nw, nh: out.nh, before: imageTokens(out.w, out.h), after: imageTokens(out.nw, out.nh), outcome: 'shrunk' }
      await remember($, row)
      await record($, e, i, row)
      if (pics.length === 1) {
        const co = rewriteCoordinates(result, out.w, out.h, out.nw, out.nh)
        result = co.result
        note = co.note
      }
    }
    result = replacePictures(result, repl)
    if (note && Array.isArray(result)) result = [...result, { type: 'text', text: note }]
    return { ...ran, result }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, shrinks)
    const why = await read($, idle)
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 5)
    const saved = list.reduce((n, r) => n + (r.before - r.after), 0)
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color="text" bold>RelAI Browser</Text>
        <Text color="inactive">{list.length} pictures · ~{saved} tokens saved (estimate)</Text>
        {why !== '' && <Text color="warning">● {why}</Text>}
        {list.length === 0 && <Text color="inactive">No pictures yet.</Text>}
        {list.slice(-room).map((r) => (
          <Text color={r.outcome === 'shrunk' ? 'text' : 'inactive'}>
            {r.outcome === 'shrunk' ? '✓' : '·'} {r.outcome} {r.w}x{r.h}{r.outcome === 'shrunk' ? ` → ${r.nw}x${r.nh} · ${r.before} → ${r.after} tok` : ''}
          </Text>
        ))}
      </Box>
    )
  })
}
