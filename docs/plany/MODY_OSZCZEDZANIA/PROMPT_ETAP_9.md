# PROMPT_ETAP_9 — porządki AUDYT_MODOW i włączenie nowych modów do kokpitu

Plan: MODY_OSZCZEDZANIA • Etap: **E9 z E10** • Wygenerowano: 2026-11-13 (autor: gpt-6.1-sol w Codeksie, w rytuale „Na koniec” E8) • Wykonawca: **gpt-6.1-terra w Codeksie, poprawki i przegląd gpt-6.1-sol, Claude tylko bramka** (Aneks C; decyzja o Sol z 2026-11-13 dotyczy E8) • effort `high`

> **Kontrola modelu:** model klasy balanced, gpt-6.1-terra (lista codex z 2026-11-10),
> zalecany effort `high`: zmiany współdzielonych modułów mogą popsuć kilka paneli naraz.
> Aneks C i nakładka potwierdzają uruchomienie; model nie potwierdza sam własnej tożsamości
> (L-0332). Nie rozpoczynaj E9 przed dodatnią bramką E8 w STATUS.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wynik `node .claude/relai/tools/start-digest.js`, `CLAUDE.md` z kontekstu | stan, wyzwalacze zasad, zakres bez pracy „przy okazji” |
| `ANEKS_C_WYKONANIE_CODEX.md`, `STATUS.md` obok | podział pracy; wynik bramki E8 i warunek startu |
| `PLAN.html` sekcje 3, 6 (E9), 7; `SPECYFIKACJA_FUNKCJI.md` sekcja 7 | zaakceptowane porządki i przełączniki globalnie false, projektowo true |
| `docs/AUDYT_RELAI_2026-11-09.md` §G2 | źródło odchudzenia kopii; sprawdzić, co już zrobił zamknięty plan optymalizacji |
| `core/tools/sync-panel-core.js`, `core/panel/headings.mjs` i ich testy `core/panel/tests/sync.test.js` | aktualny graf importów i źródło dzielenia, nie ręczna edycja kopii |
| `cache-keeper/.claude-plugin/plugin.json`, `cache-keeper/hooks/register.tsx` | userConfig i obecne nazwy komend, zgodność istniejących ustawień |
| `mods/hooks/register.tsx`, `core/process/plugin-scope.js`, `core/tools/relai-scope.js` | odkrywanie modów i zamknięte listy zestawu; tylko odczyt stanu maszyny |
| `input-router/hooks/register.tsx`, `docs/zasoby/PANEL_RELAI/DESIGN.md` §4, §7, §12 | naprawa wąskiego układu odłożona z E6; props w każdej szerokości |
| `docs/LEKCJE.md` pełne zasady 1, 3, 4, 5, 7, 10, 11, 13, 14, 15 i L-0331–L-0333; `docs/PULAPKI.md` P-043, P-063, P-069, P-070 | najpierw czerwony test, układ i ograniczenia sandboxu |
| `docs/DZIENNIK.md` ostatni wpis E8; `research/README.md`; `core/tools/release-map.json` | niepowtarzane blokady, nowy dziewiąty mod, rejestracja i granice pomiaru |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony (D-33); E9 obejmuje odchudzenie kopii, podział headings, userConfig
  i przedrostek relai-cache-keeper oraz nowe mody w kokpicie i relai-scope (PLAN §6).
- Graf importów i kopiowanie wyłącznie potrzebnych modułów już działają po optymalizacji
  z 2026-11-10. Nie odtwarzaj rozwiązania; zmierz pozostały koszt i dziel tylko potrzebny kod.
- D-92: użytkownik globalnie false, projekty z RelAI true. Kod/testy mogą rozszerzyć zestaw;
  nie przełączasz ani nie instalujesz pluginów na maszynie (Aneks C).
- Clean room: nie czytasz kodu BenAI. Własny kod i specyfikacja stanowią źródło.
- Błąd układu Input Routera z E6 należy do E9 (STATUS, decyzja Łukasza); brak zmiany zachowania
  notatek, routingu i rejestru poza konieczną zgodnością.
