// The loading card of the film: shown by a line in <head> (class "ladowanie" on <html>, with its
// own 4 s limit), drawn on by real signals (fonts, engine, first layout) and taken off in one
// transition. It never stays: an error takes it off at once, and its own limit takes it off anyway.

export const KROKI = 3;
export const KLASA = "ladowanie";
export const LIMIT_MS = 4000;

/**
 * @param {{ classList: DOMTokenList, style: CSSStyleDeclaration }} root  usually document.documentElement
 * @param {{ limitMs?: number, czas?: typeof setTimeout, anuluj?: typeof clearTimeout }} [opcje]
 */
export function utworzZaslone(root, { limitMs = LIMIT_MS, czas = setTimeout, anuluj = clearTimeout } = {}) {
  let stan = root.classList.contains(KLASA) ? "laduje" : "zdjeta";
  let zrobione = 0;
  const zdejmij = (koniec) => {
    if (stan !== "laduje") return stan;
    anuluj(limit);
    root.classList.remove(KLASA);
    stan = koniec;
    return stan;
  };
  const limit = stan === "laduje" ? czas(() => zdejmij("limit"), limitMs) : null;

  return {
    /** One real step done (1..KROKI): the underline grows from the left. */
    krok(n) {
      zrobione = Math.max(zrobione, Math.min(KROKI, Math.trunc(n)));
      root.style.setProperty("--krok", String(zrobione));
      return zrobione;
    },
    /** The opening shot is laid out: the card goes. */
    gotowe() {
      this.krok(KROKI);
      return zdejmij("gotowe");
    },
    /** The engine failed: the content is shown at once, without the card. */
    blad() {
      return zdejmij("blad");
    },
    get stan() {
      return stan;
    },
  };
}
