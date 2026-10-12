// Fills the markers of the dictionary ({komendy}, {wersja}…) with the facts of the manifest. One
// function for the scenes and for the test of facts: what the test checks is what the frame shows.
// A marker without a fact is an error, never an empty place. No imports: Node loads this file as is.

export type Fakt<T> = { wartosc: T, zrodlo: string };
export type Wartosc = string | number | readonly string[];
export type Fakty = Readonly<Record<string, Fakt<Wartosc>>>;

const MARKER = /\{([A-Za-z]+)\}/g;

/** A list in Polish: "a, b i c". */
const lista = (v: readonly string[]): string =>
  v.length < 2 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} i ${v[v.length - 1]}`;

export function tekstFaktu(fakt: Fakt<Wartosc>): string {
  const v = fakt.wartosc;
  return Array.isArray(v) ? lista(v) : String(v);
}

/** The markers a text uses, in order. */
export const znaczniki = (tekst: string): string[] => [...tekst.matchAll(MARKER)].map((m) => m[1] ?? '');

export function wstaw(tekst: string, fakty: Fakty): string {
  return tekst.replace(MARKER, (_, klucz: string) => {
    const fakt = fakty[klucz];
    if (!fakt) throw new Error(`no fact for the marker {${klucz}} in: ${tekst}`);
    return tekstFaktu(fakt);
  });
}
