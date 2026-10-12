// Scene 2 of the film, "Trzy paski" (plan FILM_PREZENTACYJNY, section 5): the three bars above the
// prompt, built from this repository's state through core/panel and from the cache figures of a
// real session's screenshot (src/dane/paski.json). The bars come in, the camera pushes into the
// 5 h battery, and a note drawn by hand says what a battery shows: how much is left.
import { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAND } from '../rdzen';
import { fontsReady } from '../fonty';
import { camera, offsetWithin } from '../kamera';
import type { Punkt } from '../kamera';
import { FILM, FONT, GLASS, INK, SCALE, WINDOW, DESK } from '../tokeny';
import { useT } from '../jezyk';
import dane from '../dane/paski.json';
import type { DanePaskow } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Adnotacja, PAD_X, PAD_Y } from './Adnotacja';
import { Pytania } from './Pytania';
import { Liczba, Pasek, Segmenty, TrescPlanu } from './Pasek';
import { WierszBaterii } from './PasekCache';

const D = dane as DanePaskow;

/** The beats of the scene in frames (30 fps). */
const T = Object.freeze({
  title: 0,
  window: 8,
  bars: [24, 30, 36],
  segments: 42,
  batteries: 52,
  push: 100, // the camera goes to the battery
  pushFrames: 66,
  ring: 150,
  glide: 186, // then glides to frame the battery and the note together
  glideFrames: 50,
  arrow: 194,
  note: 206,
  drift: 238,
  caption1: [18, 136],
  caption2: [146, 316],
});
const ZOOM_MAX = 2.5;
const ZOOM_BATTERY = 2.8;
const TARGET = 'limit5h' as const;
const WINDOW_W = 1660;
/** Where the framed note lands: the frame's middle, a little up, clear of the subtitle. */
const ANCHOR: Punkt = { x: FILM.width / 2, y: FILM.height / 2 - 100 };

type Box = { at: Punkt, w: number, h: number };
type Shot = { focus: Punkt, zoom: number };

const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) });

