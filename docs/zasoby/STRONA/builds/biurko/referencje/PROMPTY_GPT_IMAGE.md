# Prompty GPT image — obrazy wzorcowe realistycznego biurka

Wersja 1 · 2026-10-16 · dla planu STRONA_RELAI (zmiana kierunku po E1, Aneks A w przygotowaniu)

**Po co:** obrazy z tej listy **nie trafiają na stronę**. Są wzorcem wyglądu: z nich biorę układ
biurka, proporcje przedmiotów, materiały, światło i detal, a scenę buduję w three.js z gotowych
modeli i materiałów CC0. Swobodny lot kamery zostaje. Im bardziej obraz przypomina prawdziwe
zdjęcie, tym lepszy wzorzec.

## Jak generować

1. ChatGPT, **nowa rozmowa** przeznaczona tylko na te obrazy, z modelem, który generuje obrazy.
2. Jeśli okno ma ustawienia obrazu: **proporcje poziome** (3:2 albo 16:9) i **najwyższa jakość**.
   Gdy nie ma wyboru, proporcje wymusza już sam prompt.
3. **Najpierw obraz 01** (wzorcowy). Poprawiaj go zdaniami w tej samej rozmowie, aż będzie dobry.
   Dopiero potem generuj 02–08: **w tej samej rozmowie**, każdy z promptem z tej listy. Prompty
   02–08 zaczynają się od odwołania do obrazu 01, żeby biurko, światło i przedmioty były te same.
4. Pobierz **oryginalny plik** (przycisk pobierania, nie zrzut ekranu) i nazwij go jak w nagłówku
   (`01-hero.png` …). Wrzuć do tego folderu:
   `docs/zasoby/STRONA/builds/biurko/referencje/`.
5. Prompty wklejaj **po angielsku i dosłownie**, każdy w całości z bloku kodu. Poprawki możesz pisać
   po polsku.

**Jeśli wynik wygląda sztucznie**, dopisz w tej samej rozmowie jedno z tych zdań (albo własne):

- `Make it look like an unretouched photo from a real camera: less smooth surfaces, real dust, slight wear, natural noise.`
- `Less saturated, less glossy. No CGI look, no plastic, no clay.`
- `Keep everything else exactly the same, change only: <co zmienić>.`

Napisy w obrazach nie mają znaczenia. Prawdziwy tekst (dokumenty, karteczki, ekran laptopa)
i tak dodam na stronie jako HTML. Dlatego prompty proszą o puste etykiety i tekst nieczytelny.

## Styl wspólny (już wklejony na początku promptu 01; prompty 02–08 dziedziczą go z obrazu 01)

```
Photorealistic photograph, shot on a full-frame camera, 35mm lens, f/2.8, natural film grain.
A real, slightly lived-in wooden writing desk of a solo software developer, late evening.
One warm desk lamp is the only strong light source; soft, physically correct shadows; the rest of the room falls into a calm half-dark.
Palette: warm cream paper (#f2e9d8), terracotta clay accents (#c4643c), muted mustard (#d9a134), sage green (#5f8a68), dark walnut wood, brushed aluminium.
Real materials with real imperfections: visible wood grain and small scratches, paper fibre and soft creases, fingerprints on the laptop, a little dust in the lamp light.
No CGI look, no plastic, no clay, no low-poly, no cartoon, no purple, no neon, no glow effects, no stock-photo staging, no people, no readable text, no brand logos.
```

## 01-hero.png — całe biurko, kadr wejścia

Biorę z niego: układ wszystkich przedmiotów, światło, nastrój, wolne miejsce na nagłówek.

```
Photorealistic photograph, shot on a full-frame camera, 35mm lens, f/2.8, natural film grain.
A real, slightly lived-in wooden writing desk of a solo software developer, late evening.
One warm desk lamp is the only strong light source; soft, physically correct shadows; the rest of the room falls into a calm half-dark.
Palette: warm cream paper (#f2e9d8), terracotta clay accents (#c4643c), muted mustard (#d9a134), sage green (#5f8a68), dark walnut wood, brushed aluminium.
Real materials with real imperfections: visible wood grain and small scratches, paper fibre and soft creases, fingerprints on the laptop, a little dust in the lamp light.
No CGI look, no plastic, no clay, no low-poly, no cartoon, no purple, no neon, no glow effects, no stock-photo staging, no people, no readable text, no brand logos.

Wide landscape shot (3:2), camera standing slightly to the left of the desk and a little above it, looking across the whole desk towards the wall.
On the wall behind the desk: a cork board with one cream card pinned in the centre with a terracotta pin, and on the right a window with a dark blue evening sky and a few soft out-of-focus city lights.
On the desk, from left to right: a scattered mess of about seven cream and pale mustard sticky notes and loose paper sheets with pencil scribbles; four neat paper documents in plain cream sleeves; a kraft-paper project folder with coloured tab dividers; an open thin aluminium laptop with its screen softly lit and out of focus; a small wooden box of index cards with coloured tabs; a ceramic mug in terracotta glaze; a yellow pencil.
The desk has one shallow drawer at the front, pulled open by a few centimetres.
An articulated metal desk lamp stands on the right side of the desk and lights the middle of the desk in a warm pool.
The lower left third of the frame stays darker and calm, with no objects, so that a headline can sit there.
```

