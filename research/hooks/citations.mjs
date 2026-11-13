/** Check that every numbered citation refers to a page actually read. */
export function validateQuickCitations(report, sources) {
  const matches = [...String(report).matchAll(/\[(\d+)\]/g)]
  if (!matches.length) return false
  for (const match of matches) {
    const index = Number(match[1]) - 1
    if (!Number.isSafeInteger(index) || index < 0 || sources[index]?.read !== true || !sources[index]?.url) return false
  }
  return true
}

/** Keep each part's sources, renumbering citations into a single report. */
export function mergeDeepSources(parts) {
  const sources = []
  const texts = []
  for (const part of parts) {
    const offset = sources.length
    const items = Array.isArray(part.sources) ? part.sources : []
    sources.push(...items.map(source => ({ ...source, label: source.read === true ? 'verified' : 'unverified' })))
    texts.push(String(part.text).replace(/\[(\d+)\]/g, (original, number) => {
      const index = Number(number)
      if (!Number.isSafeInteger(index) || index < 1 || index > items.length) throw new Error('Invalid citation in research part')
      return `[${offset + index}]`
    }))
  }
  return { text: texts.join('\n\n'), sources }
}
