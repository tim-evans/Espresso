module('Decorator/create', {
  teardown: function () {
    event.precondition = null;
    event.preprocess = null;
    event.process = null;
    event.init = null;
  }
});

test('throws an error when the specification has no name', function () {
  raises(Espresso.Decorator.create, Error);
});

test('at minimum needs a name on the specification', function () {
  ok(Espresso.Decorator.create({
    name: 'test:errors:event'
  }));
});

test('will throw an error when another decorator is created with a registed name', function () {
  raises(function () {
    Espresso.Decorator.create({
      name: 'test:errors:event'
    });
  }, Error);
});

test('the decorator is registered in the registry', function () {
  var spec = {
    name: 'test:decorators:registry'
  };
  Espresso.Decorator.create(spec);
  equals(spec, Espresso.Decorator.registry['test:decorators:registry']);
});

var event = {
  name: 'test:event'
}, dEvent = Espresso.Decorator.create(event);

test('will call preprocess as soon as the decorator is created', function () {
  var didCall = false,
      o = {};

  event.preprocess = function (target, a, b, c) {
    didCall = true;
    equals(a, 'a');
    equals(b, 'b');
    equals(c, 'c');
    return 'OHAI';
  };

  ok(!didCall);
  equals(dEvent(o, 'a', 'b', 'c'), 'OHAI');
  ok(didCall);
});

test('will decorate the object conditionally according to the return result of precondition', function () {
  var didCall = false,
      o = {};

  event.precondition = function (target, a, b, c) {
    equals(target, o);
    equals(a, 'a');
    equals(b, 'b');
    equals(c, 'c');
    return false;
  };

  event.preprocess = function (target, a, b, c) {
    didCall = true;
    equals(target, o);
    equals(a, 'a');
    equals(b, 'b');
    equals(c, 'c');
    return 'OHAI';
  };

  ok(!didCall);
  equals(dEvent(o, 'a', 'b', 'c'), o);
  ok(!didCall);

  event.precondition = function () {
    return true;
  };

  equals(dEvent(o, 'a', 'b', 'c'), 'OHAI');
  ok(didCall);
});

test('will call process on mixin time', function () {
  var didCall = false,
      template = {},
      o = {};

  event.process = function (target, value, key) {
    didCall = true;
    equals(target, o);
    equals(value, template.click);
    equals(key, 'click');
    return value;
  };

  ok(!didCall);
  template.click = function () {};
  equals(dEvent(template.click), template.click);
  ok(!didCall);

  mix(template).into(o);
  ok(didCall);
  equals(o.click, template.click);

  event.process = function (target, value, key) {
    return 'I HAZ YOUR FUNCTION';
  };

  template.click = function () {};
  equals(dEvent(template.click), template.click);

  mix(template).into(o);
  equals(o.click, 'I HAZ YOUR FUNCTION');
});

test('will call init on initialization time', function () {
  var didCall = false,
      template = {},
      o = {};

  event.init = function (target, value, key) {
    didCall = true;
    equals(target, o);
    equals(value, template.click);
    equals(key, 'click');
    return value;
  };

  ok(!didCall);
  template.click = function () {};
  equals(dEvent(template.click), template.click);
  ok(!didCall);

  mix(template).into(o);
  ok(!didCall);
  equals(o.click, template.click);

  Espresso.init(o);
  ok(didCall);
});
