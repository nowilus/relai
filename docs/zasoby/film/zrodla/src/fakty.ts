// Fills the markers of the dictionary ({komendy}, {wersja}…) with the facts of the manifest. One
// function for the scenes and for the test of facts: what the test checks is what the frame shows.
// A marker without a fact is an error, never an empty place. Since E6 two languages: a list of
// names is joined the way the language joins it ("a, b i c" / "a, b and c"), and a plural marker
// {komendy|komenda|komendy|komend} writes the noun form the fact's value takes — Polish one, few,
// many; English one, other — so "{komendy} komend" is right for any value, not only for 14.
// No imports: Node loads this file as is.

export type Fakt<T> = { wartosc: T, zrodlo: string };
export type Wartosc = string | number | readonly string[];
export type Fakty = Readonly<Record<string, Fakt<Wartosc>>>;
export type Jezyk = 'pl' | 'en';

const MARKER = /\{([A-Za-z]+)(?:\|([^}]*))?\}/g;

const SPOJNIK: Readonly<Record<Jezyk, string>> = Object.freeze({ pl: 'i', en: 'and' });

/** A list the way the language writes it: "a, b i c" / "a, b and c". */
const lista = (v: readonly string[], jezyk: Jezyk): string =>
  v.length < 2 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} ${SPOJNIK[jezyk]} ${v[v.length - 1]}`;

export function tekstFaktu(fakt: Fakt<Wartosc>, jezyk: Jezyk = 'pl'): string {
  const v = fakt.wartosc;
  return Array.isArray(v) ? lista(v, jezyk) : String(v);
}

/**
 * The noun form for a count: Polish has three (1 plan, 2–4 plany, 5+ planów, but 12–14 planów and
 * 22–24 plany), English two (1 plan, plans). An error for a value that is not a whole number or
 * for a marker with the wrong number of forms: never a guess.
 */
export function forma(n: number, formy: readonly string[], jezyk: Jezyk): string {
  if (!Number.isInteger(n) || n < 0) throw new Error(`a plural form needs a whole count, not ${n}`);
  const potrzeba = jezyk === 'pl' ? 3 : 2;
  if (formy.length !== potrzeba) throw new Error(`a ${jezyk} plural marker needs ${potrzeba} forms: ${formy.join('|')}`);
  if (jezyk === 'en') return (n === 1 ? formy[0] : formy[1]) ?? '';
  if (n === 1) return formy[0] ?? '';
  const d = n % 10;
  const s = n % 100;
  return (d >= 2 && d <= 4 && !(s >= 12 && s <= 14) ? formy[1] : formy[2]) ?? '';
}

/** The markers a text uses, in order (a plural marker counts as its fact's marker). */
export const znaczniki = (tekst: string): string[] => [...tekst.matchAll(MARKER)].map((m) => m[1] ?? '');

export function wstaw(tekst: string, fakty: Fakty, jezyk: Jezyk = 'pl'): string {
  return tekst.replace(MARKER, (_, klucz: string, formy: string | undefined) => {
    const fakt = fakty[klucz];
    if (!fakt) throw new Error(`no fact for the marker {${klucz}} in: ${tekst}`);
    if (formy === undefined) return tekstFaktu(fakt, jezyk);
    if (typeof fakt.wartosc !== 'number') throw new Error(`the plural marker {${klucz}|…} needs a number in: ${tekst}`);
    return forma(fakt.wartosc, formy.split('|'), jezyk);
  });
}
