/*global context setup should assert mix*/

var version;
context("mix",
  should("be defined", function () {
    assert.isTrue(mix);
  }),

  should("be a function", function () {
    assert.kindOf("function", mix);
  }),

  should("return an object that has a property 'into'", function () {
    assert.isTrue(mix({}).into);
  }),

  context("into",
    should("be a function", function () {
      assert.kindOf("function", mix({}).into);
    }),

    should("add properties provided on 'mix' on the object passed in on 'into'", function () {
      var coffee = {};
      mix({ sugar: "Yes, please" }).into(coffee);
      assert.equal(coffee.sugar, "Yes, please");
    }),

    should("return the object passed in on 'into'", function () {
      var coffee = {};
      assert.equal(coffee, mix({ sugar: "Yes, please" }).into(coffee));
    }),

    should("mixin all object arguments passed into 'mix'", function () {
      var coffee = {};
      mix({ sugar: "Yes, please" },
          { milk: "Why, thank you" },
          { honey: "A dab would do fine" }).into(coffee);

      assert.equal("Yes, please", coffee.sugar);
      assert.equal("Why, thank you", coffee.milk);
      assert.equal("A dab would do fine", coffee.honey);
    }),

    should("override existing properties if provided in 'mix'", function () {
      var coffee = { sugar: "Just a teaspoon" };
      assert.equal("Just a teaspoon", coffee.sugar);

      mix({ sugar: "Yes, please" }).into(coffee);
      assert.equal("Yes, please", coffee.sugar);
    })
  ),

  should("throw an error when mixing into a null or undefined value", function () {
    assert.raises(TypeError, mix({}).into, undefined);
    assert.raises(TypeError, mix({}).into, null);
  }),

  should("treat null or undefined objects as noops", function () {
    var nil;
    assert.isTrue(mix(null).into({}));
    assert.isTrue(mix(nil).into({}));
  }),

  should("make a function alias when annotated as such", function () {
    var result = mix({
      coffee: function () {
        return "caffeine";
      }.alias('cafe', 'koffie')
    }).into({});

    assert.equal("caffeine", result.coffee());
    assert.equal(result.cafe, result.coffee);
    assert.equal(result.koffie, result.coffee);
  }),

  should("not override a function if it's marked as inferior", function () {
    var coffee = {
      sugar: function () {
        return "Just a teaspoon";
      }
    };
    assert.equal("Just a teaspoon", coffee.sugar());

    mix({
      sugar: function () {
        return "Yes, please";
      }.inferior()
    }).into(coffee);
    assert.equal("Just a teaspoon", coffee.sugar());
  }),

  should("ensure that Internet Explorer does NOT clobber toString", function () {
    var espresso = mix({
      toString: function () {
        return "espresso";
      }
    }).into({});
    assert.equal("espresso", espresso.toString());
  }),

  should("ensure that Internet Explorer does NOT clobber valueOf", function () {
    var espresso = mix({
      valueOf: function () {
        return "espresso";
      }
    }).into({});
    assert.equal("espresso", espresso.valueOf());
  }),

  should("provide super() functionality via around()", function () {
    var superman = mix({
      greet: function () {
        return "No, it's Superman!";
      }
    }, {
      greet: function ($super) {
        return "It's a plane!" + "\n" + $super();
      }.around()
    }, {
      greet: function ($super) {
        return "It's a bird!" + "\n" + $super();
      }.around()
    }).into({});

    assert.equal("It's a bird!\nIt's a plane!\nNo, it's Superman!", superman.greet());
  })
);
