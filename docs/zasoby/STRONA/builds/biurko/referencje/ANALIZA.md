# ANALIZA obrazów wzorcowych — realistyczne biurko (STRONA_RELAI E2)

Wersja 1 · 2026-10-16 · Autor: RelAI (Sonnet 5.5, na zgodę Łukasza mimo wymaganego Opus 5.5) + Lukasz

Obrazy: `01-hero.jpg` … `08-wieczor.jpg` (JPEG q90, 1536 × 1024) i `07b-materialy-neutralne.jpg`;
barwy mierzone na oryginałach PNG (lokalnie, poza gitem) próbką 21 × 21 pikseli, `probki.ps1`
w katalogu roboczym etapu. Proporcje w metrach to **SZACUNEK** z porównania do przedmiotów o znanym
rozmiarze (laptop 13", karta indeksowa 127 × 76 mm, kartka A4/A5, kubek 0,09 m).

## Co biorę z każdego obrazu

| Obraz | Co biorę | Co świadomie pomijam |
|---|---|---|
| `01-hero` | układ: stół z szufladą na pierwszym planie, tablica korkowa na ścianie nad nim, okno po prawej z miastem nocą, lampa po prawej jako jedyne ciepłe źródło (kłęby kurzu w stożku światła), laptop w środku, pudełko z fiszkami i kubek pod lampą, roślina z lewej, kartki i karteczki w lewej części blatu. Lewy dolny róg ciemny (miejsce na nagłówek). | Krzesło ze swetrem w lewym dolnym rogu (poza kontraktem warstw: zasłaniałoby nagłówek; ciemny pierwszy plan daje kubek i brzeg blatu), drugie zdjęcie na korku, jeden stos kartek zamiast czterech dokumentów (te pokazuje 03). |
| `02-balagan` | jak wyglądają karteczki i kartki w nieładzie: zagięte rogi, kartka częściowo pod kubkiem, jedna przyklejona do krawędzi laptopa, kartki liniowane z szkicami, karteczki z kratkami do odhaczania; głębia ostrości, miękki cień pod każdym zagięciem. | Czytelne pismo (tekst robi strona jako HTML/Kalam). |
| `03-porzadek` | cztery dokumenty w kremowych okładkach obok siebie, z jedną kolorową zakładką (terakota, musztarda, szałwia, krem) i pustą etykietą; widoczna grubość papieru; krawędzie równe. | — |
| `04-teczka` | teczka z tektury: otwarta, pięć przekładek (terakota, musztarda, szałwia, krem, ciemna zieleń), spinacz, ptaszki ołówkiem na pierwszych dwóch kartkach, zagięcie grzbietu, wytarte rogi. | — |
| `05-laptop` | kształt i proporcje laptopa 13" (aluminium w kolorze „space gray”, ciemne klawisze, duży gładzik, zawias), ekran ciemny z poziomymi paskami terakota / musztarda / szałwia, chłodna poświata ekranu na klawiaturze, ciepłe światło lampy z prawej, odciski palców. | Logo i napisy. |
| `06-pudelko` | drewniane pudełko na fiszki z uchylonym wiekiem (zawias, połączenia narożne), ok. 15 fiszek, przekładki terakota / musztarda / szałwia, jedna fiszka wysunięta do połowy. | — |
| `07` / `07b` | faktury: słoje i rysy orzecha, włókno papieru z zagięciem, granulki korka z dziurką po pinezce, szlif mosiądzu, szkliwo z pęcherzykami, odcisk na aluminium. **Barwy tylko z `07b`** (neutralne światło); z `07` (ciepłe światło) tylko połysk i fakturę. | Barwy z `07` (podbarwione światłem). |
| `08-wieczor` | kadr końcowy: dwa stosy dokumentów, teczka zamknięta, pudełko zamknięte, kubek w terakocie, laptop, ciemniejsze niebo za oknem; niska kamera tuż nad blatem. | Kolor niebieski nieba bardziej nasycony niż w `01` — biorę wartość z `01`. |

## Zmierzone barwy (`07b`, neutralne światło) — wartości docelowe materiałów

| Materiał | Barwa średnia | Uwaga do materiału PBR |
|---|---|---|
| drewno blatu (orzech) | `#492d1e` | ciemne, ciepłe, roughness ok. 0,55–0,7, rysy w mapie roughness |
| papier kremowy | `#decebd` | roughness ≈ 0,9, bez połysku, drobne włókno w normal |
| korek | `#b07240` | roughness ≈ 0,95, wyraźna normal mapa |
| mosiądz / miedź lampy | `#a48067` | metalness 1, roughness ≈ 0,35, szlif radialny |
| szkliwo kubka (terakota) | `#94441a` | dielektryk, roughness ≈ 0,3, kropki ciemne (`#2a1a14`), lekki clearcoat |
| aluminium laptopa | `#807e81` | metalness 1, roughness ≈ 0,45, drobny odcisk palca w roughness |

Barwy w kadrze `01` (światło lampy; mierzone, nie do materiałów): blat w świetle `#b37949`, blat w cieniu
`#2e1e0e`, ściana po lewej `#423022`, niebo za oknem `#22304d`. Kremowy papier w tym świetle schodzi do
`#825f44`, więc światło musi być wyraźnie cieplejsze i słabsze niż w `07b` — materiały trzymam przy
barwach z `07b`, a o wyglądzie decyduje lampa.

## Układ i proporcje (SZACUNEK, metry)

- Stół roboczy ok. 1,6 × 0,75 m, wysokość 0,74 m, blat gruby 4–5 cm, pod blatem jedna płytka szuflada
  przy brzegu, wysunięta na ok. 6 cm (to „szuflada” z wypowiedzi Łukasza).
- Tablica korkowa ok. 0,9 × 0,6 m, rama z jasnego drewna, jej dolna krawędź ok. 0,25 m nad blatem;
  kartka-logo ok. 0,18 × 0,13 m z pinezką terakota.
- Okno prawe ok. 0,9 × 1,2 m z ciemnoniebieskim niebem i rozmytymi światłami miasta; parapet z roślinami.
- Lampa: podstawa ok. 0,16 m, ramię przegubowe, klosz ok. 0,2 m, wysokość do kloszu ok. 0,5 m; światło
  nad środkiem blatu.
- Laptop 13": podstawa 0,30 × 0,21 m, ekran pochylony o ok. 105°.
- Teczka A4 otwarta 0,46 × 0,31 m; dokumenty 0,21 × 0,30 m; karteczki 0,076 m; kubek Ø 0,085 × 0,095 m;
  pudełko na fiszki 0,20 × 0,11 × 0,10 m; ołówek 0,19 m.

## Detal robiący realizm (lista do wdrożenia)

1. Rysy i matowe plamy w roughness blatu, wyraźna normal mapa słojów.
2. Cienie kontaktowe pod każdym przedmiotem i miękkie cienie lampy.
3. Kurz w stożku światła lampy (kilkadziesiąt punktów, bardzo słabe, bez ruchu w pętli — kontrakt warstw).
4. Zagięte rogi kartek i karteczek (siatka lekko wygięta), różna wysokość warstw, cień pod zagięciem.
5. Odciski palców na aluminium w mapie roughness laptopa; ekran jako CSS3D z poświatą na klawiaturze.
6. Szkliwo kubka z kropkami i lekkim clearcoat, ciemna kawa w środku.
7. Rozmycie głębią ostrości tylko w tle i na pierwszym planie, ziarno filmowe na całej klatce (lekkie).

## Tabela: obiekt → zasób CC0 albo kod na materiałach PBR

| Obiekt | Źródło | Zasób |
|---|---|---|
| blat, rama stołu, szuflada | kod (płyta, nogi, pudełko szuflady) | tekstura Poly Haven `wood_table_worn` |
| ściana | kod (płaszczyzna) | tekstura Poly Haven `painted_plaster_wall` |
| tablica korkowa, rama | kod | tekstura ambientCG `Cork001` + drewno `wood_table_worn` |
| kartka-logo z pinezką, karteczki, kartki | kod + tekstury canvas z tekstem (E1) | papier ambientCG `Paper003` (kremowy przez tint) |
| podkładki z karteczkami (pliki) | model Poly Haven `office_notepads` | tylko jako uzupełnienie nieładu; pismo i kolory z kodu |
| okno z miastem | kod (rama, szyba) + niebo canvas z bokeh | brak zasobu (proceduralne) |
| lampa | model Poly Haven `desk_lamp_arm_01` (terakotowy lakier z modelu) | światło SpotLight z kodu |
| laptop | kod (bryła, klawisze instancjonowane, ekran CSS3D) | tekstura ambientCG `Metal012` (aluminium) — po próbie w scenie |
| kubek | kod (bryła obrotowa) + tekstura canvas z kropkami | brak zasobu |
| ołówek, długopisy, kubek na ołówki | model Poly Haven `stationery_supplies` | — |
| teczka z przekładkami, dokumenty w okładkach | kod | tektura ambientCG `Cardboard002` + `Paper003` |
| pudełko z fiszkami | kod | drewno `wood_table_worn` + `Paper003` |
| roślina | model Poly Haven `potted_plant_02` | — |
| środowisko (odbicia) | HDRI Poly Haven `comfy_cafe` 1k, mała intensywność | — |

Odrzucone przy doborze: Poly Haven `classic_laptop` (to komputer z lat 80.), `WoodenTable_01` (ławka),
`WoodenTable_03` (komoda), `metal_office_desk` (metal, szary), `vintage_wooden_drawer_01` (komoda
z szufladkami, za duża). Poly Haven nie ma nowoczesnego laptopa ani kubka ceramicznego — stąd kod.
