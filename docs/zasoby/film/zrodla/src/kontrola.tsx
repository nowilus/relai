// The overflow check of E6 (plan FILM_PREZENTACYJNY, "cztery kontrole"; zasada 15): measured in the
// Chromium that renders the frame, never estimated. Mounted only when a composition gets the input
// prop `kontrola`, so the film and the loop render as before without it. After the fonts and the
// scenes' own measurements, it walks every visible element holding text and reports:
// - "poza": the text's box leaves its container — the nearest ancestor drawn as a box (background
//   or border: a pill, a card, a button, a note, a window) — by more than one pixel;
// - "uciety": an element cuts its own text (scrollWidth over clientWidth) without an ellipsis.
// Text cut by the frame's edge or by a camera's window is the frame, not an overflow: the frame's
// edge is not a box. One console line per frame, read by the render's log (skrypty/kontrola.mjs).
// `kontrola: 'podloz'` plants one defect of each kind: the positive control.
import { useLayoutEffect } from 'react';
import { continueRender, delayRender, useCurrentFrame } from 'remotion';
import { fontsReady } from './fonty';
import { NOTE } from './tokeny';

export type Kontrola = false | 'mierz' | 'podloz';
type Wada = { rodzaj: 'poza' | 'uciety', tekst: string, o: number };

const TOL = 1;
const tlo = (s: CSSStyleDeclaration) => s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent';
const ramka = (s: CSSStyleDeclaration) => ['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(s.getPropertyValue(`border-${k.toLowerCase()}-width`)) > 0 && s.getPropertyValue(`border-${k.toLowerCase()}-style`) !== 'none');

/** The nearest ancestor drawn as a box; null when only the stage is around the text. */
function kontener(el: Element): Element | null {
  const t = el.getBoundingClientRect();
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const s = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    // a full-frame layer (the desk, a scene's fill) is the stage, not a box around the text
    if (r.width >= window.innerWidth - 1 && r.height >= window.innerHeight - 1) continue;
    // a box lower than the text is a line it labels (a track, a rule), not a box that holds it:
    // the threshold's label stands above the limit's track by design
    if (r.height < t.height * 0.9) continue;
    if (tlo(s) || ramka(s)) return p;
  }
  return null;
}

type Prost = { left: number, top: number, right: number, bottom: number };

/**
 * The part of an element the viewer can see: its box cut by every ancestor that clips (an ellipsis
 * cell, a scrolled list, a camera's window). Null when nothing of it is in view: a row scrolled
 * away is not an overflow. What an ancestor cuts off its own text is "uciety", measured apart.
 */
function widoczny(el: Element): Prost | null {
  const b = el.getBoundingClientRect();
  let r: Prost = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const s = getComputedStyle(p);
    if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
    const c = p.getBoundingClientRect();
    r = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) };
  }
  return r.right - r.left > 0.5 && r.bottom - r.top > 0.5 ? r : null;
}

const wlasnyTekst = (el: Element): string =>
  [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? '').join('').trim();

export function zmierz(): Wada[] {
  const wady: Wada[] = [];
  for (const el of document.body.querySelectorAll('*')) {
    const tekst = wlasnyTekst(el);
    if (!tekst) continue;
    if (!(el as HTMLElement).checkVisibility?.({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = widoczny(el);
    if (!r) continue;
    // text standing right in a box (a button, a label, a pill) is held by that box: its overflow is
    // the box's own scroll size; where the box itself sits against its parent is drawing, not text
    // (the type label of a document icon overhangs the page by design, as the pane draws it)
    const sw = getComputedStyle(el);
    if (tlo(sw) || ramka(sw)) {
      const h = el as HTMLElement;
      const o = Math.max(h.scrollWidth - h.clientWidth, h.scrollHeight - h.clientHeight);
      if (sw.overflowX === 'visible' && o > TOL) wady.push({ rodzaj: 'poza', tekst: tekst.slice(0, 60), o });
    }
    const k = tlo(sw) || ramka(sw) ? null : kontener(el);
    if (k) {
      const c = k.getBoundingClientRect();
      const o = Math.max(c.left - r.left, r.right - c.right, c.top - r.top, r.bottom - c.bottom);
      if (o > TOL) wady.push({ rodzaj: 'poza', tekst: tekst.slice(0, 60), o: Math.round(o) });
    }
    // text marked as the frame's own (a title on the desk, with no box around it) must stay whole
    // inside the frame: here the frame's edge is the container
    if (el.closest('[data-w-kadrze]')) {
      const b = el.getBoundingClientRect();
      const o = Math.max(-b.left, b.right - window.innerWidth, -b.top, b.bottom - window.innerHeight);
      if (o > TOL) wady.push({ rodzaj: 'poza', tekst: tekst.slice(0, 60), o: Math.round(o) });
    }
    const s = getComputedStyle(el);
    const h = el as HTMLElement;
    if (s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis' && h.scrollWidth > h.clientWidth + TOL) {
      wady.push({ rodzaj: 'uciety', tekst: tekst.slice(0, 60), o: h.scrollWidth - h.clientWidth });
    }
  }
  return wady;
}

/** Measures the frame once everything is laid out and logs the result: "KONTROLA <json>". */
export const KontrolaUkladu = ({ tryb }: { tryb: Kontrola }) => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    // one hold per frame: the frame is not taken before it is measured
    const handle = delayRender(`kontrola przepelnien ${frame}`);
    fontsReady.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      // the render's log is the instrument's output channel (skrypty/kontrola.mjs reads it)
      // eslint-disable-next-line no-console
      console.log(`KONTROLA ${JSON.stringify({ klatka: frame, wady: zmierz() })}`);
      continueRender(handle);
    })));
  }, [frame]);
  if (tryb !== 'podloz') return null;
  // the planted overflows: a pill narrower than its one-line text, and a frame's own line running
  // past the frame's right edge
  return (
    <>
      <div style={{ position: 'absolute', left: 20, top: 20, width: 90, padding: 6, background: NOTE.paper, whiteSpace: 'nowrap', fontSize: 24 }}>
        <span>podłożone przepełnienie kontrolne</span>
      </div>
      <div data-w-kadrze style={{ position: 'absolute', right: -200, top: 80, whiteSpace: 'nowrap', fontSize: 24 }}>podłożony tytuł poza kadrem</div>
      <div style={{ position: 'absolute', left: 20, top: 140, width: 90, overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 24 }}>podłożony napis ucięty</div>
      <div style={{ position: 'absolute', left: 20, top: 200, width: 90, background: NOTE.paper, whiteSpace: 'nowrap', fontSize: 24 }}>podłożona etykieta za wąska</div>
    </>
  );
};
