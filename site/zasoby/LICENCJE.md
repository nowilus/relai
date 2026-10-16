# Licencje zasobów w `site/zasoby/`

Wszystkie zasoby 3D, tekstury i mapa otoczenia tej strony pochodzą z dwóch bibliotek wydających je
na licencji **CC0 1.0 Universal** (domena publiczna): można je kopiować, przerabiać i rozpowszechniać
także komercyjnie, bez uznania autorstwa. Autorów podajemy mimo to.

Licencje przeczytane na stronach bibliotek 2026-10-16:

- Poly Haven — <https://polyhaven.com/license>: „Our assets are all licensed as CC0”.
- ambientCG — <https://docs.ambientcg.com/license/>: „All ambientCG assets are provided under the
  Creative Commons CC0 1.0 Universal License”.

Pełny, sprawdzany testem wykaz (plik po pliku: strona zasobu, autor, licencja, data pobrania,
zakres przeróbki i suma `sha256`) jest w [`ZRODLA.json`](ZRODLA.json). Test
`site/narzedzia/zasoby.test.mjs` pilnuje, że każdy plik z tego folderu ma wpis z licencją `CC0`
i zgodną sumą, a każdy wpis ma plik.

## Wykaz zasobów

| Zasób | Biblioteka | Strona | Autor |
|---|---|---|---|
| `desk_lamp_arm_01` (model) | Poly Haven | <https://polyhaven.com/a/desk_lamp_arm_01> | Yann Kervran, Kuutti Siitonen |
| `potted_plant_02` (model) | Poly Haven | <https://polyhaven.com/a/potted_plant_02> | Rico Cilliers |
| `stationery_supplies` (model) | Poly Haven | <https://polyhaven.com/a/stationery_supplies> | Mateusz Sadek |
| `office_notepads` (model) | Poly Haven | <https://polyhaven.com/a/office_notepads> | Ulan Cabanilla |
| `standing_picture_frame_02` (model) | Poly Haven | <https://polyhaven.com/a/standing_picture_frame_02> | James Ray Cock |
| `hanging_picture_frame_02` (model) | Poly Haven | <https://polyhaven.com/a/hanging_picture_frame_02> | James Ray Cock |
| `alarm_clock_01` (model) | Poly Haven | <https://polyhaven.com/a/alarm_clock_01> | Yann Kervran, James Ray Cock |
| `wood_table_worn` (tekstura) | Poly Haven | <https://polyhaven.com/a/wood_table_worn> | Dimitrios Savva, Rico Cilliers |
| `painted_plaster_wall` (tekstura) | Poly Haven | <https://polyhaven.com/a/painted_plaster_wall> | Amal Kumar |
| `comfy_cafe` (HDRI) | Poly Haven | <https://polyhaven.com/a/comfy_cafe> | Sergej Majboroda |
| `Cork001` (materiał) | ambientCG | <https://ambientcg.com/a/Cork001> | ambientCG |
| `Paper006` (materiał) | ambientCG | <https://ambientcg.com/a/Paper006> | ambientCG |
| `Paper002` (materiał) | ambientCG | <https://ambientcg.com/a/Paper002> | ambientCG |
| `Metal011` (materiał) | ambientCG | <https://ambientcg.com/a/Metal011> | ambientCG |

Pliki modeli (`.gltf`, `.bin`) są bez zmian w stosunku do pobranej wersji 1k. Tekstury zostały
przeskalowane i ponownie zapisane jako JPEG (blat, ściana i korek z wersji 2K); zakres przeróbki każdego pliku jest w polu
`przerobiono` w `ZRODLA.json`.

Pozostałe elementy sceny (laptop z klawiaturą, kubek, teczka, pudełko z fiszkami, dokumenty, okno
z miastem za nim, szuflada, książki, kable) są napisane w kodzie strony i nie pochodzą
z zewnętrznych zasobów.
