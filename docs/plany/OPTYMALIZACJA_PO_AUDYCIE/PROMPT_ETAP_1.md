# PROMPT_ETAP_1 — Porządki widoczne od następnej sesji: dokumenty i ustawienia mówią prawdę

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E1 z E14** • Wygenerowano: 2026-11-09 (autor: Fable 5.2, przy akceptacji planu) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (etap zmienia wyłącznie dokumenty według kart z gotowym brzmieniem; karty pisano pod
> ten poziom).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | reguły wspólne wszystkich kart: kolejność pracy na karcie, „kotwica nie pasuje → stop”, gałąź, granice, niespodzianki repozytorium |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E01_PORZADKI_WIDOCZNE.md` — całość | **to jest zakres etapu**: siedem kart z kotwicami, brzmieniem docelowym i weryfikacją |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E1 w sekcji 6 (Grep `E01_PORZADKI_WIDOCZNE` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB z osadzonymi fontami) | cel etapu słowami planu |
| `docs/LEKCJE.md` — pełne brzmienie zasad 7, 11 i 14 (sekcja „Pełne brzmienie”) | zasada 7: wiersz „Tryb ciągły” jest czytany maszynowo; 11: kotwice a końce linii; 14: dowodzisz obecności nowej treści |
| `docs/DECYZJE.md` — D-14 (linia 21) i ostatnie trzy wiersze tabeli „Decyzje zmienione” | styl wiersza aneksu dla karty K-E5 |
| `.claude/relai/templates/SPEC_DZIENNIK.md` — sekcja o „Czeka na człowieka” i format wpisu | karta K-E2r: co się dzieje z pozycją rozstrzygniętą; wpis etapu |
| `docs/USTAWIENIA.md` — wiersz „Tryb ciągły” | karta K-B1p |
| `docs/STATE.md` — sekcje „Gdzie jesteśmy” i „Wersja i instalacja” | karta K-E8 i link panelu Codeksa z K-E2r |
| `docs/DZIENNIK.md` — sekcja „Czeka na człowieka” i ostatni wpis | karta K-E2r; miejsce na wpis etapu |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Rozjazd karty z repozytorium →
  zatrzymujesz się i pytasz; karty nie poprawiasz, zmianę niesie datowany aneks.
- Zakres planu (decyzja Łukasza 2026-11-09): 41 znalezisk wysokiej i średniej wagi oraz E9;
  wyjątki od zakazu znalezisk niskiej wagi wymienia `00_KONWENCJE.md`, sekcja 7 — w tym etapie
  jeden: karta K-D12 (samo pytanie do właściciela).
- Tryb ciągły: w tym etapie zmieniasz **wyłącznie wiersz projektu** w `docs/USTAWIENIA.md` na
  `wyłączony` (decyzja Łukasza 2026-11-09). Mechanizm trwałej odmowy i aneks D-93 to etap E9.
- Zasięg pluginu (znalezisko E8 raportu): poprawiasz `docs/STATE.md`. **Nie uruchamiasz**
  `relai-scope.js apply` ani `undo` (decyzja Łukasza 2026-11-09).
- Aneks do D-14 ma gotowe brzmienie w karcie K-E5 — wpisujesz je dosłownie, treści D-14 nie
  ruszasz. Aneksy D-88, D-93 i D-40 należą do etapów E8, E9 i E14.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. Świeżych sesji `claude -p` w tym etapie nie uruchamiasz.
- Wzorce z backslashem z pól „Weryfikacja” kart (np. kontrola wiersza aneksu D-14) uruchamiasz
  narzędziem Grep, nie przez powłokę (`CLAUDE.md`, L-0116).
- Granica zakresu: kod pluginu, hooki, testy i szablony to etapy E3–E13 — w E1 nie zmieniasz
  żadnego pliku pod `core/`, `adapters/`, `panel/`, `progress/`, `mods/`, `cache-keeper/`. Część
  „w kodzie” znalezisk B1, E1 i E2 mają karty K-B1 (E9), K-E1 (E10) i K-E2 (E11).

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0, plan zaakceptowany 2026-11-09. W sesji działają hooki **zainstalowanego** pluginu
3.7.0. **Gałąź `optymalizacja/po-audycie` już istnieje i jest bieżąca**: wychodzi z `main @ 5aeab39`
i ma jeden commit `docs: add RelAI audit report and post-audit optimization plan` (decyzja Łukasza
po akceptacji: „ok commituj”). `main` stoi na `5aeab39`, równy wydanemu 3.7.0.

Karta K-0 opisuje stan sprzed tego commita (gałąź `main`, pliki niezacommitowane). Stosujesz jej
pole „Pułapki”: gałąź istnieje → pracujesz na niej, bez `git switch -c`. `git log --oneline -1`
pokaże commit dokumentów planu zamiast `5aeab39` — to stan oczekiwany; zapisz jego skrót we wpisie
dziennika.

```
docs/AUDYT_RELAI_2026-11-09.md                     raport audytu, źródło znalezisk
docs/plany/OPTYMALIZACJA_PO_AUDYCIE/               folder planu
  PLAN.html                                        plan zamrożony
  STATUS.md                                        E1 GOTOWY DO STARTU, E2–E14 OCZEKUJE
  PROMPT_ETAP_1.md                                 ten plik
  karty/00_KONWENCJE.md, USTALENIA_ROBOCZE.md      reguły wspólne i fakty z pisania planu
  karty/E01_…md – E14_…md                          karty zmian, jeden plik na etap
  karty/zalaczniki/                                trzy skrypty dla etapu E11
