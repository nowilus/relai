# BRIEF — prototyp „Biurko” (plan STRONA_RELAI)

Wywiad: 2026-10-16, trzy rundy pytań i cztery szkice struktur (wpis dziennika
„Plan STRONA_RELAI: wywiad, szkice czterech struktur, plan do akceptacji”). Brief **nie jest
samodzielnie napisany**: wybory pochodzą od Łukasza. Cytaty w cudzysłowie są dosłowne.
Pozostałe pozycje streszczają odpowiedzi z wywiadu (oznaczone „z wywiadu”). Pozycje oznaczone
**decyzja autorska** podjąłem sam w E1 w granicach zaakceptowanego planu.

Autor: RelAI (Opus 5.5) + Lukasz · 2026-10-16

## Osiem tematów wywiadu

1. **Nastrój w kilku słowach i odniesienia.** Łukasz o efekcie: „musiałoby to być naprawdę
   tak dopracowane […] wszystkie te takie elementy całego otoczenia biurka, wszystko musiało
   być tak pięknie graficznie w tym FreeJS-ie dostosowane, żeby było z takim mega efektem wow”.
   Kierunek projektu „Warsztat z wigorem” (`docs/USTAWIENIA.md`, 2026-10-12): kremowy papier,
   glina, musztarda, szałwia, Kalam w notatkach, zaokrąglenia, spokój zamiast krzyku. Odniesienie
   z własnego medium: film 3.0.0 i jego klatka kalibracyjna `docs/zasoby/film/kalibracja/E1-klatka.png`
   (ciemne okno, kremowy papier w kropki, karteczka z taśmą, ręczna obwódka).
2. **Droga przewijania jego słowami.** Z wywiadu: najpierw czym jest RelAI, potem problem
   (agent zapomina), potem pamięć w plikach, plan, panel, komendy, na końcu instalacja
   z konfiguratora. O treści: „nie może być tam przeładowana informacjami, nie może zniechęcać na
   wejściu”; szczegóły: „użytkownik może sam sobie poklikać po tych elementach i te elementy […]
   otwierają się w jakiś animowany sposób”.
3. **Krzywa energii.** „Cicho, jeden szczyt, spokój.”
4. **Odczucia po kolei i jeden moment do zapamiętania.** Szczyt: „Bałagan układa się
   w porządek”. Odczucia przystanków: krzywa niżej (**decyzja autorska** w ramach tych słów).
5. **Jedna rzecz, której nie robi żadna strona.** Z wywiadu: rozsypane karteczki z pytaniami do
   agenta same układają się w dokumenty projektu, a każdy obiekt na biurku da się kliknąć
   i otworzyć. Z tego rośnie ruch-podpis (niżej).
6. **Odległość od premium-minimal.** Kierunek „Warsztat z wigorem” zamiast ciemnego minimalizmu.
   Odrzucone na stałe (D-61b): terminal/konsola, panel administracyjny, rysunek techniczny /
   blueprint, plakat brutalistyczny. Zakazane (D-61a): fioletowe gradienty i poświata, przesyt
   emoji, generyczne frazy, stocki.
7. **Jeden świat czy osobne sceny.** Z wywiadu, po obejrzeniu szkiców: „Jeden świat: biurko”
   jako pierwszy prototyp (drugi, „Film”, powstaje w E3 do porównania).
8. **Zasoby.** Z wywiadu: grafika z kodu, bez generowanych zdjęć i klipów. Są: logo „kartka na
   pinezce”, baner, diagram, 15 ikon komend (`docs/zasoby/branding/`), fonty Fraunces, Hanken
   Grotesk, Kalam (`docs/zasoby/fonts/`), paleta `ROOT` z `core/panel/theme.mjs`, kod pasków
   i panelu pluginów (makiety w E2).

Odbiorcy (z wywiadu): programiści solo i osoby nietechniczne prowadzące projekt z AI.
Działanie na końcu: instalacja. Jedna etykieta wezwania na całej stronie: „Zainstaluj” / „Install”.

## Podróż (przystanki)

