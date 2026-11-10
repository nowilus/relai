# E1 — Porządki widoczne od następnej sesji

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia **wyłącznie dokumenty
i ustawienia tego repozytorium** — zero kodu, zero testów do napisania. Dlatego działa od razu, bez
wydania.

- **Karty w kolejności wykonania:** K-0 (gałąź) → K-B1p → K-E8 → K-E2r → K-E1r → K-E5 → K-D12.
  Gałąź jest pierwsza, bo wszystkie zmiany planu mają na niej wylądować; reszta idzie od zmiany
  o największym skutku dla następnej sesji.
- **Efekt widoczny:** następna sesja w tym repozytorium startuje bez pytania o tryb ciągły, a
  skrót startu nie pokazuje sprawy już załatwionej ani linków donikąd.
- **Szacunek:** SZACUNEK 1 sesja.
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; hook `config-protection` odmawia
  zamiast pytać; człowiek odpowiada na pytanie z K-E2r albo K-D12 inaczej niż „tak” / „nie”.
- **Weryfikacja etapu:** komendy z kart oraz na końcu
  `node .claude/relai/tools/start-digest.js` — w wyjściu nie ma tekstu
  `archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO` ani zdania o trybie „tylko w projektach”
  w sekcji „Gdzie jesteśmy”.

Litera na końcu identyfikatora mówi, która część znaleziska jest tutaj: `p` — część projektowa
(ustawienie tego repozytorium), `r` — dokumenty tego repozytorium. Część w kodzie i szablonach
pluginu mają karty K-B1 (etap E9), K-E2 (etap E11) i K-E1 (etap E10).

---

## K-0 — gałąź robocza

- **Cel:** wszystkie commity planu trafiają na `optymalizacja/po-audycie`; `main` zostaje równy
  wydanemu 3.7.0.
- **Pliki:** żadne.
- **Stan dziś:** `git branch --show-current` → `main`. W drzewie roboczym są niezacommitowane:
  folder planu `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/`, raport `docs/AUDYT_RELAI_2026-11-09.md`,
  zmiany w `CLAUDE.md`, `AGENTS.md`, `docs/STATE.md`, `docs/DZIENNIK.md` z utworzenia planu oraz
  cztery pliki `relai-planning/*-closing.md` ze statusem `M`, których `git diff` jest pusty
  (różnica samych końców linii).
- **Zmiana:**
  1. `git switch -c optymalizacja/po-audycie` — niezacommitowane pliki przechodzą na gałąź razem
     z drzewem roboczym.
  2. Czterech plików `*-closing.md` nie dodajesz do commita i nie „naprawiasz”.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `git branch --show-current` → `optymalizacja/po-audycie`;
  `git log --oneline -1` → `5aeab39 …` (gałąź wychodzi z tego commita albo z późniejszego `main`,
  jeśli człowiek coś dołożył — wtedy zapisz skrót w dzienniku).
- **Nie ruszasz:** `main`, zdalnego repozytorium, tagów.
- **Pułapki:** gałąź już istnieje (sesja etapu przerwana wcześniej) → `git switch optymalizacja/po-audycie`,
  bez `-c`.
- **Gotowe, gdy:** bieżąca gałąź to `optymalizacja/po-audycie`.

---

## K-B1p — tryb ciągły wyłączony w tym projekcie

- **Cel:** wiersz „Tryb ciągły” w `docs/USTAWIENIA.md` ma wartość `wyłączony`; bramka zgody nie
  pojawia się w następnej sesji. Decyzja właściciela z 2026-11-09 (110 odmów na 113 sesji —
  FAKT, raport B1).
- **Pliki:** `docs/USTAWIENIA.md`.
- **Stan dziś** (linia 32, kotwica — początek wiersza):

  ```
  | 2026-09-15 | Tryb ciągły | włączony — każdy prompt merytoryczny wraca najpierw z propozycją i oryginałem obok; filtr pomijania przepuszcza komendy, frazy sesji, krótkie potwierdzenia i pytania. Wartość spoza listy albo brak wiersza = wyłączony i cisza |
  ```

