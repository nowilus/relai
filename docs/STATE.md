# STATE — RelAI

Stan na: 2026-08-12

## Gdzie jesteśmy

RelAI jest gotowy i wydany w wersji **1.5.0**. Plan budowy — dziesięć etapów — został zamknięty, a
pilotaż na dwóch realnych projektach przeszedł wszystkie cztery scenariusze akceptacyjne: nowy
projekt prowadzony od zera, przekazanie projektu innej osobie, kopia zapasowa z odtworzeniem oraz
przeniesienie żywego, istniejącego projektu na strukturę RelAI. Od 1.5.0 RelAI ma **drugie
wyjście**: adapter Cursora — te same dokumenty i ten sam proces w drugim narzędziu, złożone
z mechanizmów zmierzonych na działającej instalacji, nie założonych. Teraz zaczyna się faza,
w której narzędzie dostają inne osoby i zgłaszają, co im przeszkadza.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie — bez uczenia się
  jakiejkolwiek składni.
- Istniejący projekt można przenieść na tę strukturę bez ryzyka: najpierw kopia zapasowa, potem
  zmiany, a na końcu raport z opisaną drogą pełnego powrotu do stanu sprzed.
- Ustalenia, decyzje i korekty użytkownika zapisują się w trakcie pracy, a nie „na koniec".
- Nowa sesja zaczyna od przeczytania stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami; dla odbiorcy nietechnicznego —
  jako jeden plik HTML do otwarcia dwuklikiem, działający bez internetu.
- Dziesięć skrótów operacyjnych: etap planu, odnoga planu, kopia zapasowa, przegląd, lista zmian,
  pakiet przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja.
- Boczny wątek z etapu ma gdzie zamieszkać: RelAI zatrzymuje się i pyta (odnoga / aneks / świadomie
  odłożone), a odnoga dostaje kartę i gotowy prompt świeżej sesji — bez ruszania zamrożonego planu.
- Dokumenty nie puchną bez końca: przy zamykaniu sesji najstarsza historia sama przenosi się do
  archiwum — w całości, bez skracania — a w żywym pliku zostaje linia z linkiem. Wpis czekający na
  decyzję człowieka zostaje na miejscu. Poniżej progu nic się nie dzieje i nie pada ani jedno słowo.
- Trzy dokumenty mówiące o tym samym — status etapu, wskazanie aktywnego planu i opis stanu — nie
  rozjeżdżają się po cichu: gdy przestają się zgadzać, sesja mówi o tym na starcie jednym zdaniem
  i pyta, który zapis jest prawdziwy.
- Rzeczy czekające na człowieka (dostęp, zakup, decyzja) wychodzą z dziennika do statusu planu, a
  plan nie zamyka się, dopóki nie padnie pytanie o każdą z nich.
- Wpis w dzienniku jest podpisany modelem i użytkownikiem; brakujący człon zostaje wyłapany zaraz
  po zapisie.
- W projekcie po adopcji nowe rozstrzygnięcia idą do rejestru decyzji, a zastane reguły zostają
  zapisem stanu sprzed adopcji — reguły projektu przestają puchnąć.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia.
- Skan sekretów da się włączyć **poza Claude**: gitowy pre-commit zatrzymuje commit z kluczem albo
  hasłem niezależnie od tego, kto commituje i z jakiego narzędzia. Instaluje się i cofa jednym
  poleceniem; bez Node.js mówi o tym wprost, zamiast po cichu przepuścić.
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń (specyfikacje, guardrails, rozpoznania
  startu sesji, narzędzia), a `adapters/claude-code/` i `adapters/cursor/` to dwa wyjścia.
  Walidator wykrywa, gdy adapter odjedzie od rdzenia — także po odwołaniach w kodzie.
- **RelAI działa w Cursorze.** Jedno polecenie kładzie w projekcie trzy reguły zawsze-w-kontekście,
  dziesięć komend `/relai-*`, dwa skille, specyfikacje dokumentów i dwa hooki. Zmierzone na żywej
  sesji: reguła obowiązuje bez wyzwalania, kontekst startu dociera do modelu, zapis sekretu jest
  zablokowany, a zapis czysty przechodzi bez słowa.
- Brak Node.js nie usuwa guardraila po cichu: opakowanie powłoki zamienia „cisza i zapis przechodzi"
  na „blokada z komunikatem". Rezygnacja z guardraila jest jawną decyzją człowieka (`--bez-skanu`).
- Oba narzędzia czytają i piszą te same `docs/` — praca naprzemienna nie wymaga migracji.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- Plan **ROZWOJ_PO_WYDANIU** (8 etapów) — **ZAAKCEPTOWANY 2026-08-12** (Aneks A). Zamknięte:
  **E1** (1.1.0 — odnogi planu), **E2** (1.2.0 — rotacja dokumentów), **E3** (1.3.0 — poprawki
  z retrospektywy), **E4** (1.4.0 — rdzeń przenośny, guardrails jako skrypty, pre-commit,
  walidator), **E5** (1.5.0 — adapter Cursora). **E6 gotowy do startu:** pilotaż Cursora w firmie
  — scenariusz akceptacyjny na realnym projekcie osoby z zespołu.
- **`docs/PRZENOSNOSC.md`** trzyma rozpoznanie obu narzędzi. Sekcja Cursora jest od E5 **zmierzona**
  (build produktu + realne sesje agenta), sekcja Codexa nadal z dokumentacji — jej próba należy do
  E7. Tabela gwarancji mówi wprost, co w Cursorze działa tak samo, co inaczej i czego nie ma:
  nie ma egzekwowanego „zapytaj człowieka" przy zapisie pliku ani odpowiednika `AskUserQuestion`.
