# ANALIZA — kontekst startowy sesji w projekcie RelAI

Data: 2026-10-28 · autor: RelAI (Opus 5.5) + Łukasz · status: **analiza, nie plan** — plan
powstaje dopiero po wywiadzie (skill `relai-planning`). Niczego tu nie wdrożono.

Pytanie Łukasza: przy pierwszej wiadomości w projekcie RelAI zajęte jest już ok. 100 tys. tokenów.
Czy to dokumenty RelAI i czy da się na starcie ładować tylko te sekcje, które są potrzebne teraz,
a resztę doczytywać, gdy zadanie się rozszerzy?

Materiał: trzy równoległe rozpoznania z 2026-10-28 — A (pomiar tokenów w transkryptach), B (mapa
mechanizmu RelAI w kodzie), C (aktualna dokumentacja Claude Code, odczyt 2026-10-28) — oraz
obserwacje z tej sesji (`730b6571`).

---

## 1. Wniosek

**Hipoteza „to głównie nasze dokumenty” jest prawdziwa dla końca pierwszej tury, nieprawdziwa dla
samego startu.**

| Chwila | Ile w kontekście | Ile z tego RelAI |
|---|---|---|
| Pierwsze wywołanie API, zanim model coś przeczyta (dziś) | 81,9–87,3 tys. | ≈ 6,3–8,8 tys. (7–10 %) |
| To samo w konfiguracji sprzed 2026-10-27 ~13:00 | 105–115 tys. | ≈ 11,4 tys. (11 %; `CLAUDE.md` miał wtedy 15,5 KB) |
| Linia bazowa bez RelAI (sesja Jarvis, ta sama maszyna) | 73,2 tys. | 0 |
| **Koniec pierwszej tury** (mediana 5 sesji) | **129,5 tys.** (122–174) | w tej sesji ≈ 72 tys. z 174 (41 %) |

Liczba „~100 tys.” pasuje do dwóch rzeczy naraz: do startu w starej konfiguracji i do stanu po
pierwszej turze w obecnej. Który wskaźnik Łukasz odczytuje, rozstrzyga wywiad (pytanie 1).

**Skąd się bierze przyrost w pierwszej turze tej sesji (81,9 → 173,9 tys.):**

| Składnik | Tokeny | Uwagi |
|---|---|---|
| Rytuał startu (STATE, USTAWIENIA, ryzyka, „Czeka”, ostatni wpis, „Zasady aktywne”) | +39,1 tys. | pliki czytane w całości, nie sekcjami |
| Procedura bramki trybu ciągłego (lista modeli, `relai-prompt.md` 30 KB, `SZABLONY.md`, nakładka, zagnieżdżony `claude.md`, DECYZJE pod blok kontekstu) | +26,7 tys. | „model sesji” — bez delegacji do agenta |
| Własne wyjście modelu (myślenie i odpowiedzi) | +25,3 tys. | |
| Praca nad samym zadaniem | +0,9 tys. | |

Największy pojedynczy składnik RelAI: sekcja „Zasady aktywne” w `docs/LEKCJE.md` — 29,97 KB,
≈ 14,3 tys. tokenów. W sesjach etapu dochodzi `PROMPT_ETAP_N.md` (41–44 KB, ≈ 21–23 tys.) i tekst
komendy `/relai-stage` (14,7 KB, ≈ 7,3 tys.).

**Stała warstwa spoza RelAI (≈ 73 tys., każda sesja na tej maszynie):** prompt systemowy 12,3 tys.,
narzędzia wbudowane 10,2 tys., schematy MCP 10,7 tys. (sam Claude_Browser 5,7 tys.), lista skilli
12,7 tys. (stały budżet — wpisy RelAI netto +0,1 tys.), lista 74 agentów 8,4 tys.,
`~/.claude/rules/common` (11 plików) 7,3 tys., instrukcje MCP 3,0 tys., caveman SessionStart ×2
2,8 tys., lista narzędzi odroczonych 1,75 tys., superpowers 1,4 tys., `~/.claude/CLAUDE.md`
1,4 tys., `MEMORY.md` 1,0 tys. To nie jest RelAI — to środowisko Łukasza (pytanie 4).

