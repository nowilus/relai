# PROMPT_ETAP_2 — Rotacja dokumentów: archiwum dziennika i lekcji (RelAI 1.2.0)

Plan: ROZWOJ_PO_WYDANIU • Etap: **E2 z E8** • Wygenerowano: 2026-08-12 (autor: Opus, w rytuale
„Na koniec" etapu E1) • Wykonawca: **Opus** (linia metryczna STATUS.md: „Opus — z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (R5 jest ryzykiem tego etapu) + ostatni wpis (E1 — co powstało i czego NIE zmierzono) |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 5 „Rotacja dokumentów" (przebieg 1–5), sekcja 6 (zakres E2), sekcja 8 (trzy przypadki brzegowe rotacji), sekcja 10 (Aneks A — zgoda na auto-rotację w istniejących projektach) |
| `templates/SPEC_DZIENNIK.md` | co w dzienniku zostaje, a co może odejść; format wpisu — rotacja nie ma prawa go naruszyć |
| `templates/SPEC_LEKCJE.md` | rola destylatu „Zasady aktywne" wobec pełnych lekcji |
| `templates/SPEC_USTAWIENIA.md` | tu dopiszesz progi i wyłącznik rotacji |
| `templates/SPEC_STATE.md` | STATE jest nadpisywany, nie archiwizowany — stąd inny tryb dla niego |
| `skills/relai-core/SKILL.md` | rytuał zamknięcia sesji („kończymy na dziś") — tam wchodzi rotacja |
| `commands/relai-update.md` | tabela stanu docelowego — tu wchodzi włączenie rotacji w istniejących projektach |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Rotacja jest **automatyczna, w rytuale zamknięcia sesji** („kończymy na dziś") — decyzja
  użytkownika z wywiadu 2026-08-12, sekcja 5 planu. Nie robisz z niej osobnej komendy.
- **Progi startowe** (SZACUNEK, kalibracja jest częścią tego etapu): dziennik ponad 150 KB, LEKCJE
  ponad 60 lekcji, STATE ponad 300 linii. Progi i **wyłącznik** mieszkają w `USTAWIENIA.md`, więc
  projekt może rotację wyłączyć.
- **Operacja jest dwufazowa:** najpierw kopia do archiwum i weryfikacja sum, dopiero potem
  przycięcie żywego pliku. Przerwanie między fazami zostawia oryginał nietknięty (sekcja 5 planu).
- **Przenosisz w całości, bajt w bajt.** Najstarsze wpisy dziennika idą do
  `docs/archiwum/dziennik/DZIENNIK_<od>_<do>.md`; w żywym pliku zostaje **linia-odsyłacz**. Nic nie
  jest streszczane ani kasowane (D-18).
- **Co zostaje zawsze:** tabela „Stan otwartych ryzyk" i najnowsze wpisy dziennika; w LEKCJACH cały
  destylat „Zasady aktywne" — do archiwum idą wyłącznie pełne uzasadnienia najstarszych lekcji.
- **STATE nie jest archiwizowany** — jest nadpisywany zwięźlej; z definicji nie ma historii.
- **Poniżej progu: cisza.** Zero komunikatów, zero pytań — rotacja nie przypomina o swoim istnieniu
  (sekcja 8 planu).
- **Wpisy z otwartymi pozycjami „Do zrobienia przez człowieka" nie podlegają rotacji** niezależnie
  od wieku — najpierw rozstrzygnięcie, potem archiwum (sekcja 8 planu).
- **Auto-rotacja w istniejących projektach** (JiraManager, PolyFlow) przy `/relai-update`:
  **zgoda użytkownika jest** (Aneks A, 2026-08-12). Nie pytasz o nią ponownie.
- Wersja tego etapu: **1.2.0**. Numer żyje w `plugin.json`, `marketplace.json`, obu skillach,
  `/relai-update` i `SPEC_KOMENDY` — L-0008 obowiązuje.
- **Granica zakresu:** poprawki z retrospektywy (decyzje po adopcji, spójność STATE/STATUS, podpisy,
  bramki) to E3; rdzeń przenośny i pre-commit to E4 — niczego z nich nie zaczynasz i nie obiecujesz
  w dokumentach użytkownika (L-0002).

## Stan wyjściowy — co realnie zastajesz

RelAI **1.1.0** wydany 2026-08-12 i zainstalowany (scope `user`); `installed_plugins.json` pokazuje
`1.1.0` z `gitCommitSha e6b41dc` (FAKT). Etap E1 zamknięty: doszła dziesiąta komenda
`/relai-branch`, specyfikacja odnogi, sekcja „Odnogi" w `STATUS.md`, sygnał odchylenia w skillu
planowania i reguła sygnału w `SPEC_CLAUDE_MD.md`. Po każdej zmianie skilla obowiązuje sekwencja
push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → **restart
aplikacji** (L-0031).

**Dwie odnogi planu są OTWARTE** i czekają na własne sesje — nie wykonujesz ich w tym etapie:
`OPIS_REPO` (opis repozytorium na GitHubie) i `POMIAR_ODNOG` (niedomknięty punkt 8 weryfikacji E1).

```
.claude-plugin/plugin.json      # manifest, wersja 1.1.0
.claude-plugin/marketplace.json # marketplace, wersja 1.1.0
skills/relai-core/SKILL.md      # rytuały sesji — tu jest „kończymy na dziś", które dostanie rotację
skills/relai-planning/SKILL.md  # plany, odnogi, sygnał odchylenia
commands/                       # 10 komend: adopt, audit, backup, branch, changelog, handover,
                                #   help, stage, tour, update
hooks/                          # 9 hooków Node bez zależności + hooks.json
templates/                      # 20 SPEC_*.md + README + HTML_PLAN/
docs/DZIENNIK.md                # dziennik tego projektu — pierwszy kandydat do rotacji; rozmiar ZMIERZ, nie przepisuj
docs/LEKCJE.md                  # 33 zasady aktywne + pełne lekcje L-0001…L-0033
docs/archiwum/plany/            # jedyne dzisiejsze archiwum: zamknięty plan BUDOWA_RELAI
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnego mechanizmu rotacji — ani progów
w `USTAWIENIA.md`, ani wyłącznika, ani specyfikacji archiwum dziennika i lekcji, ani kroku rotacji
w rytuale zamknięcia sesji, ani katalogu `docs/archiwum/dziennik/`. Dziś rozrost dokumentów wykrywa
wyłącznie `/relai-audit` (próg 50 KB) i mówi o nim człowiekowi — nikt nic z tym nie robi.

**Liczby zmierz sam.** Rozmiary dzienników JiraManagera i PolyFlow potrzebne do kalibracji progów
**odczytaj z dysku w dniu etapu**; w dokumentach projektu krążą dwie różne wartości dla
JiraManagera (124 KB we wpisie E10, 318 KB w sekcji 9 planu) i przepisanie którejkolwiek bez pomiaru
byłoby zgadywaniem (D-63).

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest
   martwa. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do
   `KOMENDY.md` dopiero w wersji, w której realnie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Zachowania skilli mierzysz **realnie** — świeżą sesją `claude -p … --output-format
   stream-json` i liczbą wywołań narzędzia `Skill`. Po zmianie skilla: push → `claude plugin
   marketplace update relai` → `claude plugin update relai@relai`, inaczej mierzysz starą
   wersję. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta w skillu, sprawdź, czy da się je zweryfikować z wnętrza
   sesji wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt": zanim zapytasz, sprawdź
   `USTAWIENIA.md` i warstwę globalną. (L-0006)
7. Test zakazu wymaga dowodu negatywnego: pokaż, że chroniony fragment ma nadal pierwotne
   brzmienie. (L-0007)
8. Po podbiciu wersji pluginu przepuść repo `grep`-em po starym numerze i rozstrzygnij każde
   trafienie. (L-0008)
9. Opis skilla/komendy zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy dosłownych
   fraz wyzwalających. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. (L-0010)
11. Odesłanie do pliku specyfikacji nie wystarcza: struktura, której wymagasz, musi być wypisana
    w treści skilla. (L-0011)
12. Katalog pluginu jest dla sesji niedostępny — mechanizm czytający stamtąd wymaga zapasowej
    ścieżki (kopia `.claude/relai/templates/`). (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania: zawsze istnieje poprawna wartość tymczasowa;
    martwy link nie jest poprawny nigdy. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. (L-0014)
15. Komenda wywołana wprost nie ładuje skilla, do którego się odwołuje — procedurę wpisujesz do
    komendy albo każesz jej jawnie wczytać skill. (L-0015)
16. Komunikaty hooków są celowo ASCII. (L-0016)
17. Działanie hooka dowodzisz efektem, nie zdarzeniem w transkrypcie; payloady testowe buduj
    Nodem. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz, nie na przewidywanym formacie
    cudzego narzędzia. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief; przy zadaniu wizualnym najpierw cechy pozytywne
    i jeden wariant do kalibracji. (L-0019)
20. Zainstalowaną wersję pluginu potwierdzasz `installed_plugins.json` (`version` i
    `gitCommitSha`) albo treścią skilla w cache'u — nie `claude plugin details`. (L-0020)
21. Narzędzie systemowe rozstrzygające o formacie artefaktu wywołuj pełną ścieżką i sprawdzaj
    wynik, nie kod wyjścia. (L-0021)
22. W dokumencie użytkownika podajesz zmierzoną formę wywołania: `/relai:relai-<nazwa>`. (L-0022)
23. Krok sięgający poza katalog roboczy ma zapisane wyjście po odmowie dostępu. (L-0023)
24. Sesja pomiarowa `claude -p`: prompt z polskimi znakami przez **stdin**, zapis plików wymaga
    `--permission-mode acceptEdits`. (L-0024)
25. Wartość czytana maszynowo dopasowuje się do kotwicy (początek komórki); nierozpoznana znaczy
    cisza, nigdy zgadywanie. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów — specyfikacja ma ścieżkę „pytam zamiast
    zmyślać" z formą `<DO UZUPEŁNIENIA: …>`. (L-0026)
27. Plików z polskimi znakami nie przepuszczasz przez PowerShell 5.1 — dopisujesz Write/Edit albo
    Nodem. (L-0027)
28. Sesja pomiarowa z narzędziami systemowymi potrzebuje `--allowedTools "Bash"` obok
    `acceptEdits`. (L-0028)
29. Komponent opcjonalny musi dać się pominąć bez śladu — żadnych pustych wypełniaczy. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w `CLAUDE.md` projektu — skill dokłada
    procedurę, warstwa w kontekście niesie regułę. (L-0030)
31. `claude plugin update` nie działa od razu: do restartu aplikacji sesje ładują stary cache.
    Po wydaniu: restart, potem pomiar. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json`, **niezależnie
    od konta zalogowanego w aplikacji** — konto i limit sprawdzasz przed pomiarem, a wyczerpany
    limit jest powodem zatrzymania, nie odtwarzania procedury ręcznie. (L-0032)
33. Sumy kontrolne plików wędrujących przez git porównuj po normalizacji końców linii — cache
    pluginu jest klonem z CRLF, a katalog roboczy trzyma LF. (L-0033)

## Zakres etapu

1. **`templates/SPEC_ARCHIWUM.md`** (nowy) — specyfikacja archiwum:
   `docs/archiwum/dziennik/DZIENNIK_<od>_<do>.md` i `docs/archiwum/lekcje/LEKCJE_<od>_<do>.md`.
   Nagłówek z zakresem dat i sumą kontrolną przeniesionej treści, zawartość **bajt w bajt**, format
   linii-odsyłacza zostającej w żywym pliku. Z realnym, kompletnym przykładem (L-0001).
2. **`templates/SPEC_USTAWIENIA.md`** — wiersze rotacji: trzy progi i wyłącznik, z wartościami
   domyślnymi i jawnym zapisem, że projekt może je nadpisać. Zaktualizowany przykład na końcu
   specyfikacji.
3. **`templates/SPEC_DZIENNIK.md`** i **`templates/SPEC_LEKCJE.md`** — sekcje o rotacji: co zostaje
   zawsze (tabela ryzyk, najnowsze wpisy, cały destylat „Zasady aktywne"), co odchodzi, jak wygląda
   linia-odsyłacz i dlaczego wpisy z otwartymi pozycjami „Do zrobienia przez człowieka" są
   nietykalne.
4. **`skills/relai-core/SKILL.md`** — rotacja jako krok rytuału zamknięcia sesji: warunek
   (przekroczony próg), przebieg **dwufazowy** wypisany wprost w treści skilla (L-0011), zachowanie
   poniżej progu (cisza) i wpis w dzienniku po każdej rotacji z sumami kontrolnymi.
5. **`commands/relai-update.md`** — wiersz stanu docelowego: projekt aktualizowany do 1.2.0 dostaje
   wiersze rotacji w `USTAWIENIA.md` (Aneks A: zgoda jest). Wiersze już obecne — nie nadpisujesz.
6. **`templates/SPEC_KOMENDY.md`** — zachowanie automatyczne w sekcji „Czego RelAI pilnuje bez
   proszenia", opisane efektem, nie mechaniką.
7. **Kalibracja progów** — zmierz rozmiary dzienników w JiraManagerze i PolyFlow **na dysku**
   i rozstrzygnij, czy 150 KB / 60 lekcji / 300 linii to progi właściwe. Wynik kalibracji (z liczbami
   i etykietą FAKT) idzie do wpisu w dzienniku; zmieniona wartość — do specyfikacji.
8. **Wersja 1.2.0**: `plugin.json`, `marketplace.json`, nagłówki obu skilli, `/relai-update`,
   `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README, marker tego repo; `grep` po
   `1.1.0` i rozstrzygnięcie każdego trafienia (L-0008).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate` → „Validation passed"; jedyne ostrzeżenie to znane root
      `CLAUDE.md` (L-0003).
- [ ] Numer 1.2.0 spójny we wszystkich miejscach z punktu 8; `git grep -n "1\.1\.0"` zwraca
      wyłącznie trafienia historyczne.
- [ ] **Rotacja przenosi bajt w bajt:** na projekcie testowym z dziennikiem ponad progiem suma
      kontrolna przeniesionych wpisów w archiwum jest identyczna z sumą tych samych wpisów przed
      rotacją, a żywy plik zawiera linię-odsyłacz do właściwej ścieżki.
- [ ] **Dowód dwufazowości:** przerwanie po fazie 1 (kopia istnieje, przycięcia nie było) zostawia
      żywy plik z **nienaruszoną** sumą kontrolną — dowód negatywny (L-0007).
- [ ] **Cisza poniżej progu:** sesja zamykająca projekt z dziennikiem poniżej progu nie wypisuje
      o rotacji ani słowa i nie tworzy katalogu `docs/archiwum/dziennik/` (dowód: drzewo plików
      przed = po).
- [ ] **Wpis z otwartą pozycją „Do zrobienia przez człowieka" zostaje** mimo wieku i mimo
      przekroczonego progu — sprawdzone na projekcie testowym z takim wpisem najstarszym.
- [ ] **Wyłącznik działa:** projekt z rotacją wyłączoną w `USTAWIENIA.md` przechodzi rytuał
      zamknięcia bez rotacji i bez komunikatu.
- [ ] Tabela „Stan otwartych ryzyk" i destylat „Zasady aktywne" są po rotacji nietknięte
      (sumy kontrolne obu fragmentów przed i po).
- [ ] Kalibracja progów wykonana na **zmierzonych** rozmiarach JiraManagera i PolyFlow; liczby
      z etykietą FAKT we wpisie dziennika.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" (komplet czterech sekcji), `docs/STATE.md`
      nadpisany, `templates/SPEC_KOMENDY.md` z nowym zachowaniem; foldery testowe poza repozytorium.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_3.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcji „Odnogi"
   **nie ruszasz** — chyba że w trakcie etapu któraś została domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę ryzyk — **R5 (dokumenty puchną) jest
   ryzykiem tego etapu**: rozstrzygnij, czy rotacja je zamyka, czy obniża poziom. Lekcje z etapu →
   `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje o stanie pluginu (wersja 1.2.0, rotacja).
4. **Wygeneruj `PROMPT_ETAP_3.md`** (poprawki z retrospektywy) ze specyfikacji promptu etapowego:
   na bazie sekcji 6 (E3) planu, realnego stanu repo po tym etapie i lekcji z tego etapu.
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi sekwencję:
   push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → restart
   aplikacji (L-0031).
