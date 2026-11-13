import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('userConfig preserves previously legal fractional values and all legacy keys', () => {
  const { userConfig } = JSON.parse(fs.readFileSync(new URL('../.claude-plugin/plugin.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(userConfig).sort(), ['ttlMin','guard','bigTokens','alerts','alertTokens','warnMin','keepWarmHours','maxLimitPercent','paybackTurns'].sort());
  for (const key of ['keepWarmHours', 'maxLimitPercent']) assert.ok(userConfig[key].min <= 0.001, key);
});
