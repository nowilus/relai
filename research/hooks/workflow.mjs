import { validateQuickCitations, mergeDeepSources } from './citations.mjs'
import { request, partPrompt } from './prompts.mjs'

export const tokens = (text) => Math.ceil(String(text).length / 4)
/** Scan raw strings as well as JSON envelopes; escaping must not hide a secret. */
export function scanContent(value, scan) {
  if (typeof value === 'string') {
    const hit = scan(value)
    if (hit) return hit
    let decoded
    try { decoded = JSON.parse(value) } catch { return null }
    return scanContent(decoded, scan)
  }
  if (!value || typeof value !== 'object') return null
  const hit = scan(JSON.stringify(value))
  if (hit) return hit
  for (const [key, item] of Object.entries(value)) {
    const found = scan(key) || scanContent(item, scan)
    if (found) return found
  }
  return null
}
export const urlsOf = (text) => [...new Set(String(text).match(/https?:\/\/[^\s<>"\])}]+/g) || [])]
export function publicUrl(value) {
  try {
    const u = new URL(String(value))
    const host = u.hostname.toLowerCase()
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port))) return null
    if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.localhost') || host.endsWith('.internal') || host.includes(':')) return null
    if (/^(?:0|10|127|169\.254|192\.168|172\.(?:1[6-9]|2\d|3[01]))(?:\.|$)/.test(host)) return null
    return u.href
  } catch { return null }
}
export function dateWindow(question) {
  const dates = String(question).match(/\b\d{4}-\d{2}-\d{2}\b/g) || []
  if (dates.length >= 2 && validDate(dates[0]) && validDate(dates[1]) && dates[0] <= dates[1]) return { from: dates[0], to: dates[1] }
  const year = /\b(20\d{2})\b/.exec(String(question))
  return year && dates.length === 0 ? { from: `${year[1]}-01-01`, to: `${year[1]}-12-31` } : null
}
const validDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
export function parsePlan(text, question) {
  let p
  try { p = JSON.parse(String(text).replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '')) } catch { throw Error('Planner returned invalid JSON') }
  if (!p || !['quick', 'deep'].includes(p.mode)) throw Error('Planner returned invalid mode')
  const queries = (Array.isArray(p.queries) ? p.queries : []).filter(q => typeof q === 'string' && q.trim() && q.trim().split(/\s+/).length < 12).slice(0, 2)
  if (!queries.length) queries.push(String(question).trim().split(/\s+/).slice(0, 11).join(' '))
  const urls = [...new Set((Array.isArray(p.urls) ? p.urls : []).map(publicUrl).filter(Boolean))].slice(0, 2)
  const parts = (Array.isArray(p.parts) ? p.parts : []).filter(x => typeof x === 'string' && x.trim()).slice(0, 4).map(x => x.slice(0, 1000))
  while (parts.length < 2) parts.push(parts.length ? 'Evidence and limitations' : 'Main findings')
  const window = dateWindow(question) || (validDate(p.window?.from) && validDate(p.window?.to) && p.window.from <= p.window.to ? { from: p.window.from, to: p.window.to } : null)
  return { mode: p.mode, queries, urls, parts, window }
}
export function usageOf(model, usage) {
  const valid = x => typeof x === 'number' && Number.isFinite(x) && x >= 0
  if (!usage || !valid(usage.input_tokens) || !valid(usage.output_tokens)) return null
  if (['cache_read_input_tokens', 'cache_creation_input_tokens'].some(key => usage[key] !== undefined && !valid(usage[key]))) return null
  return { model, in: usage.input_tokens + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0), out: usage.output_tokens }
}
async function helper(kind, data, d, model = 'haiku') {
  model = d.helper || model
  const r = request(kind, data, model)
  if (scanContent(r.prompt, d.scan)) throw Error('Secret held back before helper')
  if (!(await d.live())) throw Error('Research disabled while running')
  let answer
  try { answer = await d.complete(r) }
  finally {
    const usage = usageOf(model, answer?.usage)
    await d.record({ action: `research-${kind}`, measured: !!usage, ...(usage ? { helper: usage } : {}), detail: answer?.isAnswered ? 'helper answered' : 'helper failed; usage unknown' })
  }
  if (!(await d.live())) throw Error('Research disabled while running')
  if (!answer?.isAnswered || !String(answer.text || '').trim()) throw Error(`Research ${kind} helper failed`)
  if (scanContent(String(answer.text), d.scan)) throw Error('Secret held back in helper answer')
  return String(answer.text).trim()
}
export async function planResearch(question, d, model) { return parsePlan(await helper('plan', { question }, d, model), question) }

