// relai-input-router: what goes to the helper model and what reaches Claude word for word — pure,
// no $ (plan MODY_OSZCZEDZANIA, E3; spec, section 1). The values are the spec's FACTs read from the
// BenAI build, kept 1:1 unless the column "Zmiana w RelAI" says otherwise.

import { isVerbatimFile } from './core/savings-gates.mjs'

/** A file or output under this many tokens reaches Claude whole. */
export const MIN_TOKENS = 2000
/** A ranged Read under this many lines (and under MIN_TOKENS) passes whole. */
export const SMALL_RANGE_LINES = 100
/** Share of a file read in pieces after which the next piece of SMALL_RANGE_LINES or more gets notes. */
export const PIECES_SHARE = 0.5
/** One helper call reads at most this many characters. */
export const CHUNK_CHARS = 120_000
/** All helper calls of one hand-off read at most this many characters; past it, head and tail. */
export const TOTAL_CHARS = 960_000
/** A file larger than this is read as head and tail only, never whole (spec: 3,9 MB). */
export const BIG_FILE_BYTES = 3_900_000
/** Lines longer than this are cut before they go to the helper. */
export const LINE_CHARS = 2000

/** Tokens of a text as the spec counts them: characters / 4, rounded up (ESTIMATE). */
export const tokensOf = (chars: number): number => Math.ceil(Math.max(0, chars) / 4)
export const textTokens = (text: string): number => tokensOf(String(text || '').length)

/**
 * A path from a tool's input made absolute and plain: `\` → `/`, a relative path joined to the
 * cwd, `.` and `..` folded. The mod keys its memory with it; copies are named by hash, never by it.
 */
export function normPath(p: string, cwd: string): string {
  // Windows aliases of one file: a trailing dot or space, an ::$DATA stream (review E3, LOW)
  const plain = String(p || '').replace(/\\/g, '/').replace(/::\$DATA$/i, '')
  const raw = /(?:^|\/)\.+$/.test(plain) ? plain : plain.replace(/[. ]+$/, '')
  const isAbs = /^[A-Za-z]:\//.test(raw) || raw.startsWith('/')
  const joined = isAbs ? raw : `${String(cwd || '').replace(/\\/g, '/').replace(/\/+$/, '')}/${raw}`
  const drive = /^[A-Za-z]:/.exec(joined)?.[0] ?? ''
  const rest = joined.slice(drive.length)
  const out: string[] = []
  for (const part of rest.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') { out.pop(); continue }
    out.push(part)
  }
  return `${drive}/${out.join('/')}`
}

// Files whose content is a secret by their name: they never reach the helper (spec, section 7)
const SECRET_FILE_RE = [/(?:^|\/)\.env(?:\.[^/]*)?$/i, /\.pem$/i, /\.key$/i, /\.p12$/i, /\.pfx$/i, /(?:^|\/)id_(?:rsa|dsa|ecdsa|ed25519)$/i]

export type Pass = { kind: 'pass', why: string }
export type Route = Pass | { kind: 'notes', why: string }

/** Why a file must reach Claude whole by its name alone, or null. */
export function fileGuard(path: string, relaiRoot: string | null): string | null {
  if (isVerbatimFile(path, relaiRoot)) return 'process or instruction file'
  if (SECRET_FILE_RE.some((re) => re.test(path))) return 'secret file'
  // An 8.3 short name (PROMPT~1.MD) may be any file, a guarded one too: it passes (review E3, LOW)
  if (/~\d/.test(path.split('/').pop() ?? '')) return 'short file name'
  return null
}

export type ReadInput = { offset?: number | null, limit?: number | null, pages?: string | null }
export const isRanged = (r: ReadInput): boolean => r.offset != null || r.limit != null

/**
 * A Read of a file that is not guarded by name. `piece`: what this Read returned (lines,
 * tokens); `file`: the whole file's tokens and lines; `coveredLines`: lines read in pieces before.
 */
export function readRoute(r: ReadInput, piece: { lines: number, tokens: number }, file: { lines: number, tokens: number }, coveredLines: number): Route {
  if (!isRanged(r)) return file.tokens >= MIN_TOKENS ? { kind: 'notes', why: 'large file' } : { kind: 'pass', why: 'small file' }
  if (piece.lines < SMALL_RANGE_LINES && piece.tokens < MIN_TOKENS) return { kind: 'pass', why: 'small range' }
  if (file.lines > 0 && coveredLines / file.lines > PIECES_SHARE) return { kind: 'notes', why: 'most of the file already read in pieces' }
  return piece.tokens >= MIN_TOKENS ? { kind: 'notes', why: 'large range' } : { kind: 'pass', why: 'small range' }
}

