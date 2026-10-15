# PROMPT_ETAP_4 — Odbiór całości na żywo i wydanie pasków oraz panelu

Plan: WYGLAD_PANELU • Etap: **E4 z E4** • Wygenerowano: 2026-10-15 (autor: Opus 5.5, w rytuale „Na koniec” etapu E3) • Wykonawca: **Opus 5.5, świeże sesje** • `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (macierz na żywo w dwóch wyglądach i trzech szerokościach, wydanie czterech pluginów
> z tagami i pushem; błąd tutaj trafia do użytkowników; plan nie podaje poziomu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/plany/WYGLAD_PANELU/PLAN.html` | sekcje 6 (E4), 7 (ryzyka 5 i 6), 9 (zgoda na wydanie — sprawa człowieka), 10 (Aneksy C–F: co wychodzi w tym wydaniu) |
| `docs/DZIENNIK.md` — wpisy „WYGLAD_PANELU E1”, „E2”, trzy wpisy „E3” oraz „Aneks C”, „Aneks D” | co jest w repo bez wydania, co świadomie odłożono do E4, słowa akceptacji Łukasza |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` (całość, wersja 1.1) | źródło wyglądu panelu i pasków; lista kontrolna przed oddaniem — macierz sprawdzasz według niej |
| `docs/zasoby/PANEL_RELAI/narzedzia/README.md` | zrzuty panelu bez człowieka (UI Automation + PrintWindow): parametry `-Tab`, `-Press`, `-UnfoldAll`, `-Scroll`, `-Out`, warunki (okno nie zminimalizowane) |
| `docs/PULAPKI.md` — P-044, P-043, P-042, P-041, P-024, P-023 (pkt 7) | kanapka i ramka w `Svg`; układ jak CSS; wygląd widzą klucze i `Svg`; pole „następny krok” zasłania paski; binarka aplikacji; próg drzewa w elementach |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — nagłówek wersji, §3, §13, §14 | brief 4.2 — w tym etapie dostaje nową wersję główną |
| `.claude-plugin/marketplace.json`, `*/.claude-plugin/plugin.json`, `README.md` (sekcja o panelu „early access”) | gdzie stoją numery wersji czterech pluginów i opis dla użytkownika |
| `git show --stat relai-panel-v0.17.0` i `git show --stat v3.1.0` | jak wyglądały dwa ostatnie wydania: które pliki dostają numer, jaki tag, jaki opis tagu |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Paski (E1):** `Box`/`Text` w kluczach motywu, znaczniki `Svg` z dwiema paletami przez
  `prefers-color-scheme`, wariant 3b z linią gasnącą, przyciski `primary` (Aneks B, P-042).
- **Pasek postępu (E2):** lista kroków, jasny „J3 miękki”, zwijanie tekstem, zrobione od lewej,
  kręcenie tylko przy pracy modelu — akceptacja „Akceptuje”.
- **Panel (E3, Aneksy E–F):** szata idzie za wyglądem aplikacji sama, bez przełącznika; wariant 3 ·
  jedna kartka z ramką `subtle` na każdej zakładce, kartka wypełniona bez szczeliny (ramka
  w rysunku `Svg`, kawałki po 4000 px), `DRAW_LIMIT` 1 200 z bezpiecznikiem; akceptacja „jest ok
  juz nie bede pokazywal ale jest ok”. Reguły w `DESIGN.md` 1.1 — nie projektujesz wyglądu od nowa.
- **Karta startu `/relai-stage` (Aneksy C–D)** jest w repo (commity `a88ab8a`, `b03fdfb`) i wychodzi
  razem z tym etapem: do trzech pluginów panelu dochodzi plugin `relai` (minor).
- **Wydanie, tagi i push wyłącznie po zgodzie Łukasza** (PLAN sekcja 9) — zgoda na kartę z numerami
  wersji, listą zmian i listą plików; „ruszamy” na start etapu nie jest zgodą na wydanie.
- **Granica zakresu:** E4 sprawdza całość na żywo, poprawia **tylko rozjazdy znalezione w macierzy**
  (każda poprawka z testem, który spada na kodzie sprzed niej), podbija brief i wydaje. Nowy wygląd,
  nowe elementy i typografia (ryzyko 8) — poza zakresem; potrzeba → sygnał odchylenia. To ostatni
  etap planu: zamiast promptu następnego etapu — sekwencja zamknięcia planu.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.1.0 wydany. W repo, **niewydane**: `relai-panel` 0.18.0 (odnoga PANEL_WASKI) + zmiany E1
i E3, `relai-progress` 0.4.2 + E1 i E2, `relai-cache-keeper` 0.9.0 + E1, plugin `relai` 3.1.0 +
Aneksy C–D. Zainstalowane u Łukasza: `relai-panel` 0.17.0, w którego katalogu
`~/.claude/plugins/cache/relai/relai-panel/0.17.0/hooks` leży kod z repo po E3 (podłożony ręcznie,
kopii oryginału już nie ma — oryginał to tag `relai-panel-v0.17.0`); `relai-progress` 0.4.2 i
`relai-cache-keeper` 0.9.0 z kodem E1–E2 podłożonym w E1–E2. Aplikacja z Claude Code 2.1.295;
testy binarką `$APPDATA/Claude/claude-code/2.1.295/d2e29494ec83/claude.exe` (`plugin validate .`,
`plugin test .`; na PATH inna wersja — P-024). Zrzuty robisz sam skryptami z
`docs/zasoby/PANEL_RELAI/narzedzia/`; przełączenie wyglądu aplikacji (jasny/ciemny) i zmianę
szerokości panelu robi Łukasz — poproś go jednym zdaniem i zakończ turę zwykłym tekstem (P-041).

```
core/panel/theme.mjs          # ROOT, THEME, SHEET (+ edge), SHEET_DRAW, sheetTopSvg/MiddleSvg/EndSvg, SVG_LIGHT, TONE_OF, KEY/INK; SEGMENT_INK nieużywany od E2
core/panel/tests/theme.test.js # kontrast par obu szat ≥ 4,5 : 1 z kontrolą pozytywną, rysunek kartki
panel/hooks/pane-parts.tsx    # sheet() (kanapka, bezpiecznik bez wypełnienia), folded(), DRAW_LIMIT, treeWeight()
panel/hooks/skin.ts           # rekey (ukryta kopia bez farb), retone, visible, hollow
panel/hooks/register.tsx      # paneOf(isFilled): waga drzewa ≤ DRAW_LIMIT → kartka wypełniona, inaczej sama ramka
panel/hooks/pane-*.tsx        # pięć zakładek: Komendy, Koszty, Dokumenty, Mapa, Pomoc (ściąga zwinięta)
panel/hooks/*.test.ts         # 197 testów (skin, map, redraw, narrow, pane-v2, limit-card…)
progress/hooks/               # pasek postępu (steps.tsx) i panel agentów /relai-agents — 41 testów
cache-keeper/hooks/           # pasek cache — 181 testów
docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E3_r6…r8_*  # zrzuty E3: obie szaty, rozwinięte, wąski 530 px
docs/zasoby/PANEL_RELAI/narzedzia/  # zrzut-panelu.ps1, lupa.ps1, okno.ps1, nazwy.ps1, README.md
```

Liczby (FAKT, 2026-10-15): rdzeń `core/` 409 testów, panel 197, progress 41, cache-keeper 181;
`sync-panel-core.js --check` zgodne. Dziennik ok. 138 KB z progu 150 KB, `LEKCJE.md` 48,1 KB
z progu 50 KB — wpis E4 i nowe lekcje mogą przekroczyć próg; rotację robi narzędzie rotacji, gdy
start sesji o niej powie.

**Czego jeszcze nie ma (to jest zakres tego etapu):** macierzy na żywo całego zestawu (paski
i panel × jasny i ciemny × trzy szerokości) w jednym przebiegu; sprawdzenia panelu agentów
`/relai-agents` w jasnym wyglądzie (odłożone z E3); usunięcia `SEGMENT_INK` (odłożone z E2);
briefu w nowej wersji głównej; wydania czterech pluginów.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-15):**

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma ścieżkę „pytam zamiast zmyślać"
   z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie dokumentów** — „stare
   brzmienie nie zwraca nic" puszczasz na katalogu specyfikacji; trafienie poza zakresem etapu to
   sygnał odchylenia, nie usterka weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej
   pisania** — rozjazd to defekt reguły, nie wyjątek do obejścia. **Reguła produkująca tekst opisuje
   początek wiersza i to, czego w nim nie ma** — model domyka lukę formatem materiału pod ręką;
   materiał sprzed poprawki reguły zostaje obok materiału po niej.
   **Linia raportu poświadczająca krok bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem** — stanem pliku, sumą, treścią odpowiedzi; kryterium na
   stanie, który kontrolujesz, i na źródle, które artefakt produkuje. Zmianę zachowania pokazujesz
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu, na materiale, który stara
   wersja psuje (L-0191).
   - **Kryterium:** na poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz;
     sprawdzone na materiale **przed** pracą (także przez autora promptu) — arytmetycznie
     nieosiągalne wraca do człowieka jako aneks. Etap przenoszący treść liczy metrykę na całym
     pakiecie. Liczenie wywołań narzędzia zaczynasz od listy narzędzi w `init`. Wyszukiwanie
     wzorca omija pliki, które go cytują. Tekst tłumaczący liczbę ma warunek prawdziwości i test
     stanu docelowego (L-0144).
   - **Materiał:** test na realnym pliku zmienianym przez proces sam ustawia stan wyjściowy,
     licznik do dziennika z przebiegu po ostatniej zmianie (L-0150); plik śledzony albo własna
     fixtura, nigdy z `.gitignore` (L-0156); przed pytaniem o zasięg sprawdzasz, czy plik nie jest
     generowany (L-0154); zmianę dowodzisz na widoku, który obejmuje jej rekordy (L-0155); test
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186); element
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195).
   - **Na żywo:** widok z danych projektu mierzysz w najgorszym stanie i ograniczasz w kodzie
     (L-0158); diagnoza zaczyna się od znacznika wersji w logu (L-0159); „przed” w dwóch
     przebiegach — stary kod i stary kod z nową czystą logiką (L-0165); animacja z danych procesu
     na stanie pośrednim z lukami (L-0175); chwila z przeszłości liczona kodem z jej commitu (L-0177);
     artefakt weryfikacji renderowany od nowa, wszystkie warianty razem (L-0182); parser pola
     opisanego prozą — na każdym zapisie rodziny i przykładzie specyfikacji, stary i nowy kod
     obok siebie (L-0184).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`) (L-0116, L-0119, L-0135, L-0148, L-0188, L-0192, L-0198);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
   - **Kontrola pozytywna:** zero trafień przy niepustych zbiorach to defekt instrumentu do czasu
     dowodu, a trafienie na materiale dotąd zdrowym sprawdzasz najpierw na instrumencie; scenariusz
     „konfiguracji nie ma” mierzysz z podstawionym katalogiem domowym; dokładasz przypadek, który **musi** trafić, na **tym samym wejściu**, którego mechanizm
     naprawdę pilnuje (nie z jego listy wyłączeń); przebieg „oczekuję ciszy" ważny tylko z kontrolą
     pozytywną w tym samym przebiegu; obok wzorca licznik „ile odrzucono” i „ile bez pary”;
     generator identyfikatorów sprawdzasz na wszystkich kandydatach; wartość podkładaną — wobec
     zbioru dozwolonego (L-0173); kontrola negatywna zmienia mierzoną wielkość, nie jej obraz (L-0181).
   - **Parsowanie:** separator niepoprzedzony znakiem ucieczki i liczba pól po podmianie; zbiór
     znaków zachowywanych wypisany raz; filtr „to nie przypadek” ma wyjątek dla linii o rzeczy
     sprawdzanej; każdy przypadek graniczny ma własną kontrolę; nazwy narzędzi w cudzym
     transkrypcie wypisujesz, zanim orzekniesz brak.
   - **Porównania:** instrument dwóch drzew odtwarza materiał przed każdym wariantem i dowodzi
     nietkniętości; wynik wynosisz od razu, z sumą; porównanie najpierw sprawdza istnienie obu
     wejść, a oba pliki kasuje przed przebiegiem (L-0143); stan „przed” w `git worktree` HEAD-a, nie
     po `stash` (L-0151); bez `append` — plik na proces (L-0141).
   - **Cudze usługi i dane:** niedostępność sprawdzasz jednym tanim wywołaniem, zanim odpiszesz
     pomiar; „działało wczoraj” też jest hipotezą; wniosek z czasu zepsutego artefaktu datujesz jego
     wersją; wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
     „sprawdzone inaczej”.
   - **Liczenie treści:** dwa liczniki — wąski (własny wzorzec, przez wykluczenie znaku
     otwierającego) i szeroki z kontrolą przeciw zawyżeniu; najpierw kształt odpowiedzi, potem
     jakość, z mianownikiem; różnica przebiegów tylko ponad zmierzony szum; agregat odsiewa elementy
     innej klasy jawnym progiem; czytelność klatek — tylko klatki ustalone, oba kontrasty, korpus =
     materiał źródłowy.
   - **Przebieg:** scenariusz „czegoś nie ma” z listą mechanizmów, które to tworzą (inaczej
     fixtura); limit tur na cały łańcuch i kod wyjścia każdej sesji; podłożony hook — `node --check`
     i licznik wstrzykniętego zdania (L-0127); nowa kontrola spójności najpierw na zastanym
     materiale, cisza podejrzana do pokazu na podłożonym defekcie; po historii commitów trafienia
     dzielisz na „naprawione później” i „nigdy” (L-0131); skrypt cięcia sprawdza cały blok i idzie
     kompilator (L-0160); wklejka dowodzona licznikiem nagłówków i porównaniem ze źródłem (L-0164);
     operacja na zakresie normalizuje tylko styk, reszta nietknięta (L-0169); fixtura ewaluacji
     niesie środowisko czytane przez hooki (L-0170).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181)
6. **Próg jest liczbą, którą ktoś liczy:** kalibrujesz na realnych plikach, zapisujesz w jednostce
   mechanizmu z komendą sprawdzającą, z **jednym** wyzwalaczem. Porównujesz do wielkości, którą
   mechanizm kontroluje (część usuwalna); zatkanie sygnalizuje **różnica możliwego i wykonanego**,
   nie zero wykonanego; reguła „najstarszy element” w mechanizmie od najstarszego zatyka go
   z definicji. Liczba zbioru liczona także w komunikacie sukcesu. Odejmowana stała to hipoteza —
   nierzetelne odjęcie oznaczasz. Próg wspólny sprawdzasz na każdej wielkości z osobna (L-0167).
   Karta zgody na zależność podaje wielkość na dysku (L-0172).
   (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** od początku komórki, wybór
   linii po wartości, nierozpoznane = cisza. Rdzeń z diakrytykami łapiesz klasą znaków języka, nie
   `\w`, i tylko w brzmieniu wartości, nie w całej komórce. Koszt zamkniętej listy (pozycje, które
   człowiekowi wyglądają na rozpoznane) mierzysz; poszerzenie to decyzja człowieka.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** (`CLAUDE.md`
   albo hook); skill wyzwala się zawodnie. Sygnał jednorazowy ma jednego właściciela. Stan pisany
   przez model: plik na zapisującego, bez scalania. Zapis w warstwie niższej niż plik tej sesji
   kasuje ten plik i mówi, która warstwa rozstrzyga po zapisie (L-0187). Fakt rozstrzygnięty idzie
   do subagenta jako rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik
   doczytywany dla klasy `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy
   frazie z promptu; krok wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128, L-0187)
9. **Skill nie zakłada dostępu poza katalogiem roboczym**; opis ≤ 1 024 znaki, trzecia osoba, co
   i kiedy, marker projektu i płaska lista fraz, bez `MUST BE USED`; krok sięgający dalej ma
   wyjście po odmowie. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; zachowanie — świeżą
    sesją; po podbiciu `grep -r` po starym numerze i każde trafienie rozstrzygasz (historyczne vs
    deklaracja stanu, także w komendach i skillach). Niewydane mierzysz artefaktem podłożonym
    lokalnie pod **inną nazwą**; cały plugin — `--plugin-dir` z wyłączoną instalacją i ścieżką
    w `init`. Wydanie zestawia zmiany artefaktów z `ARTEFAKTY.md` i `git ls-files` z listą
    generowanych (L-0161). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący nie-sekret to defekt rdzenia** — poprawka z dowodem, nie obejście;
    wołany przez opakowanie powłoki (brak interpretera = blokada); próbki sekretów składane
    w czasie wykonania; cudzysłów (także backtick) należy do grupy cudzysłowu, nie do wartości.
    (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload po
    zdjęciu BOM, bez założeń o nazwach pól; CLI z powłoki natywnej; brak sygnału konfrontujesz
    z warunkiem milczenia; nieprzyjęty artefakt — najpierw jego walidator albo widok statusu.
    - **Mody:** zielone `validate`, typy i testy nie dowodzą zachowania w łańcuchu — mierzysz na
      żywo, ciszę sondą (licznik hooka, wynik `next`) (P-017); `$` i `on` tylko w pliku modułu
      hooków, na zewnątrz czysta logika; typy mówią, co powierzchnia przyjmie, nie co niesie —
      gałąź po polu powierzchni z wejścia, test na obecność odpowiednika; każde drzewo przez
      `plugin test` z montażem i kliknięciem przed pokazem na żywo; korzeń projektu w górę od
      zmiennego cwd, test w podfolderze (L-0146).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu.
    - **Układ:** kompozycja z tekstem w warstwie, która liczy układ (HTML `grid`/`flex`, `overflow`),
      ręczne współrzędne tylko dla dekoracji; dziecko poza kontenerem blokuje, a instrument
      prostokątów ma kontrolę na podłożonym przepełnieniu; rysunek do człowieka po renderze
      w Chromium z pomiarem (L-0142); kryterium w warunkach odbiorcy (szerokość, wysokość glifów);
      uwaga „za niski / krzywo” najpierw pomiarem zrzutu, równe piksele przy powtórzonej uwadze to
      kontrast — pomiar i wybór zamiast kolejnej rundy (L-0196); tekst ucinany w modzie stoi
      w pudełku o bazie zerowej (`width={0}` + `flexGrow`), próba wyglądu startuje na
      najdłuższych realnych danych (L-0197).
    - **Nośnik:** na ograniczonym zestawie elementów sonda ustala pułap przed projektem, warianty
      w tym samym nośniku, różne już w stanie domyślnym (L-0197), ograniczenie mówione wprost;
      animacja znaczy trwającą czynność i ma źródło w sygnale narzędzia, wskaźnik postępu rośnie
      od lewej (L-0199); nowy element zbioru różnisz kształtem,
      porównanie na całym zbiorze w skali docelowej; plan z interfejsem wskazuje źródło motywu
      w pierwszym etapie, który rysuje więcej niż linię. Ostrzeżenie `plugin validate` o root
      `CLAUDE.md` jest skutkiem dogfoodingu — nie naprawiasz. Z zaakceptowanego wariantu
      przenosisz kształt, nie same barwy, i porównujesz wynik z jego zrzutem (L-0200); walidator,
      `plugin test` z montażem i zrzut to trzy osobne dowody, `Svg` zawsze z `alt` (L-0201);
      mechanizm mnożący drzewo — najpierw test budżetu na najgorszych danych (L-0202). Wygląd
      panelu i pasków: `docs/zasoby/PANEL_RELAI/DESIGN.md` przed każdą zmianą.
    - **Liczby i słowa:** procenty i kwoty z dwoma miejscami (L-0145); etykieta stanu słowem
      i znakiem, „x/y” tylko gdy y jest celem (L-0147); słowo o przeszłości ma warunek prawdziwości
      i test (L-0149); komórka liczby `flexShrink={0}` (L-0152); karta decyzji w całości tylko dla
      pozycji, które zmienia (L-0157); adnotacja mówi wartość wyliczoną (L-0176).
    - **Film:** element trwały po ruchu kamery bez 3D i filtra, przegląd klatki największego
      zbliżenia (L-0171); przejście przez wspólne tło, krój rozróżniający „1” i „I” (L-0174);
      „tego nie pokazujemy” szukasz we wszystkich tekstach kadru (L-0178); dźwięk z gotowych źródeł,
      próbki do wyboru (L-0179); licencję czytasz na stronie utworu, plik z kartą źródła i testem
      (L-0180); drugi język zaczyna się od jednej klatki i pytania, dla kogo (L-0183).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/WYGLAD_PANELU/E4/`.** Wszystko tymczasowe —
zrzuty robocze, skrypty pomiarowe, kopie zapasowe zainstalowanych pluginów — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, cache pluginów),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Macierz na żywo** — `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E4_<wygląd>_<szerokość>_<co>.png`:
   wygląd jasny i ciemny × trzy szerokości (pełne okno, połowa podziału, wąski panel ok. 530 px) ×
   trzy paski nad promptem i panel `/relai-panel` (pięć zakładek, ściąga i sekcje Mapy rozwinięte
   raz). Kod z repo podłożony do zainstalowanych pluginów (kopia oryginału w katalogu roboczym),
   `/reload-plugins` robi Łukasz. Ocena według listy kontrolnej `DESIGN.md`: bez przepełnień,
   bez szczeliny między ramką a wypełnieniem (lupa), przyciski w jednej kolumnie, kontrast
   czytelny w obu wyglądach.
2. **Panel agentów `/relai-agents`** (`progress/hooks/`) w obu wyglądach — zrzut; rozjazd →
   poprawka w kluczach motywu albo `Svg` według `DESIGN.md`, z testem.
3. **Poprawki z macierzy** — tylko rozjazdy znalezione w punktach 1–2, każda z testem, który spada
   na kodzie sprzed niej (`git worktree` HEAD-a); `SEGMENT_INK` usunięty z `core/panel/theme.mjs`
   i kopii (`node core/tools/sync-panel-core.js`).
4. **Brief** `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — wersja **5.0**: nagłówek mówi, co
   obowiązuje po planie (paski §13, pasek postępu §3, panel §14 + `DESIGN.md`), sekcje zastąpione
   oznaczone jako historia; wiersz w `docs/ARTEFAKTY.md`; P-xxx w `docs/PULAPKI.md` tylko, jeśli
   macierz odsłoni nowe zachowanie silnika.
5. **Karta zgody na wydanie** — przed jakąkolwiek zmianą numeru: numery wersji (propozycja:
   `relai` 3.2.0 — Aneksy C–D; `relai-panel` 0.18.0 albo 0.19.0 — 0.18.0 nigdy nie wyszło, Łukasz
   wybiera; `relai-progress` 0.5.0 — pasek jako lista; `relai-cache-keeper` 0.10.0 — kolory
   narzędzia), lista zmian dla użytkownika, lista plików, tagi, push. Pytanie jednym narzędziem
   AskUserQuestion; bez „tak” nic dalej.
6. **Wydanie po „tak”** — numery w `*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
   `.agents/plugins/marketplace.json` i `.codex-plugin/plugin.json` (dla `relai`), `core/MANIFEST.json`
   i pozostałych miejscach z commita `v3.1.0`; `README.md` (sekcja panelu); commit
   conventional, tagi w konwencji repo (`v3.2.0`, `relai-panel-v…`), push; instalacja
   z marketplace u Łukasza i `/reload-plugins` — zrzut po instalacji z numerem wersji w logu.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_4.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] Macierz na żywo kompletna: 2 wyglądy × 3 szerokości × (paski + pięć zakładek panelu), zrzuty
      `WYGLAD_PANELU_E4_*` w `docs/zasoby/PANEL_RELAI/zrzuty/`; każdy rozjazd albo naprawiony, albo
      zapisany słowami Łukasza jako przyjęty; akceptacja całości zapisana w dzienniku jego słowami.
- [ ] Panel agentów `/relai-agents` sprawdzony zrzutem w obu wyglądach; wynik w dzienniku.
- [x] Każda poprawka z punktu 3 ma test, który spada na kodzie sprzed niej i przechodzi po niej
      (obie wersje w jednym przebiegu); `git grep -n SEGMENT_INK` nie zwraca nic poza historią.
- [x] `claude plugin validate .` i `claude plugin test .` zielone binarką aplikacji w `panel/`,
      `progress/` i `cache-keeper/` (co najmniej 197 / 41 / 181); rdzeń 409+ zielony
      (`node --test core/guardrails/tests/*.test.js core/panel/tests/*.test.js core/process/tests/*.test.js`);
      `sync-panel-core.js --check` zgodne.
- [x] Brief `STYL_PASKOW_CLAUDE.md` w wersji 5.0, wiersz w `docs/ARTEFAKTY.md`, poprzednia wersja
      w historii gita.
- [ ] Zgoda Łukasza na wydanie zapisana w dzienniku jego słowami **przed** pierwszą zmianą numeru
      wersji; numery zgodne we wszystkich plikach (`git grep` starych numerów w plikach wydania
      nie zwraca nic); tagi wypchnięte (`git ls-remote --tags origin` je pokazuje).
- [ ] Po instalacji z marketplace: log aplikacji albo `/plugin` pokazuje nowe numery czterech
      pluginów; zrzut paska i panelu z zainstalowanej wersji (nie z podłożonej kopii).
- [ ] `git diff` wydania nie dotyka `docs/plany/PANEL_CODEX/` ani
      `docs/zasoby/PANEL_RELAI/makiety/` (zmiany sesji Codeksa zostają poza commitem).
- [ ] Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu; przy okazji los `.claude/relai/work/WYGLAD_PANELU/ANEKS_C/`
      i trzech skryptów z Aneksów C–D rozstrzygnięty tym samym raportem. Artefakty poza nim
      (kopie podłożone do `~/.claude/plugins/cache/`, pliki w `%TEMP%`) wypisane z nazwy razem
      z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/WYGLAD_PANELU/STATUS.md`: E4 → ZREALIZOWANY (data), linia w dzienniku wdrożenia.
   Następnego etapu nie ma.
1a. Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E4/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu (kopie w cache pluginów) z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (C1: próg drzewa po wydaniu); lekcje
   z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — wersje po wydaniu, stan planu; `CLAUDE.md` — wiersz planu i wiersz pluginu.
5. **Ostatni etap planu — zamiast `PROMPT_ETAP_5.md` uruchom sekwencję zamknięcia planu** (skill
   `relai-planning`, plik `plan-closing.md`, D-36): bramki i odnogi najpierw, potem `STATE.md`,
   wpis „dowiezione vs plan”, status planu, ryzyka, przeniesienie folderu do
   `docs/archiwum/plany/`, linia „Aktywny plan” w `CLAUDE.md`.
6. Commit — propozycja, conventional message, bez plików PANEL_CODEX i makiet.
