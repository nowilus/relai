import { describe, expect, test } from 'claude-code/testing'
import {
  EMPTY_QUEUE, enqueue, finish, flipCall, isQueued, itemKey, lockOf, matches, pendingCount,
  pendingText, projectLabel, rowLockWord, selfCommand, snapshotOf, startNext, changeText, treeWeight, visible,
  RELAI_SET, oppositeArgv, outcomeOf, scopeFacts, scopeKey, scopePlan, scopeRowOf, scopeStateWord, scopeWant, withWorktreeLine,
} from './cockpit'
import type { ScopeInput } from './cockpit'
import type { HookItem, Install, Item, PluginItem } from './inventory'

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

// ---------- the row "RelAI w tym projekcie" (ZASIEG_PLUGINU E3) ----------

const HOME = 'C:\\Users\\Ktos'
const userInstall = (id: string): Install => ({ id, scope: 'user', version: '1.0.0', projectPath: '', installPath: `C:/x/${id}` })
const ALL_SET: Install[] = [...RELAI_SET.map(userInstall), userInstall('relai-mods@relai'), userInstall('filetree@claude-code-filetree')]
const enabled = (map: Record<string, boolean>) => JSON.stringify({ enabledPlugins: map })
const ALL_TRUE = Object.fromEntries([...RELAI_SET, 'relai-mods@relai'].map((id) => [id, true]))

function scopeInput(over: Partial<ScopeInput> = {}): ScopeInput {
  return { home: HOME, cwd: CWD, installs: ALL_SET, userText: enabled(ALL_TRUE), localText: null, gitKind: null, worktreeText: null, ...over }
}

