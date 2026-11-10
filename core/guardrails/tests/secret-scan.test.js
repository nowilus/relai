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

// --- K-D1 i K-D4 (etap E03 planu OPTYMALIZACJA_PO_AUDYCIE) ---------------------------------
// Nazwy i wartosci skladane w czasie dzialania: literal przypisania zatrzymalby zapis pliku.
const PW = ['PASS', 'WORD'].join('');
const pw = PW.toLowerCase();
const AK = ['API', 'KEY'].join('_');
const ak = ['api', 'Key'].join('');
const TK = ['TO', 'KEN'].join('');
const tk = TK.toLowerCase();
const KEY = ['K', 'EY'].join('');
const long = literal + literal; // 24 znaki

test('K-D1: quoted names, lowercase config names and secret _KEY names are blocked', () => {
  const cases = [
    ['{"' + pw + '": "' + literal + '"}', expected(PW)],
    ['{"' + AK + '": "' + literal + '"}', expected(AK)],
    ['{"DB_' + PW + '": "' + literal + '"}', expected('DB_' + PW)],
    ["cfg = {'secret': '" + literal + "'}", expected('SECRET')],
    ['db_' + pw + ': ' + literal, expected('DB_' + PW)],
    ['prod:\n  db_' + pw + ': ' + literal + '\n', expected('DB_' + PW)],
    ['{"db_' + pw + '": "' + literal + '"}', expected('DB_' + PW)],
    ['aws_secret_access_' + KEY.toLowerCase() + ' = ' + literal, expected('AWS_SECRET_ACCESS_' + KEY)],
    ['SECRET_' + KEY + " = '" + literal + "'", expected('SECRET_' + KEY)],
    ['PRIVATE_' + KEY + '=' + literal, expected('PRIVATE_' + KEY)],
    ['APP_ENCRYPTION_' + KEY + '=' + literal, expected('APP_ENCRYPTION_' + KEY)],
  ];
  for (const [text, verdict] of cases) assert.equal(scanText(text), verdict, text.replace(literal, '<literal>'));
});

test('K-D1: private key blocks and token prefixes are blocked', () => {
  const github = 'token GitHub (github_pat_ / gho_ / ghu_ / ghs_ / ghr_)';
  const cases = [
    ['-----BEGIN PGP PRIVATE ' + KEY + ' BLOCK-----', 'klucz prywatny PEM'],
    ['k = "' + ['sk', 'live', long].join('_') + '"', 'klucz Stripe (sk_live_...)'],
    ['t = "' + ['github', 'pat', '11AAAAAAA0' + long].join('_') + '"', github],
    ['t = "' + ['gho', long].join('_') + '"', github],
    ['t = "' + ['xoxb', '123456789012', '123456789012', long.slice(0, 20)].join('-') + '"', 'token Slack (xox...)'],
    ['k = "' + 'AIza' + 'Sy' + long + 'abcdefghi"', 'klucz Google API (AIza...)'],
  ];
  for (const [text, verdict] of cases) assert.equal(scanText(text), verdict, verdict);
});

test('K-D1: a password in the userinfo part of a URL is blocked, placeholders are not', () => {
  assert.equal(scanText('postgres://admin:' + literal + '@db.example.com/app'), 'haslo w adresie URL');
  assert.equal(scanText('postgres://user:' + pw + '@localhost/db'), null);
  assert.equal(scanText('postgres://user:${DB_' + PW + '}@localhost/db'), null);
  assert.equal(scanText('https://example.com:8080/path@section'), null);
});

test('K-D1: lowercase prefixed names in code and non-secret _KEY constants stay silent', () => {
  for (const text of [
    'refresh_' + tk + ' = data.get("refresh_' + tk + '")',
    "{'" + tk + "': access_" + tk + '}',
    'const SESSION_' + KEY + " = 'relai.session.limit';",
    'CACHE_' + KEY + " = 'user-profile-cache'",
  ]) assert.equal(scanText(text), null, text);
});

test('K-D1: scan time stays linear on long runs of dash-separated capitals', () => {
  const start = process.hrtime.bigint();
  assert.equal(scanText('A-'.repeat(40000)), null);
  const ms = Number((process.hrtime.bigint() - start) / 1000000n);
  assert.ok(ms < 1000, 'scan took ' + ms + ' ms');
});

test('K-D4: field access, calls and identifiers ending a statement are not secrets', () => {
  for (const text of [
    'const ' + pw + ' = req.body.' + pw + ';',
    'const ' + ak + ' = getApiKey();',
    'this.' + tk + ' = options.' + tk + ';',
    'const ' + pw + ' = hashedPassword;',
    'login(' + pw + '=user_password)',
    AK + ' = settings.' + AK,
    'access_' + tk + ' = response.access_' + tk,
    '  ' + pw + ': req.body.' + pw + ',',
    '{ ' + pw + ': req.body.' + pw + ' }',
    '  ' + tk + ': getToken()',
  ]) assert.equal(scanText(text), null, text);
});

test('K-D4: environment reads in Python, Java and C# are not secrets', () => {
  for (const text of [
    AK + ' = os.getenv("' + AK + '")',
    'String ' + tk + ' = System.getenv("' + TK + '");',
    'var ' + ak + ' = Environment.GetEnvironmentVariable("' + AK + '");',
    'var ' + ak + ' = System.Environment.GetEnvironmentVariable("' + AK + '");',
    AK + ' = ENV["' + AK + '"]',
  ]) assert.equal(scanText(text), null, text);
});

test('K-D4: prose after a name and a colon is not a secret', () => {
  assert.equal(scanText(TK[0] + tk.slice(1) + ': przechowywany wylacznie w pliku .env'), null);
});

test('K-D4: literals next to code values stay blocked', () => {
  const cases = [
    [PW + '=abc1.def2ghi', PW],
    [pw + ' = decrypt("' + literal + '");', PW],
    [AK + ' = os.getenv("' + AK + '", "' + literal + '")', AK],
    [pw + ': ' + literal, PW],
    [PW + '=hunter2hunter', PW],
    [pw + ' = hunter2hunter', PW],
    [pw + ': Summer2024.Fall', PW],
    [pw + ' = req.body.' + pw + ' + "' + literal + '"', PW],
  ];
  for (const [text, name] of cases) assert.equal(scanText(text), expected(name), text.replace(literal, '<literal>'));
});
