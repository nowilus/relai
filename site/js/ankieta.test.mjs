import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { przegladarka, system, urzadzenie, daneUrzadzenia, adresAnkiety } from "./ankieta.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const UA = {
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.71 Mobile/15E148 Safari/604.1",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.51",
  firefoxMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0",
  chromeWin: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  brave: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

describe("the survey link carries the device, so answers can be read per device", () => {
  test("browser name and major version from the user agent", () => {
    assert.equal(przegladarka(UA.iphone), "Safari 17");
    assert.equal(przegladarka(UA.iphoneChrome), "Chrome iOS 124");
    assert.equal(przegladarka(UA.android), "Chrome 124");
    assert.equal(przegladarka(UA.edge), "Edge 124");
    assert.equal(przegladarka(UA.firefoxMac), "Firefox 125");
    assert.equal(przegladarka(UA.chromeWin), "Chrome 124");
    assert.equal(przegladarka(""), "inna");
  });

  test("Brave says so only through navigator.brave, not the user agent", () => {
    assert.equal(przegladarka(UA.brave, { brave: true }), "Brave 124");
  });

  test("operating system with its version where the user agent gives one", () => {
    assert.equal(system(UA.iphone), "iOS 17.4");
    assert.equal(system(UA.android), "Android 14");
    assert.equal(system(UA.edge), "Windows");
    assert.equal(system(UA.firefoxMac), "macOS");
    assert.equal(system("Mozilla/5.0 (X11; Linux x86_64)"), "Linux");
  });

  test("a phone is a touch screen with a narrow side under 600 px, a bigger touch screen a tablet", () => {
    assert.equal(urzadzenie({ dotyk: true, szer: 390, wys: 844 }), "telefon");
    assert.equal(urzadzenie({ dotyk: true, szer: 1024, wys: 1366 }), "tablet");
    assert.equal(urzadzenie({ dotyk: false, szer: 1920, wys: 1080 }), "komputer");
  });

  test("the fields are the form's hidden field names, numbers rounded", () => {
    const d = daneUrzadzenia({ ua: UA.iphone, ekran: [390, 844], dpr: 3, okno: [390, 664.4], dotyk: true, ladowanieMs: 4321, tryb: "3d" });
    assert.deepEqual(d, {
      urzadzenie: "telefon", ekran: "390x844@3", okno: "390x664", przegladarka: "Safari 17", system: "iOS 17.4", ladowanie_s: "4.3", tryb: "3d",
    });
  });

  test("the link keeps its own fields and adds the device ones", () => {
    const a = adresAnkiety("https://tally.so/r/BE4lQ5?wersja=biurko&jezyk=pl", { urzadzenie: "telefon", ekran: "390x844@3" });
    const u = new URL(a);
    assert.equal(u.searchParams.get("wersja"), "biurko");
    assert.equal(u.searchParams.get("urzadzenie"), "telefon");
    assert.equal(u.searchParams.get("ekran"), "390x844@3");
  });

  test("both versions mount it, and both curtains note when the page was ready", () => {
    for (const plik of ["../film/start.js", "../biurko/start.js"]) {
      assert.match(readFileSync(join(HERE, plik), "utf8"), /zamontujAnkiete\(/, plik);
    }
    for (const plik of ["../film/zaslona.js", "../biurko/zaslona.js"]) {
      assert.match(readFileSync(join(HERE, plik), "utf8"), /dataset\.gotoweMs/, plik);
    }
  });
});
