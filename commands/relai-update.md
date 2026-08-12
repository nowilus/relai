---
description: Aktualizuje projekt RelAI do wersji zainstalowanego pluginu — pokazuje różnice, zmienia wyłącznie za zgodą, szanuje lokalne nadpisania i kończy wpisem w dzienniku
argument-hint: ""
---

# /relai-update — aktualizacja projektu do wersji pluginu

**Ta komenda pochodzi z RelAI 1.1.0** — ta liczba to wersja docelowa aktualizacji. Komenda jest
częścią pluginu, więc jej treść zawsze odpowiada wersji zainstalowanej; przy każdym wydaniu
pluginu liczba w tym zdaniu jest podbijana.

Twoje zadanie: doprowadzić **strukturę** projektu do stanu wersji docelowej — pokazując wcześniej
różnice, zmieniając wyłącznie za zgodą i nie ruszając niczego, co użytkownik nadpisał lokalnie
(D-72, R6). Aktualizacja dotyka plików struktury RelAI; treść merytoryczna projektu (STATE,
wpisy dziennika, plany, kod) jest poza jej zakresem.

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak markera → jedno zdanie:
ten folder nie jest projektem RelAI; nowy projekt zakłada inicjalizacja, istniejący przenosi
`/relai-adopt`. Koniec.

## Krok 1 — porównanie wersji

- **Wersja projektu:** z linii markera — wartość czytana maszynowo, kotwica na początku linii
  `Wersja RelAI:` / `RelAI version:` (L-0025). Linia nieczytelna → powiedz to wprost i zakończ;
  nie zgadujesz.
- **Wersja docelowa:** liczba z nagłówka tej komendy (patrz wyżej). Kontrolnie: hook
  `session-context` podaje na starcie sesji wersję pluginu — rozjazd między nimi oznacza, że
  sesja działa na innej wersji pluginu niż ta, z której pochodzi komenda; powiedz o tym i użyj
  wersji z kontekstu hooka.

Rozstrzygnięcie:

- **równe** → „Projekt jest aktualny (X)." — koniec, bez wpisu w dzienniku. Dopisz **jedno zdanie**
  na wypadek, gdy użytkownik właśnie zaktualizował plugin i spodziewa się różnicy: aktualizacja
  pluginu wchodzi w życie **dopiero po restarcie aplikacji**, więc sesja uruchomiona wcześniej
  wykonuje starą wersję tej komendy i widzi starą wersję docelową (L-0031). Nie potrafisz tego
  sprawdzić od środka — wersja, którą widzisz, jest tą, którą wykonujesz — więc po prostu o tym
  powiedz i zaproponuj restart plus ponowne wywołanie;
- **projekt nowszy niż plugin** → nie cofasz projektu; powiedz wprost, że to plugin wymaga
  aktualizacji (`claude plugin update relai@relai`), i zakończ;
- **projekt starszy** → kroki 2–5.

## Krok 2 — inwentaryzacja: czego brakuje do wersji docelowej

Nie odtwarzasz historii wersja-po-wersji — porównujesz **stan projektu** z **stanem docelowym**
wersji, z której pochodzi ta komenda. Dzięki temu projekt 0.5.0 i projekt 0.8.0 aktualizują się
tą samą procedurą. Sprawdzasz kolejno:

