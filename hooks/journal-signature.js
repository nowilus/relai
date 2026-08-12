#!/usr/bin/env node
'use strict';
// RelAI hook: journal-signature — PostToolUse, OSTRZEGA (D-41). Egzekwuje jeden
// format podpisu wpisu dziennika (D-63): "Autor: RelAI (<model>) + <git user.name>".
//
// Po co: czlon uzytkownika w podpisie jest jedynym sladem tego, kto przy pracy
// byl, i na nim opiera sie sygnal "cudzy projekt" (D-27, session-context).
// Pilotaz 1.0.0 pokazal, ze slabszy model potrafi podpisac wpis samym
// "RelAI (Haiku)" — specyfikacja opisywala format, ale nic go nie sprawdzalo.
//
// Dlaczego PostToolUse, a nie rytual zamkniecia sesji: ostrzezenie ma trafic do
// tury, w ktorej wpis powstal — wtedy poprawka kosztuje jedna edycje. Sygnal
// dawany na koniec sesji trafia w moment, w ktorym wpisu juz sie nie oglada,
// a sesja moze sie skonczyc bez rytualu.
//
// Nigdy nie blokuje i nigdy nie poprawia wpisu sam. Konwencja hook-guard: poza
// projektem RelAI wyjscie kodem 0 bez efektu. Komunikaty celowo bez polskich
// znakow diakrytycznych (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');

function isGuest(cwd) {
  try {
    const p = path.join(cwd, '.claude', 'relai.json');
    if (!fs.existsSync(p)) return false;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return !!j && j.mode === 'guest';
  } catch (_) {
    return true;
  }
}

function isRelaiProject(cwd) {
  try {
    if (!cwd || isGuest(cwd)) return false;
    const docsDir = path.join(cwd, 'docs');
    let entries = [];
    try { entries = fs.readdirSync(docsDir); } catch (_) { return false; }
    const candidates = [];
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      if (entries.includes(name)) candidates.push(name);
    }
    for (const f of entries) {
      if (/\.md$/i.test(f) && !candidates.includes(f)) candidates.push(f);
      if (candidates.length >= 40) break;
    }
    for (const f of candidates) {
      let head = '';
      try { head = fs.readFileSync(path.join(docsDir, f), 'utf8').slice(0, 4000); } catch (_) { continue; }
      if (/Wersja RelAI:|RelAI version:/i.test(head)) return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

// Czy edytowany plik to zywy dziennik projektu (nie archiwum, nie kopia).
function isJournalPath(cwd, filePath) {
  if (!filePath) return false;
  let rel;
  try { rel = path.relative(cwd, path.resolve(cwd, filePath)); } catch (_) { return false; }
  rel = rel.split(path.sep).join('/');
  if (rel.startsWith('..')) return false;
  return /^docs\/(DZIENNIK|JOURNAL)\.md$/i.test(rel);
}

function bezOgonkow(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[Łł]/g, 'l').toLowerCase().trim();
}

function gitUserName(cwd) {
  const pliki = [
    path.join(cwd, '.git', 'config'),
    path.join(os.homedir(), '.gitconfig'),
    path.join(os.homedir(), '.config', 'git', 'config'),
  ];
  for (const p of pliki) {
    let txt = '';
    try { txt = fs.readFileSync(p, 'utf8'); } catch (_) { continue; }
    const sekcja = txt.match(/\[user\][^[]*/i);
    if (!sekcja) continue;
    const m = sekcja[0].match(/^\s*name\s*=\s*(.+)$/mi);
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
}

// Ostatni wpis = ostatni naglowek "### " w pliku. Zwraca { tytul, linie }.
function ostatniWpis(txt) {
  const linie = txt.split('\n');
  let start = -1;
  for (let i = linie.length - 1; i >= 0; i--) {
    if (/^###\s+\S/.test(linie[i])) { start = i; break; }
  }
  if (start === -1) return null;
  return {
    tytul: linie[start].replace(/^###\s+/, '').trim(),
    // Podpis stoi tuz pod naglowkiem; szukamy w kilku pierwszych liniach wpisu,
    // zeby zniesc pusta linie i ewentualny cytat wprowadzajacy.
    glowa: linie.slice(start + 1, start + 8).join('\n'),
  };
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  const ti = input.tool_input || {};
  if (!isJournalPath(cwd, ti.file_path || ti.path || '')) return process.exit(0);
  if (!isRelaiProject(cwd)) return process.exit(0);

  const nazwa = gitUserName(cwd);
  if (!nazwa) return process.exit(0); // bez gita podpis bez czlonu jest poprawny

  let txt = '';
  try { txt = fs.readFileSync(path.resolve(cwd, ti.file_path || ti.path), 'utf8'); } catch (_) { return process.exit(0); }

  const wpis = ostatniWpis(txt);
  if (!wpis) return process.exit(0);

  const podpis = wpis.glowa.match(/^\s*(?:\*\*)?(?:Autor|Author)(?:\*\*)?\s*:\s*(.+)$/mi);
  const oczekiwany = 'Autor: RelAI (<model>) + ' + nazwa;

  if (!podpis) {
    console.log(JSON.stringify({
      systemMessage: '[RelAI journal-signature] Ostatni wpis dziennika ("' + wpis.tytul.slice(0, 80) +
        '") nie ma linii autora. Format obowiazkowy (D-63): "' + oczekiwany +
        '". Dopisz ja w tej samej turze.',
    }));
    return process.exit(0);
  }

  const tresc = podpis[1].trim();
  const ja = bezOgonkow(nazwa);
  const czesci = ja.split(/\s+/).filter((c) => c.length >= 3);
  const l = bezOgonkow(tresc);
  const maCzlon = l.indexOf(ja) !== -1 || (czesci.length > 0 && czesci.every((c) => l.indexOf(c) !== -1));

  if (maCzlon) return process.exit(0); // podpis poprawny — cisza

  console.log(JSON.stringify({
    systemMessage: '[RelAI journal-signature] Ostatni wpis dziennika ("' + wpis.tytul.slice(0, 80) +
      '") jest podpisany "' + tresc.slice(0, 80) + '" — bez czlonu uzytkownika, mimo ze git user.name to "' +
      nazwa + '". Format obowiazkowy (D-63): "' + oczekiwany + '". Popraw linie autora w tej samej turze; ' +
      'sam czlon "RelAI (<model>)" jest poprawny wylacznie tam, gdzie gita nie ma.',
  }));
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
