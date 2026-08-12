---
description: Destyluje dziennik projektu do listy zmian — na ekran, a do pliku dopiero na życzenie
argument-hint: "[od 2026-07-01] [od 0.5.0] [ostatnie 10] — zakres opcjonalny, domyślnie cały dziennik"
---

# /relai-changelog — lista zmian z dziennika

Argument (opcjonalny): `$ARGUMENTS`

CHANGELOG w RelAI **nie jest prowadzony osobno** (D-17). Powstaje tutaj, z destylacji
`docs/DZIENNIK.md`, na żądanie. Twoje zadanie: zamienić zapis pracy w listę zmian, którą rozumie
ktoś, kto nie siedział w tych sesjach.

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak → jedno zdanie i koniec.
Brak `docs/DZIENNIK.md` → powiedz, że nie ma z czego destylować, i zakończ.

## Krok 1 — zakres

| Argument | Znaczenie |
|---|---|
| `od RRRR-MM-DD` | wpisy o dacie **nie wcześniejszej** niż podana |
| `od <wersja>` | wpisy od pierwszego, który wspomina tę wersję (np. `od 0.5.0`) |
| `ostatnie N` | N ostatnich wpisów |
| brak argumentu | **cały** dziennik, plus archiwa z `docs/archiwum/DZIENNIK_*.md`, jeśli istnieją |

Zakres nie pokrywa się z niczym w dzienniku → powiedz to i pokaż zakres dat, który jest dostępny.
Nie zgaduj, że użytkownikowi „chodziło o coś innego".

## Krok 2 — co czytasz w dzienniku

Struktura wpisu jest stała (`SPEC_DZIENNIK.md`): nagłówek `### RRRR-MM-DD — Temat`, linia autora
i cztery sekcje. Z każdego wpisu w zakresie bierzesz:

| Sekcja wpisu | Co z niej wchodzi do listy zmian |
|---|---|
| **Zrobione** | rdzeń listy — każda pozycja to kandydat na wiersz changeloga |
| **Zweryfikowane — jak dokładnie** | **nie** wchodzi do listy; służy Ci do odsiania rzeczy niepotwierdzonych |
| **Świadomie odłożone** | osobna, krótka sekcja „Czego nie ma" — jeśli w zakresie coś takiego padło |
| **Do zrobienia przez człowieka** | pomijasz — to nie jest zmiana, tylko zadanie |

Wpisy typu **MINIPLAN** (nagłówek z dopiskiem `— MINIPLAN`) **pomijasz**: opisują zamiar, nie
wynik. Efekt tej pracy jest w osobnym wpisie wynikowym.

## Krok 3 — destylacja

Cztery reguły, w tej kolejności ważności:

1. **Zmiana, nie czynność.** „Dodano endpoint `/api/eksport` i przycisk na liście" → „Eksport
   rezerwacji do CSV". Czytelnik chce wiedzieć, co teraz może, a nie co ktoś napisał.
2. **Scalaj powtórzenia.** Ta sama rzecz doprowadzona do końca przez trzy sesje to **jeden**
   wiersz z datą ostatniej z nich. Poprawka wady wprowadzonej w tym samym zakresie znika razem
   z wadą — czytelnik nie potrzebuje kroniki błędów.
3. **Nie dopisuj niczego od siebie.** Każdy wiersz musi mieć pokrycie w treści dziennika. Nie ma
   czegoś w dzienniku — nie ma tego w changelogu.
4. **Grupuj po rodzaju**, w stałej kolejności: **Nowe** · **Zmienione** · **Poprawione** ·
   **Usunięte**. Grupa bez zawartości nie pojawia się wcale.

Podział na wydania: jeśli projekt ma wersje (marker `Wersja RelAI:`, `package.json`, tagi gita),
grupujesz po wersjach, najnowsza u góry, z datą. Brak wersji → grupujesz po datach.

## Krok 4 — wynik na ekran

Domyślnie wypisujesz listę **w odpowiedzi**, nie do pliku. Układ:

```markdown
## 0.6.0 — 2026-08-08

**Nowe**
- Plan główny w jednym samowystarczalnym pliku HTML — działa offline, z symulatorem wyliczeń.

**Zmienione**
- Preferencja formatu planów rozstrzyga sama; pytanie pada raz na projekt.
```

Pod listą jedno zdanie: z ilu wpisów dziennika powstała i jaki zakres dat obejmuje. To jest
kontrola dla czytelnika, że nic nie wypadło.

## Krok 5 — zapis do pliku (dopiero na życzenie)

Plik powstaje **wyłącznie** wtedy, gdy użytkownik o niego poprosi — w tym samym zdaniu
(„zapisz do pliku") albo po Twojej propozycji. Sama komenda pliku nie tworzy.

- Ścieżka: `docs/CHANGELOG.md` (nazwa podąża za językiem projektu, D-12).
- Plik już istnieje → **nie nadpisujesz**. Pokazujesz, co jest w nim ostatnie, i dopisujesz
  wyłącznie nowsze pozycje na górze.
- Powstanie pliku to zmiana funkcjonalna → wpis w `docs/DZIENNIK.md` w tej samej turze (D-44).
  Sam wyświetlony changelog wpisu **nie** wymaga: nic się nie zmieniło.

---

## Zakazy tej komendy

- Nie tworzysz pliku bez wyraźnej prośby.
- Nie edytujesz dziennika — jest append-only i nie jest miejscem na porządkowanie pod changelog
  (D-18).
- Nie wymyślasz numerów wersji, których nie ma w projekcie.
- Nie wpisujesz pozycji bez pokrycia w dzienniku ani nie „domykasz" listy z pamięci sesji.
- Nie kopiujesz treści sekcji „Zweryfikowane" — czytelnika changeloga interesuje efekt, nie metoda.
