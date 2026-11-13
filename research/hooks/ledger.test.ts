import { describe, expect, test } from 'claude-code/testing'
import { createLedgerQueue } from './ledger'
import { createQueue, ledgerFile, parse, expiredFiles } from './core/savings-ledger.mjs'

const DIR = '/home/person/.claude'
const rec = (ts: string, id: string) => ({ ts, session: 'session', mod: 'relai-research', tool_use_id: id, part: id, action: 'research-plan', measured: true, helper: { model: 'claude-haiku-5-5', in: 10, out: 3 } })
describe('research ledger', () => {
  test('parallel records are retained, day rolls over, and other producers use disjoint files', async () => {
    const disk: Record<string, string> = {}
    const io = { read: async (p: string) => disk[p] || '', write: async (p: string, text: string) => { disk[p] = text } }
    const q = createLedgerQueue(io, DIR, 'session')
    await Promise.all([q.push(rec('2026-11-13T23:59:59Z', 'a')), q.push(rec('2026-11-14T00:00:00Z', 'b')), q.push(rec('2026-11-14T00:00:01Z', 'c')), createQueue(io, ledgerFile(DIR, '2026-11-14', 'session')).push({ ...rec('2026-11-14T00:00:02Z', 'router'), mod: 'relai-model-router' })])
    const p = parse(Object.values(disk))
    expect(p.bad).toBe(0); expect(p.records.length).toBe(4)
    expect(Object.keys(disk).filter(p => p.endsWith('.relai-research.jsonl')).length).toBe(2)
    expect(expiredFiles(Object.keys(disk).map(p => p.split('/').pop()), '2026-12-01').length).toBe(3)
  })
  test('failed write rejects but does not poison subsequent writes', async () => {
    const disk: Record<string, string> = {}; let fail = true
    const q = createLedgerQueue({ read: async p => disk[p] || '', write: async (p, t) => { if (fail) throw Error('full'); disk[p] = t } }, DIR, 'session')
    let rejected = false
    try { await q.push(rec('2026-11-13', 'a')) } catch { rejected = true }
    expect(rejected).toBe(true); fail = false
    await q.push(rec('2026-11-13', 'b'))
    expect(parse(Object.values(disk)).records.map((r: any) => r.tool_use_id)).toEqual(['b'])
  })
})
