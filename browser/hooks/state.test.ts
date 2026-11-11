import { describe, expect, test } from 'claude-code/testing'
import { LIMIT_MS, parseResize, platformOf, resizeArgv, resizeEnv } from './resize'
import { decide, parseCommand } from './state'
import type { Gate } from './state'

const OK: Gate = { isTwinActive: false, projectRoot: 'C:/p', consent: 'yes', hasHuman: true, hasTool: true }

describe('decision', () => {
  test('everything in place: shrink', () => {
    expect(decide(OK)).toEqual({ kind: 'shrink' })
  })

  test('the twin wins over everything, and says why', () => {
    const d = decide({ ...OK, isTwinActive: true })
    expect(d.kind).toBe('idle')
    expect((d as any).why).toContain('efficient-browser-use')
  })

  test('no answer yet: a person is asked, a session with no person stays passive (rule 15)', () => {
    expect(decide({ ...OK, consent: null })).toEqual({ kind: 'ask' })
    expect(decide({ ...OK, consent: null, hasHuman: false }).kind).toBe('idle')
  })

  test('a no, no project, or no tool: passive', () => {
    expect(decide({ ...OK, consent: 'no' }).kind).toBe('idle')
    expect(decide({ ...OK, projectRoot: null }).kind).toBe('idle')
    expect(decide({ ...OK, hasTool: false }).kind).toBe('idle')
  })
})

describe('command', () => {
  test('full, pane, scale and min with a number, a comma read as a point', () => {
    expect(parseCommand('full')).toEqual({ kind: 'full' })
    expect(parseCommand('pane')).toEqual({ kind: 'pane' })
    expect(parseCommand('scale 0,4')).toEqual({ kind: 'scale', value: 0.4 })
    expect(parseCommand('min 640')).toEqual({ kind: 'min', value: 640 })
    expect(parseCommand('')).toEqual({ kind: 'status' })
    expect(parseCommand('scale').kind).toBe('bad')
    expect(parseCommand('nonsense').kind).toBe('bad')
  })

  test('describe and shrink switch the mode (E2); a model id is checked, never a path', () => {
    expect(parseCommand('describe')).toEqual({ kind: 'describe', model: null })
    expect(parseCommand('describe claude-haiku-5-5')).toEqual({ kind: 'describe', model: 'claude-haiku-5-5' })
    expect(parseCommand('describe ../../x').kind).toBe('bad')
    expect(parseCommand('shrink')).toEqual({ kind: 'shrink' })
  })
})

describe('system tool', () => {
  test('platform from the cwd; no tool outside Windows and macOS', () => {
    expect(platformOf('C:\\Users\\K\\proj')).toBe('windows')
    expect(platformOf('/Users/k/proj')).toBe('mac')
    expect(platformOf('/home/k/proj')).toBe('other')
    expect(resizeArgv('other')).toBe(null)
    expect(resizeArgv('windows')![0]).toBe('powershell.exe')
    expect(resizeArgv('mac')![0]).toBe('/bin/sh')
    expect(LIMIT_MS.windows).toBe(30000)
  })

  test('the scale crosses as invariant text (a Polish Windows would read 0,5)', () => {
    expect(resizeEnv(0.5, 512, 'jpeg')).toEqual({ RELAI_SCALE: '0.5', RELAI_MIN: '512', RELAI_FMT: 'jpeg' })
    expect(resizeArgv('windows')!.join(' ')).toContain('InvariantCulture')
  })

  test('the script answers in one of two forms; anything else is no answer', () => {
    expect(parseResize('SAME 400 300')).toEqual({ kind: 'same', w: 400, h: 300 })
    expect(parseResize('1920 1080 960 540 iVBORw0KGgo=\r\n')).toEqual({ kind: 'shrunk', w: 1920, h: 1080, nw: 960, nh: 540, data: 'iVBORw0KGgo=' })
    expect(parseResize('Exception calling FromStream')).toBe(null)
    expect(parseResize('')).toBe(null)
  })
})
