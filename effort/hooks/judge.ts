import { JUDGE_SYSTEM } from './judge-prompt'

export const LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
export type Level = typeof LEVELS[number]
export type Verdict = { level: Level | 'keep', why: string }

export function stageEffort(text: string): Level | null {
  const plain = text.replace(/[`*]/g, '')
  const recommended = /Zalecany poziom(?:\s+\/effort\s*:|\s*:\s*\/effort)\s*(?:>\s*)?(low|medium|high|xhigh|max)\b/im.exec(plain)
  const metadata = /^Plan:[^\r\n]*Wykonawca:[^\r\n]*—\s*(?:\/)?effort\s+(low|medium|high|xhigh|max)\b/im.exec(plain)
  return (metadata?.[1] || recommended?.[1] || null) as Level | null
}

export function decision(level: string, current: string, auto: boolean, stage: string | null): 'keep' | 'auto' | 'card' {
  if (level === 'keep' || level === current || !LEVELS.includes(level as Level)) return 'keep'
  if (auto && stage) return 'keep'
  return auto ? 'auto' : 'card'
}

/** Last syntactically valid object; malformed or invalid verdict fails closed. */
export function parseVerdict(text: string): { ok: true, verdict: Verdict } | { ok: false, why: string } {
  let last: any = null
  for (let start = 0; start < text.length; start++) {
    if (text[start] !== '{') continue
    let depth = 0, quoted = false, escaped = false
    for (let end = start; end < text.length; end++) {
      const c = text[end]
      if (quoted) {
        if (escaped) escaped = false
        else if (c === String.fromCharCode(92)) escaped = true
        else if (c === '"') quoted = false
      } else if (c === '"') quoted = true
      else if (c === '{') depth++
      else if (c === '}' && --depth === 0) {
        try { last = JSON.parse(text.slice(start, end + 1)); start = end } catch { /* seek another opening brace */ }
        break
      }
    }
  }
  if (!last || typeof last !== 'object') return { ok: false, why: 'judge reply has no valid JSON object' }
  if (last.level !== 'keep' && !LEVELS.includes(last.level)) return { ok: false, why: 'judge level outside the list' }
  if (typeof last.why !== 'string' || !last.why.trim() || last.why.trim().split(/\s+/).length >= 12) return { ok: false, why: 'judge reason missing or too long' }
  return { ok: true, verdict: { level: last.level, why: last.why.trim() } }
}

const cut = (s: string, limit: number) => String(s || '').slice(0, limit)
const disarm = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export function judgeRequest(task: string, previous: string, current: string, model: string) {
  return { model, system: JUDGE_SYSTEM, prompt: `<task>\nCurrent effort: ${disarm(current)}\n<previous_answer>\n${disarm(cut(previous, 600))}\n</previous_answer>\n<user_prompt>\n${disarm(cut(task, 4000))}\n</user_prompt>\n</task>`, maxTokens: 120, effort: 'low', timeoutMs: 20000 }
}

/** Full model id for pricing; never invent one when the local list lacks it. */
export function judgeModelId(list: string | null, alias: string): string {
  for (const line of String(list || '').split(/\r?\n/)) {
    if (!line.trim().startsWith('balanced:')) continue
    const fields = line.split('|').map((part) => part.trim())
    if (fields.includes(`alias: ${alias}`)) return fields.find((part) => part.startsWith('id: '))?.slice(4).trim() || alias
  }
  return alias
}

export function usageOf(model: string, usage: any): { model: string, in: number, out: number } | null {
  if (!usage || typeof usage !== 'object') return null
  const n = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0
  return { model, in: n(usage.input_tokens) + n(usage.cache_read_input_tokens) + n(usage.cache_creation_input_tokens), out: n(usage.output_tokens) }
}

export function judgeModel(list: string | null): string {
  for (const line of String(list || '').split(/\r?\n/)) {
    const match = /^balanced:.*\|\s*alias:\s*([a-z]+)\s*(?:\||$)/.exec(line.trim())
    if (match) return match[1]
  }
  return 'sonnet'
}
