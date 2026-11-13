import { DEFAULT_SETTINGS, mergeSettings, type Settings } from './core'

export const CONFIG_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]
type ConfigResult = { value: unknown, deny?: undefined } | { deny: string, value?: undefined }
export type ConfigIO = {
  get: (key: string) => Promise<unknown>
  put: (key: string, value: unknown) => Promise<unknown>
  options: () => Promise<Record<string, unknown>>
  set: (key: string, value: string | number | boolean) => Promise<ConfigResult>
}
export async function loadConfiguration(io: ConfigIO): Promise<Settings> {
  const legacy = await io.get('settings')
  const base = mergeSettings(legacy)
  const saved = await io.get(MIGRATED)
  const done = Array.isArray(saved) ? saved.filter(k => CONFIG_KEYS.includes(k)) : []
  const options = await io.options()
  let current = readOptions(options, base)
  if (legacy && typeof legacy === 'object') {
    for (const key of CONFIG_KEYS) {
      if (done.includes(key)) continue
      if (options[key] === undefined || configValue(key, current) !== configValue(key, base)) {
        const result = await io.set(key, configValue(key, base))
        // A policy refusal leaves the row unchanged. Resolve this key once so a later
        // explicit /config change cannot be overwritten when the policy is lifted.
        if (!result.deny) current = readOptions({ [key]: result.value }, current)
      }
      done.push(key)
      await io.put(MIGRATED, [...done])
    }
  }
  return current
}

export const MIGRATED = 'user-config-migrated-v1'
export const configValue = (key: keyof Settings, s: Settings) => key === 'warnMin' ? s.warnMin.join(',') : s[key] as number | boolean
export function readOptions(raw: Record<string, unknown>, base: Settings): Settings {
  const s = { ...base }
  for (const key of CONFIG_KEYS) {
    const v = raw[key]
    if (v === undefined) continue
    const ok = key === 'ttlMin' ? [0,5,60].includes(v as number)
      : key === 'guard' || key === 'alerts' ? typeof v === 'boolean'
      : key === 'warnMin' ? typeof v === 'string' && v.split(',').every(x => x.trim() !== '' && Number.isFinite(Number(x)) && Number(x) > 0 && Number(x) < 60)
      : typeof v === 'number' && Number.isFinite(v) && v > 0 && (key === 'keepWarmHours' ? v <= 12 : key === 'maxLimitPercent' ? v <= 100 : key === 'paybackTurns' ? Number.isInteger(v) && v <= 50 : true)
    if (!ok) throw new Error('Invalid Cache Keeper option: ' + key)
    Object.assign(s, { [key]: key === 'warnMin' ? (v as string).split(',').map(Number) : v })
  }
  return s
}
export async function writeOptions(io: ConfigIO, s: Settings, keys = CONFIG_KEYS) {
  let confirmed = { ...s }
  for (const key of keys) {
    const result = await io.set(key, configValue(key, s))
    if (result?.deny) throw new Error('Cache Keeper config ' + key + ': ' + result.deny)
    confirmed = readOptions({ [key]: result.value }, confirmed)
  }
  return confirmed
}
