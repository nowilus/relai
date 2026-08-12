# PROMPT_ETAP_1 — Odnoga planu: komenda `/relai-branch` i sygnał odchylenia (RelAI 1.1.0)

Plan: ROZWOJ_PO_WYDANIU • Etap: **E1 z E8** • Wygenerowano: 2026-08-12 (autor: Fable, przy
akceptacji planu) • Wykonawca: **Opus** (linia metryczna STATUS.md: „Opus — z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + dwa ostatnie wpisy (retrospektywa 2026-08-12 i akceptacja planu — tam są zmierzone bóle, które ten etap zamyka) |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 5 „Odnoga planu" (przebieg 1–5), sekcja 6 (zakres E1), sekcja 8 (trzy przypadki brzegowe odnogi), sekcja 10 (Aneks A) |
| `templates/SPEC_PROMPT_ETAPU.md` | wzorzec samowystarczalnego promptu — `PROMPT_ODNOGA` ma być jego lżejszym kuzynem, nie nowym wynalazkiem |
| `templates/SPEC_STATUS.md` | tu dopiszesz sekcję „Odnogi" |
| `templates/SPEC_KOMENDY.md` | tu dopiszesz wiersz `/relai-branch` do generowanej ściągi |
| `templates/SPEC_CLAUDE_MD.md` | tu dopiszesz regułę sygnału odchylenia (warstwa nośna, L-0030) |
| `skills/relai-planning/SKILL.md` | tu wchodzi procedura odnogi i sygnał odchylenia |
| `commands/relai-stage.md` | wzorzec struktury pliku komendy (frontmatter, kroki, zakazy) |
| `docs/USTAWIENIA.md` | preferencje projektu; sekwencja po zmianie skilla (push → marketplace update → plugin update → restart) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Odnoga to **komenda `/relai-branch`**, nie rozbudowa MINIPLAN-u ani typ aneksu — wariant wybrany
  w sekcji 4 planu (wywiad 2026-08-12).
- Odnoga mieszka w `docs/plany/<TEMAT>/odnogi/<NAZWA>/`: **karta odnogi** (cel / zakres /
  weryfikacja — format miniplanu) + **`PROMPT_ODNOGA.md`** (samowystarczalny prompt świeżej
  sesji, generowany z realnego stanu repo i aktywnych lekcji, jak prompty etapowe) — sekcja 5
  planu.
- `STATUS.md` planu głównego dostaje sekcję „Odnogi": jedna linia na odnogę, status
  OTWARTA/ZAMKNIĘTA. Sekcje 1–9 zamrożonego planu pozostają nietknięte — to jest twardy warunek
  celu 1 (sumy kontrolne).
- **Bez aktywnego planu komenda też działa**: tworzy samodzielny wątek w `docs/fixy/<NAZWA>/`
  z tym samym promptem; w STATUS nic nie pisze (sekcja 8 planu).
- **Odnoga od odnogi = zakaz**, jedna głębokość; komenda mówi to wprost i proponuje pełny plan
  (sekcja 8 planu).
- **Zamknięcie planu z otwartą odnogą**: wyliczyć odnogi i zapytać — zamknąć / przenieść do
  `docs/fixy/` jako samodzielne; bez decyzji plan się nie zamyka (sekcja 8 planu).
- **Sygnał odchylenia**: gdy w trakcie etapu rodzi się wątek spoza zakresu, agent zadaje
  ustrukturyzowane pytanie (AskUserQuestion): odnoga / aneks / świadomie odłożone. Regułę niesie
  `CLAUDE.md` projektu (wzorzec L-0030 — warstwa zawsze w kontekście), procedurę skill
  `relai-planning` (sekcja 5 planu, pkt 1).
- Opisy wyzwalania: fraza naturalna i opis komendy wg L-0009 (płaska lista dosłownych fraz).
- Wersja tego etapu: **1.1.0** (sekcja 6 planu). Numer żyje w `plugin.json`,
  `marketplace.json`, obu skillach i `/relai-update` — L-0008 obowiązuje.
- **Granica zakresu:** rotacja dokumentów to E2, poprawki adopcji/podpisów/bramek to E3, rdzeń
  przenośny i pre-commit to E4 — niczego z tych etapów nie zaczynaj i nie obiecuj w dokumentach
  użytkownika (L-0002).

## Stan wyjściowy — co realnie zastajesz

RelAI 1.0.0 wydany, plan BUDOWA_RELAI zamknięty i zarchiwizowany; plan ROZWOJ_PO_WYDANIU
zaakceptowany 2026-08-12 (Aneks A). Plugin zainstalowany globalnie (scope `user`); po każdej
zmianie skilla obowiązuje sekwencja push → `claude plugin marketplace update relai` →
`claude plugin update relai@relai` → **restart aplikacji** (L-0031). Repo
`github.com/nowilus/relai` jest **publiczne** (FAKT, zweryfikowane 2026-08-12), opis repo pusty.

```
.claude-plugin/plugin.json      # manifest, wersja 1.0.0
.claude-plugin/marketplace.json # marketplace, wersja 1.0.0
skills/relai-core/SKILL.md      # 518 linii: stany folderu, rytuały, profile
skills/relai-planning/SKILL.md  # 461 linii: PLAN/MINIPLAN, zamrożenie, prompty etapowe
commands/                       # 9 komend: adopt, audit, backup, changelog, handover,
                                #   help, stage, tour, update
hooks/                          # 9 hooków Node bez zależności + hooks.json
templates/                      # 18 SPEC_*.md + README + HTML_PLAN/
docs/plany/ROZWOJ_PO_WYDANIU/   # PLAN.html (zamrożony, Aneks A) + STATUS.md + ten prompt
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** komendy `/relai-branch`, specyfikacji
karty odnogi i `PROMPT_ODNOGA`, sekcji „Odnogi" w `SPEC_STATUS.md`, sygnału odchylenia
w `relai-planning` i w `SPEC_CLAUDE_MD.md`, wiersza `/relai-branch` w `SPEC_KOMENDY.md`.
Boczne wątki lądują dziś wpisami poprawek w tej samej sesji — dowód: 5 wpisów E3b
w JiraManagerze, 6 aneksów E2 w PolyFlow (FAKT, retrospektywa 2026-08-12).

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

## Zakres etapu

1. **`templates/SPEC_ODNOGA.md`** (nowy) — specyfikacja karty odnogi
   (`docs/plany/<TEMAT>/odnogi/<NAZWA>/ODNOGA.md`: cel / zakres / weryfikacja / status / link do
   etapu-źródła) **i** `PROMPT_ODNOGA.md` (struktura wzorowana na `SPEC_PROMPT_ETAPU.md`,
   odchudzona: nagłówek, linia metryczna z planem-rodzicem, kontrola modelu, co przeczytać,
   decyzje podjęte + granica „nie ruszasz planu głównego", stan wyjściowy z zasadami aktywnymi,
   zakres, weryfikacja, rytuał zamknięcia odnogi). Wariant bez planu: te same pliki
   w `docs/fixy/<NAZWA>/`. Z realnym, kompletnym przykładem (L-0001).
2. **`commands/relai-branch.md`** (nowy) — procedura: wykrycie aktywnego planu → pytanie o nazwę
   i cel (jedno wywołanie AskUserQuestion, jeśli nie padły w prompcie) → generacja karty
   i promptu wg `SPEC_ODNOGA.md` (czytanej z `.claude/relai/templates/`, L-0012) → wpis do
   sekcji „Odnogi" STATUS → instrukcja „świeża sesja + wklej PROMPT_ODNOGA". Frontmatter
   i zakazy wzorem `relai-stage.md`; procedura wpisana w komendę albo jawne wczytanie skilla
   (L-0015). Obsłużone brzegi: brak planu → `docs/fixy/`; wywołanie z sesji odnogi → odmowa
   i propozycja planu.
3. **`templates/SPEC_STATUS.md`** — sekcja „Odnogi" (po tabeli etapów, przed dziennikiem
   wdrożenia): format linii, statusy OTWARTA/ZAMKNIĘTA, zasada „zamknięcie planu wylicza
   otwarte odnogi i pyta". Zaktualizowany przykład na końcu specyfikacji (L-0001).
4. **`skills/relai-planning/SKILL.md`** — dwie zmiany: (a) sygnał odchylenia — procedura
   ustrukturyzowanego pytania odnoga/aneks/odłożone, z warunkiem wyzwolenia (wątek spoza zakresu
   etapu w trakcie pracy); (b) sekcja „Odnogi planu" z procedurą komendy i zasadą jednej
   głębokości. Rytuał zamknięcia planu uzupełniony o krok wyliczenia otwartych odnóg.
5. **`templates/SPEC_CLAUDE_MD.md`** — reguła sygnału odchylenia do sekcji reguł procesu
   generowanego `CLAUDE.md` (jedno-dwa zdania w trybie rozkazującym; warstwa nośna, L-0030).
6. **`templates/SPEC_KOMENDY.md`** — wiersz `/relai-branch` (forma zmierzona:
   `/relai:relai-branch`, L-0022) z jednozdaniowym opisem.
7. **Wersja 1.1.0**: `plugin.json`, `marketplace.json`, nagłówki obu skilli, odwołanie
   w `/relai-update`; `grep` po `1.0.0` i rozstrzygnięcie każdego trafienia (L-0008).
8. **Dogfooding**: po instalacji nowej wersji (sekwencja L-0004 + restart, L-0031) wykonaj
   `/relai:relai-branch` na tym repo dla realnego bocznego wątku „opis repo na GitHubie"
   (Aneks A zostawił go pusty) — powstała odnoga jest jednocześnie testem akceptacyjnym.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate` → „Validation passed"; jedyne ostrzeżenie to znane root
      `CLAUDE.md` (L-0003).
- [ ] Numer 1.1.0 spójny: `plugin.json`, `marketplace.json`, oba skille, `/relai-update`;
      `git grep -n "1\.0\.0"` zwraca wyłącznie trafienia historyczne (dziennik, STATUS, archiwum).
- [ ] `installed_plugins.json` pokazuje 1.1.0 z nowym `gitCommitSha` **po** restarcie aplikacji
      (L-0020, L-0031) — punkt wykonalny dopiero po kroku człowieka; do tego czasu oznaczony
      „czeka na restart".
- [ ] Projekt testowy z aktywnym planem: `/relai:relai-branch` tworzy
      `docs/plany/<TEMAT>/odnogi/<NAZWA>/` z `ODNOGA.md` i `PROMPT_ODNOGA.md`, STATUS dostaje
      linię w sekcji „Odnogi".
- [ ] **Dowód zamrożenia:** sumy kontrolne sekcji 1–9 `PLAN.html` projektu testowego przed i po
      utworzeniu odnogi są identyczne (L-0007).
- [ ] Projekt testowy bez planu: ta sama komenda tworzy `docs/fixy/<NAZWA>/` z kompletem;
      w żadnym STATUS nie przybywa linia.
- [ ] **Dowód zakazu głębokości:** wywołanie z kontekstu odnogi kończy się odmową i propozycją
      planu; żaden plik nie powstaje (dowód negatywny: drzewo plików przed = po).
- [ ] `PROMPT_ODNOGA.md` z dogfoodingu jest samowystarczalny: świeża sesja `claude -p` (stdin,
      `--permission-mode acceptEdits`, L-0024) wykonuje odnogę bez pytań o rzeczy rozstrzygnięte.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" (komplet czterech sekcji), `docs/STATE.md`
      nadpisany, `templates/SPEC_KOMENDY.md` z nowym wierszem; foldery testowe uprzątnięte.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E1 → ZREALIZOWANY (data), E2 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_2.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę ryzyk (P1/P2 z planu są już
   wpisane; E1 ich nie zamyka). Lekcje z etapu → `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje o stanie pluginu (wersja 1.1.0, nowa komenda).
4. **Wygeneruj `PROMPT_ETAP_2.md`** (rotacja dokumentów) ze specyfikacji promptu etapowego: na
   bazie sekcji 5 „Rotacja" i 6 (E2) planu, realnego stanu repo po tym etapie i lekcji z tego
   etapu. Pamiętaj o decyzjach z Aneksu A (zgoda na auto-rotację w istniejących projektach).
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi
   sekwencję: push → `claude plugin marketplace update relai` → `claude plugin update
   relai@relai` → restart aplikacji (L-0031).
