# PROMPT_ETAP_3 — Planowanie: PLAN / MINIPLAN, folder-per-plan, STATUS

Plan: BUDOWA_RELAI • Etap: **E3 z E10** • Wygenerowano: 2026-08-07 (autor: Opus, w rytuale „Na koniec" E2) • Wykonawca: **Opus**

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (decyzja D-85). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-07 o E2 (co powstało i czego NIE zweryfikowano) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — pięć zasad obowiązujących w tym etapie |
| `docs/DECYZJE.md` | grupy: Plany i wykonanie (D-30…D-39), Interakcja (D-20…D-27), Szablony (D-60…D-63) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcje 3.2 (cykl planowania i wykonania), 8 (opis E3), 13 (Aneks A) |
| `skills/relai-core/SKILL.md` | wzorzec skilla po E2 — nowy skill ma wyglądać tak samo i nie dublować jego treści |
| `templates/README.md` + `templates/SPEC_DZIENNIK.md` | konwencja specyfikacji; MINIPLAN mieszka w DZIENNIKU |
| `docs/USTAWIENIA.md` | preferencje projektu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Folder-per-plan: `docs/plany/<TEMAT>/` z `PLAN.{html,md}` + `STATUS.md` + `PROMPT_ETAP_N.md`; `CLAUDE.md` wskazuje aktywny plan **jedną linią** (D-30).
- Dwa poziomy: **PLAN** (warianty z powodami odrzucenia, ryzyka z poziomem i mitygacją, etapy z szacunkiem i wczesnym efektem, przypadki brzegowe, lista dla człowieka) i **MINIPLAN** (cel / kroki / weryfikacja, mieszka w DZIENNIKU, nie w osobnym pliku) — D-31.
- Format: interaktywny HTML domyślnie dla planów głównych, Markdown dla dokumentów agentowych; **w tym etapie plany powstają w Markdown — szablon HTML dochodzi dopiero w E6** (D-32, sekcja 8 planu).
- Przy każdym planie pytanie o **rodzaj, format i model wykonawczy etapów**; odpowiedź swobodna, z rekomendacją RelAI jako opcją domyślną; preferencja utrwalana globalnie lub projektowo (D-39, Aneks A pkt 2). Wybrany model trafia do `STATUS.md` planu i do treści promptów etapowych.
- Plan po akceptacji **ZAMROŻONY**; zmiany wyłącznie datowanymi aneksami (A, B, C…). Odchylenie fundamentalne → zamknięcie ze statusem CZĘŚCIOWO + nowy plan z linkiem do starego (D-33).
- Zamknięcie planu: aktualizacja STATE, wpis zamykający (dowiezione vs plan), status ZREALIZOWANY, przeniesienie do archiwum, aktualizacja ryzyk (D-36).
- Etykiety **FAKT / SZACUNEK** przy liczbach w planach; podpis neutralny, bez persony (D-63).
- Filozofia: wykryj intencję → zapytaj RAZ w naturalnym momencie → zapisz → respektuj. Bez ręcznego wywoływania skilli (D-22).
- Opisy skilli: po angielsku + **polskie frazy wyzwalające** (Aneks A pkt 4.3).
- Prompty etapowe i `/relai-stage` to **E4**, hooki E5, szablon HTML E6, komendy operacyjne E7. Nie wychodź poza zakres E3.

## Stan wyjściowy (co realnie zastajesz po E2)

Plugin **RelAI 0.2.0** w repo `github.com/nowilus/relai`. **Plugin jest odinstalowany na tej maszynie** i taki zostaje do końca budowy (L-0004) — testy wykonujesz, odtwarzając procedurę skilla ręcznie, i piszesz wprost, czego przez to nie zmierzono.

```
.claude-plugin/{plugin,marketplace}.json   # wersja 0.2.0, zwalidowane
skills/relai-core/SKILL.md                 # Krok 0, init (8 dokumentów), tryb gościa, dołączenie,
                                           #   rytuał startu sesji, definicja ukończenia,
                                           #   reakcja na korektę, zamknięcie sesji, 3 frazy,
                                           #   warstwa ustawień globalnych
templates/README.md                        # indeks ośmiu specyfikacji
templates/SPEC_CLAUDE_MD.md                # router ≤60 linii; rytuał startu z LEKCJAMI
templates/SPEC_README.md                   # mapa dokumentacji z LEKCJE i DECYZJE
templates/SPEC_STATE.md                    # dwuwarstwowy, nadpisywany
templates/SPEC_DZIENNIK.md                 # szablon wpisu, ryzyka, rotacja, append-na-końcu
templates/SPEC_LEKCJE.md                   # L-NNNN, „Zasady aktywne", graduacja (próg 2), kompresja
templates/SPEC_DECYZJE.md                  # D-NN, propozycja zamrożenia, przechwytywanie fraz
templates/SPEC_USTAWIENIA.md               # marker `Wersja RelAI:` + warstwa globalna
templates/SPEC_KOMENDY.md                  # zakres 0.2.0: komend nie ma, trzy frazy działają
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** wykrywania intencji planowania z naturalnego prompta, pytania o rodzaj/format/model z utrwalaniem preferencji, struktury pełnego PLAN-u i MINIPLAN-u, `STATUS.md` jako dokumentu z własną specyfikacją, mechanizmu zamrożenia i aneksów, procedury zamknięcia planu.

**Lekcje z E1–E2, które obowiązują w tym etapie** (pełna lista: `docs/LEKCJE.md`, sekcja „Zasady aktywne"):
1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa — `KOMENDY.md` rośnie dopiero wtedy, gdy fraza realnie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome — nie „naprawiaj" go (L-0003).
4. Plugin zostaje odinstalowany do końca budowy; testy ręczne, z jawnym zapisem, czego nie zmierzono (L-0004).
5. Przenosząc weryfikację do późniejszego etapu, zapisz w prompcie tamtego etapu warunek, który musi być spełniony, żeby dała się wykonać (L-0005).

## Zakres etapu

1. **Skill `skills/relai-planning/SKILL.md`** — opis EN z polskimi frazami wyzwalającymi („przygotuj plan", „zaplanuj", „rozpisz to na etapy", „zrób plan wdrożenia", „plan projektu", „make a plan", „plan this out"). Skill obejmuje:
   - **Wykrycie intencji planowania z naturalnego prompta** (D-22) — jawne kryteria, kiedy zwykła prośba o zrobienie czegoś jest prośbą o plan, a kiedy nie. Fałszywe wyzwolenie („zaplanujmy spotkanie") ma być rozstrzygnięte wprost.
   - **Rozróżnienie PLAN vs MINIPLAN** — próg podaj liczbowo i oznacz jako SZACUNEK; przy niejasności pytaj, nie zgaduj.
   - **Pytanie startowe planu** (D-39, Aneks A): rodzaj, format i model wykonawczy etapów, w **jednym** wywołaniu AskUserQuestion, z rekomendacją RelAI jako pierwszą opcją „(Rekomendowane)". Odpowiedź swobodna dopuszczalna. Przed pytaniem sprawdź `docs/USTAWIENIA.md` i warstwę globalną — utrwaloną preferencję respektujesz bez pytania.
   - **Zamrożenie po akceptacji i aneksy** — jak wygląda propozycja aneksu, co jest odchyleniem fundamentalnym, jak zamyka się plan statusem CZĘŚCIOWO (D-33).
   - **Zamknięcie planu** (D-36) jako sekwencja kroków.
2. **Specyfikacja `templates/SPEC_PLAN.md`** — struktura pełnego PLAN-u w Markdown: streszczenie, cele, warianty z jawnym powodem odrzucenia, architektura/przebieg, etapy z szacunkiem i wczesnym widocznym efektem, ryzyka z poziomem i mitygacją, przypadki brzegowe rozstrzygnięte wprost, „do rozstrzygnięcia przez człowieka", sekcja aneksów. Etykiety FAKT/SZACUNEK. Kompletny przykład.
3. **Specyfikacja `templates/SPEC_STATUS.md`** — dokument `STATUS.md` planu: nagłówek z linkiem do planu, statusem planu i **modelem wykonawczym**, tabela etapów (etap / nazwa / status / prompt / uwagi), dziennik wdrożenia dopisywany na końcu. Przykład.
4. **Specyfikacja `templates/SPEC_MINIPLAN.md`** albo sekcja w `SPEC_DZIENNIK.md` (wybierz jedno i uzasadnij w DZIENNIKU) — cel / kroki / weryfikacja, miejsce: wpis w DZIENNIKU, bez osobnego pliku (D-31).
5. **Spójność z `relai-core`:** rytuał startu sesji czyta aktywny plan — upewnij się, że `relai-core` i `relai-planning` nie dublują treści i nie zaprzeczają sobie. `CLAUDE.md` projektu ma wskazywać aktywny plan jedną linią; zaktualizuj `SPEC_CLAUDE_MD.md`, jeśli obecny zapis tego nie oddaje.
6. **Aktualizacja `KOMENDY.md`:** frazy planistyczne wpisujesz do `SPEC_KOMENDY.md` (zakres 0.3.0) **tylko wtedy**, gdy realnie działają po tym etapie (L-0002).
7. **Podbicie wersji do `0.3.0`** w `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, README pluginu i `SPEC_KOMENDY.md`.
8. **Dogfooding (D-82):** ten plan (`BUDOWA_RELAI`) powstał przed istnieniem specyfikacji — porównaj `PLAN.html` i `STATUS.md` z nowymi `SPEC_PLAN.md` / `SPEC_STATUS.md` i **opisz różnice w DZIENNIKU**. Nie przepisuj zamrożonego planu (D-33).
9. **Git:** commity conventional EN (bez stopek atrybucji), push na `origin main`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie o root `CLAUDE.md` dopuszczalne); wersja `0.3.0` spójna w `plugin.json`, `marketplace.json`, README i `SPEC_KOMENDY.md`.
- [ ] Test na czystym folderze o ścieżce ze spacją i polskim znakiem: projekt zainicjowany wg `relai-core`, potem prompt **bez żadnej komendy** w rodzaju „przygotuj plan dodania logowania" → powstaje `docs/plany/<TEMAT>/PLAN.md` + `STATUS.md`, `CLAUDE.md` dostaje linię z aktywnym planem, a przed generacją padło **dokładnie jedno** pytanie o rodzaj/format/model.
- [ ] Test negatywny: prompt „zaplanuj mi spotkanie na jutro" **nie** uruchamia generacji planu projektowego.
- [ ] Test MINIPLAN-u: drobne zadanie → cel/kroki/weryfikacja jako wpis w DZIENNIKU, bez zakładania folderu planu.
- [ ] Test utrwalonej preferencji: druga prośba o plan w tym samym projekcie **nie** powtarza pytania o format i model — bierze je z `USTAWIENIA.md`.
- [ ] Test zamrożenia: prośba o zmianę zaakceptowanego planu → propozycja **aneksu z datą**, nie edycja sekcji planu.
- [ ] Wpis w DZIENNIKU dopisany na **końcu** sekcji „Wpisy", z autorem w nagłówku; sekcja ryzyk pozostaje na górze; `LEKCJE.md` repo uzupełnione o lekcje z tego etapu.
- [ ] Foldery testowe posprzątane; jeśli test utworzył `~/.claude/relai/`, usuń go — plugin ma zostać niezainstalowany i bez śladów do końca budowy (L-0004).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, wpis w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", autor: RelAI (Opus). Zaktualizuj tabelę ryzyk, jeśli któreś się zmieniło. Dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze: na bazie PLAN sekcja 8 (E4 — format `PROMPT_ETAP_N`, komenda `/relai-stage` z auto-wykryciem aktywnego planu i obowiązkowym potwierdzeniem, lazy-generacja N+1 w rytuale „Na koniec", siatka dogenerowująca brakujący prompt na starcie sesji, rekomendacja subagenta dla małych etapów, automatyczne zamknięcie planu) + realny stan po E3 + lekcje z tego etapu. Format: dokładnie jak ten prompt (kontrola modelu, co przeczytać, decyzje, stan wyjściowy, zakres, weryfikacja, „Na koniec").
5. Commit + push.