export async function compressAuto(original, options, d) {
  try {
    const text = String(original.commentary || '')
    if (scanContent(original, d.scan) || scanContent(options.question, d.scan) || !(await d.live())) return original
    await d.write(options.path, JSON.stringify(original))
    if (!(await d.live())) return original
    let knownUsage = false
    const notes = await helper('auto', { question: options.question, commentary: text.slice(0, 60000) }, { ...d, record: async rec => { knownUsage = !!rec.helper; await d.record(rec) } }, options.model)
    if (notes.split(/\s+/).length > 250 || notes.length > 4000) throw Error('Auto helper exceeded word or character limit')
    const missing = urlsOf(text).filter(url => !notes.includes(url))
    const commentary = `[relai-research: helper notes; original: ${options.path}]\n${notes}${missing.length ? '\nURLs from original commentary:\n' + missing.join('\n') : ''}`
    if (commentary.length >= text.length) throw Error('Auto notes do not shorten the result')
    await d.record({ action: 'research-auto', before: knownUsage ? tokens(text) : tokens(commentary), after: tokens(commentary), measured: false, detail: knownUsage ? 'Estimated text tokens; helper cost recorded separately' : 'Helper usage unknown; no saving claimed' })
    return { ...original, commentary }
  } catch (err) { await d.fail?.(String(err)); return original }
}

