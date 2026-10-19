// The desk's loading curtain (Łukasz, E6: "light, with a wow, interactive, until the page is loaded").
// A line in <head> puts the class on <html> before the first paint (not with reduced motion, and with its
// own limit), so the curtain is there from the first frame. Real loaded files draw the pencil line and
// pin the notes from the Amnesia stop, one per seventh; the notes can be grabbed and thrown while the
// desk loads. When the hero is ready the notes gather into one pile and the curtain lifts onto the desk.

export const KLASA = "laduje";
export const KLASA_KONCA = "laduje-koniec";
export const ZBIERANIE_MS = 700; // the notes fly into a pile, then the curtain fades
export const ZNIKANIE_MS = 650;
const NOTKI = 7;

/** How many notes are pinned at progress p (0..1): one per seventh, rounded up. */
export function ileNotek(p, n = NOTKI) {
  return Math.min(n, Math.max(0, Math.ceil(p * n - 1e-9)));
}

/** Progress from the loader's counts; the expected total is a floor, so early counts do not jump ahead. */
export function postepZPlikow(gotowe, wszystkie, oczekiwane) {
  const mianownik = Math.max(wszystkie, oczekiwane, 1);
  return Math.min(1, gotowe / mianownik);
}

/** The logo zone in the middle that no note may cover: logo, pencil line, caption, percent. */
export const STREFA = (szer) => (szer < 600 ? { szer: 260, wys: 190 } : { szer: 340, wys: 200 });

const MARGINES = 8;
const GORA = 64; // under the header line

/**
 * Where the notes go: a band above the logo zone and a band below it, spread across the width, each
 * a little off line and tilted. Deterministic, so a reload shows the same mess.
 */
export function miejscaNotek(n, szer, wys) {
  const ns = szer < 600 ? 118 : 150;
  const nw = Math.round(ns * 0.74);
  const strefa = STREFA(szer);
  const pasma = [
    { od: GORA, do: wys / 2 - strefa.wys / 2 },
    { od: wys / 2 + strefa.wys / 2, do: wys - MARGINES },
  ];
  const wGorze = Math.floor(n / 2);
  return Array.from({ length: n }, (_, i) => {
    const gora = i < wGorze;
    const k = gora ? wGorze : n - wGorze;
    const j = gora ? i : i - wGorze;
    const pas = pasma[gora ? 0 : 1];
    const losX = (((i * 37) % 10) / 10 - 0.5) * 0.35; // a little off the even spread
    const losY = 0.2 + ((i * 53) % 10) / 16;
    const x = MARGINES + (szer - 2 * MARGINES - ns) * Math.min(1, Math.max(0, (j + 0.5 + losX) / k));
    const y = pas.od + Math.max(0, pas.do - pas.od - nw) * Math.min(1, losY);
    return { x: Math.round(x), y: Math.round(y), szer: ns, wys: nw, r: ((i * 47) % 24) - 12 };
  });
}

/**
 * The state of the curtain on <html>: "laduje" → "zbiera" (notes gather) → "zdjeta"; an error goes
 * straight to "zdjeta". Without the class from <head> there is nothing to lift.
 * @param {{ classList: { contains(k: string): boolean, add(k: string): void, remove(k: string): void }, style: { setProperty(k: string, v: string): void } }} korzen
 */
export function utworzZaslone(korzen, { czas = setTimeout, anuluj = clearTimeout, naZbieranie = () => {} } = {}) {
  let stan = korzen.classList.contains(KLASA) ? "laduje" : "zdjeta";
  let p = 0;
  const timery = [];
  const zdejmij = () => {
    korzen.classList.remove(KLASA);
    stan = "zdjeta";
    timery.push(czas(() => korzen.classList.remove(KLASA_KONCA), ZNIKANIE_MS));
  };
  // its own limit in <head> may have taken the class off already
  const zywa = () => {
    if (stan === "laduje" && !korzen.classList.contains(KLASA)) stan = "zdjeta";
    return stan === "laduje";
  };
  return {
    /** Sets the progress (it never goes back); without an argument, reads it. */
    postep(nowy) {
      if (nowy === undefined) return p;
      p = Math.max(p, Math.min(1, nowy));
      korzen.style.setProperty("--postep", String(Math.round(p * 1000) / 1000));
      return p;
    },
    /** The hero is on screen: the notes gather, then the curtain fades. */
    gotowe() {
      if (!zywa()) return stan;
      this.postep(1);
      // the survey link reports this as the loading time (js/ankieta.js)
      if (korzen.dataset) korzen.dataset.gotoweMs = String(Math.round(globalThis.performance?.now() ?? 0));
      stan = "zbiera";
      korzen.classList.add(KLASA_KONCA);
      naZbieranie();
      timery.push(czas(zdejmij, ZBIERANIE_MS));
      return stan;
    },
    /** Loading failed: the content shows at once, without the gathering. */
    blad() {
      timery.forEach((t) => anuluj(t));
      korzen.classList.remove(KLASA, KLASA_KONCA);
      stan = "zdjeta";
      return stan;
    },
    get stan() {
      return stan;
    },
  };
}

