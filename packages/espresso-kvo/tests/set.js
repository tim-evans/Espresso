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

test('notifies subscribers to `key` right before the key changes (regular properties)', function () {
  var didChange = false,
      o = {};

  Espresso.addBeforeObserver(o, 'key', function () {
    equals(o.value, null);
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key` right before the key changes (computed properties)', function () {
  var didChange = false,
      o = mix({
        _v: null,
        key: Espresso.property(function (k, v) {
          if (v) this._v = v;
          return this._v;
        })
      }).into({});
  Espresso.init(o);

  Espresso.addBeforeObserver(o, 'key', function () {
    equals(Espresso.get(o, 'key'), null);
    equals(o._v, null);
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key` when the key changes (regular properties)', function () {
  var didChange = false,
      o = {};

  Espresso.addObserver(o, 'key', function () {
    equals(o.key, 'value');
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies subscribers to `key` when the key changes (computed properties)', function () {
  var didChange = false,
      o = mix({
        _v: null,
        key: Espresso.property(function (k, v) {
          if (v) this._v = v;
          return this._v;
        })
      }).into({});
  Espresso.init(o);

  Espresso.addObserver(o, 'key', function () {
    equals(Espresso.get(o, 'key'), 'value');
    didChange = true;
  });

  set(o, 'key', 'value');
  ok(didChange);
});

test('notifies computed properties when any dependant keys change', function () {
  var didChange = false,
      willChange = false,
      beforeName = 'Bob Parr',
      afterName = 'Helen Parr',
      o = mix({
        firstName: 'Bob',
        lastName: 'Parr',
        fullName: Espresso.property(function (k, v) {
          return this.firstName + ' ' + this.lastName;
        }, 'firstName', 'lastName')
      }).into({});
  Espresso.init(o);

  Espresso.addBeforeObserver(o, 'fullName', function () {
    ok(!didChange);
    equals(Espresso.get(o, 'fullName'), beforeName);
    willChange = true;
  });

  Espresso.addObserver(o, 'fullName', function () {
    ok(willChange);
    equals(Espresso.get(o, 'fullName'), afterName);
    didChange = true;
  });

  set(o, 'firstName', 'Helen');
  ok(willChange);
  ok(didChange);

  willChange = didChange = false;
  beforeName = afterName;
  afterName = 'Helen Mirren';

  set(o, 'lastName', 'Mirren');
  ok(willChange);
  ok(didChange);
});

test('idempotent properties are only invoked once when the same value is used to set it', function () {
  var cInvoke = 0,
      o = mix({
    key: Espresso.property(function (k, v) {
      cInvoke++;
      return 'value';
    }).idempotent()
  }).into({});
  Espresso.init(o);

  equals(cInvoke, 0);
  equals(set(o, 'key', 'value'), o);
  equals(cInvoke, 1);

  equals(set(o, 'key', 'value'), o);
  equals(cInvoke, 1);
});
