// Scene 4 of the film, "Etap w nowej sesji" (plan FILM_PREZENTACYJNY, section 5): the panel's card
// "Do potwierdzenia" for the start of E4 — rows computed by core/panel's stageCard() (sceny.json) —
// the pointer says "Tak"; the panel says the new session is open; the panel's window steps back
// as the conversation that stays, and the new session lands with the command waiting in its field.
// Enter: the command goes and the plan bar turns to W TOKU. (No progress bar: its calm line would
// quote the stage's first point, which names the card's warning — not in the film, Łukasz E4.) The old conversation is still on the desk at the end, with a note saying so.
import { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAND, BAR, THEME } from '../rdzen';
import { fontsReady } from '../fonty';
import { offsetWithin } from '../kamera';
import type { Punkt } from '../kamera';
import { FONT, WINDOW } from '../tokeny';
import { PL } from '../teksty';
import sceny from '../dane/sceny.json';
import type { DaneScen, DanePaskow, FaktKarty } from '../dane/typy';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Okno } from './Okno';
import { Karteczka } from './Karteczka';
import { Kursor, droga, klik } from './Kursor';
import { Liczba, Pasek, TrescPlanu } from './Pasek';
import { Naglowek, Przycisk, U, tekst } from './panel/Czesci';

const S = (sceny as unknown as DaneScen).nowaSesja;

/** The beats of the scene in frames (30 fps, 600 frames). */
const T = Object.freeze({
  rows: 22, // the card's first row; one row every ROW_STEP frames
  pointerIn: 104,
  clickYes: 172,
  opened: 186,
  back: [232, 276], // the panel's window steps back
  newIn: 256,
  enter: 334,
  planBar: 362,
  note: 452,
  pointerOut: [196, 214],
  captions: [[18, 222], [246, 436], [446, 592]],
});
const ROW_STEP = 6;
const TEXT = 20; // the card's text in the panel's px: larger than the pane's 16, read on a phone too
const WIN = Object.freeze({ left: 130, top: 46, width: 1660, height: 880, pad: 34 });
// where the panel's window rests once it has stepped back: the conversation that stays
const BACK = Object.freeze({ x: 70, y: 70, scale: 0.5 });
const NEW = Object.freeze({ left: 820, top: 270, width: 1030, height: 560 });

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const smooth = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });

const toneColor = (ton: FaktKarty['ton']) => (ton === 'warn' ? THEME.accentText : ton === 'ok' ? THEME.ok : THEME.title);

/** The plan of the new session as the bars read it: the shape of paski.json's plan. */
const fact = <T,>(wartosc: T) => ({ wartosc, zrodlo: S.plan.zrodlo });
const PLAN: DanePaskow['plan'] = {
  plan: fact(S.plan.wartosc.plan),
  etap: fact(S.plan.wartosc.etap),
  status: fact(S.plan.wartosc.status),
  nazwa: fact(S.plan.wartosc.nazwa),
  zamkniete: fact(S.plan.wartosc.zamkniete),
  etapy: fact(S.plan.wartosc.etapy),
};

/** A row of the card: the label in mustard, the value in the color of its tone ("⚠ " when warn). */
const Wiersz = ({ f, k }: { f: FaktKarty, k: number }) => (
  <div style={{ display: 'flex', gap: 12 * U, opacity: k, transform: `translateY(${(1 - k) * 10}px)` }}>
    <div style={{ ...tekst(TEXT, THEME.mark, 700), width: 190 * U, flexShrink: 0 }}>{f.etykieta}</div>
    <div style={{ ...tekst(TEXT, toneColor(f.ton)), minWidth: 0 }}>{(f.ton === 'warn' ? '⚠ ' : '') + f.wartosc}</div>
  </div>
);

