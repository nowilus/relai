'use strict';

// Skills bundled with the Codex and Cursor adapters (BEZPIECZENSTWO E5, risk 8): one explicit list
// instead of "every directory", so a work-in-progress skill never ships by accident. Each listed
// skill is copied with ALL its files and subdirectories (scripts, references, LICENSE, JSON), not
// only the .md files — a skill without its scripts is dead.

const fs = require('node:fs');
const path = require('node:path');

const BUNDLED_SKILL_NAMES = ['relai-core', 'relai-planning', 'trivy-scan', 'security-audit'];

// evals/ is test material for the skill author (cases with package.json and lockfiles), not
// something the agent reads at run time; copying it would add packages to every dependency scan.
const EXCLUDED_DIRS = new Set(['evals']);

// Relative POSIX paths of every file of one skill directory, sorted, without excluded directories.
function skillFiles(skillDir) {
  const found = [];
  const walk = (dir, rel) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = rel ? rel + '/' + entry.name : entry.name;
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), relPath);
      } else if (entry.isFile()) {
        found.push(relPath);
      }
    }
  };
  walk(skillDir, '');
  if (!found.includes('SKILL.md')) throw new Error('Brak SKILL.md w skillu: ' + skillDir);
  return found.sort();
}

module.exports = { BUNDLED_SKILL_NAMES, EXCLUDED_DIRS, skillFiles };
