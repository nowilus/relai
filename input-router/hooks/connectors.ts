// relai-input-router: large MCP connector results — pure, no $ (plan MODY_OSZCZEDZANIA, E4; spec,
// section 1, rows "Konektory" and "Konektory nietykane"). Probe E4 (POMIAR_E4.md): `ran.result` of a
// connector is the content block array itself, JSON arrives as the text of a `text` block, and the
// hook input carries no server provenance — the server comes from the tool name alone.

import { textTokens } from './route'
import type { Chunk } from './route'

/** Under this many characters a connector result reaches Claude whole (spec). */
export const CONNECTOR_MIN_CHARS = 16_000
/** At or under this after trimming: no helper call (spec). */
export const TRIMMED_MAX_CHARS = 8000
/** Text values are cut to this many characters… */
export const VALUE_CHARS = 1200
/** …when the cut takes at most this share of the text (spec: 20%). */
export const VALUE_CUT_SHARE = 0.2
/** Helper chunks for a connector (spec: 128 000 characters, at most 6). */
export const CONNECTOR_CHUNK_CHARS = 128_000
export const CONNECTOR_MAX_CHUNKS = 6
/** The whole prompt of one helper call, at most (spec: 150 000). */
export const CONNECTOR_PROMPT_CHARS = 150_000
/** Room kept in a chunk for the line saying what was left out. */
const GAP_ROOM = 200

/**
 * Connectors whose results are never touched (spec list, closed — rule 7) — tools that drive the
 * browser, the app, sessions, terminals and mods break when their results change.
 * `ccd` is a prefix (`ccd_session`, `ccd_view`…); the rest match a whole segment of the server name.
 */
export const UNTOUCHED = Object.freeze(['ccd', 'claude_browser', 'playwright', 'computer_use', 'terminal', 'visualize', 'scheduled_tasks', 'mcp_registry', 'mods'])
/** RelAI's own connectors (`relai_panel` of the Codex panel, any relai-* server) are never touched either. */
export const RELAI_MARK = 'relai'

/** `mcp__<server>__<tool>` → server, lower case with `-` as `_`; '' for anything else. */
export function serverOf(tool: string): string {
  const m = /^mcp__(.+?)__[^_].*$/.exec(String(tool || ''))
  return m ? m[1].toLowerCase().replace(/-/g, '_') : ''
}

/**
 * Whether a connector's results must reach Claude exactly as the server gave them. The spec's
 * `mods` read as the tools of mods and plugins (Łukasz, 2026-11-11, after the E4 review): a server
 * a plugin brings (`plugin_<plugin>_<server>`, a mod's own `$.tool.register` tools) and a server
 * named like an enabled plugin (`pluginNames`, from `enabledPlugins`) are untouched too.
 */
export function isUntouched(tool: string, pluginNames: readonly string[] = []): boolean {
  const s = serverOf(tool)
  if (!s) return true
  if (s.includes(RELAI_MARK)) return true
  if (s.startsWith('plugin_')) return true
  if (pluginNames.some((p) => p && s === p.toLowerCase().replace(/-/g, '_'))) return true
  return UNTOUCHED.some((i) => i === 'ccd'
    ? s === 'ccd' || s.startsWith('ccd_')
    : s === i || s.startsWith(`${i}_`) || s.endsWith(`_${i}`) || s.includes(`_${i}_`))
}

/** The text of a result made only of text blocks, or null (anything else passes: spec). */
export function textOfBlocks(result: unknown): string | null {
  if (!Array.isArray(result) || result.length === 0) return null
  const parts: string[] = []
  for (const b of result) {
    if (!b || typeof b !== 'object' || (b as any).type !== 'text' || typeof (b as any).text !== 'string') return null
    parts.push((b as any).text)
  }
  return parts.join('\n')
}

const isEmpty = (v: unknown): boolean =>
  v === null || v === undefined || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0)

/** A JSON value without the fields that carry nothing: null, '', [] and {} (deep). */
export function dropEmpty(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(dropEmpty)
  if (v && typeof v === 'object') {
    // fromEntries keeps a key named __proto__ as data (review E4, LOW)
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, dropEmpty(x)] as const).filter(([, y]) => !isEmpty(y)))
  }
  return v
}

/** Text values cut to `max` characters, deep; `lost` counts the characters cut away. */
export function cutValues(v: unknown, max = VALUE_CHARS): { value: unknown, lost: number } {
  let lost = 0
  const walk = (x: unknown): unknown => {
    if (typeof x === 'string') {
      if (x.length <= max) return x
      lost += x.length - max
      return `${x.slice(0, max)}…`
    }
    if (Array.isArray(x)) return x.map(walk)
    if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x as Record<string, unknown>).map(([k, y]) => [k, walk(y)]))
    return x
  }
  return { value: walk(v), lost }
}

const parse = (t: string): { ok: true, value: unknown } | { ok: false } => {
  try { return { ok: true, value: JSON.parse(t) } } catch { return { ok: false } }
}

/** Indented one space a level: short lines the helper can cite (no line is cut). */
const show = (v: unknown): string => JSON.stringify(v, null, 1)

export type ConnectorRoute =
  | { kind: 'pass', why: string }
  /** Claude gets `text` in place of the result; no helper call. */
  | { kind: 'local', action: 'trim' | 'cut', why: string, text: string }
  /** `text` goes to the helper in chunks. */
  | { kind: 'notes', why: string, text: string }

/**
 * Exactly one road for a connector result (spec): small or untouched → whole; JSON without its
 * empty fields at or under 8000 → that; text values cut to 1200 when the cut takes ≤ 20% and the
 * result then fits 8000 → that; else the helper reads it (the trimmed or cut text when JSON).
 */