CLAUDE.md, AGENTS.md                               linia „Aktywny plan” wskazuje STATUS planu
docs/STATE.md, docs/DZIENNIK.md                    stan planu i wpisy z 2026-11-09
adapters/*/skills/relai-planning/*-closing.md      cztery pliki ze statusem M i pustym `git diff`
                                                   (same końce linii) — stan zastany, nie ruszasz
.claude/launch.json                                nieśledzony, spoza planu — nie dodajesz do commita
```

Wiersz „Tryb ciągły” w `docs/USTAWIENIA.md` jest dziś `włączony`, więc pierwszy prompt
merytoryczny sesji wraca pytaniem bramki — odpowiedz „nie” albo zacznij od komendy `/relai-stage`.
Start sesji zgłosi też cztery sprawy przeterminowane i trzy progi dokumentów: to zwykły rytuał
startu, rozstrzygasz go z człowiekiem przed etapem i nie mieszasz z kartami.

**Czego jeszcze nie ma:** wiersza „Tryb ciągły” = `wyłączony`;
prawdziwego zdania o zasięgu pluginu w `STATE.md`; rozstrzygnięcia sprawy „Rozjazd manifestu
z produktem” i poprawnych linków w sekcjach startowych; kolejności frazy „kończymy na dziś”
w `CLAUDE.md` i `AGENTS.md` zgodnej z procedurą; wiersza aneksu D-14; odpowiedzi właściciela na
pytanie z K-D12.

**Zasady aktywne — indeks z rejestru lekcji** (stan 2026-11-09; D-15 Aneks A: start czyta indeks,
pełne brzmienie doczytujesz z `docs/LEKCJE.md` przy trafieniu w wyzwalacz):

- **1 · Specyfikacja dokumentu jest kompletna albo martwa** — piszesz albo zmieniasz specyfikację
  (`SPEC_*`), prompt etapu, regułę produkującą tekst, punkt Weryfikacji albo FAKT do sprawdzenia.
- **2 · W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — wpisujesz komendę,
  frazę albo polecenie do README, `KOMENDY.md`, skilla albo do czatu dla człowieka.
- **3 · Test „czegoś nie wolno” wymaga dowodu negatywnego** — piszesz test nieobecności, kontrolę
  „stary tekst nie może zostać” albo chronisz fragment przed zmianą.
- **4 · Dowodzisz efektem, nie zdarzeniem** — planujesz dowód zmiany: kryterium, materiał testu,
  porównanie przed i po, worktree, pomiar na żywo w przeglądarce albo w modzie.
- **5 · Instrument pomiarowy sam bywa źródłem fałszu** — piszesz wyrażenie regularne, ścieżkę
  Windows, skrypt edycji, parser albo licznik; porównujesz dwa drzewa; mierzysz sesją `claude -p`,
  terminalem albo cudzą usługą.
- **6 · Próg jest liczbą, którą ktoś liczy** — ustalasz albo zmieniasz próg, budżet, limit albo
  liczbę w komunikacie.
- **7 · Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień** — kod czyta komórkę,
  wiersz albo pole dokumentu (tabela, ustawienia, status).
- **8 · Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
  decydujesz, gdzie mieszka zachowanie (`CLAUDE.md`, hook, skill, plik doczytywany) albo stan
  pisany przez model.
- **9 · Skill nie zakłada dostępu poza katalogiem roboczym** — piszesz albo zmieniasz skill: opis,
  frazy, krok sięgający poza projekt.
- **10 · Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI** — mierzysz plugin
  wydany albo niewydany, podbijasz wersję albo wydajesz.
- **11 · Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
  warianty** — liczysz sumy, dopasowujesz nagłówek albo linię, przenosisz katalog z cudzego
  manifestu, przepisujesz regułę dostawcy.
- **12 · Guardrail zatrzymujący nie-sekret to defekt rdzenia** — hook albo bramka blokuje coś, co
  nie jest sekretem, albo piszesz bramkę czytającą wejście.
- **13 · Cudze narzędzie poznajesz z wydanego builda i z próby** — pracujesz z cudzym CLI, API
  modów, payloadem hooka, sesjami harnessu albo usługą zewnętrzną.
- **14 · Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje** — obowiązuje w każdym
  zadaniu: weryfikację planujesz tam, gdzie wykonalna; po pytaniu sprzątasz sam; jednostką
  inwentarza jest sprawa, nie linia; wstawkę kotwiczysz do elementu, który przeżyje operację,
  i dowodzisz **obecności** nowej treści. Gdy prompt etapu przeczy regule dokumentu docelowego —
  wygrywa dokument, rozjazd do dziennika. Opcja pytania, która odwołuje się do wariantu planu,
  cytuje jego definicję z planu.
- **15 · Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są
  ASCII** — dodajesz pytanie do człowieka, komponent opcjonalny albo komunikat hooka; każda praca
  nad wyglądem (mod, panel, strona, film, scena 3D, makieta).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E1/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Wykonujesz karty z `karty/E01_PORZADKI_WIDOCZNE.md` w podanej kolejności, każdą według sekcji 2
konwencji (kotwica → zmiana → weryfikacja). Etap nie ma testów do napisania. Kart nie łączysz.

1. **K-0 — gałąź robocza.** Gałąź już istnieje: sprawdzasz `git branch --show-current`; inna niż
   `optymalizacja/po-audycie` → `git switch optymalizacja/po-audycie` (bez `-c`). Plików: żadnych.
2. **K-B1p — `docs/USTAWIENIA.md`.** Wiersz „Tryb ciągły” → `wyłączony`, brzmienie z karty. Hook
   `config-protection` zapyta o zgodę na edycję tego pliku — to oczekiwane.
3. **K-E8 — `docs/STATE.md`.** Dwa miejsca ze zdaniem o trybie „RelAI tylko w projektach”; stan
   faktyczny bierzesz z `node core/tools/relai-scope.js status` (tylko odczyt).
4. **K-E2r — `docs/DZIENNIK.md` (sekcja „Czeka na człowieka”), `docs/fixy/OPIS_REPO/ODNOGA.md`,
   `docs/STATE.md`.** Pytanie do człowieka o sprawę „Rozjazd manifestu z produktem” (zamknąć albo
   zostawić), poprawka martwego linku i linku panelu Codeksa — według karty.
5. **K-E1r — `CLAUDE.md` i `AGENTS.md`.** Kolejność frazy „kończymy na dziś”: sync dokumentów,
   rotacja, sprzątanie artefaktów roboczych, wpis do dziennika, przegląd ryzyk, propozycja commita.
   Oba pliki tym samym tekstem; to sekcja poza „Implementation guidelines”.
6. **K-E5 — `docs/DECYZJE.md`.** Jeden wiersz aneksu D-14 na końcu tabeli „Decyzje zmienione”,
   brzmienie z karty, data z kontekstu sesji.
7. **K-D12 — pytanie do właściciela** o dwie linie w `docs/archiwum/dziennik/`; wskazujesz
   `plik:linia`, **wartości nie cytujesz**; edycja jednej linii tylko po odpowiedzi „zastąpić”.
8. **Git.** Bez `push`. Jeden commit etapu, proponowany w rytuale „Na koniec”; dokumenty planu
   i raport audytu są już zacommitowane na gałęzi.

Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz w tym pliku (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu,
nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] K-0: `git branch --show-current` → `optymalizacja/po-audycie`.
- [x] K-B1p: `node -e "console.log(require('./core/process/prompt-mode.js').trybCiaglyProjektu(process.cwd()))"` → `false`.
- [x] K-E8: Grep `pracuje w trybie` w `docs/STATE.md` → brak trafień; Grep `tylko w projektach`
      w `docs/STATE.md`, tryb `count` → `3`.
- [x] K-E2r: Grep `odnogi/OPIS_REPO` w `docs/DZIENNIK.md` → brak trafień; pozostałe kontrole
      z pola „Weryfikacja” karty dla wybranego przez człowieka wariantu dają podany wynik;
      odpowiedź człowieka zapisana we wpisie dziennika.
- [x] K-E1r: Grep `sync dokumentów, rotacja, sprzątanie artefaktów` → `1` w `CLAUDE.md` i `1`
      w `AGENTS.md`; Grep `sync dokumentów, wpis do dziennika` → `0` w obu;
      `node --test "core/process/tests/ritual-copies.test.js"` → 3 zielone.
- [x] Dowód negatywny dla K-E1r: `git diff CLAUDE.md` nie pokazuje żadnej zmiany poniżej nagłówka
      „Implementation guidelines (sekcja niemutowalna)”.
- [x] K-E5: Grep `D-14.. → aneks` w `docs/DECYZJE.md`, tryb `count` → `1`;
      `git diff --stat docs/DECYZJE.md` → jedna linia dodana, zero usuniętych.
- [x] K-D12: obie odpowiedzi właściciela zapisane we wpisie dziennika; przy „zostaje” brak zmian
      w `git status` dla obu plików archiwum, przy „zastąpić” `node core/guardrails/secret-scan.js <plik>` → kod 0.
- [x] Etap: `node .claude/relai/tools/start-digest.js` — w wyjściu nie ma tekstu
      `archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO` ani zdania o pracy maszyny w trybie
      „tylko w projektach” w sekcji „Gdzie jesteśmy”.
- [x] Granica: `git status --short` nie pokazuje żadnego pliku pod `core/`, `adapters/` (poza
      czterema zastanymi `*-closing.md`), `panel/`, `progress/`, `mods/`, `cache-keeper/`.
- [x] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we
      wpisie dziennika (katalog nie powstał → zapisz to wprost); (b) artefakty spoza katalogu
      wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E1 → `ZREALIZOWANY <data>`, E2 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E2 zaraz
   po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E1/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (wyjścia poleceń z Weryfikacji) / Świadomie odłożone / Do zrobienia przez człowieka; odpowiedzi
   człowieka z K-E2r i K-D12; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę „Stan
   otwartych ryzyk”; lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne”.
4. `docs/STATE.md` — zdanie o stanie planu (E1 zrealizowany, E2 gotowy). Tabeli „Stan prac”
   w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_2.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E2
   w sekcji 6 `PLAN.html`, z `karty/E02_POMIARY_NA_ZYWO.md`, z realnego stanu repozytorium po tym
   etapie (gałąź, commity, wiersz trybu ciągłego) i z lekcji tego etapu. E2 jest jednym z dwóch
   etapów, w których wolno uruchamiać `claude -p` (budżet 10 sesji).
6. Commit — propozycja, jeden commit etapu (punkt 8 zakresu); bez `git push`.
