# PROMPT_ETAP_5 — Osiem hooków Node.js i dostęp sesji do zasobów pluginu

Plan: BUDOWA_RELAI • Etap: **E5 z E10** • Wygenerowano: 2026-08-07 (autor: Opus, w rytuale „Na koniec" E4) • Wykonawca: **Opus** (D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (decyzja D-85). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**R8 jest nowe i należy do tego etapu**) + wpis z 2026-08-07 o E4 — co powstało, pięć poprawionych defektów i czego NIE zmierzono |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — piętnaście zasad; szczególnie 11, 12 i 15, bo dotyczą wprost tego etapu |
| `docs/DECYZJE.md` | grupy: Hooki i bezpieczeństwo (D-40…D-45), Interakcja (D-22, D-23), Szablony (D-60) — D-60 jest tu podważane, patrz zakres |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcje 5.2 (tabela ośmiu hooków ze zdarzeniami i twardością), 8 (opis E5), 10 (przypadek brzegowy o przerwanym rytuale) |
| `README.md` (repo pluginu) | sekcja „Konwencja: hook-guard" — sześć punktów, które każdy hook ma spełniać; ta konwencja powstała w E1 właśnie po to, by pierwszy hook był od razu zgodny |
| `skills/relai-core/SKILL.md` | rytuał startu sesji i sekcja „Siatka bezpieczeństwa" — hook `session-context` ma tę siatkę **wzmacniać**, nie dublować; oraz „Warstwa ustawień globalnych" (D-23), która dziś nie działa |
| `commands/relai-stage.md` | wzorzec pliku wykonawczego po E4 i miejsce, w którym siatka jest konsumowana |
| `templates/SPEC_USTAWIENIA.md` | marker `Wersja RelAI:` — po nim hooki rozpoznają projekt (guard) i po nim `session-context` liczy różnicę wersji |
| `docs/USTAWIENIA.md` | preferencje projektu; plugin jest zainstalowany na stałe (scope `user`) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Osiem hooków w Node.js**, jeden plik na hook, bez par `.ps1`/`.sh` (D-40). Node jest zawsze dostępny w środowisku Claude Code; zero zależności npm.
- **Blokują wyłącznie `secret-scanner` i `config-protection`.** Pozostałe sześć ostrzega albo działa cicho (D-41). Hook ostrzegający, który blokuje, jest błędem, nie nadgorliwością.
- **Sekrety wyłącznie w `.env` objętym `.gitignore`**; zapis sekretu do pliku śledzonego BLOKOWANY; poluzowanie wyłącznie świadomą decyzją zamrożoną per projekt (D-42).
- **Konwencja hook-guard** jest wiążąca i już opisana w README pluginu — guard jako pierwsza instrukcja, tryb gościa traktowany jak brak struktury, awaria guarda = wyjście bez efektu, cisza poza projektami RelAI. Nie projektuj jej od nowa; zaimplementuj i sprawdź, czy jest kompletna.
- **`session-context` jest cichy** (D-40): wstrzyknięcie daty dnia, kontrola wersji projektu vs plugin, siatka brakujących promptów etapowych. Cichy znaczy „nie zagaduje użytkownika", nie „nie robi nic".
- Komendy operacyjne (`/relai-backup`, `/relai-audit`, `/relai-help` i reszta) to **E7**; szablon HTML planów — **E6**; profile — **E8**. `quality-gate` i `design-quality-check` mają w tej wersji działać **warunkowo**: gdy plik profilu albo `DESIGN.md` nie istnieje, hook milczy. Nie buduj profili przy okazji.
- Prompty etapowe, `/relai-stage`, lazy-generacja i siatka w rytuale startu **już działają** (E4, 0.4.0). Nie przepisuj ich — hook ma być drugą warstwą tej samej siatki.

## Stan wyjściowy (co realnie zastajesz po E4)

Plugin **RelAI 0.4.0** w repo `github.com/nowilus/relai`, **zainstalowany na tej maszynie** (scope `user`). Po każdej zmianie skilla, komendy lub manifestu obowiązuje sekwencja `push` → `claude plugin marketplace update relai` → reinstalacja; bez niej mierzysz starą wersję (L-0004). Zachowania mierzysz realnie — świeżą sesją `claude -p … --output-format stream-json` i tym, co widać w transkrypcie — a nie odtwarzaniem procedury ręcznie.

```
.claude-plugin/plugin.json          # wersja 0.4.0, pola "skills" i "commands", zwalidowane
.claude-plugin/marketplace.json     # wersja 0.4.0
skills/relai-core/SKILL.md          # stany folderu, init (8 dokumentów), tryb gościa, rytuał startu
                                    #   sesji + SIATKA brakujących promptów, definicja ukończenia,
                                    #   reakcja na korektę, zamknięcie sesji, 3 frazy,
                                    #   warstwa ustawień globalnych (opisana, NIE działa — L-0010)
skills/relai-planning/SKILL.md      # wykrycie intencji, próg PLAN/MINIPLAN, jedno pytanie,
                                    #   generacja planu, zamrożenie + aneksy, PROMPTY ETAPOWE
                                    #   (trzy momenty lazy + dziewięć sekcji wypisanych wprost),
                                    #   rytuał „Na koniec" etapu, zamknięcie planu (D-36)
commands/relai-stage.md             # jedyna komenda: guard, wybór planu i etapu, dogenerowanie
                                    #   promptu, KARTA POTWIERDZENIA, wykonanie, zamknięcie planu
templates/SPEC_PROMPT_ETAPU.md      # dziewięć elementów promptu etapowego + kompletny przykład
templates/SPEC_STATUS.md            # kolumna Prompt z realnym linkiem; polityka dla W TOKU
templates/SPEC_KOMENDY.md           # zakres 0.4.0: tabela komend z jedną pozycją
templates/SPEC_{CLAUDE_MD,README,STATE,DZIENNIK,LEKCJE,DECYZJE,USTAWIENIA}.md, templates/README.md
hooks/                              # NIE ISTNIEJE — to jest zakres tego etapu
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** folderu `hooks/` i ani jednego hooka; rejestracji hooków w `plugin.json`; wymuszenia rytuału startu niezależnie od tego, czy skill się wyzwolił; działającego dostępu do warstwy globalnej `~/.claude/relai/`; działającego dostępu sesji do `templates/` pluginu (**R8** — dziś inicjalizacja projektu bez `--add-dir` zatrzymuje się na braku źródła).

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:**
1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa — `KOMENDY.md` rośnie dopiero wtedy, gdy zachowanie realnie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome — nie „naprawiaj" go (L-0003).
4. Plugin jest zainstalowany; zachowania mierzysz świeżą sesją i transkryptem, nie ręcznym odtwarzaniem. Po zmianie: push → `marketplace update` → reinstalacja (L-0004).
5. Przenosząc weryfikację do późniejszego etapu, zapisz warunek jej wykonalności tam, gdzie zostanie odczytany (L-0005).
6. Pytanie o preferencję pada raz na projekt — najpierw `USTAWIENIA.md` i warstwa globalna (L-0006).
7. Test zakazu wymaga dowodu negatywnego: pokaż, że chroniony fragment ma nadal pierwotne brzmienie (L-0007).
8. Po podbiciu wersji przepuść repo `grep`-em po starym numerze i rozstrzygnij każde trafienie (L-0008).
9. Opis skilla zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy dosłownych fraz (L-0009).
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego (L-0010).
11. Odesłanie do pliku specyfikacji nie wystarcza — wymaganą strukturę wypisz w treści skilla (L-0011).
12. Katalog pluginu (`templates/`) jest dla sesji niedostępny tak samo jak katalog domowy; krok obowiązkowy nie może zależeć wyłącznie od odczytu stamtąd (L-0012).
13. „Zapytam człowieka" nie zwalnia z posprzątania po sobie — zawsze istnieje poprawna wartość tymczasowa (L-0013).
14. Krok rytuału wykonuj w repozytorium, zanim napiszesz zdanie, które go opisuje (L-0014).
15. Komenda wywołana wprost nie ładuje skilla, do którego odsyła (L-0015).

## Zakres etapu

1. **`hooks/` — osiem plików Node.js**, po jednym na hook, wszystkie zgodne z konwencją hook-guard z README pluginu. Zdarzenia i twardość dokładnie wg tabeli 5.2 planu i D-41:
   - `secret-scanner.js` — PreToolUse (Write/Edit), **BLOKUJE**;
   - `config-protection.js` — PreToolUse (Write/Edit), **BLOKUJE**;
   - `quality-gate.js`, `console-log-warn.js`, `design-quality-check.js`, `doc-sync-reminder.js` — **OSTRZEGAJĄ**;
   - `auto-format.js`, `session-context.js` — **CICHE**.
   Zero zależności npm. Nazwy plików bez polskich znaków. Każdy hook kończy się kodem `0` w każdej ścieżce poza jawną blokadą.
2. **Rejestracja hooków** w `.claude-plugin/plugin.json` (pole `hooks`) albo w `hooks/hooks.json` — sprawdź, którą formę przyjmuje walidator, i użyj tej, która przechodzi. Po rejestracji: reinstalacja i potwierdzenie, że `claude plugin details relai@relai` pokazuje **Hooks (8)**.
3. **`secret-scanner`** — wzorce co najmniej: `sk-…`, `ghp_…`/`ghp-…`, `AKIA…`, JWT (`eyJ…` z dwiema kropkami), `-----BEGIN … PRIVATE KEY-----`, przypisania w rodzaju `PASSWORD=`/`SECRET=`/`TOKEN=` z wartością niepustą i niebędącą placeholderem. **Nie blokuje**, gdy plik jest objęty `.gitignore` (typowo `.env`) — blokada dotyczy plików śledzonych (D-42). Komunikat blokady mówi, **co** wykryto i **gdzie to powinno trafić**, nigdy nie cytując samego sekretu.
4. **`config-protection`** — chroni sekcję niemutowalną `CLAUDE.md` (nagłówek „Implementation guidelines (sekcja niemutowalna)" albo jego odpowiednik w języku projektu) oraz `docs/USTAWIENIA.md` przed zmianą bez zgody. Zgoda jest jawną wypowiedzią użytkownika w tej sesji, nie domysłem agenta.
5. **`session-context` — właściwa mitygacja R2.** Trzy zadania: (a) wstrzyknięcie **daty dnia** (przeciw halucynacjom dat); (b) kontrola wersji: marker `Wersja RelAI:` w projekcie vs wersja zainstalowanego pluginu — różnica zgłaszana jednym zdaniem, bez proponowania migracji (to `/relai-update`, E9); (c) **wymuszenie rytuału startu i siatki promptów etapowych niezależnie od tego, czy `relai-core` się wyzwolił** — hook wstrzykuje kontekst, którego skill może nie dostarczyć. To jest powód istnienia tego hooka; pomiar R2 z 2026-08-07 pokazał 1/4 wyzwoleń przed poprawką opisów.
6. **Dostęp do zasobów spoza katalogu roboczego — R8 i L-0010.** Rozstrzygnij i **zaimplementuj jedno** rozwiązanie dla dwóch przypadków: `templates/` w katalogu pluginu (bez tego inicjalizacja projektu nie ma z czego generować) i `~/.claude/relai/USTAWIENIA.md` (warstwa globalna, D-23). Warianty do rozważenia — wybierz z uzasadnieniem w DZIENNIKU, nie milcząco: hook dostarczający treść w kontekst sesji; kopiowanie specyfikacji do projektu przy inicjalizacji; instrukcja `--add-dir` w README instalacji; przeniesienie treści krytycznej do skilli z pozostawieniem `templates/` jako materiału referencyjnego. **Rozstrzygnięcie dotyka D-60** — jeśli wybrany wariant zmienia sens tej decyzji, zgłoś to człowiekowi jako propozycję zmiany decyzji, zamiast rozstrzygać samodzielnie.
7. **`doc-sync-reminder`** — druga siatka dla definicji ukończenia (D-44): zmiana kodu bez zmiany `STATE.md`/`DZIENNIK.md` w tej samej turze → przypomnienie. Ostrzega, nigdy nie blokuje.
8. **`KOMENDY.md` (zakres 0.5.0):** sekcja „Czego RelAI pilnuje bez proszenia" rośnie o zachowania, które hooki realnie wprowadzają — wyłącznie o te, które działają po tym etapie (L-0002). Zaktualizuj `templates/SPEC_KOMENDY.md`.
9. **Podbicie wersji do `0.5.0`** w `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, README pluginu, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`, obu skillach i markerze `docs/USTAWIENIA.md` tego repo. Po podbiciu — `grep` po `0.4.0` i rozstrzygnięcie każdego trafienia (L-0008).
10. **Git:** commity conventional EN (bez stopek atrybucji), push na `origin main`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie o root `CLAUDE.md` dopuszczalne); po reinstalacji `claude plugin details relai@relai` pokazuje wersję `0.5.0` i **Hooks (8)**; `grep` po `0.4.0` rozstrzygnięty.
- [ ] **Guard — dowód negatywny (L-0007):** w folderze **bez** markera `Wersja RelAI:` świeża sesja wykonuje zapis pliku zawierającego `sk-` i JWT → zapis **przechodzi**, a transkrypt i konsola nie zawierają ani jednego komunikatu od RelAI. To samo w folderze z markerem trybu gościa. Cisza ma być udowodniona, nie założona.
- [ ] **`secret-scanner` blokuje:** w projekcie RelAI próba zapisu klucza w każdym z czterech formatów (`sk-`, `ghp_`, `AKIA…`, JWT) do pliku **śledzonego** → cztery blokady, plik po każdej próbie **nie istnieje albo ma pierwotną treść** (sprawdź sumą kontrolną, nie komunikatem). Ten sam sekret zapisany do `.env` objętego `.gitignore` → przechodzi.
- [ ] **`config-protection` blokuje:** próba zmiany sekcji niemutowalnej `CLAUDE.md` bez zgody → blokada, a sekcja ma **dosłownie** pierwotne brzmienie (dowód: porównanie treści przed i po).
- [ ] **Windows, ścieżki ze spacją i polskim znakiem:** wszystkie powyższe testy wykonane w folderze w rodzaju `C:\Users\Lukasz\Desktop\Próba RelAI E5\projekt` — zero błędów kodowania w komunikatach hooków, zero problemów ze ścieżką. Polskie znaki w komunikacie hooka wyświetlają się poprawnie albo komunikat jest świadomie ASCII — rozstrzygnij i zapisz, które.
- [ ] **Hook ostrzegający nie blokuje:** dla każdego z sześciu pozostałych hooków pokaż, że operacja **doszła do skutku** mimo ostrzeżenia (D-41).
- [ ] **`session-context` mitygacja R2:** świeża sesja `claude -p` z promptem, który **nie zawiera** żadnej frazy wyzwalającej, w projekcie RelAI z etapem `GOTOWY DO STARTU` bez promptu → data dnia i luka promptu są w kontekście sesji **nawet gdy transkrypt nie zawiera wywołania `Skill`**. To jest jedyny punkt, który realnie mierzy mitygację R2 — opisz wynik liczbowo (ile przebiegów, ile trafień).
- [ ] **R8 zamknięte albo świadomie przeniesione:** inicjalizacja projektu w świeżym pustym folderze **bez** `--add-dir` kończy się kompletem ośmiu dokumentów. Jeśli wybrany wariant tego nie osiąga — napisz wprost, czego nie osiąga i dlaczego, i zostaw R8 otwarte z nową mitygacją.
- [ ] **Awaria guarda:** hook uruchomiony w folderze, do którego nie ma uprawnień odczytu (albo z zepsutym `USTAWIENIA.md`), kończy się kodem `0` i bez efektu — nie wywala sesji.
- [ ] Wpis w DZIENNIKU dopisany na **końcu** sekcji „Wpisy", z autorem w nagłówku; sekcja ryzyk pozostaje na górze; R8 i R2 mają zaktualizowany status; `LEKCJE.md` uzupełnione o lekcje z tego etapu i odświeżony destylat „Zasady aktywne".
- [ ] Foldery testowe posprzątane; jeśli test utworzył `~/.claude/relai/`, rozstrzygnij, czy zostaje (bo warstwa globalna zaczęła działać), czy jest usuwany.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E5 → ZREALIZOWANY (data), E6 → GOTOWY DO STARTU z linkiem w kolumnie `Prompt`, linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", autor: RelAI (Opus). Zaktualizuj tabelę ryzyk — **R2** (czy hook realnie ją domyka) i **R8** (zamknięte czy z nową mitygacją), oraz **R4** (hooki na Windows — po tym etapie da się je rozstrzygnąć). Dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_6.md`** w tym folderze, wg `templates/SPEC_PROMPT_ETAPU.md`: na bazie PLAN sekcje 8 (E6) i D-61/D-62 (konkurs pięciu skrajnie różnych propozycji designu na pełnych testowych HTML-ach, zakazy twarde: fioletowe gradienty i glow, przesyt emoji, glassmorphism, przeanimowanie, generyczne frazy i stocki; mechanizm lokalnego nadpisania szablonu) + realny stan po E5 + lekcje z tego etapu. **Uwaga do wpisania w prompt E6:** wg D-85 propozycje designu generuje Opus, ale **sesję wyboru i iterację finalnego szablonu prowadzi Fable** — prompt E6 ma to powiedzieć wprost w sekcji „Kontrola modelu".
5. Commit + push.
