# PROMPT_ETAP_3 — Poprawki z retrospektywy: decyzje po adopcji, spójność stanu, podpis, bramki (RelAI 1.3.0)

Plan: ROZWOJ_PO_WYDANIU • Etap: **E3 z E8** • Wygenerowano: 2026-08-12 (autor: Opus, w rytuale
„Na koniec" etapu E2) • Wykonawca: **Opus** (linia metryczna `STATUS.md`: „Opus — z ustawień
projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + ostatni wpis (E2 — co powstało i czego NIE zmierzono) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (34 pozycje) |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 3 (retrospektywa — liczby z JiraManagera i PolyFlow), sekcja 6 (zakres E3), sekcja 8 (przypadki brzegowe) |
| `commands/relai-adopt.md` | krok generacji dokumentów i scalanie `CLAUDE.md` (D-71) — tu wchodzi przekierowanie decyzji |
| `templates/SPEC_DECYZJE.md` | format wpisu `D-NN` — cel przekierowania musi być zgodny z tym, co adopcja generuje |
| `templates/SPEC_STATUS.md` | tabela etapów i sekcja „Odnogi" — tu dochodzi widoczność bramek manualnych |
| `templates/SPEC_DZIENNIK.md` | linia autora `Autor: RelAI (<model>) + <użytkownik>` oraz sekcja „Do zrobienia przez człowieka" — źródło bramek |
| `skills/relai-planning/SKILL.md` | sekwencja zamknięcia planu (D-36, osiem kroków) — tu wchodzi kontrola bramek |
| `skills/relai-core/SKILL.md` | definicja ukończenia (D-44) i rytuały sesji — tu wchodzi spójność STATE/STATUS/CLAUDE |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Scalanie `CLAUDE.md` przy adopcji zostaje** (D-71): zastane reguły cudzego projektu są ważniejsze
  niż limit 60 linii. Problemem nie jest scalanie, tylko to, że **nowe** decyzje podejmowane po
  adopcji dopisują się do zastanej tabeli w `CLAUDE.md` zamiast do pustego `DECYZJE.md`.
- **Rejestry mają rozłączne role** (D-15): `LEKCJE` — zachowanie agenta, `DECYZJE` — rozstrzygnięcia
  w projekcie, `USTAWIENIA` — odpowiedzi na pytania o preferencje. Etap tego podziału nie zmienia,
  tylko go egzekwuje po adopcji.
- **Podpis jest neutralny** (D-63): `Autor: RelAI (<model>) + <użytkownik z git config>`, bez persony.
  Format już jest w `SPEC_DZIENNIK.md` — brakuje egzekwowania (dwa wpisy pilotażu podpisane
  `RelAI (Haiku)` bez członu użytkownika).
- **Plan zamrożony po akceptacji** (D-33) i zamykany sekwencją D-36. Bramki dokładasz **do sekwencji
  i do `STATUS.md`**, nie do `PLAN.md`.
- **Rotacja dokumentów jest zamknięta w E2** — progi, wyłącznik i `SPEC_ARCHIWUM.md` są gotowe;
  niczego w nich nie przerabiasz bez wyniku pomiaru z odnogi `POMIAR_ODNOG`.
- Wersja tego etapu: **1.3.0**. Numer żyje w `plugin.json`, `marketplace.json`, obu skillach,
  `/relai-update`, `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README i markerze tego
  repo — L-0008 obowiązuje.
- **Granica zakresu:** rdzeń przenośny, guardrails jako czyste skrypty i git pre-commit ze skanem
  sekretów to **E4**; adaptery Cursor/Codex to E5 i E7. Niczego z nich nie zaczynasz i nie
  obiecujesz w dokumentach użytkownika (L-0002).

## Stan wyjściowy — co realnie zastajesz

RelAI **1.2.0** w repozytorium (E2 zamknięty 2026-08-12 — rotacja dokumentów). **Uwaga o warunkach
pracy:** zainstalowany plugin może nadal pokazywać 1.1.0, dopóki człowiek nie wykona push →
`claude plugin marketplace update relai` → `claude plugin update relai@relai` → **restart aplikacji**
(L-0031). Wersję potwierdź `installed_plugins.json` (L-0020), nie pamięcią.

```
.claude-plugin/plugin.json      # manifest, wersja 1.2.0
.claude-plugin/marketplace.json # marketplace, wersja 1.2.0
commands/relai-adopt.md         # adopcja: backup-bramka, analiza, generacja, scalanie CLAUDE.md, raport
commands/relai-update.md        # aktualizacja do 1.2.0 — tabela stanu docelowego z wierszem rotacji
skills/relai-core/SKILL.md      # rytuały sesji; rytuał zamknięcia ma teraz krok 2 „Rotacja dokumentów"
skills/relai-planning/SKILL.md  # plany, odnogi, rytuał „Na koniec", sekwencja zamknięcia planu (8 kroków)
templates/                      # 20 SPEC_*.md (od 1.2.0 z SPEC_ARCHIWUM) + README + HTML_PLAN/
docs/plany/ROZWOJ_PO_WYDANIU/   # PLAN.html (zamrożony), STATUS.md, PROMPT_ETAP_1..3, odnogi/
```

**Dwie odnogi planu są OTWARTE** i nie należą do tego etapu: `OPIS_REPO` (opis repozytorium na
GitHubie) oraz `POMIAR_ODNOG` (sześć scenariuszy pomiaru świeżą sesją — cztery z E1, dwa z E2).

**Czego jeszcze NIE ma (to jest zakres tego etapu):**

- adopcja nie mówi nigdzie, że **decyzje podjęte po niej** idą do `DECYZJE.md`, a nie do zastanej
  tabeli w scalonym `CLAUDE.md` (JiraManager: 8 takich decyzji `FAKT`),
- nic nie pilnuje **spójności trzech dokumentów przy etapie `W TOKU`**: `STATUS.md` mówi „W TOKU",
  a `STATE.md` i linia „Aktywny plan" w `CLAUDE.md` potrafią mówić co innego,
- podpis w dzienniku **nie ma egzekwowanej formy** — `SPEC_DZIENNIK.md` ją opisuje, ale nic nie
  wyłapuje wpisu bez członu użytkownika,
- **otwarte bramki manualne są niewidoczne w `STATUS.md` planu**: plan potrafi być „ZREALIZOWANY"
  przy kilkunastu pozycjach „Do zrobienia przez człowieka" czekających w dzienniku (PolyFlow `FAKT`).

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest
   martwa. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do
   `KOMENDY.md` dopiero w wersji, w której realnie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Zachowania skilli mierzysz **realnie** — świeżą sesją `claude -p … --output-format stream-json`
   i liczbą wywołań narzędzia `Skill`. Po zmianie skilla: push → `claude plugin marketplace update
   relai` → `claude plugin update relai@relai`, inaczej mierzysz starą wersję. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta w skillu, sprawdź, czy da się je zweryfikować z wnętrza sesji
   wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa. (L-0005)
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
    od konta zalogowanego w aplikacji** — konto i limit sprawdzasz przed pomiarem. (L-0032)
33. Sumy kontrolne plików wędrujących przez git porównuj po normalizacji końców linii. (L-0033)
34. Próg liczbowy w mechanizmie automatycznym kalibrujesz na **zmierzonych** plikach realnych
    projektów — próg powyżej obserwowanego maksimum jest martwy. (L-0034)

## Zakres etapu

1. **Decyzje po adopcji trafiają do `DECYZJE.md`** — `commands/relai-adopt.md` (krok generacji
   i raportu) oraz `skills/relai-core/SKILL.md` (sekcja o rejestrach): po scaleniu `CLAUDE.md`
   zastana tabela decyzji jest **archiwum**, a każde nowe rozstrzygnięcie idzie do `DECYZJE.md`.
   Reguła musi wejść także do generowanego `CLAUDE.md` projektu adoptowanego (L-0030: warstwa
   zawsze-w-kontekście niesie regułę) — brzmienie do `templates/SPEC_CLAUDE_MD.md`.
2. **Spójność `STATUS` ↔ `STATE` ↔ `CLAUDE` przy etapie `W TOKU`** — jeden mechanizm, nie trzy:
   `skills/relai-core/SKILL.md` (rytuał startu sesji) wykrywa rozjazd i zgłasza go jednym zdaniem,
   a `hooks/session-context.js` podaje surowe fakty do porównania. Rozstrzygnij w prompcie, czy
   sygnał zgłasza hook, czy skill — i **nie dubluj** komunikatu.
3. **Jeden format podpisu** — `templates/SPEC_DZIENNIK.md` (doprecyzowanie brzmienia i przypadku
   „git nieskonfigurowany") plus egzekwowanie: wpis dopisany bez członu `+ <użytkownik>` przy
   skonfigurowanym gicie ma zostać wyłapany. Miejsce egzekwowania wybierasz świadomie (hook
   `docs-reminder` albo rytuał zamknięcia) i uzasadniasz w dzienniku.
4. **Otwarte bramki manualne widoczne w `STATUS.md`** — `templates/SPEC_STATUS.md`: sekcja
   „Bramki manualne" (albo równoważna) z pozycjami „Do zrobienia przez człowieka", które są
   nierozstrzygnięte; `skills/relai-planning/SKILL.md`: sekwencja zamknięcia planu (D-36) wylicza
   je przed ogłoszeniem `ZREALIZOWANY` i pyta, tak jak dziś pyta o otwarte odnogi.
5. **`templates/SPEC_KOMENDY.md`** — zachowania automatyczne dopisane efektem, w języku użytkownika.
6. **`commands/relai-update.md`** — wiersze stanu docelowego 1.3.0 dla projektów aktualizowanych.
7. **Dogfooding** — sprawdź te cztery poprawki na **tym** repozytorium i na projekcie testowym poza
   nim; rozjazd wykryty w dokumentach RelAI napraw w tej samej turze.
8. **Wersja 1.3.0** w miejscach z sekcji „Decyzje już podjęte"; `git grep -n "1\.2\.0"`
   i rozstrzygnięcie każdego trafienia (L-0008).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate` → „Validation passed"; jedyne ostrzeżenie to znane root
      `CLAUDE.md` (L-0003).
- [ ] Numer 1.3.0 spójny we wszystkich miejscach z punktu 8; `git grep -n "1\.2\.0"` zwraca
      wyłącznie trafienia historyczne.
- [ ] **Decyzja po adopcji ląduje w `DECYZJE.md`:** na projekcie testowym po adopcji (z zastaną
      tabelą decyzji w `CLAUDE.md`) nowe rozstrzygnięcie dopisuje wpis `D-NN` w `DECYZJE.md`,
      a zastana tabela w `CLAUDE.md` ma **nadal pierwotne brzmienie** — dowód negatywny na sumie
      kontrolnej tej sekcji (L-0007).
- [ ] **Rozjazd stanu jest wykrywany:** projekt testowy z etapem `W TOKU` w `STATUS.md` i linią
      „Aktywny plan: brak" w `CLAUDE.md` → sygnał na starcie sesji, **dokładnie jeden** (nie dwa
      z hooka i ze skilla). Projekt spójny → cisza (dowód negatywny).
