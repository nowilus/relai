// The words of a prop in scene 2 "Komendy": the command's icon and Polish name at the top of the
// frame (NAMES of core/panel, the real icon file — large, calibration round 1 of E5: "nazwy na
// górze ekranu, widoczne") and its slogan under the prop. Laid out by the browser. They rise once
// the camera has landed, stand still, and leave before it moves on (Annex B: 3.5 s a command).
import { Img, interpolate, staticFile } from 'remotion';
import type { CSSProperties } from 'react';
import { FONT, PROP } from '../../tokeny';
import { NAMES } from '../../rdzen';
import { PL } from '../../teksty';
import type { IdKomendy } from '../../komendy';

/** The beats of the words, in frames of the command's window (105 frames). */
export const PODPIS = Object.freeze({
  name: 6, // the name row rises over RISE frames
  words: 12, // the slogan's first word; one every WORD_STEP frames
  out: 95, // they leave over LEAVE frames
});
export const RISE = 10;
export const WORD_STEP = 1.2;
export const LEAVE = 8;

/** The frame of the window from which the name and the whole slogan stand still. */
export const stoiOd = (slogan: string): number => Math.ceil(Math.max(PODPIS.name + RISE, PODPIS.words + (slogan.split(' ').length - 1) * WORD_STEP + RISE));

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
const rise = (k: number, by: number): CSSProperties => ({ opacity: k, transform: k < 1 ? `translateY(${(1 - k) * by}px)` : undefined });

export const ikona = (id: IdKomendy): string => staticFile(`znak/ikona-${id.replace(/^relai-/, '')}.svg`);
export const nazwa = (id: IdKomendy): string => NAMES[id]?.[0] ?? '';
export const slogan = (id: IdKomendy): string => PL.komendy.slogany[id];

interface PodpisProps { id: IdKomendy, t: number, ostatni: boolean }

/** How far the words have left: 0 while they stand, 1 when gone (the last command keeps them). */
const odejscie = (t: number, ostatni: boolean): number => (ostatni ? 0 : ease(t, PODPIS.out, PODPIS.out + LEAVE));
const wyjdz = (leave: number): CSSProperties => (leave > 0 ? { opacity: 1 - leave, transform: `translateY(${-leave * 18}px)` } : {});

/** The icon and the name, large, at the top of the frame. */
export const Nazwa = ({ id, t, ostatni }: PodpisProps) => {
  const leave = odejscie(t, ostatni);
  if (t < PODPIS.name || leave >= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, ...wyjdz(leave) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, ...rise(ease(t, PODPIS.name, PODPIS.name + RISE), 24) }}>
        <Img src={ikona(id)} style={{ width: 96, height: 96, flexShrink: 0 }} />
        <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 84, lineHeight: 1.1, color: PROP.name, whiteSpace: 'nowrap' }}>{nazwa(id)}</div>
      </div>
    </div>
  );
};

/** The slogan under the prop, its words rising one after another. */
export const Slogan = ({ id, t, ostatni }: PodpisProps) => {
  const leave = odejscie(t, ostatni);
  if (t < PODPIS.words || leave >= 1) return null;
  const words = slogan(id).split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.26em', maxWidth: 1640, fontFamily: FONT.serif, fontWeight: 600, fontSize: 72, lineHeight: 1.08, letterSpacing: -0.8, color: PROP.slogan, ...wyjdz(leave) }}>
      {words.map((w, i) => {
        const a = PODPIS.words + i * WORD_STEP;
        return <span key={i} style={{ display: 'inline-block', ...rise(ease(t, a, a + RISE), 26) }}>{w}</span>;
      })}
    </div>
  );
};
