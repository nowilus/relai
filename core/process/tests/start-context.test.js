'use strict';

// Instrument pomiaru kontekstu pierwszej tury (KONTEKST_STARTU E1, core/tools/start-context.js).
// Fixtury JSONL budowane w kodzie: pelne pola, brak pol usage, sesja bez drugiego polecenia,
// powtorzony wpis tego samego wywolania i zdarzenia, ktore nie sa poleceniem czlowieka.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const sc = require('../../tools/start-context.js');

const czlowiek = (tekst) => ({ type: 'user', message: { role: 'user', content: tekst } });
const meta = (tekst) => ({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: tekst }] } });
const wynikNarzedzia = () => ({ type: 'user', message: { content: [{ type: 'tool_result', content: 'ok' }] } });
const asystent = (id, wej, wyj) => ({
  type: 'assistant',
  message: {
    id,
    content: [{ type: 'text', text: 'x' }],
    usage: { input_tokens: 2, cache_creation_input_tokens: wej - 1002, cache_read_input_tokens: 1000, output_tokens: wyj },
  },
});
const jsonl = (wpisy) => wpisy.map((w) => JSON.stringify(w)).join('\n') + '\n';

test('first call and end of first turn from complete usage fields', () => {
  const r = sc.analizuj(jsonl([
    { type: 'queue-operation' },
    czlowiek('/relai-stage'),
    meta('# rozwiniecie komendy'),
    asystent('m1', 80000, 100),
    asystent('m1', 80000, 400), // ten sam message.id, kolejny blok: liczy sie ostatni wpis
    wynikNarzedzia(),
    { type: 'user', message: { content: '<task-notification>agent skonczyl</task-notification>' } },
    asystent('m2', 90000, 2000),
    czlowiek('Tak, zaczynamy.'),
    asystent('m3', 95000, 10),
  ]));
  assert.equal(r.pierwsze, 80000);
  assert.equal(r.koniecTury, 92000, 'koniec tury = wejscie + wyjscie ostatniego wywolania tury');
  assert.equal(r.wywolanTury, 2);
  assert.equal(r.drugiePolecenie, true);
  assert.equal(r.polecen, 2, 'meta, wynik narzedzia i powiadomienie nie sa poleceniem');
});

test('missing usage fields give "brak danych", never a number', () => {
  const bezUsage = { type: 'assistant', message: { id: 'm1', content: [] } };
  const niepelne = { type: 'assistant', message: { id: 'm2', content: [], usage: { input_tokens: 5, output_tokens: 1 } } };
  const r = sc.analizuj(jsonl([czlowiek('a'), bezUsage, niepelne, czlowiek('b')]));
  assert.equal(r.pierwsze, null);
  assert.equal(r.koniecTury, null);
  const wynik = { sesje: [Object.assign({ sesja: 'abcdef12-x' }, r)] };
  const linia = sc.tabela(wynik)[2];
  assert.match(linia, /\| brak danych \| brak danych \|/);
  // Kontrola pozytywna w tym samym przebiegu: pelne pola daja liczby.
  const pelne = sc.analizuj(jsonl([czlowiek('a'), asystent('m1', 5000, 7), czlowiek('b')]));
  assert.deepEqual([pelne.pierwsze, pelne.koniecTury], [5000, 5007]);
});

test('session without a second human command ends the turn at the last call in the file', () => {
  const r = sc.analizuj(jsonl([czlowiek('a'), asystent('m1', 1000, 1), asystent('m2', 3000, 50)]));
  assert.equal(r.drugiePolecenie, false);
  assert.equal(r.koniecTury, 3050);
  assert.match(sc.tabela({ sesje: [Object.assign({ sesja: 's1' }, r)] })[2], /bez drugiego polecenia/);
});

test('slug and session selection work on a transcript directory', () => {
  assert.equal(sc.slug('C:\\Users\\Lukasz\\Desktop\\RelAI'), 'C--Users-Lukasz-Desktop-RelAI');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-start-context-'));
  try {
    fs.writeFileSync(path.join(dir, 'aaaa1111-1.jsonl'), jsonl([czlowiek('a'), asystent('m1', 100, 1)]));
    fs.writeFileSync(path.join(dir, 'bbbb2222-2.jsonl'), jsonl([czlowiek('a'), asystent('m1', 200, 2)]));
    const jedna = sc.pomiar({ transkrypty: dir, sesja: 'bbbb' });
    assert.equal(jedna.sesje.length, 1);
    assert.equal(jedna.sesje[0].pierwsze, 200);
    assert.equal(sc.pomiar({ transkrypty: dir, ostatnie: '5' }).sesje.length, 2);
    assert.match(sc.pomiar({ transkrypty: dir, sesja: 'cccc' }).blad, /brak transkryptu/);
    assert.match(sc.pomiar({ transkrypty: dir }).blad, /--ostatnie/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
