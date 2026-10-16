# BRIEF — prototyp „Film” (plan STRONA_RELAI)

Drugi prototyp do porównania z „Biurkiem” (PLAN.html, sekcja 4, wariant 4; Aneks C pkt 2).
Wywiad jest wspólny z Biurkiem: te same trzy rundy pytań z 2026-10-16, ta sama historia i ta sama
krzywa energii — brief Biurka: [../biurko/BRIEF.md](../biurko/BRIEF.md). Ten brief nie powtarza
wywiadu; zapisuje to, czym Film różni się w sposobie opowiadania. Pozycje oznaczone **decyzja
autorska** podjąłem sam w E5 w granicach planu i Aneksu C.

Autor: RelAI (Opus 5.5) + Lukasz · 2026-10-16

## Co jest wspólne z Biurkiem (z wywiadu, bez zmian)

- **Nastrój:** kierunek „Warsztat z wigorem” — kremowy papier, glina, musztarda, szałwia, Kalam
  w notatkach, zaokrąglenia, spokój zamiast krzyku. Odniesienie z własnego medium: film 3.0.0
  (`docs/zasoby/film/`), klatki `E1-klatka.png`, `E3-scena1.png`, `E5-komendy-1.png`,
  `E4-scena6.png`. W Filmie to odniesienie jest **miarą wyglądu**, nie tylko inspiracją.
- **Krzywa energii:** „Cicho, jeden szczyt, spokój.”
- **Szczyt:** „Bałagan układa się w porządek” — karteczki z pytaniami składają się w cztery
  dokumenty projektu.
- **Droga:** czym jest RelAI → problem (agent zapomina) → pamięć w plikach → plan → panel →
  komendy → instalacja z konfiguratora. Treść nie przeładowana, nie zniechęca na wejściu.
- **Zakazy:** D-61a i D-61b (bez fioletu, poświaty, emoji, stocków; bez terminala, panelu
  administracyjnego, blueprintu, brutalizmu). Grafika z kodu: HTML, CSS 3D, SVG — bez zdjęć,
  bez klipów, bez WebGL (PLAN 4B „Sam CSS 3D — tylko w Filmie”; Aneks A pkt 2).
- **Jedna etykieta wezwania:** „Zainstaluj” / „Install”.

## Czym Film różni się od Biurka

Biurko to **miejsce**: jedna scena 3D, kamera jedzie po przedmiotach, nawigacja to mapa.
Film to **opowieść**: płaski papier, na którym rzeczy przylatują, składają się i odlatują
w rytmie przewijania, tak jak w filmie 3.0.0. Nie ma kamery w przestrzeni — jest kadr, a głębię
dają nałożone plany, cień z przesunięciem i przechył CSS 3D w chwilach, które coś znaczą.

## Gramatyka: Filmic one-shot (uniqueness.md §2.1) — uzasadnienie dryfu

Skill traktuje filmowy przelot jako domyślny dryf i każe go uzasadnić (PLAN, sekcja 4: „trzeba
uzasadnić”). Uzasadnienie:

1. **To jest wybór z wywiadu, nie odruch.** Łukasz wybrał „Film” po szkicach jako drugi wariant
   do porównania z „Biurkiem” (PLAN 4, wariant 4: „Ciągły kinowy przelot w języku filmu 3.0.0”).
   Prototyp istnieje po to, żeby porównać gramatykę ciągłego świata z gramatyką filmu.
2. **Język już istnieje i jest sprawdzony.** Film 3.0.0 przeszedł kalibrację w siedmiu etapach;
   strona w tym języku jest jego przedłużeniem, nie nowym stylem.
3. **Historia jest jedną linią z jednym łukiem** (cisza → szczyt → spokój) — dokładnie to, do
   czego §2.1 pasuje: „a single linear argument with one emotional arc”.

Dlaczego przegrało pozostałe siedem:

- **Continuous world** — to Biurko; Film w tej gramatyce byłby drugim Biurkiem bez światła.
- **Chaptered editorial** — szkic 2 odrzucony przez Łukasza: „bez efektu, którego szukasz”.
- **Live surface** — szkic 1 odrzucony jako najmniej efektowny; jego elementy (makiety pasków,
  konfigurator jako pole) są w Filmie jako akty, nie jako gramatyka.
- **Typographic poster** — RelAI pokazuje się przez dokumenty i paski, nie przez sam tekst.
- **Gallery / catalog** — piętnaście komend to nie katalog; strona ma drogę i szczyt.
- **Split stage** — historia nie jest sporem dwóch stron; „przed i po” trwa jeden akt.
- **Rhythmic cutlist** — cięcia przeczą krzywej „cicho, jeden szczyt, spokój”.

**Odstępstwa techniczne (decyzja autorska):** bez `scrub` i bez trybu `worldflight` — oba są
zbudowane na klipach wideo, których w planie nie ma (Aneks A pkt 2). Ruch niosą `pin` z własnym
JS strony czytającym `--sc-p`, `parallax`, `reveal`, `pan`, `kinetic` i `spotlight`. Silnik
zostaje bez zmian (`site/vendor/scrollcraft/`, bajt w bajt z pluginu 0.3.1).

