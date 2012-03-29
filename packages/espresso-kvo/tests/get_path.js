module('getPath');

var getPath = Espresso.getPath;

test('returns the result of normally defined properties', function () {
  var o = { a: { b: { c: 'value' } } };
  equals(getPath(o, 'a.b.c'), 'value');
});

test('returns the result of a property defined using the `get` keyword', function () {
  var o = {
    get a() { return { b: { c: 'value' } }; }
  };
  equals(getPath(o, 'a.b.c'), 'value');
});

test('returns the result of a property defined using the computed properties', function () {
  var o = mix({
    a: Espresso.property(function () {
      return { b: this };
    }),
    c: Espresso.property(function () {
      return 'value';
    })
  }).into({});
  Espresso.init(o);

  equals(getPath(o, 'a.b.c'), 'value');
});
