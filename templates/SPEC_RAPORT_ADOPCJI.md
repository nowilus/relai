# SPEC — `docs/RAPORT_ADOPCJI.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/RAPORT_ADOPCJI.md` **w języku
projektu** (`docs/ADOPTION_REPORT.md` dla projektu angielskiego) — wyłącznie podczas adopcji
zastanego projektu komendą `/relai-adopt` (D-70).

## Rola

Jedyny artefakt, który **przeżywa sesję adopcji**. Sesja się kończy, kontekst znika — a raport
zostaje i odpowiada na cztery pytania: co się stało, skąd, dokąd i **jak to w całości cofnąć**.
Bez raportu cofnięcie adopcji zależy od pamięci człowieka; z raportem wystarczy archiwum i ten
plik.

Raport jest też nośnikiem ścieżki recovery (D-70). Decyzja z E9: recovery to **sekcja procedury
w raporcie**, nie osobna komenda i nie generowany skrypt — procedura opiera się wyłącznie na
rozpakowaniu zweryfikowanego archiwum ZIP, więc jest identyczna dla każdej adopcji i wykonalna
ręcznie, bez Claude, bez pluginu i bez Node.

## Odbiorca

Człowiek — pierwszy i najważniejszy, zwykle w jednej z dwóch sytuacji: coś poszło nie tak i chce
wrócić do stanu sprzed, albo po miesiącach chce wiedzieć, skąd wzięła się struktura dokumentów.
Agent — drugi: czyta raport, gdy użytkownik prosi o cofnięcie adopcji albo pyta o jej przebieg.

## Polityka aktualizacji: PISANY RAZ

Raport powstaje w chwili adopcji i **nie jest później edytowany** — opisuje zdarzenie, nie stan.
Jedyny dopuszczalny dopisek: sekcja „Cofnięcie wykonane" z datą, jeśli recovery rzeczywiście
przeprowadzono. Kolejna adopcja tego samego projektu jest niemożliwa (projekt ma już marker
RelAI), więc plik nigdy nie jest regenerowany.

## Struktura sekcji (kolejność obowiązkowa)

1. **Nagłówek** — `# RAPORT ADOPCJI — <nazwa projektu>` + linia: data adopcji, wersja RelAI,
   wykonawca (`RelAI (<model>) + <git config user.name>`).
2. **Backup** — fundament całego raportu:
   - pełna, bezwzględna ścieżka archiwum ZIP (leży poza projektem),
   - rozmiar pliku i liczba wpisów w archiwum (z weryfikacji, nie z pamięci),
   - lista zastosowanych wykluczeń (sekrety, runtime — wg `/relai-backup`),
   - stan gita sprzed adopcji: hash, data i tytuł ostatniego commita — albo jawne zdanie
     „projekt bez gita; punktem odniesienia jest wyłącznie archiwum".
3. **Co powstało** — tabela `Plik | Skąd treść`. Druga kolumna mówi, czy dokument został
   wygenerowany z zastanego stanu (STATE z analizy kodu, wpis zerowy dziennika z `git log`), czy
   powstał pusty strukturalnie (LEKCJE, DECYZJE).
4. **Co przeniesiono do archiwum projektu** — tabela `Było | Jest | Powód`. Każdy zastany plik,
   który ustąpił miejsca strukturze RelAI, leży w `docs/archiwum/` z adnotacją „NIEAKTUALNE"
   (D-18). Nic nie przeniesiono → jedno zdanie, że nic.
5. **Co scalono** — dziś dotyczy wyłącznie `CLAUDE.md` (D-71): gdzie leży kopia oryginału, do
   której sekcji nowego pliku trafiły zastane reguły (w niezmienionym brzmieniu), jakie konflikty
   wykryto i jak je rozstrzygnął **użytkownik** (pytanie + odpowiedź, dosłownie). Nie było
   `CLAUDE.md` → jedno zdanie.
6. **Czego nie ruszono** — jawna lista kategorii z powodem: kod źródłowy (adopcja nie zmienia ani
   bajta), `README.md` (zastany zostaje), dokumenty użytkownika nienazwane jak pliki rdzenia,
   konfiguracje narzędzi. Ta sekcja jest dowodem zakresu — czytelnik ma wiedzieć, że wszystko
   spoza sekcji 3–5 jest nietknięte.
