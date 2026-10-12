// RelAI film: copies the RelAI mark and the commands' icons from docs/zasoby/branding/ (the only
// source) to public/znak/, where Remotion serves them through staticFile(). The copy is made before
// every render and checked byte for byte, as the fonts are; public/znak/ is outside git.

import { copyFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BRANDING = resolve(HERE, '../../../branding');
const TO = resolve(HERE, '../public/znak');

const sha = (/** @type {string} */ p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/** [source, name in public/znak/]: the mark, then one icon per command (ikony/<name>.svg). */
const files = [
  [join(BRANDING, 'logo.svg'), 'logo.svg'],
  ...readdirSync(join(BRANDING, 'ikony')).filter((f) => f.endsWith('.svg')).sort().map((f) => [join(BRANDING, 'ikony', f), `ikona-${f}`]),
];

mkdirSync(TO, { recursive: true });
for (const [src, name] of files) {
  const dst = join(TO, name);
  copyFileSync(src, dst);
  if (sha(src) !== sha(dst)) throw new Error(`mark copy differs from its source: ${name}`);
}
process.stdout.write(`znak: ${files.length} plików skopiowanych i zgodnych bajtowo\n`);
