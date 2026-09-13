# PROBY — zapis prób uczestników (plan PIERWSI_UZYTKOWNICY)

Plik założony 2026-09-13 w E2. **Danych z realnych prób jeszcze nie ma** — wchodzą dopiero
z kontaktów, a te wymagają dyspozycji Łukasza (bramki manualne „Dyspozycja publikacji i kontaktów"
oraz „Uczestnicy" w [STATUS.md](STATUS.md)).

Wiersze oznaczone `PRZYKŁAD` pokazują, co wpisać w każdą kolumnę. **Kasuje się je przy pierwszym
realnym wpisie** — nie sumuje się ich do żadnej liczby.

## Reguła wypełniania

1. **Wpis powstaje w tej samej turze, w której zdarzyło się zdarzenie.** Wysłana wiadomość, odmowa,
   utknięcie, powrót — każde z nich jest zdarzeniem. Zapis „później, jak zbiorę całość" nie istnieje.
2. **Brak wyniku jest wynikiem.** Odmowa, cisza po tygodniu i próba porzucona w połowie to
   pełnoprawne wiersze, nie luki w tabeli. Brak uczestników jest wynikiem rekrutacji, nie dowodem
   braku wartości produktu (sekcja 5 planu).
3. **Pomoc jest dozwolona po utknięciu i zawsze odnotowana.** Próba, w której autor podpowiedział,
   ma w kolumnie „Pomoc" opis tej podpowiedzi i **nie liczy się jako samodzielna**.
4. **Uprzejmość nie jest aktywacją.** „Fajne, na pewno użyję" bez wykonanego zadania idzie do
   kolumny „Korzyści" jako deklaracja, a etap dotarcia zostaje na tym, co faktycznie się wydarzyło
   (ryzyko z sekcji 7 planu).
5. **Powrót spontaniczny odróżnia się od wywołanego prośbą.** Kolumna „Powrót" mówi który to był.
6. **Nie zbieramy kodu, sekretów ani pełnych rozmów.** Cytat albo nazwa osoby wchodzi do
   dokumentów wyłącznie za jej zgodą (ryzyko z sekcji 7 planu). Identyfikator jest anonimowy
   (`U1`, `U2`, …); mapowanie na osoby nie mieszka w repozytorium.
7. **Narzędzie inne niż Claude Code raportujemy osobno** — feedback przyjmujemy, ale nie mieszamy
   go z ścieżką podstawową (sekcja 8 planu, przypadek brzegowy „uczestnik ma tylko Cursor lub Codex").
8. **Zmiana wersji RelAI w trakcie pilotażu rozdziela obserwacje** — kolumna „RelAI" niesie wersję
   faktycznie zainstalowaną przez uczestnika, nie tę z repozytorium (sekcja 8 planu).

## Kontakty

Każda wysłana wiadomość i każda odpowiedź — także jej brak. Ta tabela odpowiada na pytanie
„ilu ludzi w ogóle poproszono", bez którego liczba prób nic nie znaczy.

| ID | Kanał | Data wysłania | Materiał | Odpowiedź | Data odpowiedzi | Wynik |
|---|---|---|---|---|---|---|
| _PRZYKŁAD_ U1 | własna sieć (wiadomość bezpośrednia) | 2026-09-15 | blok (b) + instrukcja (d) | „spróbuję w weekend" | 2026-09-15 | zgoda → próba U1 |
| _PRZYKŁAD_ U2 | Odpalone (komentarz pod wpisem) | 2026-09-15 | blok (a) | brak | — | **brak odpowiedzi po 7 dniach** |
| _PRZYKŁAD_ U3 | własna sieć | 2026-09-15 | blok (b) | „nie mam teraz projektu, na którym mógłbym" | 2026-09-16 | **odmowa — powód: brak projektu** |

**Bilans:** wysłano 0 · odpowiedzi 0 · zgód 0 · odmów 0 · bez odpowiedzi 0.

## Próby

Kolumny wprost z sekcji 5 planu. Jeden uczestnik = jeden wiersz; druga próba tej samej osoby po
zmianie wersji dostaje wiersz osobny (`U1b`) z powodem rozdzielenia w kolumnie „Przeszkody".

| ID | Narzędzie / model / wersja | RelAI | Data próby 1 | Data próby 2 | Etap dotarcia | Czas instalacji | Czas wznowienia | Pomoc | Decyzja odnaleziona ze źródłem | Powrót | Korzyści | Przeszkody |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| _PRZYKŁAD_ U1 | Claude Code 2.1.227 / Opus 5 | 2.1.4 | 2026-09-16 | 2026-09-23 | plan zaakceptowany + świeża sesja wróciła | 4 min | 2 min | nie | TAK — wskazał `docs/plany/…/STATUS.md` | spontaniczny | „nie musiałem tłumaczyć od nowa, co ustaliliśmy" | GIF nie wyjaśnił, że trzeba zrestartować aplikację |
| _PRZYKŁAD_ U2 | Cursor / Composer | 2.1.4 | 2026-09-16 | — | instalacja | 11 min | — | **tak** — podpowiedziano ścieżkę instalatora adaptera | nie dotyczy | — | utknął na instalacji; **raportowany osobno**, nie jest to ścieżka podstawowa |
| _PRZYKŁAD_ U3 | Claude Code 2.1.227 / Sonnet 5 | 2.1.4 | 2026-09-17 | — | inicjalizacja | 3 min | — | nie | — | brak — cisza po 7 dniach | — | porzucił po inicjalizacji, powód nieznany |

**Bilans:** prób 0 · aktywacji 0 · powrotów udokumentowanych 0 · prób wspomaganych 0.

## Progi z sekcji 2 planu — stan

Progi są **zaakceptowane razem z planem i nie zmieniają się w trakcie**. Zmiana progu po zobaczeniu
wyników jest nowym aneksem, nie korektą.

| Próg | Wartość | Stan na dziś |
|---|---|---|
| Uczestnicy spoza autora | 3–5 | **0** |
| Aktywacje (wykonane zadanie, nie deklaracja) | ≥ 3 | **0** |
| Udokumentowane powroty po przerwie | ≥ 2 | **0** |

Okno obserwacji powrotu: **około 7 dni** od pierwszej próby (SZACUNEK, sekcja 5 planu).
Termin graniczny raportu: **21 dni od akceptacji planu**, czyli **2026-10-03** (SZACUNEK,
sekcja 6 planu) — raport powstaje w tym terminie także przy małej próbie albo bez próby.

## Jak czytać wynik (sekcja 5 planu — decyzja, nie interpretacja)

- **Rozwijamy** — progi osiągnięte i wskazana konkretna korzyść, przy akceptowalnej obsłudze.
- **Poprawiamy wejście** — ludzie próbują, ale utykają na tej samej instrukcji.
- **Wstrzymujemy inwestycję** — potrafią użyć, lecz nie wracają albo narzut przewyższa korzyść.
- **Wynik nierozstrzygający** — brak uczestników albo brak obserwacji powrotu. To problem
  rekrutacji lub brak danych, **nie** dowód braku wartości.

RelAI (Opus 5) + Lukasz
