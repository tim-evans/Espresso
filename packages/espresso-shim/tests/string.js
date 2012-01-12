module('String.repeat');

test('that it should repeat the string N times', function () {
  equals('a'.repeat(-1), '');
  equals('a'.repeat(0), '');
  equals('a'.repeat(5), 'aaaaa');
  equals('nom'.repeat(2), 'nomnom');
  equals('test'.repeat(100).length, 400);
});


module('String.trim');

test('that ` ` is trimmed', function () {
  equals(''.trim(), '');
  equals(' '.trim(), '');
  equals('  '.trim(), '');
});

test('that `\\n` is trimmed', function () {
  equals('\n'.trim(), '');
  equals('\n\n'.trim(), '');
  equals('\na\nb\nc\n'.trim(), 'a\nb\nc');
});

test('that `\\t` is trimmed', function () {
  equals('\t'.trim(), '');
  equals('\t\t'.trim(), '');
  equals('\ta\tb\tc\t'.trim(), 'a\tb\tc');
});

test('that `\\r` is trimmed', function () {
  equals('\r'.trim(), '');
  equals('\r\r'.trim(), '');
  equals('\ra\rb\rc\r'.trim(), 'a\rb\rc');
});

test('that combinations of whitespace characters are trimmed', function () {
  equals('\n\t\r   a b c  \n\t\r'.trim(), 'a b c');
  equals('\n\t\r   a\tb\n\rc  \n\t\r'.trim(), 'a\tb\n\rc');
});