**Linki nie są problemem.** Nikt nie każe za nimi iść (`SKILL.md:100` „wyłącznie pliki
z tabeli”, `CLAUDE.md:5`). Problemem jest to, że rytuał czyta **całe pliki**, a do akapitu „gdzie
jesteśmy” potrzeba z nich ok. 6 KB: z STATE sekcje „Gdzie jesteśmy” (≈ 1,0 KB), „Nad czym pracujemy
teraz” (0,9), „Co blokuje” (0,4) i pierwszy punkt „Co dalej”, do tego ostatni wpis dziennika
(1,9 KB) i `CLAUDE.md`. Około 50–60 KB jest czytane „na wszelki wypadek”.

---

## 2. Założenia

- Rozmiar kontekstu = `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`
  z `message.usage` w transkrypcie; przyrost w turze = różnica kolejnych wywołań minus wyjście.
- Przeliczniki bajty → tokeny skalibrowane na parach wywołań (nie zgadnięte): tekst polski
  1,93 B/tok, angielski 2,31 B/tok, schematy JSON 3,52 B/tok. Tokeny pojedynczych składników startu
  są wyliczone (±10 %), sumy i przyrosty — zmierzone.
- Do RelAI liczę: `CLAUDE.md` projektu, hooki RelAI, wpisy relai na listach skilli i agentów, rytuał,
  bramkę trybu ciągłego i komendy relai.
- Cache obniża **koszt** stałego prefiksu (odczyt 0,05× dla Opus 5.5), ale **nie** zmniejsza
  zajętości okna ani nie oszczędza uwagi modelu — to dwie różne wielkości (C, P10).

---

## 3. Dowody

### 3.1 Pomiar (A)

- Sesje w obecnej konfiguracji (pierwsze wywołanie → koniec 1. tury): `730b6571` 81 946 → 173 910;
  `23b3dfc2` 87 039 → 128 139; `a9d65f84` 87 322 → 129 512; `7be49f27` 87 327 → 122 268;
  `a14fa0b2` 87 337 → 141 453.
- Stara konfiguracja: `dd164ad9` 106 292 → 146 862; `f64f492d` 107 953 → 140 999; `af197f2e`
  115 082 → 153 734; sondy `77da5f3d` 107 131, `bb4d5be6` 105 382.
- Linia bazowa: Jarvis `73e6b456` 73 195. Różnica zmierzona 8 751 wobec sumy składników 8,85 tys. —
  zgodne.
- Źródło bajtów: wpisy `api-request-shape` i `api-request-blob` w transkryptach Claude Code
  2.1.309 (dokładne bajty każdego składnika żądania).
- Hook RelAI `session-context` trwał w tej sesji 24 546 ms — 24,5 s startu.

### 3.2 Mechanizm (B)

| Element | Kto ładuje | Kiedy | Bajty |
|---|---|---|---|
| `CLAUDE.md` | harness (auto) + polecenie rytuału | każda sesja | 6 446 |
| blok SessionStart RelAI | hook `session-context` | każda sesja, bez filtra `source` (`session-context.js:95-102`) | ≈ 4 000 |
| `docs/STATE.md` (cały) | model, rytuał | start | 18 501 |
| DZIENNIK: ryzyka 17 958 + „Czeka” 5 804 + ostatni wpis 1 879 | model, rytuał | start | 25 770 |
| LEKCJE „Zasady aktywne” | model, rytuał | start | 29 969 |
| `docs/USTAWIENIA.md` (w tym „wycofane” ≈ 1,7 KB) | model, rytuał | start | 6 097 |
| `PANEL_CODEX/STATUS.md` (plan **wstrzymany**) | model + budżet | start | 3 709 |
| `relai-core/SKILL.md` | skill wymuszony zdaniem hooka | pierwszy prompt | 15 109 |
| bramka trybu ciągłego | hook UserPromptSubmit | każda tura merytoryczna | 245 albo 774–1 087 |
| `.claude/relai/prompt/rodziny/claude.md` | harness jako **zagnieżdżony CLAUDE.md** | odczyt pliku z tego katalogu | 6 871 |

