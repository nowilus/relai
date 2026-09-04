# PROMPT_ODNOGA — adapter Cursora zmierzony na wydaniu 1.9.1

Odnoga: CURSOR_1_9_1 • Plan-rodzic: brak (wątek samodzielny) • Wygenerowano: 2026-09-04
(autor: Opus 5) • Wykonawca: **Grok 4.6**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Grok 4.6** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Ten wątek wykonuje się W APLIKACJI CURSORA**, nie w Claude Code i nie z powłoki. To jest cały
> jego sens: mierzymy adapter w narzędziu, w którym nigdy nie działał na tej wersji. Sesja
> otwarta gdzie indziej może najwyżej przygotować materiał — pomiarów z niej **nie zapisujesz**
> jako pomiarów Cursora.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/fixy/CURSOR_1_9_1/ODNOGA.md` | karta wątku — cel, zakres, weryfikacja; **karta jest źródłem**, ten prompt tylko ją wykonuje |
| `docs/STATE.md` | sekcje „Co blokuje" i „Co dalej" — tam stoi zdanie o niezmierzonym adapterze Cursora, które ten wątek ma zastąpić faktem |
| `docs/PULAPKI.md` | P-005 (wydanie wchodzi po restarcie) i pułapki powłoki — czytasz **zanim** uznasz, że coś jest zepsute |
| `adapters/cursor/README.md` | co adapter obiecuje: trzy reguły, dwa hooki, instalator z deinstalacją |
| `adapters/cursor/install.js` | kolejność instalacji (l. 9–16), wpisy `hooks.json` (l. 72–91), manifest instalacji |
| `adapters/cursor/hooks/session-context.js` | hook startu — zdania o liście modeli i o jej wieku |
| `adapters/cursor/MODELE.md` | lista modeli Cursora: `list-date`, trzy klasy, `strong: Grok 4.6` |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Lista mówi, co jest, nigdy co lepsze** (D-38). Klasy modeli to rekomendacja, nie reguła.
- **Rdzeń nie zna nazw narzędzi.** Nazwę pliku listy podaje adapter, nazwę modelu — lista.
  Rozpoznawanie narzędzia „po katalogu, po nazwie procesu albo po własnym modelu" jest zakazane.
- **Komendy i skille Cursora są KOPIĄ z adaptera Claude Code**, nie drugą implementacją
  (`install.js`, l. 18–20). Rozjazd między nimi jest defektem instalatora, nie powodem do pisania
  komendy od nowa.
- **Skan sekretów w Cursorze idzie przez opakowanie powłoki**, nie przez `node` wprost — bo hook,
  którego nie da się uruchomić, Cursor ignoruje po cichu i zapis przechodzi (L-0046). Hook startu
  zostaje przy zwykłym `node` świadomie.
- **Wersję potwierdzasz plikiem instalacji, nie komunikatem CLI** (L-0004, L-0061). W Cursorze tym
  plikiem jest `.cursor/relai-install.json` plus realna zawartość `.cursor/`.
- **Cisza poniżej progu jest zachowaniem poprawnym**, nie brakiem sygnału (L-0036). Zanim uznasz
  ciszę za wynik, pokaż kontrolą pozytywną, że to samo wejście potrafi cokolwiek wypisać (L-0090).
- **Wątek jest samodzielny: w żadnym `STATUS.md` niczego nie zapisujesz.** Plan ROZWOJ_PO_WYDANIU
  jest zamrożony i pozostaje zamrożony; jego `PLAN.md`, tabeli etapów ani sekcji „Odnogi" nie
  dotykasz. Jedyne dokumenty, które ten wątek zmienia, to `docs/fixy/CURSOR_1_9_1/ODNOGA.md`,
  `docs/DZIENNIK.md` i — jeśli zmieni się stan projektu — `docs/STATE.md`.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-04)

RelAI jest wydany w **1.9.1** i zmierzony w Claude Code: wydanie potwierdzone treścią plików
z cache'u, blokada sekretu pokazana w żywej sesji ze skutkiem na dysku, poprawka `_fixy`
zweryfikowana obiema wersjami w jednym przebiegu. **Adapter Cursora nie ma ani jednego przebiegu
na tej wersji** — ostatni był na 1.6.x (pilotaż E6, 2026-08-17, model Grok 4.6, cały etap
poprowadzony w Cursorze). Repozytorium jest czyste, wszystko wypchnięte.

```
adapters/cursor/install.js              # instalator: 5 krokow, --uninstall, --bez-skanu, manifest
adapters/cursor/rules/relai-core.mdc    # 19,5 KB — rytualy, rotacja (1.7.0), sprzatanie (1.8.0)
adapters/cursor/rules/relai-planning.mdc# 5,7 KB — plany, etapy, odnogi
adapters/cursor/rules/relai-guardrails.mdc # 4,5 KB — sekrety, ochrona konfiguracji
adapters/cursor/hooks/session-context.js   # hook sessionStart (kontekst, listy modeli, progi)
adapters/cursor/hooks/secret-scanner.js    # logika skanu
adapters/cursor/hooks/secret-scanner.cmd   # opakowanie Windows — TO jest wolane przez hooks.json
adapters/cursor/hooks/secret-scanner.sh    # opakowanie POSIX
adapters/cursor/MODELE.md               # list-date 2026-09-04; strong Grok 4.6, balanced Composer 2.5, cheap Auto
```

**Czego jeszcze NIE ma — i to jest zakres tego wątku:** ani jednego zdania o adapterze Cursora
opartego na przebiegu w 1.9.1. Niezmierzone są: instalacja (czy kładzie dwanaście komend, czy
manifest niesie 1.9.1), start sesji (czy pada zdanie o liście modeli i drugie o jej wieku),
blokada sekretu przez opakowanie powłoki **ze skutkiem na dysku**, trzy komendy nieuruchomione
w Cursorze nigdy oraz deinstalacja. `STATE.md` twierdzi dodatkowo, że niezmierzony jest hook
`beforeReadFile` — a instalator stawia dziś **dwa** wpisy (`sessionStart`, `preToolUse`), więc to
zdanie samo jest do rozstrzygnięcia.

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-04)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści i ma zapisaną ścieżkę „pytam zamiast zmyślać". Wzorzec powtarzalny
   sprawdzasz na całej rodzinie dokumentów — trafienie poza zakresem jest sygnałem odchylenia, nie
   usterką weryfikacji. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**. Kryterium stawiasz na
   poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz, i sprawdzasz je na
   materiale, **zanim** zaczniesz pracę. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069,
   L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; dokładaj przypadek, który **musi** trafić; zero trafień przy niepustych zbiorach to
   defekt instrumentu, dopóki nie udowodnisz inaczej. Instrument porównujący dwa drzewa odtwarza
   materiał przed każdym wariantem. Niedostępność cudzej usługi sprawdzasz ponownie jednym
   najtańszym wywołaniem, a datowanie działa w obie strony. **Przebieg, w którym oczekujesz ciszy,
   jest ważny wyłącznie razem z kontrolą pozytywną w tym samym przebiegu**, a **cisza zmierzona
   złym wejściem jest fałszem, nie ciszą** — narzędzie wołane z podstawionym payloadem dostaje
   kontrolę pozytywną na tym samym wejściu. (L-0032, L-0037, L-0054…L-0056, L-0064, L-0068,
   L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088, L-0090)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   daj mu **jeden** wyzwalacz, porównuj do wielkości, którą mechanizm kontroluje, a sygnał
   o zatkaniu wyzwalaj różnicą między możliwym a wykonanym. (L-0034, L-0049, L-0053, L-0060,
   L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości, wartość nierozpoznana znaczy cisza. Rdzeń słowa
   w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`. Zamknięta lista ma koszt po
   drugiej stronie i ten koszt mierzysz. (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** — reguła
   `.mdc` albo hook; skill dokłada procedurę i wyzwala się zawodnie. Sygnał, który ma paść raz, ma
   jednego właściciela; cisza właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego; każdy krok sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010,
   L-0012, L-0023)
