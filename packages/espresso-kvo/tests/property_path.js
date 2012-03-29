module('tokensForPropertyPath');

var tokenize = Espresso.tokensForPropertyPath;

test('non-delimited strings should be returned as an array', function () {
  var tokens = tokenize('greeting');
  equals(1, tokens.length);
  equals('greeting', tokens[0]);
});

test('property paths should be split on `.`', function () {
  var tokens = tokenize('a.b.c');
  equals(3, tokens.length);
  equals('a', tokens[0]);
  equals('b', tokens[1]);
  equals('c', tokens[2]);
});

test('valid JavaScript variables should be accessable via `.` delimiters', function () {
  var tokens = tokenize('one.foo0bar.$._');
  equals(4, tokens.length);
  equals('one', tokens[0]);
  equals('foo0bar', tokens[1]);
  equals('$', tokens[2]);
  equals('_', tokens[3]);
});

test('the first property can start with a numeric character', function () {
  var tokens = tokenize('0');
  equals(1, tokens.length);
  equals('0', tokens[0]);
});

test('indexed (`[]`) property paths with numbers', function () {
  var tokens = tokenize('a[0]');
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals('0', tokens[1]);
});

test('indexed (`[]`) property paths with negative numbers', function () {
  var tokens = tokenize('a[-1]');
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals('-1', tokens[1]);
});

test('indexed (`[]`) property paths with strings', function () {
  var tokens = tokenize("a['$%#']");
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals('$%#', tokens[1]);
});

test('escaped quotes are allowed in property paths', function () {
  var tokens = tokenize("a['\\'\"']");
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals("'\"", tokens[1]);

  tokens = tokenize('a["\'\\""]');
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals("'\"", tokens[1]);

  tokens = tokenize('a["\\\""]');
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals("\"", tokens[1]);
});

test('`]` is allowed in indexed property paths', function () {
  var tokens = tokenize("a[']']");
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals(']', tokens[1]);
});

test("the empty string ('') should be allowed in indexed property paths", function () {
  var tokens = tokenize("a['']");
  equals(2, tokens.length);
  equals('a', tokens[0]);
  equals('', tokens[1]);
});

test('property paths with mixed notation', function () {
  var tokens = tokenize('a.b[0].c');
  equals(4, tokens.length);
  equals('a', tokens[0]);
  equals('b', tokens[1]);
  equals('0', tokens[2]);
  equals('c', tokens[3]);

  tokens = tokenize("a['b'][0].c");
  equals(4, tokens.length);
  equals('a', tokens[0]);
  equals('b', tokens[1]);
  equals('0', tokens[2]);
  equals('c', tokens[3]);

  tokens = tokenize("a.b['0']['c']");
  equals(4, tokens.length);
  equals('a', tokens[0]);
  equals('b', tokens[1]);
  equals('0', tokens[2]);
  equals('c', tokens[3]);
});

test('it throws an error with empty properties', function () {
  raises(function () {
    tokenize('foo..bar');
  }, Error);

  raises(function () {
    tokenize('foo[]');
  }, Error);
});

test('it throws an error with an empty first property', function () {
  raises(function () {
    tokenize('.bar');
  }, Error);

  raises(function () {
    tokenize('["bar"]');
  }, Error);
});

test("it throws an error with properties that don't start with a delimiter", function () {
  raises(function () {
    tokenize('[');
  }, Error);

  raises(function () {
    tokenize('.');
  }, Error);

  raises(function () {
    tokenize(']');
  }, Error);
});

test('it throws an error with a trailing `.`', function () {
  raises(function () {
    tokenize('foo.');
  }, Error);
});

test('it throws an error with a unclosed `[`', function () {
  raises(function () {
    tokenize('foo[');
  }, Error);

  raises(function () {
    tokenize('foo[0');
  }, Error);
});

test('it throws an error with a stray `]`', function () {
  raises(function () {
    tokenize('foo]');
  }, Error);

  raises(function () {
    tokenize('foo]0');
  }, Error);
});

test("it throws an error when a `.` property isn't a valid JavaScript variable", function () {
  raises(function () {
    tokenize('foo.0bar');
  }, Error);

  raises(function () {
    tokenize('foo.#');
  }, Error);
});

test('it throws an error when the ending quote is unmatched', function () {
  raises(function () {
    tokenize('foo["bar\']');
  }, Error);
});

test('it throws an error when the ending quote is not immediately followed by a closing brace', function () {
  raises(function () {
    tokenize('foo["bar" ]');
  }, Error);
});

test("it throws an error when a closing brace isn't followed by a delimiter or EOS", function () {
  raises(function () {
    tokenize('foo[0]bar');
  }, Error);

  raises(function () {
    tokenize('foo[0]]');
  }, Error);

  raises(function () {
    tokenize('foo[0] ');
  }, Error);
});
