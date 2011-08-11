/*global context setup should assert Espresso*/

context("Espresso accessors",
  should("have a function named get", function () {
    assert.kindOf('function', Espresso.get);
  }),

  context("get",
    should("return the object on Espresso if no second argument is given", function () {
      assert.equal(Espresso.get("VERSION"), Espresso.VERSION);
    }),

    should("return the property on native objects", function () {
      var o = { greeting: "konnichiwa" };
      assert.equal(Espresso.get(o, "greeting"), "konnichiwa");
    }),

    should("return the property on native arrays", function () {
      var o = ["hello"];
      assert.equal(Espresso.get(o, "0"), "hello");
    }),

    // Property tests are in observable-
    // this is sanity checking to ensure that get indeed does
    // return computed properties.
    should("return the value of a computed property", function () {
      var o = mix(Espresso.Observable, {
        isComputed: Espresso.property(function () { return true; })
      }).into({});

      o.initObservable();
      assert.equal(Espresso.get(o, "isComputed"), true);
    })
  ),

  should("have a function named getPath", function () {
    assert.kindOf('function', Espresso.getPath);
  }),

  context("getPath",
    should("return the object on Espresso if no second argument is given", function () {
      assert.equal(Espresso.getPath("Enumerable.isEnumerable"), Espresso.Enumerable.isEnumerable);
    }),

    should("be able to find properties on objects", function () {
      var o = { greeting: "konnichiwa" };
      assert.equal(Espresso.getPath(o, "greeting"), "konnichiwa");
    }),

    should("follow '.' delimited property paths", function () {
      var o = { a: { b: { c: 'd' } } };
      assert.equal(Espresso.getPath(o, "a.b.c"), "d");
    }),

    should("allow valid JavaScript variables to be accessed by '.'", function () {
      var o = { foo0bar: { $: { _: 'd' } } };
      assert.equal(Espresso.getPath(o, "foo0bar.$._"), "d");
    }),

    should("follow indexed [] property paths with numbers", function () {
      var o = { a: ['b'] };
      assert.equal(Espresso.getPath(o, "a[0]"), "b");
    }),

    should("follow indexed [] property paths with negative numbers", function () {
      var o = { a: { "-1": "b" } };
      assert.equal(Espresso.getPath(o, "a[-1]"), "b");
    }),

    should("follow indexed [] property paths with strings", function () {
      var o = { a: { "$%#": 'b' } };
      assert.equal(Espresso.getPath(o, "a['$%#']"), "b");
      assert.equal(Espresso.getPath(o, 'a["$%#"]'), "b");
    }),

    should("allow escaped quotes in property paths", function () {
      var o = { a: { "'\"": 'b' } };
      assert.equal(Espresso.getPath(o, "a['\\'\"']"), "b");
      assert.equal(Espresso.getPath(o, 'a["\'\\""]'), "b");
    }),

    should("allow ']' in indexed property paths", function () {
      var o = { a: { "]": 'b' } };
      assert.equal(Espresso.getPath(o, "a[']']"), "b");
      assert.equal(Espresso.getPath(o, 'a["]"]'), "b");
    }),

    should("follow property paths with mixed notation", function () {
      var o = { a: { b: [{ c: 'd' }] } };
      assert.equal(Espresso.getPath(o, "a.b[0].c", o), "d");
      assert.equal(Espresso.getPath(o, "a['b'][0].c", o), "d");
      assert.equal(Espresso.getPath(o, "a.b[0]['c']", o), "d");
    })
  )
);
