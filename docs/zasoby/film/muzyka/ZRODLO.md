# Muzyka filmu — źródło i licencja

Ścieżka dźwiękowa filmu prezentacyjnego RelAI (plan FILM_PREZENTACYJNY, Aneks C). Wybrał ją
Łukasz 2026-10-12 po odrzuceniu muzyki syntetyzowanej w kodzie; plik pobrał sam z Free Music
Archive.

| Pole | Wartość |
|---|---|
| Plik | `daylight-hour.mp3` (107,08 s, MP3 160 kb/s, 44,1 kHz, stereo) |
| sha256 | `6b56533f810958b52e58466584e5d80b8c645d15f5358c140cb305067c3ac412` |
| Utwór | „daylight hour” |
| Autor | snoozy beats |
| Źródło | https://freemusicarchive.org/music/snoozy-beats/single/daylight-hour/ |
| Licencja | Creative Commons Attribution 4.0 International (CC BY 4.0) — https://creativecommons.org/licenses/by/4.0/ |
| Wymóg | przypisanie autorstwa; autor prosi o wklejenie tekstu kredytu niżej |

Tekst kredytu (dosłownie, wg opisu utworu na FMA) — idzie do README filmu i do opisu wydania,
w którym film się pojawi:

> 🎵(free) lofi type beat "daylight hour" by snoozy beats

Jak film używa pliku: `zrodla/skrypty/muzyka.mjs` dekoduje go przy każdym `npm run przygotuj`
do `zrodla/public/muzyka/relai.wav` (poza gitem) i dopasowuje do długości filmu — gra od początku
do wejścia wyciszenia (93,738 s), w tym samym miejscu taktu przechodzi na początek części
rytmicznej (9,895 s) i wycisza się na ostatnich sekundach filmu. Utwór nie jest zmieniany poza
tym cięciem, poziomem i wyciszeniem.
