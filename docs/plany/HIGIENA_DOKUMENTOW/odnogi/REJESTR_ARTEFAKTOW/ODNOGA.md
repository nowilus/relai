# ODNOGA — rejestr artefaktów, którego wymaga profil `prompty`

Plan: [HIGIENA_DOKUMENTOW](../../STATUS.md) · Etap-źródło: E1 — Rotacja rusza · Utworzona:
2026-09-01 · Status: **OTWARTA** · Wykonawca: Opus

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
- **Katalog `docs/archiwum/artefaktow/`** — powstaje dopiero przy pierwszej datowanej kopii (D-11).

## Weryfikacja

- [ ] `docs/ARTEFAKTY.md` istnieje i ma wszystkie kolumny wymagane przez `SPEC_PROFILE.md`,
      sekcja „Profil prompty" — sprawdzone czytaniem specyfikacji w tej sesji, nie z pamięci.
- [ ] Liczba pozycji rejestru zgadza się z liczbą plików na dysku, wypisaną komendą; rozbieżność
      jest wypisana jawnie razem z powodem, a nie ukryta.
- [ ] Zmiana dowolnego artefaktu w tej sesji (choćby dopisanie spacji i jej cofnięcie) **nie**
      wywołuje już ostrzeżenia hooka `profile-rules` o braku rejestru — dowód z wyjścia hooka.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] `git status --short` nie pokazuje plików spoza zakresu tej odnogi.

## Wynik

*(pusta do czasu zamknięcia)*