- Lista rytuału istnieje w trzech kopiach: `CLAUDE.md:7-14`, `session-context.js:198-202`,
  `SKILL.md:89-102`. Dokumentacja dostawcy: hook powielający treść `CLAUDE.md` dokłada drugą kopię.
- **Usterka parsera aktywnego planu:** linia `CLAUDE.md:39` „Aktywny plan: brak” niesie link do
  STATUS wstrzymanego PANEL_CODEX; parser (`session-signals.js:612-617`) bierze link, więc plan
  wstrzymany liczy się jako aktywny (+3,6 KB w rytuale i w budżecie).
- **Propozycja rotacji dziennika przy 92,7 KB** (próg 150 KB) nie wynika z rozmiaru dziennika,
  tylko z przekroczonej **sumy** budżetu startu (`session-signals.js:1448`, `:1453-1455`;
  `SPEC_ARCHIWUM.md:35-43`, wejście 2). Suma liczy ryzyka, „Czeka” i ostatni wpis
  (`:1293-1306`), a żadne z 20 ryzyk nie jest zamknięte — rotacja nic nie zdejmie, a propozycja
  wraca w każdej sesji.
- **Zagnieżdżony `claude.md`:** kopię nakładki z cache pluginu robi `provisionPrompt`
  (`session-signals.js:232-239`) na każdym starcie i przy każdym wywołaniu skilla. Na systemie
  plików bez rozróżniania wielkości liter (Windows, domyślny APFS w macOS) harness traktuje
  `rodziny/claude.md` jak `CLAUDE.md` katalogu i wstrzykuje go przy każdym odczycie pliku z tego
  katalogu — także przy rodzinie `openai`, gdzie wciąga nakładkę Claude jako „instrukcje
  projektu”. Dotyczy projektów wszystkich użytkowników.
- Zbędna kopia `adapters/claude-code/hooks/.claude/relai/` z 2026-10-27 — pochodzenie
  nieustalone; możliwa przyczyna: `onSkillInvoked` nie sprawdza markera (`session-context.js:279-288`).
- **Co musi zostać w warstwie stałej (zasada 8):** `CLAUDE.md`; linia rytuału hooka i trzy
  drogowskazy (pomiar: 0/7 bez nich, 3/3 z nimi — `session-context.js:203-218`); siatki hooka;
  definicja ukończenia (D-44) i zapis lekcji po korekcie; tabela otwartych ryzyk (D-14).

### 3.3 Zalecenia dostawcy (C, odczyt 2026-10-28)

