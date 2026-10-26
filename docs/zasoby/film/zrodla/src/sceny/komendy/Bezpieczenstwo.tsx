// Prop of "Bezpieczeństwo zależności" (relai-security). The project's packages ride one by one
// through the scanner's gate signed "Trivy"; each comes out with a sage tick, one with the clay tag
// "HIGH". The tag peels off and flies into the journal, where it becomes a clay line: a new HIGH
// finding is written down as a risk (relai-security.md, Krok 3). A mustard "!" stays on the
// package: nothing is updated here — that waits for a yes.
import type { CSSProperties, ReactNode } from 'react';
import { PROP } from '../../tokeny';
import { PL } from '../../teksty';
import { Cien, H, NapisNaRekwizycie, Ptaszek, STROKE, W, Wykrzyknik, arc, ease, glide, kreska, lerp, pop, wobble } from './rysunek';

const R = PL.komendy.rekwizyty;

/** The beats, in frames of the command's window (75 frames). */
const T = Object.freeze({
  gate: [0, 8],
  ride: [[6, 24], [18, 36], [30, 48]], // each package's trip through the gate
  tagOff: [50, 62], // the HIGH tag flies to the journal
  line: [60, 68], // and is written there
});

const FLOOR = 372; // the desk line the packages stand on
const BOX = Object.freeze({ w: 92, h: 80 });
// the gate: two posts and a beam with the scanner's name
const GATE = Object.freeze({ x: 305, w: 150, top: 168 }); // in the middle of the prop's box
const GATE_MID = GATE.x + GATE.w / 2;
// the packages: where each waits and where it ends; the middle one is the vulnerable one
const PACKAGES = Object.freeze([
  { from: 230, to: 712, flagged: false },
  { from: 130, to: 616, flagged: true },
  { from: 30, to: 520, flagged: false },
]);
// the journal on the desk, top left — over the packages' starting place, empty at the end
const BOOK = Object.freeze({ x: 20, y: 34, w: 176, h: 132 });
const TAG = Object.freeze({ w: 92, h: 40 });

const layer = (style: CSSProperties, children: ReactNode) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, ...style }}>{children}</div>
);

/** A package: a box with its tape, its centre bottom at (x, FLOOR). */
const Paczka = ({ x, lift = 0 }: { x: number, lift?: number }) => (
  <g transform={`translate(${x - BOX.w / 2} ${FLOOR - BOX.h - lift})`}>
    <rect x={0} y={0} width={BOX.w} height={BOX.h} rx={10} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
    <path d={`M 0 22 H ${BOX.w}`} {...kreska(PROP.ink, STROKE * 0.6)} />
    <rect x={BOX.w / 2 - 9} y={0} width={18} height={22} fill={PROP.mustard} stroke={PROP.ink} strokeWidth={STROKE * 0.5} />
  </g>
);

