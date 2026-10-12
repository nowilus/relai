# Prompty etapowe (D-34)

Plik doczytywany skilla `relai-planning`. Otwierasz go, zanim wygenerujesz `PROMPT_ETAP_N.md`:
przy akceptacji planu, w kroku 5 rytuału „Na koniec” albo po zgodzie na dogenerowanie brakującego
promptu zgłoszonego na starcie sesji.

Etap wykonuje się w **świeżej sesji**, która nie zna poprzedniej. Całą jej pamięcią jest
`PROMPT_ETAP_N.md` w folderze planu — dokument samowystarczalny, którego format opisuje
`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`. Etap uruchamia komenda `/relai-stage`.

## Kiedy powstaje

Generacja jest **lazy** — dokładnie trzy momenty, nigdy na zapas:

| Moment | Co powstaje |
|---|---|
| Akceptacja planu | `PROMPT_ETAP_1.md` |
| Rytuał „Na koniec" etapu N | `PROMPT_ETAP_N+1.md` |
| Start sesji, gdy etap `GOTOWY DO STARTU` nie ma promptu | brakujący prompt — siatka bezpieczeństwa w `relai-core` |

Powód: prompt opisuje **realny stan repozytorium** w chwili startu etapu. Prompt napisany dwa etapy
wcześniej opisywałby stan zmyślony. Prompt etapu już zrealizowanego zostaje bez zmian.

## Zanim wygenerujesz prompt — przeczytaj specyfikację

**Otwórz `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i wygeneruj wg niej.** Prompt pisany
„z sensu", bez otwarcia specyfikacji, wychodzi merytorycznie poprawny i **strukturalnie inny** —
a układ jest tu funkcją, nie ozdobą: świeża sesja szuka konkretnych sekcji w konkretnej kolejności.

Układ jest **stały, dziewięć elementów, w tej kolejności** (szczegóły każdego — w specyfikacji):

1. Nagłówek `# PROMPT_ETAP_N — <tytuł etapu>`.
2. Linia metryczna: `Plan: TEMAT • Etap: **EN z EM** • Wygenerowano: <data> (autor: <model>) •
   Wykonawca: **<model ze STATUS.md>**`, a po nim zalecany poziom `/effort <poziom>` (z tabeli
   etapów planu; plan go nie podaje → `medium`).
3. **Kontrola modelu** — blockquote „wykonuj wyłącznie na modelu X; inny model → zatrzymaj się",
   zakończony zalecanym poziomem `/effort` z powodem w jednym zdaniu.
4. **Co przeczytać na start** — tabela `Plik | Po co`, z dopiskiem „w tej kolejności, nic więcej".
5. **Decyzje już podjęte — nie otwierasz ich ponownie** — lista z numerami `D-NN` / źródłami;
   ostatni punkt wyznacza granicę zakresu wobec etapów następnych.
6. **Stan wyjściowy** — realny stan repo: drzewko plików, akapit „Czego jeszcze nie ma",
   przepisane w całości „Zasady aktywne" z rejestru lekcji.
7. **Zakres etapu** — sekcja **otwiera się linią z katalogiem roboczym etapu**
   (`.claude/relai/work/TEMAT/E<N>/` — ścieżka podstawiona, nie opisana; artefakt spoza projektu
   idzie do wpisu dziennika z nazwy), dalej numerowana lista, każdy punkt ze ścieżką pliku.
8. **Weryfikacja** — checkboxy, nagłówek „wszystkie punkty muszą przejść". Sekcja obowiązkowa
   zawsze (D-25). Wśród ostatnich punktów stoi **zawsze** katalog roboczy etapu: przejrzany
   raportem, skasowany po „tak", liczby przed i po do wpisu; artefakty spoza niego wypisane
   z nazwy. Wyłączony wiersz `Artefakty robocze` tego punktu nie wycisza.
9. **Na koniec** — kroki rytuału z `stage-closing.md` (te same numery), z adnotacją „bez tego
   rytuału etap nie jest ukończony".

Ta sama zasada dotyczy `STATUS.md`: generujesz go i aktualizujesz wg `SPEC_STATUS.md`, a nie wg
własnego układu tabeli. Kolumny są dokładnie `Etap | Nazwa | Status | Prompt | Uwagi`, a linia
metryczna jest **jedną** linią z elementami rozdzielonymi `·`.
