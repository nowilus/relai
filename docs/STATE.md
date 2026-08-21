# STATE — RelAI

Stan na: 2026-08-21

## Gdzie jesteśmy

RelAI jest wydany (1.5.1) i ma **dwa wyjścia**: Claude Code oraz Cursor — te same dokumenty i ten
sam proces w dwóch narzędziach. Plan budowy zamknięty, cztery scenariusze akceptacyjne zdane,
pilotaż Cursora przeszedł na modelu spoza Anthropic. Repozytorium pracuje na **1.6.0** i kończy
plan **OPTYMALIZACJA_KONTEKSTU**: warstwa czytana przy starcie sesji dostała mierzony budżet i zeszła
tutaj z 90 KB do 39 KB. Został ostatni etap — przeniesienie tego na dwa żywe projekty.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie — bez uczenia się
  jakiejkolwiek składni. Istniejący projekt przechodzi na tę strukturę przez adopcję: najpierw
  kopia zapasowa, potem zmiany, na końcu raport z przetestowaną drogą pełnego powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od przeczytania
  stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami; dla odbiorcy nietechnicznego — jako
  jeden plik HTML działający bez internetu. Boczny wątek z etapu ma gdzie zamieszkać: odnoga
  dostaje kartę i gotowy prompt świeżej sesji, bez ruszania zamrożonego planu.
- Dziesięć skrótów operacyjnych: etap planu, odnoga, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja.
- **Dokumenty nie puchną bez końca — zmierzone na tym repozytorium 2026-08-20.** Najstarsza historia
  sama przenosi się do archiwum, bajt w bajt, a w żywym pliku zostaje linia z linkiem; poniżej progu
  nie pada ani jedno słowo. Rotacja ma dwa wejścia: zamknięcie i start sesji. Pierwsza rotacja po
  rozbrojeniu blokady przeniosła dwa wpisy (153,9 → 143,5 KB) i **zatrzymała się tam, gdzie
  powinna** — na wpisie linkowanym z otwartej sprawy człowieka. Destylat lekcji skompresowany
  z 48 pozycji do 15 przy zachowaniu wszystkich numerów źródłowych.
- **Sprawy czekające na człowieka mają jeden adres** — sekcję „Czeka na człowieka" na górze
  dziennika, czytaną przy każdym starcie. Wpis, którego pozycja się wyprowadziła, przestaje blokować
  rotację; to był powód, dla którego rotacja nigdy nie ruszyła w JiraManagerze ani w PolyFlow.
- **Koszt startu sesji jest liczony, a nie szacowany.** Hook mierzy sześć pozycji rytuału startu
  i porównuje sumę z budżetem 80 KB. Powyżej budżetu: najwyżej sześć linii z sumą, trzema
  najgrubszymi pozycjami i propozycją odchudzenia. Poniżej: ani jednego znaku. Oba adaptery wołają
  tę samą funkcję rdzenia.
- **`STATE.md` i `CLAUDE.md` mają twardy kształt** (1.6.0): trzy pozycje w „Nad czym pracujemy
  teraz" z podmianą zamiast dopisywania, próg zwięzłości jako liczba sprawdzalna komendą, budżet
  `CLAUDE.md` w KB i zakaz treści odtwarzalnej z repozytorium. Pułapki narzędziowe mają własny
  dokument [PULAPKI.md](PULAPKI.md), czytany **na żądanie** — poza warstwą startową.
- **Rejestry mówią, jak jest dziś, a nie jak do tego doszło.** Komórka „Mitygacja" trzyma stan
  bieżący i odsyłacze do wpisów, które go zmierzyły, z limitem 800 znaków sprawdzalnym komendą;
  ryzyka zamknięte schodzą do `docs/archiwum/ryzyka/` tą samą procedurą dwufazową co dziennik,
  a ich numery zostają widoczne w żywej tabeli, żeby żaden nie wrócił. Wiersz ustawień to jedna
  decyzja, dziennik wdrożenia planu — jedna linia na etap. Zmierzone na tym repozytorium:
  sekcja ryzyk **21,4 → 3,7 KB**.