| # | Zalecenie | Źródło |
|---|---|---|
| Z1 | `CLAUDE.md` poniżej 200 linii; tylko to, czego Claude nie wyczyta z repo; dłuższe pliki „consume more context and reduce adherence” | code.claude.com/docs/en/memory, …/best-practices |
| Z2 | Importy `@` **nie** oszczędzają kontekstu — ładują się razem z plikiem, który je importuje (do 4 przeskoków) | …/memory |
| Z3 | Ładowanie na żądanie u dostawcy: `.claude/rules/*.md` z `paths:` (ładuje się przy dotknięciu pasującego pliku), zagnieżdżone `CLAUDE.md` (przy odczycie pliku z podkatalogu), ciało skilla (przy wywołaniu), pliki tematyczne auto memory | …/memory, …/skills |
| Z4 | Wzorzec „indeks + pliki tematyczne”: `MEMORY.md` ładuje 200 linii / 25 KB, resztę Claude czyta, gdy potrzebuje | …/memory |
| Z5 | `SKILL.md` poniżej 500 linii; po kompakcji wraca tylko pierwsze 5 000 tokenów skilla — najważniejsze na górę | …/skills |
| Z6 | Hook SessionStart / UserPromptSubmit: `additionalContext` ucinany na 10 000 znaków; treść hooka po kompakcji jest streszczana; pisać fakty, nie polecenia systemowe | …/hooks, …/context-window |
| Z7 | Po kompakcji z dysku wraca tylko root `CLAUDE.md`, reguły bez `paths` i auto memory; reguła z `paths` znika do kolejnego dopasowania | …/memory, …/context-window |
| Z8 | „Smallest possible set of high-signal tokens”, lekkie identyfikatory i ładowanie just-in-time | anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Z9 | Instrument: hook `InstructionsLoaded` z `load_reason` (`session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`); `/context` pokazuje zajętość według kategorii | …/hooks, …/commands |

Obserwacja z tej sesji potwierdzająca Z3: odczyt pliku `.tsx` wciągnął pięć plików
`~/.claude/rules/typescript/*.md` (reguły z `paths:` środowiska Łukasza) — mechanizm działa.

---

## 4. Warianty logiki doczytywania

Zysk liczony na tym repo, w tokenach pierwszej tury (przelicznik 1,93 B/tok dla tekstu polskiego).

### W0 — Status quo plus rotacja — **odrzucony**

Rotacja nie zdejmie nic: „Zasady aktywne” (29,3 KB) i otwarte ryzyka są poza jej zasięgiem z
definicji (D-88, D-15). Propozycja rotacji przy każdym starcie jest dziś szumem.

### W1 — Rytuał sekcjami (szybkie zyski, bez zmiany architektury) — **rekomendowany jako pierwszy**

- STATE: rytuał czyta „Gdzie jesteśmy”, „Nad czym pracujemy teraz”, „Co blokuje” i pierwszy punkt
  „Co dalej” (−11 KB). D-13 nietknięte — plik zostaje dwuwarstwowy i nadpisywany; zmienia się tylko
  to, co czyta start.
- DZIENNIK: tabela ryzyk bez kolumny „Mitygacja” na starcie (−≈ 10 KB), „Czeka na człowieka” tylko
  po sygnale hooka o sprawie przeterminowanej albo przy „sprawdź status” (−5,8 KB; hook już to
  wykrywa, `session-context.js:169-172`).
- USTAWIENIA bez sekcji „Ustawienia wycofane” (−1,7 KB).
- Poprawka parsera aktywnego planu (−3,7 KB).
- Propozycja rotacji tylko wtedy, gdy rotacja coś zdejmie (część rotowalna > 0).
- Zmiana nazwy nakładek rodzin, żeby nie były zagnieżdżonym `CLAUDE.md` (np. `claude.overlay.md`
  albo podkatalog bez kolizji nazwy) — usterka u wszystkich użytkowników.

Plusy: mały zakres, efekt widoczny od razu (≈ 32 KB ≈ 16–17 tys. tokenów mniej), żadna decyzja
zamrożona nie jest ruszana. Minusy: model musi umieć wyciąć sekcję — `awk` w rękach modelu bywa
zawodny, więc wycinanie powinno robić narzędzie (`node core/tools/…`), a rytuał woła jedno
polecenie. Ryzyko wobec zasady 8: niskie — zmienia się zakres odczytu, nie warstwa.

### W2 — Indeks i doczytywanie z drogowskazem (wzorzec Z4) — **rekomendowany jako drugi**

- „Zasady aktywne”: w warstwie startowej po jednej linii na zasadę (nagłówek + wyzwalacz, np.
  „zasada 15 — zadanie wizualne: przeczytaj pełną treść przed pierwszym zrzutem”); pełne brzmienie
  doczytywane, gdy zadanie trafia w wyzwalacz. Dziś zasady 5, 13, 15 i 4 to 21,7 z 29,3 KB i
  dotyczą pomiaru, cudzych narzędzi i UI — nie każdej sesji.