/** Lines read in pieces after this piece, never over the file's lines. */
export const addCovered = (covered: number, pieceLines: number, total: number): number => Math.min(Math.max(total, 0), covered + Math.max(pieceLines, 0))

// Programs whose output is a file's text (readers) and programs that only shape it (helpers).
// Anything else — build, tests, git, npm, grep, ls, find — keeps the command's output whole.
export const READERS = Object.freeze(['cat', 'tac', 'nl', 'head', 'tail', 'less', 'more', 'type', 'get-content', 'gc', 'jq', 'strings', 'zcat', 'bat'])
export const HELPERS = Object.freeze(['sort', 'uniq', 'cut', 'tr', 'sed', 'awk', 'column', 'fold', 'fmt', 'expand', 'iconv', 'select-object', 'out-string'])

type Segment = { program: string, args: string[] }

/** Words of a command line, quotes respected; separators `|`, `||`, `&&`, `;` and newlines split segments. */
export function segmentsOf(command: string): Segment[] {
  const segs: string[][] = [[]]
  let word = ''
  let quote = ''
  let hasWord = false
  const endWord = () => { if (hasWord) segs[segs.length - 1].push(word); word = ''; hasWord = false }
  const cmd = String(command || '')
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i]
    if (quote) { if (c === quote) quote = ''; else word += c; continue }
    if (c === '"' || c === "'") { quote = c; hasWord = true; continue }
    if (c === '|' || c === ';' || c === '\n' || (c === '&' && cmd[i + 1] === '&')) {
      endWord()
      if ((c === '|' && cmd[i + 1] === '|') || c === '&') i++
      segs.push([])
      continue
    }
    if (c === ' ' || c === '\t') { endWord(); continue }
    word += c
    hasWord = true
  }
  endWord()
  return segs.map((words) => {
    const w = words.filter((x) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(x)).map((x) => x.replace(/^\(+/, ''))
    const prog = (w[0] ?? '').split('/').pop()!.toLowerCase().replace(/\.exe$/, '')
    return { program: prog, args: w.slice(1) }
  }).filter((s) => s.program !== '')
}

/**
 * A Bash call after it ran. Notes only when every program is a reader or helper with at least one
 * reader, the call did not fail, no argument names a guarded file and the output is large.
 */
export function bashRoute(command: string, out: { tokens: number, isError: boolean, isPersisted?: boolean }, cwd: string, relaiRoot: string | null): Route {
  // Measured live 2026-11-11 (E3): an output the engine saved to a file (persistedOutputPath, over
  // ~30k characters) reaches Claude as a 2 KB preview and the path; notes would save nothing and
  // see only the cut stdout, so it passes
  if (out.isPersisted) return { kind: 'pass', why: 'output saved to a file by the engine' }
  const segs = segmentsOf(command)
  if (!segs.length) return { kind: 'pass', why: 'empty command' }
  if (!segs.every((s) => READERS.includes(s.program) || HELPERS.includes(s.program))) return { kind: 'pass', why: 'not a reader command' }
  if (!segs.some((s) => READERS.includes(s.program))) return { kind: 'pass', why: 'no reader' }
  if (out.isError) return { kind: 'pass', why: 'error output' }
  // Fail closed (review E3, HIGH): an argument the shell could still change — a redirect, $( ),
  // a glob, a backslash, a quote-joined value, a `-Path:x` or `--file=x` — passes the call whole,
  // because the file it reaches cannot be told from its spelling
  for (const s of segs) {
    for (const a of s.args) {
      if (!isPlainArg(a)) return { kind: 'pass', why: 'argument the shell may change' }
      if (a.startsWith('-')) continue
      const guard = fileGuard(normPath(a, cwd), relaiRoot)
      if (guard) return { kind: 'pass', why: guard }
    }
  }
  return out.tokens >= MIN_TOKENS ? { kind: 'notes', why: 'large output' } : { kind: 'pass', why: 'small output' }
}

/** A flag (`-n`, `--lines`) or a plain word: letters, digits and `_ . / : ~ + @ , % -` only. */
export function isPlainArg(a: string): boolean {
  if (a.startsWith('-')) return /^-{1,2}[A-Za-z0-9][A-Za-z0-9-]*$/.test(a) || /^-\d+$/.test(a)
  return /^[A-Za-z0-9_./:~+@,%-]+$/.test(a)
}

