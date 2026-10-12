// The overflow check (E6): renders a composition with the input prop `kontrola` and gathers the
// line src/kontrola.tsx logs for each frame — no picture is taken (imageFormat "none"), Chromium
// lays the frame out and measures it. Prints every defect with its frame and exits 1 when there is
// one. The positive control (`--podloz`) plants an overflowing pill and must report it.
// Uses @remotion/bundler and @remotion/renderer, which @remotion/cli brings: no package added.
//
//   node skrypty/kontrola.mjs <Composition> [--co=<n>] [--podloz] [--od=<a>] [--do=<b>]
//   e.g. node skrypty/kontrola.mjs FilmEN --co=6
import { bundle } from '@remotion/bundler';
import { renderFrames, selectComposition } from '@remotion/renderer';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) {
  console.error('usage: node skrypty/kontrola.mjs <Composition> [--co=<n>] [--podloz] [--od=<a>] [--do=<b>]');
  process.exit(2);
}
const opt = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? Number(a.split('=')[1]) : d;
};
const tryb = args.includes('--podloz') ? 'podloz' : 'mierz';
const co = opt('co', 6);

const serveUrl = await bundle({ entryPoint: join(HERE, '..', 'src', 'index.ts') });
const inputProps = { kontrola: tryb };
const composition = await selectComposition({ serveUrl, id, inputProps });
const od = opt('od', 0);
const doo = opt('do', composition.durationInFrames - 1);
const out = mkdtempSync(join(tmpdir(), 'relai-film-kontrola-'));
const wyniki = new Map();
await renderFrames({
  composition,
  serveUrl,
  inputProps,
  outputDir: out,
  imageFormat: 'none',
  everyNthFrame: co,
  frameRange: [od, doo],
  onStart: () => undefined,
  onFrameUpdate: () => undefined,
  onBrowserLog: (log) => {
    const m = /^KONTROLA (.*)$/.exec(log.text);
    if (m) {
      const r = JSON.parse(m[1]);
      wyniki.set(r.klatka, r.wady);
    }
  },
});
rmSync(out, { recursive: true, force: true });

const klatki = [...wyniki.keys()].sort((a, b) => a - b);
const wady = klatki.flatMap((k) => wyniki.get(k).map((w) => ({ klatka: k, ...w })));
console.log(`${id} (${tryb}): ${klatki.length} klatek zmierzonych (co ${co}, ${od}-${doo}), wad: ${wady.length}`);
// grouped by defect: the text, its kind, the frames it shows in and its largest overflow
const grupy = new Map();
for (const w of wady) {
  const k = `${w.rodzaj}|${w.tekst}`;
  const g = grupy.get(k) ?? { ...w, klatki: [], o: 0 };
  g.klatki.push(w.klatka);
  g.o = Math.max(g.o, w.o);
  grupy.set(k, g);
}
for (const g of grupy.values()) console.log(`  ${g.rodzaj} o ${g.o} px — "${g.tekst}" — klatki ${g.klatki[0]}-${g.klatki[g.klatki.length - 1]} (${g.klatki.length})`);
if (klatki.length === 0) {
  console.log('  ZERO klatek zmierzonych — defekt instrumentu, nie wynik');
  process.exit(2);
}
process.exit(wady.length ? 1 : 0);
