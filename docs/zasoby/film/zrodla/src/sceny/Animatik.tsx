// The animatic of the whole film (plan FILM_PREZENTACYJNY, E2): the six scenes of scenariusz.ts in
// their order and length — scene 2 is the finished "Paski", followed by a board for the rest of its
// time; every other scene is a raw board. Each scene comes in over the end of the one before it,
// by a crossfade or a reveal from the left, so the film's length stays the sum of its scenes.
// Opacity and clip only: no flash, no jump of brightness (case b7 of the plan).
import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { FILM, FONT, INK } from '../tokeny';
import { PL } from '../teksty';
import { odcinki } from '../scenariusz';
import type { IdSceny, Odcinek } from '../scenariusz';
import { tekstFaktu, wstaw } from '../fakty';
import type { Fakty } from '../fakty';
import manifest from '../dane/manifest.json';
import dane from '../dane/paski.json';
import type { DanePaskow } from '../dane/typy';
import { Paski } from './Paski';
import { Biurko } from './Biurko';
import { Kafle, Liczba, Plansza } from './Plansza';

const F = manifest as unknown as Fakty;
const D = dane as DanePaskow;
const OVERLAP = 18; // frames a scene comes in over the one before it
type Wejscie = 'przenikanie' | 'odslona';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const smooth = (t: number) => t * t * (3 - 2 * t);
const HALF = OVERLAP / 2;

/**
 * A scene's way in and out. A reveal wipes the new scene over the old one. A crossfade goes through
 * the desk: the old scene fades to paper over the first half of the overlap (`wyjscie`: the frame
 * of the scene where its successor starts, when the successor comes by crossfade), the new one
 * rises from it over the second — two pictures are never on top of each other.
 */
