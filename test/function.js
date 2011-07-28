/*global context setup should assert mix*/

context("Function",
  should("have a function named 'inferior'", function () {
    assert.kindOf("function", Espresso.inferior);
  }),

  context("inferior",
    should("ignore the function if mixed into another object with the slot filled on mixin time", function () {
      var lambda = Espresso.inferior(function () {}),
          o = { k: "Superior" };
      mix({ k: lambda }).into(o);
      assert.equal(o.k, "Superior");
    }),

    should("mixin the function if the slot is not filled", function () {
      var lambda = Espresso.inferior(function () {}),
          o = {};
      mix({ k: lambda }).into(o);
      assert.equal(o.k, lambda);
    }),

    should("mixin the slot conditionally depending on the value passed in", function () {
      var lambda = Espresso.inferior(function () {}, true),
          o = { k: "Superior" };
      mix({ k: lambda }).into(o);
      assert.equal(o.k, "Superior");

      lambda = Espresso.inferior(function () {}, false);
      mix({ k: lambda }).into(o);
      assert.equal(o.k, lambda);
    })
  ),

  should("have a function named 'alias'", function () {
    assert.kindOf("function", Espresso.alias);
  }),

  context("alias",
    should("add slots with the same function given the names on alias on mixin time", function () {
      var lambda = Espresso.alias(function () {}, 'George Orwell'),
          orwell = mix({ 'Eric Blair': lambda }).into({});
      assert.equal(orwell['Eric Blair'], orwell['George Orwell']);
    })
  ),

  should("have a function named 'refine'", function () {
    assert.kindOf("function", Espresso.refine);
  }),

  context("refine",
    should("prepend an argument to the argument list of the function when called", function () {
      var called = false;
      var o = mix({
        lambda: Espresso.refine(function () {
          called = true;
          assert.equal(arguments.length, 3);
          assert.equal(arguments[1], 'a');
          assert.equal(arguments[2], 'b');
        })
      }).into({});

      o.lambda('a', 'b');
      assert.isTrue(called);
    }),

    context("super argument",
      should("should be prepended to the argument list", function () {
        var called = false;
        var o = mix({
          lambda: Espresso.refine(function ($super) {
            $super('a', 'b');
          })
        }).into({
          lambda: function () {
            called = true;
            assert.equal(arguments.length, 2);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
          }
        });

        o.lambda();
        assert.isTrue(called);
      }),

      should("should be a function", function () {
        var called = false;
        var o = mix({
          lambda: Espresso.refine(function ($super) {
            called = true;
            assert.kindOf("function", $super);
          })
        }).into({});

        o.lambda();
        assert.isTrue(called);
      }),

      should("call the base function when invoked", function () {
        var called = false;
        var o = mix({
          lambda: Espresso.refine(function ($super) {
            $super('a', 'b');
          })
        }).into({
          lambda: function () {
            called = true;
            assert.equal(arguments.length, 2);
            assert.equal(arguments[0], 'a');
            assert.equal(arguments[1], 'b');
          }
        });

        o.lambda();
        assert.isTrue(called);
      }),

      should("not throw an error if no base function exists when invoked", function () {
        var called = false;
        var o = mix({
          lambda: Espresso.refine(function ($super) {
            called = true;
            $super('a', 'b');
          })
        }).into({});

        o.lambda();
        assert.isTrue(called);
      }),

      should("bind the value of 'this' to whatever the calling function's 'this' is.", function () {
        var called = false,
            self = "Self should be 'this'";
        var o = mix({
          lambda: Espresso.refine(function ($super) {
            assert.equal(self, this);
            $super();
          })
        }).into({
          lambda: function () {
            assert.equal(self, this);
            called = true;
          }
        });

        o.lambda.call(self);
        assert.isTrue(called);
      })
    )
  ),

  should("have a decorator named 'property'", function () {
    assert.kindOf("function", Espresso.property);
  }),

  context("property",
    should("annotate the function to mark it as 'isProperty'", function () {
      var lambda = Espresso.property(function () {});
      assert.isTrue(lambda.isProperty);
    }),

    should("annotate the function to mark it's dependentKeys", function () {
      var lambda = Espresso.property(function () {});
      assert.equal(lambda.dependentKeys.length, 0);
    }),

    should("annotate the function to mark it's dependentKeys with arguments provided to property", function () {
      var lambda = Espresso.property(function () {}, 'a', 'b', 'c');
      assert.equal(lambda.dependentKeys.length, 3);
      assert.isTrue(lambda.dependentKeys.indexOf('a') !== -1);
      assert.isTrue(lambda.dependentKeys.indexOf('b') !== -1);
      assert.isTrue(lambda.dependentKeys.indexOf('c') !== -1);
    })
  ),

  should("have a function named 'cacheable'", function () {
    assert.kindOf("function", Espresso.property(function () {}).cacheable);
  }),

  context("cacheable",
    should("annotate the function to mark it as 'isCacheable'", function () {
      var lambda = Espresso.property(function () {}).cacheable();
      assert.isTrue(lambda.isCacheable);
    }),

    should("annotate the function to mark it as 'isProperty'", function () {
      var lambda = Espresso.property(function () {}).cacheable();
      assert.isTrue(lambda.isProperty);
    })
  ),

  should("have a function named 'idempotent'", function () {
    assert.kindOf("function", Espresso.property(function () {}).idempotent);
  }),

  context("idempotent",
    should("annotate the function to mark it as 'isIdempotent'", function () {
      var lambda = Espresso.property(function () {}).idempotent();
      assert.isTrue(lambda.isIdempotent);
    }),

    should("annotate the function to mark it as 'isProperty'", function () {
      var lambda = Espresso.property(function () {}).idempotent();
      assert.isTrue(lambda.isProperty);
    })
  ),

  should("have a function named 'bind'", function () {
    assert.kindOf("function", Function.prototype.bind);
  }),

  context("bind",
    should("properly bind `this` for functions", function () {
      var that = "foo", lambda = function () { assert.equal(that, this); };
      lambda.bind(that)();
    }),

    should("properly bind `this` for constructors", function () {
      var that = "foo", K;
      function Class() {
        assert.isTrue(this instanceof Class);
      }
      K = Class.bind(that);
      new K();
    }),

    should("pass extra arguments along for the ride", function () {
      var that = "foo", lambda = function (a, b, c) { assert.equal(a, 'a');
                                                      assert.equal(b, 'b');
                                                      assert.equal(c, 'c');
                                                      assert.equal(that, this); };
      lambda.bind(that, 'a', 'b')('c');
    })
  )
);
