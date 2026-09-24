# PROMPT_ODNOGA — opis repozytorium na GitHubie

Odnoga: OPIS_REPO • Plan-rodzic: ROZWOJ_PO_WYDANIU, etap E1 • Wygenerowano: 2026-08-12
(autor: Opus) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md` | cel, zakres i weryfikacja — karta jest źródłem, ten prompt ją wykonuje |
| `.claude-plugin/plugin.json` | pola `description` i `keywords` — źródło brzmienia opisu i tematów; niczego nie wymyślasz |
| `README.md` | pierwsze zdanie wizytówki — opis repo ma z nim współgrać, nie przeczyć |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Repo jest publiczne** od 2026-08-12 (FAKT, `gh repo view` → `"visibility":"PUBLIC"`).
  Widoczności nie zmieniasz.
- Opis jest **po angielsku** — to warstwa czytana przez świat, nie dokument projektu
  (`docs/USTAWIENIA.md`, wiersz o językach z 2026-08-12).
- Brzmienie opisu bierzesz z `description` w `.claude-plugin/plugin.json`. Rozbieżność między
  manifestem a repo jest tym, co ta odnoga likwiduje — nie mnożysz trzeciego brzmienia.
- Tematy repo pochodzą z `keywords` manifestu. Nowych słów kluczowych nie wymyślasz (D-80: zakres
  v1 jest zamknięty, a tematy są jego wizytówką).
- `homepageUrl` zostaje pusty — decyzja o stronie projektu nie zapadła.
- **Nie ruszasz planu głównego.** `PLAN.html` planu ROZWOJ_PO_WYDANIU jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.
- **Granica wobec E8:** wydanie 2.0.0, sekcje README per narzędzie i dystrybucja to etap E8 —
  w tej odnodze ich nie zaczynasz i nie obiecujesz (L-0002).

## Stan wyjściowy — co realnie zastajesz

RelAI 1.1.0 wydany i zainstalowany; repo `github.com/nowilus/relai` jest publiczne, ma README
z bannerem i ikonami (od 2026-08-10) i **pusty opis**. Sprawdzone 2026-08-12:
`gh repo view nowilus/relai --json description,repositoryTopics,homepageUrl` →
`{"description":"","homepageUrl":"","repositoryTopics":null}` (FAKT).

```
.claude-plugin/plugin.json      # description + keywords — źródło brzmienia
README.md                       # wizytówka repo: banner, tabela komend, sekcja „Skąd wiadomo…"
docs/zasoby/branding/           # banner i ikony komend (gotowe, nie ruszasz)
```

**Czego jeszcze NIE ma (to jest zakres tej odnogi):** opisu repozytorium i tematów po stronie
GitHuba. W repozytorium **nie brakuje niczego** — to zmiana wyłącznie w ustawieniach repo.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu. (L-0003)
4. Zachowania skilli mierzysz realnie — świeżą sesją; po zmianie skilla: push → `marketplace
   update` → `plugin update`. (L-0004, L-0020)
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

## Zakres

1. **Opis repozytorium** — `gh repo edit nowilus/relai --description "<zdanie z manifestu>"`.
2. **Tematy repozytorium** — `gh repo edit nowilus/relai --add-topic …` dla każdego słowa
   z `keywords` manifestu.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `gh repo view nowilus/relai --json description` zwraca niepuste zdanie, identyczne
      z `description` z `.claude-plugin/plugin.json`.
- [ ] `gh repo view nowilus/relai --json repositoryTopics` zwraca listę zgodną z `keywords`
      manifestu (co do zestawu, nie kolejności).
- [ ] Żaden plik w repozytorium nie został zmieniony przez samą zmianę opisu — `git status --short`
      pokazuje wyłącznie dokumenty zamknięcia odnogi.

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona (co ustawiono, jakim
   brzmieniem, z jakim wynikiem weryfikacji).
2. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: linia tej odnogi w sekcji „Odnogi" →
   `ZAMKNIĘTA <data>`. Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
3. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka).
4. `docs/STATE.md`: sekcja „Co blokuje" — zdanie o pustym opisie repo przestaje być prawdą.
5. Commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