- **Zmiana:** zastąp cały wiersz jednym wierszem (data dnia wykonania etapu):

  ```
  | <RRRR-MM-DD> | Tryb ciągły | wyłączony — decyzja Łukasza po audycie 2026-11-09 (110 odmów na 113 sesji); komenda `/relai-prompt` działa na żądanie. Włączenie: `/relai-prompt on` |
  ```

  Komórka „Decyzja” jest czytana maszynowo: **musi zaczynać się** od słowa `wyłączony`. Starego
  wiersza nie przenosisz do „Ustawień wycofanych” — plik jest już ponad progiem 6 KB, a zmianę
  niesie historia gita i wpis dziennika tego etapu.
- **Test najpierw:** nie dotyczy (zmiana ustawienia). Kontrola przed zmianą — to samo polecenie co
  w weryfikacji ma dać `true`.
- **Weryfikacja:**

  ```bash
  node -e "console.log(require('./core/process/prompt-mode.js').trybCiaglyProjektu(process.cwd()))"
  ```

  Przed zmianą: `true`. Po zmianie: `false`. Wynik `null` znaczy, że komórka nie zaczyna się od
  słowa z zamkniętej listy — popraw wiersz.
- **Nie ruszasz:** wiersza „Model optymalizatora” (karta K-A4, etap E8), wiersza „Język promptu”,
  sekcji „Ustawienia wycofane”.
- **Pułapki:** hook `config-protection` zapyta o zgodę na edycję `docs/USTAWIENIA.md` — to poprawne;
  człowiek potwierdza. Edycję robisz narzędziem Edit (wiersz zawiera backticki).
- **Gotowe, gdy:** polecenie weryfikacji wypisuje `false`.

---

## K-E8 — `STATE.md` mówi prawdę o zasięgu pluginu

- **Cel:** dokument stanu nie twierdzi, że maszyna pracuje w trybie „RelAI tylko w projektach”.
  Decyzja właściciela z 2026-11-09: plugin zostaje włączony globalnie, poprawiamy dokument.
- **Pliki:** `docs/STATE.md`.
- **Stan dziś** — dwa miejsca. Pierwsze (linie 16–17, sekcja „Gdzie jesteśmy”):

  ```
  bramka `pre-push` na tagi. Maszyna Łukasza pracuje w trybie „RelAI tylko w projektach” od
  2026-10-28. Od 2026-11-09 na akceptację czeka plan OPTYMALIZACJA_PO_AUDYCIE (naprawy po audycie
  ```

  (Dalszy ciąg drugiej linii zmienia się przy akceptacji planu — kotwicą jest zdanie
  „Maszyna Łukasza pracuje w trybie … od 2026-10-28.”)

  Drugie (linie 207–209, sekcja „Szczegóły techniczne”):

  ```
  `relai-mods-v0.3.0`, każdy z własnym wydaniem GitHub). Na maszynie Łukasza `relai`
  i trzy dodatki są włączone lokalnie w projektach (tryb „RelAI tylko w projektach”), `relai-mods`
  globalnie. Wydanie: fraza „gotowi do wydania?” →
  ```

