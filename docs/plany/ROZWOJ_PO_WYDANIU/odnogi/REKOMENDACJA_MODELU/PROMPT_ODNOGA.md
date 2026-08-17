# PROMPT_ODNOGA — rekomendacja modelu z realnej listy modeli narzędzia

Odnoga: REKOMENDACJA_MODELU • Plan-rodzic: ROZWOJ_PO_WYDANIU, etap E6 • Wygenerowano: 2026-08-17
(autor: Opus) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/REKOMENDACJA_MODELU/ODNOGA.md` | cel, zakres, weryfikacja — karta jest źródłem, ten prompt ją wykonuje |
| `core/templates/SPEC_CLAUDE_MD.md` | linie 51 i 208 — dzisiejsze brzmienie klas modeli |
| `adapters/claude-code/skills/relai-planning/SKILL.md` | linia 139 — pytanie o model wykonawczy etapów |
| `adapters/cursor/rules/relai-planning.mdc` | odpowiednik tego pytania w regule Cursora (warstwa modelowa, angielski) |
| `core/templates/SPEC_PROMPT_ETAPU.md` + `adapters/claude-code/commands/relai-stage.md` | sekcja kontroli modelu i karta potwierdzenia (linia 72) |
| `core/MANIFEST.json` + `core/tools/validate-adapters.js` | jak adapter deklaruje swoje pliki i co sprawdza walidator |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Klasy modeli zostają trzy**: mocny / wyważony / tani. Odnoga nie wymyśla nowej taksonomii —
  zmienia tylko to, że klasa dostaje nazwy modeli danego narzędzia.
- **Nazwy modeli nie wchodzą do rdzenia.** Rdzeń zna klasy; nazwy mieszkają w adapterze, bo zmieniają
  się w tempie cudzego narzędzia (P4: adapter konsumuje rdzeń, nie kopiuje go).
- **Lista jest plikiem utrzymywanym ręcznie, z datą aktualizacji.** Żadnego odpytywania API
  o dostępne modele i żadnego zgadywania z nazwy sesji.
- **Warstwa czytana przez model jest po angielsku, warstwa dla człowieka po polsku**
  (`docs/USTAWIENIA.md`, wpis z 2026-08-12) — dotyczy również nowych plików list modeli.
- **D-85 zostaje**: ten projekt wykonuje etapy na Opusie. Odnoga zmienia mechanizm rekomendacji,
  nie decyzję tego projektu.
- **Nie ruszasz planu głównego.** `PLAN.html` planu ROZWOJ_PO_WYDANIU jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

RelAI 1.5.0, dwa adaptery na wspólnym rdzeniu. Rekomendacja modelu jest dziś opisana wyłącznie
klasami, w brzmieniu wprost antropikocentrycznym w przykładach.

```
core/templates/SPEC_CLAUDE_MD.md          # linie 51 i 208: "model najsilniejszy / wyważony / najtańszy"
core/templates/SPEC_STATUS.md             # linia 26: model wykonawczy zapisywany dosłownie z odpowiedzi użytkownika
core/templates/SPEC_PROMPT_ETAPU.md       # sekcja kontroli modelu w prompcie etapowym
adapters/claude-code/skills/relai-planning/SKILL.md   # linia 139: pytanie 3 (model wykonawczy etapów)
adapters/claude-code/commands/relai-stage.md          # linia 72: karta potwierdzenia, człon "Model wykonawczy"
adapters/cursor/rules/relai-planning.mdc              # linia 42: to samo pytanie w regule Cursora
core/MANIFEST.json                        # deklaracja plików adapterów
core/tools/validate-adapters.js           # walidator spójności rdzeń <-> adaptery
```

**Czego jeszcze NIE ma:** żadnego pliku z listą modeli w jakimkolwiek adapterze; żadnego miejsca,
w którym klasa „mocny" zamienia się na nazwę modelu dostępnego w narzędziu; żadnej wzmianki
w `STATUS.md` planu o tym, w jakim narzędziu ustalono model wykonawczy.

**Dowód, że luka jest realna (pilotaż E6, 2026-08-17):** karta `/relai-stage` w Cursorze zatrzymała
sesję zdaniem „E1 ma iść na najsilniejszym modelu w sesji. Ta sesja to Auto / Composer" i kazała
przełączyć na „np. Opus / odpowiednik w Cursorze" — czyli sama nie wiedziała, co jest odpowiednikiem.
Użytkownik rozstrzygnął to ręcznie, wybierając Grok 4.6.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest martwa. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do `KOMENDY.md` dopiero w wersji, w której realnie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu — nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Plugin RelAI jest zainstalowany (scope `user`) od 0.3.1. Zachowania skilli mierzysz **realnie** — świeżą sesją `claude -p … --output-format stream-json` i liczbą wywołań narzędzia `Skill` — a nie odtwarzaniem procedury ręcznie. Po zmianie skilla: push → `claude plugin marketplace update relai` → `claude plugin update relai@relai`, inaczej mierzysz starą wersję. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta w skillu, sprawdź, czy da się je zweryfikować z wnętrza sesji wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa, zamiast deklarować ją jako wykonaną. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt": zanim zapytasz, sprawdź `USTAWIENIA.md` i warstwę globalną, a gdy próg rozstrzyga jednoznacznie — nie pytaj wcale, tylko powiedz, co przyjąłeś. (L-0006)
7. Test zamrożenia (i każdy inny test „czegoś nie wolno") wymaga dowodu negatywnego: pokaż, że chroniony fragment ma nadal pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
8. Po podbiciu wersji pluginu przepuść repo `grep`-em po starym numerze i rozstrzygnij **każde** trafienie: historyczne zostaje, aktualne się zmienia. (L-0008)
9. Opis skilla zaczynaj od `MUST BE USED`, markera rozpoznawczego projektu i **płaskiej listy dosłownych fraz** wyzwalających. Opis narracyjny nie wygrywa konkurencji z dwustoma innymi skillami. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. Warstwa globalna `~/.claude/relai/` jest niewidoczna dla sesji uruchomionej w projekcie — przewiduj brak dostępu i mów o tym wprost. (L-0010)
11. Odesłanie do pliku specyfikacji **nie wystarcza**: struktura, której naprawdę wymagasz, musi być wypisana w treści skilla. (L-0011)
12. Katalog pluginu (`templates/`) jest dla sesji **niedostępny** tak samo jak katalog domowy. Każdy mechanizm, który musi coś stamtąd przeczytać, wymaga zapasowej ścieżki w treści skilla. (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania po sobie: pytanie o wybór jest w porządku, zostawienie po sobie martwego linku nie. Zawsze istnieje poprawna wartość tymczasowa. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. (L-0014)
15. Komenda wywołana wprost **nie ładuje** skilla, do którego się odwołuje. Potrzebną procedurę albo wpisujesz do komendy, albo każesz jej jawnie wczytać skill. (L-0015)
16. Komunikaty hooków są **celowo ASCII** — bez polskich diakrytyków na stdout/stderr hooka. (L-0016)
17. Działanie hooka dowodzisz **efektem** (plik istnieje/nie istnieje, suma kontrolna, treść odpowiedzi modelu), nie zdarzeniem w transkrypcie. Payloady testowe hooków buduj Nodem, nie echem w shellu. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz, nie na przewidywanym formacie wyjścia cudzego narzędzia. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief. Przy zadaniu wizualnym zbierz najpierw cechy **pozytywne** i pokaż **jeden** wariant do kalibracji smaku. (L-0019)
20. Zainstalowaną wersję pluginu potwierdzasz `~/.claude/plugins/installed_plugins.json` (`version` **i** `gitCommitSha`) albo treścią skilla w cache'u — **nie** `claude plugin details`. `plugin install` na zainstalowanym pluginie to no-op, a `plugin update` porównuje numer wersji. (L-0020)
21. Narzędzie systemowe rozstrzygające o **formacie** artefaktu wywołuj pełną ścieżką i sprawdzaj wynik (nagłówek pliku, lista wpisów), nie kod wyjścia. (L-0021)
22. W dokumencie użytkownika podajesz **zmierzoną** formę wywołania. Komendy pluginu żyją w przestrzeni nazw: `/relai:relai-<nazwa>`. (L-0022)
23. Krok sięgający poza katalog roboczy ma mieć w procedurze zapisane wyjście po odmowie dostępu (komunikat + `--add-dir`); nigdy „po cichu bliżej". (L-0023)
24. Sesja pomiarowa `claude -p` ma dwa warunki wykonalności: prompt z polskimi znakami przez **stdin**, a zapis plików wymaga `--permission-mode acceptEdits`. (L-0024)
25. Wartość czytana z dokumentu **maszynowo** dopasowuje się do kotwicy (początek komórki), nie „gdziekolwiek w linii". Wartość nierozpoznana znaczy **cisza**, nigdy zgadywanie. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów. Specyfikacja dokumentu, którego wartość polega na wykonalności, ma zapisaną ścieżkę „pytam zamiast zmyślać" wraz z formą zapisu luki (`<DO UZUPEŁNIENIA: …>`). (L-0026)
27. Plików z polskimi znakami **nie** przepuszczasz przez PowerShell 5.1. Dokumenty dopisujesz narzędziem Write/Edit albo Nodem. (L-0027)
28. Sesja pomiarowa używająca narzędzi systemowych potrzebuje `--allowedTools "Bash"` obok `--permission-mode acceptEdits`. (L-0028)
29. Komponent opcjonalny musi dać się **pominąć bez śladu**: żadnych pustych wypełniaczy ani martwego kodu. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w warstwie obecnej w kontekście każdej sesji (`CLAUDE.md` projektu, reguła `alwaysApply`) — nie w skillu i nie w ściądze dla człowieka. Skill dokłada procedurę. (L-0030)
31. `claude plugin update` **nie działa od razu**: do restartu aplikacji sesje ładują stary cache. Po wydaniu: restart aplikacji, potem pomiar. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json` — niezależnie od konta w aplikacji. Konto i limit sprawdzasz **przed** pomiarem; niedomknięty punkt weryfikacji idzie do odnogi z gotowym promptem. (L-0032)
33. Sumy kontrolne plików, które przeszły przez gita, porównuj **po normalizacji CRLF → LF**. (L-0033)
34. Próg liczbowy w mechanizmie automatycznym kalibrujesz na **zmierzonych** plikach realnych projektów, zanim go zapiszesz. (L-0034)
35. Dopisek czytany maszynowo dostaje w specyfikacji **zbiór akceptowanych brzmień** — kanoniczne plus historyczne — zanim powstanie pierwszy mechanizm, który go czyta. (L-0035)
36. Sygnał, który ma paść **raz**, ma jednego właściciela: warstwę działającą bez wyzwalania (hook). Druga warstwa dostaje instrukcję milczenia i własny detektor tylko na wypadek nieobecności pierwszej. (L-0036)
37. Scenariusz „konfiguracji nie ma" mierzysz z **podstawionym katalogiem domowym** (`HOME`, `USERPROFILE` w env procesu potomnego). (L-0037)
38. Przeniesienie katalogu, na który wskazuje manifest cudzego narzędzia, sprawdzasz **na kopii** walidatorem tego manifestu — dwa przebiegi, z dowodem negatywnym. (L-0038)
39. Drzewo dowolnego commita materializujesz `git worktree add --detach`, nie `git archive | tar`. (L-0039)
40. „Zachowanie nie zmieniło się" dowodzisz, uruchamiając **obie wersje na tym samym wejściu w jednym przebiegu**; różnice zamierzone normalizujesz jawnie w kodzie instrumentu. (L-0040)
41. Rozpoznanie cudzego narzędzia opieraj na **wydanym buildzie i próbie**, nie na samej dokumentacji producenta. Każdą pozycję oznaczaj źródłem. (L-0041)
42. Payload hooka cudzego narzędzia parsujesz **po zdjęciu BOM** i nie zakładasz, że niesie te same pola co znane Ci narzędzie. (L-0042)
43. Guardrail wołany przez interpreter znika razem z interpreterem — i narzędzie potrafi tego **nie zgłosić**. Wołaj go przez opakowanie powłoki kończące się kodem blokującym. (L-0043)
44. Sesję pomiarową CLI cudzego narzędzia uruchamiaj z **powłoki natywnej dla systemu**. (L-0044)