- Pomiar na żywo, dokumentacja użytkownika całego pakietu, migracja BenAI i jedyne wydanie
  to E10 (Aneks C). Nie zaczynasz E10; nie odnawiasz tematu dystrybucji G1.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.8.0 wydany. Dziewięć modów w repo: panel, progress, cache-keeper, mods, browser,
input-router, model-router, effort, research. Pięć oszczędzających ma wersję 0.1.0, niewydane.
`sync-panel-core.js` ma dziewięć celów i przenosi tylko osiągalny rdzeń; kopie są generowane.
`research/` ma runtime auto/quick/deep, panel, komendę, testy i osobny plik rejestru.
Router przepuszcza wyłącznie spawny relai-research bez jawnego modelu (Aneks D).

**Bramka E8 przy generacji tego promptu jeszcze otwarta:** Research 49/49 testów silnika
i 6/6 Node (FAKT), router 103/103, mutacje 40/40. Pełne zestawy Node blokuje spawnSync EPERM;
cztery czerwienie wyglądu panel/progress/cache-keeper występują też na kopiach HEAD
w Claude Code 2.1.323. Claude ma powtórzyć bazę i rozstrzygnąć bramkę, bez uznawania ich
za regresję E8 na podstawie samego koloru. Sprawdź aktualny STATUS, nie ten historyczny opis.