export const Bezpieczenstwo = ({ t }: { t: number }) => {
  const gate = ease(t, T.gate[0] ?? 0, T.gate[1] ?? 0);
  const tagOff = glide(t, T.tagOff[0] ?? 0, T.tagOff[1] ?? 0);
  const line = ease(t, T.line[0] ?? 0, T.line[1] ?? 0);

  const rides = PACKAGES.map((p, i) => {
    const [a, b] = T.ride[i] ?? [0, 0];
    const k = glide(t, a, b);
    const x = lerp(p.from, p.to, k);
    // the frame the package is under the gate's middle: its mark pops from there
    const at = a + (b - a) * 0.5;
    const hop = Math.sin(Math.min(1, Math.max(0, k)) * Math.PI) * 10;
    return { ...p, x, at, hop, mark: pop(t, at, at + 8) };
  });
  const flagged = rides.find((r) => r.flagged);
  // the scanner's light while a package is under it
  const scanning = rides.some((r) => Math.abs(r.x - GATE_MID) < GATE.w / 2);
  // one soft clay pulse while the vulnerable package is under the gate (case b7: no flashing)
  const alarm = flagged ? ease(t, flagged.at - 3, flagged.at + 1) * (1 - glide(t, flagged.at + 4, flagged.at + 18)) : 0;

  // the tag: on the flagged package, then along an arc into the journal, shrinking onto its line
  const tagHome: [number, number] = [flagged?.x ?? 0, FLOOR - BOX.h - 34 - (flagged?.hop ?? 0)];
  const tagBook: [number, number] = [BOOK.x + BOOK.w / 2, BOOK.y + 92];
  const [tx, ty] = arc(tagHome, [(tagHome[0] + tagBook[0]) / 2, BOOK.y - 60], tagBook, tagOff);
  // where the tag hung, a mustard "!" stays: the package waits for an update after a yes
  const flagMark = ease(t, T.tagOff[0] ?? 0, (T.tagOff[0] ?? 0) + 8);
  const tagScale = lerp(1, 0.55, tagOff) * (flagged?.mark ?? 0);
  const tagOpacity = 1 - ease(t, T.line[0] ?? 0, (T.line[0] ?? 0) + 4);
  const tagSwing = wobble(t, (flagged?.at ?? 0) + 6, 14) * 10;

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      {alarm > 0 ? (
        <div style={{ position: 'absolute', left: -560, top: -360, width: W + 1120, height: H + 720, opacity: alarm, background: `radial-gradient(ellipse at ${560 + GATE_MID}px ${360 + FLOOR - 100}px, ${PROP.alarm}, ${PROP.alarmEdge} 62%)` }} />
      ) : null}
      {layer({}, (
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          {/* the journal, lying open on the desk */}
          <Cien cx={BOOK.x + BOOK.w / 2} cy={BOOK.y + BOOK.h + 10} rx={BOOK.w * 0.55} ry={9} />
          <rect x={BOOK.x} y={BOOK.y} width={BOOK.w} height={BOOK.h} rx={12} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
          <path d={`M ${BOOK.x + BOOK.w / 2} ${BOOK.y + 6} V ${BOOK.y + BOOK.h - 6}`} {...kreska(PROP.ink, STROKE * 0.6)} />
          {[30, 56].map((dy) => (
            <g key={dy}>
              <path d={`M ${BOOK.x + 16} ${BOOK.y + dy} h ${BOOK.w / 2 - 30}`} {...kreska(PROP.inkSoft, STROKE * 0.6)} />
              <path d={`M ${BOOK.x + BOOK.w / 2 + 14} ${BOOK.y + dy} h ${BOOK.w / 2 - 30}`} {...kreska(PROP.inkSoft, STROKE * 0.6)} />
            </g>
          ))}
          {/* the new risk, written in clay where the tag landed */}
          {line > 0 ? <path d={`M ${BOOK.x + BOOK.w / 2 + 14} ${BOOK.y + 92} h ${(BOOK.w / 2 - 30) * line}`} {...kreska(PROP.clay, STROKE)} /> : null}
          {/* shadows of the packages and the gate's back post */}
          {rides.map((r, i) => <Cien key={i} cx={r.x} cy={FLOOR + 6} rx={BOX.w * 0.6} ry={9} opacity={1 - Math.min(1, r.hop / 20)} />)}
          <Cien cx={GATE_MID} cy={FLOOR + 6} rx={GATE.w * 0.7} ry={10} opacity={gate} />
          {/* the packages, riding through */}
          {rides.map((r, i) => <Paczka key={i} x={r.x} lift={r.hop} />)}
          {rides.filter((r) => !r.flagged).map((r, i) => <Ptaszek key={i} x={r.x} y={FLOOR - BOX.h / 2 + 8 - r.hop} r={22} k={r.mark} />)}
          {flagged ? <Wykrzyknik x={flagged.x} y={FLOOR - BOX.h / 2 + 8 - flagged.hop} r={22} k={flagMark} /> : null}
          {/* the gate over them: its posts, the beam and the scanner's light */}
          <g opacity={gate} transform={`translate(0 ${(1 - gate) * -30})`}>
            {scanning ? <rect x={GATE.x + 14} y={GATE.top + 54} width={GATE.w - 28} height={FLOOR - GATE.top - 54} fill={PROP.sage} opacity={0.22} /> : null}
            <rect x={GATE.x} y={GATE.top} width={16} height={FLOOR - GATE.top} rx={6} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
            <rect x={GATE.x + GATE.w - 16} y={GATE.top} width={16} height={FLOOR - GATE.top} rx={6} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
            <rect x={GATE.x - 22} y={GATE.top} width={GATE.w + 44} height={54} rx={12} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE} />
          </g>
        </svg>
      ))}
      <NapisNaRekwizycie x={GATE.x - 22} y={GATE.top + (1 - gate) * -30} w={GATE.w + 44} h={54} size={32} color={PROP.ink} style={{ opacity: gate }}>
        {R.trivy}
      </NapisNaRekwizycie>
      {/* the HIGH tag: on its package, then into the journal */}
      {tagScale > 0 && tagOpacity > 0 ? layer({
        transform: `translate(${tx - TAG.w / 2}px, ${ty - TAG.h / 2}px) rotate(${tagSwing}deg) scale(${tagScale})`,
        transformOrigin: `${TAG.w / 2}px ${TAG.h / 2}px`,
        opacity: tagOpacity,
        width: TAG.w,
        height: TAG.h,
      }, (
        <>
          <svg width={TAG.w} height={TAG.h} style={{ overflow: 'visible', position: 'absolute', left: 0, top: 0 }}>
            <rect x={0} y={0} width={TAG.w} height={TAG.h} rx={10} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={3} />
          </svg>
          <NapisNaRekwizycie x={0} y={0} w={TAG.w} h={TAG.h} size={24} color={PROP.paper}>
            {R.high}
          </NapisNaRekwizycie>
        </>
      )) : null}
    </div>
  );
};