const Wejdz = ({ jak, wyjscie = null, children }: { jak: Wejscie | null, wyjscie?: number | null, children: ReactNode }) => {
  const frame = useCurrentFrame();
  const k = jak === null ? 1 : jak === 'przenikanie'
    ? interpolate(frame, [HALF, OVERLAP], [0, 1], { ...clamp, easing: smooth })
    : interpolate(frame, [0, OVERLAP], [0, 1], { ...clamp, easing: smooth });
  const out = wyjscie === null ? 0 : interpolate(frame, [wyjscie, wyjscie + HALF], [0, 1], { ...clamp, easing: smooth });
  const done = k >= 1;
  const opacity = (jak === 'przenikanie' && !done ? k : 1) * (1 - out);
  return (
    <AbsoluteFill
      style={{
        opacity: opacity < 1 ? opacity : undefined,
        clipPath: jak === 'odslona' && !done ? `inset(0 ${(1 - k) * 100}% 0 0)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const napisy = (lista: readonly string[]) => lista.map((t) => wstaw(t, F));

/** The board of each scene but the finished part of scene 2. */
function plansza(id: IdSceny, sekundy: number): ReactNode {
  switch (id) {
    case 'pamiec':
      return (
        <Plansza tytul={PL.pamiec.tytul} ekran={PL.pamiec.ekran} napisy={napisy(PL.pamiec.napisy)} sekundy={sekundy}>
          <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 56, color: INK.note }}>{PL.pamiec.notatka}</div>
          <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 84, color: INK.captionBg, textAlign: 'center' }}>{PL.pamiec.haslo}</div>
        </Plansza>
      );
    case 'paski':
      return <Plansza tytul={PL.paski.tytul} ekran={PL.paski.ciagDalszy} napisy={napisy(PL.paski.napisy)} sekundy={sekundy} />;
    case 'panel':
      return (
        <Plansza tytul={PL.panel.tytul} ekran={PL.panel.ekran} napisy={napisy(PL.panel.napisy)} sekundy={sekundy}>
          <Kafle slowa={PL.panel.zakladki} duze />
        </Plansza>
      );
    case 'nowaSesja':
      return (
        <Plansza tytul={PL.nowaSesja.tytul} ekran={PL.nowaSesja.ekran} napisy={napisy(PL.nowaSesja.napisy)} sekundy={sekundy}>
          <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 72, color: INK.captionBg }}>{PL.nowaSesja.pytanie}</div>
          <Kafle slowa={[PL.nowaSesja.tak, PL.nowaSesja.nie]} duze />
        </Plansza>
      );
    case 'pracaWraca':
      return (
        <Plansza tytul={PL.pracaWraca.tytul} ekran={PL.pracaWraca.ekran} napisy={napisy(PL.pracaWraca.napisy)} sekundy={sekundy}>
          <Kafle slowa={[PL.pracaWraca.zapisz, PL.pracaWraca.wznow]} duze />
        </Plansza>
      );
    case 'final': {
      const L = PL.final.liczby;
      const pasek = [D.plan.plan.wartosc, D.plan.etap.wartosc, D.plan.status.wartosc].join(' · ');
      return (
        <Plansza tytul={PL.final.tytul} ekran={PL.final.ekran} napisy={napisy(PL.final.napisy)} sekundy={sekundy}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 90 }}>
            {(Object.keys(L) as (keyof typeof L)[]).map((k) => {
              const fakt = F[k];
              if (!fakt) throw new Error(`the manifest has no fact ${k}`);
              return <Liczba key={k} wartosc={tekstFaktu(fakt)} slowa={L[k]} />;
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Kafle slowa={F.instalacja?.wartosc as readonly string[]} />
            <Kafle slowa={[wstaw(PL.final.wersja, F), pasek]} />
          </div>
        </Plansza>
      );
    }
  }
}

/** How scene `i` comes in: the first cuts in, then crossfade and reveal by turns. */
const wejscie = (i: number): Wejscie | null => (i === 0 ? null : i % 2 === 1 ? 'przenikanie' : 'odslona');

/** Scene 2: the finished bars for their length, then a board for the rest of the scene's time. */
function scenaPaskow(o: Odcinek, jak: Wejscie | null, dalej: Wejscie | null): ReactNode {
  const gotowe = Math.min(FILM.paskiFrames, o.klatki);
  const reszta = o.klatki - gotowe;
  const ostatnia = dalej === null;
  return (
    <>
      <Sequence from={o.od} durationInFrames={gotowe + (reszta > 0 || !ostatnia ? OVERLAP : 0)} name="paski (gotowe)">
        <Wejdz jak={jak} wyjscie={reszta > 0 ? gotowe : dalej === 'przenikanie' ? gotowe : null}><Paski /></Wejdz>
      </Sequence>
      {reszta > 0 ? (
        <Sequence from={o.od + gotowe} durationInFrames={reszta + (ostatnia ? 0 : OVERLAP)} name="paski (plansza)">
          <Wejdz jak="przenikanie" wyjscie={dalej === 'przenikanie' ? reszta : null}>{plansza('paski', o.scena.sekundy)}</Wejdz>
        </Sequence>
      ) : null}
    </>
  );
}

export const Animatik = () => {
  const lista = odcinki(FILM.fps);
  return (
    <AbsoluteFill>
      {/* the paper under every scene: a crossfade goes through it, never through black */}
      <Biurko />
      {lista.map((o, i) => {
        const jak = wejscie(i);
        const dalej = i === lista.length - 1 ? null : wejscie(i + 1);
        if (o.scena.id === 'paski') return <AbsoluteFill key={o.scena.id}>{scenaPaskow(o, jak, dalej)}</AbsoluteFill>;
        return (
          <Sequence key={o.scena.id} from={o.od} durationInFrames={o.klatki + (dalej === null ? 0 : OVERLAP)} name={o.scena.tytul}>
            <Wejdz jak={jak} wyjscie={dalej === 'przenikanie' ? o.klatki : null}>{plansza(o.scena.id, o.scena.sekundy)}</Wejdz>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