**Czego jeszcze nie ma:** porządków E9, nowych modów w zestawie relai-scope, dowodu układu
Input Routera po naprawie oraz pomiaru integracji E7–E9 na żywo.
**Zasady do doczytania:** 1, 3, 4, 5, 7, 10, 11, 13, 14, 15.
**Ryzyka etapu:** R1 (API), R7 (podwójne mody), R10 (mapa/kopie), AC3–AC5 (bramka i zakres).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E9/`.** Wszystkie instrumenty,
wyjścia i materiał porównania zapisuj tam. Artefakty koniecznie zewnętrzne nazwij w dzienniku
z faktyczną ścieżką; nie kasuj cudzych ani katalogu E8.

1. `core/panel/headings.mjs`, `core/tools/sync-panel-core.js`, importujące widoki modów:
   zmierz rozmiary pakietów przed, zrób minimalny podział zachowujący eksporty potrzebne
   odbiorcom, synchronizuj narzędziem. Dowód po: mniej bajtów, kompletne te same widoki.
2. `cache-keeper/.claude-plugin/plugin.json` i `cache-keeper/hooks/`: userConfig i komendy
   z przedrostkiem relai-cache-keeper zgodnie z planem. Najpierw ustal czytaną konfigurację
   i udowodnij, że stare ustawienie nie ginie. Nierozstrzygnięta decyzja kompatybilności
   zmieniająca pracę → PYTANIE według nakładki, nie domysł ani nowy zakres.
3. `mods/hooks/`, `core/process/plugin-scope.js`, `core/tools/relai-scope.js` i właściwe testy:
   dziewięć modów w kokpicie i zestawie, zgodne nazwy ze źródłami marketplace. Testy na
   podstawionym HOME, bez zmiany prawdziwych enabledPlugins i instalacji.
4. `input-router/hooks/register.tsx` i testy widoku: naprawa układu z E6. Najpierw czerwony
   test props szerokości/kierunku, potem mutant powrotu do width=0 w kolumnie musi zginąć.
5. Rejestracja i dokumenty rytuału: aktualizuj tylko komponenty dotknięte E9 i wpisy
   release-map, wersje istniejących niewydanych modów pozostaw do E10. Nie edytuj ręcznie
   żadnego katalogu hooks/core ani hooks/relai.

## Weryfikacja — wszystkie punkty muszą przejść

Odhacz każdy spełniony punkt w tym prompcie po sprawdzeniu, nie na końcu. Blokada ma komendę
i dokładny błąd; kod wyjścia 0 z plugin test nie wystarcza — czytaj results[].failure.

- [ ] Baza przed i po: `node --test --test-isolation=none <plik>` osobno dla każdego pliku
      core/guardrails/tests, core/process/tests, core/panel/tests, adapters/codex/tests,
      adapters/cursor/tests; `claude plugin test --file <mod>/hooks/<plik> <mod>` dla dziewięciu
      modów. Baza pełna od Claude przed przebiegiem (L-0333); blokady sandboxu jawne.
- [ ] `node core/tools/validate-adapters.js`, `node core/tools/sync-panel-core.js --check`
      i `claude plugin validate <mod>` dla zmienionych modów; brak ręcznych rozjazdów kopii.
- [ ] Bajty przed/po oraz identyczne zachowanie eksportów i widoków; stary wariant odtwarzany
      w katalogu roboczym. Nie deklaruj zysku na podstawie samej liczby plików.
- [ ] Dziewięć modów w kokpicie oraz planie zakresu; stan prawdziwej instalacji niezmieniony.
      Testy HOME: brak markerów, projekt z markerem, odmowa, nadpisanie lokalne, nieznany mod.
- [ ] Układ Input Routera: 40, 47, 48, 143, 144, 160 kolumn, najdłuższe realne dane;
      props i kliknięcie w teście, bez width=0 w kolumnie; mutant zabity.
- [ ] Dowody negatywne i mutacje ochron konfiguracji/zestawu oraz zgodności istniejących ustawień;
      stary klucz po przejściu nadal ma tę samą wartość, nie tylko nowy klucz istnieje.
- [ ] Trivy: `trivy fs --scanners vuln --skip-db-update .` z tą samą bazą i zakresem co E8
      (0 CRITICAL / 42 HIGH — FAKT, obejmuje fixtury); brak nowych HIGH/CRITICAL.
      Gdy brak binarki/bazy: audyt ekosystemu w środowisku z siecią, wynik do bramki Claude.
      Skaner sekretów z kontrolą pozytywną, brak nowych zależności bez uzasadnienia;
      wejście walidowane, ścieżki ograniczone, bez sklejanej powłoki i sekretów w logach.
- [ ] Sonda i pomiar na żywo przeniesione do E10 (Aneks C); przegląd Sol i pełna bramka
      należą do Claude. Do pomiaru zachować cztery zastane reproduktory wyglądu z E8.
- [ ] STATUS, wpis DZIENNIKA na końcu, STATE, ARTEFAKTY gdy zmieniono instrukcję,
      PROMPT_ETAP_10 wygenerowany z realnego stanu, dziewięć elementów specyfikacji.
- [ ] Katalog E9 przejrzany raportem `node .claude/relai/tools/clean-work.js raport`
      (otwarty etap pomijany → inwentarz plików i bajtów); skasowanie po „tak” robi Claude.
      Artefakty zewnętrzne wypisane z nazwy i opisane; Codex niczego nie usuwa ani nie commituje.

## Na koniec — bez tego rytuału etap nie jest ukończony

Aneks C: Codex pisze punkty 1–5. Punkty 1a i 6 wykonuje Claude po bramce.

1. `STATUS.md`: E9 → ZREALIZOWANY z datą dopiero po spełnieniu kryteriów; E10 → GOTOWY DO STARTU;
   wpis w dzienniku wdrożenia, link do istniejącego promptu E10 po kroku 5.
1a. Raport katalogu E9 i zewnętrznych artefaktów; „tak”, kasowanie i liczby przed/po — Claude.
2. `docs/DZIENNIK.md`: dopisz wpis na końcu wg SPEC_DZIENNIK z czterema sekcjami, podpisem
   `Autor: RelAI (gpt-6.1-terra w Codeksie) + Lukasz`, ryzykami, liczbami i blokadami.
   Lekcje i pułapki tylko gdy powstały; bez przebudowy rejestru.
3. Bramki manualne wpisu do STATUS: pomiar integracji i przełączenie BenAI w E10, jawnie OTWARTA.
4. `docs/STATE.md` i linia Aktywny plan w CLAUDE; sekcja Stan prac AGENTS zgodna z CLAUDE.
   Rejestr artefaktów aktualizuj tylko przy zmianie instrukcji.
5. Wygeneruj `PROMPT_ETAP_10.md` z PLAN §6 E10, specyfikacji i rzeczywistego stanu po E9.
   Oddziel kod i dokumenty Codeksa od pomiarów z człowiekiem oraz wydania przez Claude.
6. Propozycja commita — Claude; Codex bez commita, push, instalacji i przełączania pluginów.
