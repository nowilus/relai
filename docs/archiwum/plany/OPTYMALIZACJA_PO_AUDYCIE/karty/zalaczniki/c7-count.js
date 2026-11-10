// Prototyp K-C7: ile sledzonych artefaktow nie ma wpisu po pelnej sciezce (kolumna "Plik").
// Uzycie (z korzenia repozytorium): node docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/zalaczniki/c7-count.js
// Niczego nie zapisuje — wypisuje liczby i grupy na stdout.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = process.cwd();
const out = (s) => process.stdout.write(s + '\n');

const POZA = /^(\.\.|docs\/|\.claude\/|\.git\/|node_modules\/|dist\/|build\/|out\/|coverage\/|vendor\/|target\/|\.next\/|\.venv\/)/i;
function jestArtefaktem(rel) {
  const nazwa = rel.split('/').pop() || '';
  if (/^(CLAUDE|README|LICENSE|CHANGELOG|CONTRIBUTING)\.md$/i.test(nazwa)) return false;
  return /\.(md|mdc|txt|prompt|tmpl|j2)$/i.test(rel);
}

// Sciezki z kolumny "Plik": naglowek rozpoznany po nazwie, komorki dzielone po "|" bez "\|".
function sciezkiRejestru(txt) {
  const zbior = new Set();
  let kPlik = -1;
  for (const row of String(txt).replace(/\r\n/g, '\n').split('\n')) {
    if (!row.trim().startsWith('|')) { kPlik = -1; continue; }
    const cells = row.split(/(?<!\\)\|/).map((c) => c.trim());
    const iPlik = cells.findIndex((c) => /^(Plik|File)$/i.test(c));
    if (iPlik > 0) { kPlik = iPlik; continue; }
    if (kPlik < 0) continue;
    for (const m of (cells[kPlik] || '').match(/`([^`]+)`/g) || []) {
      const s = m.slice(1, -1);
      if (s.includes('/')) zbior.add(s);
    }
  }
  return zbior;
}
function globNaRegex(g) {
  const esc = g.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
  return new RegExp('^' + esc + '$');
}

const rejestrTxt = fs.readFileSync(path.join(REPO, 'docs/ARTEFAKTY.md'), 'utf8');
const sciezki = sciezkiRejestru(rejestrTxt);
const wzorce = [...sciezki].filter((s) => s.includes('*')).map(globNaRegex);
out('Sciezek w kolumnie Plik: ' + sciezki.size + ' (z gwiazdka: ' + wzorce.length + ')');
out('Wpisy z gwiazdka: ' + [...sciezki].filter((s) => s.includes('*')).join(' , '));

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter(Boolean);
const artefakty = tracked.filter((f) => !POZA.test(f) && jestArtefaktem(f));
const poSciezce = (f) => sciezki.has(f) || wzorce.some((re) => re.test(f));
const poNazwie = (f) => rejestrTxt.indexOf(f) !== -1 || rejestrTxt.indexOf(f.split('/').pop()) !== -1;

const stare = artefakty.filter((f) => !poNazwie(f));
const nowe = artefakty.filter((f) => !poSciezce(f));
out('Artefaktow sledzonych (regula hooka): ' + artefakty.length);
out('Zglaszane DZIS (regula po nazwie): ' + stare.length);
out('Zglaszane PO poprawce (pelna sciezka w kolumnie Plik): ' + nowe.length);
const grupy = {};
for (const f of nowe) {
  const k = f.split('/').slice(0, f.startsWith('adapters/') ? 3 : 2).join('/');
  (grupy[k] = grupy[k] || []).push(f);
}
for (const [k, v] of Object.entries(grupy).sort((a, b) => b[1].length - a[1].length)) out('  ' + String(v.length).padStart(3) + '  ' + k + '   np. ' + v.slice(0, 2).join(' , '));
// kontrola pozytywna: znany wpisany artefakt musi byc "po sciezce"
out('Kontrola pozytywna (relai-core/SKILL.md wpisany): ' + poSciezce('adapters/claude-code/skills/relai-core/SKILL.md'));
out('Kontrola negatywna (codex relai-adopt/SKILL.md niewpisany): ' + !poSciezce('adapters/codex/skills/relai-adopt/SKILL.md'));
if (process.argv.includes('--lista')) out(nowe.join('\n'));