| # | Przystanek | Co odwiedzający wie po nim |
|---|---|---|
| 1 | Wejście | RelAI to pamięć projektu dla pracy z agentem AI |
| 2 | Amnezja | rozpoznaje własny problem: każda sesja zaczyna od zera |
| 3 | Bałagan → porządek (szczyt) | pamięć mieszka w czterech zwykłych plikach obok kodu |
| 4 | Plan | duża praca idzie etapami, plan nie rozjeżdża się po akceptacji |
| 5 | Panel | stan pracy, limity i koszty widać nad promptem |
| 6 | Komendy | piętnaście komend albo zwykłe zdania |
| 7 | Instalacja | wie, co wpisać, i ma to w schowku albo w terminalu |

## Krzywa odczuć (przed przystankami, decyzja autorska w słowach Łukasza)

```
1  Spokój        biurko w półmroku pod jedną lampą, nic się nie rusza, dopóki nie przewiniesz
2  Rozpoznanie   rozsypane karteczki z pytaniami, które sam zadajesz agentowi od nowa
   (cisza)       kamera zawisa nad bałaganem, bez tekstu, zanim cokolwiek się zmieni
3  Ulga          karteczki podrywają się i składają w cztery dokumenty, bałagan znika
4  Zaufanie      teczka planu z etapami, zamknięta i podpisana
5  Kontrola      laptop z paskami nad promptem: widzisz, ile zostało
6  Ciekawość     pudełko z fiszkami komend, każdą można wyjąć
7  Gotowość      ekran laptopa z konfiguratorem: Twoja komenda, Twój Enter
```

Sąsiednie przystanki mają różne odczucia. Szczyt (3) poprzedza cisza.

## Szczyt

> „przewijasz, a te porozrzucane karteczki z pytaniami podrywają się z biurka i układają
> w cztery porządne dokumenty projektu”

Mieszka w przystanku 3. Dostaje najdłuższy odcinek przewijania (2,2 jednostki drogi wobec 1,0
pozostałych), postój kamery i ciszę przed sobą. W E1 droga do niego jest zgrubna. Pełna
animacja to zakres E2.

## Zdanie „It's the site where…”

> It's the site where the sticky notes scattered over your desk lift off and sort themselves
> into your project's memory as you scroll.

Po polsku: to strona, na której rozsypane po biurku karteczki z pytaniami same układają się
w pamięć projektu, kiedy przewijasz.

## Zaplanowana cisza

Między przystankiem 2 a 3, przez 0,4 jednostki drogi, kamera zawisa nad karteczkami bez tekstu
przystanku. To cisza zamierzona, nie martwe przewijanie. Zrzut z tego odcinka ma pusty panel
tekstu i jest poprawny.

## Gramatyka: Continuous world (uniqueness.md §2.4)

Jedna stała scena, przystanki zamiast sekcji, nawigacja to klikalna mapa biurka, koniec to
konfigurator na ekranie laptopa w tej samej scenie (wybór Łukasza po szkicach, PLAN sekcja 4A).
Jedynym elementem w przepływie dokumentu jest przekładka nadająca długość przewijania. Tekst
przychodzi w stałej warstwie HTML (translateY najwyżej 4vh, okna z plateau).

**Odstępstwo techniczne (decyzja autorska):** tryb `worldflight` silnika scroll-craft jest
zbudowany na klipach wideo, a tu świat to scena three.js liczona w przeglądarce (PLAN 4B).
Zachowuję wszystkie ograniczenia gramatyki (jedna scena, jedna przekładka, mapa, zero bloków
przewijanych nad sceną, jedno tempo kamery), ale ruch kamery piszę w kodzie strony. Silnika nie
zmieniam i nie kopiuję, bo nie ma czego nim sterować.

Dlaczego przegrało pozostałe siedem:

- **Filmic one-shot** — to drugi prototyp („Film”, E3); w Biurku byłby powtórzeniem.
- **Chaptered editorial** — szkic 2 obejrzany i odrzucony: „bez efektu, którego szukasz”.
- **Live surface** — szkic 1 odrzucony jako najmniej efektowny; jego elementy (makiety pasków,
  konfigurator jako pole) przechodzą do obu prototypów.
- **Typographic poster** — RelAI pokazuje się przez przedmioty i dokumenty, nie przez sam tekst.
- **Gallery / catalog** — piętnaście komend to nie katalog produktów; strona ma drogę i szczyt.
- **Split stage** — dzieli uwagę na dwie sceny, a szczyt potrzebuje jednej.
- **Rhythmic cutlist** — cięcia przeczą krzywej „cicho, jeden szczyt, spokój”.