## 02-balagan.png — bałagan z bliska (przed szczytem)

Biorę z niego: jak wyglądają prawdziwe karteczki i kartki w nieładzie, ich zagięcia i cienie.

```
Same desk, same lamp, same light and same objects as in the first image; keep the style identical.
Photorealistic close-up, 50mm lens, f/2.0, camera looking down at about 45 degrees at the left part of the desk.
About seven sticky notes and loose sheets lie in a messy overlapping pile: some curled at the corners, one stuck to the edge of the laptop, one half under the mug, handwritten pencil scribbles that cannot be read.
Warm lamp light from the right, soft shadows under every curled corner, wood grain visible between the papers.
No readable text, no CGI look, no plastic, no clay.
```

## 03-porzadek.png — ten sam papier ułożony (po szczycie)

Biorę z niego: cztery dokumenty jako jeden porządny zestaw, kolory przekładek, krawędzie papieru.

```
Same desk, same lamp, same light as in the first image; keep the style identical.
Photorealistic close-up, 50mm lens, f/2.0, same camera angle as the previous image.
The mess is gone: the same paper is now arranged into four neat documents lying side by side in a row, each in a plain cream sleeve with one small coloured tab (terracotta, mustard, sage, cream), edges aligned, a little natural paper thickness visible.
Empty blank label strips on the sleeves, no readable text.
Calm, orderly, the warm lamp light falls across all four.
No CGI look, no plastic, no clay.
```

## 04-teczka.png — teczka planu (przystanek „Plan”)

Biorę z niego: teczkę z tektury, przekładki etapów, grubość i fakturę kartonu.

```
Same desk, same lamp, same light as in the first image; keep the style identical.
Photorealistic close-up, 50mm lens, f/2.8, camera at desk height slightly above.
The kraft-paper project folder lies open: inside, a stack of pages separated by five coloured tab dividers, the first two pages marked with a small pencil tick, a paper clip on the top page.
Real cardboard texture, slightly worn corners, a soft crease on the spine.
No readable text, no CGI look, no plastic, no clay.
```

## 05-laptop.png — laptop (przystanek „Panel” i instalacja)

Biorę z niego: kształt i proporcje laptopa, aluminium, klawiaturę, poświatę ekranu na blacie.

```
Same desk, same lamp, same light as in the first image; keep the style identical.
Photorealistic three-quarter close-up of the open thin aluminium laptop, 50mm lens, f/2.8.
Brushed aluminium with a few fingerprints, dark keyboard keys with slight shine on the most used ones, the screen shows a calm dark interface with a few horizontal coloured bars in terracotta, mustard and sage, completely out of focus.
The screen throws a faint cool light on the keyboard and the desk, the lamp adds warm light from the right.
No readable text, no brand logos, no CGI look, no plastic.
```

## 06-pudelko.png — pudełko z fiszkami (przystanek „Komendy”)

Biorę z niego: drewniane pudełko, fiszki, kolorowe zakładki, jak papier stoi w pudełku.

```
Same desk, same lamp, same light as in the first image; keep the style identical.
Photorealistic close-up, 50mm lens, f/2.0, camera slightly above, looking into the box.
A small wooden index-card box with an open lid, about fifteen cream index cards standing inside, separated by tabs in terracotta, mustard and sage; one card pulled halfway out.
Real wood with darker edges from handling, slightly soft card corners.
No readable text, no CGI look, no plastic, no clay.
```

## 07-materialy.png — arkusz materiałów

Biorę z niego: faktury do materiałów PBR (drewno blatu, papier, korek, metal lampy, szkliwo kubka).

```
Same desk and objects as in the first image; keep the style identical.
A photorealistic material study in a 3x2 grid of macro photographs, flat even light, each square filling its cell:
dark walnut desk wood grain with fine scratches; cream paper fibre with a soft crease; cork board surface with a pin hole; brushed metal of the desk lamp; terracotta ceramic mug glaze with small glaze bubbles; aluminium of the laptop with a fingerprint.
No text, no borders, no CGI look.
```

## 08-wieczor.png — koniec drogi (przystanek „Instalacja”)

Biorę z niego: spokojny kadr końcowy, lżejszy nastrój, ten sam stół po skończonej pracy.

```
Same desk, same lamp, same light and same objects as in the first image; keep the style identical.
Photorealistic medium shot, 35mm lens, f/2.8, camera lower and closer to the laptop on the right side of the desk.
Work is done: the four documents lie neatly stacked, the folder is closed, the index-card box lid is shut, the mug is half full; the laptop screen is softly lit and out of focus.
Calm, quiet, slightly warmer light, the window behind is darker blue.
No readable text, no CGI look, no plastic, no clay.
```

## Co mi oddać

Osiem plików `01-hero.png` … `08-wieczor.png` w tym folderze. Jeśli któryś obraz wyszedł dobrze
tylko częściowo, opisz jednym zdaniem, co Ci się w nim podoba, a co nie. To też jest wzorzec.
