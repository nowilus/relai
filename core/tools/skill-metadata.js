'use strict';
// RelAI core / narzedzie: kontrole metadanych skilli i komend (odnoga AUDYT_SKILLI, paczka S1).
//
// Po co: praktyki Agent Skills (Anthropic, "Skill authoring best practices", odczyt 2026-10-11)
// stawiaja twarde granice — name [a-z0-9-]{1,64}, description <= 1024 znaki bez tagow XML,
// tresc SKILL.md ponizej 500 linii. RelAI stal na styk (6 znakow zapasu w opisie relai-core)
// bez zadnej kontroli. Ten modul to czysta logika; walidator wola go i decyduje o kodzie wyjscia.
//
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const LIMIT_NAZWY = /^[a-z0-9-]{1,64}$/;
const LIMIT_OPISU = 1024;
const LIMIT_LINII = 500;
const OSTRZEZENIE_LINII = 480;
const OSTRZEZENIE_BAJTOW = 20 * 1024;
// Trzecia osoba (BP "descriptions"): bez "I", "you" i bez "MUST BE USED" (L-0114).
const ZAIMKI = /\bI\b|\b[Yy]ou\b|MUST BE USED/;
const NAWIASY_KATOWE = /[<>]/;

function linie(tekst) {
  const czyste = String(tekst).replace(/\r\n/g, '\n');
  const wszystkie = czyste.split('\n');
  if (wszystkie.length && wszystkie[wszystkie.length - 1] === '') wszystkie.pop();
  return wszystkie;
}

