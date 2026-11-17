# POMIAR NA ŻYWO — relai-browser 0.1.0 (E1, 2026-11-11)

Kopia `browser/` w dev-mods sesji c9ce8d24, Claude Code 2.1.321, desktop, Windows, tryb auto.
`efficient-browser-use` BenAI wyłączony poza punktem „bliźniak”.

| Przypadek | Przed | Po | Tokeny (SZACUNEK, ceil(w·h/750)) | Rekord w rejestrze |
|---|---|---|---|---|
| Zrzut Claude_Browser (pierwszy obraz, karta zgody) | 799×609 JPEG | 512×390 | 649 → 267 | tak, 15:35:02 |
| Zrzut Claude_Browser (drugi, bez karty) | 800×600 | 512×384 | 640 → 263 | tak, 15:35:10 |
| Read PNG 1920×1080 (silnik dał JPEG) | 1920×1080 | 960×540 | 1844 → 692 | tak, 15:35:11 |
| Read WebP 2000 px | 2000 px | bez zmian | — | nie (zgodnie ze spec.) |
| `/relai-browser full`, następny zrzut | 800×600 | 800×600 (cały) | — | nie |
| zrzut po `full` | 800×600 | 512×384 | 640 → 263 | tak, 15:35:51 |
| bliźniak włączony + `/reload-plugins`, dwa zrzuty | 800×600 | 512×384 przez BenAI | — | nie (RelAI śpi) |

- Linia współrzędnych po zmniejszeniu RelAI: `Screenshot size: 512x390 0.64-scale view; coordinate frame: 799x609.`
  (format natywny przeglądarki); BenAI pisze tę samą linię bez kropki i dokłada notatkę `tool.call`.
- Karta zgody: jedna, przy pierwszym obrazie; po „Yes, in this project” wiersz
  `| 2026-11-11 | Mody oszczędzania | zgoda — … |` w `docs/USTAWIENIA.md` (linia 36, w tabeli).
  Kolejne obrazy i przeładowanie modu (`/reload-plugins` = nowy `register` + `session.start`,
  zmienne modułu od zera, zgoda czytana z pliku) — bez karty. Osobnej drugiej sesji nie
  otwierano: dowód „druga sesja nie pyta” stoi na przeładowaniu modułu, nie na nowym oknie.
- Bliźniak: po włączeniu `efficient-browser-use` i przeładowaniu — zero nowych rekordów RelAI,
  jeden toast „relai-browser sleeps: …” (potwierdził Łukasz), dwa zrzuty zmniejszone przez BenAI.
- Rejestr: `~/.claude/relai/oszczednosci/rejestr/2026-11-11-c9ce8d24-….jsonl`, 4 rekordy, 0 złych linii.
- Skrypt PowerShell poza modem: PNG 1920×1080 → 960×540 w 0,8 s; JPEG 799×609 → 512×390 w 1,0 s.
