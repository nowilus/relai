// Loads the film's fonts from public/fonty/ (copied from docs/zasoby/fonts/ by skrypty/fonty.mjs)
// before the first frame is taken. Both subsets are needed for Polish: latin carries "ó",
// latin-ext carries "ą ć ę ł ń ś ź ż" (docs/zasoby/fonts/LICENCJE.md). No network request.
import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

type Face = { family: string, file: string, weight: string, range: string };

const FACES: readonly Face[] = [
  { family: 'Fraunces', file: 'fraunces-latin-wonk.woff2', weight: '100 900', range: LATIN },
  { family: 'Fraunces', file: 'fraunces-latin-ext-wonk.woff2', weight: '100 900', range: LATIN_EXT },
  { family: 'Hanken Grotesk', file: 'hanken-grotesk-latin.woff2', weight: '100 900', range: LATIN },
  { family: 'Hanken Grotesk', file: 'hanken-grotesk-latin-ext.woff2', weight: '100 900', range: LATIN_EXT },
  { family: 'Caveat', file: 'caveat-latin.woff2', weight: '400 700', range: LATIN },
  { family: 'Caveat', file: 'caveat-latin-ext.woff2', weight: '400 700', range: LATIN_EXT },
  { family: 'Kalam', file: 'kalam-700-latin.woff2', weight: '700', range: LATIN },
  { family: 'Kalam', file: 'kalam-700-latin-ext.woff2', weight: '700', range: LATIN_EXT },
];

const handle = delayRender('fonty z public/fonty');

/** Resolves once every face is in document.fonts: layout measured before this is measured wrong. */
export const fontsReady: Promise<void> = Promise.all(
  FACES.map(async (f) => {
    const face = new FontFace(f.family, `url(${staticFile('fonty/' + f.file)}) format('woff2')`, { weight: f.weight, unicodeRange: f.range });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((err: unknown) => cancelRender(new Error(`a film font did not load: ${err instanceof Error ? err.message : String(err)}`)));
