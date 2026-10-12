# SPEC — przegląd cudzego kodu przed przyjęciem do projektu

Zawartość: Rola · Kiedy · Lista kontrolna · Werdykt i zapis · Gdy czegoś nie wiesz · Zakazy · Przykład.

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wynikiem przeglądu jest **wpis w
`docs/DZIENNIK.md`** w języku projektu — osobnego dokumentu ta specyfikacja nie tworzy.

## Rola

Kod, który nie powstał w tym projekcie, a ma w nim działać — fork, skopiowana biblioteka, skill,
plugin albo mod z zewnątrz — dostaje te same uprawnienia co kod własny: czyta pliki, uruchamia
procesy, łączy się z siecią. Przegląd odpowiada na jedno pytanie: **czy każda rzecz, którą ten kod
robi, pasuje do celu, dla którego go bierzemy**. Źródło listy: „Agent Skills — overview”,
sekcja o bezpieczeństwie (platform.claude.com, odczyt 2026-10-11) — skille i kod z niezaufanego
źródła przeglądasz w całości, zanim zaczną działać.

## Kiedy

- przed pierwszym przyjęciem cudzego kodu do repozytorium (fork, kopia, `vendor/`, nowy plugin
  z zewnątrz w marketplace projektu),
- przed przyjęciem nowej wersji tego kodu z góry (merge z upstreamu),
- gdy człowiek prosi o przegląd („sprawdź ten fork”, „czy to bezpieczne”).

Zależność instalowana menedżerem pakietów (`npm`, `pip`) idzie przez audyt ekosystemu z
`SPEC_PROMPT_ETAPU.md` (punkt bezpieczeństwa), nie przez tę listę — chyba że jej kod kopiujesz
do repozytorium.

## Lista kontrolna

Każdy punkt sprawdzasz **na plikach**, komendą albo odczytem — nie z opisu w README. Wynik
każdego punktu to jedno zdanie z dowodem (plik, linia, liczba trafień).

1. **Inwentarz** — lista wszystkich plików przyjmowanego kodu (`git ls-files <katalog>`),
   z rozróżnieniem: kod wykonywany, testy, typy, dokumenty, zasoby binarne. Plik binarny albo
   zminifikowany bez źródła → werdykt najwyżej „z warunkami”.
2. **Sieć** — każde wywołanie sieciowe: `require('http'|'https'|'net'|'tls'|'dgram')`, `fetch(`,
   API sieciowe gospodarza (np. `$.http` w modach). Dla każdego: dokąd, po co, czy za zgodą
   człowieka. Wzorzec do `grep -nE`:
   `require\(['"](node:)?(http|https|net|tls|dgram)['"]|from ['"](node:)?(http|https|net|tls|dgram)['"]|fetch\(|\$\.http`
   — i kontrola pozytywna tym samym wzorcem na pliku, który na pewno wywołuje sieć. (W repozytorium
   RelAI ten sam wzorzec pilnuje walidator: wywołanie wolno mieć tylko modułom z listy dozwolonych.)
3. **Pliki** — co czyta i co zapisuje: katalog projektu, katalog domowy (`~/.claude`, poświadczenia,
   klucze SSH, zmienne środowiskowe), katalogi systemowe. Zapis i kasowanie poza katalogiem
   projektu → werdykt najwyżej „z warunkami”.
4. **Procesy** — `child_process`, `exec`, `spawn`, powłoka, `eval`, `new Function`, dynamiczny
   `import()` ze zmiennej ścieżki. Każde uruchomienie: co, z jakimi argumentami, skąd pochodzą.
5. **Zgodność z celem** — każda operacja z punktów 2–4 ma uzasadnienie w deklarowanym celu kodu.
   Operacja bez uzasadnienia jest ustaleniem, nawet gdy wygląda niegroźnie.
6. **Zależności i skrypty instalacji** — `package.json` (`dependencies`, `postinstall`,
   `preinstall`), `requirements.txt`, hooki gita. Skrypt wykonywany przy instalacji czytasz w
   całości.
7. **Licencja** — plik licencji obecny i zachowany w kopii, licencja zgodna z licencją projektu,
   atrybucja tam, gdzie licencja jej wymaga (opis pluginu, README).

## Werdykt i zapis

Werdykt — jedno z trzech brzmień, dosłownie:

| Werdykt | Kiedy |
|---|---|
| `PRZYJĘTY` | wszystkie punkty bez ustaleń |
| `PRZYJĘTY Z WARUNKAMI` | ustalenia o znanym zasięgu; każdy warunek ma właściciela i termin (pozycja w „Czeka na człowieka” albo zadanie w planie) |
| `ODRZUCONY` | operacja niezgodna z celem, sieć albo pliki poza zgodą, licencja niezgodna |

Zapis — we wpisie dziennika sesji, w sekcji „Zweryfikowane — jak dokładnie”: nazwa i wersja
(commit, tag) przyjmowanego kodu, źródło, siedem punktów listy po jednym zdaniu z dowodem
i werdykt w osobnej linii `Werdykt przeglądu: <brzmienie>`.

## Gdy czegoś nie wiesz

Punkt, którego nie da się sprawdzić (kod zminifikowany, zależność bez źródła, zachowanie zależne
od serwera), **nie przechodzi milcząco**: zapisujesz go jako „niesprawdzone — <powód>” i werdykt
schodzi co najmniej do `PRZYJĘTY Z WARUNKAMI`. Brak licencji to pytanie do człowieka, nie
założenie.

## Zakazy

- Nie uruchamiasz przyjmowanego kodu przed przeglądem — także „żeby zobaczyć, co robi”.
- Nie wpisujesz werdyktu bez dowodu przy każdym punkcie.
- Nie przepuszczasz wywołania sieciowego dopisaniem modułu do listy dozwolonych bez zdania
  „po co” w komentarzu przy pozycji listy.

## Przykład

Wpis z przeglądu forka `savvy-progress` (plugin `relai-progress`, 2026-10-12):

```markdown
**Zweryfikowane — jak dokładnie:** przegląd cudzego kodu wg `SPEC_PRZYJECIE_KODU.md` —
`progress/` (fork `savvy-progress` autorstwa johnnyvizz, stan z commita `f64f2e6`):
1. Inwentarz: 28 plików — 5 modułów hooków (`.ts`/`.tsx`), 17 kopii rdzenia `core/panel/*.mjs`
   (`sync-panel-core.js`), 2 testy, 2 manifesty JSON, typy, licencja; bez binariów i kodu
   zminifikowanego.
2. Sieć: 0 trafień (`require` http/https/net/tls/dgram, `fetch(`, `$.http`); kontrola pozytywna
   tym samym wzorcem na `panel/`: 1 trafienie (cennik po „Tak”).
3. Pliki: 9 odczytów (`$.fs.read`/`list`/`stat`/`exists`) w katalogu sesji; 0 zapisów.
4. Procesy: 0 w kodzie wykonywanym — 41 trafień wzorca to `RegExp.exec`, typy JSDoc
   `import('…')` i `$.agent.spawn` w dwóch testach.
5. Zgodność z celem: odczyt planu, promptu etapu, pomiarów i cennika = pasek postępu i `/relai-agents`.
6. Zależności: brak `package.json`, brak skryptów instalacji.
7. Licencja: MIT, `LICENSE-savvy-progress` zachowany, atrybucja w opisie pluginu.
Werdykt przeglądu: PRZYJĘTY
```
