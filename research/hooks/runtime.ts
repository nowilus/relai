import { publicUrl, scanContent } from './workflow.mjs'

export async function withDeadline<T>(clock: any, ms: number, work: () => Promise<T>): Promise<T> {
  let timer: any
  try {
    return await Promise.race([work(), new Promise<T>((_resolve, reject) => {
      timer = clock.after(ms, () => reject(Error('Research tool deadline exceeded')))
    })])
  } finally { timer?.cancel() }
}

/** A research agent cannot read local credentials or run arbitrary programs. */
export function agentToolAllowed(e: any, scan: (text: string) => unknown): boolean {
  if (scanContent(e, scan)) return false
  if (e.tool === 'WebSearch') return typeof e.query === 'string' && !!e.query.trim()
  if (e.tool === 'WebFetch') return !!publicUrl(e.url)
  return false
}
export function agentResult(ran: any, scan: (text: string) => unknown, valid = true): any {
  if (valid && !scanContent(ran, scan)) return ran
  return { result: 'relai-research: secret held back before research agent', text: 'relai-research: secret held back before research agent', isError: true }
}

/** WebSearch has structured links interleaved with commentary strings in results. */
export function searchShape(result: any): { commentary: string, links: any[], replace: (text: string) => any } | null {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return null
  if (typeof result.commentary === 'string') return {
    commentary: result.commentary, links: Array.isArray(result.links) ? result.links : [],
    replace: text => ({ ...result, commentary: text }),
  }
  if (!Array.isArray(result.results)) return null
  const commentary = result.results.filter((x: any) => typeof x === 'string').join('\n')
  const links = result.results.flatMap((x: any) => Array.isArray(x?.content) ? x.content : []).filter((x: any) => typeof x?.url === 'string')
  return { commentary, links, replace: text => {
    let first = true
    return { ...result, results: result.results.flatMap((x: any) => {
      if (typeof x !== 'string') return [x]
      if (!first) return []
      first = false
      return [text]
    }) }
  } }
}
const readerFailed = (value: any): boolean => value?.isError === true ||
  [value?.code, value?.status, value?.statusCode].some(code => typeof code === 'number' && (code < 200 || code >= 300))
export function toolText(value: any): string {
  const r = value?.result ?? value
  if (readerFailed(value) || readerFailed(r)) return ''
  if (typeof r === 'string') return r
  if (typeof r?.result === 'string' && (r.code === undefined || r.code >= 200 && r.code < 300)) return r.result
  if (typeof r?.text === 'string') return r.text
  if (typeof r?.content === 'string') return r.content
  if (Array.isArray(r)) return r.filter(x => x?.type === 'text').map(x => x.text).join('\n')
  if (Array.isArray(r?.content)) return toolText(r.content)
  return typeof value?.text === 'string' ? value.text : ''
}
