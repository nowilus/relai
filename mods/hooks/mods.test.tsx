import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'
import { cliError, enabledOf, listBlock, median, parseInstalled, toggleArgv } from './inventory'

type On = Parameters<TestBody>[1]

const HOME = 'C:\\Users\\Ktos'
const INSTALLED = JSON.stringify({
  version: 2,
  plugins: {
    'filetree@claude-code-filetree': [{ scope: 'user', version: '0.2.24', installPath: 'C:\\x' }],
    'security-guidance@claude-plugins-official': [{ scope: 'local', projectPath: 'C:\\Users\\Ktos\\Desktop\\Parkly', version: '2.0.0' }],
    'relai@relai': [{ scope: 'user', version: '3.2.0' }],
  },
})
const SETTINGS = '﻿' + JSON.stringify({ enabledPlugins: { 'filetree@claude-code-filetree': false, 'relai@relai': true, odd: 'yes' } })

describe('inventory', () => {
  test('one row per install, state from enabledPlugins, no key is its own state', () => {
    const rows = parseInstalled(INSTALLED, enabledOf(SETTINGS))
    expect(rows.map((r) => `${r.id}|${r.scope}|${r.state}`)).toEqual([
      'filetree@claude-code-filetree|user|off',
      'relai@relai|user|on',
      'security-guidance@claude-plugins-official|local|none',
    ])
    expect(rows[2].projectPath).toBe('C:\\Users\\Ktos\\Desktop\\Parkly')
  })

  test('unreadable files give an empty list, not a throw', () => {
    expect(parseInstalled(null, {})).toEqual([])
    expect(parseInstalled('{nie json', enabledOf('['))).toEqual([])
  })

  test('the switch flips: on disables, off and no key enable, scope kept', () => {
    expect(toggleArgv('claude', { id: 'a@b', scope: 'user', state: 'on' })).toEqual(['claude', 'plugin', 'disable', 'a@b', '--scope', 'user'])
    expect(toggleArgv('claude', { id: 'a@b', scope: 'local', state: 'none' })).toEqual(['claude', 'plugin', 'enable', 'a@b', '--scope', 'local'])
  })

  test('an error is the exit code and the first non-empty line', () => {
    expect(cliError({ exitCode: 1, stdout: '', stderr: '\n  ✘ Plugin "x" not found\nmore' })).toBe('Błąd CLI (kod 1): ✘ Plugin "x" not found')
    expect(cliError({ exitCode: null, stdout: '', stderr: '' })).toBe('Błąd CLI (kod brak): bez komunikatu')
  })

  test('listBlock takes the lines of one plugin; median of odd and even', () => {
    const list = 'Installed plugins:\n\n  ❯ a@b\n    Version: 1\n    Status: ✔ enabled\n\n  ❯ c@d\n    Version: 2\n'
    expect(listBlock(list, 'a@b')).toBe('❯ a@b | Version: 1 | Status: ✔ enabled')
    expect(listBlock(list, 'x@y')).toBe('')
    expect(median([30, 10, 20])).toBe(20)
    expect(median([10, 20])).toBe(15)
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
  }
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : '' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] } : { deny: `ENOENT ${e.path}` }))
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
      expect((await ui.find({ type: 'Text', text: /installed_plugins\.json · 3/ }))?.text).toBe('Pluginy z installed_plugins.json · 3')
      expect((await ui.find({ type: 'Text', text: /^local · 2\.0\.0 · brak wpisu$/ }))?.text).toBe('local · 2.0.0 · brak wpisu')
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