7. **Sekrety** — wskazania z analizy: plik, linia, rodzaj (np. „klucz API"), **nigdy wartość**
   (D-42) — plus zdanie, że archiwum backupu celowo ich nie zawiera i przy recovery trzeba je
   odtworzyć ręcznie. Nic nie znaleziono → jedno zdanie.
8. **Pełne cofnięcie** — procedura krok po kroku, z realnymi ścieżkami tego projektu. Wzorzec
   (dostosuj ścieżki i narzędzia do systemu, na którym wykonano adopcję):
   1. Zamknij sesje i procesy pracujące w folderze projektu.
   2. Przenieś (nie kasuj) bieżący folder projektu obok, pod nazwą `<nazwa>_PO_ADOPCJI` —
      zostaje jako ślad, dopóki nie potwierdzisz, że odtworzony projekt działa.
   3. Rozpakuj archiwum w folderze nadrzędnym projektu: Eksplorator Windows → „Wyodrębnij
      wszystko" albo `C:\Windows\System32\tar.exe -xf "<ścieżka archiwum>"` (pełna ścieżka —
      L-0021). W archiwum jest jeden katalog projektu, więc powstanie folder o pierwotnej nazwie.
   4. Odtwórz ręcznie pliki sekretów (`.env` i pokrewne) — archiwum celowo ich nie ma; wartości
      są w Twoim menedżerze haseł.
   5. Odtwórz zależności, jeśli projekt je ma (`npm install` itp.) — katalogi runtime są poza
      archiwum.
   6. Sprawdź stan: ostatni commit (`git log -1`) zgadza się z hashem z sekcji „Backup"; projekt
      uruchamia się tak, jak przed adopcją.
9. **Podpis** — `Autor: RelAI (<model>) + <użytkownik>`.

## Zakazy

- Zero wartości sekretów — także we fragmentach i przykładach (D-42).
- Zero obietnic i trybu przypuszczającego („można by", „warto rozważyć") — raport opisuje fakty.
- Liczby wyłącznie zmierzone (rozmiar z dysku, wpisy z listy archiwum) — nie szacowane.
- Ścieżka archiwum zawsze bezwzględna; „w folderze backupów" nie jest ścieżką.
- Procedura cofnięcia nie może wymagać RelAI, pluginu ani działającej sesji Claude.

## Przykład (projekt polski)

```markdown
# RAPORT ADOPCJI — Magazyn

Adopcja: 2026-08-09 · RelAI 0.9.0 · Wykonawca: RelAI (Opus) + Lukasz

## Backup

- Archiwum: `D:\Backupy\RelAI\Magazyn_2026-08-09_1412.zip`
- Rozmiar: 2,4 MB · wpisów w archiwum: 87 (zweryfikowane listą wpisów, nagłówek PK)
- Wykluczenia: `.env`, `*.pem`, `node_modules`, `dist`, `*.log`
- Stan gita sprzed adopcji: `a41f9c2` · 2026-08-05 · "fix: rounding in stock report"

## Co powstało

| Plik | Skąd treść |
|---|---|
| `docs/STATE.md` | wygenerowany z analizy kodu i README — opisuje działający moduł przyjęć |
| `docs/DZIENNIK.md` | wpis zerowy streszcza historię gita: 214 commitów od 2026-03-11 |
| `docs/LEKCJE.md`, `docs/DECYZJE.md` | puste strukturalnie — zapełnią się w pracy |
| `docs/USTAWIENIA.md` | marker `Wersja RelAI: 0.9.0` + wykryte: język polski, profil `app` |
| `docs/KOMENDY.md` | ściąga komend wersji 0.9.0 |

## Co przeniesiono do archiwum projektu

| Było | Jest | Powód |
|---|---|---|
| `docs/notatki-stan.md` | `docs/archiwum/notatki-stan.md` | rolę przejął `docs/STATE.md`; adnotacja NIEAKTUALNE na górze pliku |

## Co scalono

`CLAUDE.md`: kopia oryginału w `docs/archiwum/CLAUDE_PRZED_ADOPCJA.md`. Trzy zastane reguły
przeniesione dosłownie do sekcji „Zasady projektu (odziedziczone)". Konflikt: zastane „commituj
po każdej zmianie bez pytania" vs RelAI „commit za zgodą" — użytkownik wybrał zasadę zastaną;
zapisana w sekcji odziedziczonej z adnotacją o pierwszeństwie.

## Czego nie ruszono

- Kod źródłowy (`src/`, `tests/`) — adopcja nie zmienia ani bajta kodu.
- `README.md` — zastany, kompletny; RelAI go nie nadpisuje.
- `docs/instrukcja-magazyniera.pdf` — dokument użytkownika, poza strukturą RelAI.

## Sekrety

- `src/config.py`, linia 12 — klucz API w kodzie (rodzaj: token usługi kurierskiej). Wartości
  nie cytujemy; archiwum backupu jej nie zawiera. Zalecenie przeniesienia do `.env` zapisane
  w dzienniku jako „Do zrobienia przez człowieka".

## Pełne cofnięcie

1. Zamknij sesje i procesy w `C:\Projekty\Magazyn`.
2. Przenieś `C:\Projekty\Magazyn` na `C:\Projekty\Magazyn_PO_ADOPCJI`.
3. Rozpakuj `D:\Backupy\RelAI\Magazyn_2026-08-09_1412.zip` w `C:\Projekty\` („Wyodrębnij
   wszystko" albo `C:\Windows\System32\tar.exe -xf "D:\Backupy\RelAI\Magazyn_2026-08-09_1412.zip"`).
4. Odtwórz `.env` z menedżera haseł (wpisy: `COURIER_API_KEY`, `DB_PASSWORD`).
5. `npm install` w folderze projektu.
6. Sprawdź: `git log -1` pokazuje `a41f9c2`; aplikacja startuje `npm run dev`.

Autor: RelAI (Opus) + Lukasz
```
