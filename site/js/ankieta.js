// The survey link from the site carries the device it was opened on: kind, screen, window, browser,
// system, how long the page took to be ready and which mode it ran in (Łukasz, 2026-10-19: "na jakim
// telefonie, z jaką rozdzielczością ... ile u niego trwało ładowanie"). Tally reads them as hidden
// fields of the same names. Nothing personal: no identifiers, nothing stored.

const MALY_BOK = 600; // a touch screen whose narrow side is under this is a phone

/** Browser name and major version, e.g. "Safari 17", "Chrome iOS 124"; "inna" when unknown. */
export function przegladarka(ua, { brave = false } = {}) {
  const wersja = (re) => (ua.match(re) ?? [])[1];
  const proby = [
    ["Edge", /Edg(?:A|iOS)?\/(\d+)/], ["Opera", /OPR\/(\d+)/], ["Chrome iOS", /CriOS\/(\d+)/],
    ["Firefox iOS", /FxiOS\/(\d+)/], ["Firefox", /Firefox\/(\d+)/], ["Samsung", /SamsungBrowser\/(\d+)/],
    [brave ? "Brave" : "Chrome", /Chrome\/(\d+)/], ["Safari", /Version\/(\d+).*Safari/],
  ];
  for (const [nazwa, re] of proby) {
    const w = wersja(re);
    if (w) return `${nazwa} ${w}`;
  }
  return "inna";
}

/** Operating system, with the version for iOS and Android. */
export function system(ua) {
  const ios = ua.match(/(?:iPhone|iPad|iPod).*? OS (\d+)_(\d+)/);
  if (ios) return `iOS ${ios[1]}.${ios[2]}`;
  const android = ua.match(/Android (\d+(?:\.\d+)?)/);
  if (android) return `Android ${android[1]}`;
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "inny";
}

/** "telefon", "tablet" or "komputer". */
export function urzadzenie({ dotyk, szer, wys }) {
  if (!dotyk) return "komputer";
  return Math.min(szer, wys) < MALY_BOK ? "telefon" : "tablet";
}

/** The hidden fields, as strings. */
export function daneUrzadzenia({ ua, ekran, dpr, okno, dotyk, ladowanieMs, tryb, brave = false }) {
  const d = {
    urzadzenie: urzadzenie({ dotyk, szer: ekran[0], wys: ekran[1] }),
    ekran: `${Math.round(ekran[0])}x${Math.round(ekran[1])}@${Math.round(dpr * 100) / 100}`,
    okno: `${Math.round(okno[0])}x${Math.round(okno[1])}`,
    przegladarka: przegladarka(ua, { brave }),
    system: system(ua),
  };
  if (Number.isFinite(ladowanieMs) && ladowanieMs > 0) d.ladowanie_s = (ladowanieMs / 1000).toFixed(1);
  if (tryb) d.tryb = tryb;
  return d;
}

/** The survey address with the device fields added; its own fields (version, language) stay. */
export function adresAnkiety(adres, dane) {
  const u = new URL(adres);
  for (const [k, v] of Object.entries(dane)) u.searchParams.set(k, v);
  return u.toString();
}

/** Ready time of the page in ms: when its curtain went, else the load event. */
function czasLadowania(doc, win) {
  const z = Number(doc.documentElement.dataset.gotoweMs);
  if (z > 0) return z;
  const nav = win.performance?.getEntriesByType?.("navigation")?.[0];
  return nav?.loadEventEnd || undefined;
}

/**
 * Fills the survey links just before they open, so the numbers are the visitor's at that moment.
 * @param {() => string} tryb the page's mode: "3d" / "plakat" on the desk, "ruch" / "bez-ruchu" on the film
 */
export function zamontujAnkiete(tryb, doc = document, win = window) {
  const uzupelnij = (e) => {
    const a = e.target.closest?.("a[data-ankieta]");
    if (!a) return;
    const dane = daneUrzadzenia({
      ua: win.navigator.userAgent, ekran: [win.screen.width, win.screen.height], dpr: win.devicePixelRatio || 1,
      okno: [win.innerWidth, win.innerHeight], dotyk: win.matchMedia("(hover: none) and (pointer: coarse)").matches,
      ladowanieMs: czasLadowania(doc, win), tryb: tryb(), brave: Boolean(win.navigator.brave),
    });
    a.href = adresAnkiety(a.href, dane);
  };
  // pointerdown as well: a middle click or "open in new tab" reads the address before any click event
  doc.addEventListener("pointerdown", uzupelnij, true);
  doc.addEventListener("click", uzupelnij, true);
}
