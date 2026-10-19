// The header map on the page without the scene (BIURKO_PLAKAT): the stop being read and how far the
// axis fill reaches, from where the stops start on the page. In 3D the camera drives the map
// (warstwa.js); here the scroll does. Pure part first, then the small DOM part.

/** Share of the window's height where the reading line sits: a stop counts once its top passes it. */
export const LINIA_CZYTANIA = 0.45;

/**
 * The stop at the reading line and the axis fill (0..1, from the first dot to the last), interpolated
 * between the stops' tops the way the 3D map follows the camera between holds.
 * @param {number[]} gory each stop's top edge on the page, in order, px
 * @param {number} linia the reading line on the page, px (Infinity at the very bottom)
 */
export function stanMapy(gory, linia) {
  const ostatni = gory.length - 1;
  if (ostatni < 1 || !(linia > gory[0])) return { przystanek: 0, ulamek: 0 };
  for (let nr = 1; nr <= ostatni; nr++) {
    if (linia < gory[nr]) {
      const czesc = (linia - gory[nr - 1]) / Math.max(1, gory[nr] - gory[nr - 1]);
      return { przystanek: nr - 1, ulamek: (nr - 1 + czesc) / ostatni };
    }
  }
  return { przystanek: ostatni, ulamek: 1 };
}

/** Keeps the map's current stop, passed stops and axis fill in step with the scroll; returns unmount. */
export function zamontujMapePrzeplywu(dokument = document, okno = window) {
  const przystanki = [...dokument.querySelectorAll("section[data-przystanek]")]
    .sort((a, b) => Number(a.dataset.przystanek) - Number(b.dataset.przystanek));
  const linki = [...dokument.querySelectorAll(".mapa [data-cel]")];
  const os = dokument.querySelector(".mapa__lista");
  if (przystanki.length < 2 || !os) return () => {};
  let czeka = 0;

  const odswiez = () => {
    czeka = 0;
    const koniec = okno.scrollY + okno.innerHeight >= dokument.documentElement.scrollHeight - 2;
    const linia = koniec ? Infinity : okno.scrollY + okno.innerHeight * LINIA_CZYTANIA;
    const gory = przystanki.map((p) => p.getBoundingClientRect().top + okno.scrollY);
    const { przystanek, ulamek } = stanMapy(gory, linia);
    for (const a of linki) {
      const nr = Number(a.dataset.cel);
      if (nr === przystanek) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
      a.classList.toggle("byl", nr < przystanek);
    }
    os.style.setProperty("--postep-osi", String(Math.round(ulamek * 1000) / 1000));
  };
  const zaplanuj = () => { if (!czeka) czeka = okno.requestAnimationFrame(odswiez); };
  const sygnal = new AbortController();
  okno.addEventListener("scroll", zaplanuj, { passive: true, signal: sygnal.signal });
  okno.addEventListener("resize", zaplanuj, { signal: sygnal.signal });
  odswiez();
  return () => {
    sygnal.abort();
    if (czeka) okno.cancelAnimationFrame(czeka);
  };
}
