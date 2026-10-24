import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  firstSentence,
  parseFrontmatterDescription,
  collectFacts,
  checkVersions,
  serialize,
} from './fakty.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('liczbaKomend matches the independent count of command files', async () => {
  const dir = join(repoRoot, 'adapters', 'claude-code', 'commands');
  const count = readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  const facts = await collectFacts(repoRoot);
  assert.equal(facts.liczbaKomend, count);
  assert.equal(facts.liczbaKomend, facts.komendy.length);
});

test('wersje match marketplace.json read independently', async () => {
  const marketplace = JSON.parse(readFileSync(join(repoRoot, '.claude-plugin', 'marketplace.json'), 'utf8'));
  const facts = await collectFacts(repoRoot);
  assert.equal(Object.keys(facts.wersje).length, marketplace.plugins.length);
  for (const { name, version } of marketplace.plugins) {
    assert.equal(facts.wersje[name], version, name);
  }
});

test('adapters are the sorted directory names', async () => {
  const facts = await collectFacts(repoRoot);
  assert.deepEqual(facts.adaptery, ['claude-code', 'codex', 'cursor']);
  assert.equal(facts.liczbaAdapterow, facts.adaptery.length);
});

test('firstSentence: plain sentence', () => {
  assert.equal(firstSentence('Does a thing. Then more.'), 'Does a thing.');
});

test('firstSentence: em dash before the first period', () => {
  assert.equal(
    firstSentence('Reports on state — housekeeping and health — and stops. Use when asked.'),
    'Reports on state — housekeeping and health — and stops.',
  );
});

test('firstSentence: no terminal punctuation returns trimmed whole', () => {
  assert.equal(firstSentence('  no punctuation here  '), 'no punctuation here');
});

test('firstSentence: period inside a word is not a cut', () => {
  assert.equal(firstSentence('Visit relai.dev for more. Next.'), 'Visit relai.dev for more.');
  assert.equal(firstSentence('See relai.dev'), 'See relai.dev');
});

test('firstSentence: question and exclamation marks', () => {
  assert.equal(firstSentence('Ready? Go on.'), 'Ready?');
  assert.equal(firstSentence('Stop! Now.'), 'Stop!');
  assert.equal(firstSentence('Done.'), 'Done.');
});

test('parseFrontmatterDescription unescapes quotes and keeps Polish quotes', () => {
  const md = [
    '---',
    'description: "Says \\"hi\\" and a back\\\\slash. Use when „pomoc”, „help” — ok."',
    'argument-hint: "[x]"',
    '---',
    '',
    '# body',
    'description: "ignored"',
  ].join('\n');
  assert.equal(
    parseFrontmatterDescription(md),
    'Says "hi" and a back\\slash. Use when „pomoc”, „help” — ok.',
  );
});

test('parseFrontmatterDescription handles CRLF and rejects bad input', () => {
  assert.equal(parseFrontmatterDescription('---\r\ndescription: "A. B."\r\n---\r\n'), 'A. B.');
  assert.throws(() => parseFrontmatterDescription('no frontmatter'));
  assert.throws(() => parseFrontmatterDescription('---\ndescription: "x"\n'));
  assert.throws(() => parseFrontmatterDescription('---\nname: x\n---\n'));
  assert.throws(() => parseFrontmatterDescription('---\ndescription: "open\n---\n'));
});

test('collectFacts is deterministic and uses LF only', async () => {
  const first = await collectFacts(repoRoot);
  const second = await collectFacts(repoRoot);
  assert.deepEqual(first, second);
  const text = serialize(first);
  assert.equal(text, serialize(second));
  assert.ok(!text.includes('\r'));
  assert.ok(text.endsWith('}\n'));
});

test('checkVersions throws on a mismatch (positive control) and passes on a match', () => {
  const plugins = [{ name: 'relai', version: '3.2.0' }, { name: 'relai-panel', version: '0.20.0' }];
  assert.throws(
    () => checkVersions(plugins, { relai: '3.2.0', 'relai-panel': '0.19.0' }),
    /relai-panel.*0\.20\.0.*0\.19\.0/,
  );
  assert.doesNotThrow(() => checkVersions(plugins, { relai: '3.2.0' }));
  assert.doesNotThrow(() => checkVersions(plugins, { relai: '3.2.0', 'relai-panel': '0.20.0' }));
});

test('site/dane/fakty.json is what the generator writes today (run node site/narzedzia/fakty.mjs)', async () => {
  const committed = readFileSync(join(repoRoot, 'site', 'dane', 'fakty.json'), 'utf8').replace(/\r\n?/g, '\n');
  assert.equal(committed, serialize(await collectFacts(repoRoot)));
});

test('every marketplace plugin has its plugin.json checked against the marketplace version', async () => {
  const marketplace = JSON.parse(readFileSync(join(repoRoot, '.claude-plugin', 'marketplace.json'), 'utf8'));
  const source = readFileSync(join(repoRoot, 'site', 'narzedzia', 'fakty.mjs'), 'utf8');
  for (const { name } of marketplace.plugins) {
    assert.ok(source.includes(`'${name}': [`) || source.includes(`  ${name}: [`), `${name} missing from PLUGIN_JSON_PATHS`);
  }
});