## Podróż: siedem punktów historii w sześciu aktach

Amnezja, cisza i szczyt dzieją się na jednym stole — te same karteczki, które w amnezji leżą
w nieładzie, w szczycie lecą na swoje miejsca. Dlatego to jeden akt przypięty z trzema fazami,
nie trzy osobne (**decyzja autorska**; dwa przypięte akty pod rząd złamałyby też regułę
„nigdy dwa razy to samo urządzenie po sobie”).

| # | Akt | Punkt historii | Co odwiedzający wie po nim | Długość (vh) |
|---|---|---|---|---|
| 1 | Wejście | Wejście | RelAI to pamięć projektu dla pracy z agentem AI | 1,0 (przepływ) |
| 2 | Pamięć | Amnezja → cisza → Porządek (szczyt) | każda sesja zaczyna od zera; pamięć mieszka w czterech plikach | 4,8 (przypięty) |
| 3 | Plan | Plan | duża praca idzie etapami, plan po akceptacji jest zamrożony | ok. 1,1 (przepływ) |
| 4 | Panel | Panel | stan pracy, limity i koszty widać nad promptem | 2,2 (przypięty) |
| 5 | Komendy | Komendy | piętnaście komend albo zwykłe zdania | 2,8 (przypięty, poziomo) |
| 6 | Instalacja | Instalacja | wie, co wpisać, i ma to w schowku albo w terminalu | 1,15 (przypięty) |

Razem ok. 13 wysokości okna — poza pasmem 13,6–13,8 z rejestru skilla (uniqueness.md §1).

## Krzywa odczuć (przed aktami)

```
1  Ciekawość   papier w kropki, karteczka-logo ląduje na pinezce, nagłówek składa się linia po linii
2a Rozpoznanie pusty czat i karteczki z pytaniami, które zadajesz agentowi od nowa, przenikające się zdania
   (cisza)     karteczki leżą w nieładzie, żadnego tekstu — stół czeka
2b Ulga        karteczki podrywają się i każda staje się wierszem w jednym z czterech dokumentów
3  Zaufanie    arkusz planu odsłania się etap po etapie, na końcu pieczątka „zamrożony”
4  Kontrola    przechylone okno aplikacji prostuje się i nad promptem wchodzą trzy paski
5  Ciekawość   taśma fiszek komend przesuwa się w bok, każda z nazwą i jednym zdaniem
6  Gotowość    reflektor na konfiguratorze: Twoja komenda, Twój Enter
```

Sąsiednie akty mają różne odczucia. Akty 1 i 5 dzielą słowo „ciekawość”, ale nie sąsiadują —
pierwsza to ciekawość „co to jest”, druga „co jeszcze potrafi”.

## Szczyt

> „przewijasz, a pytania, które zadajesz agentowi w kółko, zrywają się ze stołu i każde staje
> się wpisem w jednym z czterech plików projektu”

Mieszka w akcie 2, faza 2b. Dostaje najdłuższy odcinek przewijania na stronie (ok. 2,3 wysokości
okna z 3,8 drogi przypiętej aktu 2), ciszę przed sobą (faza „cisza”, ok. 0,4 wysokości okna) i cały
budżet ruchu. Jednym ruchem kółka (`deltaY` 1000 przy 768 px okna = 1,3 wysokości) nie da się go
przeskoczyć.

## Zdanie „It's the site where…”

> It's the site where the questions you keep asking your AI lift off the page and turn into
> printed lines in your project's memory.

Po polsku: to strona, na której pytania zadawane agentowi w kółko odrywają się od stołu
i zamieniają w wydrukowane wiersze pamięci projektu.

## Ruch-podpis: pismo odręczne staje się drukiem

Każda karteczka z pytaniem (Kalam, krzywo, na taśmie) leci własnym torem do jednego z czterech
dokumentów. W chwili lądowania jej pismo odręczne gaśnie, a w dokumencie w tym samym miejscu
pojawia się wydrukowany wiersz (Hanken Grotesk) z odpowiedzią — pytanie „jaka była ta decyzja?”
staje się w `DECYZJE.md` wpisem „D-12 · baza: Postgres, nie Mongo”. Wiersze są oznaczone jako
przykład. Ruch jest podpięty pod postęp przewijania, przewinięcie wstecz rozkleja wpisy i odkłada
karteczki z powrotem w nieład. Kod podpisu jest w `site/film/`, czyta `--sc-p` aktu; silnik go nie
zna.

Ruch-podpis i zdanie „It's the site where…” wskazują ten sam moment.

## Zaplanowana cisza

Akt 2, między fazą 2a a 2b: karteczki leżą, tekstu aktu nie ma przez ok. 0,4 wysokości okna.
To cisza zamierzona — zrzut z tego odcinka bez napisu jest poprawny.

## Partytura (urządzenie na akt)

