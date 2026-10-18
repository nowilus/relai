// Language choice: EN at the site root, PL under pl/. A saved manual choice always wins.

export const KLUCZ = "relai-jezyk";

const JEZYKI = ["pl", "en"];

const poprawny = (j) => (JEZYKI.includes(j) ? j : null);

/** Returns the language to redirect to, or null to stay on the current page. */
export function docelowyJezyk({ aktualny, zapisany, preferowane }) {
  const wybor = poprawny(zapisany);
  if (wybor) return wybor === aktualny ? null : wybor;
  if (aktualny !== "en") return null;
  const pierwszy = Array.isArray(preferowane) ? preferowane[0] : undefined;
  return typeof pierwszy === "string" && /^pl/i.test(pierwszy) ? "pl" : null;
}

function odczytajZapisany(win) {
  try {
    return win.localStorage.getItem(KLUCZ);
  } catch {
    return null;
  }
}

function zapamietaj(win, jezyk) {
  try {
    win.localStorage.setItem(KLUCZ, jezyk);
  } catch {
    // storage blocked: the choice is simply not remembered
  }
}

/** Browser entry point; never throws. */
export function zamontujJezyk(doc = document, win = window) {
  try {
    const preferowane = Array.from(win.navigator?.languages ?? []);
    const cel = docelowyJezyk({
      aktualny: doc.documentElement.lang,
      zapisany: odczytajZapisany(win),
      preferowane,
    });
    if (cel) {
      // The relative language link first: hreflang is absolute (E8), so it would leave a local preview.
      const link = doc.querySelector(`a[data-jezyk="${cel}"]`);
      const alt = doc.querySelector(`link[rel="alternate"][hreflang="${cel}"]`);
      const href = link?.href || alt?.href;
      if (href) {
        win.location.replace(href);
        return;
      }
    }
    for (const a of doc.querySelectorAll("a[data-jezyk]")) {
      a.addEventListener("click", () => {
        const j = poprawny(a.getAttribute("data-jezyk"));
        if (j) zapamietaj(win, j);
      });
    }
  } catch {
    // language switching is optional; stay on the current page
  }
}
