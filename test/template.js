/*global context setup should assert Espresso*/

context("Espresso.Template",
  should("be defined", function () {
    assert.isTrue(Espresso.Template);
  }),

  should("should be an object", function () {
    assert.kindOf("object", Espresso.Template);
  }),

  should("have a function named extend", function () {
    assert.kindOf("function", Espresso.Template.extend);
  }),

  should("have a function named toJSON", function () {
    assert.kindOf("function", Espresso.Template.toJSON);
  }),

  context("toJSON",
    should("filter all variables starting with _", function () {
      var json = Espresso.Template.extend({
        _sugar: 'Just a teaspoon'
      }, {
        _milk: 'Milk me!'
      }).toJSON();
      assert.isFalse(json._sugar);
      assert.isFalse(json._milk);
    }),

    should("filter all functions", function () {
      var json = Espresso.Template.extend({
        func: function () {}
      }).toJSON();
      assert.isFalse(json.func);
    }),

    should("not have any properties on it initially", function () {
      var json = Espresso.Template.toJSON(),
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
    assert.mixesIn(Espresso.Template, Espresso.KVO);
  }),

  should("mixin Espresso.PubSub", function () {
    assert.mixesIn(Espresso.Template, Espresso.PubSub);
  }),

  context("extend",
    should("mixin arguments passed into extend()", function () {
      var Cappucino = Espresso.Template.extend({
        sugar: 'Just a teaspoon'
      }, {
        milk: 'Milk me!'
      });
      assert.equal("Just a teaspoon", Cappucino.sugar);
      assert.equal("Milk me!", Cappucino.milk);
    }),

    should("pass all arguments provided in the constructor to init", function () {
      var called = false;
      var Cappucino = Espresso.Template.extend({
        init: function () {
          called = true;
        }
      });
      assert.isTrue(called);
    })
  )
);