- **Zmiana:**
  1. Najpierw odczytaj stan faktyczny: `node core/tools/relai-scope.js status` (tylko podgląd,
     nic nie zapisuje). Zapisz linię „Poziom uzytkownika teraz: …”.
  2. W pierwszym miejscu zdanie „Maszyna Łukasza pracuje w trybie „RelAI tylko w projektach” od
     2026-10-28.” zastąp zdaniem: „Na maszynie Łukasza `relai`, `relai-panel` i
     `relai-cache-keeper` są włączone na poziomie użytkownika, a w projektach z markerem RelAI
     także lokalnie (stan z `relai-scope.js status`, <data>); tryb „RelAI tylko w projektach” jest
     dostępny (`relai-scope.js apply`), ale nie jest włączony.” — nazwy pluginów weź z linii
     odczytanej w kroku 1; jeśli różnią się od podanych, wpisz odczytane.
  3. W drugim miejscu fragment „Na maszynie Łukasza `relai` i trzy dodatki są włączone lokalnie
     w projektach (tryb „RelAI tylko w projektach”), `relai-mods` globalnie.” zastąp:
     „Na maszynie Łukasza pluginy są włączone na poziomie użytkownika i lokalnie w projektach
     z markerem RelAI (stan z `relai-scope.js status`, <data>).”
  4. Zdania o trybie w linii 10 („wcześniej tego dnia 3.6.0 z trybem …”) i w linii 79 (opis
     funkcji) **zostają** — mówią, że tryb istnieje, nie że jest włączony.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `grep -n "pracuje w trybie" docs/STATE.md` → brak trafień;
  `grep -c "tylko w projektach" docs/STATE.md` → `3` (linie 10 i 79 oraz nowe zdanie).
- **Nie ruszasz:** konfiguracji maszyny — **nie uruchamiasz** `relai-scope.js apply` ani `undo`.
- **Pułapki:** `relai-scope.js status` listuje cudze projekty z dysku — do dokumentu przepisujesz
  wyłącznie linię poziomu użytkownika.
- **Gotowe, gdy:** oba greps dają podany wynik.

---

## K-E2r — sprawa załatwiona i dwa martwe linki w sekcjach startowych

- **Cel:** sekcja „Czeka na człowieka” nie niesie sprawy już załatwionej, a linki w niej
  i w `STATE.md` prowadzą do istniejących plików.
- **Pliki:** `docs/DZIENNIK.md`, `docs/STATE.md`.
- **Stan dziś** — pozycja w `docs/DZIENNIK.md` (linie 86–91):

  ```
  - **Rozjazd manifestu z produktem przy opisie repozytorium** — `description`
    w `.claude-plugin/plugin.json` mówi „…framework for Claude Code", a RelAI ma trzy adaptery;
    `keywords` nie zawiera ani jednej nazwy narzędzia. Wizytówka GitHuba ma skopiować manifest, czy
    najpierw poprawiamy manifest (czyli podbicie wersji i pełna sekwencja wydania)? · 2026-09-13 ·
    [karta odnogi OPIS_REPO](archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md)
    *(odroczone 2026-10-14, odroczeń: 1)*
  ```

  Fakty z repozytorium: `.claude-plugin/plugin.json` ma `"description": "… for Claude Code, Cursor
  and Codex"` i słowa kluczowe `codex`, `cursor` (commit `2c41a07`, 2026-10-12); karta odnogi leży
  w `docs/fixy/OPIS_REPO/ODNOGA.md`.

  Pozycja w `docs/STATE.md` (linie 122–124):

  ```
    sondą 0.0.7; pakiet `adapters/codex/panel/` 0.1.0 (13 testów) pokazuje właściwy stan; sonda
    0.0.9 z poprawką fontów czeka na pomiar. Wznowienie tylko decyzją Łukasza. Kontrakt
    w [README adaptera](../adapters/codex/panel/README.md).
  ```

  Katalogu `adapters/codex/panel/` na tej gałęzi nie ma; istnieje na gałęzi `codex/panel-codex`.