export function connectorRoute(tool: string, result: unknown, isError = false, pluginNames: readonly string[] = []): ConnectorRoute {
  if (isError) return { kind: 'pass', why: 'the server reported an error' }
  if (isUntouched(tool, pluginNames)) return { kind: 'pass', why: 'untouched connector' }
  const text = textOfBlocks(result)
  if (text === null) return { kind: 'pass', why: 'not only text' }
  if (text.length < CONNECTOR_MIN_CHARS) return { kind: 'pass', why: `under ${CONNECTOR_MIN_CHARS} characters` }
  // A JSON.parse round trip changes integers past 2^53 (review E4, HIGH): such a text is read as text
  const p = hasBigInteger(text) ? { ok: false as const } : parse(text)
  if (!p.ok) return { kind: 'notes', why: `text over ${CONNECTOR_MIN_CHARS} characters`, text }
  const trimmed = show(dropEmpty(p.value))
  if (trimmed.length <= TRIMMED_MAX_CHARS) return { kind: 'local', action: 'trim', why: 'empty fields dropped', text: trimmed }
  const strings = stringChars(dropEmpty(p.value))
  const c = cutValues(dropEmpty(p.value))
  const isCutSmall = c.lost > 0 && strings > 0 && c.lost / strings <= VALUE_CUT_SHARE
  if (isCutSmall) {
    const cut = show(c.value)
    if (cut.length <= TRIMMED_MAX_CHARS) return { kind: 'local', action: 'cut', why: `text values cut to ${VALUE_CHARS}`, text: cut }
  }
  // The helper reads the trimmed view, never the cut one: the copy holds the same view, so the
  // lines its notes cite exist there and nothing it was not shown is missing (review E4, HIGH)
  return { kind: 'notes', why: `JSON over ${TRIMMED_MAX_CHARS} characters after trimming`, text: trimmed }
}

/** An unquoted integer of 16 digits or more: JSON.parse would round it. */
export const hasBigInteger = (text: string): boolean => /(?:^|[\[:,])\s*-?\d{16,}\s*(?=[\],}]|$)/m.test(String(text || ''))

/** Characters held in the string values of a JSON value. */
export function stringChars(v: unknown): number {
  if (typeof v === 'string') return v.length
  if (Array.isArray(v)) return v.reduce((n: number, x) => n + stringChars(x), 0)
  if (v && typeof v === 'object') return Object.values(v as Record<string, unknown>).reduce((n: number, x) => n + stringChars(x), 0)
  return 0
}

/** The text Claude reads when the result was trimmed or cut here, without a helper. */
export function localResult(o: { tool: string, action: 'trim' | 'cut', text: string, before: number, copyPath: string }): string {
  const what = o.action === 'trim' ? 'empty fields dropped' : `empty fields dropped, text values cut to ${VALUE_CHARS} characters`
  return [
    `[RelAI input-router] ${o.tool}: ${what}, ~${o.before} → ~${textTokens(o.text)} tokens. Full result: ${o.copyPath}`,
    '',
    o.text,
  ].join('\n')
}

/**
 * A connector's text in chunks of numbered lines for the helper: at most CONNECTOR_CHUNK_CHARS
 * each, at most CONNECTOR_MAX_CHUNKS (spec). A line longer than a chunk is split, its pieces keep
 * its number; nothing is cut away inside a kept chunk. Over the count: the first half and the last
 * half of the chunks, the first tail chunk opening with a line that says which lines were left out.
 */
export function connectorChunks(text: string): Chunk[] {
  const room = CONNECTOR_CHUNK_CHARS - GAP_ROOM
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  if (lines.length && lines[lines.length - 1] === '') lines.pop()
  const pieces: { t: string, n: number }[] = []
  lines.forEach((l, i) => {
    const head = `${i + 1}\t`
    if (head.length + l.length <= room) { pieces.push({ t: head + l, n: i + 1 }); return }
    for (let at = 0; at < l.length; at += room - head.length) pieces.push({ t: head + l.slice(at, at + room - head.length), n: i + 1 })
  })
  const chunks: { t: string[], first: number, last: number }[] = []
  let cur: { t: string[], first: number, last: number } | null = null
  let size = 0
  for (const p of pieces) {
    if (cur && size + p.t.length + 1 > room) { chunks.push(cur); cur = null }
    if (!cur) { cur = { t: [], first: p.n, last: p.n }; size = 0 }
    cur.t.push(p.t)
    cur.last = p.n
    size += p.t.length + 1
  }
  if (cur) chunks.push(cur)
  let kept = chunks
  if (chunks.length > CONNECTOR_MAX_CHUNKS) {
    const half = CONNECTOR_MAX_CHUNKS / 2
    const tail = chunks.slice(chunks.length - half)
    const from = chunks[half].first
    const to = Math.max(from, tail[0].first - 1)
    const gap = `[lines ${from}-${to} (or parts of them) left out: the result is over ${CONNECTOR_MAX_CHUNKS} chunks of ${CONNECTOR_CHUNK_CHARS} characters]`
    kept = [...chunks.slice(0, half), { ...tail[0], t: [gap, ...tail[0].t] }, ...tail.slice(1)]
  }
  return kept.map((c) => ({ text: c.t.join('\n'), firstLine: c.first, lastLine: c.last }))
}

/** The result in the shape core gave it: one text block (probe E4). */
export const asBlocks = (text: string): { type: 'text', text: string }[] => [{ type: 'text', text }]
