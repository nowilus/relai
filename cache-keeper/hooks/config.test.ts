import { mockCacheConfig } from './config-fixture'
import { expect, mock, test } from 'claude-code/testing'
import { DEFAULT_SETTINGS } from './core'
import { CONFIG_KEYS, MIGRATED, configValue, loadConfiguration, type ConfigIO } from './config'

test('E9: legacy values survive migration, later explicit userConfig wins, legacy remains intact', async () => {
  const old = { ...DEFAULT_SETTINGS, ttlMin: 5, guard: false, bigTokens: 230_000, warnMin: [9, 3], alerts: false }
  const store: Record<string, unknown> = { settings: old }
  const options: Record<string, unknown> = { ttlMin: 60, guard: true }
  const io: ConfigIO = {
    get: async k => store[k], put: async (k,v) => { store[k] = v },
    options: async () => options,
    set: async (k,v) => { options[k] = v; return { value: v } },
  }
  expect(await loadConfiguration(io)).toEqual(old)
  expect(options.ttlMin).toBe(5)
  expect(options.guard).toBe(false)
  expect(options.warnMin).toBe('9,3')
  options.ttlMin = 60; options.guard = true
  expect((await loadConfiguration(io)).ttlMin).toBe(60)
  expect((await loadConfiguration(io)).guard).toBe(true)
  expect(store.settings).toEqual(old)
})

test('E9: denied migration respects managed value, completes other keys and never overwrites later config', async () => {
  const old = { ...DEFAULT_SETTINGS, ttlMin: 5, guard: false, bigTokens: 230_000 }
  const store: Record<string, unknown> = { settings: old }
  const options: Record<string, unknown> = { guard: true }
  const calls: string[] = []
  let deny = true
  const io: ConfigIO = {
    get: async k => store[k], put: async (k,v) => { store[k] = v }, options: async () => options,
    set: async (k,v) => { calls.push(k); if (k === 'guard' && deny) return { deny: 'managed' }; options[k] = v; return { value: v } },
  }
  let failure = ''
  const loaded = await loadConfiguration(io).catch(err => { failure = String(err); return null })
  expect(failure).toBe('')
  expect(loaded).toEqual({ ...old, guard: true })
  expect(store.settings).toEqual(old)
  expect(store[MIGRATED]).toEqual(CONFIG_KEYS)
  options.ttlMin = 60; deny = false
  expect((await loadConfiguration(io)).ttlMin).toBe(60)
  expect((await loadConfiguration(io)).guard).toBe(true)
  expect(calls.filter(k => k === 'ttlMin').length).toBe(1)
  expect(calls.filter(k => k === 'guard').length).toBe(1)
})

test('E9 review 2: migration uses confirmed rewritten values while list remains stale', async () => {
  for (const writtenTTL of [5, 60]) {
    const old = { ...DEFAULT_SETTINGS, ttlMin: 5 }
    const store: Record<string, unknown> = { settings: old }
    const stale = Object.fromEntries(CONFIG_KEYS.map(k => [k, configValue(k, DEFAULT_SETTINGS)]))
    const written: Record<string, unknown> = {}
    const actual = { ...old, ttlMin: writtenTTL }
    const io: ConfigIO = {
      get: async k => store[k], put: async (k,v) => { store[k] = v }, options: async () => stale,
      set: async (k,v) => { const value = k === 'ttlMin' ? writtenTTL : v; written[k] = value; return { value } },
    }
    expect(await loadConfiguration(io)).toEqual(actual)
    expect(written.ttlMin).toBe(writtenTTL)
    expect(store.settings).toEqual(old)
  }
})

test('E9 review 4: unchanged managed fields need no write', async () => {
  const store: Record<string, unknown> = { settings: { ...DEFAULT_SETTINGS, ttlMin: 5 } }
  const options = Object.fromEntries(CONFIG_KEYS.map(k => [k, configValue(k, DEFAULT_SETTINGS)]))
  const calls: string[] = []
  let failure = ''
  const loaded = await loadConfiguration({
    get: async k => store[k], put: async (k,v) => { store[k] = v }, options: async () => options,
    set: async (k,v) => { calls.push(k); if (k === 'guard') return { deny: 'managed' }; options[k] = v; return { value: v } },
  }).catch(err => { failure = String(err); return null })
  expect(failure).toBe('')
  expect(loaded?.ttlMin).toBe(5)
  expect(calls).toEqual(['ttlMin'])
  expect(store[MIGRATED]).toEqual(CONFIG_KEYS)
})

function session(on: Parameters<typeof mockCacheConfig>[0]) {
  const clock = mock.clock(on, { now: 1_000_000 })
  mock.env(on, { USERPROFILE: 'C:/test' })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/test-project' }))
  on('session.id', () => ({ value: 'review' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 0 }))
  on('fs.exists', () => ({ value: false }))
  return clock
}

test('E9 review 4 engine: denied changed managed field still starts commands and timer', async ($, on) => {
  const commands: string[] = []
  mockCacheConfig(on, undefined, commands, { denied: ['guard'] })
  const clock = session(on)
  const store: Record<string, unknown> = { settings: { ...DEFAULT_SETTINGS, guard: false, ttlMin: 5 } }
  on('store.get', ($, e) => ({ value: store[e.key] as never }))
  on('store.set', ($, e) => { store[e.key] = e.value; return { value: undefined } })
  let failure = ''
  await $.session.start({ cwd: 'C:/test-project', surface: 'terminal', isInteractive: true }).catch(err => { failure = String(err) })
  expect(failure).toBe('')
  expect(commands.includes('relai-cache-keeper')).toBe(true)
  expect(commands.includes('relai-cache-keeper-keepwarm')).toBe(true)
  expect(commands.includes('relai-cache-keeper-handoff')).toBe(true)
  const status = JSON.stringify(await $.command.run({ command: 'relai-cache-keeper', args: '', origin: { kind: 'composer' } }))
  expect(status).toContain('okno cache 5 min')
  expect(status).toContain('Strażnik: on')
  expect(store['snap:review']).toBeUndefined()
  await clock.advance(30_000)
  expect((store['snap:review'] as { savedAt: number }).savedAt).toBe(1_030_000)
})

