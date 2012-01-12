module('set');

var set = Espresso.set;

test('the result of `set` is the target object', function () {
  var o = {};
  equals(set(o, 'foo', 'bar'), o);
});

test('sets the value of the key on the target', function () {
  var o = {};
  set(o, 'key', 'value');
  equals(o.key, 'value');
});

test('sets the result of a property defined using the `set` keyword', function () {
  var called = null,
      o = {
        set key(value) { called = value; }
      };

  set(o, 'key', 'value');
  equals(called, 'value');
});

test('will set a property defined using computed properties', function () {
  var called = [],
      o = mix({
        key: Espresso.property(function (key, value) {
          called = arguments;
        })
      }).into({});
  Espresso.init(o);

  set(o, 'key', 'value');
  equals(called.length, 2);
  equals(called[0], 'key');
  equals(called[1], 'value');
});

test('notifies subscribers to `key:before` right before the key changes (regular properties)', function () {
  var didChange = false,
      o = {};

  Espresso.subscribe(o, 'key:before', null, function () {
    equals(o.value, null);
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key:before` right before the key changes (computed properties)', function () {
  var didChange = false,
      o = mix({
        _v: null,
        key: Espresso.property(function (k, v) {
          if (v) this._v = v;
          return this._v;
        })
      }).into({});
  Espresso.init(o);

  Espresso.subscribe(o, 'key:before', null, function () {
    equals(Espresso.get(o, 'key'), null);
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key:change` when the key changes (regular properties)', function () {
  var didChange = false,
      o = {};

  Espresso.subscribe(o, 'key:change', null, function () {
    equals(o.key, 'value');
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key:change` when the key changes (computed properties)', function () {
  var didChange = false,
      o = mix({
        _v: null,
        key: Espresso.property(function (k, v) {
          if (v) this._v = v;
          return this._v;
        })
      }).into({});
  Espresso.init(o);

  Espresso.subscribe(o, 'key:change', null, function () {
    equals(Espresso.get(o, 'key'), 'value');
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});
