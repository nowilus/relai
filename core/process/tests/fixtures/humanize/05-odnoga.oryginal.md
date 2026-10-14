Sesja RelAI w panelu podziału okna, który nie jest lewy, pokazuje w stopce promptu jedną linię
z najważniejszym stanem pasków (plan · etap · cache · limit 5 h), a w lewym panelu i w oknie
pop-out nic się nie dubluje — albo, gdy sonda pokaże, że żadna powierzchnia stopki nie rysuje się
w prawym panelu na Windows, odnoga kończy się zapisanym pomiarem i bez kodu.

2026-10-13, po wydaniu 3.0.0: Łukasz zauważył, że paski RelAI widać tylko w jednym panelu podziału
okna. Diagnoza (P-040): strona zakładki Code rysuje `AbovePrompt` i `Pane` tylko w lewym panelu
(`isPanelActive`, anthropics/claude-code#99265 — nasz pomiar dopisany w komentarzu). W tym samym
zgłoszeniu inni piszą, że element stopki `SessionMode` rysuje się w każdej rozmowie, a `$.ui.status`
rozbieżnie (Linux tak, macOS nie). Łukasz pracuje na kilku projektach naraz i chce stanu w każdym.
