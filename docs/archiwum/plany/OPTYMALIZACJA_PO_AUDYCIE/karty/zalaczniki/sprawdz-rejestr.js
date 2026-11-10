// K-E6: dowod, ze skrocenie nie zmienilo niczego poza komorka "Co sie zmienilo".
// Uzycie: node sprawdz-rejestr.js <przed> <po>
'use strict';
const fs = require('fs');
const [, , przedPlik, poPlik] = process.argv;
const lf = (s) => s.replace(/\r\n/g, '\n');
const przed = lf(fs.readFileSync(przedPlik, 'utf8')).split('\n');
const po = lf(fs.readFileSync(poPlik, 'utf8')).split('\n');

// Te same reguly co wierszeRejestru() w core/tools/release-checks.js.
function klucze(linie) {
  const out = [];
  for (const l of linie) {
    if (!l.startsWith('|') || /^\|\s*-/.test(l)) continue;
    const kol = l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    if (kol.length < 4 || kol[0] === 'Artefakt') continue;
    const sciezki = (kol[1].match(/`([^`]+)`/g) || []).map((s) => s.slice(1, -1)).filter((s) => /\//.test(s));
    for (const plik of sciezki) out.push(plik + '|' + kol[2] + '|' + kol[3]);
  }
  return out;
}

let bledy = 0;
const blad = (t) => { bledy += 1; process.stdout.write('BLAD: ' + t + '\n'); };
if (przed.length !== po.length) blad('liczba linii ' + przed.length + ' -> ' + po.length);
const kPrzed = klucze(przed);
const kPo = klucze(po);
if (kPrzed.join('\n') !== kPo.join('\n')) blad('klucze plik|wersja|data roznia sie');

let zmienione = 0;
for (let i = 0; i < Math.min(przed.length, po.length); i += 1) {
  if (przed[i] === po[i]) continue;
  zmienione += 1;
  const a = przed[i].split(/(?<!\\)\|/);
  const b = po[i].split(/(?<!\\)\|/);
  if (a.length !== b.length) { blad('linia ' + (i + 1) + ': liczba komorek ' + a.length + ' -> ' + b.length); continue; }
  const rozne = a.map((c, k) => (c === b[k] ? -1 : k)).filter((k) => k >= 0);
  if (rozne.length !== 1) { blad('linia ' + (i + 1) + ': zmienione komorki ' + rozne.join(',')); continue; }
  const stara = a[rozne[0]].trim();
  const nowa = b[rozne[0]].trim();
  const bezOdsylacza = nowa.replace(/ Starsze wersje: \[[^\]]+\]\([^)]+\)\.$/, '');
  if (bezOdsylacza === nowa) blad('linia ' + (i + 1) + ': brak odsylacza na koncu komorki');
  if (!stara.startsWith(bezOdsylacza)) blad('linia ' + (i + 1) + ': nowa tresc nie jest poczatkiem starej');
}
process.stdout.write('kluczy: ' + kPrzed.length + ', linii zmienionych: ' + zmienione + ', bledow: ' + bledy + '\n');
process.exit(bledy ? 1 : 0);
