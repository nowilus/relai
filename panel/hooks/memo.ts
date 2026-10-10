// relai-panel: the tabs' data in memory (AUDYT_MODOW Z3), moved out of register.tsx in Z6 without
// a change of behavior. No `$` here (P-023 pkt 10): register.tsx passes the loads as closures.
//
// A tab's data is read when the tab opens, after a turn and after the pane writes a file, and kept
// here; drawing reads the memory. `epoch` moves on those events; a slot answers while its key
// (the session's id, the epoch, what the slot depends on) is the same, so a press that only
// redraws — a filter, a fold, the end of a flash — reads no file and starts no process.
// Module memory: a reload starts it over and the first drawing reads again.

let epoch = 0
export const bump = () => { epoch += 1 }
export const epochNow = () => epoch

type Slot = { key: string, value: Promise<unknown> }
let memo: Record<string, Slot> = {} // replaced, never mutated in place

// A new session reads everything again
export function forget() { memo = {} }

export function remember<T>(slot: string, key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo[slot]
  if (hit && hit.key === key) return hit.value as Promise<T>
  const value = load()
  memo = { ...memo, [slot]: { key, value } }
  // A failed read is not kept: the next drawing tries again
  value.catch(() => { if (memo[slot]?.value === value) memo = Object.fromEntries(Object.entries(memo).filter(([k]) => k !== slot)) })
  return value
}
