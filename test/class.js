/*global context setup should assert Espresso*/

context("Espresso.Class",
  should("be defined", function () {
    assert.isTrue(Espresso.Class);
  }),

  should("should be a function", function () {
    assert.kindOf("function", Espresso.Class);
  }),

  should("have a function named extend", function () {
    assert.kindOf("function", Espresso.Class.extend);
  }),

  should("be an object when invoked", function () {
    assert.kindOf("object", new Espresso.Class());
  }),

  should("have an instance function named toJSON", function () {
    assert.kindOf("function", (new Espresso.Class()).toJSON);
  }),

  context("toJSON",
    should("filter all variables starting with _", function () {
      var Cappucino =  Espresso.Class.extend({
        _sugar: 'Just a teaspoon'
      }, {
        _milk: 'Milk me!'
      });

      var json = new Cappucino().toJSON();

      assert.isFalse(json._sugar);
      assert.isFalse(json._milk);
    }),

    should("filter all functions", function () {
      var Cappucino = Espresso.Class.extend({
        func: function () {}
      });

      assert.isFalse(new Cappucino().toJSON().func);
    }),

    should("not have any properties on it initially", function () {
      var json = new Espresso.Class().toJSON(),
          length = 0;
      for (var k in json) {
        if (json.hasOwnProperty(k)) {
          length++;
        }
      }
      assert.equal(0, length);
    })
  ),

  should("mixin Espresso.KVO", function () {
    assert.mixesIn(Espresso.Class.prototype, Espresso.KVO);
  }),

  should("mixin Espresso.PubSub", function () {
    assert.mixesIn(Espresso.Class.prototype, Espresso.PubSub);
  }),

  context("extend",
    should("be an instance of the Espresso.Class", function () {
      var Cappucino = Espresso.Class.extend();
      assert.isTrue(new Cappucino() instanceof Cappucino);
      assert.isTrue(new Cappucino() instanceof Espresso.Class);
    }),

    should("not call init() on extend()", function () {
      var called = false;
      var Cappucino = Espresso.Class.extend({
        init: function () {
          called = true;
        }
      });
      assert.isFalse(called);
    }),

    should("mixin arguments passed into extend()", function () {
      var Cappucino = Espresso.Class.extend({
        sugar: 'Just a teaspoon'
      }, {
        milk: 'Milk me!'
      });
      assert.isFalse(Cappucino.sugar);
      assert.isFalse(Cappucino.milk);

      var coffee = new Cappucino();
      assert.equal("Just a teaspoon", coffee.sugar);
      assert.equal("Milk me!", coffee.milk);
    }),

    should("pass all arguments provided in the constructor to init", function () {
      var called = false;
      var Cappucino = Espresso.Class.extend({
        init: function (a, b, c) {
          called = true;
          assert.equal('a', a);
          assert.equal('b', b);
          assert.equal('c', c);
        }
      });

      var coffee = new Cappucino('a', 'b', 'c');
      assert.isTrue(called);
    })
  )
);
