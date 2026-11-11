import { describe, expect, test } from 'claude-code/testing'
import {
  DEFAULTS, imageTokens, isUnreadable, outFormat, picturesOf, readSettings, replacePictures,
  rewriteCoordinates, skipReason, statedSize, targetSize,
} from './shrink'

// Result shapes as the E1 probe measured them (SONDY.md, point 1), data shortened
const BROWSER = [
  { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'J'.repeat(600) } },
  { type: 'text', text: '[Image: source: C:\\Users\\K\\tool-results\\shot.jpg]' },
  { type: 'text', text: 'Screenshot size: 799x609' },
  { type: 'text', text: '\n\nTab Context:\n- Executed on tabId: seed' },
]
const READ = { type: 'image', file: { base64: 'P'.repeat(600), type: 'image/jpeg', originalSize: 1995153, dimensions: { originalWidth: 1920, originalHeight: 1080, displayWidth: 1920, displayHeight: 1080 } } }
const MCP = [{ type: 'image', data: 'M'.repeat(600), mimeType: 'image/png' }]

describe('pictures in results', () => {
  test('the three shapes are found, text blocks are not pictures', () => {
    expect(picturesOf(BROWSER).map((p) => p.shape)).toEqual(['api'])
    expect(picturesOf(READ).map((p) => p.shape)).toEqual(['read'])
    expect(picturesOf(MCP).map((p) => [p.shape, p.mime])).toEqual([['mcp', 'image/png']])
    expect(picturesOf([{ type: 'text', text: 'x' }])).toEqual([])
    expect(picturesOf(undefined)).toEqual([])
  })

  test('replacing gives new objects and keeps the input as it was', () => {
    const out = replacePictures(BROWSER, [{ data: 'small', mime: 'image/jpeg', w: 512, h: 390 }]) as any[]
    expect(out[0].source.data).toBe('small')
    expect(out[0].source.type).toBe('base64')
    expect(BROWSER[0].source!.data.length).toBe(600)
    const r = replacePictures(READ, [{ data: 'small', mime: 'image/jpeg', w: 960, h: 540 }]) as any
    expect(r.file.base64).toBe('small')
    expect(r.file.dimensions.displayWidth).toBe(960)
    expect(r.file.dimensions.originalWidth).toBe(1920)
    expect(replacePictures(MCP, [null])).toEqual(MCP)
  })

  test('stated size from the screenshot line and from Read', () => {
    expect(statedSize(BROWSER)).toEqual({ w: 799, h: 609 })
    expect(statedSize(READ)).toEqual({ w: 1920, h: 1080 })
    expect(statedSize(MCP)).toBe(null)
  })
})

describe('size and tokens', () => {
  test('half the longer side, never under min, no change when already small', () => {
    expect(targetSize(1920, 1080, DEFAULTS)).toEqual({ w: 960, h: 540, f: 2 })
    expect(targetSize(799, 609, DEFAULTS)!.w).toBe(512)
    expect(targetSize(512, 300, DEFAULTS)).toBe(null)
    expect(targetSize(400, 300, DEFAULTS)).toBe(null)
  })

  test('tokens: ceil(w*h/750), the longer side capped at 1568', () => {
    expect(imageTokens(799, 609)).toBe(Math.ceil(799 * 609 / 750))
    // 1920x1080 is read at 1568x882 (1080 * 1568 / 1920 = 882)
    expect(imageTokens(1920, 1080)).toBe(Math.ceil(1568 * 882 / 750))
    expect(imageTokens(960, 540)).toBe(Math.ceil(960 * 540 / 750))
    expect(imageTokens(0, 10)).toBe(0)
  })

  test('settings: defaults, bounds, odd values fall back', () => {
    expect(readSettings(undefined)).toEqual({ scale: 0.5, min: 512 })
    expect(readSettings({ scale: 0.05, min: 9999 })).toEqual({ scale: 0.2, min: 1568 })
    expect(readSettings({ scale: 'x', min: Number.NaN })).toEqual({ scale: 0.5, min: 512 })
  })
})

describe('coordinates', () => {
  test('a browser screenshot line becomes the browser\'s own scaled form', () => {
    const out = rewriteCoordinates(BROWSER, 799, 609, 512, 390)
    expect(out.note).toBe(null)
    expect((out.result as any[])[2].text).toBe('Screenshot size: 512x390 0.64-scale view; coordinate frame: 799x609.')
    expect(BROWSER[2].text).toBe('Screenshot size: 799x609')
  })

  test('a result without that line gets a note with the factor', () => {
    const out = rewriteCoordinates(MCP, 1000, 500, 512, 256)
    expect(out.note).toContain('(x*1.95, y*1.95)')
  })
})

describe('what is left alone', () => {
  test('zoom and screenshots with their own scale are skipped, a plain screenshot is not', () => {
    expect(skipReason('mcp__Claude_Browser__computer', { action: 'zoom' })).toBe('zoom')
    expect(skipReason('mcp__Claude_Browser__computer', { action: 'screenshot', scale: 0.5 })).toBe('own scale')
    expect(skipReason('mcp__Claude_Browser__computer', { action: 'screenshot' })).toBe(null)
    expect(skipReason('Read', { file_path: 'a.png' })).toBe(null)
  })

  test('WebP passes, JPEG stays JPEG, the rest becomes PNG', () => {
    expect(isUnreadable('image/webp')).toBe(true)
    expect(isUnreadable('image/png')).toBe(false)
    expect(outFormat('image/jpeg')).toBe('jpeg')
    expect(outFormat('image/gif')).toBe('png')
  })
})
