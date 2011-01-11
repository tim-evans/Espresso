/*global context setup should assert mix*/

context("Function",
  should("have a function named 'inferior'", function () {
    assert.kindOf("function", Function.prototype.inferior);
  }),

  context("inferior",
    should("ignore the function if mixed into another object with the slot filled on mixin time", function () {
      var lambda = function () {}.inferior(),
          o = { k: "Superior" };
      mix({ k: lambda }).into(o);
      assert.equal(o.k, "Superior");
    }),

    should("mixin the function if the slot is not filled", function () {
      var lambda = function () {}.inferior(),
          o = {};
      mix({ k: lambda }).into(o);
      assert.equal(o.k, lambda);
    })
  ),

  should("have a function named 'alias'", function () {
    assert.kindOf("function", Function.prototype.alias);
  }),

  context("alias",
    should("add slots with the same function given the names on alias on mixin time", function () {
      var lambda = function () {}.alias('George Orwell'),
          orwell = mix({ 'Eric Blair': lambda }).into({});
      assert.equal(orwell['Eric Blair'], orwell['George Orwell']);
    })
  ),

  should("have a function named 'around'", function () {
    assert.kindOf("function", Function.prototype.around);
  }),

  context("around",
    should("prepend an argument to the argument list of the function when called", function () {
      var called = false;
      var o = mix({
        lambda: function () {
          called = true;
          assert.equal(arguments.length, 3);
          assert.equal(arguments[1], 'a');
          assert.equal(arguments[2], 'b');
        }.around()
      }).into({});

      o.lambda('a', 'b');
      assert.isTrue(called);
    }),

    context("super argument",
      should("should be prepended to the argument list", function () {
        var called = false;
        var o = mix({
          lambda: function ($super) {
            $super('a', 'b');
          }.around()
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
          lambda: function ($super) {
            called = true;
            assert.kindOf("function", $super);
          }.around()
        }).into({});

        o.lambda();
        assert.isTrue(called);
      }),

      should("call the base function when invoked", function () {
        var called = false;
        var o = mix({
          lambda: function ($super) {
            $super('a', 'b');
          }.around()
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
          lambda: function ($super) {
            called = true;
            $super('a', 'b');
          }.around()
        }).into({});

        o.lambda();
        assert.isTrue(called);
      }),

      should("bind the value of 'this' to whatever the calling function's 'this' is.", function () {
        var called = false,
            self = "Self should be 'this'";
        var o = mix({
          lambda: function ($super) {
            assert.equal(self, this);
            $super();
          }.around()
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

  should("have a function named 'on'", function () {
    assert.kindOf("function", Function.prototype.on);
  }),

  should("have a function named 'observe'", function () {
    assert.kindOf("function", Function.prototype.observe);
  }),

  should("have a function named 'property'", function () {
    assert.kindOf("function", Function.prototype.property);
  }),

  context("property",
    should("annotate the function to mark it as 'isProperty'", function () {
      var lambda = function () {}.property();
      assert.isTrue(lambda.isProperty);
    }),

    should("annotate the function to mark it's dependentKeys", function () {
      var lambda = function () {}.property();
      assert.equal(lambda.dependentKeys.length, 0);
    }),

    should("annotate the function to mark it's dependentKeys with arguments provided to property", function () {
      var lambda = function () {}.property('a', 'b', 'c');
      assert.equal(lambda.dependentKeys.length, 3);
      assert.isTrue(lambda.dependentKeys.indexOf('a') !== -1);
      assert.isTrue(lambda.dependentKeys.indexOf('b') !== -1);
      assert.isTrue(lambda.dependentKeys.indexOf('c') !== -1);
    })
  ),

  should("have a function named 'cacheable'", function () {
    assert.kindOf("function", Function.prototype.cacheable);
  }),

  context("cacheable",
    should("annotate the function to mark it as 'isCacheable'", function () {
      var lambda = function () {}.cacheable();
      assert.isTrue(lambda.isCacheable);
    }),

    should("annotate the function to mark it as 'isProperty'", function () {
      var lambda = function () {}.cacheable();
      assert.isTrue(lambda.isProperty);
    })
  ),

  should("have a function named 'bind'", function () {
    assert.kindOf("function", Function.prototype.bind);
  }),

  should("have a function named 'curry'", function () {
    assert.kindOf("function", Function.prototype.curry);
  })
);
