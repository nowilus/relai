// Display helpers of the three RelAI bars above the prompt (relai-panel, relai-progress,
// relai-cache-keeper). Polish labels, no locale APIs (the hooks environment has none guaranteed).
//
// One file, three copies byte for byte (AUDYT_MODOW Z6): a plugin imports only from its own folder
// (P-017 pkt 1), so each holds the same fmt.ts, and core/panel/tests/mods-parity.test.js fails when
// a copy drifts. Change all three together; the union of what the three need lives here.

// Dollars with cents always, as brief v2 writes "sesja ≈ $11.73": "$190" hid what "$11" against
// "$190" was made of. null means the price is unknown: said so, never shown as $0; a caller whose
// null means "nothing measured" says that in its own words before it calls this.
export function usd(n: number | null): string {
  if (n === null) return 'cena nieznana'
  if (n === 0) return '$0'
  if (n < 0.01) return '<$0.01'
  return '$' + n.toFixed(2)
}

// Tokens in one unit per size: 999, 1.0k–99.9k, 100k–999k, 1.0M–9.9M, 10M. The unit is chosen on
// the rounded figure, so a boundary never reads "1000k", "100.0k" or "1000" (Z1 found the first).
export function tokens(n: number): string {
  const v = Math.round(Number(n) || 0)
  if (v < 1_000) return String(v)
  if (v < 99_950) return (v / 1e3).toFixed(1) + 'k'
  if (v < 999_500) return (v / 1e3).toFixed(0) + 'k'
  if (v < 9_950_000) return (v / 1e6).toFixed(1) + 'M'
  return (v / 1e6).toFixed(0) + 'M'
}

// A share in whole percent, "96 %" (brief v2 §7, AUDYT_MODOW Z2). What calibration 2026-10-08
// asked of the two decimals stays: a share short of the whole never reads 100 %, and a share above
// nothing never reads 0 %.
export function pct(part: number, whole: number): string {
  const p = whole > 0 ? (part / whole) * 100 : 0
  if (p > 0 && p < 1) return '<1 %'
  return `${p < 100 ? Math.min(99, Math.round(p)) : Math.round(p)} %`
}

const LIMIT_LABEL: Record<string, string> = { five_hour: '5 h', seven_day: 'tydzień', spend_limit: 'budżet' }

// The account's limits in whole percents: "5 h 42% · tydzień 7%"
export function limitsText(limits: readonly { kind: string; percentUsed: number }[]): string {
  return limits.map((l) => `${LIMIT_LABEL[l.kind] || l.kind} ${Math.round(l.percentUsed)}%`).join(' · ')
}

// A stretch of time in minutes: "12 min", "2 h 05 min"
export function minutes(ms: number): string {
  const m = Math.max(0, Math.round((Number(ms) || 0) / 60000))
  if (m < 60) return m + ' min'
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'
}

// How long an agent ran: "42 s", "3 min 05 s", "1 h 02 min"
export function duration(ms: number): string {
  const s = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  if (s < 60) return s + ' s'
  const m = Math.floor(s / 60)
  if (m < 60) return m + ' min ' + String(s % 60).padStart(2, '0') + ' s'
  return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'
}

// A local time of day: "09:05"
export function clock(ts: number): string {
  const d = new Date(ts)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

// A local time for a file name: "2026-10-10-0905"
export function fileStamp(ts: number): string {
  const d = new Date(ts)
  const two = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}`
}

export function clip(text: string, max: number): string {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? s.slice(0, Math.max(0, max - 1)) + '…' : s
}

// Windows paths from $.session.cwd() joined with forward slashes, which $.fs takes on every OS
export function join(dir: string, rel: string): string {
  return (dir.replace(/[\\/]+$/, '') + '/' + rel).replace(/\\/g, '/')
}

export function basename(path: string): string {
  const parts = String(path || '').split(/[\\/]+/).filter(Boolean)
  return parts[parts.length - 1] || String(path || '')
}
