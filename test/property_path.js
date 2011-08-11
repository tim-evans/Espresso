/*global context setup should assert Espresso*/

context("Espresso property paths",

  should("have a function named tokensForPropertyPath", function () {
    assert.kindOf('function', Espresso.tokensForPropertyPath);
  }),

  context("tokensForPropertyPath",
    should("be able to find properties on objects", function () {
      var tokens = Espresso.tokensForPropertyPath("greeting");
      assert.equal(1, tokens.length);
      assert.equal("greeting", tokens[0]);
    }),

    should("follow '.' delimited property paths", function () {
      var tokens = Espresso.tokensForPropertyPath("a.b.c");
      assert.equal(3, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('b', tokens[1]);
      assert.equal('c', tokens[2]);
    }),

    should("allow valid JavaScript variables to be accessed by '.'", function () {
      var tokens = Espresso.tokensForPropertyPath("one.foo0bar.$._");
      assert.equal(4, tokens.length);
      assert.equal('one', tokens[0]);
      assert.equal('foo0bar', tokens[1]);
      assert.equal('$', tokens[2]);
      assert.equal('_', tokens[3]);
    }),

    should("allow the first property to start with a numeric character", function () {
      var tokens = Espresso.tokensForPropertyPath("0");
      assert.equal(1, tokens.length);
      assert.equal('0', tokens[0]);
    }),

    should("follow indexed [] property paths with numbers", function () {
      var tokens = Espresso.tokensForPropertyPath("a[0]");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('0', tokens[1]);
    }),

    should("follow indexed [] property paths with negative numbers", function () {
      var tokens = Espresso.tokensForPropertyPath("a[-1]");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('-1', tokens[1]);
    }),

    should("follow indexed [] property paths with strings", function () {
      var tokens = Espresso.tokensForPropertyPath("a['$%#']");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('$%#', tokens[1]);
    }),

    should("allow escaped quotes in property paths", function () {
      var tokens = Espresso.tokensForPropertyPath("a['\\'\"']");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal("'\"", tokens[1]);

      tokens = Espresso.tokensForPropertyPath('a["\'\\""]');
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal("'\"", tokens[1]);

      tokens = Espresso.tokensForPropertyPath('a["\\\""]');
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal("\"", tokens[1]);
    }),

    should("allow ']' in indexed property paths", function () {
      var tokens = Espresso.tokensForPropertyPath("a[']']");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal(']', tokens[1]);
    }),

    should("allow '' in indexed property paths", function () {
      var tokens = Espresso.tokensForPropertyPath("a['']");
      assert.equal(2, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('', tokens[1]);
    }),

    should("follow property paths with mixed notation", function () {
      var tokens = Espresso.tokensForPropertyPath("a.b[0].c");
      assert.equal(4, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('b', tokens[1]);
      assert.equal('0', tokens[2]);
      assert.equal('c', tokens[3]);

      tokens = Espresso.tokensForPropertyPath("a['b'][0].c");
      assert.equal(4, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('b', tokens[1]);
      assert.equal('0', tokens[2]);
      assert.equal('c', tokens[3]);

      tokens = Espresso.tokensForPropertyPath("a.b['0']['c']");
      assert.equal(4, tokens.length);
      assert.equal('a', tokens[0]);
      assert.equal('b', tokens[1]);
      assert.equal('0', tokens[2]);
      assert.equal('c', tokens[3]);
    }),

    context("malformed property paths",
      should("throw an error with empty properties", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo..bar");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[]");
      }),

      should("throw an error with an empty first property", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, ".bar");
        assert.raises(Error, Espresso.tokensForPropertyPath, "['bar']");
      }),

      should("throw an error with properties that don't start with a delimiter", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "[");
        assert.raises(Error, Espresso.tokensForPropertyPath, ".");
        assert.raises(Error, Espresso.tokensForPropertyPath, "]");
      }),

      should("throw an error with a trailing '.'", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo.");
      }),

      should("throw an error with a unclosed '['", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[0");
      }),

      should("throw an error with a stray ']'", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo]");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo]0");
      }),

      should("throw an error when a '.' property isn't a valid JavaScript variable", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo.0bar");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo.#");
      }),

      should("throw an error when the ending quote is unmatched", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo['bar\"]");
      }),

      should("throw an error when the ending quote is not immediately followed by a closing brace", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo['bar' ]");
      }),

      should("throw an error when a closing brace isn't followed by a delimiter or EOS", function () {
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[0]bar");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[0]]");
        assert.raises(Error, Espresso.tokensForPropertyPath, "foo[0] ");
      })

    )
  )
);