describe('the row "RelAI w tym projekcie"', () => {
  test('no row in the home folder, whatever its slashes and case; a project folder has one (plan, section 8)', () => {
    expect(scopeRowOf(scopeInput({ cwd: 'c:/users/ktos/' }))).toBeNull()
    expect(scopeRowOf(scopeInput({ cwd: HOME }))).toBeNull()
    // positive control: the same machine in a project folder
    expect(scopeRowOf(scopeInput())?.folder).toBe(CWD)
  })

  test('relai-mods is never in the set nor in a plan, though installed and on', () => {
    const row = scopeRowOf(scopeInput())
    expect(row?.plugins.map((p) => p.id)).toEqual([...RELAI_SET])
    const ids = [true, false].flatMap((want) => scopePlan('claude', row!, want).calls.map((c) => c.id))
    expect(ids).not.toContain('relai-mods@relai')
    // positive control: the plan is not empty, relai stands in it
    expect(ids).toContain('relai@relai')
  })

  test('a plugin of the set not installed is left out', () => {
    const row = scopeRowOf(scopeInput({ installs: [userInstall('relai@relai'), userInstall('relai-mods@relai')] }))
    expect(row?.plugins.map((p) => p.id)).toEqual(['relai@relai'])
    expect(scopeRowOf(scopeInput({ installs: [userInstall('relai-mods@relai')] }))).toBeNull()
  })

  test('global true, no local key: on from the user settings, a press asks "on" for every plugin, from the folder', () => {
    const row = scopeRowOf(scopeInput())!
    expect(scopeStateWord(row)).toBe('● włączony z ustawień globalnych')
    expect(scopeWant(row)).toBe(true)
    const plan = scopePlan('claude', row, true)
    expect(plan.calls.map((c) => c.argv)).toEqual(RELAI_SET.map((id) => ['claude', 'plugin', 'enable', id, '--scope', 'local']))
    expect(plan.calls.every((c) => c.cwd === CWD && c.want)).toBe(true)
  })

  test('local false: off; the plan turns it on; local true everywhere: on here, the press asks "off"', () => {
    const off = scopeRowOf(scopeInput({ localText: enabled({ 'relai@relai': false }), installs: [userInstall('relai@relai')] }))!
    expect(scopeStateWord(off)).toBe('○ wyłączony')
    expect(scopePlan('claude', off, true).calls.map((c) => c.argv[2])).toEqual(['enable'])
    const on = scopeRowOf(scopeInput({ localText: enabled(ALL_TRUE) }))!
    expect(scopeStateWord(on)).toBe('✓ włączony w tym projekcie')
    expect(scopeWant(on)).toBe(false)
    // a plugin already holding the wanted value locally is skipped
    expect(scopePlan('claude', on, true).calls).toEqual([])
    expect(scopePlan('claude', on, false).calls).toHaveLength(4)
  })

  test('partly on: x/y toward the whole set', () => {
    const row = scopeRowOf(scopeInput({ localText: enabled({ 'relai-panel@relai': false }) }))!
    expect(scopeStateWord(row)).toBe('◐ częściowo: 3/4 włączone')
  })

  test('the CLI refusal "already": done with the value in the file, the pair without it, any other error an error', () => {
    const refused = { exitCode: 1, stdout: '', stderr: 'Plugin "relai@relai" is already enabled at local scope' }
    expect(outcomeOf(refused, undefined, true)).toBe('pair')
    expect(outcomeOf(refused, true, true)).toBe('ok')
    expect(outcomeOf({ exitCode: 1, stdout: '', stderr: 'Error: plugin not found' }, undefined, true)).toBe('error')
    expect(outcomeOf({ exitCode: 0, stdout: '', stderr: '' }, undefined, true)).toBe('ok')
    const c = scopePlan('claude', scopeRowOf(scopeInput())!, true).calls[0]!
    expect(oppositeArgv(c)).toEqual(['claude', 'plugin', 'disable', 'relai@relai', '--scope', 'local'])
  })

  test('.worktreeinclude: the line in a main repo only, on "on" only; its line ends kept', () => {
    expect(scopeRowOf(scopeInput({ gitKind: 'dir' }))?.needsWorktreeLine).toBe(true)
    expect(scopeRowOf(scopeInput({ gitKind: 'file' }))?.needsWorktreeLine).toBe(false)
    expect(scopeRowOf(scopeInput({ gitKind: 'dir', worktreeText: 'a\r\n.claude/settings.local.json\r\n' }))?.needsWorktreeLine).toBe(false)
    const row = scopeRowOf(scopeInput({ gitKind: 'dir' }))!
    expect(scopePlan('claude', row, false).isWorktreeLine).toBe(false)
    expect(withWorktreeLine(null)).toBe('.claude/settings.local.json\n')
    expect(withWorktreeLine('a\r\nb')).toBe('a\r\nb\r\n.claude/settings.local.json\r\n')
    expect(withWorktreeLine('.claude/settings.local.json\n')).toBe('.claude/settings.local.json\n')
  })

  test('the card names the file, the plugins and the line', () => {
    const { facts, question } = scopeFacts(scopeRowOf(scopeInput({ gitKind: 'dir' }))!, true)
    expect(facts[0]).toEqual(['Plik', `${CWD}/.claude/settings.local.json`])
    expect(facts[1]?.[1]).toBe('relai → true, relai-panel → true, relai-progress → true, relai-cache-keeper → true')
    expect(facts.some(([l]) => l === 'Worktree')).toBe(true)
    expect(question).toBe('Włączyć RelAI w tym projekcie?')
  })

  test('the row\'s plugins add to N once, beside a row of the list with the same id', () => {
    const row = scopeRowOf(scopeInput({ localText: enabled({ 'relai@relai': false }) }))!
    const relai = plugin('relai@relai')
    expect(pendingCount([relai], { [itemKey(relai)]: true, [scopeKey('relai@relai')]: true }, row)).toBe(1)
    // the same id differing on both sides is one change, not two
    const relaiOff = plugin('relai@relai', { state: 'off' })
    expect(pendingCount([relaiOff], { [itemKey(relaiOff)]: true, [scopeKey('relai@relai')]: true }, row)).toBe(1)
    expect(pendingCount([relai], { [itemKey(relai)]: true })).toBe(0)
  })
})
