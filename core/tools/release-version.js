'use strict';
// RelAI core / narzedzie: propozycje numerow wydania (plan PIPELINE_WYDAN, E2).
//
// Modul wolany przez release-check.js. Dla rdzenia i kazdego modu ze zmianami wymagajacymi wydania
// (pole "wydanie" mapy wplywu: "rdzen" albo "mod:<nazwa>") proponuje patch albo minor z typow
// conventional commits od bazy: feat (albo znacznik "!" / BREAKING CHANGE) -> minor, reszta ->
// patch. Usunieta albo przemianowana komenda -> co najmniej minor (PLAN, sekcja 8). Zmiany wylacznie
// w wierszach "wydanie: brak" (docs, strona, film, README) -> brak propozycji.
// Commit liczy sie tylko wtedy, gdy dotknal pliku wymagajacego wydania tego komponentu: feat strony
// nie podnosi numeru rdzenia. Tylko czyta. Komunikaty bez polskich znakow diakrytycznych (L-0016).

const CONVENTIONAL = /^([a-z]+)(?:\([^)]*\))?(!)?:\s/;

function poziomCommitu(temat, tresc) {
  const m = CONVENTIONAL.exec(temat || '');
  if (!m) return { poziom: 'patch', typ: null, breaking: false };
  const breaking = Boolean(m[2]) || /^BREAKING[ -]CHANGE:/m.test(tresc || '');
  return { poziom: m[1] === 'feat' || breaking ? 'minor' : 'patch', typ: m[1], breaking };
}

function podbij(wersja, poziom) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(wersja || '');
  if (!m) return null;
  return poziom === 'minor' ? m[1] + '.' + (Number(m[2]) + 1) + '.0' : m[1] + '.' + m[2] + '.' + (Number(m[3]) + 1);
}

// Porownanie numerow X.Y.Z: ujemne, gdy a < b.
function porownaj(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// Commity zakresu z lista plikow kazdego: "git log --name-only" z separatorami spoza tekstu.
function commity(git, repo, od, doRev, sciezki) {
  const args = ['log', '--format=%x1e%H%x1f%s%x1f%b%x1f', '--name-only', od + '..' + (doRev || 'HEAD')];
  const out = git(repo, sciezki && sciezki.length ? args.concat(['--']).concat(sciezki) : args);
  return out.split('\x1e').filter((b) => b.trim()).map((b) => {
    const [hash, temat, tresc, pliki] = b.split('\x1f');
    return { hash, temat, tresc, pliki: (pliki || '').split('\n').map((p) => p.trim()).filter(Boolean) };
  });
}

// pliki: Set plikow komponentu wymagajacych wydania; usuniete: komendy usuniete albo przemianowane.
function propozycja(komponent, wersja, wersjaBazy, pliki, usuniete, lista) {
  if (!pliki.size) return null;
  const istotne = lista.filter((c) => c.pliki.some((p) => pliki.has(p)));
  let poziom = 'patch';
  const powody = [];
  for (const c of istotne) {
    const p = poziomCommitu(c.temat, c.tresc);
    if (p.poziom === 'minor') {
      poziom = 'minor';
      powody.push(c.hash.slice(0, 7) + ' ' + c.temat + (p.breaking ? ' (BREAKING - major tylko decyzja czlowieka)' : ''));
    }
  }
  if (usuniete.length) {
    poziom = 'minor';
    powody.push('usunieta lub przemianowana komenda: ' + usuniete.join(', '));
  }
  const zCommitow = new Set(istotne.flatMap((c) => c.pliki));
  const bezCommitu = Array.from(pliki).filter((p) => !zCommitow.has(p)).length;
  if (!powody.length && istotne.length) powody.push('same poprawki (fix, refactor, docs, chore...)');
  // Plik bez commitu nie niesie typu: poziom jest dolna granica, nie wynikiem (przeglad E2).
  if (bezCommitu) powody.push('poziom niepewny: ' + bezCommitu + ' plikow bez commitu - propozycja to co najmniej ' + poziom);
  const nowa = podbij(wersjaBazy, poziom);
  const stan = !nowa ? 'numer bazy nieczytelny'
    : wersja === wersjaBazy ? 'do podbicia'
    : wersja === nowa ? 'podbity'
      : !podbij(wersja, 'patch') ? 'numer nieczytelny'
        : porownaj(wersja, nowa) < 0 ? 'ponizej propozycji' : 'powyzej propozycji';
  return { komponent, wersjaBazy, wersja, poziom, propozycja: nowa, stan, plikow: pliki.size, commitow: istotne.length, bezCommitu, powody };
}

module.exports = { poziomCommitu, podbij, porownaj, commity, propozycja };