- Skill `relai-core`: frazy, korekta i profile (≈ 6 KB) jako pliki z drogowskazem.
- Zysk: ≈ 25 KB ≈ 13 tys. tokenów. Plusy: zgodne z Z1, Z4, Z8. Minusy: dotyka D-15 („start czyta
  destylat «Zasady aktywne»”) — czy jednolinijkowy indeks jest jeszcze „destylatem”, rozstrzyga
  człowiek. Ryzyko wobec zasady 8: **wysokie** — model może nie doczytać pełnej zasady, gdy trzeba;
  mitygacja: wyzwalacz w warstwie stałej i ewaluacja jak przy drogowskazach hooka (0/7 → 3/3).

### W3 — Reguły harnessu z `paths:` (Z3) — **do rozważenia po W2**

Pełne zasady domenowe jako `.claude/rules/*.md` z `paths:` (UI → `panel/**`, `progress/**`,
`site/**`; mody → `mods/**` …), generowane z LEKCJE, żeby nie było drugiego źródła prawdy. Harness
ładuje je sam przy dotknięciu pliku — bez dyscypliny modelu. Plusy: mechanizm dostawcy, zero kosztu
w sesji, która nie dotyka obszaru. Minusy: tylko Claude Code (Cursor ma podobne `.mdc` z `globs`,
Codex nie ma odpowiednika — parzystość adapterów); po kompakcji reguła znika do kolejnego
dopasowania (Z7); w projektach użytkowników ścieżki są inne niż w tym repo. Ryzyko wobec zasady 8:
średnie.

### W4 — Streszczenie startu wstrzykiwane hookiem — **odrzucony jako główny kierunek**

Hook liczyłby „gdzie jesteśmy” i wstrzykiwał je zamiast odczytu plików. Odrzucony: limit 10 000
znaków (Z6), streszczanie treści hooka przy kompakcji, druga kopia treści z `CLAUDE.md`, a hook już
dziś trwa 24,5 s. Jego sensowna część (sygnały, drogowskazy) jest już w W1.

### Osobno — koszt trybu ciągłego (26,7 tys. w pierwszej turze tej sesji)

Bramka z wyborem „model sesji” każe sesji czytać `relai-prompt.md` (30 KB — już ponad
odnotowanym progiem 20 KB), `SZABLONY.md`, nakładkę i rejestry pod blok kontekstu. Delegacja do
agenta przenosi ten koszt do jego okna. Kandydaci: podział `relai-prompt.md` na rdzeń i pliki
doczytywane, domyślna rekomendacja delegacji, a przy „model sesji” czytanie tylko potrzebnych
kroków. Pytanie 3.

---

## 5. Ryzyka

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| Model nie doczyta treści, gdy zadanie jej wymaga (zasada 8) | wysokie (W2), średnie (W3), niskie (W1) | wyzwalacze w warstwie stałej; ewaluacja wyzwalania przed wydaniem, jak dla drogowskazów hooka |
| Rozjazd trzech kopii listy rytuału (`CLAUDE.md`, hook, skill) przy zmianie | średnie | jedno źródło listy i test parzystości kopii |
| Konflikt z decyzjami zamrożonymi (D-13, D-14, D-15, D-88) | średnie | W1 ich nie rusza; W2 i W3 wracają do Łukasza jako decyzja |
| Parzystość adapterów (Cursor `.mdc`, Codex `AGENTS.md`) | średnie | każdy wariant opisany dla trzech narzędzi; W3 tylko tam, gdzie mechanizm istnieje |
| Projekty użytkowników mają inne rozmiary i układ dokumentów | niskie | wycinanie sekcji po nagłówkach ze specyfikacji, nie po liczbach z tego repo |
| Po kompakcji znika to, co doczytano (Z7) | niskie | SessionStart z matcherem `compact` przypomina drogowskazy, nie treść |

