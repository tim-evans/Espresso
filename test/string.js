/*global context setup should assert Espresso formatting*/

context("String",

  should("have an instance function named 'repeat'", function () {
    assert.kindOf('function', "".repeat);
  }),

  context("repeat",
    should("repeat the string K times", function () {
      assert.equal('a'.repeat(-1), '');
      assert.equal('a'.repeat(0), '');
      assert.equal('a'.repeat(5), 'aaaaa');
      assert.equal('nom'.repeat(2), 'nomnom');
      assert.equal('test'.repeat(100).length, 400);
    }),

    should("use the provided character as a separator", function () {
      assert.equal('^'.repeat(2, '_'), '^_^');
      assert.equal('.'.repeat(1, '   '), '.');
      assert.equal('a'.repeat(3, '  '), 'a  a  a');
    })
  ),

  should("have an instance function named 'trim'", function () {
    assert.kindOf('function', "".trim);
  }),

  context("trim",
    should("remove all prefix and postfix whitespace characters", function () {
      assert.equal(''.trim(), '');
      assert.equal(' '.trim(), '');
      assert.equal('  '.trim(), '');
      assert.equal('  \n'.trim(), '');
      assert.equal('  \n\t'.trim(), '');
      assert.equal('  \n\t\r'.trim(), '');
      assert.equal('  abc\n\t\r'.trim(), 'abc');
      assert.equal('\n\t\r   a b c  \n\t\r'.trim(), 'a b c');
      assert.equal('\n\t\r   a\tb\n\rc  \n\t\r'.trim(), 'a\tb\n\rc');
    })
  ),

  should("have an instance function named 'contains'", function () {
    assert.kindOf('function', "".contains);
  }),

  context("contains",
    should("return true when indexOf(X) is not -1", function () {
      assert.isTrue('abacadabra'.contains('abra'));
      assert.isTrue('abacadabra'.contains('cad'));
      assert.isTrue('abacadabra'.contains('abaca'));
    }),

    should("return false when indexOf(X) is -1", function () {
      assert.isFalse('abacadabra'.contains('z'));
      assert.isFalse('abacadabra'.contains('abacab'));
      assert.isFalse('abacadabra'.contains('y'));
    })
  ),

  // Tested with Espresso.Formatter
  should("have an instance function named 'format'", function () {
    assert.kindOf('function', "".format);
  }),

  // Tests __format__ implementation against PEP 3101
  //   http://www.python.org/dev/peps/pep-3101/
  context("format",
    // Test minimum width
    formatting("'{:3}' with '\"_\"' should return '  _'"),
    formatting("'{:10}' with '\"_\"' should return '         _'"),

    // Test alignment
    formatting("'{:^3}' with '\"_\"' should return ' _ '"),
    formatting("'{:<3}' with '\"_\"' should return '_  '"),
    formatting("'{:>3}' with '\"_\"' should return '  _'"),

    // Test fill
    formatting("'{:@^3}' with '\"_\"' should return '@_@'"),
    formatting("'{:@<3}' with '\"_\"' should return '_@@'"),
    formatting("'{:@>3}' with '\"_\"' should return '@@_'"),

    // Test maximum width
    formatting("'{:.2}' with '\"hello\"' should return 'he'")
  )
);
