/*global context setup should assert Espresso mix*/

var enumerable;
context("Espresso.Enumerable",
  setup(function () {
    enumerable = mix(Espresso.Enumerable).into({
      forEach: function (lambda, self) {
        for (var i = 0; i < 10; i++) {
          lambda.call(self || this, i, true, this);
        }
      }
    });
  }),

  should("be defined", function () {
    assert.isTrue(Espresso.Enumerable);
  }),

  should("be an Object", function () {
    assert.kindOf("object", Espresso.Enumerable);
  }),

  should("have a function named 'forEach'", function () {
    assert.kindOf("function", Espresso.Enumerable.forEach);
  }),

  context("forEach",
    should("throw an error if not overridden", function () {
      assert.raises(Error, Espresso.Enumerable.forEach);
    })
  ),

  should("have a function named 'map'", function () {
    assert.kindOf("function", Espresso.Enumerable.map);
  }),

  context("map",
    should("throw an error if no function is provided", function () {
      assert.raises(Error, Espresso.Enumerable.map);
    }),

    should("return an Array", function () {
      assert.isTrue(Array.isArray(enumerable.map(function () {})));
    }),

    should("have the same length as the enumerable", function () {
      assert.equal(enumerable.map(function () {}).length, 10);
    }),

    should("call the function with 3 arguments", function () {
      enumerable.map(function () {
        assert.equal(arguments.length, 3);
      });
    }),

    should("have an optional second argument that augments `this`", function () {
      enumerable.map(function () {
        assert.equal('foo', this.toString());
      }, 'foo');
    })
  ),

  should("have a function named 'reduce'", function () {
    assert.kindOf("function", Espresso.Enumerable.reduce);
  }),

  context("reduce",
    should("thow an error if no function is provided", function () {
      assert.raises(Error, Espresso.Enumerable.reduce);
    }),

    should("have an optional argument that is the initial value", function () {
      mix(Espresso.Enumerable, {
        forEach: function () {}
      }).into({}).reduce(function (init) {
        assert.equal(10, init);
      }, 10);
    }),

    should("use the first item in the enumerable as the initial value", function () {
      mix(Espresso.Enumerable, {
        forEach: function (lambda, self) { lambda(10); }
      }).into({}).reduce(function (init) {
        assert.equal(10, init);
      });
    }),

    should("return the value returned to the next item in the enumerable", function () {
      enumerable.reduce(function (init) {
        assert.equal(10, init);
        return init;
      }, 10);
    }),

    should("have 4 arguments", function () {
      enumerable.reduce(function (init, key, value, self) {
        assert.equal(arguments.length, 4);
      });
    }),

    should("have the proper arguments passed in for each element", function () {
      var num = 1;
      enumerable.reduce(function (init, key, value, self) {
        assert.equal(num++, key);
        assert.equal(init, key - 1);
        assert.equal(self, enumerable);
        assert.equal(value, true);
        return key;
      });
    })
  ),

  should("have a function named 'filter'", function () {
    assert.kindOf("function", Espresso.Enumerable.filter);
  }),

  context("filter",
    should("thow an error if no function is provided", function () {
      assert.raises(Error, Espresso.Enumerable.filter);
    }),

    should("return an Array", function () {
      assert.isTrue(Array.isArray(enumerable.filter(function () {})));
    }),

    should("call the function with 3 arguments", function () {
      enumerable.filter(function () {
        assert.equal(arguments.length, 3);
      });
    }),

    should("have an optional second argument that augments `this`", function () {
      enumerable.filter(function () {
        assert.equal('foo', this.toString());
      }, 'foo');
    })
  ),

  should("have a function named 'every'", function () {
    assert.kindOf("function", Espresso.Enumerable.every);
  }),

  context("every",
    should("thow an error if no function is provided", function () {
      assert.raises(Error, Espresso.Enumerable.every);
    }),

    should("return true if all of the iterations returns true", function () {
      assert.isTrue(enumerable.every(function (v) {
        return true;
      }));
    }),

    should("return false any of the iterations returns false", function () {
      assert.isFalse(enumerable.every(function (v) {
        return v !== 0;
      }));
    }),

    should("call the function with 3 arguments", function () {
      enumerable.every(function () {
        assert.equal(arguments.length, 3);
      });
    }),

    should("have an optional second argument that augments `this`", function () {
      enumerable.every(function () {
        assert.equal('foo', this.toString());
      }, 'foo');
    })
  ),

  should("have a function named 'some'", function () {
    assert.kindOf("function", Espresso.Enumerable.some);
  }),

  context("some",
    should("thow an error if no function is provided", function () {
      assert.raises(Error, Espresso.Enumerable.some);
    }),

    should("return true if any of the iterations returns true", function () {
      assert.isTrue(enumerable.some(function (v) {
        return v === 0;
      }));
    }),

    should("return false if none of the iterations returns true", function () {
      assert.isFalse(enumerable.some(function (v) {}));
    }),

    should("call the function with 3 arguments", function () {
      enumerable.some(function () {
        assert.equal(arguments.length, 3);
      });
    }),

    should("have an optional second argument that augments `this`", function () {
      enumerable.some(function () {
        assert.equal('foo', this.toString());
      }, 'foo');
    })
  )
);