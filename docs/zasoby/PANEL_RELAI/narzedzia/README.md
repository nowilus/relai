# Narzędzia zrzutów panelu RelAI

Skrypty PowerShell (Windows, aplikacja desktopowa Claude), z którymi model sam sprawdza wygląd
panelu, bez zrzutów od człowieka (plan WYGLAD_PANELU, E3, 2026-10-15). Pliki zapisane z BOM —
PowerShell 5 bez niego psuje polskie znaki.

| Skrypt | Co robi |
|---|---|
| `zrzut-panelu.ps1` | wybiera zakładkę panelu RelAI w pasku paneli, naciska zakładkę (`-Tab Koszty`) i przycisk (`-Press`), rozwija wszystkie sekcje (`-UnfoldAll`, tylko wewnątrz panelu), przewija (`-Scroll N`) i zapisuje zrzut samego panelu (`-Out`). `-Anchor` i `-PaneTab` — dla innego panelu (sonda) |
| `lupa.ps1` | wycina fragment zrzutu i powiększa go piksel w piksel (`-Zoom 10`) — szew, róg, szczelina |
| `okno.ps1` | zrzut całego okna albo jego prawej części, gdy panelu nie da się znaleźć |
| `nazwy.ps1` | lista nazwanych elementów okna (`-Like '*Rozwi*'`) — do znalezienia przycisku |

Ograniczenia: okno nie może być zminimalizowane; przełącznika jasny/ciemny skrypty nie mają
(przełącza człowiek); ukryta kopia kartki (P-044) też ma przyciski — `zrzut-panelu.ps1` naciska
ostatni przycisk w danym miejscu (warstwa widoczna).

Przykład: `powershell -NoProfile -ExecutionPolicy Bypass -File zrzut-panelu.ps1 -Tab Mapa -UnfoldAll -Out C:\tmp\mapa.png`
