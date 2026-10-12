// The order and the length of the film's seven scenes (plan FILM_PREZENTACYJNY, section 5 and
// Annexes A and B: scene 2 "Komendy" right after "Pamięć", the film's introduction). The seconds
// are the plan's estimate, set in E2 and in the annexes; the film's length is their sum, never a
// number of its own. No imports: Node loads this file as is (type stripping) for the tests of the
// film.

export type IdSceny = 'pamiec' | 'komendy' | 'paski' | 'panel' | 'nowaSesja' | 'pracaWraca' | 'final';

export type Scena = Readonly<{ id: IdSceny, tytul: string, sekundy: number }>;

/** Working titles: what the scene is called in the plan; the words on screen live in teksty.ts. */
export const SCENY: readonly Scena[] = Object.freeze([
  Object.freeze({ id: 'pamiec', tytul: 'Pamięć', sekundy: 12 }),
  // Annex B: fourteen commands, 3.5 s each
  Object.freeze({ id: 'komendy', tytul: 'Komendy', sekundy: 49 }),
  Object.freeze({ id: 'paski', tytul: 'Trzy paski', sekundy: 23 }),
  Object.freeze({ id: 'panel', tytul: 'Panel', sekundy: 30 }),
  Object.freeze({ id: 'nowaSesja', tytul: 'Etap w nowej sesji', sekundy: 20 }),
  Object.freeze({ id: 'pracaWraca', tytul: 'Praca wraca', sekundy: 20 }),
  Object.freeze({ id: 'final', tytul: 'Finał', sekundy: 15 }),
]);

export type Odcinek = Readonly<{ scena: Scena, od: number, klatki: number }>;

/** Each scene's first frame and length in frames, back to back from frame 0. */
export function odcinki(fps: number, sceny: readonly Scena[] = SCENY): readonly Odcinek[] {
  let od = 0;
  return sceny.map((scena) => {
    const klatki = Math.round(scena.sekundy * fps);
    const odcinek = Object.freeze({ scena, od, klatki });
    od += klatki;
    return odcinek;
  });
}

/** The film's length in frames: the sum of its scenes. */
export const dlugosc = (fps: number, sceny: readonly Scena[] = SCENY): number =>
  odcinki(fps, sceny).reduce((suma, o) => suma + o.klatki, 0);