test('E9 review 3 engine: command uses confirmed rewritten value for runtime and compatibility store with stale list', async ($, on) => {
  mockCacheConfig(on, (key, value) => key.endsWith('.ttlMin') ? 5 : value, [], { staleReads: true })
  session(on)
  const store: Record<string, unknown> = {}
  on('store.get', ($, e) => ({ value: store[e.key] as never }))
  on('store.set', ($, e) => { store[e.key] = e.value; return { value: undefined } })
  await $.session.start({ cwd: 'C:/test-project', surface: 'terminal', isInteractive: true })
  const status = JSON.stringify(await $.command.run({ command: 'relai-cache-keeper', args: 'ttl 60', origin: { kind: 'composer' } }))
  expect(status).toContain('okno cache 5 min')
  expect((store.settings as typeof DEFAULT_SETTINGS).ttlMin).toBe(5)
})

test('E9 review 5 engine: inline config updates runtime but unrelated namespace is ignored', async ($, on) => {
  mockCacheConfig(on, undefined, [], { namespace: 'relai-cache-keeper@inline' })
  session(on)
  mock.store(on)
  await $.session.start({ cwd: 'C:/test-project', surface: 'terminal', isInteractive: true })
  await $.config.set({ key: 'relai-cache-keeper@inline.ttlMin', value: 5 })
  const status = () => $.command.run({ command: 'relai-cache-keeper', args: '', origin: { kind: 'composer' } }).then(JSON.stringify)
  expect(await status()).toContain('okno cache 5 min')
  await $.config.set({ key: 'relai-cache-keeper@other.ttlMin', value: 60 })
  expect(await status()).toContain('okno cache 5 min')
})

test('E9: config rows belong to Cache Keeper and namespaced commands work', async ($, on) => {
  mockCacheConfig(on)
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  const out = await $.command.run({ command: 'relai-cache-keeper', args: '', origin: { kind: 'composer' } })
  expect(JSON.stringify(out)).toContain('okno cache')
})

test('E9 engine: store migration, explicit config change and command share one source', async ($, on) => {
  const commands: string[] = []
  const options = mockCacheConfig(on, undefined, commands)
  mock.clock(on, { now: 1_000_000 })
  mock.env(on, { USERPROFILE: 'C:/test' })
  const old = { ...DEFAULT_SETTINGS, ttlMin: 5, guard: false }
  const store: Record<string, unknown> = { settings: old }
  on('store.get', ($, e) => ({ value: store[e.key] as never }))
  on('store.set', ($, e) => { store[e.key] = e.value; return { value: undefined } })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/test-project' }))
  on('session.id', () => ({ value: 'cfg' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 0 }))
  on('fs.exists', () => ({ value: false }))
  await $.session.start({ cwd: 'C:/test-project', surface: 'terminal', isInteractive: true })
  expect(options.ttlMin).toBe(5)
  expect(store.settings).toEqual(old)
  for (const name of ['relai-cache-keeper', 'relai-cache-keeper-keepwarm', 'relai-cache-keeper-handoff']) expect(commands.includes(name)).toBe(true)
  await $.config.set({ key: 'relai-cache-keeper.ttlMin', value: 60 })
  const status = () => $.command.run({ command: 'relai-cache-keeper', args: '', origin: { kind: 'composer' } }).then(JSON.stringify)
  expect(await status()).toContain('okno cache 60 min')
  await $.session.start({ cwd: 'C:/test-project', surface: 'terminal', isInteractive: true })
  expect(await status()).toContain('okno cache 60 min')
  await $.command.run({ command: 'relai-cache-keeper', args: 'ttl 5', origin: { kind: 'composer' } })
  expect(options.ttlMin).toBe(5)
  expect(store.settings).toEqual(old)
  const rejected = await $.config.set({ key: 'relai-cache-keeper.ttlMin', value: 7 })
  expect(JSON.stringify(rejected)).toContain('Invalid Cache Keeper option')
  expect(options.ttlMin).toBe(5)
})

test('E9 engine: runtime uses the value actually written by downstream config hooks', async ($, on) => {
  const options = mockCacheConfig(on, (key, value) => key.endsWith('.ttlMin') ? 5 : value)
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  await $.config.set({ key: 'relai-cache-keeper.ttlMin', value: 60 })
  expect(options.ttlMin).toBe(5)
  const out = await $.command.run({ command: 'relai-cache-keeper', args: '', origin: { kind: 'composer' } })
  expect(JSON.stringify(out)).toContain('okno cache 5 min')
})

test('E9: migration preserves the full old fractional range', async () => {
  const old = { ...DEFAULT_SETTINGS, keepWarmHours: 0.001, maxLimitPercent: 0.001 }
  const options: Record<string, unknown> = {}
  const store: Record<string, unknown> = { settings: old }
  expect(await loadConfiguration({ get: async k => store[k], put: async (k,v) => {store[k] = v}, options: async () => options, set: async (k,v) => {options[k] = v; return {value:v}} })).toEqual(old)
})
