import { describe, expect, test } from 'claude-code/testing'
import { createLedgerQueue } from './ledger'
import { createQueue, ledgerFile, parse, expiredFiles } from './core/savings-ledger.mjs'

const DIR = '/home/person/.claude'
const path = (day: string) => `${DIR}/relai/oszczednosci/rejestr/${day}-session.relai-effort.jsonl`
const rec = (ts: string, id: string) => ({ ts, session: 'session', mod: 'relai-effort', tool_use_id: id, action: 'effort' })

describe('effort ledger rollover', () => {
  test('parallel effort and router writes use disjoint files readable by the existing reader', async () => {
    const disk: Record<string, string> = {}
    let reads = 0, ready!: () => void
    const bothReading = new Promise<void>((resolve) => { ready = resolve })
    const io = {
      read: async (p: string) => { const snapshot = disk[p] || ''; if (++reads === 2) ready(); await bothReading; return snapshot },
      write: async (p: string, text: string) => { disk[p] = text },
    }
    const ts = '2026-11-12T12:00:00.000Z'
    const router = createQueue(io, ledgerFile(DIR, ts, 'session'))
    const effort = createLedgerQueue(io, DIR, 'session')
    await Promise.all([
      router.push({ ...rec(ts, 'router'), mod: 'relai-model-router', action: 'route' }),
      effort.push(rec(ts, 'effort')),
    ])
    expect(Object.keys(disk).length).toBe(2)
    // savingsData lists every .jsonl; parse uses record.session, not the file's stem.
    const files = Object.keys(disk).filter((p) => p.endsWith('.jsonl'))
    const result = parse(files.map((p) => disk[p]))
    expect(result.bad).toBe(0)
    expect(result.records.map((r: any) => r.tool_use_id).sort()).toEqual(['effort', 'router'])
    expect(result.records.every((r: any) => r.session === 'session')).toBe(true)
    expect(expiredFiles(files.map((p) => p.split('/').pop()), '2026-12-01T00:00:00.000Z').length).toBe(2)
  })
  test('midnight drains the old date before writing the new date', async () => {
    const disk: Record<string, string> = {}
    const writes: string[] = []
    let release!: () => void, started!: () => void
    const blocked = new Promise<void>((resolve) => { release = resolve })
    const writing = new Promise<void>((resolve) => { started = resolve })
    const q = createLedgerQueue({
      read: async (p) => disk[p] || '',
      write: async (p, text) => { writes.push(p); if (writes.length === 1) { started(); await blocked }; disk[p] = text },
    }, DIR, 'session')
    const a = q.push(rec('2026-11-12T23:59:59.000Z', 'a'))
    await writing
    const b = q.push(rec('2026-11-13T00:00:00.000Z', 'b'))
    const c = q.push(rec('2026-11-13T00:00:01.000Z', 'c'))
    expect(writes).toEqual([path('2026-11-12')])
    release()
    await Promise.all([a, b, c])
    expect(writes).toEqual([path('2026-11-12'), path('2026-11-13'), path('2026-11-13')])
    expect(disk[path('2026-11-12')].trim().split('\n').map((s) => JSON.parse(s).tool_use_id)).toEqual(['a'])
    expect(disk[path('2026-11-13')].trim().split('\n').map((s) => JSON.parse(s).tool_use_id)).toEqual(['b', 'c'])
  })
  test('a failed old-day write does not poison the next day', async () => {
    const disk: Record<string, string> = {}
    const q = createLedgerQueue({
      read: async (p) => disk[p] || '',
      write: async (p, text) => { if (p === path('2026-11-12')) throw new Error('disk failed'); disk[p] = text },
    }, DIR, 'session')
    let failed = false
    try { await q.push(rec('2026-11-12T23:59:59.000Z', 'a')) } catch { failed = true }
    expect(failed).toBe(true)
    await q.push(rec('2026-11-13T00:00:00.000Z', 'b'))
    expect(JSON.parse(disk[path('2026-11-13')]).tool_use_id).toBe('b')
  })
})
