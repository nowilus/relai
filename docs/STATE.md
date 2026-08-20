# STATE — RelAI

Stan na: 2026-08-20

## Gdzie jesteśmy

RelAI jest wydany (1.5.1) i ma **dwa wyjścia**: Claude Code oraz Cursor — te same dokumenty i ten
sam proces w dwóch narzędziach. Plan budowy zamknięty, cztery scenariusze akceptacyjne zdane,
pilotaż Cursora przeszedł na modelu spoza Anthropic. Repozytorium pracuje na 1.5.2 i jest w środku
planu **OPTYMALIZACJA_KONTEKSTU**: warstwa czytana przy starcie sesji dostaje mierzony budżet, żeby
wielomiesięczny projekt nie dusił się własną pamięcią.

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

- **Plan [OPTYMALIZACJA_KONTEKSTU](plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md) — 3 z 5 etapów
  zamknięte** (E1 miara i budżet, E2 rozbrojenie rotacji, E3 kształt STATE i CLAUDE). Po co: start
  sesji w JiraManagerze kosztuje 386 KB dokumentów (≈120 tys. tokenów), bo rotacja nigdy nie ruszyła,
  a limity ze specyfikacji nie były przez nikogo mierzone. Zostają E4 (ryzyka, ustawienia, status
  planu; po nim wydanie 1.6.0) i E5 (migracja JiraManagera i PolyFlow, zamknięcie ryzyka R5).
- **Plan [ROZWOJ_PO_WYDANIU](plany/ROZWOJ_PO_WYDANIU/STATUS.md) — 6 z 8 etapów zamknięte, E7
  wstrzymany.** Po co stoi: konto Codeksa jest w planie darmowym i nie ma kto przeprowadzić
  pilotażu adaptera. Zaplanowany numer wydania E7 (1.6.0) zostaje w dokumentach bez aneksu — kolizja
  nie grozi, dopóki etap stoi. Formalne zamrożenie planu czeka na decyzję człowieka.

## Co dalej

- Świeża sesja Opus i `/relai-stage` — **E4**: komórka „Mitygacja" jako stan bieżący plus odsyłacz,
  `docs/archiwum/ryzyka/`, wiersz ustawień jako jedna decyzja, jedna linia na etap w `SPEC_STATUS`,
  podbicie wersji do 1.6.0.
- Sekwencja wydania 1.6.0 (push → `plugin marketplace update` → `plugin update` → **restart**), potem
  E5: przepuścić JiraManagera i PolyFlow przez `/relai-update` i zmierzyć start przed i po.
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
- **Poprawki 1.5.1 i 1.5.2 nie działają nigdzie poza tym repozytorium** do czasu sekwencji wydania;
  projekty z gitowym pre-commitem wymagają dodatkowo ponownej instalacji hooka.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.5.2**. Zainstalowany globalnie (scope `user`) pozostaje **1.1.0** do czasu push →
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

Etapy: BUDOWA_RELAI 10/10 • ROZWOJ_PO_WYDANIU 6/8 (E7 wstrzymany) • OPTYMALIZACJA_KONTEKSTU 3/5 •
Warstwa startowa RelAI: **55,3 KB / 80 KB** (`CLAUDE` 3,1 KB, `STATE` 9,8 KB, ryzyka 28,4 KB,
zasady 5,0 KB) • Dziennik: 147,8 KB, lekcje 41,6 KB — oba pod progiem rotacji • Sprawy czekające
na człowieka: 10 • Zasady aktywne: **15 przy limicie 15** •
Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora • Adaptery: 2 • Modele, na których zmierzono
proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) • Otwarte odnogi: 4 • Otwarte bramki
manualne: 9 (5 + 4 w dwóch planach) • Otwarte ryzyka: 4 • Zamknięte ryzyka: 6 • Progi rotacji: dziennik 150 KB, lekcje
40 wpisów albo 50 KB, STATE 300 linii • Archiwum: lekcje L-0001…L-0024, dziennik 2026-08-07…
2026-08-09 (16 wpisów) oraz 2026-08-10 (2 wpisy — **pierwsza rotacja po rozbrojeniu blokady**,
2026-08-20)
