@echo off
REM RelAI / adapter Cursor: opakowanie hooka skanu sekretow dla Windows.
REM
REM Po co opakowanie, skoro hook jest skryptem Node? Bo zmierzone zachowanie Cursora
REM (2026-08-12) jest takie: polecenie hooka, ktorego NIE DA SIE uruchomic (brak
REM interpretera w PATH), jest ignorowane po cichu i zapis przechodzi. Guardrail znikalby
REM bez slowa. Hook, ktory sie uruchomil i zakonczyl kodem 2, blokuje narzedzie
REM z komunikatem — i tego wlasnie uzywamy.
REM
REM Interpreter mozna wskazac zmienna RELAI_NODE (domyslnie "node" z PATH).
REM Kod wyjscia: 2 = brak Node.js (zapis zablokowany z komunikatem), reszta = kod hooka.

setlocal
if "%RELAI_NODE%"=="" set RELAI_NODE=node

where %RELAI_NODE% >nul 2>nul
if errorlevel 1 (
  echo RelAI secret-scanner: nie znalazlem interpretera "%RELAI_NODE%" w PATH, wiec skan sekretow 1>&2
  echo nie mogl sie wykonac. Zapis zablokowany swiadomie: brak guardraila nie moze wygladac 1>&2
  echo jak jego zgoda. Zainstaluj Node.js 14+ albo wskaz interpreter zmienna RELAI_NODE. 1>&2
  exit /b 2
)

%RELAI_NODE% "%~dp0secret-scanner.js"
exit /b %errorlevel%
