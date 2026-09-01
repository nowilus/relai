# ODNOGA — rejestr artefaktów, którego wymaga profil `prompty`

Plan: [HIGIENA_DOKUMENTOW](../../STATUS.md) · Etap-źródło: E1 — Rotacja rusza · Utworzona:
2026-09-01 · Status: **ZAMKNIĘTA 2026-09-01** · Wykonawca: Opus

## Cel

`docs/ARTEFAKTY.md` istnieje i odpowiada na pytanie „po co" dla każdego artefaktu tego
repozytorium — specyfikacji, komend, skilli i szablonów — a hook `profile-rules` przestaje
ostrzegać przy każdej zmianie artefaktu. Reguła profilu z `CLAUDE.md` („każda zmiana artefaktu
podbija jego wersję w rejestrze") ma od tej chwili gdzie działać.

## Skąd się wzięła

Profil projektu to `prompty` (`USTAWIENIA.md`, 2026-08-21), a reguły tego profilu wymagają rejestru
artefaktów przy **pierwszym artefakcie**. Wpis dziennika z 2026-08-21 odłożył rejestr świadomie:
zmieniał się wtedy wiersz ustawień, a nie artefakt, więc warunek nie zaszedł. W E1 planu
HIGIENA_DOKUMENTOW zmieniły się cztery artefakty naraz (dwie specyfikacje, skill i reguła Cursora)
i hook `profile-rules` odezwał się przy każdej edycji. Rejestr obejmuje 31 specyfikacji, dziesięć
komend i dwa skille — to własny zakres, nie skutek uboczny etapu o rotacji.

## Zakres

1. `docs/ARTEFAKTY.md` — nowy dokument wg `.claude/relai/templates/SPEC_PROFILE.md`, sekcja
   „Profil prompty": artefakt, plik, wersja, data, co się zmieniło, po co. **Specyfikację otwierasz
   i czytasz** — układ rejestru bierzesz stamtąd, nie z pamięci.
2. Inwentarz artefaktów **skryptem, nie okiem**: `core/templates/*.md` (31 pozycji `FAKT`),
   `adapters/claude-code/commands/*.md` (10), `adapters/claude-code/skills/*/SKILL.md` (2),
   `adapters/cursor/rules/*.mdc` (3), `core/templates/HTML_PLAN/` (szablon planu). Liczby w rejestrze
   mają się zgadzać z liczbami z dysku.
3. Wersja startowa każdego artefaktu i data — z historii gita (`git log --diff-filter=A`), nie
   z domysłu. Artefakt bez wiarygodnej daty dostaje jawny dopisek zamiast zgadywanej wartości.
4. `docs/STATE.md` — jedno zdanie, że rejestr istnieje; `CLAUDE.md` bez zmian (reguła profilu już
   tam stoi).

## Poza zakresem

- **Zmiana jakiegokolwiek artefaktu.** Rejestr opisuje stan zastany; poprawianie opisywanych plików
  jest osobną pracą.
- **Rotacja i progi rejestru** — `ARTEFAKTY.md` nie wchodzi do warstwy startowej sesji ani do
  budżetu; progi dokumentów są zakresem E4 planu HIGIENA_DOKUMENTOW.
- **Wersjonowanie wsteczne** — nie odtwarzasz historii wersji artefaktu sprzed rejestru; rejestr
  zaczyna liczyć od dziś, z jawną adnotacją o tym.
- **Katalog `docs/archiwum/artefakty/`** — powstaje dopiero przy pierwszej datowanej kopii (D-11).
  Nazwa rozstrzygnięta 2026-09-01: `artefakty`, zgodnie z `SPEC_PROFILE.md` i `CLAUDE.md`.

## Weryfikacja

- [x] `docs/ARTEFAKTY.md` istnieje i ma wszystkie kolumny wymagane przez `SPEC_PROFILE.md`,
      sekcja „Profil prompty" — sprawdzone czytaniem specyfikacji w tej sesji, nie z pamięci.
      Sześć kolumn: Artefakt · Plik · Wersja · Data · Co się zmieniło · Po co.
- [x] Liczba pozycji rejestru zgadza się z liczbą plików na dysku, wypisaną komendą; rozbieżność
      jest wypisana jawnie razem z powodem, a nie ukryta. **38 pozycji** = 22 + 1 + 10 + 2 + 3;
      rozbieżność „31 specyfikacji" wyjaśniona w sekcji „Zgodność liczb z dyskiem".
- [x] Zmiana dowolnego artefaktu w tej sesji (choćby dopisanie spacji i jej cofnięcie) **nie**
      wywołuje już ostrzeżenia hooka `profile-rules` o braku rejestru — dowód z wyjścia hooka.
      Hook uruchomiony na **39 ścieżkach w dwóch wariantach jednego przebiegu**: bez rejestru
      **33 ostrzeżenia**, z rejestrem **0**.
- [x] `node core/tools/validate-adapters.js` kończy się kodem 0 — „spojne", wersja 1.6.1 z trzech
      źródeł.
- [x] `git status --short` nie pokazuje plików spoza zakresu tej odnogi. Widoczny jest wyłącznie
      `docs/ARTEFAKTY.md` oraz `docs/AUDYT_2026-08-22.html` — ten drugi był nieśledzony **przed**
      tą sesją i nie został tknięty.

## Wynik

**Powstał `docs/ARTEFAKTY.md`** — 38 pozycji w pięciu tabelach (22 specyfikacje `core/templates/`,
szablon planu HTML jako jeden artefakt złożony, 10 komend, 2 skille, 3 reguły Cursora), każda
z sześcioma kolumnami wymaganymi przez `SPEC_PROFILE.md`. Wersja `1` dla wszystkich — rejestr liczy
od 2026-09-01, co jest w dokumencie napisane wprost. Daty pochodzą z `git log --diff-filter=A
--follow`, a kolumna „Co się zmieniło" niesie datę ostatniej zmiany z gita, żeby było widać, które
artefakty żyją.

**Rozbieżność wypisana, nie ukryta:** karta tej odnogi i hook `session-context` mówiły o **31
specyfikacjach**. Na dysku plików `.md` w `core/templates/` jest **22** (21 × `SPEC_*` + `README`);
31 to liczba **plików** kopii w `.claude/relai/templates/` razem z dziewięcioma z `HTML_PLAN/`
(22 + 9). Rejestr trzyma się stanu z dysku.

**Czego nie zrobiono i dlaczego:** żaden opisywany artefakt nie został tknięty (zakres), nie powstał
katalog archiwum artefaktów (D-11 — przy pierwszej kopii), nie odtwarzano historii wersji sprzed
rejestru (decyzja z promptu), `CLAUDE.md` bez zmian.

**Dwa fakty dla człowieka, wyszły z pomiaru hooka** — oba poza zakresem tej odnogi, bo wymagają
zmiany kodu hooka albo specyfikacji:

1. **`profile-rules` nie widzi sześciu z 39 artefaktów.** Funkcja `jestArtefaktem()` przepuszcza
   tylko `.md|.txt|.prompt|.tmpl|.j2` i wyklucza każdy `README.md`, więc trzy reguły Cursora
   (`.mdc`), dwa pliki `HTML_PLAN/*.html` i `core/templates/README.md` nie wyzwalają reguły profilu
   nigdy. W rejestrze są, ale ich zmiana nie przypomni o podbiciu wersji.
2. **Nazwa katalogu archiwum artefaktów rozjeżdżała się między dokumentami.** `SPEC_PROFILE.md`
   i `CLAUDE.md` mówią `docs/archiwum/artefakty/`, a karta i prompt tej odnogi mówiły
   `artefaktow/`. *(rozstrzygnięte 2026-09-01 — decyzja użytkownika: `artefakty`; dokumenty odnogi
   poprawione, warstwa nośna była już zgodna)*

**Obie sprawy zamknięte 2026-09-01 decyzją użytkownika**, w turze po zamknięciu odnogi:
`.mdc` wchodzi do `jestArtefaktem()` (pomiar po zmianie: bez rejestru **36** ostrzeżeń zamiast 33,
z rejestrem nadal **0**), nazwa katalogu to `artefakty`. Poza zasięgiem hooka zostają świadomie
`core/templates/HTML_PLAN/*.html` i `core/templates/README.md` — o nie decyzja nie padła.
