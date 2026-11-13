import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('research is registered as a complete runtime, not only pure workflow helpers', () => {
  for (const file of ['../.claude-plugin/plugin.json', './hooks.json', './register.tsx', './ledger.ts', '../types/index.d.ts']) {
    assert.ok(fs.existsSync(new URL(file, import.meta.url)), `Missing research runtime: ${file}`)
  }
  const manifest = JSON.parse(fs.readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url)))
  assert.equal(manifest.name, 'relai-research')
  assert.equal(manifest.version, '0.1.0')
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('./hooks.json', import.meta.url))).modules, ['./register.tsx'])
})