- Dwie **odnogi OTWARTE**: `OPIS_REPO` (opis repozytorium na GitHubie) i `POMIAR_ODNOG` (pomiar
  świeżą sesją — niedomknięte punkty weryfikacji E1, E2 i E3, dziewięć scenariuszy). Każda ma
  gotowy prompt; nie blokują planu.
- Pięć **bramek manualnych** planu czeka na człowieka: sekwencja wydania (push → aktualizacja
  pluginu → restart), `claude /login` na konto z limitem, decyzja o `/relai-update` dla
  JiraManagera i PolyFlow, decyzja o instalacji pre-commita oraz — nowa po E5 — osoba z zespołu
  do pilotażu Cursora. Widać je w `STATUS.md` planu.

## Co dalej

- Świeża sesja Opus i `/relai-stage` — etap E6 (pilotaż Cursora w firmie): realny projekt
  prowadzony w Cursorze przez osobę spoza tego projektu, z próbą zapisu sekretu i przejściem
  komend na żywym materiale.
- Zainstalować pre-commit tam, gdzie ma pilnować: `node core/guardrails/install-precommit.js
  <projekt>`. Hook jest zmierzony, ale nikt go za człowieka nie podłoży.
- Dwie odnogi do wykonania w świeżych sesjach, w dowolnej kolejności wobec etapów.
- Przepuścić JiraManagera i PolyFlow przez `/relai-update` — ich dzienniki (348 KB i 223 KB)
  czekają na pierwszą rotację na żywym projekcie.
- Zebranie pierwszego feedbacku od osób spoza projektu i zamiana go na poprawki — to jest sens
  etapu E6; potrzebna jest osoba z zespołu, która poprowadzi swój projekt w Cursorze.

## Co blokuje

- **Pomiar zachowań w świeżej sesji** — CLI `claude -p` uwierzytelnia się z własnego pliku
  poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Odblokowuje to `claude /login`
  po stronie człowieka; do tego czasu odnoga `POMIAR_ODNOG` stoi. Scenariusze rotacji wymagają
  dodatkowo restartu aplikacji po aktualizacji pluginu do co najmniej 1.2.0, a scenariusze
  poprawek z E3 — do 1.3.0 (L-0031).
- **Nowy układ katalogów pluginu czeka na potwierdzenie w aplikacji.** Manifest wskazuje skille
  i komendy pod `adapters/claude-code/`, walidator to akceptuje i mówi, że runtime czyta te same
  ścieżki — ale realne wczytanie potwierdzi dopiero pierwsza sesja po push, aktualizacji pluginu
  i **restarcie** (L-0031).
- Repozytorium jest **publiczne** (zweryfikowane 2026-08-12), ale ma pusty opis — odnoga
  `OPIS_REPO`.
- **Adapter Cursora zmierzony wyłącznie przez CLI.** Wszystkie próby E5 przeszły przez
  `cursor-agent -p`; zachowania aplikacji z interfejsem (w tym `beforeReadFile` i dostęp poza
  katalogiem roboczym) potwierdzi dopiero pilotaż E6.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: 1.5.0. Zainstalowany globalnie (scope `user`) pozostaje **1.1.0**
(`gitCommitSha e6b41dc`) do czasu push → `plugin update` → **restartu aplikacji** (L-0031). Źródło:
własny marketplace w tym samym repozytorium.

### Zawartość pluginu

**Rdzeń** (`core/`): dwadzieścia specyfikacji dokumentów + szablon planu HTML z osadzonymi fontami
• trzy skrypty guardraili (skan sekretów jako biblioteka i CLI, pre-commit, instalator) •
rozpoznania startu sesji (`process/session-signals.js`, wołane przez oba adaptery) • walidator
spójności • `MANIFEST.json`.

**Adapter Claude Code** (`adapters/claude-code/`): dwa skille (`relai-core`, `relai-planning`) •
dziesięć komend • **dziesięć** hooków Node.js bez zależności npm. Manifest i marketplace zostają
w `.claude-plugin/` w korzeniu — tego wymaga Claude Code.

**Adapter Cursor** (`adapters/cursor/`): trzy reguły `.mdc` z `alwaysApply: true` • dwa hooki
(`sessionStart`, `preToolUse`) z opakowaniem powłoki dla guardraila • instalator z deinstalacją
i flagą `--bez-skanu`. Komendy i skille nie są pisane drugi raz — instalator kopiuje je z adaptera
Claude Code.

### Wymagania

Claude Code **albo Cursor** • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (publiczne od 2026-08-12) • Plan budowy:
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI`

### Liczby

Etapy planu budowy: 10/10 zamknięte • Etapy planu ROZWOJ_PO_WYDANIU: 5/8 zamknięte • Scenariusze
akceptacyjne: 4/4 zdane • Adaptery: 2 • Otwarte odnogi: 2 • Otwarte bramki manualne: 5 • Otwarte
ryzyka: 4 (zależność jakości od modelu, rozrost dokumentów, dwa ryzyka portu — oba obniżone do
średniego, P1 po E4, P2 po E5) • Zamknięte ryzyka: 6 • Progi rotacji: dziennik 150 KB, lekcje
40 wpisów albo 50 KB, STATE 300 linii • Archiwum: lekcje L-0001…L-0024 (rotacja 2026-08-12)
