import { describe, expect, test } from 'claude-code/testing'
import { compressAuto, quickResearch, deepResearch, planResearch, parsePlan, dateWindow, usageOf } from './workflow.mjs'
import { scanText } from './core/secret-scan.mjs'
import { toolText } from './runtime'

const PAGE = 'Release ship on 2026-11-13: Acme 42 costs USD 17. '.repeat(8)
const URL = 'https://example.org/release'
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
function io(overrides: any = {}) {
  const w = { disk: {} as Record<string, string>, requests: [] as any[], fetched: [] as string[], spawned: [] as any[], records: [] as any[] }
  const deps = {
    scan: (s: string) => s.includes(KEY), live: async () => true,
    write: async (p: string, t: string) => { w.disk[p] = t },
    complete: async (request: any) => { w.requests.push(request); return { isAnswered: true, text: request.kind === 'relevance' ? '{"relevant":true}' : request.kind === 'auto' ? 'Acme ship 42, USD 17, 2026-11-13 https://example.org/release' : '<brief>Acme ship 42 on 2026-11-13 [1]</brief><notes>USD 17 [1]</notes>', usage: { input_tokens: 11, output_tokens: 5 } } },
    search: async () => ({ text: 'search commentary', links: [{ url: URL, title: 'Release', date: '2026-11-13' }] }),
    fetch: async (url: string) => { w.fetched.push(url); return PAGE },
    get: async () => '', firecrawl: async () => '',
    spawn: async (request: any) => { w.spawned.push(request); return { text: 'Acme [1]\nSOURCES:\n[{"url":"https://example.org/release"}]', readUrls: [], usage: { model: 'sonnet', in: 30, out: 10 } } },
    record: async (r: any) => { w.records.push(r) },
    ...overrides,
  }
  return { ...w, deps }
}

