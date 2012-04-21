module('decorators/refine');

test('provide `super` functionality via `refine`', function () {
  var superman = mix({
    greet: function () {
      return "No, it's Superman!";
    }
  }, {
    greet: Espresso.refine(function (original) {
      return "It's a plane!\n" + original();
    })
  }, {
    greet: Espresso.refine(function (original) {
      return "It's a bird!\n" + original();
    })
  }).into({});

  equals("It's a bird!\nIt's a plane!\nNo, it's Superman!", superman.greet());
});