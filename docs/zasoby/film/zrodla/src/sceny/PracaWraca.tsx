// Scene 5 of the film, "Praca wraca" (plan FILM_PREZENTACYJNY, section 5): the 5-hour limit fills
// past its threshold; relai-cache-keeper's card asks once — work on or save the work; "Zapisz pracę
// teraz" sends "zapisz pracę" and the save runs its steps (relai-core's limit-checkpoint.md) to
// ZAPIS GOTOWY, the cache bar says so; after the reset the bar offers "Wznów pracę" and a fresh
// chat starts from the resume file with "where we are". No figure of a session in the frame
// (Łukasz, 2026-10-12): the battery and the ruler show a share, the threshold is core/panel's
// default; the save row is the one real save on a screenshot. Words from sceny.json.
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame } from 'remotion';
import { BAND, BAR, CHIP, THEME, leftColor } from '../rdzen';
import { fontsReady } from '../fonty';
import { offsetWithin } from '../kamera';
import type { Punkt } from '../kamera';
import { FONT, SCALE, WINDOW } from '../tokeny';
import { useJezyk, useT } from '../jezyk';
import { wstaw } from '../fakty';
import type { Fakty } from '../fakty';
import manifest from '../dane/manifest.json';
import sceny from '../dane/sceny.json';
import type { DaneScen } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Okno } from './Okno';
import { Kursor, droga, klik } from './Kursor';
import { Pasek } from './Pasek';
import { Bateria } from './PasekCache';
import { Przycisk, U } from './panel/Czesci';

const F = manifest as unknown as Fakty;
const D = sceny as unknown as DaneScen;
const W = D.pracaWraca;
const PLAN = D.nowaSesja.plan.wartosc;

/** The beats of the scene in frames (30 fps, 600 frames). */
const T = Object.freeze({
  fill: [16, 112], // the limit fills past its threshold
  card: 116,
  pointerIn: 150,
  clickSave: 186,
  cardOut: [196, 206],
  phrase: 206,
  steps: 228, // the first step; one every STEP frames
  done: 312,
  saved: 324,
  reset: [366, 408], // the limit renews
  renewed: 402,
  buttons: 410,
  pointerBack: 420,
  clickResume: 446,
  fresh: [456, 468],
  resume: 470,
  where: 500,
  pointerOut: [460, 476],
  captions: [[18, 198], [214, 398], [452, 592]],
});
const STEP = 18;
const WIN = Object.freeze({ left: 190, top: 70, width: 1540, height: 800 });
const BAR_TEXT = 28; // the cache bar's words, larger than the pane's: the bar is what this scene is about
const USED = Object.freeze({ from: 0.62, over: 0.95, after: 0.03 }); // shares of the 5-hour limit used
const TRACK = 560;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const smooth = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
const rise = (k: number) => ({ opacity: k, transform: k < 1 ? `translateY(${(1 - k) * 14}px)` : undefined });

const body = (size: number, color: string = BAR.text, weight = 500) => ({ fontFamily: FONT.ui, fontSize: size, fontWeight: weight, color, lineHeight: 1.3 });

/** A message the person sent: a bubble on the right, as scene 4 draws the command. */
const Wyslane = ({ children, k }: { children: ReactNode, k: number }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', ...rise(k) }}>
    <div style={{ padding: '14px 24px', borderRadius: 18, background: WINDOW.promptBg, border: `1px solid ${WINDOW.promptEdge}`, ...body(30, BAR.text, 600), maxWidth: '100%' }}>{children}</div>
  </div>
);

