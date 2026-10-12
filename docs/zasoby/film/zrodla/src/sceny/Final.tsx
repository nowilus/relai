// Scene 6 of the film, "Finał" (plan FILM_PREZENTACYJNY, section 5): the RelAI mark and the line,
// the project's figures from manifest.json (plans closed, commands, core tests, tools), the two
// install lines and the version, and the plan bar of the plan that made this film — paski.json,
// read from STATUS.md on the day of the render (case "Aktywny plan w filmie"). Figures in Hanken,
// which tells "1" from "I" (L-0174); they rise in whole, never counted up through figures no
// source holds. The last frame holds everything still.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAND, BAR } from '../rdzen';
import { DESK, FONT, INK, NOTE, WINDOW } from '../tokeny';
import { useJezyk, useT } from '../jezyk';
import { tekstFaktu, wstaw } from '../fakty';
import type { Fakty } from '../fakty';
import manifest from '../dane/manifest.json';
import dane from '../dane/paski.json';
import type { DanePaskow } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Liczba, Pasek, TrescPlanu } from './Pasek';

const F = manifest as unknown as Fakty;
const D = dane as DanePaskow;

/** The beats of the scene in frames (30 fps, 450 frames). */
const T = Object.freeze({
  mark: 4,
  line: 22,
  figures: 70, // the first figure; one every FIGURE_STEP frames
  install: 150,
  plan: 196,
  captions: [[18, 206], [222, 436]],
});
const FIGURE_STEP = 10;
const MARK = 250;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const rise = (k: number, by = 24) => ({ opacity: k, transform: k < 1 ? `translateY(${(1 - k) * by}px)` : undefined });

const fakt = (k: string): string => {
  const v = F[k];
  if (!v) throw new Error(`the manifest has no fact ${k}`);
  return tekstFaktu(v);
};

export const Final = () => {
  const slowa = useT();
  const jezyk = useJezyk();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const markIn = spring({ frame: f - T.mark, fps, config: { damping: 13, mass: 0.9 } });
  const markSettled = Math.abs(1 - markIn) < 0.001;
  const words = slowa.final.tytul.split(' ');
  const L = slowa.final.liczby;

  return (
    <AbsoluteFill>
      <Biurko />
      <AbsoluteFill style={{ padding: '56px 130px 170px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* the mark and the line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Img
            src={staticFile('znak/logo.svg')}
            style={{
              width: MARK,
              height: MARK,
              flexShrink: 0,
              opacity: Math.min(1, markIn * 2.5),
              clipPath: 'inset(15% 10% 19% 10% round 3%)',
              transform: markSettled ? undefined : `translateY(${(1 - markIn) * -240}px) rotate(${(1 - markIn) * -12}deg)`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.26em', fontFamily: FONT.serif, fontWeight: 600, fontSize: 88, lineHeight: 1.05, letterSpacing: -1.2, color: INK.title }}>
              {words.map((w, i) => {
                const k = ease(f, T.line + i * 5, T.line + 18 + i * 5);
                return <span key={i} style={{ display: 'inline-block', ...rise(k, 30) }}>{w}</span>;
              })}
            </div>
            <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 40, color: INK.margin, ...rise(ease(f, T.line + 30, T.line + 46)) }}>{wstaw(slowa.final.wersja, F, jezyk)}</div>
          </div>
        </div>

        {/* the project's figures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40 }}>
          {(Object.keys(L) as (keyof typeof L)[]).map((k, i) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 0, ...rise(ease(f, T.figures + i * FIGURE_STEP, T.figures + 16 + i * FIGURE_STEP)) }}>
              <div style={{ fontFamily: FONT.ui, fontWeight: 800, fontSize: 120, lineHeight: 1, color: INK.title, letterSpacing: -2 }}>{fakt(k)}</div>
              <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 36, color: INK.lead, whiteSpace: 'nowrap' }}>{wstaw(L[k], F, jezyk)}</div>
            </div>
          ))}
        </div>

        {/* how to install it, and the plan that made this film */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 40 }}>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 30px', borderRadius: 16, background: NOTE.paper, border: `1px solid ${NOTE.edge}`, boxShadow: INK.captionShadow, ...rise(ease(f, T.install, T.install + 14)) }}>
            <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 34, color: NOTE.accent }}>{slowa.final.instalacja}</div>
            {(F.instalacja?.wartosc as readonly string[]).map((l) => (
              <div key={l} style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 30, color: NOTE.ink, whiteSpace: 'nowrap' }}>{l}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', padding: '0 24px', borderRadius: WINDOW.radius, background: WINDOW.surface, border: `1px solid ${WINDOW.edge}`, boxShadow: DESK.shadow, ...rise(ease(f, T.plan, T.plan + 14)) }}>
            <Pasek band={BAND.panel} figure={<Liczba value={`${D.plan.zamkniete.wartosc}/${D.plan.etapy.wartosc}`} unit={slowa.paski.etapy} />} style={{ flex: 1, minWidth: 0, color: BAR.text, fontSize: 30 }}>
              <TrescPlanu plan={D.plan} statusColor={BAND.panel.color} />
            </Pasek>
          </div>
        </div>
      </AbsoluteFill>
      {T.captions.map(([a, b], i) => (
        <Napis key={i} text={wstaw(slowa.final.napisy[i] ?? '', F, jezyk)} from={a ?? 0} to={b ?? 0} />
      ))}
    </AbsoluteFill>
  );
};