const sourceList = (sources) => sources.map((s, i) => `[${i + 1}] ${s.url} (${s.read ? 'verified: page read' : 'unverified: page not read'})`).join('\n')
function sections(text, briefLimit, notesLimit) {
  const brief = /<brief>([\s\S]*?)<\/brief>/.exec(text)?.[1]?.trim()
  const notes = /<notes>([\s\S]*?)<\/notes>/.exec(text)?.[1]?.trim()
  if (!brief || brief.split(/\s+/).length > briefLimit || (notesLimit && (!notes || notes.split(/\s+/).length > notesLimit))) return null
  return notesLimit ? `${brief}\n\n${notes}` : brief
}
const pageText = value => typeof value === 'string' ? value : ''
function publicationDate(text) {
  // A year in the question/title or an arbitrary date in body text is not publication evidence.
  const labelled = /(?:\bpublished(?: on| at)?|\bpublication date|\bdatePublished|data publikacji|opublikowano)\s*["']?\s*[:=]?\s*["']?(\d{4}-\d{2}-\d{2})/i.exec(text)
  const meta = /<meta\b(?=[^>]*(?:name|property)\s*=\s*["'](?:article:published_time|datePublished)["'])[^>]*\bcontent\s*=\s*["'](\d{4}-\d{2}-\d{2})/i.exec(text)
  const date = (meta || labelled)?.[1]
  return validDate(date) ? date : ''
}
export async function quickResearch(question, plan, d) {
  const raw = [], sources = []
  try {
    if (scanContent(question, d.scan) || !(await d.live())) throw Error('Research question held back')
    const searches = await Promise.all((plan.queries || []).slice(0, 2).map(async query => {
      if (scanContent(query, d.scan) || !(await d.live())) return { text: '', links: [] }
      try { return await d.search(query) } catch { return { text: '', links: [] } }
    }))
    raw.push(...searches.map(r => String(r.text || '')))
    const links = [...(plan.urls || []).map(url => ({ url })), ...searches.flatMap(r => r.links || [])]
    const unique = new Map()
    for (const item of links) {
      const url = publicUrl(item.url)
      if (!url || scanContent(item, d.scan)) continue
      const date = String(item.date || '').slice(0, 10)
      if (plan.window && validDate(date) && (date < plan.window.from || date > plan.window.to)) continue
      if (!unique.has(url) || !validDate(unique.get(url).date) && validDate(date)) unique.set(url, { ...item, url, date })
    }
    const pages = await Promise.all([...unique.values()].slice(0, 4).map(async link => {
      for (const method of ['fetch', 'get', 'firecrawl']) {
        if (!(await d.live())) return null
        let text = ''
        try { text = pageText(await d[method](link.url)) } catch { continue }
        if (scanContent(text, d.scan)) return null
        if (text.length < 200) continue
        const date = validDate(link.date) ? link.date : publicationDate(text)
        if (plan.window && (!validDate(date) || date < plan.window.from || date > plan.window.to)) return null
        text = text.slice(0, 40000)
        try {
          const relevance = JSON.parse(await helper('relevance', { question, url: link.url, page: text.slice(0, 600) }, d))
          if (relevance.relevant !== true) return null
        } catch { return null }
        return { ...link, date, text, read: true, label: 'verified' }
      }
      return null
    }))
    sources.push(...pages.filter(Boolean))
    if (!sources.length) throw Error('No relevant pages read; no verified report')
    const answer = await helper('quick', { question, pages: sources.map((s, i) => ({ n: i + 1, url: s.url, text: s.text })) }, d)
    const report = sections(answer, 180, 900)
    if (!report || !validateQuickCitations(report, sources)) throw Error('Quick citation or report validation failed')
    return { ok: true, text: `${report}\n\nSources:\n${sourceList(sources)}`, sources }
  } catch (err) {
    await d.fail?.(String(err))
    return { ok: false, text: `relai-research: no verified quick report. ${String(err)}\n${raw.join('\n\n')}\n${sources.map(s => `${s.url}\n${s.text}`).join('\n\n')}`, sources }
  }
}

export function parsePart(answer) {
  const index = String(answer.text || '').lastIndexOf('SOURCES:')
  if (index < 0) throw Error('Deep part has no SOURCES block')
  const text = String(answer.text).slice(0, index).trim()
  const listed = JSON.parse(String(answer.text).slice(index + 8).trim().replace(/^```(?:json)?\s*|\s*```$/g, ''))
  if (!Array.isArray(listed) || listed.length > 20 || text.split(/\s+/).length > 250) throw Error('Invalid deep part size')
  const sources = listed.map(s => {
    const url = publicUrl(s?.url)
    if (!url) throw Error('Invalid deep source URL')
    return { url, title: String(s.title || ''), read: (answer.readUrls || []).includes(url) }
  })
  if (!sources.length || !/\[\d+\]/.test(text)) throw Error('Deep part has no citations')
  return { text, sources }
}
export async function deepResearch(question, plan, d) {
  const parts = [], errors = []
  if (scanContent(question, d.scan) || !(await d.live())) return { ok: false, text: 'Research question held back', sources: [] }
  await Promise.all((plan.parts || []).slice(0, 4).map(async part => {
    const prompt = partPrompt(question, part, plan.window)
    try {
      if (scanContent(prompt, d.scan) || !(await d.live())) throw Error('Deep task held back')
      const answer = await d.spawn({ prompt, subagentType: 'general-purpose', description: `RelAI research: ${String(part).slice(0, 80)}` })
      await d.record({ action: 'research-deep-part', measured: !!answer?.usage, ...(answer?.usage ? { helper: answer.usage } : {}), detail: 'Agent usage; hand-back may also reach main chat, no saving claimed' })
      if (!(await d.live()) || scanContent(String(answer?.text || ''), d.scan)) throw Error('Deep result held back')
      const parsed = parsePart(answer)
      mergeDeepSources([parsed])
      parts.push(parsed)
    } catch (err) { errors.push(String(err)) }
  }))
  let merged
  try { merged = mergeDeepSources(parts) } catch (err) { return { ok: false, text: String(err), sources: [] } }
  if (!parts.length) return { ok: false, text: `No deep part completed. ${errors.join('; ')}`, sources: [] }
  let brief = ''
  try {
    const text = await helper('merge', { question, parts: merged.text, sources: merged.sources }, d)
    const candidate = sections(text, 200, 0)
    if (!candidate || !validateQuickCitations(candidate, merged.sources.map(s => ({ ...s, read: true })))) throw Error('Deep merge citation validation failed')
    brief = candidate + '\n\n'
  } catch (err) { errors.push(String(err)) }
  return { ok: true, text: `${brief}${merged.text}\n\nSources:\n${sourceList(merged.sources)}${errors.length ? '\nLimitations: ' + errors.join('; ') : ''}`, sources: merged.sources }
}