- [ ] **Podpis:** wpis dopisany bez członu `+ <użytkownik>` przy skonfigurowanym gicie zostaje
      wyłapany; wpis poprawny przechodzi bez komunikatu.
- [ ] **Bramki:** plan testowy z dwiema nierozstrzygniętymi pozycjami „Do zrobienia przez
      człowieka" nie daje się zamknąć bez pytania o nie; po rozstrzygnięciu (adnotacja
      „*(rozstrzygnięte …)*") sekwencja zamknięcia przebiega bez pytania.
- [ ] Dokumenty tego repozytorium sprawdzone tą samą miarą: `STATUS.md` planu, `STATE.md`
      i linia „Aktywny plan" w `CLAUDE.md` mówią to samo.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" (komplet czterech sekcji), `docs/STATE.md`
      nadpisany, `templates/SPEC_KOMENDY.md` z nowymi zachowaniami; foldery testowe poza
      repozytorium (`git status --short` bez śmieci).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_4.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcji „Odnogi"
   **nie ruszasz** — chyba że w trakcie etapu któraś została domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę ryzyk — **R5 (dokumenty puchną)**
   dotyka tego etapu przez `CLAUDE.md` JiraManagera (639 linii); rozstrzygnij, czy poprawki
   obniżają poziom. Lekcje z etapu → `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje o stanie pluginu (wersja 1.3.0, cztery poprawki).
4. **Wygeneruj `PROMPT_ETAP_4.md`** (rdzeń przenośny) ze specyfikacji promptu etapowego: na bazie
   sekcji 5 i 6 (E4) planu, realnego stanu repo po tym etapie i lekcji z tego etapu.
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi sekwencję:
   push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → restart
   aplikacji (L-0031).