10. **Wersję potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz świeżą
    sesją, a zachowanie niewydane — artefaktem podłożonym lokalnie w projekcie kontrolnym.
    (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne po normalizacji CRLF → LF;
    mechanizm czytający strukturę pliku sprawdzaj na **obu** wariantach. Kolejność wpisów i stan
    dokumentu wobec własnej specyfikacji też są wariantami. (L-0033, L-0038, L-0057, L-0062,
    L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, a brak sygnału konfrontuj najpierw z **warunkiem
    milczenia** mechanizmu. (L-0041, L-0042, L-0044, L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam; dowodzisz **obecności** nowej treści.
    (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    (L-0003, L-0006, L-0016, L-0019, L-0029)

W tym wątku centralne są zasady **13** (cudze narzędzie poznajesz z próby, nie z dokumentacji),
**5** i **4** (kontrola pozytywna obok każdej ciszy, dowód efektem) oraz **12** (opakowanie powłoki
zamiast cichego pominięcia hooka).

## Zakres i weryfikacja

**Katalog roboczy tej odnogi: `.claude/relai/work/_fixy/CURSOR_1_9_1/`.** Wszystko tymczasowe —
skrypty, wyjścia komend, notatki z pomiaru — powstaje tam. Artefakt, który z natury musi leżeć
**poza** projektem (projekt kontrolny w `%TEMP%`, katalog `.cursor/` tamtego projektu), wpisujesz
do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu `relai-`. Katalog powstaje przy
pierwszym zapisie, nie na zapas.

Zakres — pięć punktów przepisanych z karty (`ODNOGA.md` jest źródłem, w razie rozbieżności wygrywa
karta):

1. **Instalacja** — `node adapters/cursor/install.js <projekt kontrolny>` na świeżym projekcie
   RelAI; sprawdzasz `.cursor/rules/` (trzy pliki), `.cursor/commands/` (dwanaście),
   `.cursor/skills/`, `.claude/relai/templates/`, `.cursor/hooks.json` i manifest
   `.cursor/relai-install.json`.
2. **Start sesji w aplikacji Cursora** — zdanie o obowiązującej liście modeli oraz zdanie o wieku
   listy; para wariantów różniąca się **wyłącznie** polem `list-date` w `MODELE-cursor.md`.
3. **Blokada sekretu** — zapis z syntetycznym kluczem `AKIA` + 16 znaków (wartość zmyślona,
   składana w czasie wykonania) i kontrola pozytywna bez sekretu; dowodem jest nieobecność pliku.
4. **Trzy komendy** — `/relai-clean`, `/relai-models` i jedna z pozostałych, każda uruchomiona
   frazą użytkownika.
5. **Deinstalacja** — `--uninstall` po postawieniu cudzego wpisu w `.cursor/hooks.json`.

Weryfikacja (wszystkie punkty muszą przejść):

- [ ] `.cursor/relai-install.json` niesie **1.9.1**, a `.cursor/commands/` ma **dwanaście** plików
      — policzone komendą, nie okiem.
- [ ] Start sesji w aplikacji wypisuje zdanie o `MODELE-cursor.md` z datą listy; wariant z listą
      postarzoną ponad próg daje linię `[RelAI lista modeli]`, wariant świeży — **zero znaków**.
      Obie wersje w jednym przebiegu, materiał odtwarzany przed każdą.
- [ ] Zapis z kluczem **odbity**, plik **nie istnieje** na dysku (`test -e` albo odpowiednik),
      a wartość klucza nie występuje w żadnym pliku projektu kontrolnego ani tego repozytorium.
      Ten sam zapis bez sekretu w tym samym przebiegu **przechodzi**.
- [ ] Trzy komendy uruchomione frazą użytkownika kończą się swoim właściwym efektem; wynik każdej
      opisany jednym zdaniem w dzienniku, także wtedy, gdy komenda nie zadziałała.
- [ ] Po `--uninstall` cudzy wpis w `.cursor/hooks.json` **jest na miejscu**, a katalogi RelAI
      zniknęły — sprawdzone treścią pliku.
- [ ] Zdanie ze `STATE.md` o hooku `beforeReadFile` rozstrzygnięte: albo poprawione jako
      nieaktualne, albo zgłoszone jako brakujący hook w sekcji „Czeka na człowieka".
- [ ] Katalog roboczy `.claude/relai/work/_fixy/CURSOR_1_9_1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Artefakty spoza katalogu — projekt kontrolny w `%TEMP%` — wypisane
      z nazwy razem z tym, co się z nimi stało.

## Na koniec — rytuał zamknięcia odnogi (bez niego wątek NIE jest zamknięty)

1. **`docs/fixy/CURSOR_1_9_1/ODNOGA.md`** — status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona:
   co zmierzono, czego nie i dlaczego, plus link do wpisu w dzienniku.
1a. **Katalog roboczy** — zmierz, pokaż pozycje, skasuj po „tak"; obie liczby idą do wpisu.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Każdy znaleziony defekt dostaje własne
   zdanie z reprodukcją; defektu **nie poprawiasz po cichu**.
3. **`docs/STATE.md`** — sekcja „Co blokuje": zdanie o niezmierzonym adapterze Cursora zastąp tym,
   co realnie wyszło. Jeśli coś nie działa, to też jest wynikiem i ma tam stanąć.
4. **Ryzyka** — `P1` i `P2` w tabeli „Stan otwartych ryzyk" dotyczą wprost tego adaptera; przejrzyj
   je i zaktualizuj poziom albo mitygację, jeśli pomiar to zmienia.
5. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.
