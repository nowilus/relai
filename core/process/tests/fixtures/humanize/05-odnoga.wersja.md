Sesja RelAI w panelu podziału okna innym niż lewy pokazuje w stopce promptu jedną linię
z najważniejszym stanem pasków (plan · etap · cache · limit 5 h). W lewym panelu i w oknie pop-out
nic się nie dubluje. Jeśli sonda pokaże, że na Windows żadna powierzchnia stopki nie rysuje się
w prawym panelu, odnoga kończy się zapisanym pomiarem, bez kodu.

2026-10-13, po wydaniu 3.0.0, Łukasz zauważył, że paski RelAI widać tylko w jednym panelu podziału
okna. Diagnoza (P-040): strona zakładki Code rysuje `AbovePrompt` i `Pane` tylko w lewym panelu
(`isPanelActive`, anthropics/claude-code#99265, gdzie dopisaliśmy nasz pomiar w komentarzu). W tym
samym zgłoszeniu inni piszą, że element stopki `SessionMode` rysuje się w każdej rozmowie, a
`$.ui.status` różnie zależnie od systemu (Linux tak, macOS nie). Łukasz pracuje na kilku projektach
naraz i chce widzieć stan w każdym.