- **Pomiar startu działa też na repozytorium sklonowanym na Windowsie.** Wzorzec szukający sekcji
  nie trafiał przy końcach linii CRLF i po cichu mierzył całe pliki — na kopii tego repozytorium
  dawało to 213,8 KB zamiast 55,7 KB. Naprawione i sprawdzone na obu wariantach końca linii.
- Trzy dokumenty mówiące o tym samym — status etapu, linia aktywnego planu i opis stanu — nie
  rozjeżdżają się po cichu: sesja mówi o rozjeździe na starcie i pyta, który zapis jest prawdziwy.
  Wpis dziennika jest podpisany modelem i użytkownikiem; brakujący człon zostaje wyłapany.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia. Skan
  sekretów działa **poza Claude**: gitowy pre-commit zatrzymuje commit z kluczem niezależnie od
  narzędzia; bez Node.js mówi o tym wprost, zamiast po cichu przepuścić.
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń, a `adapters/claude-code/`
  i `adapters/cursor/` to dwa wyjścia. Walidator wykrywa, gdy adapter odjedzie od rdzenia.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził Grok 4.6 w aplikacji Cursora,
  z reguł zawsze-w-kontekście, bez przypominania. Oba narzędzia czytają i piszą te same `docs/`,
  więc praca naprzemienna nie wymaga migracji.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Plan [OPTYMALIZACJA_KONTEKSTU](plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md) — 4 z 5 etapów
  zamknięte, wersja 1.6.0 gotowa do wypuszczenia.** Po co: start sesji w JiraManagerze kosztuje
  386 KB dokumentów (≈120 tys. tokenów), bo rotacja nigdy nie ruszyła, a limity ze specyfikacji nie
  były przez nikogo mierzone. Zostaje **E5** — przepuszczenie JiraManagera i PolyFlow przez
  `/relai-update`, pomiar przed i po, zamknięcie ryzyka R5. E5 jest ostatnim etapem planu.
- **Plan [ROZWOJ_PO_WYDANIU](plany/ROZWOJ_PO_WYDANIU/STATUS.md) — 6 z 8 etapów zamknięte, E7
  wstrzymany.** Po co stoi: konto Codeksa jest w planie darmowym i nie ma kto przeprowadzić
  pilotażu adaptera. Zaplanowany numer wydania E7 (1.6.0) zostaje w dokumentach bez aneksu — kolizja
  nie grozi, dopóki etap stoi. Formalne zamrożenie planu czeka na decyzję człowieka.

## Co dalej

- Sekwencja wydania 1.6.0 (push → `plugin marketplace update` → `plugin update` → **restart**) —
  **warunek startu E5**, bo migracja przechodzi właśnie przez tę wersję.
- Świeża sesja Opus i `/relai-stage` — **E5**: backup jako bramka, jeden projekt na sesję,
  `/relai-update` do 1.6.0, pomiar startu przed i po, raport z drogą pełnego powrotu. Po nim
  zamknięcie planu.
- Cztery odnogi w świeżych sesjach, w dowolnej kolejności wobec etapów: `OPIS_REPO` (pusty opis
  repozytorium na GitHubie), `POMIAR_ODNOG` (niedomknięte punkty weryfikacji, dziewięć scenariuszy),
  `REKOMENDACJA_MODELU`, `GUARD_PO_SCIEZCE`. Każda ma gotowy prompt; żadna nie blokuje planu.
- Przejrzeć sekcję **„Czeka na człowieka"** w dzienniku — dziesięć spraw, w tym siedem rozstrzygnięć
  wpisanych w E2 na podstawie faktów z repozytorium, do potwierdzenia.
- Zainstalować pre-commit tam, gdzie ma pilnować: `node core/guardrails/install-precommit.js
  <projekt>`. Hook jest zmierzony, ale nikt go za człowieka nie podłoży.
