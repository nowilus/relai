# Synchronizacja z upstreamem — security-audit (Cloudflare)

Kopia w tym katalogu zmienia się wyłącznie tą procedurą: jako świadomy krok z przeglądem różnic,
nigdy automatycznie (plan BEZPIECZENSTWO, ryzyko 2). Krok wydania „porównaj commit z upstreamem”
odsyła tutaj.

1. **Czy jest co synchronizować** — `git ls-remote https://github.com/cloudflare/security-audit-skill HEAD`
   wobec `commit:` w `RELAI-SOURCE.txt`. Ten sam commit → koniec, do wpisu w dzienniku „bez zmian”.
2. **Klon poza projektem** — `git clone -c core.autocrlf=false` do katalogu tymczasowego z nazwą
   zaczynającą się od slugu projektu (`relai-…`); bez `core.autocrlf=false` Windows dostaje CRLF
   i sumy nie zgodzą się z blobami.
3. **Różnice** — `git diff <stary commit> <nowy commit> -- skills/security-audit LICENSE` w klonie:
   lista plików dodanych, usuniętych i zmienionych.
4. **Przegląd** wg `core/templates/SPEC_PRZYJECIE_KODU.md` — wszystkie siedem punktów na nowym
   commicie, ze szczególną uwagą na pliki z różnic (sieć, zapisy, procesy, licencja). Werdykt
   `ODRZUCONY` → kopia zostaje na starym commicie, powód do dziennika.
5. **Kopia** — po werdykcie `PRZYJĘTY` albo `PRZYJĘTY Z WARUNKAMI` i po „tak” człowieka: zawartość
   `skills/security-audit/` i `LICENSE` z klonu do tego katalogu; pliki z przedrostkiem `RELAI-` zostają.
   Plik usunięty w upstreamie znika też tutaj. Dowód: sumy SHA-256 każdego pliku wobec klonu — zero
   różnic, ta sama lista plików (bez `RELAI-*`).
6. **Zapis źródła** — `commit:`, `commit-date:` i `copied:` w `RELAI-SOURCE.txt`; lista plików
   i tekst licencji w `RELAI-NOTICE.md`, gdy się zmieniły.
7. **Walidator** — `node core/tools/validate-adapters.js` kończy się „spojne”, linia noty Cloudflare
   wymienia wszystkie pliki kopii.
8. **Wpis w `docs/DZIENNIK.md`** — stary i nowy commit, lista różnic, werdykt przeglądu
   (`Werdykt przeglądu: …`), wynik walidatora, wpis w `docs/ARTEFAKTY.md`.

Kodu Cloudflare nie poprawia się w kopii. Rozjazd z regułami RelAI rozstrzyga wyjątek w walidatorze
z powodem albo obejście w komendzie `/relai-security`.