## Ruch-podpis

**Bałagan układa się w porządek:** karteczki z pytaniami do agenta, rozsypane po blacie,
podrywają się pod ręką przewijającego, lecą każda swoim torem i składają się w cztery dokumenty
projektu (stan, dziennik, lekcje, decyzje). Przewinięcie wstecz rozsypuje je z powrotem. Ruch
jest podpięty pod postęp przewijania, nie pod czas. Ruch-podpis i zdanie „It's the site where…”
wskazują ten sam moment. Kod podpisu powstaje w E2.

## Bramka fingerprint

Rejestr `docs/zasoby/STRONA/FINGERPRINTS.md` jest pusty (utworzony 2026-10-16 przez
`workspace.mjs --ensure`). Bramka przechodzi z definicji: nie ma wiersza, od którego trzeba się
różnić. Planowane wymiary do wpisu po wydaniu wybranej wersji:

| Wymiar | Biurko |
|---|---|
| Gramatyka | Continuous world (scena three.js, nie worldflight wideo) |
| Nawigacja | mapa biurka z siedmioma przystankami, klikalna i z klawiatury |
| Hero | ustawienie początkowe w świecie: biurko pod lampą, kartka-logo na pinezce w głębi |
| Kształt sekwencji | 7 przystanków + cisza przed szczytem, szczyt najdłuższy |
| Zamknięcie | dojazd kamery do ekranu laptopa; wezwanie to konfigurator w scenie |
| Ruch-podpis | karteczki z pytaniami składają się w dokumenty projektu |

Wiersz trafia do rejestru po wyborze wersji i wydaniu (E4/E5), nie w E1.

## Kontrakt warstw hero (approved-collection.md §2)

Ruch planów to paralaksa względem dalekiego planu: kamera w hero jednocześnie jedzie
i pochyla się, więc w samych pikselach ekranu najwięcej rusza się plan daleki (pochylenie przesuwa
wszystko o ten sam kąt), a głębię niesie różnica przesunięć między planami (pomiar E1 w dzienniku).

| Plan | Obiekt i głębia | Ruch przy przewijaniu (względem dalekiego) | Zasada styku i zasłaniania |
|---|---|---|---|
| Daleki | ściana, okno na prawym skraju, korkowa tablica | punkt odniesienia | okno za mapą, nie konkuruje z nagłówkiem |
| Środkowy | blat z drewna, lampa, papiery, teczka, pudełko, laptop | średnie | przedmioty stoją na blacie, cienie kontaktowe pod każdym |
| Obiekt główny | kartka-logo na pinezce na tablicy | razem z dalekim, kamera do niej nie dojeżdża | pinezka trzyma kartkę, kartka rzuca cień na korek |
| Pierwszy plan | kubek w glinianym szkliwie i ołówek przy krawędzi blatu | największe, kubek wychodzi dołem kadru | prawy dolny róg, nigdy pod nagłówkiem ani wezwaniem; w E1 ostry, rozmycie do decyzji w E2 |
| Atmosfera | stożek ciepłego światła lampy, ziarno papieru i drewna | stałe, zmienia się tylko z kamerą | bez pętli ozdobnych, bez cząsteczek w ruchu |
| Tekst i wezwanie | semantyczny HTML: nagłówek, zdanie, „Zainstaluj” | stały, okno hero gaśnie przy 0,62 pierwszej drogi | cały nagłówek czytelny, wezwanie widoczne bez przewijania |

Otwarcie: biurko z wysokości siedzącego człowieka, lewa połowa kadru w cieniu pod nagłówkiem,
po prawej lampa, w głębi tablica z kartką-logo, na pierwszym planie kubek. Środek: kamera wstaje
i pochyla się nad blatem, nagłówek gaśnie, tablica wyjeżdża górą. Wyjście: widok z góry na
rozsypane karteczki, czyli przystanek 2. (Układ zmieniony w E1 po pierwszym zrzucie: lampa i okno
przeszły na prawą stronę, bo nagłówek po lewej tracił kontrast na oświetlonym blacie.)

Materiały: drewno i papier z ziarnem liczonym w kodzie, miękkie cienie, jedno ciepłe źródło
światła i chłodne słabe światło okna. Zakaz low-poly, gliny i plastiku (worlds.md).
