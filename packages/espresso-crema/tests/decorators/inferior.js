module('decorators/inferior');

test("will override a function if it's marked as inferior", function () {
  var coffee = {
    sugar: function () {
      return 'Just a teaspoon';
    }
  };
  equals('Just a teaspoon', coffee.sugar());

  mix({
    sugar: Espresso.inferior(function () {
      return 'Yes, please';
    })
  }).into(coffee);
  equals('Just a teaspoon', coffee.sugar());
});

test('will override inferior functions', function () {
  var coffee = {
    sugar: Espresso.inferior(function () {
      return 'Just a teaspoon';
    })
  };
  equals('Just a teaspoon', coffee.sugar());

  mix({
    sugar: Espresso.inferior(function () {
      return 'Yes, please';
    })
  }).into(coffee);
  equals('Yes, please', coffee.sugar());
});
