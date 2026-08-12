#!/bin/sh
# RelAI / adapter Cursor: opakowanie hooka skanu sekretow dla macOS i Linuksa.
#
# Po co opakowanie, skoro hook jest skryptem Node? Bo zmierzone zachowanie Cursora
# (2026-08-12, Windows) jest takie: polecenie hooka, ktorego NIE DA SIE uruchomic (brak
# interpretera w PATH), jest ignorowane po cichu i zapis przechodzi. Guardrail znikalby
# bez slowa. Hook, ktory sie uruchomil i zakonczyl kodem 2, blokuje narzedzie
# z komunikatem — i tego wlasnie uzywamy.
#
# Interpreter mozna wskazac zmienna RELAI_NODE (domyslnie "node" z PATH).
# Kod wyjscia: 2 = brak Node.js (zapis zablokowany z komunikatem), reszta = kod hooka.

RELAI_NODE="${RELAI_NODE:-node}"
KATALOG="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

if ! command -v "$RELAI_NODE" >/dev/null 2>&1; then
  echo "RelAI secret-scanner: nie znalazlem interpretera \"$RELAI_NODE\" w PATH, wiec skan sekretow" >&2
  echo "nie mogl sie wykonac. Zapis zablokowany swiadomie: brak guardraila nie moze wygladac" >&2
  echo "jak jego zgoda. Zainstaluj Node.js 14+ albo wskaz interpreter zmienna RELAI_NODE." >&2
  exit 2
fi

exec "$RELAI_NODE" "$KATALOG/secret-scanner.js"
