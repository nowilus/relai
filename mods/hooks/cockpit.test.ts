import { describe, expect, test } from 'claude-code/testing'
import {
  EMPTY_QUEUE, enqueue, finish, flipCall, isQueued, itemKey, lockOf, matches, pendingCount,
  pendingText, projectLabel, rowLockWord, selfCommand, snapshotOf, startNext, changeText, treeWeight, visible,
} from './cockpit'
import type { HookItem, Item, PluginItem } from './inventory'

// Rows in the shape inventory.ts builds them (E2): Windows paths come in with `\`, leave with `/`
const CWD = 'C:/Users/Ktos/Desktop/RelAI'
const PARKLY = 'C:\\Users\\Ktos\\Desktop\\Parkly'

function plugin(id: string, over: Partial<PluginItem> = {}): PluginItem {
  return {
    id, scope: 'user', version: '1.0.0', projectPath: '', installPath: `C:/x/${id}`,
    kind: 'plugin', state: 'on', stateFile: 'C:/Users/Ktos/.claude/settings.json', description: `${id} opis`,
    events: [], counts: { skills: 0, agents: 0, commands: 0, mcp: 0 }, notes: [], isPolicy: false, overriddenBy: '', isSelf: false,
    ...over,
  }
}
const hook = (event: string, script: string): HookItem => ({ kind: 'hook', event, matcher: '', command: `node ${script}`, script })

const FILETREE = plugin('filetree@claude-code-filetree', { kind: 'mod', state: 'off', description: 'Drzewo plików' })
const ECC = plugin('ecc@ecc', { events: ['PreToolUse', 'SessionStart'] })
const SECURITY = plugin('security-guidance@claude-plugins-official', {
  scope: 'local', projectPath: PARKLY, state: 'none', stateFile: 'C:/Users/Ktos/Desktop/Parkly/.claude/settings.local.json',
})
const SELF = plugin('relai-mods@relai', { kind: 'mod', isSelf: true })
const STOP = hook('Stop', 'sync.ps1')
const ITEMS: Item[] = [ECC, FILETREE, SELF, SECURITY, STOP]

describe('filters and search', () => {
  test('a disabled mod stands under Wyłączone (recognised by hooks.json, not by running)', () => {
    expect(visible(ITEMS, 'off', '').map(itemKey)).toContain(itemKey(FILETREE))
    expect(visible(ITEMS, 'mod', '').map(itemKey)).toEqual([itemKey(FILETREE), itemKey(SELF)])
  })

  test('no key in enabledPlugins reads as off: Wyłączone shows it (E1, P-052)', () => {
    expect(matches(SECURITY, 'off', '')).toBe(true)
    // positive control: an enabled plugin and a hook never stand there
    expect(matches(ECC, 'off', '')).toBe(false)
    expect(matches(STOP, 'off', '')).toBe(false)
  })

  test('the search matches id, description and event, case-insensitive', () => {
    expect(visible(ITEMS, 'all', 'DRZEWO').map(itemKey)).toEqual([itemKey(FILETREE)])
    expect(visible(ITEMS, 'all', 'pretooluse').map(itemKey)).toEqual([itemKey(ECC)])
    expect(visible(ITEMS, 'hook', 'sync').map(itemKey)).toEqual([itemKey(STOP)])
    expect(visible(ITEMS, 'all', 'nie-ma-takiego')).toEqual([])
  })
})

describe('changes waiting for a reload', () => {
  test('N counts the plugins whose disk differs from what the chat loaded, not the presses', () => {
    const loaded = snapshotOf(ITEMS, CWD)
    expect(pendingCount(ITEMS, loaded)).toBe(0)
    // there: filetree on disk, the chat loaded it off
    const there = ITEMS.map((i) => (i === FILETREE ? { ...FILETREE, state: 'on' as const } : i))
    expect(pendingCount(there, loaded)).toBe(1)
    // and back before a reload: N returns to 0
    expect(pendingCount(ITEMS, loaded)).toBe(0)
  })

  test('after /reload-plugins the snapshot is the disk again and N is 0', () => {
    const there = ITEMS.map((i) => (i === FILETREE ? { ...FILETREE, state: 'on' as const } : i))
    expect(pendingCount(there, snapshotOf(there, CWD))).toBe(0)
  })

  test('a locked row adds nothing to N: no press of the cockpit changes it (review)', () => {
    const policyOn = plugin('pol@corp', { isPolicy: true })
    const loaded = snapshotOf([ECC, policyOn], CWD)
    const changed = [ECC, { ...policyOn, state: 'off' as const }]
    expect(pendingCount(changed, loaded)).toBe(0)
    // positive control: the same row without its lock would count
    const free = { ...policyOn, isPolicy: false }
    expect(pendingCount([ECC, { ...free, state: 'off' as const }], snapshotOf([ECC, free], CWD))).toBe(1)
  })

  test('a session in a subfolder of the project: its plugin reads as this project (L-0146)', () => {
    const here = plugin('x@y', { scope: 'local', projectPath: 'C:\\Users\\Ktos\\Desktop\\RelAI', stateFile: `${CWD}/.claude/settings.local.json` })
    expect(projectLabel(here, `${CWD}/site/biurko`)).toBe('projekt')
    // positive control: a sibling folder sharing the prefix is another project
    expect(projectLabel(here, `${CWD}-kopia`)).toBe('projekt RelAI')
  })

  test('one script under two matchers of one event: two rows, two keys (review)', () => {
    const a = { ...hook('PostToolUse', 'scan.mjs'), matcher: 'Bash' }
    const b = { ...hook('PostToolUse', 'scan.mjs'), matcher: 'Edit' }
    expect(itemKey(a)).not.toBe(itemKey(b))
    expect(itemKey(FILETREE)).toBe(itemKey({ ...FILETREE, kind: 'plugin' }))
  })

  test("another project's plugin never loads here and adds nothing to N", () => {
    const loaded = snapshotOf(ITEMS, CWD)
    expect(itemKey(SECURITY) in loaded).toBe(false)
    const flipped = ITEMS.map((i) => (i === SECURITY ? { ...SECURITY, state: 'on' as const } : i))
    expect(pendingCount(flipped, loaded)).toBe(0)
  })

  test('the bar words: 1 zmiana, 2–4 zmiany, 5+ zmian', () => {
    expect(pendingText(1)).toBe('1 zmiana czeka na przeładowanie')
    expect(pendingText(3)).toBe('3 zmiany czekają na przeładowanie')
    expect(pendingText(5)).toBe('5 zmian czeka na przeładowanie')
    expect(pendingText(12)).toBe('12 zmian czeka na przeładowanie')
  })
})