describe('research workflow: real outcomes', () => {
  const badUsage = [
    {}, { input_tokens: 11 }, { output_tokens: 5 },
    { input_tokens: -1, output_tokens: 5 }, { input_tokens: '11', output_tokens: 5 },
    { input_tokens: NaN, output_tokens: 5 }, { input_tokens: 11, output_tokens: 5, cache_read_input_tokens: -1 },
  ]
  for (const [index, usage] of badUsage.entries()) test(`incomplete or invalid usage stays unknown with no positive saving: ${index}`, async () => {
    const w = io({ complete: async () => ({ isAnswered: true, text: 'Acme ship 42', usage }) })
    const result = await compressAuto({ commentary: PAGE.repeat(12), links: [] }, { path: '/savings/unknown.json', question: 'Acme' }, w.deps)
    expect(result.commentary.includes('helper notes')).toBe(true)
    expect(w.records[0].helper).toBe(undefined)
    expect(w.records[0].measured).toBe(false)
    const saving = w.records.find(r => r.before !== undefined)
    expect(saving.before).toBe(saving.after)
    expect(saving.detail.includes('unknown')).toBe(true)
    expect(usageOf('haiku', usage)).toBe(null)
  })
  test('genuine zero usage stays known and valid cache counters count toward input', () => {
    expect(usageOf('haiku', { input_tokens: 0, output_tokens: 0 })).toEqual({ model: 'haiku', in: 0, out: 0 })
    expect(usageOf('haiku', { input_tokens: 11, output_tokens: 5, cache_read_input_tokens: 2, cache_creation_input_tokens: 3 })).toEqual({ model: 'haiku', in: 16, out: 5 })
  })
  for (const mode of ['in-window', 'old', 'unknown', 'invalid']) test(`undated links in a time window are read, then resolved from publication evidence: ${mode}`, async () => {
    const prefix = mode === 'in-window' ? 'Published: 2026-11-13\n' : mode === 'old' ? 'Published: 2025-11-13\n' : mode === 'invalid' ? 'Published: 2026-02-30\n' : ''
    const w = io({
      search: async () => ({ text: 'Release 2026-11-13', links: [{ url: URL, title: 'Acme release 2026-11-13' }] }),
      fetch: async (url: string) => { w.fetched.push(url); return prefix + PAGE },
    })
    const report = await quickResearch('Acme in 2026', { queries: ['Acme 2026'], urls: [URL], window: { from: '2026-01-01', to: '2026-12-31' } }, w.deps)
    expect(w.fetched).toEqual([URL])
    expect(report.ok).toBe(mode === 'in-window')
    if (mode === 'in-window') {
      expect(report.sources.length).toBe(1)
      expect(report.sources[0].date).toBe('2026-11-13')
      expect(report.sources[0].read).toBe(true)
    } else {
      expect(report.sources).toEqual([])
      expect(w.requests.length).toBe(0)
    }
  })
  test('a failed reader envelope falls back to GET; no successful reader means no verified source', async () => {
    for (const error of [
      { isError: true, result: PAGE },
      { result: { code: 503, result: PAGE }, text: PAGE },
    ]) {
      const order: string[] = []
      const w = io({ fetch: async () => { order.push('fetch'); return toolText(error) }, get: async () => { order.push('get'); return PAGE } })
      const plan = { queries: ['Acme'], urls: [], window: null }
      const report = await quickResearch('Acme', plan, w.deps)
      expect(report.ok).toBe(true)
      expect(order).toEqual(['fetch', 'get'])
      expect(report.sources[0].text).toBe(PAGE)
      const failed = io({ fetch: async () => toolText(error) })
      const noReport = await quickResearch('Acme', plan, failed.deps)
      expect(noReport.ok).toBe(false)
      expect(noReport.sources).toEqual([])
      expect(failed.requests.length).toBe(0)
    }
  })
  test('quoted configuration secret in auto and planner data never reaches a helper', async () => {
    const secret = `${['DB', 'PASSWORD'].join('_')}="${['R7m', 'K2p', 'Q9w', 'Z4a'].join('')}"`
    expect(!!scanText(secret)).toBe(true)
    const w = io({ scan: scanText })
    const original = { commentary: PAGE.repeat(12) + secret, links: [] }
    expect(await compressAuto(original, { path: '/savings/secret.json', question: 'Acme' }, w.deps)).toBe(original)
    expect(w.requests.length).toBe(0)
    expect(Object.keys(w.disk)).toEqual([])
    let rejected = false
    try { await planResearch(secret, w.deps) } catch { rejected = true }
    expect(rejected).toBe(true)
    expect(w.requests.length).toBe(0)
  })
  test('every helper boundary scans input and output; unanswered nonempty text is rejected', async () => {
    const input = io()
    let rejected = false
    try { await planResearch(KEY, input.deps, 'haiku') } catch { rejected = true }
    expect(rejected).toBe(true); expect(input.requests.length).toBe(0)
    for (const response of [{ isAnswered: true, text: KEY }, { isAnswered: false, text: 'Acme ship 42' }]) {
      const w = io({ complete: async () => response })
      const original = { commentary: PAGE.repeat(12), links: [] }
      expect(await compressAuto(original, { path: '/savings/a.json', question: 'Acme' }, w.deps)).toBe(original)
    }
  })
  test('unknown helper usage cannot create a positive saving', async () => {
    const w = io({ complete: async () => ({ isAnswered: true, text: 'Acme ship 42' }) })
    const result = await compressAuto({ commentary: PAGE.repeat(12), links: [] }, { path: '/savings/a.json', question: 'Acme' }, w.deps)
    expect(result.commentary.includes('Acme ship 42')).toBe(true)
    const saving = w.records.find(r => r.before !== undefined)
    expect(saving.before).toBe(saving.after)
    expect(saving.detail.includes('unknown')).toBe(true)
  })
  test('auto saves the exact original, keeps links and restores URLs omitted by the helper', async () => {
    const w = io({ complete: async () => ({ isAnswered: true, text: 'Acme ship 42 on 2026-11-13, USD 17', usage: { input_tokens: 11, output_tokens: 5 } }) })
    const original = { commentary: PAGE.repeat(12) + URL, links: [{ title: 'Link unchanged', url: URL }], query: 'Acme ship' }
    const result = await compressAuto(original, { path: '/savings/original.json', question: 'Acme ship', model: 'haiku' }, w.deps)
    expect(result !== null).toBe(true)
    expect(w.disk['/savings/original.json']).toBe(JSON.stringify(original))
    expect(result.links).toEqual(original.links)
    expect(result.commentary.includes('/savings/original.json')).toBe(true)
    expect(result.commentary.includes(URL)).toBe(true)
    expect(result.commentary.includes('ship')).toBe(true)
    expect(w.records[0].helper.in).toBe(11)
  })
  for (const mode of ['secret', 'write', 'helper', 'invalidated', 'empty', 'larger']) test(`auto fallback preserves exact original: ${mode}`, async () => {
    const w = io(mode === 'write' ? { write: async () => { throw Error('disk full') } } : mode === 'helper' ? { complete: async () => { throw Error('timeout') } } : mode === 'invalidated' ? { live: async () => false } : mode === 'empty' ? { complete: async () => ({ isAnswered: false }) } : mode === 'larger' ? { complete: async () => ({ isAnswered: true, text: PAGE.repeat(100) }) } : {})
    const original = { commentary: PAGE.repeat(12) + (mode === 'secret' ? KEY : ''), links: [] }
    expect(await compressAuto(original, { path: '/savings/a.json', question: 'Acme', model: 'haiku' }, w.deps)).toBe(original)
    if (mode === 'secret' || mode === 'write' || mode === 'invalidated') expect(w.requests.length).toBe(0)
    if (mode === 'secret') expect(Object.keys(w.disk)).toEqual([])
  })
  test('quick starts all page reads before any finishes, cites only read URLs and preserves facts', async () => {
    let started = 0
    let release: () => void = () => {}
    const barrier = new Promise<void>((r) => { release = r })
    const links = [1, 2, 3, 4].map((i) => ({ url: `https://example.org/${i}` }))
    const w = io({ search: async () => ({ text: '', links }), fetch: async () => { started++; if (started === 4) release(); await barrier; return PAGE } })
    const task = quickResearch('Acme', { queries: ['Acme release'], urls: [], window: null }, w.deps)
    for (let i = 0; i < 50 && started < 4; i++) await Promise.resolve()
    expect(started).toBe(4)
    const result = await task
    expect(result.ok).toBe(true)
    expect(result.sources.length).toBe(4)
    expect(result.text.includes('Acme ship 42 on 2026-11-13 [1]')).toBe(true)
  })
  test('unread pages and fabricated citations never become a verified quick report', async () => {
    const noPages = io({ fetch: async () => '', get: async () => '', firecrawl: async () => '' })
    const failed = await quickResearch('Acme', { queries: ['Acme'], urls: [], window: null }, noPages.deps)
    expect(failed.ok).toBe(false)
    expect(failed.text.includes('search commentary')).toBe(true)
    expect(noPages.requests.length).toBe(0)
    const fake = io({ complete: async (r: any) => ({ isAnswered: true, text: r.kind === 'relevance' ? '{"relevant":true}' : '<brief>Fake [2]</brief><notes>Fake [2]</notes>' }) })
    expect((await quickResearch('Acme', { queries: ['Acme'], urls: [], window: null }, fake.deps)).ok).toBe(false)
  })
  test('fallback order, secret page exclusion and explicit date filtering', async () => {
    const order: string[] = []
    const w = io({ fetch: async () => { order.push('fetch'); return '' }, get: async () => { order.push('get'); return PAGE }, firecrawl: async () => { order.push('firecrawl'); return PAGE } })
    expect((await quickResearch('Acme', { queries: ['Acme'], urls: [], window: { from: '2026-11-01', to: '2026-11-30' } }, w.deps)).ok).toBe(true)
    expect(order).toEqual(['fetch', 'get'])
    const secret = io({ fetch: async () => PAGE + KEY })
    expect((await quickResearch('Acme', { queries: ['Acme'], urls: [], window: null }, secret.deps)).ok).toBe(false)
    expect(secret.requests.length).toBe(0)
    const old = io()
    expect((await quickResearch('Acme', { queries: ['Acme'], urls: [], window: { from: '2027-01-01', to: '2027-12-31' } }, old.deps)).ok).toBe(false)
    expect(old.fetched.length).toBe(0)
  })
  test('deep uses parallel general-purpose agents without model, labels unverified and retains all sources after merge', async () => {
    const w = io()
    const result = await deepResearch('Acme', { parts: ['Release', 'Cost'] }, w.deps)
    expect(result.ok).toBe(true)
    expect(w.spawned.length).toBe(2)
    for (const r of w.spawned) { expect(r.subagentType).toBe('general-purpose'); expect('model' in r).toBe(false) }
    expect(result.sources.length).toBe(2)
    expect(result.sources.every((s: any) => s.read === false && s.label === 'unverified')).toBe(true)
    expect(result.text.includes('[2]')).toBe(true)
    expect(result.text.includes('unverified')).toBe(true)
  })
  test('a deep source is verified only by tool-read evidence, not the agent claim', async () => {
    const w = io({ spawn: async () => ({ text: 'Fact [1]\nSOURCES:\n[{"url":"https://example.org/release","read":true}]', readUrls: [] }) })
    const result = await deepResearch('Acme', { parts: ['Release', 'Cost'] }, w.deps)
    expect(result.sources.length).toBe(2)
    expect(result.sources[0].read).toBe(false)
  })
  test('deep helper failures preserve all completed parts and their sources', async () => {
    const w = io({ complete: async () => { throw Error('merge timed out') } })
    const result = await deepResearch('Acme', { parts: ['Release', 'Cost'] }, w.deps)
    expect(result.text.includes('Acme [1]')).toBe(true)
    expect(result.text.includes('Acme [2]')).toBe(true)
    expect(result.sources.length).toBe(2)
  })
  test('plan bounds are enforced; question dates beat planner dates', () => {
    const plan = parsePlan('{"mode":"quick","queries":["Acme release"],"urls":["file:///secret"],"parts":["Release","Cost"],"window":{"from":"2020-01-01","to":"2020-12-31"}}', 'Acme from 2026-11-01 to 2026-11-13')
    expect(plan.urls).toEqual([])
    expect(plan.window).toEqual({ from: '2026-11-01', to: '2026-11-13' })
    expect(dateWindow('Acme from 2026-11-01 to 2026-11-13')).toEqual(plan.window)
  })
})
