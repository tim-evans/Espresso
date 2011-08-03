/*global context setup should assert Espresso*/

var version;
context("Espresso",
  should("be defined", function () {
    assert.isTrue(Espresso);
  }),

  should("have a version attribute on it", function () {
    assert.isTrue(Espresso.VERSION);
  }),

  context("version",
    setup(function () {
      version = Espresso.VERSION.split('.');
    }),

    should("follow the major.minor.patch schema", function () {
      assert.equal(version.length, 3);
      assert.isNumber(version[0]);
      assert.isNumber(version[1]);
      assert.isNumber(version[2]);
    })
  ),

  should("have a function named getObjectFor", function () {
    assert.kindOf('function', Espresso.getObjectFor);
  }),

  context("getObjectFor",
    should("be able to find global objects (with no reference)", function () {
      window.greeting = "hello";
      assert.equal(Espresso.getObjectFor("greeting"), "hello");
    }),

    should("be able to find local objects", function () {
      var o = { greeting: "konnichiwa" };
      assert.equal(Espresso.getObjectFor("greeting", o), "konnichiwa");
    }),

    should("follow . delimited property paths", function () {
      var o = { a: { b: { c: 'd' } } };
      assert.equal(Espresso.getObjectFor("a.b.c", o), "d");
    }),

    should("follow [] delimited property paths", function () {
      var o = { a: ['b'] };
      assert.equal(Espresso.getObjectFor("a[0]", o), "b");
    }),

    should("follow delimited property paths with [] and . notation", function () {
      var o = { a: [{ b: 'c' }] };
      assert.equal(Espresso.getObjectFor("a[0].b", o), "c");
      assert.equal(Espresso.getObjectFor("a[0][b]", o), "c");
    }),

    should("throw an error when encountering a malformed property path", function () {
      var o = { a: ['foo'] };
      assert.raises(SyntaxError, Espresso.getObjectFor, "a..b", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a.[0]", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a[0]bar", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a[", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a]", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a[]", o);
      assert.raises(SyntaxError, Espresso.getObjectFor, "a.", o);
    })
  ),

  should("have a function named hasValue", function () {
    assert.kindOf('function', Espresso.hasValue);
  }),

  context("hasValue",
    should("return false for null values", function () {
      assert.isFalse(Espresso.hasValue(null));
    }),

    should("return false for undefined values", function () {
      var unbound;
      assert.isFalse(Espresso.hasValue(unbound));
    })
  ),

  should("have a function named isCallable", function () {
    assert.kindOf('function', Espresso.isCallable);
  }),

  context("isCallable",
    should("return `true` if the function is a function", function () {
      assert.isTrue(Espresso.isCallable(function () {}));
    }),

    should("return `true` if the function implements `apply` and `call`", function () {
      assert.isTrue(Espresso.isCallable({ apply: function () {},
                                          call: function () {} }));
    }),

    should("return `false` if the function implements `apply` and `call` (and they're not callable)", function () {
      assert.isFalse(Espresso.isCallable({ apply: null,
                                           call: null }));
    })
  ),

  should("have a class function named 'A'", function () {
    assert.kindOf('function', Espresso.A);
  }),

  context("A",
    should("turn array-like objects (that have a length and can be indexed by []) into an Array", function () {
      var pseudoArray = { length: 5, 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' },
          arr = Espresso.A(pseudoArray);

      assert.kindOf("array", arr);
      assert.equal(pseudoArray.length, arr.length);
      for (var i = 0; i < pseudoArray.length; i++) {
        assert.equal(pseudoArray[i], arr[i]);
      }
    })
  )
);
