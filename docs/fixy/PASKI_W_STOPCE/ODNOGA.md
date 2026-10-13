# ODNOGA — skrót pasków RelAI w stopce każdej sesji, także w prawym panelu podziału okna

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-13 · Status: **OTWARTA** ·
Wykonawca: **Opus 5.5 w świeżej sesji** (reguła z `CLAUDE.md`: etapy i odnogi — Opus, D-85)

## Cel

Sesja RelAI w panelu podziału okna, który nie jest lewy, pokazuje w stopce promptu jedną linię
z najważniejszym stanem pasków (plan · etap · cache · limit 5 h), a w lewym panelu i w oknie
pop-out nic się nie dubluje — albo, gdy sonda pokaże, że żadna powierzchnia stopki nie rysuje się
w prawym panelu na Windows, odnoga kończy się zapisanym pomiarem i bez kodu.

## Skąd się wzięła

2026-10-13, po wydaniu 3.0.0: Łukasz zauważył, że paski RelAI widać tylko w jednym panelu podziału
okna. Diagnoza (P-040): strona zakładki Code rysuje `AbovePrompt` i `Pane` tylko w lewym panelu
(`isPanelActive`, anthropics/claude-code#99265 — nasz pomiar dopisany w komentarzu). W tym samym
zgłoszeniu inni piszą, że element stopki `SessionMode` rysuje się w każdej rozmowie, a `$.ui.status`
rozbieżnie (Linux tak, macOS nie). Łukasz pracuje na kilku projektach naraz i chce stanu w każdym.

## Zakres

1. **Sonda** w katalogu roboczym: mod testowy (`ui.render` dla `SessionMode` z dopisaną etykietą
   i `$.ui.status` z linią tekstu), wczytany do dwóch sesji w podziale okna — co widać w lewym,
   w prawym panelu i w oknie pop-out. Pomiar na aplikacji 2.31226.1.0 / Claude Code 2.1.295
   (albo nowszych — wersje do wpisu).
2. **Decyzja z człowiekiem** na podstawie sondy: która powierzchnia (`SessionMode`, `$.ui.status`,
   obie, żadna) i jaki tekst — jedna kalibracja na zrzucie.
3. **Wdrożenie** w pluginie, który ma dane (prawdopodobnie `relai-cache-keeper` dla cache i limitu
   oraz `relai-panel` dla planu i etapu — albo jeden z nich czyta oba): `cache-keeper/hooks/`,
   `panel/hooks/`, rdzeń w `core/panel/` tylko dla czystej logiki tekstu linii; testy `plugin test`.
4. **Dokumenty**: `docs/PULAPKI.md` P-040 (wynik sondy), `README.md` (sekcja „Panel w Claude Code”),
   `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` (nowa powierzchnia), numery pluginów i ich
   wydanie — wydanie tylko po zgodzie Łukasza.

## Poza zakresem

- Pełne paski w prawym panelu — to poprawka aplikacji (#99265), nie RelAI.
- Panel boczny `/relai-panel` w prawym panelu — ta sama blokada.
- Panel dla Codeksa (plan PANEL_CODEX) i jego pliki.
- Zmiana wyglądu pasków w lewym panelu.

## Weryfikacja

- [ ] Sonda zmierzona na żywo: dla `SessionMode` i `$.ui.status` osobno — lewy panel, prawy panel,
      okno pop-out; wersje aplikacji i Claude Code do wpisu; licznik wywołań hooka jako kontrola
      pozytywna (P-017).
- [ ] Decyzja Łukasza o powierzchni i tekście — jego słowa we wpisie.
- [ ] Gdy wdrożenie: linia w stopce prawego panelu widoczna na żywo (zrzut), w lewym panelu bez
      dublowania stanu pasków; `plugin test` i `plugin validate` zmienionych pluginów zielone;
      testy rdzenia zielone.
- [ ] Gdy sonda negatywna: P-040 uzupełniona wynikiem, bez zmian w kodzie pluginów.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/PASKI_W_STOPCE/` przejrzany raportem i skasowany
      po „tak”; liczby przed i po we wpisie; artefakty spoza niego wypisane z nazwy.

## Wynik

—
