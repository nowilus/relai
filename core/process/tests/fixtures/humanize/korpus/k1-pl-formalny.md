### Rotacja dziennika projektu

Dziennik projektu, czyli plik `docs/DZIENNIK.md`, rośnie z każdym nowym wpisem. Gdy jest za duży, wolniej się go otwiera i trudniej w nim znaleźć aktualne informacje. Dlatego RelAI pilnuje jego rozmiaru: kiedy plik przekroczy 150 KB, narzędzie przeprowadza rotację. Dzięki temu dziennik pozostaje czytelny bez względu na to, jak długo trwa projekt.

Podczas rotacji starsze wpisy trafiają do katalogu `docs/archiwum/dziennik/`. Każdy plik archiwum dostaje sumę kontrolną SHA-256. Pozwala ona w każdej chwili sprawdzić, że zarchiwizowana treść nie została zmieniona ani uszkodzona. Rotacja niczego nie usuwa, tylko przenosi wpisy w inne miejsce, więc pełna historia projektu jest zachowana.

W samym dzienniku zostają dwie rzeczy potrzebne na co dzień: sekcja ryzyk i 20 najnowszych wpisów. Ryzyka nigdy nie trafiają do archiwum, bo opisują bieżący stan projektu i zawsze powinny być pod ręką. Jeśli szukasz starszej decyzji lub wcześniejszego ustalenia, zajrzyj do archiwum. Jeśli chcesz potwierdzić, że plik archiwum jest nienaruszony, porównaj jego aktualną sumę kontrolną z wartością zapisaną przy archiwizacji.
