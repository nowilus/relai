'use strict';

// Kontrole metadanych skilli (odnoga AUDYT_SKILLI, paczka S1): granice z praktyk Agent Skills,
// lista wyjatkow zastanych i zgodnosc listy krokow rytualu "Na koniec". Fixture w pamieci —
// wynik nie zalezy od stanu repozytorium; stan repozytorium sprawdza validate-adapters.js.

const assert = require('node:assert/strict');
const test = require('node:test');

const meta = require('../../tools/skill-metadata.js');

function skill(opis, { nazwa = 'relai-demo', linii = 10, blok = true } = {}) {
  const naglowek = blok
    ? '---\nname: ' + nazwa + '\ndescription: >\n  ' + opis.match(/.{1,90}(\s|$)/g).join('\n  ').trimEnd() + '\n---\n'
    : '---\nname: ' + nazwa + '\ndescription: ' + opis + '\n---\n';
  const tresc = Array.from({ length: Math.max(0, linii - naglowek.split('\n').length + 1) }, (_, i) => 'linia ' + i);
  return naglowek + tresc.join('\n') + '\n';
}

const kontrole = (wynik) => wynik.bledy.map((b) => b.kontrola);

test('opis w bloku zlozonym jest mierzony po zlozeniu linii, nie po pierwszej linii', () => {
  const opis = 'Creates plans. ' + 'Use it when the work needs stages. '.repeat(10);
  const pola = meta.frontmatter(skill(opis.trim()));
  assert.equal(pola.description, opis.trim());
  assert.ok(pola.description.length > 300);
});

test('blok z pusta linia i skalar z wcietym ciagiem dalszym mierzone w calosci (przeglad kodu S1)', () => {
  const dlugi = 'x'.repeat(550);
  const blok = meta.frontmatter('---\nname: a\ndescription: >\n  ' + dlugi + '\n\n  ' + dlugi + '\n---\n');
  assert.equal(blok.description.length, 1101);
  const skalar = meta.frontmatter('---\nname: a\ndescription: ' + dlugi + '\n  ' + dlugi + '\nargument-hint: "x"\n---\n');
  assert.equal(skalar.description.length, 1101);
  assert.equal(skalar['argument-hint'], 'x');
});

test('zdrowy skill przechodzi bez bledow i ostrzezen', () => {
  const wynik = meta.sprawdz({ rel: 'a/SKILL.md', tekst: skill('Runs the demo ritual. Use it when the demo starts.') });
  assert.deepEqual(wynik.bledy, []);
  assert.deepEqual(wynik.ostrzezenia, []);
});

test('kazde naruszenie daje osobny blad z nazwa kontroli i zmierzona wartoscia', () => {
  const przypadki = [
    [skill('Creates plans in docs/plany/<X>/.'), 'description-katowe', '<X>'],
    [skill('x'.repeat(1030), { blok: false }), 'description-znaki', 1030],
    [skill('Runs the demo ritual.', { linii: 501 }), 'linie', 501],
    [skill('I run the demo ritual.'), 'description-osoba', 'I'],
    [skill('MUST BE USED on every prompt.'), 'description-osoba', 'MUST BE USED'],
    [skill('Runs the demo.', { nazwa: 'Relai_Demo' }), 'name', 'Relai_Demo'],
  ];
  for (const [tekst, kontrola, wartosc] of przypadki) {
    const wynik = meta.sprawdz({ rel: 'x/SKILL.md', tekst });
    assert.deepEqual(kontrole(wynik), [kontrola], kontrola);
    assert.equal(wynik.bledy[0].wartosc, wartosc);
    assert.equal(wynik.bledy[0].rel, 'x/SKILL.md');
  }
});

test('481-500 linii i ponad 20 KB to ostrzezenie, nie blad', () => {
  const linie = meta.sprawdz({ rel: 'x', tekst: skill('Runs the demo.', { linii: 490 }) });
  assert.deepEqual(kontrole(linie), []);
  assert.deepEqual(linie.ostrzezenia.map((o) => o.kontrola), ['linie']);
  const duzy = meta.sprawdz({ rel: 'x', tekst: skill('Runs the demo.') + 'ż'.repeat(11000) });
  assert.deepEqual(duzy.ostrzezenia.map((o) => o.kontrola), ['bajty']);
});

test('komenda bierze nazwe z pliku, nie z frontmattera', () => {
  const tekst = '---\ndescription: "Raport o stanie: porzadki"\nargument-hint: "[x]"\n---\n\nTresc.\n';
  assert.deepEqual(meta.sprawdz({ rel: 'c/relai-audit.md', nazwa: 'relai-audit', tekst }).bledy, []);
  assert.deepEqual(kontrole(meta.sprawdz({ rel: 'c/Zla.md', nazwa: 'Zla', tekst })), ['name']);
});

test('wyjatek pokrywa naruszenie tylko przy zmierzonej wartosci; nieaktualny wyjatek to blad', () => {
  const blad = { rel: 'a/SKILL.md', kontrola: 'linie', wartosc: 510, opis: '510 linii' };
  const wyjatek = { plik: 'a/SKILL.md', kontrola: 'linie', wartosc: 510 };
  assert.deepEqual(meta.zastosujWyjatki([blad], [wyjatek]), { bledy: [], pokryte: [blad] });

  const gorszy = meta.zastosujWyjatki([Object.assign({}, blad, { wartosc: 515 })], [wyjatek]);
  assert.equal(gorszy.bledy.length, 1);
  assert.match(gorszy.bledy[0].opis, /lista wyjatkow ma wartosc 510/);

  const pusty = meta.zastosujWyjatki([], [wyjatek]);
  assert.equal(pusty.bledy.length, 1);
  assert.match(pusty.bledy[0].opis, /niczego juz nie pokrywa/);

  const obcy = meta.zastosujWyjatki([Object.assign({}, blad, { rel: 'b/SKILL.md' })], [wyjatek]);
  assert.equal(obcy.bledy.length, 2, 'naruszenie spoza listy zostaje bledem, a wyjatek jest nieaktualny');
});

test('kroki rytualu: etykiety z listy numerowanej w sekcji, do naglowka tego samego poziomu', () => {
  const tekst = '# T\n\n## Rytuał „Na koniec" etapu\n\n1. **STATUS**\n1a. katalog\n   2. wciecie nie liczy sie\n2. dziennik\n\n'
    + '### podsekcja\n\n3. bramki\n\n## Dalej\n\n4. obca lista\n';
  assert.deepEqual(meta.krokiSekcji(tekst, /^## Rytuał „Na koniec" etapu/), ['1', '1a', '2', '3']);
  assert.equal(meta.krokiSekcji(tekst, /^## Nie ma/), null);
  assert.deepEqual(meta.krokiSekcji(tekst.replace(/\n/g, '\r\n'), /^## Rytuał „Na koniec" etapu/), ['1', '1a', '2', '3'],
    'CRLF daje te same kroki (zasada 11)');
});
