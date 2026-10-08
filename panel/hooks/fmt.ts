// Display helpers of the band. Polish labels, no locale APIs (the hooks environment has none guaranteed).

// null means "no figure": shown as such, never as $0
export function usd(n: number | null): string {
  if (n === null) return 'brak pomiaru'
  if (n === 0) return '$0'
  if (n < 0.01) return '<$0.01'
  if (n < 10) return '$' + n.toFixed(2)
  return '$' + n.toFixed(0)
}

export function minutes(ms: number): string {
  const m = Math.max(0, Math.round((Number(ms) || 0) / 60000))
  if (m < 60) return m + ' min'
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'
}

export function tokens(n: number): string {
  const v = Number(n) || 0
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1) + 'k'
  return String(Math.round(v))
}

export function clip(text: string, max: number): string {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + '…' : s
}

// Windows paths from $.session.cwd() joined with forward slashes, which $.fs takes on every OS
export function join(dir: string, rel: string): string {
  return (dir.replace(/[\\/]+$/, '') + '/' + rel).replace(/\\/g, '/')
}
