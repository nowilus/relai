# Źródła — ocena krytyki i plan pierwszych użytkowników

Data odczytu: 2026-09-12. To rozpoznanie do planu, nie pełny audyt techniczny ani benchmark rynku.

| Źródło | Co potwierdza | Ograniczenie |
|---|---|---|
| [Wpis RelAI na Odpalone](https://odpalone.pl/p/relai) | Miejsce publikacji wskazane przez Łukasza | Strony nie udało się odczytać; krytykę analizowano z tekstu wklejonego przez użytkownika |
| [Publiczne repo RelAI](https://github.com/nowilus/relai) | Pole About nie podaje opisu, witryny ani tematów | Stan odczytu z tego dnia; sprawdzić ponownie przed zmianą |
| [Claude Code — pamięć](https://code.claude.com/docs/en/memory) | Auto memory zapisuje korekty, preferencje i kontekst projektu; CLAUDE.md może być współdzielony przez kontrolę wersji | Dokumentacja producenta, bez nowej próby porównawczej w tej sesji |
| [Cursor — reguły](https://cursor.com/docs/rules) | Reguły projektowe oraz centralnie zarządzane reguły zespołowe | Dawny adres Memories przekierował do Rules; nie jest to dowód usunięcia Memories |

Lokalne źródła:

- [README](../../../README.md) — opis wartości, instalacja, brak nagrania, nieaktualne wskazanie
  `skills/` i trwającego E7, absolutne deklaracje bezpieczeństwa.
- [Manifest Codexa](../../../.codex-plugin/plugin.json) — rzeczywista ścieżka `adapters/codex/skills/`.
- [STATE](../../STATE.md) i [DZIENNIK](../../DZIENNIK.md) — zakres dowodów, ograniczenia adapterów,
  koszt dokumentów, problemy dystrybucji i brak potwierdzonego pilotażu osoby spoza autora.
- [Zamknięty plan rozwoju](../../archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md) — pilotaż zastępczy
  prowadzony przez autora; zamknięcie planu mimo jawnie niezmierzonych ścieżek.
- [OPIS_REPO](../../archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md) — istniejący zakres
  poprawy opisu i tematów, wymagający odświeżenia.
- [DECYZJE](../../DECYZJE.md), [USTAWIENIA](../../USTAWIENIA.md) — zamrożone wybory, HTML jako format,
  Opus jako model wykonawczy; bez zmiany nazwy, tagline’u, licencji czy architektury.

## Uzupełnienie — E1, 2026-09-12

- **`odpalone.pl/p/relai` odczytane** przy ponowieniu w E1; przy tworzeniu planu tego samego dnia
  odczyt się nie udał, więc niedostępność była stanem chwilowym, nie własnością źródła (L-0084,
  datowanie działa w obie strony). Wpis nosi tytuł „RelAI — Plugin do prowadzenia projektu za pomocą
  Claude, Codex lub Cursora", opisuje pamięć projektu w plikach obok kodu, rotację do archiwum
  z linkiem w żywym dokumencie i blokadę sekretów; deklaruje stos JavaScript + HTML i status
  „świeżo wydane, szukam szczerego feedbacku". **Treści wpisu nie redagowano** — to zakres E2.
- **Dokumentacja Claude Code o hookach** (`code.claude.com/docs/en/hooks`) — nie odczytywana;
  rozpoznanie P-013 oparte na wydanym buildzie i próbie, zgodnie z zasadą aktywną 13.

**Wnioski, nie fakty rynkowe:** ciągłość procesu jest obiecującym kierunkiem komunikacji;
wersja komercyjna wymaga osobnego potwierdzenia potrzeby; demo i mały pilotaż lepiej odpowiadają
uzgodnionemu celowi niż budowa strony lub nowych funkcji. Progi sukcesu i czas planu to propozycje.

RelAI (GPT-6) + Lukasz