/** The 5-hour limit: the battery of what is left, its label, a ruler of what is used with the threshold. */
const Limit = ({ used }: { used: number }) => {
  const slowa = useT();
  const jezyk = useJezyk();
  const prog = W.prog.wartosc / 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 * SCALE, whiteSpace: 'nowrap' }}>
      <div style={{ zoom: 1.7, display: 'flex' }}><Bateria fill={1 - used} color={leftColor((1 - used) * 100)} /></div>
      <span style={{ color: BAR.muted }}>{wstaw(slowa.pracaWraca.limit, F, jezyk)}</span>
      <div style={{ position: 'relative', width: TRACK, height: 10, borderRadius: 5, background: THEME.lineOff, marginLeft: 14, marginTop: 30 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${used * 100}%`, borderRadius: 5, background: used > prog ? BAND.cache.color : BAR.segment.done }} />
        <div style={{ position: 'absolute', left: `${prog * 100}%`, top: -8, width: 3, height: 26, marginLeft: -1.5, borderRadius: 2, background: BAR.text }} />
        <div style={{ position: 'absolute', left: `${prog * 100}%`, bottom: 18, transform: 'translateX(-60%)', ...body(24, BAR.text, 700) }}>{`${slowa.pracaWraca.prog} ${W.prog.wartosc} %`}</div>
      </div>
    </div>
  );
};

/** A step of the save, ticked. */
const Krok = ({ children, k, rowRef }: { children: ReactNode, k: number, rowRef?: Ref<HTMLDivElement> }) => (
  <div ref={rowRef} style={{ display: 'flex', gap: 16, alignItems: 'baseline', ...rise(k) }}>
    <span style={{ ...body(30, THEME.ok, 700), flexShrink: 0 }}>✓</span>
    <span style={{ ...body(30), minWidth: 0 }}>{children}</span>
  </div>
);

type Miary = { save: Punkt, resume: Punkt };

export const PracaWraca = () => {
  const slowa = useT();
  const jezyk = useJezyk();
  const f = useCurrentFrame();
  const stage = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Miary | null>(null);
  const [handle] = useState(() => delayRender('pomiar sceny 5'));

  useLayoutEffect(() => {
    let alive = true;
    fontsReady.then(() => {
      const st = stage.current;
      if (!alive || !st || !saveRef.current || !resumeRef.current) return;
      const center = (el: HTMLElement): Punkt => {
        const at = offsetWithin(el, st);
        return { x: at.x + Math.min(el.offsetWidth / 2, 160), y: at.y + el.offsetHeight / 2 };
      };
      setM({ save: center(saveRef.current), resume: center(resumeRef.current) });
      continueRender(handle);
    });
    return () => { alive = false; };
  }, [handle]);

  const used = f < (T.reset[0] ?? 0)
    ? USED.from + (USED.over - USED.from) * smooth(f, T.fill[0] ?? 0, T.fill[1] ?? 0)
    : USED.over + (USED.after - USED.over) * smooth(f, T.reset[0] ?? 0, T.reset[1] ?? 0);
  const cardIn = ease(f, T.card, T.card + 12) * (1 - ease(f, T.cardOut[0] ?? 0, T.cardOut[1] ?? 0));
  const savePress = klik(f, T.clickSave);
  const resumePress = klik(f, T.clickResume);
  const oldChat = 1 - ease(f, T.fresh[0] ?? 0, T.fresh[1] ?? 0);
  const savedRow = ease(f, T.saved, T.saved + 10);
  const renewed = ease(f, T.renewed, T.renewed + 8);
  const buttons = ease(f, T.buttons, T.buttons + 10) * (1 - ease(f, T.fresh[0] ?? 0, T.fresh[1] ?? 0));
  const row = f >= T.resume ? null : f >= T.renewed ? W.odnowiony.wartosc : f >= T.saved ? W.zapis.wartosc : null;

  const pointer = m ? droga(f, [
    [T.pointerIn, { x: 1560, y: 760 }],
    [T.clickSave - 6, m.save],
    [T.pointerBack, m.save],
    [T.clickResume - 6, m.resume],
    [T.pointerOut[1] ?? 0, { x: m.resume.x + 200, y: m.resume.y - 120 }],
  ]) : { x: 0, y: 0 };
  const pointerOpacity = ease(f, T.pointerIn - 10, T.pointerIn) * (1 - ease(f, T.clickSave + 16, T.clickSave + 28))
    + ease(f, T.pointerBack - 10, T.pointerBack) * (1 - ease(f, T.pointerOut[0] ?? 0, T.pointerOut[1] ?? 0));

  return (
    <AbsoluteFill>
      <Biurko />
      <div ref={stage} style={{ position: 'absolute', inset: 0 }}>
        <Okno left={WIN.left} top={WIN.top} width={WIN.width} height={WIN.height} entry={1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            {/* before the reset: the card, then the save */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 18, opacity: oldChat }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '22px 26px', borderRadius: 16, background: THEME.card, border: `1px solid ${THEME.line}`, ...rise(cardIn) }}>
                <div style={body(30, BAR.text, 700)}>{`${W.pytanie.wartosc} ${W.dalej.wartosc}`}</div>
                {W.opcje.wartosc.map((o, i) => (
                  <div key={o} ref={i === 1 ? saveRef : undefined} style={{ padding: '12px 18px', borderRadius: 10, background: i === 1 && savePress > 0 ? THEME.cardFeatured : WINDOW.promptBg, border: `1px solid ${i === 1 && f >= T.clickSave ? THEME.mark : WINDOW.promptEdge}`, ...body(28) }}>{o}</div>
                ))}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Wyslane k={ease(f, T.phrase, T.phrase + 12)}>{W.fraza.wartosc}</Wyslane>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {W.kroki.wartosc.map((k, i) => (
                    <Krok key={k} k={ease(f, T.steps + i * STEP, T.steps + 10 + i * STEP)}>
                      {k}
                      {i === W.kroki.wartosc.length - 1 ? <span style={{ color: BAR.muted, fontWeight: 400 }}>{` · ${W.plikWznowienia.wartosc}`}</span> : null}
                    </Krok>
                  ))}
                  <div style={{ ...body(30, BAND.progress.color, 700), letterSpacing: 1, ...rise(ease(f, T.done, T.done + 10)) }}>{W.gotowe.wartosc}</div>
                </div>
              </div>
            </div>
            {/* after "Wznów pracę": a fresh chat from the resume file */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Wyslane k={ease(f, T.resume, T.resume + 12)}>{W.wznow.wartosc}</Wyslane>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...rise(ease(f, T.where, T.where + 12)) }}>
                <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 44, color: BAR.text }}>{slowa.pracaWraca.gdzie}</div>
                <div style={body(30)}>
                  <b style={{ fontWeight: 700 }}>{`${PLAN.plan} · ${PLAN.etap}`}</b>
                  <span style={{ color: BAND.panel.color, fontWeight: 700 }}>{`  ${PLAN.status}  `}</span>
                  <span style={{ color: BAR.muted }}>{PLAN.nazwa}</span>
                </div>
              </div>
            </div>
          </div>

          {/* the cache bar: the limit, then the save's row and, after the reset, its buttons */}
          <Pasek band={BAND.cache} figure={null} style={{ padding: `${16 * SCALE}px ${16 * SCALE}px`, fontSize: BAR_TEXT }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Limit used={used} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 50 }}>
                {row ? (
                  <span style={{ padding: '8px 16px', borderRadius: 8, background: CHIP.ok.bg, color: CHIP.ok.color, fontWeight: 600, whiteSpace: 'nowrap', opacity: row === W.zapis.wartosc ? savedRow : renewed }}>{row}</span>
                ) : null}
                <div style={{ display: 'flex', gap: 10 * U, opacity: buttons }}>
                  <div ref={resumeRef}><Przycisk primary pressed={resumePress > 0 ? 1 - Math.abs(resumePress * 2 - 1) : 0} size={21}>{W.przyciski.wartosc[0]}</Przycisk></div>
                  <Przycisk size={21}>{W.przyciski.wartosc[1]}</Przycisk>
                </div>
              </div>
            </div>
          </Pasek>
          <div style={{ height: 74, borderRadius: 20, background: WINDOW.promptBg, border: `1px solid ${WINDOW.promptEdge}`, display: 'flex', alignItems: 'center', padding: '0 28px' }}>
            <div style={{ width: 2.5, height: 34, borderRadius: 2, background: WINDOW.caret }} />
          </div>
        </Okno>
        {m ? <Kursor at={pointer} click={Math.max(savePress, resumePress)} opacity={pointerOpacity} /> : null}
      </div>
      {T.captions.map(([a, b], i) => (
        <Napis key={i} text={wstaw(slowa.pracaWraca.napisy[i] ?? '', F, jezyk)} from={a ?? 0} to={b ?? 0} />
      ))}
    </AbsoluteFill>
  );
};