## Zakres

1. **Klasy modeli zostają w rdzeniu, nazwy w adapterach.** `core/templates/SPEC_CLAUDE_MD.md`
   (linie 51 i 208) opisuje wyłącznie trzy klasy i odsyła po nazwy do listy adaptera.
2. **Lista modeli per narzędzie** — `adapters/claude-code/MODELE.md` i `adapters/cursor/MODELE.md`:
   nazwy przypisane do trzech klas, data aktualizacji, wpięcie do `core/MANIFEST.json` i sprawdzenie
   przez `core/tools/validate-adapters.js`.
3. **Pytanie o model wykonawczy pokazuje konkrety** —
   `adapters/claude-code/skills/relai-planning/SKILL.md:139` i `adapters/cursor/rules/relai-planning.mdc`.
4. **Kontrola modelu rozpoznaje nazwę, nie tylko klasę** — `core/templates/SPEC_PROMPT_ETAPU.md`
   i `adapters/claude-code/commands/relai-stage.md:72`; model spoza listy jest zgłaszany wprost.
5. **`STATUS.md` planu mówi, w jakim narzędziu ustalono model** — `core/templates/SPEC_STATUS.md:26`.

## Weryfikacja

- [ ] `adapters/claude-code/MODELE.md` i `adapters/cursor/MODELE.md` istnieją, każdy ma trzy klasy,
      nazwy modeli i datę aktualizacji.
- [ ] `grep -rn "najsilniejszy" core/templates/` nie zwraca miejsca, w którym klasa występuje bez
      odesłania do listy adaptera.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0 i wykrywa brak pliku listy
      w adapterze (dowód negatywny: usunięcie pliku w kopii daje kod niezerowy).
- [ ] Świeża sesja w Cursorze na prośbę o plan pokazuje w pytaniu o model **nazwy modeli Cursora**
      (zapisany wynik pytania, nie kod).
- [ ] Świeża sesja w Claude Code na tę samą prośbę pokazuje nazwy modeli Anthropic (L-0040).
- [ ] `PLAN.html` i tabela etapów `STATUS.md` planu ROZWOJ_PO_WYDANIU nietknięte (dowód negatywny
      z `git diff`).

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona.
2. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: linia tej odnogi w sekcji „Odnogi" → `ZAMKNIĘTA <data>`.
   Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
3. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", z podpisem
   `Autor: RelAI (<model>) + <git config user.name>`.
4. `docs/STATE.md` — nadpisz, jeśli lista modeli zmienia obraz tego, co RelAI obiecuje w drugim
   narzędziu.
5. Commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