export const NowaSesja = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stage = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLDivElement>(null);
  const [yes, setYes] = useState<Punkt | null>(null);
  const [handle] = useState(() => delayRender('pomiar karty'));

  useLayoutEffect(() => {
    let alive = true;
    fontsReady.then(() => {
      const st = stage.current;
      const el = yesRef.current;
      if (!alive || !st || !el) return;
      const at = offsetWithin(el, st);
      setYes({ x: at.x + el.offsetWidth / 2, y: at.y + el.offsetHeight / 2 });
      continueRender(handle);
    });
    return () => { alive = false; };
  }, [handle]);

  const back = smooth(f, T.back[0] ?? 0, T.back[1] ?? 0);
  const scale = 1 + (BACK.scale - 1) * back;
  const dx = (BACK.x - WIN.left * BACK.scale) * back;
  const dy = (BACK.y - WIN.top * BACK.scale) * back;
  const cardOut = ease(f, T.opened - 4, T.opened + 6);
  const openedIn = ease(f, T.opened, T.opened + 10);
  const press = klik(f, T.clickYes);

  const newIn = spring({ frame: f - T.newIn, fps, config: { damping: 18, mass: 0.9 } });
  const sent = ease(f, T.enter, T.enter + 12);
  const planIn = ease(f, T.planBar, T.planBar + 12);

  const pointer = yes ? droga(f, [[T.pointerIn, { x: 1520, y: 900 }], [T.clickYes - 6, yes], [T.pointerOut[1] ?? 0, { x: yes.x + 220, y: yes.y + 120 }]]) : { x: 0, y: 0 };
  const pointerOpacity = ease(f, T.pointerIn - 10, T.pointerIn) * (1 - ease(f, T.pointerOut[0] ?? 0, T.pointerOut[1] ?? 0));

  const bar = (k: number) => ({ opacity: k, transform: k < 1 ? `translateY(${(1 - k) * 14}px)` : undefined });

  return (
    <AbsoluteFill>
      <Biurko />
      <div ref={stage} style={{ position: 'absolute', inset: 0 }}>
        {/* the panel's window; once "Tak" is said it steps back, the conversation that stays */}
        <div style={{ position: 'absolute', inset: 0, transform: back > 0 ? `translate(${dx}px, ${dy}px) scale(${scale})` : undefined, transformOrigin: '0 0' }}>
          <Okno left={WIN.left} top={WIN.top} width={WIN.width} height={WIN.height} padding={`${WIN.pad}px ${WIN.pad + 8}px`} entry={1} style={{ display: 'flex', flexDirection: 'column', gap: 20 * U }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 34 * U }}>
              <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 44 * U, lineHeight: 1.1, color: THEME.accent, whiteSpace: 'nowrap' }}>{PL.panel.tytul}</div>
              <div style={{ display: 'flex', gap: 10 * U }}>
                {PL.panel.zakladki.map((t, i) => <Przycisk key={t} primary={i === 0} size={17}>{t}</Przycisk>)}
              </div>
            </div>
            <Naglowek>{S.naglowek.wartosc}</Naglowek>
            <div style={tekst(TEXT, THEME.body)}>{S.podpis.wartosc}</div>
            <div style={{ position: 'relative' }}>
              {/* the card while it waits for "Tak" */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14 * U,
                  padding: `${18 * U}px ${24 * U}px`,
                  borderRadius: 10 * U,
                  border: `${1.4 * U}px solid ${THEME.accent}`,
                  background: THEME.cardOn,
                  opacity: 1 - cardOut,
                }}
              >
                <div style={{ ...tekst(TEXT + 2, THEME.accentText, 700), whiteSpace: 'nowrap' }}>{S.tytul.wartosc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * U }}>
                  {S.fakty.wartosc.map((r, i) => <Wiersz key={r.etykieta} f={r} k={ease(f, T.rows + i * ROW_STEP, T.rows + 10 + i * ROW_STEP)} />)}
                </div>
                <div style={{ ...tekst(TEXT + 2, THEME.title, 700), opacity: ease(f, T.rows + 40, T.rows + 52) }}>{S.pytanie.wartosc}</div>
                <div style={{ display: 'flex', gap: 10 * U, opacity: ease(f, T.rows + 46, T.rows + 58) }}>
                  <div ref={yesRef}><Przycisk primary pressed={press > 0 ? 1 - Math.abs(press * 2 - 1) : 0} size={TEXT}>{PL.nowaSesja.tak}</Przycisk></div>
                  <Przycisk size={TEXT}>{PL.nowaSesja.nie}</Przycisk>
                </div>
              </div>
              {/* after "Tak": the panel's line that the session is open */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, ...tekst(TEXT + 2, THEME.ok, 600), opacity: openedIn, transform: `translateY(${(1 - openedIn) * 10}px)` }}>
                {`✓ ${S.otwarto.wartosc}`}
              </div>
            </div>
          </Okno>
        </div>
        <Karteczka land={spring({ frame: f - T.note, fps, config: { damping: 13, mass: 0.9 } })} angle={-2.5} size={58} style={{ left: 150, top: 470 }}>
          {S.zostaje.wartosc}
        </Karteczka>

        {/* the new session: the command waits in its field; Enter sends it and the stage starts */}
        {f >= T.newIn - 2 ? (
          <Okno left={NEW.left} top={NEW.top} width={NEW.width} height={NEW.height} entry={newIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, color: BAR.muted, letterSpacing: 0.2 }}>{PL.nowaSesja.okno}</div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <div style={{ padding: '14px 24px', borderRadius: 18, background: WINDOW.promptBg, border: `1px solid ${WINDOW.promptEdge}`, color: BAR.text, fontFamily: FONT.ui, fontWeight: 600, fontSize: 30, whiteSpace: 'nowrap', opacity: sent, transform: `translateY(${(1 - sent) * 60}px)` }}>
                {S.komenda.wartosc}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={bar(planIn)}>
                <Pasek band={BAND.panel} figure={<Liczba value={`${PLAN.zamkniete.wartosc}/${PLAN.etapy.wartosc}`} unit={PL.paski.etapy} />}>
                  <TrescPlanu plan={PLAN} statusColor={BAND.panel.color} />
                </Pasek>
              </div>
            </div>
            <div style={{ height: 74, borderRadius: 20, background: WINDOW.promptBg, border: `1px solid ${WINDOW.promptEdge}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 28px' }}>
              <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 30, color: BAR.text, whiteSpace: 'nowrap', opacity: 1 - sent }}>{S.komenda.wartosc}</div>
              <div style={{ width: 2.5, height: 34, borderRadius: 2, background: WINDOW.caret, opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0.25 }} />
            </div>
          </Okno>
        ) : null}

        {yes ? <Kursor at={pointer} click={press} opacity={pointerOpacity} /> : null}
      </div>
      {T.captions.map(([a, b], i) => (
        <Napis key={i} text={PL.nowaSesja.napisy[i] ?? ''} from={a ?? 0} to={b ?? 0} />
      ))}
    </AbsoluteFill>
  );
};
