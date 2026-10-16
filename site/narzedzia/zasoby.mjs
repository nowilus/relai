// Checks that every file in an asset folder has a CC0 entry with a matching hash, and the other way round.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

const POMIJANE = new Set(["ZRODLA.json", "LICENCJE.md"]);
const DOZWOLONE_HOSTY = new Set(["polyhaven.com", "ambientcg.com", "docs.ambientcg.com"]);
const POLA = ["plik", "zasob", "typ", "zrodlo", "url", "licencja", "licencjaUrl", "autor", "dataPobrania", "przerobiono", "bajty", "sha256"];

function plikiWKatalogu(katalog) {
  const wynik = [];
  for (const nazwa of readdirSync(katalog)) {
    const p = join(katalog, nazwa);
    if (statSync(p).isDirectory()) wynik.push(...plikiWKatalogu(p));
    else wynik.push(p);
  }
  return wynik;
}

function hostAdresu(adres) {
  try {
    const u = new URL(adres);
    return u.protocol === "https:" ? u.hostname : null;
  } catch {
    return null;
  }
}

/** Returns a list of problems (empty when the folder and `ZRODLA.json` agree). */
export function sprawdzZasoby(katalog) {
  const bledy = [];
  const rejestr = JSON.parse(readFileSync(join(katalog, "ZRODLA.json"), "utf8"));
  const wpisy = rejestr.pliki ?? [];
  const naDysku = plikiWKatalogu(katalog)
    .map((p) => relative(katalog, p).split(sep).join("/"))
    .filter((rel) => !POMIJANE.has(rel));
  const wRejestrze = new Map();
  for (const wpis of wpisy) {
    if (wRejestrze.has(wpis.plik)) bledy.push(`${wpis.plik}: dwa wpisy w rejestrze`);
    wRejestrze.set(wpis.plik, wpis);
    for (const pole of POLA) if (wpis[pole] === undefined || wpis[pole] === "") bledy.push(`${wpis.plik}: brak pola ${pole}`);
    if (wpis.licencja !== "CC0") bledy.push(`${wpis.plik}: licencja ${wpis.licencja}, oczekiwano CC0`);
    for (const pole of ["url", "licencjaUrl"]) {
      const host = hostAdresu(wpis[pole]);
      if (!host || !DOZWOLONE_HOSTY.has(host)) bledy.push(`${wpis.plik}: ${pole} spoza dozwolonych bibliotek`);
    }
  }
  for (const rel of naDysku) {
    const wpis = wRejestrze.get(rel);
    if (!wpis) {
      bledy.push(`${rel}: plik bez wpisu w ZRODLA.json`);
      continue;
    }
    const bajty = readFileSync(join(katalog, rel));
    const suma = createHash("sha256").update(bajty).digest("hex");
    if (suma !== wpis.sha256) bledy.push(`${rel}: suma sha256 nie zgadza się z rejestrem`);
    if (bajty.length !== wpis.bajty) bledy.push(`${rel}: rozmiar ${bajty.length} B, w rejestrze ${wpis.bajty} B`);
  }
  const zbior = new Set(naDysku);
  for (const plik of wRejestrze.keys()) if (!zbior.has(plik)) bledy.push(`${plik}: wpis bez pliku`);
  return bledy;
}