| Obszar | Stan docelowy 1.1.0 | Jak sprawdzasz |
|---|---|---|
| nadpisania lokalne (R6) | **nietykalne** — cokolwiek znajdziesz, omijasz | `docs/zasoby/HTML_PLAN/` istnieje? wiersz „Szablon planu HTML" w `USTAWIENIA.md`? wiersze „lokalne" w `KOMENDY.md`? |
| `docs/USTAWIENIA.md` | wiersz `Profil projektu` z wartością maszynową na **początku** komórki: `app`, `agent-voice`, `flow` albo `prompty` | czytasz komórkę; wartość nierozpoznana → propozycja doprecyzowania (nowy wiersz, stary do „Ustawień wycofanych") — **pytasz o profil, nie zgadujesz** (L-0026) |
| `CLAUDE.md` | sekcja `## Reguły profilu (<profil>)` zaraz po „Regułach procesu" | sekcji brak, a profil rozpoznany → do dodania wg `SPEC_PROFILE.md`; profil nierozpoznany → najpierw poprzedni wiersz |
| `CLAUDE.md` | linia fraz sesji pod listą rytuału startu | linii brak → do dodania wg `SPEC_CLAUDE_MD.md` (sekcja „Linia fraz sesji"); nie ruszasz przy tym niczego innego w pliku |
| `CLAUDE.md` | reguła sygnału odchylenia w „Regułach procesu" (odnoga / aneks / świadomie odłożone) | punktu brak → do dodania wg `SPEC_CLAUDE_MD.md` (sekcja „Reguła sygnału odchylenia"); nie ruszasz przy tym niczego innego w pliku |
| `docs/KOMENDY.md` | nagłówek `RelAI 1.1.0`, tabela dziesięciu komend (w tym `/relai-adopt`, `/relai-update`, `/relai-branch`), aktualna sekcja zachowań automatycznych | plik regenerowany wg `SPEC_KOMENDY.md`; wiersze oznaczone „lokalne" **przeżywają** regenerację |
| marker wersji | `Wersja RelAI: 1.1.0` | zmiana **na końcu**, po wykonaniu zatwierdzonych zmian |

Specyfikacje (`SPEC_PROFILE.md`, `SPEC_KOMENDY.md`) czytasz z lokalnej kopii
`.claude/relai/templates/` — w projekcie RelAI dostarcza ją hook przy starcie sesji. Kopii nie
ma → wywołaj narzędziem `Skill` skill `relai-core` (wywołanie wyzwala provisioning); nadal nie
ma → powiedz wprost i poproś o sesję z `--add-dir` na katalog pluginu (L-0023). **Nie generujesz
ze wspomnień** (D-60).

Struktur, których stara wersja nie miała **i które nie są stanem docelowym rdzenia** (dokumenty
warunkowe profilu, plany), nie dokładasz — powstają przy zdarzeniu (D-10), nie przy aktualizacji.

## Krok 3 — diff i zgoda

Pokaż różnice jako **numerowaną listę działań**, każde z trzema informacjami: co się zmieni
(plik + zakres), dlaczego (czego brakuje do wersji docelowej), czy jest odwracalne. Osobno
wypisz, co **pomijasz jako nadpisanie lokalne** — użytkownik ma zobaczyć, że jego zmiany są
widziane i chronione, nie przemilczane.

**Czekasz na zgodę.** Zgoda może być częściowa (numery), całościowa albo wyrażona z góry w treści
polecenia — diff i tak pokazujesz przed zapisem. Odmowa albo brak odpowiedzi → **projekt zostaje
nietknięty**, łącznie z markerem wersji; bez wpisu w dzienniku.

## Krok 4 — wykonanie zatwierdzonych zmian

Kolejność: zmiany w plikach → marker wersji na końcu. Marker podbity przy niewykonanych zmianach
kłamałby, że projekt jest w stanie docelowym; przerwana sesja ma zostawić marker stary, żeby
kolejne wywołanie tej komendy dokończyło pracę.

- Regeneracja `KOMENDY.md`: wiersze „lokalne" przepisujesz bez zmian (D-62).
- Sekcja „Reguły profilu": brzmienie profilu z `SPEC_PROFILE.md` (sekcja „Przykład"), w języku
  projektu; wstawiasz sekcję, **niczego innego w `CLAUDE.md` nie zmieniając** — w szczególności
  sekcji niemutowalnej i ewentualnej sekcji „Zasady projektu (odziedziczone)".
- Zapisy w `CLAUDE.md` i `USTAWIENIA.md` przechodzą przez hook `config-protection`, który zażąda
  potwierdzenia — to w porządku, użytkownik właśnie się zgodził. Blokada bez możliwości
  potwierdzenia (sesja nieinteraktywna) → powiedz wprost, które zmiany czekają, i pokaż ich
  treść; nie omijasz hooka i nie odpuszczasz po cichu.
- Marker: linia `Wersja RelAI:` dostaje wersję docelową; data inicjalizacji zostaje.

## Krok 5 — wpis w dzienniku i podsumowanie

1. Wpis na końcu sekcji „Wpisy" `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md` (D-72): wersja
   z → na, lista wykonanych zmian, lista pominiętych nadpisań lokalnych, co odrzucono.
2. Propozycja commita: `chore: update RelAI project to 1.1.0`. Commit wyłącznie za zgodą.
3. Podsumowanie 2–4 zdania: co się zmieniło, czego nie ruszono i dlaczego, czy coś czeka na
   człowieka.

---

## Zakazy tej komendy

- **Nie ruszasz nadpisań lokalnych** — `docs/zasoby/HTML_PLAN/`, wierszy „lokalne", niczego, co
  użytkownik świadomie zmienił (R6, D-62). Wątpliwość, czy coś jest nadpisaniem → pytanie, nie
  nadpisanie.
- Nie zmieniasz treści merytorycznych: `STATE.md`, wpisów dziennika, lekcji, decyzji, planów,
  kodu. Aktualizacja dotyczy struktury, nie zawartości.
- Nie podbijasz markera wersji przed wykonaniem zatwierdzonych zmian ani przy odmowie.
- Nie wykonujesz żadnej zmiany przed zgodą — dowodem jest identyczny stan projektu po `/relai-update`
  przerwanym przed odpowiedzią.
- Nie cofasz projektu do starszej wersji.
- Nie „naprawiasz przy okazji" rzeczy spoza inwentaryzacji — od porządków jest `/relai-audit`.
- Nie dokładasz dokumentów warunkowych profilu ani planów (D-10, D-11).
