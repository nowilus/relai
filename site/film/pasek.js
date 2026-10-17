// The film's top bar: at the very top it floats over the paper with no ground of its own; from the
// first scrolled pixels it gets the desk's paper behind it, so copy never runs under the mark. Its "Install" button steps aside while the install act itself is on screen.

/**
 * Up to this many pixels scrolled the bar stands without a ground. The hero's logo note sits right
 * under the bar, so the paper has to arrive with the first wheel notch, not a third of a screen later.
 */
export const PROG_GORY = 12;

/** Whether the page is still at its very top. @param {number} y scrollY in px */
export function naGorze(y) {
  return y < PROG_GORY;
}

/**
 * @param {Document} doc
 * @param {Window} win
 * @returns {() => void} stop function
 */
export function zamontujPasek(doc = document, win = window) {
  const root = doc.documentElement;
  const odswiez = () => root.classList.toggle("na-gorze", naGorze(win.scrollY));
  odswiez();
  win.addEventListener("scroll", odswiez, { passive: true });
  win.addEventListener("resize", odswiez, { passive: true });

  const instalacja = doc.querySelector(".akt.instalacja");
  let obserwator = null;
  if (instalacja && "IntersectionObserver" in win) {
    obserwator = new win.IntersectionObserver(
      ([w]) => root.classList.toggle("przy-instalacji", w.isIntersecting),
      { threshold: 0.35 },
    );
    obserwator.observe(instalacja);
  }
  return () => {
    win.removeEventListener("scroll", odswiez);
    win.removeEventListener("resize", odswiez);
    obserwator?.disconnect();
  };
}
