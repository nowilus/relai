// RelAI film: copies the fonts the film draws with from docs/zasoby/fonts/ (the only source, see
// its LICENCJE.md) to public/fonty/, where Remotion serves them through staticFile(). The copy is
// made before every render and checked byte for byte; public/fonty/ is outside git.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FROM = resolve(HERE, '../../../fonts');
const TO = resolve(HERE, '../public/fonty');

export const FONT_FILES = Object.freeze([
  'fraunces-latin-wonk.woff2',
  'fraunces-latin-ext-wonk.woff2',
  'hanken-grotesk-latin.woff2',
  'hanken-grotesk-latin-ext.woff2',
  'caveat-latin.woff2',
  'caveat-latin-ext.woff2',
  'kalam-700-latin.woff2',
  'kalam-700-latin-ext.woff2',
]);

const sha = (/** @type {string} */ p) => createHash('sha256').update(readFileSync(p)).digest('hex');

mkdirSync(TO, { recursive: true });
for (const name of FONT_FILES) {
  const src = join(FROM, name);
  const dst = join(TO, name);
  copyFileSync(src, dst);
  if (sha(src) !== sha(dst)) throw new Error(`font copy differs from its source: ${name}`);
}
process.stdout.write(`fonty: ${FONT_FILES.length} plików skopiowanych i zgodnych bajtowo\n`);
