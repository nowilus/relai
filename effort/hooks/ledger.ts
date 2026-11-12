import { createQueue, ledgerFile } from './core/savings-ledger.mjs'

type IO = { read: (path: string) => Promise<string>, write: (path: string, text: string) => Promise<unknown> }

export function createLedgerQueue(io: IO, claudeDir: string, session: string) {
  let queue: ReturnType<typeof createQueue> | null = null
  let file = '', tail: Promise<unknown> = Promise.resolve()
  return {
    push(rec: Record<string, unknown>) {
      // Switch only after every earlier push settles, including the previous day's queue.
      // A dot cannot occur in ledgerFile's sanitized session stem. Existing producers cannot
      // write this file, even if another session's id happens to end in "relai-effort".
      // The existing reader lists all .jsonl and groups records by rec.session; old files stay readable.
      const run = tail.then(() => {
        const nextFile = ledgerFile(claudeDir, rec.ts, session).replace(/\.jsonl$/, '.relai-effort.jsonl')
        if (!queue || file !== nextFile) { file = nextFile; queue = createQueue(io, file) }
        return queue.push(rec)
      })
      tail = run.catch(() => undefined)
      return run
    },
  }
}
