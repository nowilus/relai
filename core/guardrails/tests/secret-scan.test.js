'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { scanText } = require('../secret-scan.js');

const names = ['PASSWORD', ['DB', 'PASSWORD'].join('_')];
const reads = [
  'process.env.DB_PASSWORD',
  'process.env["DB_PASSWORD"]',
  'os.environ["DB_PASSWORD"]',
  "os.environ[ 'DB_PASSWORD' ]",
  'os.environ.get("DB_PASSWORD")',
  "os.environ.get( 'DB_PASSWORD' )",
  'import.meta.env.DB_PASSWORD',
  'Deno.env.get("DB_PASSWORD")',
  "Deno.env.get( 'DB_PASSWORD' )",
];
const literal = ['m7Q', '9rV', '2zL', '8pN'].join('');
const assignment = (name, value) => name + ' = ' + value;
const expected = (name) => 'przypisanie ' + name + '= z niepusta wartoscia';

for (const expression of reads) {
  test('environment read: ' + expression, () => {
    for (const name of names) {
      assert.equal(scanText(assignment(name, expression)), null);
      assert.equal(scanText(assignment(name, expression) + '; // environment'), null);
      assert.equal(scanText(assignment(name, expression) + ' # environment'), null);
      // Te same reguly musza skanowac dalej po pominieciu odczytu srodowiska.
      for (const newline of ['\n', '\r\n']) {
        assert.equal(scanText(assignment(name, expression) + newline +
          assignment(name, '"' + literal + '"')), expected(name));
      }
      assert.equal(scanText(assignment(name, expression) + '; ' +
        assignment(name, '"' + literal + '"')), expected(name));
    }
  });
}

test('literal values remain blocked with every quote style', () => {
  for (const name of names) {
    for (const quote of ['', '"', "'", '`']) {
      assert.equal(scanText(assignment(name, quote + literal + quote)), expected(name));
      for (const expression of reads) {
        if (quote) assert.equal(scanText(assignment(name, quote + expression + quote)), expected(name));
      }
    }
  }
});

test('similar identifiers and expressions with literal fallbacks stay blocked', () => {
  const expressions = [
    'os.environBackup', 'os.environ.getter("DB_PASSWORD")',
    'import.meta.environment.DB_PASSWORD', 'Deno.env.getter("DB_PASSWORD")',
    'process.environment.DB_PASSWORD', 'process.env.DB_PASSWORD_SUFFIX + "' + literal + '"',
    'os.environ.get("DB_PASSWORD", "' + literal + '")',
    'os.environ.get("DB_PASSWORD") or "' + literal + '"',
    'import.meta.env.DB_PASSWORD || "' + literal + '"',
    'Deno.env.get("DB_PASSWORD") ?? "' + literal + '"',
    'process.env.DB_PASSWORD + "' + literal + '"',
    'os.environ.get("DB_PASSWORD\')',
  ];
  for (const name of names) {
    for (const expression of expressions) {
      assert.equal(scanText(assignment(name, expression)), expected(name), expression);
    }
  }
});

test('environment reads never hide a later token pattern', () => {
  const token = ['ghp', '_', 'Q7m9V2z8R4p6N3t5W1x0'].join('');
  for (const expression of reads) {
    assert.equal(scanText(assignment(names[1], expression) + '\nconst credential = "' + token + '";'),
      'token GitHub (ghp...)');
  }
});

test('multiline continuations with literals stay blocked', () => {
  for (const expression of ['process.env.DB_PASSWORD', 'import.meta.env.DB_PASSWORD', 'Deno.env.get("DB_PASSWORD")']) {
    for (const continuation of ['|| "' + literal + '"', '?? "' + literal + '"', '+ "' + literal + '"',
      '.concat("' + literal + '")', '["' + literal + '"]', '("' + literal + '")']) {
      for (const separator of ['\n  ', '\r\n\r\n', ' // first comment\n// second comment\n']) {
        assert.equal(scanText(assignment(names[1], expression + separator + continuation)), expected(names[1]));
      }
    }
    assert.equal(scanText(assignment(names[1], expression) + '\n// unrelated comment\nconst port = 3000;'), null);
  }
});

test('existing placeholders and type annotations are preserved', () => {
  for (const value of ['${DB_PASSWORD}', 'your_password', 'xxxxxxxx', 'string):']) {
    assert.equal(scanText(assignment(names[0], value)), null);
  }
});
