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

  should("have a function named 'toArray'", function () {
    assert.kindOf("function", Espresso.Enumerable.toArray);
  }),

  context("toArray",
    should("return the values of the enumerable as an Array", function () {
      var arr = enumerable.toArray();
      assert.kindOf("array", arr);
      assert.equal(10, arr.length);

      for (var i = 0, len = arr.length; i < len; i++) {
        assert.equal(i, arr[i]);
      }
    })
  ),

  should("have a function named 'filter'", function () {
    assert.kindOf("function", Espresso.Enumerable.filter);
  }),

  should("have a function named 'every'", function () {
    assert.kindOf("function", Espresso.Enumerable.every);
  }),

  should("have a function named 'some'", function () {
    assert.kindOf("function", Espresso.Enumerable.some);
  }),

  should("have a function named 'extract'", function () {
    assert.kindOf("function", Espresso.Enumerable.extract);
  }),

  should("have a function named 'find'", function () {
    assert.kindOf("function", Espresso.Enumerable.find);
  }),

  should("have a function named 'contains'", function () {
    assert.kindOf("function", Espresso.Enumerable.contains);
  })
);
