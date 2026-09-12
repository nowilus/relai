# PROMPT_ODNOGA — korzeniowy `hooks/` ładowany przez Claude Code obok hooków adaptera

Odnoga: HOOKI_KORZEN • Plan-rodzic: PIERWSI_UZYTKOWNICY, etap E1 • Wygenerowano: 2026-09-12 (autor: Opus 5) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/PIERWSI_UZYTKOWNICY/odnogi/HOOKI_KORZEN/ODNOGA.md` | cel, zakres i weryfikacja — karta jest źródłem, ten prompt ją wykonuje |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `hooks/hooks.json` | trzy hooki Codeksa wołane z korzenia — to one uruchamiają się dodatkowo w Claude Code |
| `adapters/codex/hooks/session-context.js` | linia 18 — angielskie zdanie, które dubluje kontekst startu |
| `adapters/codex/hooks/session-end.js` | linia 7 — `additionalContext` odrzucany przez schemat `SessionEnd` Claude Code |
| `core/process/crew.js` | linie 40–41 — istniejąca konwencja rozpoznania hosta; bierzesz ją, nie wymyślasz nowej |
| `core/tools/validate-adapters.js` | miejsce na kontrolę tej klasy wady |
| `docs/PULAPKI.md` | P-010, P-011, P-012 — układ pozycji, do którego dopisujesz P-013 |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Sygnał hosta to zmienna `CLAUDECODE`** — zmierzona jako obecna w sesji Claude Code 2026-09-12
  (FAKT), zgodna z konwencją `core/process/crew.js`. Nie budujesz własnego rozpoznania narzędzia po
  ścieżkach ani po kształcie payloadu.
- **Korzeniowy `hooks/hooks.json` zostaje w korzeniu**, bo tam go szuka Codex
  (`adapters/codex/README.md`, linia 33). Wariant przeniesienia wchodzi **tylko** wtedy, gdy
  sprawdzisz u źródła, że `.codex-plugin/plugin.json` przyjmuje pole `hooks` — sprawdzenie robisz
  walidatorem albo widokiem statusu Codeksa, nie obserwacją (zasada 13).
- **Brzmienia komunikatów nie ruszasz.** Problemem jest liczba bloków kontekstu i błąd schematu,
  nie treść zdań.
- **Zero obejść w guardrailu sekretów.** `secret-scanner` Codeksa dostaje bramkę hosta, a nie
  poluzowanie reguł (zasada 12); w Claude Code skan sekretów robi hook adaptera Claude Code.
- **Wersja po naprawie to 2.1.4**; `claude plugin validate` przed tagiem jest krokiem obowiązkowym
  (ryzyko W1, ostatni wpis dziennika).
- **Nie ruszasz planu głównego.** `PLAN.html` planu PIERWSI_UZYTKOWNICY jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

Repozytorium ma 2.1.3, tag `v2.1.3` na zdalnym, a publiczna instalacja z marketplace `nowilus/relai`
serwuje **2.1.3** (FAKT — świeża instalacja w izolowanym `CLAUDE_CONFIG_DIR`, 2026-09-12: `✔ enabled`,
13 komend, 6/6 plików zgodnych z tagiem po normalizacji CRLF → LF). `claude plugin validate` na
ścieżce instalacji: `✔ Validation passed`. Czyli manifest jest poprawny — wada siedzi w konwencji
katalogu, nie w manifeście.

```
hooks/hooks.json                          # SessionStart + PreToolUse + SessionEnd Codeksa, wołane z korzenia
adapters/codex/hooks/session-context.js   # kontekst startu po angielsku (linia 18: AGENTS.md)
adapters/codex/hooks/session-end.js       # zwraca additionalContext dla SessionEnd (linia 7)
adapters/codex/hooks/secret-scanner.js    # logika skanu; opakowania .sh/.cmd obok
adapters/claude-code/hooks/hooks.json     # hooki zadeklarowane w plugin.json — te działają poprawnie
core/process/crew.js                      # linie 40-41: konwencja rozpoznania hosta po zmiennych
core/tools/validate-adapters.js            # walidator spójności rdzenia i adapterów
```

**Czego jeszcze NIE ma:** bramki hosta w hookach Codeksa, kontroli tej klasy wady w walidatorze,
pozycji P-013 w rejestrze pułapek i wydania 2.1.4.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści i ma ścieżkę „pytam zamiast zmyślać". Wzorzec powtarzalny sprawdzasz
   na całej rodzinie dokumentów. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza w wersji, w której
   realnie działa; komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy
   czytelnik. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi. Zmianę
   zachowania pokazujesz obiema wersjami w jednym przebiegu. Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** przebieg, w którym oczekujesz ciszy, jest ważny
   wyłącznie razem z kontrolą pozytywną w tym samym przebiegu — awaria ładowania modułu wygląda
   dokładnie jak zachowanie domyślne mechanizmu. Cisza zmierzona złym wejściem jest fałszem, nie
   ciszą. Kontrolę pozytywną stawiasz na wejściu, którego mechanizm naprawdę pilnuje. (L-0032,
   L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087,
   L-0088, L-0090, L-0091)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj na realnych plikach, zapisuj w jednostce
   mechanizmu kontrolnego, jeden wyzwalacz. (L-0034, L-0049, L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień**, a rdzeń słowa w języku
   z diakrytykami łapiesz klasą znaków tego języka, nie `\w`. (L-0025, L-0035, L-0048, L-0066,
   L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** — `CLAUDE.md`
   projektu albo hook. Sygnał, który ma paść raz, ma **jednego właściciela**; cisza właściciela
   znaczy „sprawdzone i zgodne". Ta zasada jest sednem tego wątku. (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym.** (L-0009, L-0010, L-0012,
   L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie. Zachowanie zmienione, ale niewydane, mierzysz artefaktem podłożonym lokalnie pod
    inną nazwą. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem** — sumy po normalizacji CRLF → LF; mechanizm
    czytający strukturę pliku sprawdzaj na obu wariantach. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście; wołaj go przez opakowanie powłoki. (L-0043, L-0045, L-0046,
    L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji; gdy nie przyjmuje
    Twojego artefaktu, sięgnij po jego własny walidator albo widok statusu. (L-0041, L-0042, L-0044,
    L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam, gdzie
    jest wykonalna; dowódź obecności nowej treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Kompozycję z tekstem budujesz w warstwie, która liczy układ. Ostrzeżenie `claude plugin validate`
    o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006,
    L-0016, L-0019, L-0029, L-0094)

## Zakres i weryfikacja

**Katalog roboczy tej odnogi: `.claude/relai/work/PIERWSI_UZYTKOWNICY/HOOKI_KORZEN/`.** Wszystko
tymczasowe powstaje tam — izolowana konfiguracja pomiarowa, wyjścia komend, podłożony skrypt bez
bramki do kontroli pozytywnej walidatora. Artefakt, który z natury musi leżeć **poza** projektem
(`%TEMP%`, katalog domowy, cache pluginu), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę
zaczynasz od slugu projektu.

Zakres i weryfikacja są przepisane z karty — `ODNOGA.md` jest źródłem, a rozbieżność między nią
a tym promptem jest błędem:

1. Bramka hosta w hookach Codeksa (`session-context.js`, `session-end.js`, `secret-scanner.js`
   i opakowania) — pod Claude Code cicho, kod 0.
2. `hooks/hooks.json` zostaje w korzeniu; przeniesienie tylko po potwierdzeniu pola `hooks`
   w manifeście Codeksa.
3. Kontrola w `core/tools/validate-adapters.js` — brak bramki daje kod niezerowy.
4. `docs/PULAPKI.md` — pozycja P-013.
5. Wydanie 2.1.4 z `claude plugin validate` przed tagiem.

- [ ] Świeża sesja Claude Code pokazuje dokładnie **jeden** blok `[RelAI session-context]`; zdanie
      „This is a RelAI project. Before substantive work, read AGENTS.md…" nie występuje.
- [ ] Zamknięcie sesji Claude Code **bez** komunikatu `Hook JSON output validation failed`,
      sprawdzone na świeżej instalacji w izolowanym `CLAUDE_CONFIG_DIR`.
- [ ] **Kontrola pozytywna bramki:** ten sam skrypt wołany bez `CLAUDECODE` wypisuje kontekst
      normalnie — dowód, że hook żyje dalej w Codeksie.
- [ ] `node core/tools/validate-adapters.js` → kod 0; na podłożonym skrypcie bez bramki → kod
      niezerowy ze wskazaniem pliku.
- [ ] `docs/PULAPKI.md` ma P-013, a `git grep -n "P-013"` zwraca też trafienie z `docs/STATE.md`.
- [ ] `claude plugin validate <ścieżka instalacji>` → `Validation passed`; 2.1.4 potwierdzona
      sumami plików z cache'u po normalizacji CRLF → LF.
- [ ] Katalog roboczy odnogi przejrzany raportem i skasowany po „tak"; liczby przed i po we wpisie
      dziennika, artefakty spoza niego z nazwy.

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona.
2. `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md`: linia tej odnogi w sekcji „Odnogi" →
   `ZAMKNIĘTA <data>`. Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
2a. Katalog roboczy `.claude/relai/work/PIERWSI_UZYTKOWNICY/HOOKI_KORZEN/` — raport, „tak",
   kasowanie; obie liczby idą do wpisu z punktu 3.
3. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), podpis z członem
   użytkownika. Lekcję o konwencyjnych katalogach hosta dopisz do `docs/LEKCJE.md`.
4. `docs/STATE.md`: sekcja „Co dalej" — wada zamknięta, wersja 2.1.4, P-013 wskazane.
5. Commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
