/*global context setup should assert JSON*/

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
    }),

    should("take a reviver function", function () {
      var o = JSON.parse('[0, 1, 2, 3, 4, 5]', function () {
        assert.equal(arguments.length, 2);
      });
    }),

    should("take a reviver function that can alter the values of the returned object", function () {
      var o = JSON.parse('[0, 1, 2, 3, 4, 5]', function (key, value) {
         if (!Array.isArray(value)) {
           return value + 1;
         } else {
           return value;
         }
      });

      assert.kindOf("array", o);
      for (var i = 0, len = o.length; i < len; i++) {
        assert.equal(o[i], i + 1);
      }
    }),

    should("delete the values passed back if `undefined` is returned", function () {
      var o = JSON.parse('{ "a": { "b": { "c": 1 }}}', function () {});
      assert.equal(null, o);
    })
  ),

  should("have a function named 'stringify'", function () {
    assert.kindOf("function", JSON.stringify);
  }),

  context("stringify",
    should("stringify Strings properly", function () {
      assert.equal(JSON.stringify('string'), '"string"');
    }),

    should("stringify Numbers properly", function () {
      assert.equal(JSON.stringify(123), '123');
    }),

    should("stringify Booleans properly", function () {
      assert.equal(JSON.stringify(false), 'false');
      assert.equal(JSON.stringify(true), 'true');
    }),

    should("stringify null values properly", function () {
      assert.equal(JSON.stringify(null), 'null');
    }),

    should("not stringify undefined values properly", function () {
      assert.equal(JSON.stringify(undefined), null);
    }),

    should("stringify Arrays properly", function () {
      assert.equal(JSON.stringify([]), '[]');
    }),

    should("stringify values inside Arrays properly", function () {
      assert.equal(JSON.stringify([0, 'string', false, null]), '[0,"string",false,null]');
    }),

    should("stringify nested Arrays properly", function () {
      assert.equal(JSON.stringify([0, [1, [2]]]), '[0,[1,[2]]]');
    }),

    should("stringify Objects properly", function () {
      assert.equal(JSON.stringify({}), '{}');
    }),

    should("stringify values inside Objects properly", function () {
      assert.equal(JSON.stringify({ a: 0, b: 'string', c: false, d: null}), '{"a":0,"b":"string","c":false,"d":null}');
    }),

    should("stringify nested Objects properly", function () {
      assert.equal(JSON.stringify({ a: { b: { c: 0 }}}), '{"a":{"b":{"c":0}}}');
    }),

    should("take an array that acts like a whitelist", function () {
      assert.equal(JSON.stringify({ a: 0, b: false, c: null }, ['a', 'c']), '{"a":0,"c":null}');
    }),

    should("take a function that transforms the object", function () {
      assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, function (k, v) {
        if (k === "") {
          return v;
        }
        return v + 1;
      }), '{"a":1,"b":2,"c":3}');

      assert.equal(JSON.stringify([0, 1, 2, 3], function (k, v) {
        return "foo";
      }), '"foo"');

      assert.equal(JSON.stringify([0, 1, 2, 3], function (k, v) {
      }), null);
    }),

    should("take a string that provides more readability via spaces in the JSON", function () {
      ['foo', '   ', "\'", "\n"].forEach(function (v) {
        assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, null, v),
                     '{{\n{0}"a": 0,\n{0}"b": 1,\n{0}"c": 2\n}}'.fmt(v));
      });
    }),

    should("take a number that provides more readability via spaces in the JSON", function () {
      assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, null, 0),
                   '{"a":0,"b":1,"c":2}');
      assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, null, -1),
                   '{"a":0,"b":1,"c":2}');
      [1, 2, 3].forEach(function (v) {
        assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, null, v),
                     '{{\n{0}"a": 0,\n{0}"b": 1,\n{0}"c": 2\n}}'.fmt(" ".repeat(v)));
      });
    }),

    should("have a max number of 10 spaces in the JSON", function () {
      [10, 11, 20, 30].forEach(function (v) {
        assert.equal(JSON.stringify({ a: 0, b: 1, c: 2 }, null, 10),
                     '{{\n{0}"a": 0,\n{0}"b": 1,\n{0}"c": 2\n}}'.fmt(" ".repeat(10)));
      });
    })
  )
);
