# PROMPT_ODNOGA — pomiar odnóg świeżą sesją

Odnoga: POMIAR_ODNOG • Plan-rodzic: ROZWOJ_PO_WYDANIU, etap E1 • Wygenerowano: 2026-08-12
(autor: Opus) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Zanim zaczniesz — warunek wykonalności

`claude -p` uwierzytelnia się z `~/.claude/.credentials.json`, **niezależnie od konta zalogowanego
w aplikacji** (L-0032). Sprawdź konto i limit **pierwszą** komendą:

```
node -e "const j=require(require('os').homedir()+'/.claude.json');console.log(j.oauthAccount.emailAddress)"
echo "ping" | claude -p --output-format stream-json --verbose
```

Odpowiedź „You've hit your session limit" → **zatrzymaj się**, powiedz o tym i poproś o
`claude /login`. Nie zastępujesz pomiaru odtworzeniem procedury ręcznie — to jest dokładnie ten
błąd, przez który ta odnoga powstała.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/POMIAR_ODNOG/ODNOGA.md` | cztery scenariusze, ich zakres i weryfikacja — karta jest źródłem |
| `commands/relai-branch.md` | procedura, którą mierzysz: sześć kroków i zakazy |
| `templates/SPEC_ODNOGA.md` | oczekiwana struktura obu plików — po tym poznasz, czy wynik jest poprawny |
| `docs/DZIENNIK.md` | ostatni wpis (E1) — tam są liczby z pomiaru słabszą metodą, do porównania |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Scenariusze i ich kolejność są ustalone w karcie odnogi. Nie dokładasz piątego.
- Projekty testowe budujesz **od nowa**, skryptem, w katalogu tymczasowym — nie w repozytorium
  (poprzedni komplet: projekt z planem i etapem `W TOKU`, projekt bez planu, projekt z gotową
  odnogą `LOGI_WYDAN` w `odnogi/`).
- Nazwy odnóg w scenariuszach: `OPIS_KART` (A), `LITEROWKI_W_MENU` (B). Nazwę podajesz
  **w argumencie komendy**, bo `claude -p` nie obsługuje `AskUserQuestion`.
- Forma wywołania: pełna, `/relai:relai-branch` — skrócona kończy się `Unknown command` (L-0022).
- **Nie ruszasz planu głównego.** `PLAN.html` planu ROZWOJ_PO_WYDANIU jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md` — oraz
  linia odnogi OPIS_REPO, jeśli scenariusz D ją domknie.
- **Granica wobec E2:** rotacja dokumentów to następny etap — niczego z niej nie zaczynasz.

## Stan wyjściowy — co realnie zastajesz

RelAI 1.1.0 wydany, zainstalowany (scope `user`), `installed_plugins.json` pokazuje `1.1.0`
z `gitCommitSha e6b41dc` (FAKT, 2026-08-12). Etap E1 zamknięty: komenda, specyfikacja, sekcja
„Odnogi", sygnał odchylenia i reguła w `SPEC_CLAUDE_MD.md` są w repo i w pluginie.

```
commands/relai-branch.md                        # procedura: 6 kroków + zakazy
templates/SPEC_ODNOGA.md                        # struktura ODNOGA.md i PROMPT_ODNOGA.md
skills/relai-planning/SKILL.md                  # sygnał odchylenia + sekcja „Odnogi planu"
docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md          # sekcja „Odnogi": OPIS_REPO, POMIAR_ODNOG
docs/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/  # odnoga dogfoodingowa — materiał scenariusza D
```

**Czego jeszcze NIE ma (to jest zakres tej odnogi):** ani jednego pomiaru świeżą sesją. Wszystko,
co wiadomo o zachowaniu komendy, pochodzi z wykonania procedury w sesji etapu E1 — artefakty były
poprawne, ale to nie jest dowód, że komenda wyzwala się i wykonuje sama.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu. (L-0003)
4. Zachowania skilli mierzysz realnie — świeżą sesją `claude -p … --output-format stream-json`
   i liczbą wywołań narzędzia `Skill`; po zmianie skilla: push → `marketplace update` →
   `plugin update`. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta, sprawdź, czy da się je zweryfikować z wnętrza sesji. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt". (L-0006)
