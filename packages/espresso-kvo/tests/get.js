module('get');

var get = Espresso.get;

test('returns the result of normally defined properties', function () {
  var o = { key: 'value' };
  equals(get(o, 'key'), 'value');
});

test('returns the result of a property defined using the `get` keyword', function () {
  var o = {
    get key() { return 'value'; }
  };
  equals(get(o, 'key'), 'value');
});

test('returns the result of a property defined using the computed properties', function () {
  var o = mix({
    key: Espresso.property(function () {
      return 'value';
    })
  }).into({});
  Espresso.init(o);

  equals(get(o, 'key'), 'value');
});
