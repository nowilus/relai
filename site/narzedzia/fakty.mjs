// Deterministic facts for the RelAI website: command list, adapters, plugin versions.
// Run from anywhere: node site/narzedzia/fakty.mjs  ->  writes site/dane/fakty.json
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const OUTPUT_PATH = join(REPO_ROOT, 'site', 'dane', 'fakty.json');

const PLUGIN_JSON_PATHS = Object.freeze({
  relai: ['.claude-plugin', 'plugin.json'],
  'relai-panel': ['panel', '.claude-plugin', 'plugin.json'],
  'relai-progress': ['progress', '.claude-plugin', 'plugin.json'],
  'relai-cache-keeper': ['cache-keeper', '.claude-plugin', 'plugin.json'],
});

function readText(path) {
  if (!existsSync(path)) throw new Error(`Missing file: ${path}`);
  return readFileSync(path, 'utf8').replace(/\r\n?/g, '\n');
}

function readJson(path) {
  const text = readText(path);
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON in ${path}: ${err.message}`);
  }
}

/** Text up to and including the first . ! or ? followed by whitespace or end; else the trimmed whole. */
export function firstSentence(text) {
  const trimmed = String(text).trim();
  const match = /[.!?](?=\s|$)/.exec(trimmed);
  return match ? trimmed.slice(0, match.index + 1) : trimmed;
}

/** Returns the unescaped `description:` value from the YAML frontmatter, or throws. */
export function parseFrontmatterDescription(markdown) {
  const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
  if (lines[0] !== '---') throw new Error('Frontmatter must start with ---');
  const end = lines.indexOf('---', 1);
  if (end === -1) throw new Error('Frontmatter is not closed with ---');
  const line = lines.slice(1, end).find((l) => l.startsWith('description:'));
  if (line === undefined) throw new Error('Frontmatter has no description field');
  const raw = line.slice('description:'.length).trim();
  if (!raw.startsWith('"')) {
    if (raw === '') throw new Error('Frontmatter description is empty');
    return raw;
  }
  let out = '';
  for (let i = 1; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '\\' && (raw[i + 1] === '"' || raw[i + 1] === '\\')) {
      out += raw[i + 1];
      i += 1;
    } else if (ch === '"') {
      if (raw.slice(i + 1).trim() !== '') throw new Error('Unexpected text after closing quote in description');
      return out;
    } else {
      out += ch;
    }
  }
  throw new Error('Unterminated quoted description');
}

/** Throws when a marketplace version differs from the plugin's own plugin.json version. */
export function checkVersions(marketplacePlugins, pluginJsonVersions) {
  for (const { name, version } of marketplacePlugins) {
    const own = pluginJsonVersions[name];
    if (own === undefined) continue;
    if (own !== version) {
      throw new Error(`Version mismatch for ${name}: marketplace.json has ${version}, plugin.json has ${own}`);
    }
  }
}

function collectVersions(repoRoot) {
  const marketplacePath = join(repoRoot, '.claude-plugin', 'marketplace.json');
  const marketplace = readJson(marketplacePath);
  if (!Array.isArray(marketplace.plugins)) throw new Error(`No plugins array in ${marketplacePath}`);
  const plugins = marketplace.plugins.map(({ name, version }) => {
    if (typeof name !== 'string' || typeof version !== 'string') {
      throw new Error(`Plugin entry without name/version in ${marketplacePath}`);
    }
    return { name, version };
  });

  const pluginJsonVersions = {};
  for (const [name, parts] of Object.entries(PLUGIN_JSON_PATHS)) {
    const own = readJson(join(repoRoot, ...parts));
    if (typeof own.version === 'string') pluginJsonVersions[name] = own.version;
  }
  checkVersions(plugins, pluginJsonVersions);

  return Object.fromEntries(plugins.map(({ name, version }) => [name, version]));
}

function collectCommands(repoRoot, names) {
  const dir = join(repoRoot, 'adapters', 'claude-code', 'commands');
  if (!existsSync(dir)) throw new Error(`Missing directory: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  return files.map((file) => {
    const path = join(dir, file);
    const nazwa = file.slice(0, -'.md'.length);
    let description;
    try {
      description = parseFrontmatterDescription(readText(path));
    } catch (err) {
      throw new Error(`${path}: ${err.message}`);
    }
    const pl = Object.hasOwn(names, nazwa) ? names[nazwa] : undefined;
    if (!pl) throw new Error(`Command ${nazwa} is missing from NAMES in core/panel/theme.mjs`);
    return { nazwa, opisEn: firstSentence(description), nazwaPl: pl[0], opisPl: pl[1] };
  });
}

function collectAdapters(repoRoot) {
  const dir = join(repoRoot, 'adapters');
  if (!existsSync(dir)) throw new Error(`Missing directory: ${dir}`);
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export async function collectFacts(repoRoot = REPO_ROOT) {
  const themePath = join(repoRoot, 'core', 'panel', 'theme.mjs');
  if (!existsSync(themePath)) throw new Error(`Missing file: ${themePath}`);
  const { NAMES } = await import(pathToFileURL(themePath).href);
  const komendy = collectCommands(repoRoot, NAMES);
  const adaptery = collectAdapters(repoRoot);
  return {
    liczbaKomend: komendy.length,
    liczbaAdapterow: adaptery.length,
    adaptery,
    wersje: collectVersions(repoRoot),
    komendy,
  };
}

export function serialize(facts) {
  return JSON.stringify(facts, null, 2) + '\n';
}

export async function main() {
  const facts = await collectFacts(REPO_ROOT);
  const body = serialize(facts);
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, body, 'utf8');
  const versions = Object.entries(facts.wersje).map(([n, v]) => `${n} ${v}`).join(', ');
  console.log(`fakty.json: ${facts.liczbaKomend} commands; ${versions}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
