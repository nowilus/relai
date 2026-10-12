# Warstwa ustawień globalnych (D-23)

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy tworzysz albo zmieniasz plik globalny
`~/.claude/relai/USTAWIENIA.md`, gdy inicjalizujesz projekt albo gdy człowiek pyta, skąd wzięła
się preferencja. Sam odczyt preferencji opisuje reguła w `SKILL.md`.

Preferencje dzielą się na dwie warstwy:

| Warstwa | Plik | Co tam trafia |
|---|---|---|
| Globalna (użytkownik) | `~/.claude/relai/USTAWIENIA.md` (lub `SETTINGS.md`) | preferencje niezależne od projektu: język pracy, format planów, model wykonawczy etapów, lokalizacja backupów, kierunek designu |
| Projektowa | `docs/USTAWIENIA.md` | wszystko powyższe **plus** rzeczy z natury projektowe: git remote, profil projektu, podejście do testów |

**Pierwszeństwo ma zawsze wpis projektowy.** Wartość globalna jest domyślną odpowiedzią, nie
nakazem.

- **Odczyt:** przed każdym pytaniem o preferencję sprawdź najpierw `docs/USTAWIENIA.md`, potem
  plik globalny. Znalazłeś odpowiedź → **używasz jej bez pytania** i wspominasz o tym pół zdaniem
  („zgodnie z Twoim ustawieniem globalnym — polski").
- **Utworzenie:** plik globalny powstaje przy **pierwszej inicjalizacji projektu RelAI na tej
  maszynie**, zaraz po paczce trzech pytań. Trafiają do niego wyłącznie odpowiedzi
  ponadprojektowe (w paczce startowej: język). Nie zadajesz z tego powodu czwartego pytania —
  limit trzech jest twardy (D-80).
- **Poinformowanie:** w podsumowaniu inicjalizacji jedno zdanie, że preferencja została zapamiętana
  globalnie i odziedziczą ją kolejne projekty, a zmienić ją można w każdej chwili.
- **Dziedziczenie:** przy inicjalizacji kolejnego projektu wartości globalne stają się **pierwszą
  opcją z dopiskiem „(Rekomendowane)"** w paczce pytań. Użytkownik może je nadpisać — wtedy nowa
  wartość idzie wyłącznie do pliku projektowego, plik globalny zostaje bez zmian.
- **Format:** identyczny jak projektowy (`SPEC_USTAWIENIA.md`): nagłówek, tabela
  `Data | Czego dotyczy | Decyzja`. Plik globalny **nie zawiera** linii `Wersja RelAI:` — marker
  wersji jest cechą projektu, nie użytkownika.
- **Bez sekretów:** żadnych sekretów, ścieżek z danymi logowania ani niczego, co dotyczy jednego
  projektu.