- **Zmiana:**
  1. Sprawdź fakty: `grep -n '"description"' .claude-plugin/plugin.json` (ma zawierać „Cursor and
     Codex”) i `ls docs/fixy/OPIS_REPO/ODNOGA.md`.
  2. Zadaj człowiekowi **jedno** pytanie (AskUserQuestion): „Sprawa »Rozjazd manifestu z produktem«
     z 2026-09-13: manifest ma dziś opis »for Claude Code, Cursor and Codex« i słowa kluczowe
     `codex`, `cursor` (commit 2c41a07 z 2026-10-12). Zamknąć ją jako rozstrzygniętą?” — opcje:
     „Zamknąć (Rekomendowane)” / „Zostawić otwartą”.
  3. Odpowiedź „Zamknąć” — wg `.claude/relai/templates/SPEC_DZIENNIK.md`, sekcja „Czeka na
     człowieka” („Pozycja rozstrzygnięta znika z sekcji w tej samej turze”):
     a) **usuń całą pozycję** (sześć linii kotwicy) z sekcji „Czeka na człowieka”;
     b) w karcie źródłowej `docs/fixy/OPIS_REPO/ODNOGA.md` dopisz na końcu pliku linię
        `*(rozstrzygnięte <RRRR-MM-DD> — manifest poprawiony w 2c41a07, 2026-10-12; decyzja Łukasza
        przy etapie E1 planu OPTYMALIZACJA_PO_AUDYCIE)*`;
     c) rozstrzygnięcie z datą i treścią decyzji wpisz do wpisu dziennika tego etapu.
     Krok 4 wtedy **pomijasz** — pozycji z linkiem już nie ma.
     Odpowiedź „Zostawić”: pozycja i jej adnotacja odroczenia zostają bez zmian; wykonujesz krok 4.
  4. Tylko przy „Zostawić”: popraw cel linku w tej pozycji:
     `archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md` → `fixy/OPIS_REPO/ODNOGA.md`
     (tekst linku, treść i data pozycji bez zmian).
  5. W `docs/STATE.md` zdanie „Kontrakt w [README adaptera](../adapters/codex/panel/README.md).”
     zastąp zdaniem: „Pakiet i jego README leżą na gałęzi `codex/panel-codex`
     (`adapters/codex/panel/`), nie na `main`.” W zdaniu wyżej po „pakiet `adapters/codex/panel/`
     0.1.0 (13 testów)” dopisz „— na gałęzi `codex/panel-codex` —”.
- **Test najpierw:** nie dotyczy. Kontrola przed zmianą: `ls docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md`
  → błąd „No such file” (dowód, że link jest martwy).
- **Weryfikacja:**
  `grep -n "odnogi/OPIS_REPO" docs/DZIENNIK.md` → brak trafień (w obu wariantach odpowiedzi);
  przy „Zostawić”: `grep -n "fixy/OPIS_REPO/ODNOGA.md" docs/DZIENNIK.md` → jedno trafienie
  w sekcji „Czeka na człowieka”; przy „Zamknąć”: `grep -c "Rozjazd manifestu z produktem" docs/DZIENNIK.md`
  liczone w sekcji „Czeka na człowieka” → `0`, a `tail -1 docs/fixy/OPIS_REPO/ODNOGA.md` zaczyna
  się od `*(rozstrzygnięte`;
  `grep -n "adapters/codex/panel/README.md" docs/STATE.md` → brak trafień;
  `git branch --list codex/panel-codex` → gałąź istnieje (inaczej zdanie z kroku 5 jest fałszywe —
  zatrzymaj się).
- **Nie ruszasz:** pozostałych dziewięciu pozycji „Czeka na człowieka” — przegląd spraw
  przeterminowanych to osobny rytuał startu; wpisów w `docs/archiwum/`.
- **Pułapki:** `overdue-review.md` zakazuje zamykania sprawy bez decyzji człowieka — dlatego krok 2
  jest pytaniem, a nie edycją. Pozycja jest w sekcji „Czeka na człowieka” na górze dziennika, nie
  we wpisie — edytujesz ją tam, gdzie stoi kotwica.
- **Gotowe, gdy:** cztery polecenia weryfikacji dają podany wynik, a odpowiedź człowieka jest
  zapisana we wpisie dziennika etapu.

---

## K-E1r — kolejność frazy „kończymy na dziś” w `CLAUDE.md` i `AGENTS.md`