7. Test zakazu wymaga dowodu negatywnego. (L-0007)
8. Po podbiciu wersji przepuść repo `grep`-em po starym numerze. (L-0008)
9. Opis skilla/komendy zaczynaj od `MUST BE USED`, markera i płaskiej listy fraz. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. (L-0010)
11. Odesłanie do specyfikacji nie wystarcza — struktura musi być w treści skilla. (L-0011)
12. Katalog pluginu jest niedostępny — kopia w `.claude/relai/templates/`. (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania; martwy link nie jest poprawny nigdy. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. (L-0014)
15. Komenda wywołana wprost nie ładuje skilla, do którego się odwołuje. (L-0015)
16. Komunikaty hooków są celowo ASCII. (L-0016)
17. Działanie hooka dowodzisz efektem, nie zdarzeniem w transkrypcie. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief. (L-0019)
20. Zainstalowaną wersję potwierdzasz `installed_plugins.json`. (L-0020)
21. Narzędzie systemowe wywołuj pełną ścieżką i sprawdzaj wynik, nie kod wyjścia. (L-0021)
22. W dokumencie użytkownika podajesz zmierzoną formę wywołania: `/relai:relai-<nazwa>`. (L-0022)
23. Krok sięgający poza katalog roboczy ma zapisane wyjście po odmowie dostępu. (L-0023)
24. Sesja pomiarowa `claude -p`: polskie znaki przez **stdin**, zapis wymaga `acceptEdits`. (L-0024)
25. Wartość czytana maszynowo dopasowuje się do kotwicy; nierozpoznana znaczy cisza. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów — ścieżka „pytam zamiast zmyślać". (L-0026)
27. Plików z polskimi znakami nie przepuszczasz przez PowerShell 5.1. (L-0027)
28. Sesja pomiarowa z narzędziami systemowymi potrzebuje `--allowedTools "Bash"`. (L-0028)
29. Komponent opcjonalny musi dać się pominąć bez śladu. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w `CLAUDE.md` projektu. (L-0030)
31. `claude plugin update` nie działa od razu: do restartu aplikacji sesje ładują stary cache. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json`, niezależnie od
    konta w aplikacji — limit sprawdzasz **przed** pomiarem. (L-0032)
33. Sumy kontrolne plików wędrujących przez git porównuj po normalizacji końców linii. (L-0033)

## Zakres

1. **Scenariusz A** — projekt testowy z planem i etapem `W TOKU`; `/relai:relai-branch OPIS_KART …`.
2. **Scenariusz B** — projekt testowy bez planu; ta sama komenda.
3. **Scenariusz C** — sesja startująca z `PROMPT_ODNOGA.md` istniejącej odnogi; wywołanie komendy.
4. **Scenariusz D** — świeża sesja wykonuje `odnogi/OPIS_REPO/PROMPT_ODNOGA.md` w tym repozytorium.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Cztery scenariusze wykonane świeżymi sesjami `claude -p`, każdy z zapisanym wynikiem.
- [ ] A: para plików w `odnogi/<NAZWA>/`, jedna linia w sekcji „Odnogi", **sumy sekcji `PLAN.html`
      przed i po identyczne**.
- [ ] B: komplet w `docs/fixy/<NAZWA>/`, zero plików `STATUS.md` w projekcie.
- [ ] C: odmowa z propozycją planu, **drzewo plików przed = po** co do sumy każdego pliku.
- [ ] D: odnoga OPIS_REPO zamknięta, `gh repo view nowilus/relai --json description` zwraca
      niepuste zdanie zgodne z manifestem.
- [ ] Defekt znaleziony → poprawka **i pomiar ponowny**; sama adnotacja w dzienniku nie wystarcza.
- [ ] Katalogi testowe poza repozytorium; `git status --short` bez śmieci.

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA <data>`, sekcja „Wynik" z wynikiem czterech pomiarów.
2. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: linia POMIAR_ODNOG → `ZAMKNIĘTA <data>` (a jeśli
   scenariusz D się powiódł — także linia OPIS_REPO). Tabeli etapów **nie ruszasz**.
3. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy", z liczbami z pomiaru.
   Ryzyko R2 (auto-wyzwalanie zależne od modelu) przejrzyj — ten pomiar je dotyka.
4. `docs/STATE.md` — jeśli pomiar zmienia obraz stanu narzędzia.
5. Commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
