import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { sprawdzZasoby } from "./zasoby.mjs";

const KATALOG = fileURLToPath(new URL("../zasoby/", import.meta.url));

function kopia(zmien) {
  const tmp = mkdtempSync(join(tmpdir(), "relai-zasoby-"));
  cpSync(KATALOG, tmp, { recursive: true });
  zmien(tmp);
  return tmp;
}

function zBledami(zmien) {
  const tmp = kopia(zmien);
  try {
    return sprawdzZasoby(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

test("every file in site/zasoby has a CC0 entry with a matching hash, and the other way round", () => {
  assert.deepEqual(sprawdzZasoby(KATALOG), []);
});

test("the registry covers the real set of assets (not an empty folder)", () => {
  const rejestr = JSON.parse(readFileSync(join(KATALOG, "ZRODLA.json"), "utf8"));
  assert.ok(rejestr.pliki.length >= 40);
});

test("a file without a registry entry fails the check", () => {
  const bledy = zBledami((d) => writeFileSync(join(d, "tekstury", "podrzucony.jpg"), "x"));
  assert.ok(bledy.some((b) => b.includes("podrzucony.jpg: plik bez wpisu")), bledy.join("\n"));
});

test("a registry entry without a file fails the check", () => {
  const bledy = zBledami((d) => rmSync(join(d, "tekstury", "blat-kolor.jpg")));
  assert.ok(bledy.some((b) => b.includes("blat-kolor.jpg: wpis bez pliku")), bledy.join("\n"));
});

test("a changed file fails the hash check", () => {
  const bledy = zBledami((d) => writeFileSync(join(d, "tekstury", "blat-kolor.jpg"), "zmienione"));
  assert.ok(bledy.some((b) => b.includes("blat-kolor.jpg: suma sha256")), bledy.join("\n"));
});

test("a licence other than CC0 fails the check", () => {
  const bledy = zBledami((d) => {
    const p = join(d, "ZRODLA.json");
    const rejestr = JSON.parse(readFileSync(p, "utf8"));
    rejestr.pliki[0].licencja = "CC-BY";
    writeFileSync(p, JSON.stringify(rejestr));
  });
  assert.ok(bledy.some((b) => b.includes("licencja CC-BY")), bledy.join("\n"));
});

test("a source address outside the two libraries fails the check", () => {
  const bledy = zBledami((d) => {
    const p = join(d, "ZRODLA.json");
    const rejestr = JSON.parse(readFileSync(p, "utf8"));
    rejestr.pliki[0].url = "https://example.com/a/x";
    writeFileSync(p, JSON.stringify(rejestr));
  });
  assert.ok(bledy.some((b) => b.includes("url spoza dozwolonych bibliotek")), bledy.join("\n"));
});
