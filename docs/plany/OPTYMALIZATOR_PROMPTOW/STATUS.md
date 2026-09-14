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
| E2 | Pomiar modeli | **GOTOWY DO STARTU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | Ten sam zestaw surowych zdań przez Haiku 4.5, Sonneta 5 i Opusa 5; instrument liczy **pokrycie dziewięciu wymiarów i koszt jednego przerobienia**, osobno z blokiem kontekstu i bez niego (cena utraconego cache'u). Wynik ustala rekomendację w wierszu `Model optymalizatora` |
| E3 | Pamięć projektu i język | OCZEKUJE | — | Wybiórczy blok kontekstu z decyzji, zasad i stanu; pytanie o język raz na projekt; komenda w adapterach Cursor i Codex |
| E4 | Tryb ciągły | OCZEKUJE | — | **Pierwszy krok etapu to pomiar ryzyka O1** — czy hook `UserPromptSubmit` w ogóle niesie tę funkcję; ścieżka odwrotu zapisana w planie |
| E5 | Wydanie | OCZEKUJE | — | Testy regresyjne, `validate-adapters.js`, `claude plugin validate`, pełna sekwencja P-005; czternasta komenda publicznie |

## Bramki manualne

- ~~**Akceptacja planu**~~ · źródło: wpis dziennika 2026-09-14 · ROZSTRZYGNIĘTA 2026-09-14 — Łukasz zaakceptował plan bez uwag; plan zamrożony, `PROMPT_ETAP_1.md` wygenerowany, E1 gotowy do startu
- ~~**Nazwa komendy**~~ · źródło: wpis dziennika 2026-09-14 · ROZSTRZYGNIĘTA 2026-09-14 — `/relai-prompt`, zgodnie z konwencją rodziny komend; `PROMPT_ETAP_1.md` był już na tę nazwę napisany, więc nie wymagał poprawki
- **Który model zostaje domyślny, jeśli pomiar E2 wyjdzie nierozstrzygający** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Co z zainstalowanym `ecc:prompt-optimizer`** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Czy tryb ciągły ma licznik kosztu** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Kiedy wraca plan PIERWSI_UZYTKOWNICY** · źródło: wpis dziennika 2026-09-14 · **OTWARTA**
- **Gdzie wchodzi prowizjonowanie `core/prompt/` do projektu użytkownika — E3 czy E5** · źródło:
  wpis dziennika 2026-09-14 (E1) · **OTWARTA**

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

RelAI (Opus 5) + Lukasz