/** The file-like arguments of a command's segments (flags left out), for a guard on their real paths. */
export function fileArgsOf(command: string): string[] {
  return segmentsOf(command).flatMap((s) => s.args.filter((a) => !a.startsWith('-') && !/^\d+$/.test(a)))
}

export type Chunk = { text: string, firstLine: number, lastLine: number }

/**
 * The text the helper reads, in chunks of whole numbered lines: lines cut to LINE_CHARS; over
 * TOTAL_CHARS the head and the tail, with a line saying what was left out. `firstLine` is the
 * number of the text's first line in its file.
 */
export function chunksOf(text: string, firstLine = 1): Chunk[] {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  if (lines.length && lines[lines.length - 1] === '') lines.pop()
  const numbered = lines.map((l, i) => `${firstLine + i}\t${l.length > LINE_CHARS ? l.slice(0, LINE_CHARS) + ' [line cut]' : l}`)
  let kept = numbered.map((t, i) => ({ t, n: firstLine + i }))
  const total = numbered.reduce((n, t) => n + t.length + 1, 0)
  if (total > TOTAL_CHARS) {
    const half = TOTAL_CHARS / 2
    const head: typeof kept = []
    let size = 0
    for (const x of kept) { if (size + x.t.length + 1 > half) break; head.push(x); size += x.t.length + 1 }
    const tail: typeof kept = []
    size = 0
    for (let i = kept.length - 1; i >= head.length; i--) { const x = kept[i]; if (size + x.t.length + 1 > half) break; tail.unshift(x); size += x.t.length + 1 }
    const gap = { t: `[lines ${firstLine + head.length}-${tail.length ? tail[0].n - 1 : firstLine + kept.length - 1} left out: the text is over ${TOTAL_CHARS} characters]`, n: -1 }
    kept = [...head, gap, ...tail]
  }
  const chunks: Chunk[] = []
  let cur: typeof kept = []
  let size = 0
  const flush = () => {
    if (!cur.length) return
    const ns = cur.filter((x) => x.n > 0).map((x) => x.n)
    chunks.push({ text: cur.map((x) => x.t).join('\n'), firstLine: ns.length ? ns[0] : firstLine, lastLine: ns.length ? ns[ns.length - 1] : firstLine })
    cur = []
    size = 0
  }
  for (const x of kept) {
    if (size + x.t.length + 1 > CHUNK_CHARS && cur.length) flush()
    cur.push(x)
    size += x.t.length + 1
  }
  flush()
  return chunks
}

/** Lines of a text, as a file counts them. */
export const lineCount = (text: string): number => {
  const t = String(text || '')
  if (!t) return 0
  const n = t.split('\n').length
  return t.endsWith('\n') ? n - 1 : n
}

// PDF (spec: over 5 pages → notes; Poppler pdfinfo / pdftotext -f N -l M -enc UTF-8, 120 s)
export const PDF_MIN_PAGES = 5
export const PDF_MS = 120_000
export const isPdf = (path: string): boolean => /\.pdf$/i.test(String(path || ''))
export const pdfinfoArgv = (path: string): string[] => ['pdfinfo', path]
export const pdftotextArgv = (path: string, first?: number, last?: number): string[] =>
  ['pdftotext', ...(first ? ['-f', String(first)] : []), ...(last ? ['-l', String(last)] : []), '-enc', 'UTF-8', path, '-']

/** Pages from pdfinfo's output, or null. */
export function pdfinfoPages(stdout: string): number | null {
  const m = /^Pages:\s+(\d+)\s*$/m.exec(String(stdout || ''))
  return m ? Number(m[1]) : null
}

/** Pages of pdftotext's output: it ends every page with a form feed. Used when pdfinfo is missing (FACT 2026-11-11: native Windows PATH has pdftotext only). */
export function pdftextPages(text: string): number {
  const t = String(text || '')
  if (!t) return 0
  const ff = (t.match(/\f/g) || []).length
  return t.endsWith('\f') || /\f\s*$/.test(t) ? ff : ff + 1
}

/** The Read tool's `pages` argument ("3", "1-5") as a page span, or null. */
export function pagesSpan(pages: string | null | undefined): { first: number, last: number } | null {
  const m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(String(pages ?? ''))
  if (!m) return null
  const first = Number(m[1])
  const last = m[2] ? Number(m[2]) : first
  return first >= 1 && last >= first ? { first, last } : null
}
