# Materiał demo RelAI

Zaakceptowane pliki demonstracyjne. Materiał roboczy — projekt renderu, klatki pośrednie, zapis
przebiegu — zostaje w katalogu roboczym etapu i nie wchodzi do repozytorium.

## Co tu wchodzi

| Plik | Do czego | Parametry |
|---|---|---|
| `demo-relai-25s-pl.gif` | osadzenie w `README.md` | 960×540, 25 s, 10 kl./s, bez dźwięku |
| `demo-relai-25s-en.gif` | wersja angielska tego samego cięcia | jak wyżej |
| `demo-relai-60s-pl.mp4` | kanały zewnętrzne (wpis, sieć autora) | 1920×1080, 60 s, 30 kl./s, bez dźwięku |
| `demo-relai-60s-en.mp4` | wersja angielska | jak wyżej |

## Zasady

- **Bez zasobów zewnętrznych.** Fonty są osadzone w renderze z `docs/zasoby/fonts/`; materiał nie
  pobiera niczego z sieci przy odtwarzaniu.
- **Bez dźwięku.** Materiał musi być czytelny przy wyciszonym odtwarzaniu — napisy niosą całą treść.
- **Każda klatka pokazująca plik albo odpowiedź agenta ma pokrycie** w zapisie realnego przebiegu.
  Tabela pokrycia i sposób sprawdzenia: [`docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md`](../../plany/PIERWSI_UZYTKOWNICY/DEMO.md)
  (po zamknięciu planu: w archiwum planów).
- **GIF do README trzyma się poniżej 5 MB** (SZACUNEK — próg przyjęty dla czasu wczytania strony
  repozytorium). Przekroczenie rozwiązuje się liczbą klatek i paletą, nie skróceniem materiału.
- Plik wynikowy wchodzi tutaj **po akceptacji właściciela**, nigdy „na próbę".

## Czego tu nie ma

Nagrania ekranu. Materiał jest **odtworzeniem zmierzonego przebiegu**, renderowanym z zapisu
prawdziwej sesji — nie inscenizacją i nie przechwytem obrazu. Wersje narzędzia, modelu i RelAI użyte
w przebiegu stoją w dokumentacji demo.
