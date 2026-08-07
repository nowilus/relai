# templates — specyfikacje dokumentów

Pliki w tym folderze **nie są szablonami do skopiowania**. To specyfikacje-instrukcje dla LLM
(D-60): opisują rolę dokumentu, odbiorcę, strukturę sekcji, politykę aktualizacji i pokazują
przykład. Dokument w projekcie użytkownika powstaje przez **generację w języku projektu**, a nie
przez skopiowanie pliku.

Dzięki temu projekt prowadzony po angielsku (albo w dowolnym innym języku) działa bez tłumaczenia
zasobów pluginu.

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_CLAUDE_MD.md](SPEC_CLAUDE_MD.md) | `CLAUDE.md` | router procesowy, maks. 60 linii, sekcja niemutowalna |
| [SPEC_README.md](SPEC_README.md) | `README.md` | wizytówka + mapa dokumentacji |
| [SPEC_STATE.md](SPEC_STATE.md) | `docs/STATE.md` | dwuwarstwowy, **nadpisywany** |
| [SPEC_DZIENNIK.md](SPEC_DZIENNIK.md) | `docs/DZIENNIK.md` | append na końcu + stała sekcja ryzyk |
| [SPEC_USTAWIENIA.md](SPEC_USTAWIENIA.md) | `docs/USTAWIENIA.md` | append; nosi marker `Wersja RelAI:` |
| [SPEC_KOMENDY.md](SPEC_KOMENDY.md) | `docs/KOMENDY.md` | regenerowany ze stanu faktycznego pluginu |

Specyfikacje `LEKCJE`, `DECYZJE`, `ARCHITEKTURA`, `DESIGN` oraz szablon HTML planów dochodzą
w kolejnych wersjach pluginu.

## Zasady wspólne dla wszystkich generacji

- **Język projektu** decyduje o treści **i o nazwach plików** (D-12: CAPS_SNAKE, bez dat i wersji
  w nazwie).
- Data zawsze z kontekstu sesji, nigdy z pamięci modelu.
- Zero sekretów w plikach śledzonych — nazwy zmiennych tak, wartości nigdy (D-42).
- Dokument, który przestał być aktualny, dostaje adnotację i trafia do `docs/archiwum/`; nigdy nie
  jest cicho kasowany (D-18).
