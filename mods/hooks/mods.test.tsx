import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'
import { cliError, enabledOf, toggleArgv } from './inventory'

type On = Parameters<TestBody>[1]

const HOME = 'C:\\Users\\Ktos'
const INSTALLED = JSON.stringify({
  version: 2,
  plugins: {
    'filetree@claude-code-filetree': [{ scope: 'user', version: '0.2.24', installPath: 'C:\\x\\filetree' }],
    'security-guidance@claude-plugins-official': [{ scope: 'local', projectPath: 'C:\\Users\\Ktos\\Desktop\\Parkly', version: '2.0.0', installPath: 'C:\\x\\sg' }],
    'relai@relai': [{ scope: 'user', version: '3.2.0', installPath: 'C:\\x\\relai' }],
  },
})
const SETTINGS = '﻿' + JSON.stringify({
  enabledPlugins: { 'filetree@claude-code-filetree': false, 'relai@relai': true, odd: 'yes' },
  hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node "C:\\h\\stop-me.js"' }] }] },
})

describe('switch', () => {
  test('enabledPlugins keeps booleans only, a BOM is dropped', () => {
    expect(enabledOf(SETTINGS)).toEqual({ 'filetree@claude-code-filetree': false, 'relai@relai': true })
    expect(enabledOf('[')).toEqual({})
  })

  test('the switch flips: on disables, off and no key enable, scope kept', () => {
    expect(toggleArgv('claude', { id: 'a@b', scope: 'user', state: 'on' })).toEqual(['claude', 'plugin', 'disable', 'a@b', '--scope', 'user'])
    expect(toggleArgv('claude', { id: 'a@b', scope: 'local', state: 'none' })).toEqual(['claude', 'plugin', 'enable', 'a@b', '--scope', 'local'])
  })

  test('an error is the exit code and the first non-empty line', () => {
    expect(cliError({ exitCode: 1, stdout: '', stderr: '\n  ✘ Plugin "x" not found\nmore' })).toBe('Błąd CLI (kod 1): ✘ Plugin "x" not found')
    expect(cliError({ exitCode: null, stdout: '', stderr: '' })).toBe('Błąd CLI (kod brak): bez komunikatu')
  })
})

const PANE = {
  plugin: 'relai-mods',
  component: 'Pane',
  requestId: 'relai-mods',
  props: { title: 'RelAI Mods', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} },
} as const

function engine(on: On, exitCode: number, calls: string[][]) {
  // The engine hands paths on with forward slashes: the disk is keyed the same way
  const key = (path: string) => path.replace(/\\/g, '/')
  const disk: Record<string, string> = {
    [key(`${HOME}/.claude/plugins/installed_plugins.json`)]: INSTALLED,
    [key(`${HOME}/.claude/settings.json`)]: SETTINGS,
    'C:/x/filetree/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
    'C:/x/relai/.claude-plugin/plugin.json': JSON.stringify({ description: 'relai', commands: ['./a/commands/'] }),
    'C:/x/relai/hooks/hooks.json': JSON.stringify({ hooks: { SessionStart: [], SessionEnd: [] } }),
    'C:/x/relai/a/commands/one.md': '#',
    'C:/x/relai/a/commands/two.md': '#',
    'C:/x/relai/skills/core/SKILL.md': '#',
  }
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : '' }))
  on('settings.read', () => ({ value: {} }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(`${key(e.path)}/`)) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] } : { deny: `ENOENT ${e.path}` }))
  on('fs.list', ($, e) => {
    const dir = `${key(e.path)}/`
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return { value: names.map((n) => ({ name: n, kind: below.includes(n) ? 'file' as const : 'dir' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('process.run', ($, e) => {
    calls.push([...e.argv])
    return { value: { exitCode, stdout: '', stderr: exitCode ? 'Error: plugin not found' : '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('command.register', () => ({ value: { command: 'relai-mods' } }))
  on('command.list', () => ({ value: [] }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.panes', () => ({ value: [] }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('clock.now', () => ({ value: 0 }))
}

describe('pane', () => {
  for (const surface of ['desktop', 'terminal'] as const) {
    test(`lists every install and the switch calls the CLI once (${surface})`, async ($, on) => {
      const calls: string[][] = []
      engine(on, 0, calls)
      await $.session.start({ cwd: 'C:/proj', surface, isInteractive: true })
      const ui = await $.ui.mount({ ...PANE, surface })
      expect((await ui.find({ type: 'Text', text: /włączone ·/ }))?.text).toBe('1/3 włączone · 1 hook własny')
      expect((await ui.find({ type: 'Text', text: /^local · 2\.0\.0 · / }))?.text).toBe('local · 2.0.0 · wyłączony')
      expect((await ui.find({ type: 'Text', text: /brak wpisu w enabledPlugins/ }))?.text).toBe('— · brak plików na dysku · brak wpisu w enabledPlugins')
      // a mod by its hooks.json though off; relai's counts from its manifest path and the default skills/
      expect((await ui.find({ type: 'Text', text: /^mod$/ }))?.text).toBe('mod')
      expect((await ui.find({ type: 'Text', text: /komendy/ }))?.text).toBe('1 skill · 0 agentów · 2 komendy · 0 MCP · zdarzenia: SessionStart, SessionEnd')
      expect((await ui.find({ type: 'Text', text: /stop-me\.js/ }))?.text).toBe('stop-me.js')
      expect(await ui.find({ type: 'Text', text: /Komenda \/filetree/ })).toBeFalsy()
      await ui.press({ key: 'flip' })
      expect(calls).toEqual([['claude', 'plugin', 'enable', 'filetree@claude-code-filetree', '--scope', 'user']])
      expect((await ui.find({ type: 'Text', text: /Włączony: filetree/ }))?.text ?? '').toContain('Przeładuj')
      await ui.unmount()
    })
  }

  test('a failed call shows its exit code and the switch still reads the disk', async ($, on) => {
    const calls: string[][] = []
    engine(on, 1, calls)
    await $.session.start({ cwd: 'C:/proj', surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'flip' })
    expect((await ui.find({ type: 'Text', text: /^Błąd CLI/ }))?.text).toBe('Błąd CLI (kod 1): Error: plugin not found')
    expect(await ui.find({ type: 'Button', key: 'flip' })).toBeTruthy()
    await ui.unmount()
  })
})
