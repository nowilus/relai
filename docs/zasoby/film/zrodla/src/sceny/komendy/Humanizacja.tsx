// Prop of "Humanizacja tekstu" (relai-humanize), from its icon — lines of text, a clay wave and a
// pencil. The original sheet stays on the desk; its copy slides out beside it and the pencil runs
// along the copy's clay wave, which straightens into an even ink line behind it: the same text
// without the AI habit. The fact guard ends it with a sage tick on the copy (relai-humanize.md,
// "next to the original", Step 7 "the fact guard").
import { PROP } from '../../tokeny';
import { Cien, H, Ptaszek, STROKE, W, ease, glide, kreska, lerp, pop, wobble } from './rysunek';

/** The beats, in frames of the command's window (75 frames). */
const T = Object.freeze({
  copy: [4, 18],
  pencilIn: [16, 24],
  write: [24, 46],
  pencilOut: [48, 58],
  tick: [50, 58],
});

// a sheet, in prop coordinates: its top left corner and size
const SHEET = Object.freeze({ w: 250, h: 300, y: 80 });
const LEFT_X = 85;
const RIGHT_X = 425;
// the lines written on a sheet, relative to its corner
const LINE_X0 = 34;
const LINE_X1 = SHEET.w - 34;
const LINES = Object.freeze([{ y: 56, end: 1 }, { y: 100, end: 0.7 }, { y: 236, end: 0.8 }]);
const WAVE_Y = 168;
const WAVE_AMP = 22;
const WAVE_LEN = 54; // the wave's period in prop units

/** The clay wave from x0 to x1 at the sheet's corner, `amp` high: a polyline of small steps. */
const wave = (ox: number, oy: number, x0: number, x1: number, amp: number): string => {
  if (x1 <= x0) return '';
  const steps = Math.max(2, Math.ceil((x1 - x0) / 4));
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const x = lerp(x0, x1, i / steps);
    return `${(ox + x).toFixed(1)} ${(oy + WAVE_Y + Math.sin(((x - LINE_X0) / WAVE_LEN) * Math.PI * 2) * amp).toFixed(1)}`;
  });
  return `M ${pts.join(' L ')}`;
};

/** A sheet with its written lines; the wave is drawn by the caller. */
const Arkusz = ({ x, rot = 0, fill = PROP.paper }: { x: number, rot?: number, fill?: string }) => (
  <g transform={`rotate(${rot} ${x + SHEET.w / 2} ${SHEET.y + SHEET.h / 2})`}>
    <rect x={x + 6} y={SHEET.y + 8} width={SHEET.w} height={SHEET.h} rx={16} fill={PROP.shadow} />
    <rect x={x} y={SHEET.y} width={SHEET.w} height={SHEET.h} rx={16} fill={fill} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
    {LINES.map((l) => (
      <path key={l.y} d={`M ${x + LINE_X0} ${SHEET.y + l.y} H ${x + lerp(LINE_X0, LINE_X1, l.end)}`} {...kreska(PROP.inkSoft, STROKE * 0.8)} />
    ))}
  </g>
);

/** The pencil of the icon, its tip at (0, 0), lying at the icon's slant. */
const Olowek = () => (
  <g transform="rotate(-56)">
    <path d="M 0 0 L 16 -12 L 120 -12 L 120 12 L 16 12 Z" fill={PROP.mustard} stroke={PROP.ink} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
    <path d="M 0 0 L 16 -12 L 16 12 Z" fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.8} strokeLinejoin="round" />
    <path d="M 120 -12 H 140 a 6 6 0 0 1 6 6 V 6 a 6 6 0 0 1 -6 6 H 120" fill={PROP.clay} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
    <path d="M 98 -12 V 12" {...kreska(PROP.ink, STROKE * 0.6)} />
  </g>
);

export const Humanizacja = ({ t }: { t: number }) => {
  const copy = glide(t, T.copy[0] ?? 0, T.copy[1] ?? 0);
  const write = glide(t, T.write[0] ?? 0, T.write[1] ?? 0);
  const pencilIn = ease(t, T.pencilIn[0] ?? 0, T.pencilIn[1] ?? 0);
  const pencilOut = glide(t, T.pencilOut[0] ?? 0, T.pencilOut[1] ?? 0);
  const tick = pop(t, T.tick[0] ?? 0, T.tick[1] ?? 0);

  // the copy slides out from under the original to the right, with a little settle
  const copyX = lerp(LEFT_X, RIGHT_X, copy);
  const copyRot = lerp(-2, 1.5, copy) + wobble(t, T.copy[1] ?? 0, 10) * 2;

  // the pencil: comes down onto the wave's start, runs along it, then lifts away to the right
  const penX = lerp(LINE_X0, LINE_X1, write);
  const tipX = RIGHT_X + penX;
  const tipY = SHEET.y + WAVE_Y + (write > 0 && write < 1 ? Math.sin(((penX - LINE_X0) / WAVE_LEN) * Math.PI * 2) * WAVE_AMP * 0.25 : 0);
  const penDx = lerp(90, 0, pencilIn) + pencilOut * 120;
  const penDy = lerp(-150, 0, pencilIn) - pencilOut * 170;
  const penOpacity = pencilIn * (1 - pencilOut);
  // behind the pencil the wave is ink and straight; ahead of it, still the clay wave
  const done = write > 0 ? penX : LINE_X0;

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={LEFT_X + SHEET.w / 2} cy={SHEET.y + SHEET.h + 24} rx={150} ry={12} />
        {copy > 0 ? <Cien cx={copyX + SHEET.w / 2} cy={SHEET.y + SHEET.h + 24} rx={150} ry={12} opacity={copy} /> : null}
        {/* the copy, under the original until it slides out */}
        <g transform={`rotate(${copyRot - 1.5} ${copyX + SHEET.w / 2} ${SHEET.y + SHEET.h / 2})`}>
          <Arkusz x={copyX} />
          {done > LINE_X0 ? <path d={`M ${copyX + LINE_X0} ${SHEET.y + WAVE_Y} H ${copyX + done}`} {...kreska(PROP.ink, STROKE * 0.9)} /> : null}
          <path d={wave(copyX, SHEET.y, done, LINE_X1, WAVE_AMP)} {...kreska(PROP.clay, STROKE * 0.9)} />
          <Ptaszek x={copyX + SHEET.w - 28} y={SHEET.y + SHEET.h - 26} r={34} k={tick} />
        </g>
        {/* the original stays where it is, its wave untouched */}
        <Arkusz x={LEFT_X} rot={-2} fill={PROP.paper2} />
        <g transform={`rotate(-2 ${LEFT_X + SHEET.w / 2} ${SHEET.y + SHEET.h / 2})`}>
          <path d={wave(LEFT_X, SHEET.y, LINE_X0, LINE_X1, WAVE_AMP)} {...kreska(PROP.clay, STROKE * 0.9)} />
        </g>
        {/* the pencil, over everything */}
        {penOpacity > 0 ? (
          <g transform={`translate(${tipX + penDx} ${tipY + penDy})`} opacity={Math.min(1, penOpacity * 2)}>
            <Olowek />
          </g>
        ) : null}
      </svg>
    </div>
  );
};