- Po odmrożeniu E7: adapter Codeksa, `AGENTS.md` jako plik główny projektu z adapterem Cursora albo
  Codeksa (D-86, 2026-08-17) wraz z przepięciem instalatora Cursora, ten sam scenariusz akceptacyjny
  co w E6.
- Feedback od osób **spoza projektu** — pilotaż E6 poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka; wraca przy zamknięciu planu.

## Co blokuje

- **Pomiar zachowań w świeżej sesji** — CLI `claude -p` uwierzytelnia się z własnego pliku
  poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Odblokowuje to `claude /login`;
  do tego czasu odnoga `POMIAR_ODNOG` stoi. Scenariusze rotacji wymagają dodatkowo restartu
  aplikacji po aktualizacji pluginu (P-005).
- **Nowy układ katalogów pluginu czeka na potwierdzenie w aplikacji.** Manifest wskazuje skille
  i komendy pod `adapters/claude-code/`, walidator to akceptuje — ale realne wczytanie potwierdzi
  dopiero pierwsza sesja po push, aktualizacji pluginu i **restarcie**.
- **Adapter Cursora zmierzony w aplikacji, ale nie w całości.** Pilotaż potwierdził reguły, hook
  kontekstu, obie warstwy blokady sekretu i pełne przejście `/relai-stage`. Niezmierzone: hook
  `beforeReadFile`, dostęp poza katalogiem roboczym, osiem pozostałych komend.
- **Poprawki 1.5.1–1.6.0 nie działają nigdzie poza tym repozytorium** do czasu sekwencji wydania —
  łącznie z naprawą pomiaru przy końcach linii CRLF, która dotyczy każdego projektu sklonowanego
  na Windowsie. Projekty z gitowym pre-commitem wymagają dodatkowo ponownej instalacji hooka.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.6.0**. Zainstalowany globalnie (scope `user`) pozostaje **1.1.0** do czasu push →
`plugin update` → **restartu aplikacji** (P-005). Źródło: własny marketplace w tym samym
repozytorium.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`, wołane przez oba adaptery) • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, dziesięć komend, dziesięć hooków Node.js bez zależności npm.
Manifest i marketplace zostają w `.claude-plugin/` w korzeniu — tego wymaga Claude Code.

**Adapter Cursor**: trzy reguły `.mdc` z `alwaysApply: true`, dwa hooki z opakowaniem powłoki dla
guardraila, instalator z deinstalacją i flagą `--bez-skanu`. Komendy i skille kopiuje z adaptera
Claude Code.

### Wymagania

Claude Code **albo Cursor** • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (publiczne) • Plan budowy:
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI` • Rozpoznanie narzędzi: [PRZENOSNOSC.md](PRZENOSNOSC.md) •
Pułapki: [PULAPKI.md](PULAPKI.md)

### Liczby

Etapy: BUDOWA_RELAI 10/10 • ROZWOJ_PO_WYDANIU 6/8 (E7 wstrzymany) • OPTYMALIZACJA_KONTEKSTU 4/5 •
Warstwa startowa RelAI: **39,4 KB / 80 KB** (`CLAUDE` 3,1 KB, `STATE` 9,8 KB, ryzyka 14,1 KB —
z czego 7,9 KB to ostatni wpis, sama sekcja ryzyk 3,7 KB; zasady 5,9 KB) • Dziennik: 138,0 KB,
lekcje 47,0 KB — oba pod progiem rotacji • Sprawy czekające na człowieka: 10 • Zasady aktywne:
**15 przy limicie 15** • Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora • Adaptery: 2 •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) • Otwarte
odnogi: 4 • Otwarte bramki manualne: 9 (5 + 4 w dwóch planach) • Otwarte ryzyka: 4 • Zamknięte
ryzyka: 6 (w archiwum) • Progi rotacji: dziennik 150 KB, lekcje 40 wpisów albo 50 KB, STATE 300
linii • Archiwum: lekcje L-0001…L-0024, dziennik 2026-08-07…2026-08-09 (16 wpisów) oraz 2026-08-10
(2 wpisy), ryzyka R1/R3/R4/R6/R7/R8 (2026-08-21)
