# STATUS — plan OPTYMALIZATOR_PROMPTOW

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-14 · Status planu: **ZAAKCEPTOWANY 2026-09-14** (zamrożony, D-33) · Model wykonawczy etapów: **Opus** (preferencja z USTAWIENIA.md, D-85; ustalony w Claude Code)

Cel: dołożyć do RelAI warstwę, która zamienia podyktowane zdanie w precyzyjny prompt — komendą na
żądanie i trybem ciągłym włączanym jawnie, zawsze z pokazaną różnicą przed wykonaniem, zawsze na
modelu wskazanym w ustawieniach projektu. Budżet: **5–6 sesji** — o jedną ponad uzgodnienie
z pierwszej rundy wywiadu (4–5), świadomie, po dołożeniu etapu pomiaru modeli w rundzie czwartej
(FAKT — wywiad 2026-09-14). Zakres warstwy to **prompty użytkownika do agenta w sesji**; prompty
etapowe, narzędzia zewnętrzne i brief nowego projektu są nie-celami.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Baza reguł i komenda | **ZREALIZOWANY 2026-09-14** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | Port merytoryki `nidhinjs/prompt-master` (MIT) do `core/prompt/`, komenda w adapterze Claude Code, **nota licencyjna w tym samym commicie** co pierwszy portowany plik. Działa na modelu sesji — wybór modelu rozstrzyga E2 |
| E2 | Pomiar modeli | **ZREALIZOWANY 2026-09-14** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | Ten sam zestaw surowych zdań przez Haiku 4.5, Sonneta 5 i Opusa 5; instrument liczy **pokrycie dziewięciu wymiarów i koszt jednego przerobienia**, osobno z blokiem kontekstu i bez niego (cena utraconego cache'u). Wynik ustala rekomendację w wierszu `Model optymalizatora` |
| E3 | Pamięć projektu i język | **ZREALIZOWANY 2026-09-14** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | Wybiórczy blok kontekstu z decyzji, zasad i stanu; pytanie o język raz na projekt; komenda w adapterach Cursor i Codex |
| E4 | Tryb ciągły | **GOTOWY DO STARTU** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | **Pierwszy krok etapu to pomiar ryzyka O1** — czy hook `UserPromptSubmit` w ogóle niesie tę funkcję; ścieżka odwrotu zapisana w planie |
| E5 | Wydanie | OCZEKUJE | — | Testy regresyjne, `validate-adapters.js`, `claude plugin validate`, pełna sekwencja P-005; czternasta komenda publicznie |

## Bramki manualne

- ~~**Akceptacja planu**~~ · źródło: wpis dziennika 2026-09-14 · ROZSTRZYGNIĘTA 2026-09-14 — Łukasz zaakceptował plan bez uwag; plan zamrożony, `PROMPT_ETAP_1.md` wygenerowany, E1 gotowy do startu
- ~~**Nazwa komendy**~~ · źródło: wpis dziennika 2026-09-14 · ROZSTRZYGNIĘTA 2026-09-14 — `/relai-prompt`, zgodnie z konwencją rodziny komend; `PROMPT_ETAP_1.md` był już na tę nazwę napisany, więc nie wymagał poprawki
- ~~**Który model zostaje domyślny, jeśli pomiar E2 wyjdzie nierozstrzygający**~~ · źródło: wpis
  dziennika 2026-09-14 · ROZSTRZYGNIĘTA 2026-09-14 — pomiar wyszedł **rozstrzygający**: Haiku 4.5
  dał propozycję w 3 z 20 przebiegów i w 12 z 20 odpowiedział po angielsku, Sonnet 5 w 14 z 20
  bez rozjazdu językowego. Właściciel wskazał **Sonnet 5**; wiersz `Model optymalizatora`
  w `docs/USTAWIENIA.md` zapisany
- **Co z zainstalowanym `ecc:prompt-optimizer`** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Czy tryb ciągły ma licznik kosztu** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan** · źródło: wpis dziennika 2026-09-14 ·
  **OTWARTA ŚWIADOMIE do E4** — decyzja właściciela 2026-09-14 w E3: pierwszym krokiem E4 jest pomiar
  ryzyka O1 (czy hook `UserPromptSubmit` w ogóle niesie tę funkcję), a bez tej liczby rozstrzygnięcie
  o dwóch pozostałych adapterach byłoby zgadywaniem. **Sama delegacja w Codeksie jest w E3
  rozstrzygnięta** i bramki nie dotyczy: praca bez delegacji z rdzenia reguł, bez osobnego agenta
- **Kiedy wraca plan PIERWSI_UZYTKOWNICY** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- ~~**Gdzie wchodzi prowizjonowanie `core/prompt/` do projektu użytkownika**~~ · źródło: wpis
  dziennika 2026-09-14 (E1) · ROZSTRZYGNIĘTA 2026-09-14 — **E5, razem z sekwencją wydania**:
  kopia `core/prompt/` trafia do projektu tą samą drogą co specyfikacje (`provisionTemplates()`
  w `core/process/session-signals.js`), a komenda przestaje zależeć od ścieżki awaryjnej dopiero
  w wydanej wersji. **Do E5 dochodzi punkt zakresu, którego plan nie przewidział** — propozycja
  aneksu w tej samej turze

## Dziennik wdrożenia

- 2026-09-14 — plan utworzony po trzech rundach wywiadu, przekazany do akceptacji. Plan
  PIERWSI_UZYTKOWNICY przechodzi w stan WSTRZYMANY na wniosek właściciela.
- 2026-09-14 — **plan rozszerzony przed akceptacją o wątek kosztu modelu** (czwarta runda wywiadu):
  nowy etap E2 mierzy modele, dochodzi wiersz `Model optymalizatora` w ustawieniach i trzy ryzyka
  (O9–O11). Pięć etapów zamiast czterech, budżet 5–6 sesji zamiast 4–5.
- 2026-09-14 — **plan ZAAKCEPTOWANY i zamrożony** (D-33). Wygenerowano `PROMPT_ETAP_1.md`;
  E1 → GOTOWY DO STARTU. Ryzyka O1, O4, O6 i O9 weszły do tabeli ryzyk dziennika.
- 2026-09-14 — **E1 ZREALIZOWANY**: `core/prompt/REGULY.md` i `core/prompt/SZABLONY.md`, czternasta
  komenda `/relai-prompt`, nota MIT źródła w `LICENSE`, pozycja `prompt` w `core/MANIFEST.json`,
  trzy wpisy w rejestrze artefaktów i wiersz w `KOMENDY.md`. Jedenaście punktów weryfikacji zdanych,
  każdy z kontrolą pozytywną. Odstępstwo rozstrzygnięte przez człowieka: licznik komend
  w generatorze skilli Codeksa podniesiony do 14 w tym etapie, choć adaptery należą do E3.
  E2 → GOTOWY DO STARTU.
- 2026-09-14 — **E2 ZREALIZOWANY**: agent `relai-prompt-optimizer` (bez pola `model`), `Krok 1`
  komendy z delegacją i czterema ścieżkami awaryjnymi (b11–b14), wiersz `Model optymalizatora` =
  **Sonnet 5**, rejestr artefaktów na 50 pozycjach. Pomiar: 56 wywołań `claude -p`, 17,80 USD —
  Haiku 3 propozycje z 20 i 12 odpowiedzi po angielsku, Sonnet 14 z 20, Opus 11 z 13 (zmierzony na
  7 i 6 zdaniach — decyzja właściciela o koszcie). **O9 i O10 zamknięte.** Instrument: 28 punktów
  kontroli, 0 niezaliczonych; dwa własne defekty wykryte i naprawione w trakcie. Odstępstwo:
  regeneracja skilla Codeksa (adaptery należą do E3) — zgoda człowieka, walidator na kodzie 0.
  E3 → GOTOWY DO STARTU.
- 2026-09-14 — E3 rozpoczęty.
- 2026-09-14 — **E3 ZREALIZOWANY**: `Krok 6` (blok kontekstu z trzech źródeł, limit 1 300 znaków
  i sześciu pozycji skalibrowany na 123 pozycjach pamięci) i `Krok 9` (język rozstrzyga wejście,
  wiersz `Język promptu` = **język wejścia**) w komendzie, sekcja bloku w `SZABLONY.md` z realnym
  przykładem, sekcja „Project context block" u agenta, delegacja w Codeksie rozstrzygnięta bez
  osobnego agenta. Trzynaście punktów weryfikacji zdanych, każdy z kontrolą; blok zmienił wynik
  (`E5` bez bloku = licencja pakietu biurowego, z blokiem = etap wydania), 4–6 pozycji ze 123, zero
  wspólnych identyfikatorów między trzema zadaniami. Pomiar zatrzymany o 15:22 limitem konta,
  wznowiony po 16:00. E4 → GOTOWY DO STARTU.

RelAI (Opus 5) + Lukasz
