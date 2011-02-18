/*global context setup should assert JSON*/

var stringifying = function (spec) {
  return should(spec, function () {
    var parts = spec.match(/'([^']+)' should return '([^']+)'/),
        object = eval('(' + parts[1] + ')'),
        expected = parts[2];
    assert.equal(JSON.stringify(object), expected);
  });
};

context("JSON",

  should("exist", function () {
    assert.isTrue(JSON);
  }),

  should("have a function named 'parse'", function () {
    assert.kindOf("function", JSON.parse);
  }),

  context("parse",
    should("parse number literals", function () {
      assert.equal(JSON.parse("12345"), 12345);
    }),

    should("parse boolean literals", function () {
      assert.equal(JSON.parse("true"), true);
      assert.equal(JSON.parse("false"), false);
    }),

    should("parse string literals", function () {
      assert.equal(JSON.parse('"string"'), "string");
    }),

    should("error on single quoted strings", function () {
      assert.raises(Error, JSON.parse, "'string'");
    }),

    should("parse null", function () {
      assert.equal(JSON.parse("null"), null);
    }),

    should("error on 'undefined'", function () {
      assert.raises(Error, JSON.parse, "undefined");
    }),

    should("parse Array literals", function () {
      assert.kindOf("array", JSON.parse("[]"));
      assert.equal(JSON.parse("[]").length, 0);
    }),

    should("parse elements in the Array", function () {
      var a = JSON.parse('[0, true, "foo", null, { "a": 0 }]');
      assert.kindOf("array", a);
      assert.equal(a.length, 5);
      assert.equal(a[0], 0);
      assert.equal(a[1], true);
      assert.equal(a[2], "foo");
      assert.equal(a[3], null);
      assert.kindOf("object", a[4]);
      assert.equal(a[4].a, 0);
    }),

    should("parse nested Arrays", function () {
      var a = JSON.parse('[0, [1, [2]]]');
      assert.kindOf("array", a);
      assert.equal(a[0], 0);
      assert.kindOf("array", a[1]);
      assert.equal(a[1][0], 1);
      assert.kindOf("array", a[1][1]);
      assert.equal(a[1][1][0], 2);
    }),

    should("parse Object literals", function () {
      assert.kindOf("object", JSON.parse("{}"));
    }),

    should("parse elements in the Object", function () {
      var o = JSON.parse('{ "a": 0, "b": true, "c": "foo", "d": null, "e": [0, 1] }');
      assert.kindOf("object", o);
      assert.equal(o.a, 0);
      assert.equal(o.b, true);
      assert.equal(o.c, "foo");
      assert.equal(o.d, null);
      assert.kindOf("array", o.e);
    }),

    should("parse nested Objects", function () {
      var o = JSON.parse('{ "a": { "b": { "c": 1 }}}');
      assert.kindOf("object", o);
      assert.kindOf("object", o.a);
      assert.kindOf("object", o.a.b);
      assert.equal(o.a.b.c, 1);
    })
  ),

  should("have a function named 'stringify'", function () {
    assert.kindOf("function", JSON.stringify);
  }),

  context("stringify",
    stringifying("'\"string\"' should return '\"string\"'"),
    stringifying("'123' should return '123'"),
    stringifying("'true' should return 'true'"),
    stringifying("'false' should return 'false'"),
    stringifying("'null' should return 'null'"),

    stringifying("'[]' should return '[]'"),
    stringifying("'[0, \"string\", false]' should return '[0,\"string\",false]'"),
    stringifying("'[0, [1, [2]]]' should return '[0,[1,[2]]]'"),

    stringifying("'{}' should return '{}'"),
    stringifying("'{ a: 0, b: \"string\", c: false, d: null }' should return '{\"a\":0,\"b\":\"string\",\"c\":false,\"d\":null}'"),
    stringifying("'{ a: { b: { c: 0 }}}' should return '{\"a\":{\"b\":{\"c\":0}}}'")
  )
);
