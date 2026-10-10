// Pure logic: the project's start layer S for the handoff reckoning (AUDYT_MODOW Z9). No `$`,
// no I/O: register.tsx reads the files and the store, these functions only count and say.

export type StartLayer = { tokens: number; source: string }

// What a fresh session's first turn measured, kept per project in the store
export type MeasuredStart = { tokens: number; date: string }

// The files of the RelAI start ritual (CLAUDE.md "Rytuał startu sesji"), relative to the root
export const RITUAL_FILES = ['CLAUDE.md', 'docs/STATE.md', 'docs/USTAWIENIA.md', 'docs/LEKCJE.md', 'docs/DZIENNIK.md'] as const
export const JOURNAL = 'docs/DZIENNIK.md'
export const JOURNAL_BYTES = 12 * 1024 // the ritual reads the risks and the last entry, not the whole journal
const BYTES_PER_TOKEN = 4

export const startKey = (root: string): string => 'start:' + String(root || '').replace(/\\/g, '/')

// "2026-10-10" in local time
export function dateText(ts: number): string {
  const d = new Date(ts)
  const two = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`
}

// UTF-8 length without TextEncoder (the hooks environment guarantees none)
export function utf8Bytes(text: string): number {
  let n = 0
  for (const ch of String(text || '')) {
    const c = ch.codePointAt(0) ?? 0
    n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4
  }
  return n
}

// The active plan's STATUS.md that CLAUDE.md names on its "Aktywny plan" line, or null
export function activePlanStatus(claudeMd: string): string | null {
  const line = String(claudeMd || '').split(/\r?\n/).find((l) => /^\s*(Aktywny plan|Active plan)\s*:/i.test(l))
  const m = line?.match(/\]\(([^)\s]*STATUS\.md)\)/)
  return m && m[1] ? m[1].replace(/^\.\//, '') : null
}

export function measuredLayer(m: MeasuredStart): StartLayer {
  return { tokens: m.tokens, source: `zmierzona po pierwszej turze sesji ${m.date}` }
}

// The fallback: the ritual files' bytes ÷ 4; null when none of them could be read
export function estimatedLayer(files: readonly { path: string; text: string | null }[]): StartLayer | null {
  const read = files.filter((f) => f.text !== null)
  if (!read.length) return null
  const bytes = read.reduce((sum, f) => {
    const size = utf8Bytes(f.text as string)
    return sum + (f.path === JOURNAL ? Math.min(size, JOURNAL_BYTES) : size)
  }, 0)
  if (bytes <= 0) return null
  return {
    tokens: Math.round(bytes / BYTES_PER_TOKEN),
    source: `szacunek z plików rytuału startu: ${bytes} B ÷ 4, z dziennika pierwsze 12 KB`,
  }
}
