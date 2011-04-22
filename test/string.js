/*global context setup should assert Espresso formatting*/

context("String",

  should("have an instance function named 'forEach'", function () {
    assert.kindOf('function', "".forEach);
  }),

  context("forEach", 
    should("iterate through all the characters in the string", function () {
      var alpha = 'abcdefghijklmnopqrstuvwxyz',
          i = 0;
      alpha.forEach(function (chr, idx) {
        assert.equal(i++, idx);
        assert.equal(alpha.charAt(idx), chr);
      });
      assert.equal(i, alpha.length);
    })
  ),

  should("have an instance function named 'capitalize'", function () {
    assert.kindOf('function', "".capitalize);
  }),

  context("capitalize",
    should("capitalize the first character in the string", function () {
      assert.equal(''.capitalize(), '');
      assert.equal('a'.capitalize(), 'A');
      assert.equal('hello, world!'.capitalize(), 'Hello, world!');
    })
  ),

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

  should("have an instance function named 'unescapeHTML'", function () {
    assert.kindOf('function', "".unescapeHTML);
  }),

  context("unescapeHTML",
    should("turn &gt; to >", function () {
      assert.equal("&gt; &gt;".unescapeHTML(), "> >");
    }),

    should("turn &lt; to <", function () {
      assert.equal("&lt; &lt;".unescapeHTML(), "< <");
    }),

    should("turn &amp; to &", function () {
      assert.equal("&amp; &amp;".unescapeHTML(), "& &");
    }),

    should("turn &quot; to \"", function () {
      assert.equal("&quot; &quot;".unescapeHTML(), "\" \"");
    }),

    should("turn &apos; to '", function () {
      assert.equal("&apos; &apos;".unescapeHTML(), "' '");
    })
  ),

  should("have an instance function named 'escapeHTML'", function () {
    assert.kindOf('function', "".escapeHTML);
  }),

  context("escapeHTML",
    should("turn > to &gt;", function () {
      assert.equal("> >".escapeHTML(), "&gt; &gt;");
    }),

    should("turn < to &lt;", function () {
      assert.equal("< <".escapeHTML(), "&lt; &lt;");
    }),

    should("turn & to &amp;", function () {
      assert.equal("& &".escapeHTML(), "&amp; &amp;");
    }),

    should("turn \" to &quot;", function () {
      assert.equal("\" \"".escapeHTML(), "&quot; &quot;");
    }),

    should("turn ' to &apos;", function () {
      assert.equal("' '".escapeHTML(), "&apos; &apos;");
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
