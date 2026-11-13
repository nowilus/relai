// Test-only engine leaves for /config. Mirrors plugin.json defaults; no real settings writes.
import type { On } from 'claude-code'
import { DEFAULT_SETTINGS } from './core'
import { CONFIG_KEYS, configValue } from './config'

type Fixture = { namespace?: string, staleReads?: boolean, denied?: string[], occupied?: string[] }
export function mockCacheConfig(on: On, rewrite = (_key: string, value: unknown) => value, commands: string[] = [], fixture: Fixture = {}) {
  const options = Object.fromEntries(CONFIG_KEYS.map(k => [k, configValue(k, DEFAULT_SETTINGS)]))
  const registered = new Map((fixture.occupied ?? []).map(name => [name, { name, description: 'Foreign command', source: 'plugin', plugin: 'other-plugin' }]))
  const initial = { ...options }
  on('config.list' as never, (() => ({ value: CONFIG_KEYS.map(k => ({ key: (fixture.namespace ?? 'relai-cache-keeper') + '.' + k, value: (fixture.staleReads ? initial : options)[k], provider: { kind: 'plugin', name: 'relai-cache-keeper' } })) })) as never)
  on('config.set', ((_s: unknown, e: { key: string, value: unknown }) => {
    const key = e.key.slice(e.key.lastIndexOf('.') + 1)
    if (fixture.denied?.includes(key)) return { deny: 'managed' }
    const value = rewrite(e.key, e.value); options[key] = value as never; return { value }
  }) as never)
  on('command.list' as never, (() => ({ value: [...registered.values()] })) as never)
  on('command.register', ((_s: unknown, e: { name: string }) => {
    commands.push(e.name)
    registered.set(e.name, { name: e.name, description: 'Own command', source: 'plugin', plugin: 'relai-cache-keeper' })
    return { value: undefined }
  }) as never)
  return options
}
