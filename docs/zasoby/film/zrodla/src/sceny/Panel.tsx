// Scene 3 of the film, "Panel" (plan FILM_PREZENTACYJNY, section 5): the RelAI panel as relai-panel
// 0.14 draws it — its tabs in their real order (pane-parts.tsx TABS, held by wiernosc.test.mjs) —
// and a pointer that goes through four of them: Komendy (the card "Teraz", the recommended, every
// command in its group), Mapa (from "Ta sesja"), Dokumenty (tiles, one opened to its diff), Koszty
// (the sum, the tiles, the price list counted after "Tak"). A click switches a tab at once, as the
// panel does; the new view rises in. Each view is in the DOM from the first frame, so the pointer's
// targets are measured once.
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame } from 'remotion';
import { ROOT, THEME } from '../rdzen';
import { fontsReady } from '../fonty';
import { offsetWithin } from '../kamera';
import type { Punkt } from '../kamera';
import { FONT } from '../tokeny';
import { PL } from '../teksty';
import { wstaw } from '../fakty';
import type { Fakty } from '../fakty';
import manifest from '../dane/manifest.json';
import dane from '../dane/paski.json';
import panel from '../dane/panel.json';
import type { DanePanelu, DanePaskow } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Okno } from './Okno';
import { Petla } from './Petla';
import { Przycisk, U } from './panel/Czesci';
import { Komendy } from './panel/Komendy';
import { Mapa } from './panel/Mapa';
import { Dokumenty } from './panel/Dokumenty';
import { Koszty } from './panel/Koszty';

const D = dane as DanePaskow;
const P = panel as unknown as DanePanelu;
const F = manifest as unknown as Fakty;

type Zakladka = 'Komendy' | 'Koszty' | 'Dokumenty' | 'Mapa' | 'Pomoc';
const TABS = PL.panel.zakladki as readonly Zakladka[];