describe('locks', () => {
  test('policy and an override lock the row with their reason; a plain plugin has none', () => {
    expect(lockOf(plugin('a@b', { isPolicy: true }))).toBe('zarządzane przez politykę')
    expect(lockOf(plugin('a@b', { overriddenBy: 'C:/p/.claude/settings.local.json' }))).toBe('nadpisane w C:/p/.claude/settings.local.json')
    expect(rowLockWord(plugin('a@b', { overriddenBy: 'x' }))).toBe('nadpisane')
    expect(lockOf(ECC)).toBe('')
  })

  test('the cockpit itself has no switch; the details give the command', () => {
    expect(lockOf(SELF)).toBe('ten kokpit')
    expect(selfCommand(SELF.id)).toBe('claude plugin disable relai-mods@relai')
  })

  test('a hook is a preview', () => {
    expect(lockOf(STOP)).toBe('tylko podgląd')
  })
})

describe('the switch of a project plugin', () => {
  test("another project's plugin runs the CLI from its folder with its scope (Annex A pt 2)", () => {
    expect(flipCall('claude', SECURITY)).toEqual({
      argv: ['claude', 'plugin', 'enable', 'security-guidance@claude-plugins-official', '--scope', 'local'],
      cwd: 'C:/Users/Ktos/Desktop/Parkly',
    })
    expect(projectLabel(SECURITY, CWD)).toBe('projekt Parkly')
    expect(changeText(SECURITY, CWD)).toEqual(['Zmieni się plik w projekcie Parkly: C:/Users/Ktos/Desktop/Parkly/.claude/settings.local.json.'])
  })

  test("this project's plugin: label „projekt”, the file in the repo named (R9)", () => {
    const here = plugin('x@y', { scope: 'project', projectPath: 'C:\\Users\\Ktos\\Desktop\\RelAI', stateFile: `${CWD}/.claude/settings.json` })
    expect(flipCall('claude', here).cwd).toBe(CWD)
    expect(projectLabel(here, CWD)).toBe('projekt')
    expect(changeText(here, CWD)).toEqual([`Zmieni się ${CWD}/.claude/settings.json.`, 'To plik śledzony w repo tego projektu.'])
  })

  test('a user plugin runs from the session folder, no label', () => {
    expect(flipCall('claude', FILETREE)).toEqual({ argv: ['claude', 'plugin', 'enable', 'filetree@claude-code-filetree', '--scope', 'user'] })
    expect(projectLabel(FILETREE, CWD)).toBe('')
  })
})

describe('the queue of CLI calls', () => {
  test('a press during a call waits; a second press on the same row is ignored', () => {
    let q = enqueue(EMPTY_QUEUE, 'a')
    const first = startNext(q)
    expect(first.key).toBe('a')
    q = enqueue(enqueue(first.queue, 'b'), 'a')
    expect(q).toEqual({ running: 'a', waiting: ['b'] })
    expect(startNext(q).key).toBe('')
    q = enqueue(q, 'b')
    expect(q.waiting).toEqual(['b'])
    const second = startNext(finish(q, 'a'))
    expect(second.key).toBe('b')
    expect(isQueued(second.queue, 'a')).toBe(false)
  })
})

describe('the budget of the tree', () => {
  test('an element weighs 1 and a drawing with markup 5, as pane-parts.tsx counts', () => {
    const svg = { type: 'Svg', props: { source: 'x'.repeat(300) }, children: [] }
    const hollow = { type: 'Svg', props: { source: '<svg/>' }, children: [] }
    expect(treeWeight({ type: 'Box', props: {}, children: [svg, hollow, { type: 'Text', props: {}, children: ['a'] }] })).toBe(1 + 5 + 1 + 1)
  })
})
