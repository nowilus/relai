// relai-browser: the picture logic — pure, no $ (P-017). Which results carry a picture, which to
// leave alone, the target size, the token estimate and the coordinate note. Behaviour: spec of
// plan MODY_OSZCZEDZANIA, section 3; result shapes measured by the E1 probe (SONDY.md, point 1).

/** Defaults and bounds of the settings (spec, section 3). */
export const DEFAULTS = { scale: 0.5, min: 512 } as const
export const SCALE_RANGE = [0.2, 0.9] as const
export const MIN_RANGE = [256, 1568] as const
/** Longer side the API reads a picture at; tokens = ceil(w*h/750) after that cap. */
export const MAX_SIDE = 1568
const TOKEN_AREA = 750

export type Settings = { scale: number, min: number }

/** A picture inside a tool result: where it sits and what it holds. */
export type Picture = {
  /** api: {type:'image', source:{data, media_type}}; mcp: {type:'image', data, mimeType}; read: {type:'image', file:{base64, type}} */
  shape: 'api' | 'mcp' | 'read'
  data: string
  mime: string
}

/** Estimated tokens of a w×h picture as the API reads it. */
export function imageTokens(w: number, h: number): number {
  if (!(w > 0 && h > 0)) return 0
  const long = Math.max(w, h)
  const f = long > MAX_SIDE ? MAX_SIDE / long : 1
  return Math.ceil((w * f) * (h * f) / TOKEN_AREA)
}

/** Target size, or null when the picture is already small enough. */
export function targetSize(w: number, h: number, s: Settings): { w: number, h: number, f: number } | null {
  const long = Math.max(w, h)
  const t = Math.max(Math.floor(long * s.scale + 0.5), s.min)
  if (!(long > 0) || t >= long) return null
  return { w: Math.max(1, Math.round(w * t / long)), h: Math.max(1, Math.round(h * t / long)), f: long / t }
}

const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v))

/** Settings from what the store holds; anything odd falls back to the default. */
export function readSettings(stored: unknown): Settings {
  const o = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>
  const scale = typeof o.scale === 'number' && Number.isFinite(o.scale) ? clamp(o.scale, SCALE_RANGE) : DEFAULTS.scale
  const min = typeof o.min === 'number' && Number.isFinite(o.min) ? Math.round(clamp(o.min, MIN_RANGE)) : DEFAULTS.min
  return { scale, min }
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

function pictureOf(v: unknown): Picture | null {
  if (!isObj(v) || v.type !== 'image') return null
  if (isObj(v.source) && typeof v.source.data === 'string') return { shape: 'api', data: v.source.data, mime: String(v.source.media_type || '') }
  if (isObj(v.file) && typeof v.file.base64 === 'string') return { shape: 'read', data: v.file.base64, mime: String(v.file.type || '') }
  if (typeof v.data === 'string') return { shape: 'mcp', data: v.data, mime: String(v.mimeType || '') }
  return null
}

/** The pictures of a tool result's `result`, in order. */
export function picturesOf(result: unknown): Picture[] {
  if (Array.isArray(result)) return result.map(pictureOf).filter((p): p is Picture => p !== null)
  const one = pictureOf(result)
  return one ? [one] : []
}

/** A picture block with new data, mime and size; the block's other fields are kept. */
function withData(v: Obj, p: Picture, data: string, mime: string, w: number, h: number): Obj {
  if (p.shape === 'api') return { ...v, source: { ...(v.source as Obj), data, media_type: mime } }
  if (p.shape === 'read') {
    const file = v.file as Obj
    const dims = isObj(file.dimensions) ? { ...file.dimensions, displayWidth: w, displayHeight: h } : file.dimensions
    return { ...v, file: { ...file, base64: data, type: mime, dimensions: dims } }
  }
  return { ...v, data, mimeType: mime }
}

export type Replacement = { data: string, mime: string, w: number, h: number } | null

/**
 * `result` with the i-th picture replaced by `repl[i]` (null keeps it). New objects only;
 * the result given in is not changed.
 */
export function replacePictures(result: unknown, repl: Replacement[]): unknown {
  let i = 0
  const swap = (v: unknown): unknown => {
    const p = pictureOf(v)
    if (!p) return v
    const r = repl[i++]
    return r ? withData(v as Obj, p, r.data, r.mime, r.w, r.h) : v
  }
  return Array.isArray(result) ? result.map(swap) : swap(result)
}

/** The size a result states for a picture: Claude_Browser's line, or Read's dimensions. */
export function statedSize(result: unknown): { w: number, h: number } | null {
  const blocks = Array.isArray(result) ? result : [result]
  for (const b of blocks) {
    if (!isObj(b)) continue
    if (b.type === 'text' && typeof b.text === 'string') {
      const m = /^Screenshot size: (\d+)x(\d+)\s*$/.exec(b.text)
      if (m) return { w: Number(m[1]), h: Number(m[2]) }
    }
    if (isObj(b.file) && isObj(b.file.dimensions)) {
      const d = b.file.dimensions
      if (typeof d.displayWidth === 'number' && typeof d.displayHeight === 'number') return { w: d.displayWidth, h: d.displayHeight }
    }
  }
  return null
}

const SIZE_LINE = /^Screenshot size: (\d+)x(\d+)\s*$/

/**
 * Coordinates after a shrink. A Claude_Browser screenshot line becomes the browser's own scaled
 * form ("Screenshot size: 400x305 0.5-scale view; coordinate frame: 799x609."), so clicks are
 * given in the original frame as the browser expects. Any other result gets a note.
 */
export function rewriteCoordinates(result: unknown, w: number, h: number, nw: number, nh: number): { result: unknown, note: string | null } {
  if (Array.isArray(result)) {
    let isDone = false
    const out = result.map((b) => {
      if (isDone || !isObj(b) || b.type !== 'text' || typeof b.text !== 'string' || !SIZE_LINE.test(b.text)) return b
      isDone = true
      const f = Math.round((nw / w) * 100) / 100
      return { ...b, text: `Screenshot size: ${nw}x${nh} ${f}-scale view; coordinate frame: ${w}x${h}.` }
    })
    if (isDone) return { result: out, note: null }
  }
  const f = Math.round((w / nw) * 100) / 100
  return { result, note: `relai-browser: picture shrunk ${w}x${h} -> ${nw}x${nh}; a point (x, y) on it is (x*${f}, y*${f}) on the original.` }
}

/**
 * Why a call's pictures are left alone, or null to shrink. `args` is the tool call's input.
 * Zoom shots and screenshots with their own scale are the person's choice (spec, section 3).
 */
export function skipReason(tool: string, args: Record<string, unknown>): string | null {
  if (/Claude_Browser__computer$/.test(tool) || /computer$/.test(tool)) {
    if (args.action === 'zoom') return 'zoom'
    if (args.scale !== undefined) return 'own scale'
  }
  return null
}

/** Pictures Windows System.Drawing cannot read pass unchanged (spec: WebP). */
export const isUnreadable = (mime: string): boolean => /webp/i.test(mime)

/** Output format: JPEG stays JPEG, the rest becomes PNG. */
export const outFormat = (mime: string): 'jpeg' | 'png' => (/jpe?g/i.test(mime) ? 'jpeg' : 'png')
