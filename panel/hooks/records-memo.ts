// relai-panel: the other sessions' measurements in memory (audit F2). The costs and the map read
// every session file of .claude/relai/pomiary after each turn; a closed session's file does not
// change, so its records are kept here under the name, size and time its listing gave, and read
// again only when one of them moved. No `$` here (P-023 pkt 10): register.tsx passes the read.
// Module memory: a reload starts it over, session.start forgets it.

import type { MeasureRecord } from './core/measure.mjs'

export type ListedFile = { name: string, size: number, mtimeMs: number }

type Kept = { key: string, records: MeasureRecord[] }
let kept: Record<string, Kept> = {} // by file name; replaced, never mutated in place

export const fileKey = (x: ListedFile): string => `${x.name}|${x.size}|${x.mtimeMs}`

// A new session reads every file again
export function forgetRecords(): void { kept = {} }

// The records of the listed files, in their order: from memory while a file's key stands, read
// otherwise. A read that failed (null) gives no records and is not kept: the next call tries again.
export async function othersFrom(files: readonly ListedFile[], read: (name: string) => Promise<MeasureRecord[] | null>): Promise<MeasureRecord[][]> {
  const next: Record<string, Kept> = {}
  const out = await Promise.all(files.map(async (x) => {
    const key = fileKey(x)
    const hit = kept[x.name]
    if (hit && hit.key === key) {
      next[x.name] = hit
      return hit.records
    }
    const records = await read(x.name)
    if (records === null) return []
    next[x.name] = { key, records }
    return records
  }))
  kept = next
  return out
}
