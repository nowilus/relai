// The four drawers over the desk: documents, the plan folder, the laptop and the card box. A map link or
// a click on the object opens one: the object rises toward the camera, then its dialog shows. Escape,
// the close button or the backdrop close it; focus goes back to what opened it, the scroll stays put.
// In the document flow (no WebGL) the same dialogs are plain sections and this module is not mounted.

export const OPOZNIENIE_MS = 260; // the object rises first, then the drawer opens over it

// a click on these is the page's own, never a click on the desk behind
const NIE_SCENA = "a, button, input, label, select, textarea, dialog, .karta, [data-ekran]";

/** Tab index after a key in a tab list of `n`; null for a key the tabs do not use. Wraps around. */
export function nastepnaZakladka(i, n, klawisz) {
  if (klawisz === "ArrowRight") return (i + 1) % n;
  if (klawisz === "ArrowLeft") return (i - 1 + n) % n;
  if (klawisz === "Home") return 0;
  if (klawisz === "End") return n - 1;
  return null;
}

/** The laptop drawer: the bars become tabs (in the flow all three stay visible, one under another). */
function zamontujZakladki(lista, korzen, nasluch) {
  if (!lista) return;
  const przyciski = [...lista.querySelectorAll("[data-zakladka]")];
  const panele = przyciski.map((p) => korzen.querySelector(`[data-panel="${p.dataset.zakladka}"]`));
  const wybierz = (nr, skup = false) => {
    przyciski.forEach((p, i) => {
      const tak = i === nr;
      p.setAttribute("aria-selected", String(tak));
      p.setAttribute("tabindex", tak ? "0" : "-1");
      panele[i].hidden = !tak;
    });
    if (skup) przyciski[nr].focus();
  };
  panele.forEach((panel, i) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", przyciski[i].id);
  });
  przyciski.forEach((p, i) => p.addEventListener("click", () => wybierz(i), nasluch));
  lista.addEventListener("keydown", (e) => {
    const nr = nastepnaZakladka(przyciski.indexOf(e.target), przyciski.length, e.key);
    if (nr === null) return;
    e.preventDefault();
    wybierz(nr, true);
  }, nasluch);
  lista.removeAttribute("hidden");
  wybierz(0);
}

/**
 * @param {{ dokument?: Document, okno?: Window, scena: { unies(n: string|null): void, trafienie(x: number, y: number): string|null },
 *   ograniczRuch?: boolean }} opcje
 */
export function zamontujSzuflady({ dokument = document, okno = window, scena, ograniczRuch = false }) {
  const dialogi = new Map([...dokument.querySelectorAll("dialog[data-szuflada]")].map((d) => [d.dataset.szuflada, d]));
  const korzen = dokument.documentElement;
  const sygnal = new AbortController();
  const nasluch = { signal: sygnal.signal };
  let otwarta = null;
  let powrot = null;
  let y = 0;
  let czeka = null;

  function zwolnij() {
    if (czeka !== null) okno.clearTimeout(czeka);
    czeka = null;
    otwarta = null;
    korzen.classList.remove("szuflada-otwarta");
    scena.unies(null);
  }

  function otworz(nazwa, otwieracz = dokument.activeElement) {
    const d = dialogi.get(nazwa);
    if (!d) return false;
    if (otwarta?.open) otwarta.close();
    else if (otwarta) zwolnij();
    otwarta = d;
    powrot = otwieracz;
    y = okno.scrollY;
    korzen.classList.add("szuflada-otwarta");
    scena.unies(nazwa);
    const pokaz = () => {
      czeka = null;
      if (otwarta !== d || d.open) return;
      d.showModal();
      // the browser would focus the first scrollable box (the long card box); the close button is the start
      d.querySelector("[data-zamknij] button")?.focus();
    };
    if (ograniczRuch) pokaz();
    else czeka = okno.setTimeout(pokaz, OPOZNIENIE_MS);
    return true;
  }

  for (const d of dialogi.values()) {
    d.querySelector("[data-zamknij]")?.removeAttribute("hidden");
    d.addEventListener("close", () => {
      if (otwarta !== d) return;
      zwolnij();
      if (okno.scrollY !== y) okno.scrollTo({ top: y, behavior: "auto" });
      powrot?.focus?.({ preventScroll: true });
      powrot = null;
    }, nasluch);
    // the dialog element itself is only hit around its card: that is the backdrop
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    }, nasluch);
  }
  zamontujZakladki(dialogi.get("laptop")?.querySelector("[data-zakladki]"), dialogi.get("laptop"), nasluch);

  dokument.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[data-szuflada-cel]");
    if (a) {
      e.preventDefault();
      otworz(a.dataset.szufladaCel, a);
      return;
    }
    if (e.defaultPrevented || otwarta || e.target.closest?.(NIE_SCENA)) return;
    const nazwa = scena.trafienie(e.clientX, e.clientY);
    if (nazwa) otworz(nazwa, dokument.activeElement);
  }, nasluch);

  // Escape while the object is still rising: nothing to close yet, so the opening is called off
  dokument.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && otwarta && !otwarta.open) zwolnij();
  }, nasluch);

  // a pointer over a drawer object shows it can be clicked; one check per frame at most
  let ruch = null;
  dokument.addEventListener("pointermove", (e) => {
    if (ruch) return;
    ruch = { x: e.clientX, y: e.clientY, cel: e.target };
    okno.requestAnimationFrame(() => {
      const { x, y: py, cel } = ruch;
      ruch = null;
      const nad = !otwarta && !cel?.closest?.(NIE_SCENA) && Boolean(scena.trafienie(x, py));
      korzen.classList.toggle("nad-szuflada", nad);
    });
  }, nasluch);

  return {
    otworz,
    /** The open (or opening) drawer's name, for verification. */
    otwarta: () => otwarta?.dataset.szuflada ?? null,
    odmontuj() {
      if (otwarta?.open) otwarta.close();
      zwolnij();
      korzen.classList.remove("nad-szuflada");
      sygnal.abort();
    },
  };
}
