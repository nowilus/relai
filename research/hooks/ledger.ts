import { createQueue, ledgerFile } from './core/savings-ledger.mjs'

type IO = { read: (path: string) => Promise<string>, write: (path: string, text: string) => Promise<unknown> }
export function createLedgerQueue(io: IO, claudeDir: string, session: string) {
  let queue: ReturnType<typeof createQueue> | null = null
  let file = '', tail: Promise<unknown> = Promise.resolve()
  return {
    push(rec: Record<string, unknown>) {
      const run = tail.then(() => {
        const nextFile = ledgerFile(claudeDir, rec.ts, session).replace(/\.jsonl$/, '.relai-research.jsonl')
        if (!queue || file !== nextFile) { file = nextFile; queue = createQueue(io, file) }
        return queue.push(rec)
      })
      tail = run.catch(() => undefined)
      return run
    },
  }
}
