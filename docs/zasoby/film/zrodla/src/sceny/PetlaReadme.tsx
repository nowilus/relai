// The README loop (plan FILM_PREZENTACYJNY, section 5 and goal 2; E6): 25 s in a 720×900 frame, a
// cut of scenes "Trzy paski" and "Panel" for a phone. The scenes are the film's own components; a
// camera frames a part of their 1920×1080 stage large enough for the product's text to stay
// readable at 375 px (glify.py: median glyph height ≥ 7 px). "Trzy paski" keeps its own camera and
// notes, without its title and subtitles; "Panel" is drawn in a narrower window. Over each part a
// title, under it one-line subtitles from the dictionary (section `petla`). The loop starts and
// ends on the bare desk, so the GIF loops without a jump. No sound: a GIF has none.
import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { FILM, FONT, INK } from '../tokeny';
import { useT } from '../jezyk';
import type { Jezyk } from '../fakty';
import { ZJezykiem } from '../jezyk';
import { KontrolaUkladu } from '../kontrola';
import type { Kontrola } from '../kontrola';
import { Biurko } from './Biurko';
import { Paski } from './Paski';
import { PaskiDalej } from './PaskiDalej';
import { Panel } from './Panel';

/** The loop's frame and length. */
export const PETLA = Object.freeze({ width: 720, height: 900, fps: 30, frames: 750 });

/** Where the scenes are seen: the band between the title and the subtitle. */
const OKNO = Object.freeze({ top: 146, height: 654 });

/** The two parts of the loop in its frames, and where each starts in its scene. */
const CZESCI = Object.freeze({
  paski: { od: 0, do: 420, scena: 30 },
  panel: { od: 420, do: 750, scena: 0 },
});
const FADE = 15; // frames a part fades through the desk, in and out

/** The panel's window in the loop: narrow, so the camera can hold it large. */
const PANEL_ZOOM = 1.6;
const PANEL_OKNO = Object.freeze({
  left: 0,
  top: 0,
  width: Math.round(PETLA.width / PANEL_ZOOM),
  height: Math.round(OKNO.height / PANEL_ZOOM),
  pad: 22,
});

/** The camera over "Trzy paski": [scene frame, centre x, centre y, zoom] of the 1920×1080 stage. */
const KAMERA_PASKOW: readonly (readonly [number, number, number, number])[] = Object.freeze([
  [30, 330, 510, 1.6],
  [100, 330, 510, 1.6],
  [166, 890, 480, 1.0],
  [190, 860, 420, 0.9],
  [240, 975, 480, 0.55],
  [330, 975, 480, 0.55],
  [380, 600, 400, 0.7],
  [450, 600, 400, 0.7],
]);

/** Subtitles: [index in petla.napisy, from, to] in the loop's frames. */
const NAPISY: readonly (readonly [number, number, number])[] = Object.freeze([
  [0, 20, 200],
  [1, 215, 405],
  [2, 435, 630],
  [3, 645, 738],
]);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** The camera at a scene frame: a smooth step between the keyframes around it. */
function kamera(s: number): { x: number, y: number, z: number } {
  const k = KAMERA_PASKOW;
  const first = k[0] ?? [0, 960, 540, 1];
  if (s <= first[0]) return { x: first[1], y: first[2], z: first[3] };
  for (let i = 1; i < k.length; i++) {
    const a = k[i - 1] ?? first;
    const b = k[i] ?? first;
    if (s <= b[0]) {
      const t = smooth((s - a[0]) / (b[0] - a[0]));
      // the zoom moves in its logarithm, so a push looks even
      const z = Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * t);
      return { x: a[1] + (b[1] - a[1]) * t, y: a[2] + (b[2] - a[2]) * t, z };
    }
  }
  const last = k[k.length - 1] ?? first;
  return { x: last[1], y: last[2], z: last[3] };
}

/** A part of the loop fades in from the desk and out to it. */
const widocznosc = (f: number, od: number, doo: number) =>
  interpolate(f, [od, od + FADE], [0, 1], { ...clamp, easing: smooth }) * (1 - interpolate(f, [doo - FADE, doo], [0, 1], { ...clamp, easing: smooth }));

