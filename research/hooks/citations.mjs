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

const labelOf = (read) => (read === true ? 'verified' : 'unverified')

/** Keep each part's sources, renumbering citations into a single report; one URL gets one number (Aneks E.6). */
export function mergeDeepSources(parts) {
  let sources = []
  const texts = []
  for (const part of parts) {
    const items = Array.isArray(part.sources) ? part.sources : []
    const numbers = items.map((source) => {
      const at = sources.findIndex((s) => s.url === source.url)
      if (at < 0) {
        sources = [...sources, { ...source, label: labelOf(source.read) }]
        return sources.length
      }
      const read = sources[at].read === true || source.read === true
      sources = sources.map((s, i) => (i === at ? { ...s, read, label: labelOf(read) } : s))
      return at + 1
    })
    texts.push(String(part.text).replace(/\[(\d+)\]/g, (original, number) => {
      const index = Number(number)
      if (!Number.isSafeInteger(index) || index < 1 || index > items.length) throw new Error('Invalid citation in research part')
      return `[${numbers[index - 1]}]`
    }))
  }
  return { text: texts.join('\n\n'), sources }
}
