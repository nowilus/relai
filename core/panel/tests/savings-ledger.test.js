'use strict';

// Rejestr oszczednosci (plan MODY_OSZCZEDZANIA, E1): kontrakt rekordu (specyfikacja, sekcja 4),
// plik na sesje i dzien, deduplikacja po tool_use_id, zle linie liczone, retencja po dniach,
// kolejka zapisow — ta sama sytuacja, w ktorej sonda E1 zgubila linie (dwa zdarzenia naraz).

const assert = require('node:assert/strict');
const test = require('node:test');

const L = require('../savings-ledger.mjs');

const base = { ts: '2026-11-11T15:00:00.000Z', session: 'c9ce8d24-000e', tool_use_id: 'toolu_1', mod: 'relai-browser', action: 'shrink', before: 1600, after: 400 };

test('plik rejestru: katalog RelAI, dzien i sesja w nazwie, bez znakow sciezki z sesji', () => {
  assert.equal(L.ledgerFile('C:/Users/L/.claude/', base.ts, 'c9ce8d24-000e'), 'C:/Users/L/.claude/relai/oszczednosci/rejestr/2026-11-11-c9ce8d24-000e.jsonl');
  assert.ok(!L.ledgerFile('C:/u/.claude', base.ts, '../../x').includes('..'));
  assert.ok(!L.ledgerFile('C:/u/.claude', base.ts, 'x').includes('mods-logs'), 'rejestr BenAI nie jest rejestrem RelAI');
});

test('kontrakt: brak pola wymaganego albo rozmiar nieliczbowy to blad', () => {
  assert.throws(() => L.makeRecord({ ...base, tool_use_id: '' }), /tool_use_id/);
  assert.throws(() => L.makeRecord({ ...base, before: '1600' }), /before/);
  assert.equal(L.makeRecord(base).measured, false);
  assert.equal(L.makeRecord({ ...base, measured: true }).measured, true);
});

test('odczyt: duplikat raz, zmierzony wypiera szacowany, zle linie policzone', () => {
  const text = [
    L.serialize(base),
    L.serialize({ ...base, measured: true, after: 380 }),
    L.serialize({ ...base, after: 999 }),
    '{niepelny json\n',
    '\u0000\u0000\n',
    L.serialize({ ...base, tool_use_id: 'toolu_2' }),
  ].join('');
  const { records, bad } = L.parse(text);
  assert.equal(records.length, 2);
  assert.equal(records.find((r) => r.tool_use_id === 'toolu_1').after, 380);
  assert.equal(bad, 1);
});

test('odczyt scala pliki wielu sesji', () => {
  const a = L.serialize(base);
  const b = L.serialize({ ...base, session: 'other', tool_use_id: 'toolu_9' });
  assert.equal(L.parse([a, b]).records.length, 2);
});

test('LEFT OUT: progi specyfikacji z obu stron', () => {
  assert.ok(L.isLeftOut({ before: 500001, after: 10 }));
  assert.ok(!L.isLeftOut({ before: 500000, after: 400000 }));
  assert.ok(L.isLeftOut({ before: 200000, after: 100 }));
  assert.ok(!L.isLeftOut({ before: 200000, after: 1000 }));
});

test('retencja: pliki starsze niz 14 dni (SZACUNEK) do usuniecia, mlodsze zostaja', () => {
  const names = ['2026-10-27-a.jsonl', '2026-10-28-b.jsonl', '2026-11-11-c.jsonl', 'notatka.txt'];
  assert.deepEqual(L.expiredFiles(names, '2026-11-11T10:00:00Z'), ['2026-10-27-a.jsonl']);
});

test('kolejka: dwa zapisy naraz nie gubia rekordu (sytuacja z sondy E1)', async () => {
  let disk = '';
  const io = {
    read: async () => { const v = disk; await new Promise((r) => setTimeout(r, 5)); if (!v) throw new Error('ENOENT'); return v; },
    write: async (_p, t) => { await new Promise((r) => setTimeout(r, 5)); disk = t; },
  };
  const q = L.createQueue(io, 'x.jsonl');
  await Promise.all([q.push(base), q.push({ ...base, tool_use_id: 'toolu_2' }), q.push({ ...base, tool_use_id: 'toolu_3' })]);
  assert.equal(L.parse(disk).records.length, 3);
});

test('kontrola pozytywna instrumentu: bez kolejki ten sam wyscig gubi rekord', async () => {
  let disk = '';
  const read = async () => { const v = disk; await new Promise((r) => setTimeout(r, 5)); return v; };
  const write = async (t) => { await new Promise((r) => setTimeout(r, 5)); disk = t; };
  await Promise.all([1, 2, 3].map(async (i) => write((await read()) + L.serialize({ ...base, tool_use_id: `toolu_${i}` }))));
  assert.ok(L.parse(disk).records.length < 3);
});