/** A 1920×1080 stage seen through the loop's window: (x, y) of the stage in the window's middle. */
const Kadr = ({ x, y, z, children }: { x: number, y: number, z: number, children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 0, top: OKNO.top, width: PETLA.width, height: OKNO.height, overflow: 'hidden' }}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: FILM.width,
        height: FILM.height,
        transformOrigin: '0 0',
        transform: `translate(${PETLA.width / 2 - x * z}px, ${OKNO.height / 2 - y * z}px) scale(${z})`,
      }}
    >
      {children}
    </div>
  </div>
);

/** The title over a part: the hand-written line and the serif title, as in the film's scenes. */
const Tytul = ({ nadpis, tytul, k }: { nadpis: string, tytul: string, k: number }) => (
  <div data-w-kadrze style={{ position: 'absolute', left: 36, right: 36, top: 26, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
    <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 26, color: INK.margin, transform: 'rotate(-2deg)', transformOrigin: 'left center', whiteSpace: 'nowrap' }}>{nadpis}</div>
    <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 42, lineHeight: 1.08, color: INK.title, letterSpacing: -0.6, marginTop: 2, whiteSpace: 'nowrap' }}>{tytul}</div>
  </div>
);

/** A one-line subtitle under the window: the film's caption pill at the loop's size. */
const Podpis = ({ text, from, to }: { text: string, from: number, to: number }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, from + 10], [0, 1], { ...clamp, easing: smooth }) * (1 - interpolate(f, [to - 9, to], [0, 1], { ...clamp, easing: smooth }));
  if (k <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center' }}>
      <div
        data-kontener="podpis"
        style={{
          maxWidth: PETLA.width - 40,
          padding: '12px 24px 14px',
          borderRadius: 999,
          background: INK.captionBg,
          border: `1px solid ${INK.captionEdge}`,
          boxShadow: INK.captionShadow,
          color: INK.captionText,
          fontFamily: FONT.ui,
          fontSize: 27,
          fontWeight: 600,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: k,
          transform: `translateY(${(1 - k) * 14}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Petla = () => {
  const f = useCurrentFrame();
  const slowa = useT();
  const P = CZESCI.paski;
  const N = CZESCI.panel;
  const kPaski = widocznosc(f, P.od, P.do);
  const kPanel = widocznosc(f, N.od, N.do);
  const cam = kamera(f - P.od + P.scena);
  return (
    <AbsoluteFill>
      <Biurko />
      {kPaski > 0 ? (
        <AbsoluteFill style={{ opacity: kPaski }}>
          <Kadr x={cam.x} y={cam.y} z={cam.z}>
            <Sequence from={P.od - P.scena} layout="none">
              <Sequence durationInFrames={FILM.paskiFrames} layout="none">
                <AbsoluteFill><Paski napisy={false} naglowek={false} /></AbsoluteFill>
              </Sequence>
              <Sequence from={FILM.paskiFrames} layout="none">
                <AbsoluteFill><PaskiDalej napisy={false} /></AbsoluteFill>
              </Sequence>
            </Sequence>
          </Kadr>
          <Tytul nadpis={slowa.petla.nadpisy[0] ?? ''} tytul={slowa.petla.tytuly[0] ?? ''} k={1} />
        </AbsoluteFill>
      ) : null}
      {kPanel > 0 ? (
        <AbsoluteFill style={{ opacity: kPanel }}>
          <Kadr x={PANEL_OKNO.width / 2} y={PANEL_OKNO.height / 2} z={PANEL_ZOOM}>
            <Sequence from={N.od - N.scena} layout="none">
              <AbsoluteFill><Panel napisy={false} okno={PANEL_OKNO} /></AbsoluteFill>
            </Sequence>
          </Kadr>
          <Tytul nadpis={slowa.petla.nadpisy[1] ?? ''} tytul={slowa.petla.tytuly[1] ?? ''} k={1} />
        </AbsoluteFill>
      ) : null}
      {NAPISY.map(([i, a, b]) => <Podpis key={i} text={slowa.petla.napisy[i] ?? ''} from={a} to={b} />)}
    </AbsoluteFill>
  );
};

/** The loop in one language: Polish by default, English for the composition PetlaEN. */
export const PetlaReadme = ({ jezyk = 'pl', kontrola = false }: { jezyk?: Jezyk, kontrola?: Kontrola }) => (
  <ZJezykiem jezyk={jezyk}>
    <Petla />
    {kontrola ? <KontrolaUkladu tryb={kontrola} /> : null}
  </ZJezykiem>
);
