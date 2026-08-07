# PROMPT_ETAP_2 — Rdzeń dokumentacyjny: specyfikacje i rytuały

Plan: BUDOWA_RELAI • Etap: **E2 z E10** • Wygenerowano: 2026-08-07 (autor: Opus, w rytuale „Na koniec" E1) • Wykonawca: **Opus**

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (decyzja D-85). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Zanim zrobisz cokolwiek innego — test ryzyka R2

Ten etap zaczyna się od jednego sprawdzenia, którego E1 nie mógł wykonać:

**Czy skill `relai-core` wyzwolił się sam na starcie tej sesji?** Odpowiedz uczciwie w pierwszym zdaniu do użytkownika: „tak, wyzwolił się" / „nie, musiałem go doczytać ręcznie". To pierwszy realny pomiar ryzyka R2 (auto-wyzwalanie skilli bywa zawodne). Wynik zapisz w DZIENNIKU w rytuale „Na koniec" — negatywny wynik jest cenniejszy niż pozytywny, bo zmienia projekt opisów skilli w tym etapie.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-07 o E1 (co realnie powstało i czego NIE zweryfikowano) |
| `docs/DECYZJE.md` | grupy: Dokumenty (D-10…D-19), Interakcja (D-20…D-27), Szablony (D-60…D-63) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcje 6 (struktura projektu użytkownika), 8 (opis E2), 13 (Aneks A) |
| `templates/README.md` + wszystkie `templates/SPEC_*.md` | konwencja specyfikacji z E1 — nowe pliki mają wyglądać tak samo |
| `skills/relai-core/SKILL.md` | stan skilla po E1; ten etap go rozszerza, nie pisze od zera |
| `docs/USTAWIENIA.md` | preferencje projektu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Szablony to **specyfikacje dla LLM**, nie pliki do kopiowania; dokumenty generowane w języku projektu, nazwy plików podążają za językiem (D-60, D-12).
- LEKCJE (`L-NNNN`: trigger / przyczyna / zasada, dopisywane **bez pytania** po każdej korekcie) i DECYZJE (`D-NN`) to **dwa osobne rejestry** (D-15).
- Graduacja: powtarzająca się lekcja awansuje do reguły w projektowym `CLAUDE.md`. Kompresja: okresowe zwijanie lekcji do sekcji „Zasady aktywne" — start sesji czyta **wyłącznie destylat** (D-15).
- DECYZJE: agent wykrywa powracający temat i **proponuje** zamrożenie; zatwierdza człowiek. Frazy typu „nie rób tego więcej" lądują w rejestrze automatycznie (D-16).
- DZIENNIK: wpisy dopisywane **na końcu** sekcji „Wpisy", z autorem w nagłówku (Aneks A pkt 4.4); sekcja ryzyk stała, na górze, nadpisywana; rotacja >50 KB lub kwartał (D-14).
- STATE: dwuwarstwowy, **NADPISYWANY**, zero historii (D-13).
- Aktualność docs = element definicji ukończenia zadania, w **tej samej turze** co zmiana (D-44).
- Archiwizacja zamiast kasowania: adnotacja „NIEAKTUALNE — zastąpione przez X, dnia Y, powód Z" + przeniesienie do `docs/archiwum/` (D-18).
- Ustawienia dwuwarstwowe: globalne `~/.claude/relai/` dziedziczone, projektowe `docs/USTAWIENIA.md` nadpisuje (D-23).
- Filozofia: wykryj intencję → zapytaj RAZ w naturalnym momencie → zapisz → respektuj. Bez ręcznego wywoływania skilli (D-22).
- Opisy skilli: po angielsku + **polskie frazy wyzwalające** (Aneks A pkt 4.3).
- Planowanie to E3, prompty etapowe E4, hooki E5, komendy operacyjne E7, adopcja E9. Nie wychodź poza zakres E2.

## Stan wyjściowy (co realnie zastajesz po E1)

Plugin **RelAI 0.1.0** w repo `github.com/nowilus/relai`, zainstalowany na tej maszynie (`relai@relai`, scope user):

```
.claude-plugin/{plugin,marketplace}.json   # manifesty, zwalidowane
skills/relai-core/SKILL.md                 # Krok 0 (4 stany folderu), init, tryb gościa,
                                           #   dołączenie niedestrukcyjne — WERSJA MINIMALNA
templates/README.md                        # indeks specyfikacji
templates/SPEC_CLAUDE_MD.md                # router ≤60 linii, sekcja niemutowalna, dobór modeli
templates/SPEC_README.md
templates/SPEC_STATE.md                    # dwuwarstwowy, nadpisywany
templates/SPEC_DZIENNIK.md                 # szablon wpisu, ryzyka, rotacja
templates/SPEC_USTAWIENIA.md               # marker `Wersja RelAI:`
templates/SPEC_KOMENDY.md                  # generowany ze stanu faktycznego
README.md                                  # opis pluginu + konwencja hook-guard
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** specyfikacji `LEKCJE` i `DECYZJE`, mechanizmu graduacji i kompresji, opisanej rotacji w praktyce, rytuału startu sesji jako zachowania skilla, rytuału zamknięcia, fraz naturalnych, warstwy ustawień globalnych.

**Lekcje z E1, które obowiązują w tym etapie:**
1. Specyfikacja bez sekcji „przykład" jest martwa — każda nowa `SPEC_*` kończy się realnym, kompletnym przykładem.
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa (`KOMENDY.md` 0.1.0 mówi wprost „komend nie ma"). Ta zasada obowiązuje dalej: nowe frazy wpisujesz do `KOMENDY.md` dopiero, gdy realnie działają.
3. Repo jest jednocześnie pluginem i projektem RelAI, więc `claude plugin validate --strict` zwraca ostrzeżenie o root `CLAUDE.md`. To świadomy stan — nie „napraw" go przenosząc `CLAUDE.md`.

## Zakres etapu

1. **Specyfikacja `templates/SPEC_LEKCJE.md`** — dokument `docs/LEKCJE.md`: format wpisu `L-NNNN` (trigger / przyczyna / zasada, data, źródło korekty), zasada dopisywania **bez pytania** po każdej korekcie użytkownika, sekcja **„Zasady aktywne"** jako destylat czytany na starcie sesji, próg i procedura **graduacji** (kiedy lekcja awansuje do reguły w `CLAUDE.md` — próg podaj liczbowo i oznacz jako SZACUNEK do strojenia), procedura **kompresji** (kiedy i jak zwijać lekcje, co się dzieje ze zwiniętymi), przykład z co najmniej trzema wpisami i wypełnioną sekcją „Zasady aktywne".
2. **Specyfikacja `templates/SPEC_DECYZJE.md`** — dokument `docs/DECYZJE.md`: format `D-NN`, grupowanie tematyczne, zasada „nie proponuj ponownie", procedura **wykrywania powracającego tematu i proponowania zamrożenia** (co liczy się jako powtórzenie, jak brzmi propozycja, że zatwierdza człowiek), automatyczne przechwytywanie fraz typu „nie rób tego więcej" / „ustalmy raz na zawsze", zmiana decyzji wyłącznie datowanym wpisem z powodem, przykład.
3. **Rozszerzenie `skills/relai-core/SKILL.md` o rytuały sesji:**
   - **Start sesji** w projekcie RelAI: kolejność czytania (CLAUDE.md → STATE → DZIENNIK: ryzyka + ostatni wpis → LEKCJE: wyłącznie „Zasady aktywne" → USTAWIENIA → aktywny plan), zakaz pełnotekstowego skanowania repo, jednoakapitowe podsumowanie „gdzie jesteśmy" dla użytkownika.
   - **Definicja ukończenia** jako zachowanie, nie deklaracja: zmiana funkcjonalna → aktualizacja `STATE.md` + wpis w `DZIENNIK.md` w tej samej turze, bez proszenia (D-44).
   - **Zamknięcie sesji**: sync dokumentów, wpis, podsumowanie.
   - **Reakcja na korektę użytkownika**: wpis do `LEKCJE.md` bez pytania; przy powtórzeniu — propozycja graduacji; przy powracającym temacie — propozycja zamrożenia decyzji.
4. **Frazy naturalne** (D-05, sekcja 5.3 planu) — obsługa trzech fraz w polskim i angielskim wariancie: „kończymy na dziś" / „wrapping up", „kontynuujemy pracę" / „let's continue", „sprawdź status" / „status check". Każda opisana w skillu jako konkretna sekwencja kroków, nie jako intencja. Frazy dopisz do specyfikacji `KOMENDY.md` **i** do sekcji zakresu wersji w `SPEC_KOMENDY.md` — od tej wersji realnie działają.
5. **Warstwa ustawień globalnych** (D-23): `~/.claude/relai/USTAWIENIA.md` — utworzenie przy pierwszym pytaniu, dziedziczenie przez nowe projekty, pierwszeństwo wpisu projektowego. Opisz w skillu i w `SPEC_USTAWIENIA.md`; format globalnego pliku analogiczny do projektowego.
6. **Aktualizacja generacji przy inicjalizacji**: nowy projekt dostaje od tej wersji także `docs/LEKCJE.md` i `docs/DECYZJE.md` (D-10). Zaktualizuj tabelę generowanych plików w skillu, `templates/README.md`, mapę dokumentacji w `SPEC_README.md` i przykład `KOMENDY.md`.
7. **Podbicie wersji do `0.2.0`** w `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` oraz w opisie zakresu w `README.md` pluginu i `SPEC_KOMENDY.md`. Wersja w markerze `USTAWIENIA` nowych projektów rośnie automatycznie.
8. **Dogfooding:** to repo prowadzi się według własnych zasad (D-82). Załóż `docs/LEKCJE.md` dla samego RelAI według świeżo napisanej specyfikacji i wpisz do niego lekcje z E1 i E2. `docs/DECYZJE.md` już istnieje — sprawdź zgodność ze specyfikacją i dopisz w DZIENNIKU, jeśli się różni (nie przepisuj rejestru).
9. **Git**: commity conventional EN (bez stopek atrybucji), push na `origin main`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Odpowiedź na pytanie o auto-wyzwolenie skilla podana w pierwszym zdaniu sesji i zapisana w DZIENNIKU.
- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (ostrzeżenie o root `CLAUDE.md` dopuszczalne); wersja `0.2.0` spójna w `plugin.json`, `marketplace.json` i README.
- [ ] Test na czystym folderze o ścieżce ze spacją i polskim znakiem: inicjalizacja generuje komplet **ośmiu** dokumentów (`CLAUDE.md`, `README.md`, `docs/{STATE,DZIENNIK,LEKCJE,DECYZJE,USTAWIENIA,KOMENDY}.md`), `LEKCJE.md` ma sekcję „Zasady aktywne", `USTAWIENIA` marker `Wersja RelAI: 0.2.0`.
- [ ] Sesja testowa ze **zmianą kodu** w tym folderze: `STATE.md` i wpis w `DZIENNIK.md` powstają **bez proszenia**, w tej samej turze (kryterium E2 z planu). Jeśli nie powstają — to jest defekt do naprawy w tym etapie, nie obserwacja do zapisania.
- [ ] Test korekty: użytkownik poprawia agenta → wpis `L-NNNN` w `LEKCJE.md` bez pytania; powtórzenie tej samej korekty → propozycja graduacji do `CLAUDE.md`.
- [ ] Test frazy „kończymy na dziś" i „kontynuujemy pracę" — obie wykonują opisaną sekwencję; obie widnieją w wygenerowanym `KOMENDY.md`.
- [ ] Wpis dopisany na **końcu** sekcji „Wpisy", z autorem w nagłówku; sekcja ryzyk pozostaje na górze pliku.
- [ ] Foldery testowe posprzątane.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, wpis w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", autor: RelAI (Opus). Zaktualizuj status ryzyka R2 wynikiem testu auto-wyzwalania.
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze: na bazie PLAN sekcja 8 (E3 — planowanie: skill `relai-planning`, wykrycie intencji planowania z naturalnego prompta, pytanie o rodzaj/format/model wykonawczy z utrwalaniem preferencji wg Aneksu A, struktura pełnego PLAN-u, MINIPLAN w DZIENNIKU, `STATUS.md`, zamrożenie po akceptacji + aneksy datowane, plany w MD — szablon HTML dopiero w E6) + realny stan po E2 + lekcje z tego etapu. Format: dokładnie jak ten prompt (kontrola modelu, co przeczytać, decyzje, stan wyjściowy, zakres, weryfikacja, „Na koniec").
5. Commit + push.