/** `napisy` and `naglowek` serve the README loop (E6): without its subtitles and its title; the film keeps both. */
export const Paski = ({ napisy = true, naglowek = true }: { napisy?: boolean, naglowek?: boolean }) => {
  const slowa = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);
  const noteBox = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const [handle] = useState(() => delayRender('pomiar celu kamery'));

  // Phase 1: the battery's box, once the fonts are in (the loop is drawn to its size)
  useLayoutEffect(() => {
    let alive = true;
    fontsReady.then(() => {
      if (!alive || !stage.current || !target.current) return;
      setBox({ at: offsetWithin(target.current, stage.current), w: target.current.offsetWidth, h: target.current.offsetHeight });
    });
    return () => { alive = false; };
  }, []);

  // Phase 2: the note is laid out; the camera frames the loop and the words together
  useLayoutEffect(() => {
    if (!box || shot || !stage.current || !noteBox.current) return;
    const n = offsetWithin(noteBox.current, stage.current);
    const left = box.at.x - PAD_X;
    const top = box.at.y - PAD_Y;
    const right = Math.max(box.at.x + box.w + PAD_X, n.x + noteBox.current.offsetWidth);
    const bottom = Math.max(box.at.y + box.h + PAD_Y, n.y + noteBox.current.offsetHeight);
    const zoom = Math.min(ZOOM_MAX, (0.86 * FILM.width) / (right - left), (0.6 * FILM.height) / (bottom - top));
    setShot({ focus: { x: (left + right) / 2, y: (top + bottom) / 2 }, zoom });
    continueRender(handle);
  }, [box, shot, handle]);

  const sp = (from: number, damping = 200, durationInFrames?: number) =>
    spring({ frame: frame - from, fps, config: { damping, mass: 0.9 }, durationInFrames });

  const titleIn = sp(T.title);
  const windowIn = sp(T.window, 18);
  const windowLanded = Math.abs(1 - windowIn) < 0.001;
  const push = sp(T.push, 200, T.pushFrames);
  const glide = sp(T.glide, 200, T.glideFrames);
  const drift = 1 + 0.014 * ease(frame, T.drift, FILM.paskiFrames);
  let transform = 'none';
  if (box && shot) {
    const battery = { x: box.at.x + box.w / 2, y: box.at.y + box.h / 2 };
    const focus = { x: battery.x + (shot.focus.x - battery.x) * glide, y: battery.y + (shot.focus.y - battery.y) * glide };
    const zoom = (ZOOM_BATTERY + (shot.zoom - ZOOM_BATTERY) * glide) * drift;
    transform = camera(focus, ANCHOR, zoom, push);
  }
  // A bar comes in as a wipe from the left with a small lift; once in, it carries no clip or
  // transform. When the camera arrives, the bars it does not go to step back.
  const dim = push;
  const barIn = (i: number) => sp(T.bars[i] ?? 0, 22);
  const barStyle = (i: number, focused: boolean) => {
    const k = barIn(i);
    const settled = Math.abs(1 - k) < 0.001;
    return {
      opacity: Math.min(1, k * 2) * (focused ? 1 : 1 - 0.58 * dim),
      clipPath: settled ? undefined : `inset(-10% ${Math.max(0, 1 - k) * 100}% -10% 0 round ${11 * SCALE}px)`,
      transform: settled ? undefined : `translateY(${(1 - k) * 14}px)`,
    };
  };
  const underline = (i: number) => ease(frame, (T.bars[i] ?? 0) + 4, (T.bars[i] ?? 0) + 22);
  const titleOut = ease(frame, T.push - 4, T.push + 30);

  return (
    <AbsoluteFill>
      <Biurko />
      <div ref={stage} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform }}>
        <div style={{ position: 'absolute', left: 130, top: 78, display: naglowek ? undefined : 'none', opacity: titleIn * (1 - titleOut), transform: `translateY(${(1 - titleIn) * 24 - titleOut * 60}px)` }}>
          <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 40, color: INK.margin, transform: 'rotate(-2deg)', transformOrigin: 'left center' }}>{slowa.paski.nadpis}</div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 88, lineHeight: 1.04, color: INK.title, letterSpacing: -1, marginTop: 4 }}>{slowa.paski.tytul}</div>
          <div style={{ marginTop: 18 }}>
            <Pytania questions={slowa.paski.pytania} drawn={underline} />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: (FILM.width - WINDOW_W) / 2,
            top: 368,
            width: WINDOW_W,
            padding: 30,
            borderRadius: WINDOW.radius,
            background: WINDOW.surface,
            border: `1px solid ${WINDOW.edge}`,
            boxShadow: DESK.shadow,
            opacity: Math.min(1, windowIn * 1.5),
            // a 3D transform rasterizes the window once at scale 1 and the camera would enlarge
            // that picture: once the window has landed it carries no transform at all
            transform: windowLanded ? 'none' : `perspective(1800px) translateY(${(1 - windowIn) * 150}px) rotateX(${(1 - windowIn) * 24}deg) scale(${0.94 + 0.06 * windowIn})`,
            transformOrigin: '50% 100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 10 * SCALE,
              padding: 14 * SCALE,
              borderRadius: GLASS.radius,
              background: GLASS.fill,
              border: `1px solid ${GLASS.edge}`,
              boxShadow: `inset 0 1px 0 ${GLASS.highlight}`,
            }}
          >
            <Pasek band={BAND.panel} figure={<Liczba value={`${D.plan.zamkniete.wartosc}/${D.plan.etapy.wartosc}`} unit={slowa.paski.etapy} />} style={barStyle(0, false)}>
              <TrescPlanu plan={D.plan} statusColor={BAND.panel.color} />
            </Pasek>
            <Pasek band={BAND.progress} figure={D.postep.razem.wartosc > 0 ? <Liczba value={`${D.postep.zrobione.wartosc}/${D.postep.razem.wartosc}`} unit={slowa.paski.punkty} /> : null} style={barStyle(1, false)}>
              <Segmenty items={D.postep.punkty.wartosc} words={D.postep.slowa.wartosc} appear={(i) => ease(frame, T.segments + i * 1.6, T.segments + 8 + i * 1.6)} />
            </Pasek>
            <Pasek band={BAND.cache} figure={<Liczba value={D.cache.koszt.wartosc} unit={D.cache.kosztJednostka.wartosc} />} style={barStyle(2, true)}>
              <WierszBaterii
                miary={D.cache.miary}
                dimOthers={dim}
                grow={(i) => ease(frame, T.batteries + i * 4, T.batteries + 22 + i * 4)}
                target={TARGET}
                targetRef={target}
                annotation={box ? (
                  <Adnotacja
                    box={box}
                    noteRef={noteBox}
                    ring={ease(frame, T.ring, T.ring + 34)}
                    arrow={ease(frame, T.arrow, T.arrow + 16)}
                    note={sp(T.note, 13)}
                    used={D.cache.miary.find((m) => m.klucz === TARGET)?.wartosc.wartosc ?? ''}
                    left={D.cache.miary.find((m) => m.klucz === TARGET)?.zostalo.wartosc ?? 0}
                  />
                ) : null}
              />
            </Pasek>
          </div>
          <div
            style={{
              marginTop: 22,
              height: 74,
              borderRadius: 20,
              background: WINDOW.promptBg,
              border: `1px solid ${WINDOW.promptEdge}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 28px',
            }}
          >
            <div style={{ width: 2.5, height: 34, borderRadius: 2, background: WINDOW.caret }} />
          </div>
        </div>
      </div>
      {napisy && <Napis text={slowa.paski.napis1} from={T.caption1[0] ?? 0} to={T.caption1[1] ?? 0} />}
      {napisy && <Napis text={slowa.paski.napis2} from={T.caption2[0] ?? 0} to={T.caption2[1] ?? 0} />}
    </AbsoluteFill>
  );
};
