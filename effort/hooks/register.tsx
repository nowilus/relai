import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import { consentRow, hasMarker, isHumanOrigin, isTwinActive, readConsent, settingsCandidates, withConsentRow } from './core/savings-gates.mjs'
import { scanText } from './core/secret-scan.mjs'
import { createLedgerQueue } from './ledger'
import { decision, judgeModel, judgeModelId, judgeRequest, parseVerdict, stageEffort, usageOf } from './judge'
import type { Level } from './judge'

const MOD = 'relai-effort'
const autoState = atom({ plugin: 'relai-effort', key: 'auto' } as const, false, { shape: 'auto-1' })
const onState = atom({ plugin: 'relai-effort', key: 'on' } as const, true, { shape: 'on-1' })
const statusState = atom({ plugin: 'relai-effort', key: 'status' } as const, 'No suggestion yet', { shape: 'status-1' })
const ON = 'Switch'
const AUTO = 'Switch and enable auto'
const KEEP = 'Keep current'
let cwd = '', claudeDir = '', root = '', session = 'unknown', previous = '', baseline = 'unknown', applied = 'unknown', judge = 'sonnet', judgeId = 'sonnet'
let enabled = true, auto = false, consent: 'yes' | 'no' | null = null, twin = false
let selected: { level: Level, serial: number, turnId: string | null } | null = null, sequence = 0
let queue: ReturnType<typeof createLedgerQueue> | null = null
let toldTwin = false

function invalidate() { selected = null; sequence++ }
function live(serial: number) { return enabled && serial === sequence }