/** One note that can be grabbed and thrown; it slides to a stop. */
function przeciagalna(n, s, okno) {
  const ustaw = (obrot = s.r) => { n.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${obrot}deg)`; };
  n.addEventListener("pointerdown", (e) => {
    n.setPointerCapture(e.pointerId);
    n.classList.add("trzymana");
    let px = e.clientX, py = e.clientY, t = e.timeStamp;
    const ruch = (m) => {
      const dt = Math.max(1, m.timeStamp - t);
      s.vx = ((m.clientX - px) / dt) * 16;
      s.vy = ((m.clientY - py) / dt) * 16;
      s.x += m.clientX - px;
      s.y += m.clientY - py;
      px = m.clientX; py = m.clientY; t = m.timeStamp;
      ustaw(s.r + s.vx * 0.4);
    };
    const pusc = () => {
      n.removeEventListener("pointermove", ruch);
      n.classList.remove("trzymana");
      const slizg = () => {
        s.vx *= 0.9; s.vy *= 0.9; s.x += s.vx; s.y += s.vy;
        ustaw();
        if (Math.abs(s.vx) + Math.abs(s.vy) > 0.3) okno.requestAnimationFrame(slizg);
      };
      slizg();
    };
    n.addEventListener("pointermove", ruch);
    n.addEventListener("pointerup", pusc, { once: true });
    n.addEventListener("pointercancel", pusc, { once: true });
  });
  ustaw();
}

/** The curtain on the page: notes and percent follow the progress; returns the same API as utworzZaslone. */
export function zamontujZaslone(dok = document, okno = window) {
  const el = dok.querySelector("[data-zaslona]");
  const pole = el?.querySelector("[data-notki]");
  const procent = el?.querySelector("[data-procent]");
  const teksty = [...(dok.querySelector("template[data-slowa-sceny]")?.content.querySelectorAll("[data-karteczka]") ?? [])]
    .map((p) => p.textContent);
  const notki = [];
  const miejsca = miejscaNotek(NOTKI, okno.innerWidth, okno.innerHeight);
  const z = utworzZaslone(dok.documentElement, {
    // the notes gather into one pile over the logo: the mess turns into order, as on the desk
    naZbieranie: () => notki.forEach(({ n, s }, i) => {
      s.x = okno.innerWidth / 2 - s.szer / 2 + (i - 3) * 3;
      s.y = okno.innerHeight / 2 - s.wys / 2 - 20 + (i - 3) * 2;
      n.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${(i - 3) * 2}deg) scale(.7)`;
    }),
  });
  const przypnij = (i) => {
    const m = miejsca[i];
    const n = dok.createElement("div");
    n.className = "zaslona__notka";
    n.textContent = teksty[i % Math.max(1, teksty.length)] ?? "";
    n.style.width = `${m.szer}px`;
    n.style.minHeight = `${m.wys}px`;
    n.style.setProperty("--nr", String(i));
    const s = { ...m, vx: 0, vy: 0 };
    przeciagalna(n, s, okno);
    pole.append(n);
    notki.push({ n, s });
  };
  // the first note is pinned at once: the progress starts only when three.js has loaded (about 4 s on
  // a slow phone), and the curtain should not stand empty until then
  if (pole && z.stan === "laduje") przypnij(0);
  const postep = z.postep.bind(z);
  return {
    postep(p) {
      if (p === undefined) return postep();
      const u = postep(p);
      if (pole && z.stan === "laduje") while (notki.length < ileNotek(u)) przypnij(notki.length);
      if (procent) procent.textContent = `${Math.round(u * 100)} %`;
      return u;
    },
    gotowe() {
      if (pole && z.stan === "laduje") while (notki.length < NOTKI) przypnij(notki.length);
      return z.gotowe();
    },
    blad: () => z.blad(),
    get stan() {
      return z.stan;
    },
  };
}