- **Cel:** opis frazy w instrukcji zawsze obecnej w kontekście zgadza się z procedurą
  `session-close.md` (sprzątanie artefaktów stoi **przed** wpisem do dziennika).
- **Pliki:** `CLAUDE.md`, `AGENTS.md`.
- **Stan dziś** (`CLAUDE.md` linie 20–21, `AGENTS.md` linie 23–24 — ten sam tekst):

  ```
  dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
  sprzątanie artefaktów roboczych, propozycja commita; „gotowi do wydania?” → komenda projektowa
  ```

  Procedura (`adapters/claude-code/skills/relai-core/session-close.md:12-52`) ma kolejność:
  1 sync dokumentów, 2 rotacja, 2a sprzątanie artefaktów, 3 wpis, 3a plik wznowienia, 4 ryzyka,
  5 commit, 6 podsumowanie.
- **Zmiana:** w obu plikach zastąp fragment
  `sync dokumentów, wpis do dziennika, przegląd ryzyk,` + nowa linia +
  `sprzątanie artefaktów roboczych, propozycja commita;`
  fragmentem
  `sync dokumentów, rotacja, sprzątanie artefaktów` + nowa linia +
  `roboczych, wpis do dziennika, przegląd ryzyk, propozycja commita;`
  (podział linii dobierz tak, żeby żadna nie przekroczyła 100 znaków; reszta akapitu bez zmian).
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:**
  `grep -c "sync dokumentów, rotacja, sprzątanie artefaktów" CLAUDE.md AGENTS.md` → `1` w każdym;
  `grep -c "sync dokumentów, wpis do dziennika" CLAUDE.md AGENTS.md` → `0` w każdym;
  `diff CLAUDE.md AGENTS.md | grep -c "^[<>]"` → `3` przed zmianą i `3` po zmianie (pliki różnią
  się wyłącznie trzema liniami nagłówka `AGENTS.md`).
- **Nie ruszasz:** sekcji „Implementation guidelines (sekcja niemutowalna)”; szablonu
  `core/templates/SPEC_CLAUDE_MD.md` (karta K-E1, etap E10); linii „Aktywny plan”.
- **Pułapki:** cudzysłowy w tym akapicie są mieszane (`„…"` z prostym zamknięciem i `„…”`) —
  edytuj narzędziem Edit, kopiując fragment z pliku, nie z tej karty.
- **Gotowe, gdy:** oba greps dają podany wynik w obu plikach.

---

## K-E5 — aneks do D-14: rotacja i numeracja ryzyk zgodnie ze stanem wdrożonym

- **Cel:** rejestr decyzji nie przeczy specyfikacji rotacji ani tabeli ryzyk. Aneks **opisuje stan
  już wdrożony**; nie zmienia zachowania. Zgoda właściciela na aneks: 2026-11-09.
- **Pliki:** `docs/DECYZJE.md`.
- **Stan dziś:** D-14 (linia 21) mówi „Stała sekcja „Stan otwartych ryzyk" (R-numeracja ciągła)”
  i „Rotacja: >50 KB lub kwartał → archiwum z 1-akapitowym streszczeniem”. Wdrożenie:
  `core/templates/SPEC_ARCHIWUM.md:75` — próg dziennika 150 KB; `:194` — „streszczenia okresu
  **nie piszesz**”; tabela ryzyk w `docs/DZIENNIK.md` używa prefiksów R, P, S, M, O, K, C, L, H, T.
  W tabeli „Decyzje zmienione” (od linii 102) nie ma wiersza D-14.
