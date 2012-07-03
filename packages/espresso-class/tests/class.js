module('Espresso.Class');

var init = Espresso.Decorator.create({
  name: 'test:errors:init',
  init: function (target, value, key) {
    value.apply(target);
  }
});

test('`init` is called when a new class is created', function () {
  var called = 0,
      Klass = Espresso.Class.extend({
        init: function () {
          called++;
        }
      });

  equals(called, 0, "`init` shouldn't have been called yet");
  new Klass();
  equals(called, 1, "`init` should have been called once");
});

test('Espresso initializers are called when a new class is created', function () {
  var called = 0,
      Klass = Espresso.Class.extend({
        start: init(function () {
          called++;
        })
      });

  equals(called, 0, "initializers shouldn't have been called yet");
  new Klass();
  equals(called, 1, "initializers should have been called once");
});

test('Instances of Espresso.Class have Espresso.Class as the constructor', function () {
  var klass = new Espresso.Class();
  equals(klass.constructor, Espresso.Class);
});

test('Espresso.Class subclasses are instances of Espresso.Class', function () {
  var A = Espresso.Class.extend(),
      B = A.extend(),
      a = new A(),
      b = new B();

  ok(a instanceof Espresso.Class);
  ok(b instanceof Espresso.Class);
  ok(b instanceof A);
  ok(!(a instanceof B));
});
