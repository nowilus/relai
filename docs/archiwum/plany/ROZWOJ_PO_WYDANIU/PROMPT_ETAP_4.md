# PROMPT_ETAP_4 — Rdzeń przenośny: wydzielenie rdzenia, guardrails jako skrypty, pre-commit ze skanem sekretów (RelAI 1.4.0)

Plan: ROZWOJ_PO_WYDANIU • Etap: **E4 z E8** • Wygenerowano: 2026-08-12 (autor: Opus, w rytuale
„Na koniec" etapu E3) • Wykonawca: **Opus** (linia metryczna `STATUS.md`: „Opus — z ustawień
projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (P1 i P2 są ryzykami tego etapu) + ostatni wpis (E3) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (37 pozycji) |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 5 („Port: wspólny rdzeń + adaptery" — diagram i pięć punktów), sekcja 6 (zakres E4), sekcja 7 (ryzyka P1, P2), sekcja 8 (przypadki brzegowe: naprzemienna praca w dwóch narzędziach, zespół bez Node.js) |
| `hooks/secret-scanner.js` | logika skanu sekretów — to ona wychodzi z hooka do czystego skryptu |
| `hooks/config-protection.js` | druga blokada twarda (D-41) — sprawdzasz, ile z niej da się wyjąć |
| `hooks/hooks.json` | rejestracja dziesięciu hooków w czterech zdarzeniach — punkt wejścia adaptera Claude Code |
| `README.md` | sekcja o strukturze repozytorium i konwencji hook-guard — po E4 opisuje układ z rdzeniem |
| `docs/USTAWIENIA.md` | preferencje projektu, w tym język warstw adapterów (wiersz z 2026-08-12) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Architektura portu: wspólny rdzeń + adaptery** (sekcja 4 planu, wariant wybrany). Rdzeń to
  warstwy A i B z inwentarza przenośności: specyfikacje dokumentów, opisy procesu i logika
  guardrails wyciągnięta z hooków do **czystych skryptów Node** wywoływalnych z dowolnego miejsca.
  Adapter Claude Code = dzisiejszy plugin przepięty na rdzeń, **z zachowaniem wszystkich gwarancji**.
- **Język warstw** (Aneks A, `USTAWIENIA.md` 2026-08-12): warstwa czytana przez model (reguły
  Cursora, `AGENTS.md`) — angielski; warstwa czytana przez człowieka (instalacja, README adapterów)
  — polski. Dokumenty projektów bez zmian.
- **Pre-commit mieszka w repozytorium, nie w harnessie** (sekcja 5 planu) — to jedyny sposób, żeby
  gwarancja D-42 działała tam, gdzie hooków nie ma.
- **Kolejność jest odwrotna do intuicji:** najpierw rozpoznanie **stanu faktycznego** mechanizmów
  Cursora i Codexa (zapisane w `docs/`), potem wydzielanie rdzenia. Adapter budowany na założeniach
  o cudzym narzędziu to E5 zbudowane dwa razy.
- **Adaptery to E5 (Cursor) i E7 (Codex), pilotaż w firmie to E6.** W tym etapie **nie tworzysz**
  ani jednego pliku adaptera Cursora ani Codexa i nie obiecujesz ich w dokumentach użytkownika
  (L-0002). E4 kończy się na tym, że plugin Claude Code działa jak dotąd, tylko zasilany z rdzenia,
  a pre-commit łapie sekret bez udziału Claude.
- Wersja tego etapu: **1.4.0**. Numer żyje w `plugin.json`, `marketplace.json`, obu skillach,
  `/relai-update`, `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README i markerze tego
  repo — L-0008 obowiązuje.

## Stan wyjściowy — co realnie zastajesz

RelAI **1.3.0** w repozytorium (E3 zamknięty 2026-08-12 — cztery poprawki z retrospektywy).
**Uwaga o warunkach pracy:** zainstalowany plugin może nadal pokazywać 1.1.0, dopóki człowiek nie
wykona push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` →
**restart aplikacji** (L-0031). Wersję potwierdź `installed_plugins.json` (L-0020), nie pamięcią.
To jest **otwarta bramka manualna** planu, widoczna w `STATUS.md`.

```
.claude-plugin/plugin.json      # manifest, wersja 1.3.0
.claude-plugin/marketplace.json # marketplace, wersja 1.3.0
hooks/*.js + hooks/hooks.json   # dziesięć hooków Node bez zależności (od 1.3.0 journal-signature)
hooks/secret-scanner.js         # PreToolUse, BLOKUJE — kandydat numer jeden do rdzenia
hooks/config-protection.js      # PreToolUse, BLOKUJE — bramka snapshotu i ochrona ustawień
commands/                       # dziesięć komend operacyjnych
skills/relai-{core,planning}/   # dwa skille; rytuały, planowanie, bramki manualne
templates/                      # 20 SPEC_*.md + README + HTML_PLAN/
docs/plany/ROZWOJ_PO_WYDANIU/   # PLAN.html (zamrożony), STATUS.md, PROMPT_ETAP_1..4, odnogi/
```

**Dwie odnogi planu są OTWARTE** i nie należą do tego etapu: `OPIS_REPO` oraz `POMIAR_ODNOG`
(dziewięć scenariuszy pomiaru świeżą sesją — cztery z E1, dwa z E2, trzy z E3).

**Czego jeszcze NIE ma (to jest zakres tego etapu):**

- **rozpoznania mechanizmów Cursora i Codexa** — plan opisuje architekturę, ale nigdzie w repo nie
  ma zapisu, co te narzędzia realnie potrafią (reguły zawsze-w-kontekście, komendy, hooki),
- **wydzielonego rdzenia** — specyfikacje, proces i logika guardrails siedzą dziś w strukturze
  pluginu Claude Code i nie da się ich użyć z innego miejsca,
- **guardrails jako czystych skryptów** — skan sekretów żyje wyłącznie wewnątrz hooka
  `secret-scanner.js`, razem z protokołem `permissionDecision`,
- **git pre-commit ze skanem sekretów** — repozytorium nie ma żadnego hooka gita,
- **walidatora spójności rdzeń↔adaptery** — nic nie wykryje adaptera, który został w tyle za
  rdzeniem.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest
   martwa. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Zachowania skilli mierzysz **realnie** — świeżą sesją `claude -p … --output-format stream-json`
   i liczbą wywołań narzędzia `Skill`. Po zmianie skilla: push → `marketplace update` →
   `plugin update`. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta, sprawdź, czy da się je zweryfikować z wnętrza sesji
   wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt". (L-0006)
7. Test zakazu wymaga dowodu negatywnego. (L-0007)
8. Po podbiciu wersji przepuść repo `grep`-em po starym numerze i rozstrzygnij każde
   trafienie. (L-0008)
9. Opis skilla/komendy zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. (L-0010)
11. Odesłanie do specyfikacji nie wystarcza — struktura musi być wypisana w treści. (L-0011)
12. Katalog pluginu jest dla sesji niedostępny — mechanizm czytający stamtąd wymaga zapasowej
    ścieżki (kopia `.claude/relai/templates/`). (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania; martwy link nie jest poprawny nigdy. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. (L-0014)
15. Komenda wywołana wprost nie ładuje skilla, do którego się odwołuje. (L-0015)
16. Komunikaty hooków są celowo ASCII. (L-0016)
17. Działanie hooka dowodzisz efektem, nie zdarzeniem w transkrypcie; payloady buduj Nodem. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief. (L-0019)
20. Zainstalowaną wersję potwierdzasz `installed_plugins.json`, nie `plugin details`. (L-0020)
21. Narzędzie systemowe rozstrzygające o formacie artefaktu wywołuj pełną ścieżką i sprawdzaj
    wynik, nie kod wyjścia. (L-0021)
22. W dokumencie użytkownika podajesz zmierzoną formę wywołania: `/relai:relai-<nazwa>`. (L-0022)
23. Krok sięgający poza katalog roboczy ma zapisane wyjście po odmowie dostępu. (L-0023)
24. Sesja pomiarowa `claude -p`: polskie znaki przez **stdin**, zapis wymaga `acceptEdits`. (L-0024)
25. Wartość czytana maszynowo dopasowuje się do kotwicy; nierozpoznana znaczy cisza. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów — ścieżka „pytam zamiast zmyślać"
    z formą `<DO UZUPEŁNIENIA: …>`. (L-0026)
27. Plików z polskimi znakami nie przepuszczasz przez PowerShell 5.1. (L-0027)
28. Sesja pomiarowa z narzędziami systemowymi potrzebuje `--allowedTools "Bash"`. (L-0028)
29. Komponent opcjonalny musi dać się pominąć **bez śladu** — żadnych pustych wypełniaczy. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w warstwie obecnej w kontekście każdej sesji;
    mechanizm wyzwalany dokłada procedurę. (L-0030)
31. `claude plugin update` nie działa od razu — do restartu aplikacji sesje ładują stary
    cache. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json`, niezależnie od
    konta w aplikacji — limit sprawdzasz przed pomiarem. (L-0032)
33. Sumy kontrolne plików wędrujących przez gita porównuj po normalizacji końców linii. (L-0033)
34. Próg liczbowy kalibrujesz na zmierzonych plikach realnych projektów. (L-0034)
35. Dopisek czytany maszynowo dostaje w specyfikacji zbiór akceptowanych brzmień, zanim powstanie
    mechanizm, który go czyta. (L-0035)
36. Sygnał, który ma paść **raz**, ma jednego właściciela; druga warstwa dostaje instrukcję
    milczenia. Cisza właściciela znaczy „sprawdzone i zgodne". (L-0036)
37. Scenariusz „konfiguracji nie ma" mierzysz z podstawionym katalogiem domowym. (L-0037)

## Zakres etapu

1. **Rozpoznanie stanu faktycznego** — `docs/PRZENOSNOSC.md` (nowy): co Cursor i Codex realnie
   dają w wersji z dnia etapu — reguły zawsze-w-kontekście, komendy, hooki, dostęp do plików,
   możliwość zablokowania operacji. Każda pozycja z **datą sprawdzenia i źródłem**; czego nie dało
   się potwierdzić, zapisujesz jako `<DO UZUPEŁNIENIA: …>` (L-0026), nie jako domysł. Ten dokument
   jest wejściem do E5 i E7 — bez niego adaptery powstają na założeniach.
2. **Wydzielenie rdzenia w repozytorium** — układ katalogów, w którym widać granicę: co jest
   wspólne (specyfikacje, opisy procesu, skrypty guardrails), a co należy do adaptera Claude Code
   (manifesty, `hooks.json`, pliki komend, skille). Przeniesienie **bez zmiany treści**
   specyfikacji: to ma być przesunięcie, nie przepisanie. Ścieżki, które zmieniły się dla hooka
   `session-context` (provisioning `templates/` do `.claude/relai/templates/`), poprawiasz razem
   z przeniesieniem — inaczej łamiesz R8.
3. **Guardrails jako czyste skrypty** — logika skanu sekretów wychodzi z `hooks/secret-scanner.js`
   do skryptu rdzenia przyjmującego ścieżkę/treść i zwracającego werdykt, bez wiedzy o protokole
   hooków. Hook zostaje **cienką warstwą** tłumaczącą werdykt na `permissionDecision`. Zero
   zależności npm (D-41 i konwencja repo). To samo rozważ dla `config-protection` — jeśli logika
   nie daje się rozdzielić bez straty gwarancji, zapisz to wprost zamiast wymuszać podział.
4. **Git pre-commit ze skanem sekretów** — skrypt instalowany do `.git/hooks/pre-commit`
   (albo `core.hooksPath`) wywołujący skrypt rdzenia na plikach z indeksu. Blokuje commit
   z sekretem **niezależnie od narzędzia**. Instalacja musi być jawną czynnością człowieka i musi
   dać się cofnąć jednym poleceniem; brak Node.js → jedno zdanie w instrukcji, bez cichej
   degradacji (sekcja 8 planu).
5. **Walidator spójności rdzeń↔adaptery** — skrypt sprawdzający, że adapter nie odwołuje się do
   pliku rdzenia, którego nie ma, i że wersje po obu stronach są zgodne. Uruchamiany ręcznie;
   wynik czytelny dla człowieka. W tym etapie adapterem jest wyłącznie Claude Code.
6. **`README.md`** — sekcja o strukturze repozytorium opisuje układ z rdzeniem oraz instalację
   pre-commita (po polsku, warstwa dla człowieka).
7. **`templates/SPEC_KOMENDY.md` i `docs/KOMENDY.md`** — pre-commit jako zachowanie automatyczne
   opisane **efektem**, tylko jeśli w tej wersji realnie działa (L-0002). Tabela komend nie rośnie.
8. **`commands/relai-update.md`** — wiersze stanu docelowego 1.4.0 dla projektów aktualizowanych.
9. **Wersja 1.4.0** w miejscach z sekcji „Decyzje już podjęte"; `git grep -n "1\.3\.0"`
   i rozstrzygnięcie każdego trafienia (L-0008).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate` → „Validation passed"; jedyne ostrzeżenie to znane root
      `CLAUDE.md` (L-0003).
- [ ] Numer 1.4.0 spójny we wszystkich miejscach z punktu 9; `git grep -n "1\.3\.0"` zwraca
      wyłącznie trafienia historyczne.
- [ ] **Plugin działa po przeniesieniu:** wszystkie dziesięć hooków uruchomione realnym procesem
      z payloadem JSON (L-0017) po zmianie układu katalogów — każdy zachowuje zachowanie sprzed
      etapu; `secret-scanner` **blokuje** zapis sekretu (dowód: `permissionDecision` = deny),
      a `journal-signature` i `session-context` przechodzą swoje zestawy z E3 (9/9 i 15/15).
- [ ] **Specyfikacje przeniesione bajt w bajt:** suma kontrolna każdego `SPEC_*.md` przed i po
      przeniesieniu jest identyczna (po normalizacji do LF, L-0033).
- [ ] **Skrypt skanu działa poza hookiem:** wywołany bezpośrednio na pliku z testowym sekretem
      zwraca werdykt „sekret", a na pliku czystym — „brak"; oba przebiegi bez ładowania czegokolwiek
      z protokołu hooków.
- [ ] **Pre-commit blokuje naprawdę:** w repozytorium testowym poza tym repo `git commit` z plikiem
      zawierającym klucz kończy się **niezerowym kodem wyjścia** i brakiem nowego commita (dowód
      negatywny: `git rev-parse HEAD` przed i po jest identyczne). Ten sam commit po usunięciu
      sekretu przechodzi.
- [ ] **Walidator wykrywa rozjazd:** celowo zepsute odwołanie adaptera do nieistniejącego pliku
      rdzenia zgłasza błąd; układ spójny → cisza (dowód negatywny).
- [ ] `docs/PRZENOSNOSC.md` istnieje, każda pozycja ma datę sprawdzenia i źródło, a rzeczy
      niepotwierdzone są oznaczone `<DO UZUPEŁNIENIA: …>` — zero zdań o Cursorze i Codeksie
      napisanych z pamięci modelu.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" (komplet czterech sekcji, podpis z członem
      użytkownika), `docs/STATE.md` nadpisany; foldery testowe poza repozytorium
      (`git status --short` bez śmieci).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_5.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcję „Bramki
   manualne" odśwież pozycjami „Do zrobienia przez człowieka" z wpisu tego etapu; sekcji „Odnogi"
   **nie ruszasz** — chyba że w trakcie etapu któraś została domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (<model>) + <git config>`.
   Przejrzyj tabelę ryzyk — **P1** (adaptery nie egzekwują blokad harnessu) dotyka tego etapu
   wprost: pre-commit jest jego pierwszą mitygacją, więc rozstrzygnij, czy poziom spada. Lekcje
   z etapu → `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje o stanie pluginu (wersja 1.4.0, rdzeń, pre-commit) i liczby.
4. **Wygeneruj `PROMPT_ETAP_5.md`** (adapter Cursor) ze specyfikacji promptu etapowego: na bazie
   sekcji 5 i 6 (E5) planu, `docs/PRZENOSNOSC.md`, realnego stanu repo po tym etapie i lekcji
   z tego etapu.
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi sekwencję:
   push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → restart
   aplikacji (L-0031).