## 6. Przypadki brzegowe

- **Kompakcja w trakcie sesji:** wraca root `CLAUDE.md`; doczytane sekcje i reguły z `paths:`
  znikają do kolejnego wyzwalacza — drogowskaz musi być w `CLAUDE.md` albo w hooku `compact`.
- **„Kontynuujemy pracę” w trwającej sesji:** dziś rytuał czyta wszystko drugi raz
  (`SKILL.md:201`); mógłby czytać tylko to, co się zmieniło od pierwszego odczytu.
- **Sesja etapu:** `PROMPT_ETAP_N.md` waży 41–44 KB — osobny cel odchudzania, poza rytuałem.
- **Tryb gościa i folder bez RelAI:** bez zmian — hooki milczą.
- **Sprawa „Czeka na człowieka” przeterminowana:** hook ją zgłasza, a model doczytuje sekcję
  dopiero wtedy.

## 7. Pozostała niepewność

- Którą liczbę Łukasz odczytuje jako „~100 tys.” (start czy po pierwszej turze) — pytanie 1.
- Tylko jedna porównywalna sesja bez RelAI (Jarvis); wcześniejsze foldery ładowały RelAI.
- Koszt rytuału zależy od tego, jak model czyta (cięcie wierszy, wybór sekcji): w badanych sesjach
  14–39 tys. bez `PROMPT_ETAP`.
- Wielkość liter nazwy `CLAUDE.md` — dokumentacja dostawcy milczy; wstrzyknięcie `rodziny/claude.md`
  zaobserwowane w tej sesji na Windows, na macOS niezmierzone.
- `/context` i `InstructionsLoaded` w trybie `claude -p` — niepotwierdzone.
- Czy kontekst z UserPromptSubmit narasta z każdą turą — dokumentacja mówi tylko o zapisie
  w transkrypcie.

## 8. Do rozstrzygnięcia przez człowieka (wywiad)

1. Który wskaźnik jest celem: kontekst przy pierwszym wywołaniu czy po pierwszej turze? Jaki próg?
2. Czy „Zasady aktywne” mogą stać się indeksem z pełną treścią doczytywaną (W2) — co znaczy dla D-15?
3. Tryb ciągły: domyślna delegacja do agenta zamiast „model sesji”, podział `relai-prompt.md`?
4. Czy zakres obejmuje też środowisko spoza RelAI (≈ 73 tys.: reguły `~/.claude/rules/common`,
   74 agentów, dwa hooki caveman, MCP Claude_Browser), czy tylko produkt RelAI?

### Rozstrzygnięcia z wywiadu (2026-10-28, Łukasz)

1. **Cel:** kontekst **po pierwszej turze** (po rytuale startu), nie samo pierwsze wywołanie.
2. **„Zasady aktywne”:** indeks z wyzwalaczami na starcie, pełna treść doczytywana (W2) — wymaga
   wpisu przy D-15 i ewaluacji wyzwalania.
3. **Tryb ciągły:** delegacja do agenta i podział `relai-prompt.md` na rdzeń i pliki doczytywane.
   Do tego zmiana bramki zgody, słowami Łukasza: zadaje za dużo pytań; po „nie” w pierwszym
   pytaniu nie powinna pytać dalej o model ani zasięg. Ustalone: **najpierw jedno pytanie
   o zgodę**; po „nie” koniec tematu; po „tak” **drugie okno z dwoma pytaniami — model i zasięg**
   (pomijane, gdy wybór jest zapisany na stałe); procedurę optymalizatora doczytuje się dopiero
   po „tak”. To odwraca Aneks F „jedno okno pytań” i zamyka sprawę o nim w sekcji „Czeka na
   człowieka” dziennika.
4. **Zakres:** tylko produkt RelAI; środowiska `~/.claude` plan nie rusza i nie opisuje.