- **Zmiana:** dopisz **na końcu** tabeli „Decyzje zmienione” jeden wiersz (treści D-14 w linii 21
  nie edytujesz — decyzji zamrożonych się nie przepisuje):

  ```
  | **D-14** → aneks | <RRRR-MM-DD> | Trzy punkty D-14 opisują stan sprzed wdrożenia rotacji: (1) próg rotacji dziennika pochodzi z wiersza „Rotacja dokumentów” w `USTAWIENIA.md` (domyślnie 150 KB), nie „>50 KB lub kwartał”; (2) rotacja **nie pisze streszczenia okresu** — zostawia linię-odsyłacz z sumą kontrolną (`SPEC_ARCHIWUM.md`); (3) ryzyka numeruje się **prefiksem planu albo obszaru** (R, P, S, M, O, K, C, L, H, T), nie jedną ciągłą serią R. Szablon wpisu, podpis i stała sekcja ryzyk na górze pliku — bez zmian. | Audyt 2026-11-09 (znalezisko E5): D-14 przeczyła `SPEC_ARCHIWUM.md` i tabeli ryzyk od wdrożenia rotacji w 1.7.0; aneks zapisuje stan faktyczny, zgoda Łukasza 2026-11-09. |
  ```

- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `grep -c "D-14\*\* → aneks" docs/DECYZJE.md` → `1`;
  `git diff --stat docs/DECYZJE.md` → jedna linia dodana, zero usuniętych.
- **Nie ruszasz:** treści D-14 w linii 21; `SPEC_DZIENNIK.md` (zdanie o numeracji ciągłej —
  znalezisko niskiej wagi poza planem); aneksów D-88 (etap E8), D-93 (etap E9), D-40 (etap E14).
- **Pułapki:** wiersz tabeli jest jedną linią — żadnych łamań w środku; pionowa kreska w treści
  rozbija tabelę (nie używaj jej w tekście komórki).
- **Gotowe, gdy:** oba polecenia dają podany wynik.

---

## K-D12 — dane w plikach śledzonych: decyzja człowieka

- **Cel:** właściciel rozstrzyga dwie pozycje znalezione w archiwum dziennika. Karta **niczego nie
  edytuje sama**.
- **Pliki:** żadne bez decyzji; po decyzji „usunąć” — wskazany plik archiwum.
- **Stan dziś:** `docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md:944` zawiera przypisanie
  nazwy `SECRET_TOKEN` z wartością o kształcie wartości testowej;
  `docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md:257` zawiera adres e-mail konta.
  Repozytorium jest publiczne (`github.com/nowilus/relai`).
- **Zmiana:**
  1. Pokaż człowiekowi obie linie przez wskazanie `plik:linia` (**nie cytuj wartości w czacie**)
     i zadaj jedno pytanie z dwiema częściami: (a) „Czy wartość w linii 944 jest wyłącznie
     testowa?” — „Tak, testowa — zostaje” / „Nie — zastąpić znacznikiem”; (b) „Czy adres e-mail
     w linii 257 ma zostać w publicznym repozytorium?” — „Zostaje” / „Zastąpić znacznikiem”.
  2. „Zastąpić znacznikiem” → w tej jednej linii zamień wartość na `⟦usunięte <RRRR-MM-DD>⟧`
     narzędziem Edit; nic poza tym w pliku. Sama podmiana w bieżącym drzewie **nie usuwa wartości
     z historii gita** — jeśli wartość z linii 944 okazała się prawdziwa, napisz to człowiekowi
     wprost i zarekomenduj unieważnienie sekretu u dostawcy; przepisywania historii nie wykonujesz.
  3. Odpowiedzi zapisz we wpisie dziennika etapu w sekcji „Do zrobienia przez człowieka” albo jako
     rozstrzygnięte.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** przy „Zastąpić”: `node core/guardrails/secret-scan.js <plik>` → kod 0 dla pliku
  z linii 944. Przy „Zostaje”: brak zmian w `git status` dla obu plików.
- **Nie ruszasz:** innych plików archiwum; historii gita.
- **Pułapki:** zapis pliku z linii 944 przejdzie przez hook `secret-scanner`, który skanuje
  **nową treść** edycji — podmiana na znacznik przejdzie; każda inna edycja tej linii może zostać
  zablokowana.
- **Gotowe, gdy:** obie odpowiedzi człowieka są zapisane w dzienniku.
