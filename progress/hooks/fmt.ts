// Display helpers of relai-progress. Polish labels, no locale APIs (the hooks environment has none
// guaranteed). usd, tokens and join are relai-panel's (panel/hooks/fmt.ts): a plugin imports only
// from its own folder, so the few it needs live here too.

// null means "no figure": shown as such, never as $0
export function usd(n: number | null): string {
  if (n === null) return 'brak pomiaru'
  if (n === 0) return '$0'
  if (n < 0.01) return '<$0.01'
  return '$' + n.toFixed(2)
}

export function tokens(n: number): string {
  const v = Number(n) || 0
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1) + 'k'
  return String(Math.round(v))
}

// A percent of the progress model (two decimals already, cut): 33.33 -> "33.33%"
export function percentText(p: number): string {
  return p.toFixed(2) + '%'
}

// How long an agent ran: "42 s", "3 min 05 s", "1 h 02 min"
export function duration(ms: number): string {
  const s = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  if (s < 60) return s + ' s'
  const m = Math.floor(s / 60)
  if (m < 60) return m + ' min ' + String(s % 60).padStart(2, '0') + ' s'
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'
}

// A text bar of `width` cells: what both surfaces draw alike
export function bar(percent: number, width: number): string {
  const filled = Math.max(0, Math.min(width, Math.floor((width * percent) / 100)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export function clip(text: string, max: number): string {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + '…' : s
}

// Windows paths from $.session.cwd() joined with forward slashes, which $.fs takes on every OS
export function join(dir: string, rel: string): string {
  return (dir.replace(/[\\/]+$/, '') + '/' + rel).replace(/\\/g, '/')
}
