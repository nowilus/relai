// Scene 2 of the film, after its first ten seconds ("Paski", frozen since E1): the same window in the
// shot "Paski" ends on — so the cut between them is not seen — then the camera answers the two
// other questions of the title. It glides to the plan bar ("nad czym pracuję": the stage this
// session works on), down to the progress bar ("ile zrobione": the stage's points one by one, a tick
// on each point done as the marker walks the row), and pulls out on all three bars and notes.
// Data: src/dane/paski.json, the same as "Paski". Pasek, PasekCache, Adnotacja are reused untouched.
import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAND } from '../rdzen';
import { fontsReady } from '../fonty';
import { camera, offsetWithin } from '../kamera';
import type { Punkt } from '../kamera';
import { FILM, FONT, GLASS, NOTE, SCALE } from '../tokeny';
import { PL } from '../teksty';
import dane from '../dane/paski.json';
import type { DanePaskow } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Adnotacja, PAD_X, PAD_Y } from './Adnotacja';
import { Liczba, Pasek, Segmenty, TrescPlanu } from './Pasek';
import { WierszBaterii } from './PasekCache';
import { Okno, Prompt } from './Okno';
import { Karteczka } from './Karteczka';
import { Petla, ringBox } from './Petla';
import { Strzalka } from './Strzalka';

const D = dane as DanePaskow;
const S = SCALE;

/** The beats, in frames of this part (its frame 0 is frame 300 of the scene). */
const T = Object.freeze({
  toPlan: 22,
  planRing: 62,
  planNote: 78,
  toProgress: 176,
  progressRing: 214,
  progressNote: 226,
  sweep: 236, // the marker walks the points, one every STEP frames
  out: 318,
  napis2: [-154, 16], // the tail of the subtitle "Paski" leaves on: one picture over the cut
  caption1: [40, 168],
  caption2: [196, 384],
});
const STEP = 4;
const MOVE = 56; // frames of a camera move
const ZOOM_MAX = 2.3;
// the shot "Paski" ends on: its framing of the battery and its note, `drift` grown to 1.014
const ZOOM_BATTERY_MAX = 2.5;
const DRIFT = 1.014;
const TARGET = 'limit5h' as const;
const WINDOW = Object.freeze({ left: (FILM.width - 1660) / 2, top: 368, width: 1660 });
const ANCHOR: Punkt = { x: FILM.width / 2, y: FILM.height / 2 - 100 };

type Box = { at: Punkt, w: number, h: number };
type Shot = { focus: Punkt, zoom: number };
type Boxes = { battery: Box, plan: Box, segments: Box, count: Box | null };
type Shots = { battery: Shot, plan: Shot, progress: Shot, all: Shot };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const c01 = (v: number) => Math.min(1, Math.max(0, v));

/** A figure on a handwritten note, in Hanken: Kalam's "1" reads as "I" (L-0174). */
const Cyfra = ({ children }: { children: number }) => (
  <span style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: '0.92em' }}>{children}</span>
);

const boxOf = (el: HTMLElement, stage: HTMLElement): Box => ({ at: offsetWithin(el, stage), w: el.offsetWidth, h: el.offsetHeight });

/** The shot that frames a set of boxes: their middle at the anchor, as large as fits. */
function frame(boxes: Box[], zoomMax: number, width = 0.86, height = 0.6): Shot {
  const left = Math.min(...boxes.map((b) => b.at.x));
  const top = Math.min(...boxes.map((b) => b.at.y));
  const right = Math.max(...boxes.map((b) => b.at.x + b.w));
  const bottom = Math.max(...boxes.map((b) => b.at.y + b.h));
  const zoom = Math.min(zoomMax, (width * FILM.width) / (right - left), (height * FILM.height) / (bottom - top));
  return { focus: { x: (left + right) / 2, y: (top + bottom) / 2 }, zoom };
}

/** A point on the top of the loop around `b`, at the horizontal share `k` of the loop's width. */
function onTop(b: Box, k: number): Punkt {
  const r = ringBox(b);
  const rx = r.w / 2;
  const ry = r.h / 2;
  const dx = (k - 0.5) * 2 * rx;
  return { x: r.at.x + rx + dx, y: r.at.y + ry - ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2)) };
}
const between = (a: Shot, b: Shot, k: number): Shot => ({
  focus: { x: a.focus.x + (b.focus.x - a.focus.x) * k, y: a.focus.y + (b.focus.y - a.focus.y) * k },
  zoom: a.zoom + (b.zoom - a.zoom) * k,
});

