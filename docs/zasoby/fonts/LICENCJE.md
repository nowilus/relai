# Fonty osadzane w szablonach HTML — pochodzenie i licencje

Wszystkie kroje poniżej wolno **osadzać w dokumentach i rozpowszechniać**. To warunek konieczny,
bo pliki planów są samowystarczalne: font trafia do HTML-a jako `data:` URI, a gotowy dokument
bywa wysyłany klientowi.

Pliki to podzbiory `latin` i `latin-ext` w formacie WOFF2. **Oba są potrzebne** dla polszczyzny:
`latin` niesie znaki podstawowe i „ó", `latin-ext` — „ą ć ę ł ń ś ź ż".

| Krój | Pliki | Licencja | Źródło |
|---|---|---|---|
| **Caveat** (odręczny, zmienny 400–700) | `caveat-latin*.woff2` | SIL Open Font License 1.1 | fonts.gstatic.com, pobrane 2026-08-07 za zgodą Łukasza |
| **Kalam** (odręczny, 400 i 700) | `kalam-*.woff2` | SIL Open Font License 1.1 | fonts.gstatic.com, pobrane 2026-08-07 za zgodą Łukasza |
| **Fraunces Variable** (szeryf z osią WONK, wagi 100–900) | `fraunces-*-wonk.woff2` | SIL Open Font License 1.1 | pakiet `@fontsource-variable/fraunces` obecny lokalnie |
| **Instrument Sans Variable** | `instrument-sans-*.woff2` | SIL Open Font License 1.1 | pakiet `@fontsource-variable/instrument-sans` obecny lokalnie |
| **Hanken Grotesk Variable** | `hanken-grotesk-*.woff2` | SIL Open Font License 1.1 | pakiet `@fontsource-variable/hanken-grotesk` obecny lokalnie |
| **JetBrains Mono** (waga 400) | `jetbrains-mono-*.woff2` | Apache License 2.0 | pakiet `@fontsource/jetbrains-mono` obecny lokalnie |

## Czego świadomie tu nie ma

**Comic Sans MS, Segoe Script, Ink Free** i pozostałe kroje systemowe Windows — licencja Microsoftu
nie pozwala ich osadzać w rozpowszechnianych dokumentach. Mogą wystąpić wyłącznie jako nazwa
w `font-family` (wtedy działają u posiadacza systemu, a u innych podmieniają się na zastępnik),
nigdy jako `data:` URI.

## Jak trafiają do plików HTML

Pliki propozycji zawierają znaczniki `__F_<NAZWA>__` w regułach `@font-face`. Skrypt
`osadz-fonty.js` (katalog roboczy sesji) podmienia każdy znacznik na `data:font/woff2;base64,…`.
Dzięki temu źródło pozostaje czytelne, a wynik nie wykonuje ani jednego żądania sieciowego.