async function readOr($: any, path: string): Promise<string | null> {
  try { return await $.fs.read(path) } catch { return null }
}
async function fail($: any, reason: string) {
  await update($, statusState, () => reason)
  if (claudeDir) try { await $.fs.write(`${claudeDir}/relai/oszczednosci/effort/ostatni-blad.txt`, `${new Date().toISOString()} ${reason}\n`) } catch { $.ui.log(`relai-effort: ${reason}`) }
}
async function load($: any) {
  root = ''
  consent = null
  for (const c of settingsCandidates(cwd)) {
    const t = await readOr($, c.file)
    if (t !== null && hasMarker(t)) { root = c.root; consent = readConsent(t); break }
  }
  if (consent === 'no') { await update($, statusState, () => 'passive: the project said no'); return }
  if (!claudeDir) { await update($, statusState, () => 'passive: user home unavailable; BenAI twin state unknown'); return }
  const settings = [claudeDir ? await readOr($, `${claudeDir}/settings.json`) : null, root ? await readOr($, `${root}/.claude/settings.json`) : null, root ? await readOr($, `${root}/.claude/settings.local.json`) : null]
  twin = isTwinActive(MOD, settings, claudeDir ? await readOr($, `${claudeDir}/mods/switches.json`) : null)
  const list = root ? await readOr($, `${root}/.claude/relai/MODELE-claude-code.md`) : null
  judge = judgeModel(list)
  judgeId = judgeModelId(list, judge)
  const s: any = await $.store.get('settings')
  enabled = !(s && s.on === false)
  await update($, onState, () => enabled)
  if (twin) {
    const why = 'sleeps: BenAI effort-optimizer@token-saving-mods is on'
    await update($, statusState, () => why)
    if (!toldTwin) { toldTwin = true; $.ui.toast(`relai-effort ${why}`) }
  }
}
async function askConsent($: any) {
  const answer = await $.ui.ask('May RelAI token-saving mods work in this project? This mod sends the prompt and the previous answer to a helper model after scanning for secrets.', { header: 'RelAI', options: ['Yes, in this project', 'No'] })
  if (answer !== 'Yes, in this project' && answer !== 'No') return
  const file = `${root}/docs/USTAWIENIA.md`
  const text = await readOr($, file)
  if (text === null) return
  consent = readConsent(text)
  if (consent === null) {
    const yes = answer === 'Yes, in this project'
    await $.fs.write(file, withConsentRow(text, consentRow(new Date().toISOString().slice(0, 10), yes)))
    consent = yes ? 'yes' : 'no'
  }
}
async function record($: any, serial: number, from: string, to: string, why: string, helper: ReturnType<typeof usageOf>) {
  if (!claudeDir) return
  const ts = new Date().toISOString()
  if (!queue) queue = createLedgerQueue({ read: (p: string) => $.fs.read(p), write: (p: string, t: string) => $.fs.write(p, t) }, claudeDir, session)
  try { await queue.push({ ts, session, mod: MOD, tool_use_id: `effort-${serial}`, part: '0', tool: 'prompt', action: 'effort', from, to, detail: why, measured: !!helper, ...(helper ? { helper } : {}) }) } catch { $.ui.log('relai-effort: ledger write failed') }
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    cwd = String(e.cwd || '').replace(/\\/g, '/')
    const windows = /^[A-Za-z]:\//.test(cwd)
    claudeDir = ''
    try {
      const r = await $.process.run(windows ? ['cmd.exe', '/d', '/c', 'echo %USERPROFILE%'] : ['/bin/sh', '-c', 'printf %s "$HOME"'], { timeoutMs: 5000 })
      const home = String(r.stdout || '').trim().replace(/\\/g, '/').replace(/\/+$/, '')
      if (r.exitCode === 0 && !/[\r\n]/.test(home) && !home.includes(String.fromCharCode(0)) && (windows ? /^[A-Za-z]:\//.test(home) : home.startsWith('/'))) claudeDir = `${home}/.claude`
    } catch { /* Unknown twin state: load reports why the mod must remain passive. */ }
    try { session = await $.session.id() } catch { session = 'unknown' }
    previous = ''; baseline = 'unknown'; applied = 'unknown'; invalidate(); queue = null; toldTwin = false
    auto = await read($, autoState)
    await load($)
    await $.command.register({ name: MOD, description: 'RelAI Effort: pane, auto, ask, on, off, stats' })
    return next(e)
  })
  on('prompt.submit', async ($, e, next) => {
    const x: any = e
    if (x.agentId) return next(e)
    const serial = ++sequence
    selected = null
    const task = String(x.text || '')
    if (x.isMeta || !isHumanOrigin(x.origin) || !task.trim() || task.trimStart().startsWith('/')) return next(e)
    let attempted = false, helper: ReturnType<typeof usageOf> = null
    const from = applied
    let target = from, detail = 'Judge or card failed'
    try {
      await load($)
      if (!enabled || twin || !claudeDir || !root || consent === 'no') return next(e)
      if (consent === null) await askConsent($)
      if (consent !== 'yes' || serial !== sequence) return next(e)
      if (auto && stageEffort(task)) { await update($, statusState, () => 'Stage effort protected'); return next(e) }
      if (scanText(`${task}\n${previous}`)) { await update($, statusState, () => 'Secret held back'); return next(e) }
      const model = judge, modelId = judgeId
      attempted = true
      const result: any = await $.model.complete(judgeRequest(task, previous, from, model))
      helper = usageOf(modelId, result?.usage)
      if (!live(serial)) { detail = 'Decision invalidated'; return next(e) }
      if (!result?.isAnswered) { detail = `Judge failed: ${String(result?.reason || result?.status || 'no answer')}`; await fail($, detail); return next(e) }
      const verdict = parseVerdict(String(result.text || ''))
      if (!verdict.ok) { detail = verdict.why; await fail($, detail); return next(e) }
      const { level, why } = verdict.verdict
      const action = decision(level, applied, auto, stageEffort(task))
      let accepted = action === 'auto'
      if (action === 'card') {
        const answer = await $.ui.ask(`Switch effort to ${level}? ${why}`, { header: 'Effort', options: [ON, AUTO, KEEP] })
        if (!live(serial)) { detail = 'Decision invalidated'; return next(e) }
        accepted = answer === ON || answer === AUTO
        if (answer === AUTO) { auto = true; await update($, autoState, () => true) }
      }
      if (!live(serial)) return next(e)
      // A new human turn may explicitly keep the last applied level. Commands never inherit it.
      target = accepted && level !== 'keep' ? level : from
      detail = why
      if (['low', 'medium', 'high', 'xhigh', 'max'].includes(target)) selected = { level: target as Level, serial, turnId: null }
      await update($, statusState, () => `${applied} -> ${target}: ${why}`)
    } catch (err) { detail = `Judge or card failed: ${String(err)}`; if (live(serial)) await fail($, detail) }
    finally { if (attempted) await record($, serial, from, target, detail, helper) }
    return next(e)
  })
  on('turn.step', async function* ($, e, next) {
    const x: any = e
    if (x.agentId) return yield* next(e)
    const input = String(x.effort || baseline)
    // P-063: input is the base setting, not the preceding override's effective value.
    const baseChanged = baseline !== 'unknown' && input !== baseline
    baseline = input
    if (selected && (selected.serial !== sequence || (selected.turnId !== null && selected.turnId !== x.turnId))) invalidate()
    if (baseChanged) invalidate()
    if (selected && enabled) {
      selected.turnId = x.turnId
      applied = selected.level
      return yield* next({ ...e, effort: selected.level })
    }
    applied = baseline
    return yield* next(e)
  })
  on('turn.complete', async ($, e, next) => {
    const x: any = e
    if (!x.agentId) {
      previous = String(x.answer || '').slice(0, 600)
      if (!selected || selected.turnId === null || selected.turnId === x.turnId) invalidate()
    }
    return next(e)
  })
  on('command.run', async ($, e, next) => {
    if (!(e as any).agentId) invalidate()
    return next(e)
  })
  on('command.run', { command: MOD }, async ($, e) => {
    const arg = String(e.args || '').trim().toLowerCase()
    if (arg === 'auto' || arg === 'ask') { auto = arg === 'auto'; await update($, autoState, () => auto) }
    if (arg === 'on' || arg === 'off') { enabled = arg === 'on'; invalidate(); await $.store.set('settings', { on: enabled }); await update($, onState, () => enabled) }
    if (arg === 'pane') await $.ui.open({ id: MOD, title: 'RelAI Effort' })
    return { text: `relai-effort: ${enabled ? 'on' : 'off'}; ${auto ? 'auto' : 'ask'}; ${await read($, statusState)}` }
  })
  on('ui.render', { component: 'Pane', requestId: MOD }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const isAuto = await read($, autoState)
    const isOn = await read($, onState)
    const status = await read($, statusState)
    return <Box key="layout" flexDirection="column" paddingX={1} rowGap={1}><Text bold>RelAI Effort</Text><Text>{status}</Text><Text>{isAuto ? 'Auto' : 'Ask before switching'}</Text><Button key="auto" label={isAuto ? 'Use cards' : 'Enable auto'} onPress={() => { auto = !isAuto; void update($, autoState, () => auto) }} /><Button key="on" label={isOn ? 'Turn off' : 'Turn on'} onPress={() => { enabled = !isOn; invalidate(); void $.store.set('settings', { on: enabled }); void update($, onState, () => enabled) }} /></Box>
  })
}
