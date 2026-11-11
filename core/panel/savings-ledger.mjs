// RelAI core / panel: savings-ledger — the savings ledger of the token-saving mods (plan
// MODY_OSZCZEDZANIA, E1; record fields: spec, section 4). Pure logic: the mod writes files.
//
// Layout (decision of Lukasz 2026-11-11, E1): one file per session and day,
//   ~/.claude/relai/oszczednosci/rejestr/<YYYY-MM-DD>-<session>.jsonl
// because the mod engine has no append (`$.fs` = read/write/list/exists) and a read-then-write
// append raced and lost a record under two parallel events (probe E1). Inside one session the
// mod queues its writes (`createQueue`); two sessions never share a file. Rotation is retention
// by day: files older than RETENTION_DAYS are listed for removal by the work-artefact cleanup.
// The BenAI ledger (~/.claude/mods-logs/savings.jsonl) is never read.

export const LEDGER_DIR = 'relai/oszczednosci/rejestr';
/** Days a ledger file is kept. ESTIMATE, to be recalibrated on real use (rule 6). */
export const RETENTION_DAYS = 14;
/** Records above these sizes are left out of totals as implausible (spec, section 4). */
export const LEFT_OUT_BEFORE = 500000;
export const LEFT_OUT_BEFORE_CUT = 100000;
export const LEFT_OUT_RATIO = 1000;

const REQUIRED = ['ts', 'session', 'tool_use_id', 'mod', 'action'];
const NUMERIC = ['before', 'after'];

const safe = (s) => String(s || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36) || 'unknown';

/** Ledger file of a session on a day, under the `~/.claude` folder given as `claudeDir`. */
export function ledgerFile(claudeDir, isoTs, session) {
  const day = String(isoTs).slice(0, 10);
  return `${String(claudeDir).replace(/[\\/]+$/, '')}/${LEDGER_DIR}/${day}-${safe(session)}.jsonl`;
}

/**
 * A record checked against the contract; throws on a missing required field or a
 * non-numeric size. Returns a new object with `measured` as a boolean.
 */
export function makeRecord(fields) {
  const rec = { ...fields };
  for (const k of REQUIRED) {
    if (rec[k] === undefined || rec[k] === null || rec[k] === '') throw new Error(`savings-ledger: missing field ${k}`);
  }
  for (const k of NUMERIC) {
    if (rec[k] !== undefined && !(typeof rec[k] === 'number' && Number.isFinite(rec[k]) && rec[k] >= 0)) {
      throw new Error(`savings-ledger: field ${k} is not a size`);
    }
  }
  return { ...rec, measured: rec.measured === true };
}

/** One JSONL line of a record. */
export function serialize(rec) {
  return `${JSON.stringify(makeRecord(rec))}\n`;
}

/**
 * Records from the texts of ledger files. Bad lines are counted and skipped. One
 * `tool_use_id` (per mod and part) counts once; a measured record replaces an estimated one,
 * otherwise the later one wins. Returns { records, bad }.
 */
export function parse(texts) {
  const byKey = new Map();
  let bad = 0;
  for (const text of [].concat(texts || [])) {
    for (const line of String(text || '').replace(/\u0000/g, '').split(/\r?\n/)) {
      if (!line.trim()) continue;
      let rec;
      try { rec = makeRecord(JSON.parse(line)); } catch { bad++; continue; }
      const key = `${rec.mod}|${rec.part || ''}|${rec.tool_use_id}`;
      const prev = byKey.get(key);
      if (prev && prev.measured && !rec.measured) continue;
      byKey.set(key, rec);
    }
  }
  return { records: [...byKey.values()].sort((a, b) => String(a.ts).localeCompare(String(b.ts))), bad };
}

/** True when a record is left out of totals (spec, section 4). */
export function isLeftOut(rec) {
  const before = rec.before || 0;
  const after = rec.after || 0;
  if (before > LEFT_OUT_BEFORE) return true;
  return before > LEFT_OUT_BEFORE_CUT && after > 0 && before / after > LEFT_OUT_RATIO;
}

/** Ledger file names (from `$.fs.list`) older than `days` before `nowIso`. */
export function expiredFiles(names, nowIso, days = RETENTION_DAYS) {
  const cutoff = Date.parse(String(nowIso).slice(0, 10)) - days * 86400000;
  return (names || []).filter((n) => {
    const m = /^(\d{4}-\d{2}-\d{2})-.*\.jsonl$/.exec(n);
    return m ? Date.parse(m[1]) < cutoff : false;
  });
}

/**
 * Serial write queue for one ledger file: `push(rec)` resolves after the record is on disk.
 * `io.read(path)` → Promise<string> (rejects when absent), `io.write(path, text)` → Promise.
 * Writes never overlap, so a read-then-write append cannot race inside one session.
 */
export function createQueue(io, path) {
  let tail = Promise.resolve();
  return {
    push(rec) {
      const line = serialize(rec);
      const run = tail.then(async () => {
        let prev = '';
        try { prev = await io.read(path); } catch { prev = ''; }
        await io.write(path, prev + line);
      });
      tail = run.catch(() => undefined);
      return run;
    },
  };
}