// Frontmatter YAML w zakresie, ktorego uzywaja skille i komendy RelAI: skalar zwykly, skalar
// w cudzyslowie i blok zlozony "description: >". Blok mierzymy PO zlozeniu linii — pierwsza linia
// bloku to sam znak ">" (defekt instrumentu z 2026-10-12, PROMPT_ODNOGA AUDYT_SKILLI).
function frontmatter(tekst) {
  const l = linie(tekst);
  if (l[0] !== '---') return null;
  const koniec = l.indexOf('---', 1);
  if (koniec < 0) return null;
  const pola = {};
  for (let i = 1; i < koniec; i++) {
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(l[i]);
    if (!m) continue;
    let wartosc = m[2].trim();
    // Linia nalezy do wartosci, gdy jest wcieta albo pusta, a za nia (przed koncem naglowka) stoi
    // jeszcze linia wcieta — inaczej pusta linia ucinalaby pomiar (przeglad kodu S1).
    const ciagDalszy = (k) => /^\s+\S/.test(l[k]) || (l[k].trim() === '' && l.slice(k + 1, koniec).some((x) => /^\s+\S/.test(x))
      && /^\s+\S/.test(l.slice(k + 1, koniec).find((x) => x.trim() !== '') || ''));
    if (wartosc === '>' || wartosc === '>-' || wartosc === '|' || wartosc === '|-') {
      const blok = [];
      while (i + 1 < koniec && ciagDalszy(i + 1)) blok.push(l[++i].trim());
      wartosc = wartosc.startsWith('>') ? blok.filter(Boolean).join(' ') : blok.join('\n');
    } else if (!/^["']/.test(wartosc) && i + 1 < koniec && /^\s+\S/.test(l[i + 1])) {
      const blok = [wartosc];
      while (i + 1 < koniec && ciagDalszy(i + 1)) blok.push(l[++i].trim());
      wartosc = blok.filter(Boolean).join(' ');
    } else if (/^".*"$/.test(wartosc)) {
      wartosc = wartosc.slice(1, -1).replace(/\\"/g, '"');
    } else if (/^'.*'$/.test(wartosc)) {
      wartosc = wartosc.slice(1, -1).replace(/''/g, "'");
    }
    pola[m[1]] = wartosc;
  }
  return pola;
}

// Jedna pozycja do sprawdzenia: { rel, tekst, nazwa } — nazwa z frontmattera (skill) albo z nazwy
// pliku (komenda, ktora generator Codeksa zamienia w skill o tej nazwie). Wynik: lista naruszen
// { rel, kontrola, wartosc, opis } z podzialem na bledy i ostrzezenia.
function sprawdz(pozycja) {
  const bledy = [];
  const ostrzezenia = [];
  const naruszenie = (lista, kontrola, wartosc, opis) =>
    lista.push({ rel: pozycja.rel, kontrola, wartosc, opis });
  const pola = frontmatter(pozycja.tekst);
  if (!pola) {
    naruszenie(bledy, 'frontmatter', 'brak', 'brak naglowka YAML miedzy liniami ---');
    return { bledy, ostrzezenia };
  }
  const nazwa = pozycja.nazwa !== undefined ? pozycja.nazwa : pola.name;
  if (!nazwa || !LIMIT_NAZWY.test(nazwa)) {
    naruszenie(bledy, 'name', String(nazwa), 'name "' + nazwa + '" spoza wzorca [a-z0-9-]{1,64}');
  }
  const opis = pola.description || '';
  if (!opis) naruszenie(bledy, 'description-brak', 0, 'brak pola description');
  if (opis.length > LIMIT_OPISU) {
    naruszenie(bledy, 'description-znaki', opis.length,
      'description ma ' + opis.length + ' znakow przy limicie ' + LIMIT_OPISU);
  }
  const katowy = NAWIASY_KATOWE.exec(opis);
  if (katowy) {
    const fragment = (/<[^<>]*>/.exec(opis) || [katowy[0]])[0];
    naruszenie(bledy, 'description-katowe', fragment,
      'description zawiera "' + fragment + '" — znaki < > sa zakazane (tagi XML)');
  }
  const zaimek = ZAIMKI.exec(opis);
  if (zaimek) {
    naruszenie(bledy, 'description-osoba', zaimek[0],
      'description zawiera "' + zaimek[0] + '" — opis mowi w trzeciej osobie, bez MUST BE USED');
  }
  const liczbaLinii = linie(pozycja.tekst).length;
  if (liczbaLinii > LIMIT_LINII) {
    naruszenie(bledy, 'linie', liczbaLinii, liczbaLinii + ' linii przy limicie ' + LIMIT_LINII);
  } else if (liczbaLinii > OSTRZEZENIE_LINII) {
    naruszenie(ostrzezenia, 'linie', liczbaLinii,
      liczbaLinii + ' linii — blisko limitu ' + LIMIT_LINII + ', pora na plik doczytywany');
  }
  const bajty = Buffer.byteLength(pozycja.tekst, 'utf8');
  if (bajty > OSTRZEZENIE_BAJTOW) {
    naruszenie(ostrzezenia, 'bajty', bajty,
      bajty + ' B ponad ' + OSTRZEZENIE_BAJTOW + ' B — tresc ponad ~5k tokenow (SZACUNEK)');
  }
  return { bledy, ostrzezenia, opis: opis.length, linii: liczbaLinii, bajty };
}

// Wyjatki zastane (decyzja Lukasza 2026-10-12): naruszenie z listy jest ostrzezeniem, ale TYLKO
// przy zmierzonej wartosci z listy — inna wartosc to blad, a wyjatek, ktory niczego juz nie
// pokrywa, tez jest bledem: lista ma byc oprozniona, nie zapomniana.
function zastosujWyjatki(bledy, wyjatki) {
  const zostaja = [];
  const pokryte = [];
  const uzyte = new Set();
  for (const b of bledy) {
    const i = wyjatki.findIndex((w) => w.plik === b.rel && w.kontrola === b.kontrola);
    if (i < 0) { zostaja.push(b); continue; }
    uzyte.add(i);
    if (String(wyjatki[i].wartosc) === String(b.wartosc)) pokryte.push(b);
    else {
      zostaja.push(Object.assign({}, b, {
        opis: b.opis + ' (lista wyjatkow ma wartosc ' + wyjatki[i].wartosc + ' — napraw albo zmierz od nowa)',
      }));
    }
  }
  const nieaktualne = wyjatki.filter((_, i) => !uzyte.has(i)).map((w) => ({
    rel: w.plik, kontrola: w.kontrola, wartosc: w.wartosc,
    opis: 'wyjatek ' + w.kontrola + ' = ' + w.wartosc + ' niczego juz nie pokrywa — usun go z listy',
  }));
  return { bledy: zostaja.concat(nieaktualne), pokryte };
}

// Rytual "Na koniec": etykiety krokow (1, 1a, 2...) z listy numerowanej od poczatku linii
// w sekcji, ktora zaczyna sie naglowkiem pasujacym do wzorca, az do nastepnego naglowka tego
// samego albo wyzszego poziomu.
function krokiSekcji(tekst, wzorzecNaglowka) {
  const l = linie(tekst);
  const start = l.findIndex((x) => wzorzecNaglowka.test(x));
  if (start < 0) return null;
  const poziom = (/^(#+)/.exec(l[start]) || ['', '#'])[1].length;
  const kroki = [];
  for (let i = start + 1; i < l.length; i++) {
    const h = /^(#+)\s/.exec(l[i]);
    if (h && h[1].length <= poziom) break;
    const m = /^(\d+[a-z]?)\.\s/.exec(l[i]);
    if (m) kroki.push(m[1]);
  }
  return kroki;
}

module.exports = {
  LIMIT_OPISU, LIMIT_LINII, OSTRZEZENIE_LINII, OSTRZEZENIE_BAJTOW,
  frontmatter, sprawdz, zastosujWyjatki, krokiSekcji,
};