| Akt | Urządzenie | Dlaczego to |
|---|---|---|
| 1 Wejście | przepływ + `parallax` planów + `kinetic` linii nagłówka | spokojne otwarcie, głębia z różnicy przesunięć, nic nie stoi w miejscu na siłę |
| 2 Pamięć | `pin` + własny JS na `--sc-p` (ruch-podpis) | stół trzyma się w kadrze, a na nim dzieje się jedyna duża zmiana strony |
| 3 Plan | przepływ + `reveal` (wycieranie `clip-path`) | odsłonięcie to zmiana stanu: plan jest, a potem jest zamrożony |
| 4 Panel | `pin` + przechył CSS 3D na `--sc-p` | okno w przechyle prostuje się do pasków, jak w filmie 3.0.0 |
| 5 Komendy | `pan` | ruch w bok czyta się jak „opcje”, w dół jak „argument” |
| 6 Instalacja | `pin` + `spotlight` | strona przestaje się ruszać i zaczyna odpowiadać |

Rodziny urządzeń: parallax, pin, reveal, pan, spotlight, kinetic — sześć; żadna nie stoi dwa razy
po sobie; `scrub` zero razy.

## Kontrakt warstw hero (approved-collection.md §2)

| Plan | Obiekt | Ruch przy przewijaniu | Styk i zasłanianie |
|---|---|---|---|
| Daleki | papier w kropki i dwie ciepłe plamy światła (jak `Biurko.tsx` filmu) | stały, punkt odniesienia | bez ruchu w pętli |
| Środkowy | ciemne okno aplikacji z pustym czatem, w lekkim przechyle 3D, wychodzi za prawą krawędź | wolniej niż przewijanie (`parallax` dodatni) | za karteczką-logo, nigdy za nagłówkiem |
| Obiekt główny | karteczka-logo na pinezce, przyklejona na rogu okna | razem z oknem, ląduje przy wejściu | zachodzi na krawędź okna (zasłanianie) |
| Pierwszy plan | karteczka z pytaniem „o czym rozmawialiśmy?” przy dolnej krawędzi, większa i lekko rozmyta | najszybciej (`parallax` ujemny) | prawy dół, nigdy pod nagłówkiem ani wezwaniem |
| Atmosfera | ziarno papieru | stałe | bez cząsteczek |
| Tekst i wezwanie | semantyczny HTML po lewej: nagłówek, zdanie, „Zainstaluj” | stały, gaśnie z wyjściem aktu | cały nagłówek czytelny, wezwanie bez przewijania |

## Ekran ładowania (Aneks C pkt 2, **decyzja autorska** w kształcie)

Papier tego samego stołu; na środku karteczka-logo na pinezce, pod nią ręczne podkreślenie, które
rośnie od lewej o trzy kroki — fonty, silnik, pierwsze ułożenie hero. Każdy krok to prawdziwy
sygnał przeglądarki, nie zegar. Gdy hero jest gotowe, ekran schodzi jednym przejściem
(przezroczystość i lekkie uniesienie, ok. 450 ms). Bez JS ekranu nie ma (pokazuje go dopiero
skrypt w nagłówku). Przy błędzie silnika schodzi od razu, a limit czasu (4 s) zdejmuje go zawsze.

## Bramka fingerprint

Rejestr `docs/zasoby/STRONA/FINGERPRINTS.md` jest pusty. Porównanie z planowanym wierszem Biurka
(brief Biurka, tabela „Bramka fingerprint”):

| Wymiar | Biurko | Film | Różne? |
|---|---|---|---|
| Gramatyka | Continuous world | Filmic one-shot | tak |
| Nawigacja | mapa biurka, siedem przystanków | stały pasek: znak, język, jedno wezwanie | tak |
| Hero | ustawienie kamery w świecie 3D | papier, okno w przechyle, karteczka-logo, nagłówek linia po linii | tak |
| Kształt sekwencji | 7 przystanków + cisza, szczyt najdłuższy | 6 aktów, cisza i szczyt w jednym akcie, szczyt najdłuższy | częściowo |
| Zamknięcie | dojazd kamery do ekranu laptopa | reflektor nad konfiguratorem na papierze | tak |
| Ruch-podpis | karteczki składają się w dokumenty | pismo odręczne pytania staje się drukowanym wpisem | tak |

Pięć z sześciu różnych — bramka (co najmniej 4) przechodzi. Wiersz trafia do rejestru po wyborze
wersji i wydaniu, nie w E5.

## Czego Film świadomie nie robi

- Bez WebGL, zdjęć, klipów i generowanych obrazów; bez `scrub` i `worldflight`.
- Bez licznika aktów, strzałki „przewiń”, eyebrow nad każdym nagłówkiem, półpauzy w tekście.
- Bez liczb spoza repozytorium: liczba fiszek i wersje z `site/dane/fakty.json`; paski na danych
  przykładowych z widocznym oznaczeniem.
- Bez muzyki i dźwięku (strona, nie film).
- Telefon, pełne reduced motion i plakat zastępczy — E7, jeśli bramka wybierze Film.
