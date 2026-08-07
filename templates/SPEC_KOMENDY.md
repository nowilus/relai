# SPEC — `docs/KOMENDY.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/KOMENDY.md` **w języku
projektu** (`docs/COMMANDS.md` dla projektu angielskiego).

## Rola

Ściąga: co użytkownik może powiedzieć albo wpisać, żeby coś się stało. Jedyne źródło prawdy o
komendach i frazach RelAI w tym projekcie — przyszła komenda `/relai-help` będzie ten plik
prezentować, a nie duplikować (D-07).

## Odbiorca

Użytkownik (człowiek). Język prosty, opisy przez efekt, nie przez mechanikę.

## Zasada nadrzędna: generowany ze stanu faktycznego

Plik zawiera **wyłącznie to, co w zainstalowanej wersji pluginu naprawdę działa**. Nie wpisujesz
komend zapowiedzianych, planowanych ani „wkrótce". Obietnica w ściądze jest gorsza niż jej brak:
użytkownik traci zaufanie do całego zestawu.

Na końcu pliku dopisujesz jedno zdanie: lista rośnie z kolejnymi wersjami RelAI, aktualna wersja
projektu jest w `docs/USTAWIENIA.md`.

## Struktura sekcji

1. **Nagłówek** — `# KOMENDY — <nazwa projektu>` + linia `RelAI <wersja>`.
2. **Zdanie wstępne** — że nic z tej listy nie jest obowiązkowe: RelAI działa w zwykłej rozmowie,
   a komendy są skrótem dla rzadszych operacji (D-22).
3. **Komendy** — tabela `Komenda | Co robi | Kiedy użyć`. Tylko działające.
4. **Frazy naturalne** — tabela `Powiesz | Co się stanie`. Frazy w języku projektu. Tylko działające.
5. **Czego RelAI pilnuje bez proszenia** — 3–6 punktów o zachowaniach automatycznych działających
   w tej wersji (np. aktualizacja dokumentów w ramach ukończenia zadania). Punkt o zachowaniu,
   którego jeszcze nie ma, nie istnieje.
6. **Stopka** — jedno zdanie o rosnącej liście + odsyłacz do `docs/USTAWIENIA.md` po numer wersji.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Aktualizacja pluginu do wyższej wersji | regenerujesz plik ze stanu faktycznego nowej wersji, zmieniasz numer w nagłówku |
| Lokalne nadpisanie zachowania w projekcie | dopisujesz wiersz z jawnym oznaczeniem „lokalne" |
| Cokolwiek innego | plik zostaje bez zmian — nie jest miejscem na notatki |

Plik jest **regenerowany**, nie edytowany ręcznie. Wyjątkiem są wiersze oznaczone jako lokalne —
te przeżywają regenerację (D-62: lokalne nadpisania mają pierwszeństwo).

## Zakres wersji 0.1.0 (E1) — co realnie działa

W tej wersji plugin nie ma jeszcze **żadnej komendy `/relai-*`** ani fraz rytualnych. Działa:

- inicjalizacja struktury projektu (zgoda → trzy pytania → dokumenty),
- rozpoznanie folderu, który już jest projektem RelAI,
- tryb gościa po odmowie (bez ponownego pytania),
- niedestrukcyjne dołączenie struktury do folderu z zawartością,
- naturalne prośby: „dodaj RelAI", „dołącz strukturę RelAI".

Wygenerowany `KOMENDY.md` w wersji 0.1.0 **nie zawiera tabeli komend** — zawiera sekcję „Na tym
etapie komend nie ma" z powyższą listą i informacją, że kolejne wersje je dołożą.

## Zakazy

- Nie wpisujesz `/relai-stage`, `/relai-backup`, `/relai-audit`, `/relai-handover`, `/relai-adopt`,
  `/relai-update`, `/relai-tour`, `/relai-changelog`, `/relai-help` ani fraz „kończymy na dziś",
  „kontynuujemy pracę", „sprawdź status`, dopóki nie działają w zainstalowanej wersji.
- Nie opisujesz mechaniki wewnętrznej (skille, hooki) — użytkownika interesuje efekt.

## Przykład dla wersji 0.1.0 (projekt polski)

```markdown
# KOMENDY — Parkly

RelAI 0.1.0

Nic z tej listy nie jest obowiązkowe. RelAI działa w zwykłej rozmowie — piszesz normalnie,
a struktura projektu nadąża. Komendy są skrótem do rzadszych operacji.

## Na tym etapie komend nie ma

Wersja 0.1.0 to fundament. Działa w niej:

| Powiesz | Co się stanie |
|---|---|
| „dodaj RelAI" / „dołącz strukturę RelAI" | RelAI dołoży brakujące dokumenty, nie ruszając niczego, co już jest |

Poza tym RelAI sam rozpoznaje, czy folder jest już projektem RelAI, i nie pyta o inicjalizację
drugi raz — także wtedy, gdy raz odmówiłeś.

## Czego RelAI pilnuje bez proszenia

- Nie nadpisuje i nie kasuje plików, których sam nie utworzył.
- Nie zapisuje kluczy ani haseł w plikach trafiających do repozytorium.
- Nie zakłada repozytorium gita wewnątrz innego repozytorium.

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu znajdziesz
w [USTAWIENIA.md](USTAWIENIA.md).
```
