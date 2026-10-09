// Display helpers. Polish labels, no locale APIs (the hooks environment has none guaranteed).

export function tokens(n: number): string {
  const v = Number(n) || 0
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1) + 'k'
  return String(Math.round(v))
}

// null means "price unknown": shown as such, never as $0
export function usd(n: number | null): string {
  if (n === null) return 'cena nieznana'
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

export function clock(ts: number): string {
  const d = new Date(ts)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

export function fileStamp(ts: number): string {
  const d = new Date(ts)
  const two = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}`
}

export function clip(text: string, max: number): string {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + '…' : s
}

export function basename(path: string): string {
  const parts = String(path || '').split(/[\\/]+/).filter(Boolean)
  return parts[parts.length - 1] || String(path || '')
}

const LIMIT_LABEL: Record<string, string> = { five_hour: '5 h', seven_day: 'tydzień', spend_limit: 'budżet' }

export function limitsText(limits: readonly { kind: string; percentUsed: number }[]): string {
  return limits.map((l) => `${LIMIT_LABEL[l.kind] || l.kind} ${Math.round(l.percentUsed)}%`).join(' · ')
}