export const PaskiDalej = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useRef<HTMLDivElement>(null);
  const battery = useRef<HTMLDivElement>(null);
  const planText = useRef<HTMLDivElement>(null);
  const segments = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const cacheNote = useRef<HTMLDivElement>(null);
  const planNote = useRef<HTMLDivElement>(null);
  const progressNote = useRef<HTMLDivElement>(null);
  const windowBox = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Boxes | null>(null);
  const [shots, setShots] = useState<Shots | null>(null);
  const [handle] = useState(() => delayRender('pomiar kadrów sceny 2'));

  // Phase 1: the boxes the loops ring, once the fonts are in
  useLayoutEffect(() => {
    let alive = true;
    fontsReady.then(() => {
      if (!alive || !stage.current || !battery.current || !planText.current || !segments.current) return;
      setBoxes({ battery: boxOf(battery.current, stage.current), plan: boxOf(planText.current, stage.current), segments: boxOf(segments.current, stage.current), count: count.current ? boxOf(count.current, stage.current) : null });
    });
    return () => { alive = false; };
  }, []);

  // Phase 2: the notes are laid out; the shots frame the loops and the notes together
  useLayoutEffect(() => {
    if (!boxes || shots || !stage.current || !cacheNote.current || !planNote.current || !progressNote.current || !windowBox.current) return;
    const st = stage.current;
    const b = boxes.battery;
    // the framing of "Paski", computed the same way (Paski.tsx, phase 2)
    const cache: Box = { at: { x: b.at.x - PAD_X, y: b.at.y - PAD_Y }, w: b.w + 2 * PAD_X, h: b.h + 2 * PAD_Y };
    const batteryShot = frame([cache, boxOf(cacheNote.current, st)], ZOOM_BATTERY_MAX);
    const notes = [boxOf(cacheNote.current, st), boxOf(planNote.current, st), boxOf(progressNote.current, st)];
    setShots({
      battery: { ...batteryShot, zoom: batteryShot.zoom * DRIFT },
      plan: frame([ringBox(boxes.plan), boxOf(planNote.current, st)], ZOOM_MAX),
      progress: frame([ringBox(boxes.count ?? boxes.segments), boxes.segments, boxOf(progressNote.current, st)], ZOOM_MAX),
      all: frame([boxOf(windowBox.current, st), ...notes], 1.3, 0.92, 0.78),
    });
    continueRender(handle);
  }, [boxes, shots, handle]);

  const move = (from: number) => spring({ frame: f - from, fps, config: { damping: 200, mass: 0.9 }, durationInFrames: MOVE });
  const k1 = move(T.toPlan);
  const k2 = move(T.toProgress);
  const k3 = move(T.out);

  let transform = 'none';
  if (shots) {
    const shot = between(between(between(shots.battery, shots.plan, k1), shots.progress, k2), shots.all, k3);
    transform = camera(shot.focus, ANCHOR, shot.zoom, 1);
  }

  // which bar the camera is on: the others step back, as in "Paski"; all come back for the end
  const bar = (on: number): CSSProperties => ({ opacity: 0.42 + 0.58 * c01(on) });
  const items = D.postep.punkty.wartosc;
  // the marker walks the whole row — points are ticked in any order (the first one may wait for
  // the stage's end) — leaving a tick on each point done, then fades
  const last = Math.max(0, items.length - 1);
  const walked = Math.min(last, Math.max(0, (f - T.sweep) / STEP));
  const walkEnd = T.sweep + last * STEP;
  const markerIn = ease(f, T.sweep - 6, T.sweep + 4) * (1 - ease(f, walkEnd + 6, walkEnd + 18));

  const plan = boxes?.plan;
  const seg = boxes?.segments;
  // "ile zrobione" is answered by the count of points; a stage with nothing to count rings its words
  const answer = boxes ? boxes.count ?? boxes.segments : undefined;
  // both notes above the window: the plan's on the left over its words, the progress's on the right
  const planNoteAt = plan ? { x: plan.at.x - 6 * S, y: WINDOW.top - 70 * S } : { x: 0, y: 0 };
  // three lines tall: high enough to leave the plan bar's figure in view
  const progressNoteAt = answer ? { x: answer.at.x - 250 * S, y: WINDOW.top - 118 * S } : { x: 0, y: 0 };
  const segW = seg && items.length ? seg.w / items.length : 0;

  return (
    <AbsoluteFill>
      <Biurko />
      <div ref={stage} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform }}>
        <Okno left={WINDOW.left} top={WINDOW.top} width={WINDOW.width} entry={1} boxRef={windowBox}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 10 * S,
              padding: 14 * S,
              borderRadius: GLASS.radius,
              background: GLASS.fill,
              border: `1px solid ${GLASS.edge}`,
              boxShadow: `inset 0 1px 0 ${GLASS.highlight}`,
            }}
          >
            <Pasek band={BAND.panel} figure={<Liczba value={`${D.plan.zamkniete.wartosc}/${D.plan.etapy.wartosc}`} unit={PL.paski.etapy} />} style={bar(k1 - k2 + k3)}>
              <div ref={planText} style={{ width: 'fit-content', maxWidth: '100%' }}>
                <TrescPlanu plan={D.plan} statusColor={BAND.panel.color} />
              </div>
            </Pasek>
            <Pasek band={BAND.progress} figure={D.postep.razem.wartosc > 0 ? <span ref={count}><Liczba value={`${D.postep.zrobione.wartosc}/${D.postep.razem.wartosc}`} unit={PL.paski.punkty} /></span> : null} style={bar(k2 + k3)}>
              <div ref={segments}>
                <Segmenty items={items} words={D.postep.slowa.wartosc} appear={() => 1} />
              </div>
            </Pasek>
            <Pasek band={BAND.cache} figure={<Liczba value={D.cache.koszt.wartosc} unit={D.cache.kosztJednostka.wartosc} />} style={bar(1 - k1 + k3)}>
              <WierszBaterii
                miary={D.cache.miary}
                dimOthers={1 - k3}
                grow={() => 1}
                target={TARGET}
                targetRef={battery}
                annotation={boxes ? (
                  <Adnotacja
                    box={boxes.battery}
                    noteRef={cacheNote}
                    ring={1}
                    arrow={1}
                    note={1}
                    used={D.cache.miary.find((m) => m.klucz === TARGET)?.wartosc.wartosc ?? ''}
                    left={D.cache.miary.find((m) => m.klucz === TARGET)?.zostalo.wartosc ?? 0}
                  />
                ) : null}
              />
            </Pasek>
          </div>
          <Prompt style={{ marginTop: 22 }} />
        </Okno>

        {plan ? (
          <>
            <Petla at={plan.at} w={plan.w} h={plan.h} drawn={ease(f, T.planRing, T.planRing + 30)} />
            <Strzalka from={{ x: planNoteAt.x + 200 * S, y: planNoteAt.y + 50 * S }} to={onTop(plan, 0.66)} drawn={ease(f, T.planNote + 8, T.planNote + 24)} bend={-0.3} />
          </>
        ) : null}
        <Karteczka noteRef={planNote} land={spring({ frame: f - T.planNote, fps, config: { damping: 13, mass: 0.9 } })} angle={-2} size={30 * S} style={{ left: planNoteAt.x, top: planNoteAt.y }}>
          {PL.paski.pytania[0]}
        </Karteczka>

        {seg ? (
          <>
            {answer ? <Petla at={answer.at} w={answer.w} h={answer.h} drawn={ease(f, T.progressRing, T.progressRing + 30)} /> : null}
            {answer ? <Strzalka from={{ x: progressNoteAt.x + 250 * S, y: progressNoteAt.y + 108 * S }} to={onTop(answer, 0.62)} drawn={ease(f, T.progressNote + 8, T.progressNote + 24)} bend={-0.3} /> : null}
            {items.length > 0 ? (
              <>
                {/* a tick over each point done, as the marker passes it */}
                {items.map((it, i) => it.status === 'done' ? (
                  <div key={i} style={{ position: 'absolute', left: seg.at.x + (i + 0.47) * segW, top: seg.at.y - 15 * S, transform: 'translateX(-50%)', fontFamily: FONT.ui, fontWeight: 700, fontSize: 12 * S, color: BAND.progress.color, opacity: c01((walked - i + 1) * 2) }}>✓</div>
                ) : null)}
                {/* the marker: walks the row of points, then fades */}
                <div style={{ position: 'absolute', left: seg.at.x + (walked + 0.47) * segW, top: seg.at.y + 8 * S + 3 * S, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: `${6 * S}px solid transparent`, borderRight: `${6 * S}px solid transparent`, borderBottom: `${8 * S}px solid ${BAND.panel.color}`, opacity: markerIn }} />
              </>
            ) : null}
          </>
        ) : null}
        {/* the progress, counted: laid out as the battery's note (calibration round 1 of E3) */}
        <Karteczka noteRef={progressNote} land={spring({ frame: f - T.progressNote, fps, config: { damping: 13, mass: 0.9 } })} angle={1.8} size={28 * S} style={{ left: progressNoteAt.x, top: progressNoteAt.y }}>
          <div>{PL.paski.postep.tytul}</div>
          <div style={{ marginTop: 6 * S, fontSize: 17.5 * S, lineHeight: 1.3, color: NOTE.ink }}>
            {D.postep.razem.wartosc > 0 ? (
              <><span style={{ color: NOTE.inkSoft }}>{PL.paski.postep.odhaczone}</span> <Cyfra>{D.postep.zrobione.wartosc}</Cyfra> {PL.paski.postep.z} <Cyfra>{D.postep.razem.wartosc}</Cyfra> {PL.paski.punkty}</>
            ) : <span style={{ color: NOTE.inkSoft }}>{D.postep.slowa.wartosc}</span>}
          </div>
          <div style={{ fontSize: 17.5 * S, lineHeight: 1.3, color: NOTE.ink }}>
            <span style={{ color: NOTE.inkSoft }}>{PL.paski.postep.plan}</span> <Cyfra>{D.plan.zamkniete.wartosc}</Cyfra> {PL.paski.postep.z} <Cyfra>{D.plan.etapy.wartosc}</Cyfra> {PL.paski.etapy}
          </div>
        </Karteczka>
      </div>
      <Napis text={PL.paski.napis2} from={T.napis2[0] ?? 0} to={T.napis2[1] ?? 0} />
      <Napis text={PL.paski.napisy[1] ?? ''} from={T.caption1[0] ?? 0} to={T.caption1[1] ?? 0} />
      <Napis text={PL.paski.napisy[0] ?? ''} from={T.caption2[0] ?? 0} to={T.caption2[1] ?? 0} />
    </AbsoluteFill>
  );
};