/** The beats of the scene in frames (30 fps, 900 frames). */
const T = Object.freeze({
  tabsIn: 6,
  scrollKomendy: [64, 178],
  pointerIn: 150,
  clickMapa: 214,
  sessionRing: 258, // the map is not scrolled: "Ta sesja" stays in view under its subtitle
  clickDokumenty: 440,
  clickOpen: 512,
  scrollDokumenty: [526, 590],
  clickKoszty: 664,
  scrollKoszty: [742, 812],
  netRing: 820,
  pointerOut: [700, 724],
  captions: [[18, 210], [230, 434], [456, 656], [678, 888]],
});
const WIN = Object.freeze({ left: 130, top: 46, width: 1660, height: 880, pad: 34 });
const RISE = 9; // frames a view rises in after its tab is clicked

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const smooth = (f: number, [a, b]: readonly number[]) => interpolate(f, [a ?? 0, b ?? 0], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

type Miary = {
  tabs: Record<string, Punkt>,
  open: Punkt,
  viewport: number,
  komendy: number,
  dokChanged: number,
  koszty: number,
  net: { at: Punkt, w: number, h: number },
  session: { at: Punkt, w: number, h: number },
};

const center = (el: HTMLElement, stage: HTMLElement): Punkt => {
  const at = offsetWithin(el, stage);
  return { x: at.x + el.offsetWidth / 2, y: at.y + el.offsetHeight / 2 };
};

/** The pointer: an arrow with a light body and a dark edge; `click` 0..1 rings its tip. */
const Kursor = ({ at, click, opacity }: { at: Punkt, click: number, opacity: number }) => (
  <div style={{ position: 'absolute', left: at.x, top: at.y, opacity, pointerEvents: 'none' }}>
    {click > 0 && click < 1 ? (
      <div style={{ position: 'absolute', left: -26 * click, top: -26 * click, width: 52 * click, height: 52 * click, borderRadius: '50%', border: `3px solid ${THEME.mark}`, opacity: 1 - click }} />
    ) : null}
    <svg width={34} height={46} viewBox="0 0 17 23" style={{ display: 'block', transform: click > 0 && click < 0.5 ? 'scale(0.9)' : undefined, transformOrigin: '0 0' }}>
      <path d="M1 1 L1 18 L5.2 14.2 L8 21 L11 19.8 L8.2 13.2 L14 13.2 Z" fill={ROOT.kartka} stroke={ROOT.txt} strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  </div>
);

export const Panel = () => {
  const f = useCurrentFrame();
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const views = useRef<Record<string, HTMLDivElement | null>>({});
  const openRef = useRef<HTMLDivElement>(null);
  const changedRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Miary | null>(null);
  const [handle] = useState(() => delayRender('pomiar panelu'));

  useLayoutEffect(() => {
    let alive = true;
    fontsReady.then(() => {
      const st = stage.current;
      const vp = viewport.current;
      const v = views.current;
      if (!alive || !st || !vp || !openRef.current || !changedRef.current || !netRef.current || !sessionRef.current || !v.Komendy || !v.Mapa || !v.Koszty || !v.Dokumenty) return;
      const tabs: Record<string, Punkt> = {};
      for (const t of TABS) {
        const el = tabRefs.current[t];
        if (el) tabs[t] = center(el, st);
      }
      setM({
        tabs,
        open: center(openRef.current, st),
        viewport: vp.offsetHeight,
        komendy: v.Komendy.offsetHeight,
        dokChanged: offsetWithin(changedRef.current, v.Dokumenty).y,
        koszty: v.Koszty.offsetHeight,
        net: { at: offsetWithin(netRef.current, v.Koszty), w: netRef.current.offsetWidth, h: netRef.current.offsetHeight },
        session: { at: offsetWithin(sessionRef.current, v.Mapa), w: sessionRef.current.offsetWidth, h: sessionRef.current.offsetHeight },
      });
      continueRender(handle);
    });
    return () => { alive = false; };
  }, [handle]);

  const tab: Zakladka = f < T.clickMapa ? 'Komendy' : f < T.clickDokumenty ? 'Mapa' : f < T.clickKoszty ? 'Dokumenty' : 'Koszty';
  const since = f < T.clickMapa ? f - T.tabsIn : f < T.clickDokumenty ? f - T.clickMapa : f < T.clickKoszty ? f - T.clickDokumenty : f - T.clickKoszty;
  const rise = ease(since, 0, RISE);
  const over = (h: number) => (m ? Math.max(0, h - m.viewport + 24 * U) : 0);
  const scroll: Record<Zakladka, number> = {
    Komendy: over(m?.komendy ?? 0) * smooth(f, T.scrollKomendy),
    Mapa: 0,
    Dokumenty: (m ? Math.max(0, m.dokChanged - 10 * U) : 0) * smooth(f, T.scrollDokumenty),
    Koszty: over(m?.koszty ?? 0) * smooth(f, T.scrollKoszty),
    Pomoc: 0,
  };

  // the pointer's way: in over the list, to each tab and to the tile, a click on each
  const press = (at: number) => (f >= at && f < at + 14 ? (f - at) / 14 : 0);
  let pointer: Punkt = { x: 1500, y: 640 };
  if (m) {
    const stops: [number, Punkt][] = [
      [T.pointerIn, { x: 1500, y: 640 }],
      [T.clickMapa - 8, m.tabs.Mapa ?? pointer],
      [T.clickDokumenty - 30, m.tabs.Mapa ?? pointer],
      [T.clickDokumenty - 8, m.tabs.Dokumenty ?? pointer],
      [T.clickOpen - 26, m.tabs.Dokumenty ?? pointer],
      [T.clickOpen - 6, m.open],
      [T.clickKoszty - 34, m.open],
      [T.clickKoszty - 8, m.tabs.Koszty ?? pointer],
      [T.pointerOut[1] ?? 0, { x: (m.tabs.Koszty?.x ?? 0) + 260, y: 520 }],
    ];
    pointer = stops[0]?.[1] ?? pointer;
    for (let i = 1; i < stops.length; i++) {
      const [a, pa] = stops[i - 1] ?? [0, pointer];
      const [b, pb] = stops[i] ?? [0, pointer];
      if (f >= a) {
        const k = ease(f, a, b);
        pointer = { x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k };
      }
    }
  }
  const pointerOpacity = ease(f, T.pointerIn - 10, T.pointerIn) * (1 - ease(f, T.pointerOut[0] ?? 0, T.pointerOut[1] ?? 0));
  const click = Math.max(press(T.clickMapa), press(T.clickDokumenty), press(T.clickOpen), press(T.clickKoszty));

  const view = (name: Zakladka, children: ReactNode) => (
    <div
      ref={(el) => { views.current[name] = el; }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        visibility: name === tab ? 'visible' : 'hidden',
        opacity: name === tab ? rise : 0,
        transform: `translateY(${-scroll[name] + (name === tab ? (1 - rise) * 16 : 0)}px)`,
      }}
    >
      {children}
    </div>
  );

  const titleLine = ease(f, 4, 26);
  return (
    <AbsoluteFill>
      <Biurko />
      <div ref={stage} style={{ position: 'absolute', inset: 0 }}>
        <Okno left={WIN.left} top={WIN.top} width={WIN.width} height={WIN.height} padding={`${WIN.pad}px ${WIN.pad + 8}px`} entry={1} style={{ display: 'flex', flexDirection: 'column', gap: 20 * U }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 34 * U }}>
            <div style={{ position: 'relative', fontFamily: FONT.handBold, fontWeight: 700, fontSize: 44 * U, lineHeight: 1.1, color: THEME.accent, whiteSpace: 'nowrap' }}>
              {PL.panel.tytul}
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: -4, right: -4, bottom: -8 * U, width: 'calc(100% + 8px)', height: 10 * U, overflow: 'visible', clipPath: `inset(-50% ${(1 - titleLine) * 100}% -50% 0)` }}>
                <path d="M 1 7 C 30 4, 70 4, 99 6" fill="none" stroke={THEME.mark} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={titleLine > 0 ? 1 : 0} />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 10 * U }}>
              {TABS.map((t, i) => {
                const k = ease(f, T.tabsIn + i * 3, T.tabsIn + 12 + i * 3);
                const at = t === 'Mapa' ? T.clickMapa : t === 'Dokumenty' ? T.clickDokumenty : t === 'Koszty' ? T.clickKoszty : -99;
                return (
                  <div key={t} ref={(el) => { tabRefs.current[t] = el; }} style={{ opacity: k, transform: k < 1 ? `translateY(${(1 - k) * 12}px)` : undefined }}>
                    <Przycisk primary={t === tab} pressed={press(at) > 0 ? 1 - Math.abs(press(at) * 2 - 1) : 0} size={17}>{t}</Przycisk>
                  </div>
                );
              })}
            </div>
          </div>
          <div ref={viewport} style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {view('Komendy', <Komendy d={D} />)}
            {view('Mapa', (
              <div style={{ position: 'relative' }}>
                <Mapa d={D} m={P.mapa} sessionRef={sessionRef} />
                {m ? <Petla at={m.session.at} w={m.session.w} h={m.session.h} drawn={ease(f, T.sessionRing, T.sessionRing + 30)} /> : null}
              </div>
            ))}
            {view('Dokumenty', (
              <Dokumenty d={P.dokumenty} open={ease(f, T.clickOpen, T.clickOpen + RISE)} openRef={openRef} changedRef={changedRef} />
            ))}
            {view('Koszty', (
              <div style={{ position: 'relative' }}>
                <Koszty k={P.koszty} netRef={netRef} />
                {m ? <Petla at={m.net.at} w={m.net.w} h={m.net.h} drawn={ease(f, T.netRing, T.netRing + 30)} /> : null}
              </div>
            ))}
          </div>
        </Okno>
        {m ? <Kursor at={pointer} click={click} opacity={pointerOpacity} /> : null}
      </div>
      {T.captions.map(([a, b], i) => (
        <Napis key={i} text={wstaw(PL.panel.napisy[i] ?? '', F)} from={a ?? 0} to={b ?? 0} />
      ))}
    </AbsoluteFill>
  );
};

