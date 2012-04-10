module('Object/keys');

test("return the keys on the object instance.", function () {
  var keys = Object.keys({ a: 'a', b: 'b' });
  ok(keys.indexOf('a') !== -1);
  ok(keys.indexOf('b') !== -1);
});

test("not return keys that aren't it's own property", function () {
  var base = mix({ a: 'a', b: 'b' }).into({});
  var F = function () {};
  F.prototype = base;
  base = new F();
  base = mix({ c: 'c', d: 'd' }).into(base);

  var keys = Object.keys(base);

  ok(keys.indexOf('a') === -1);
  ok(keys.indexOf('b') === -1);
  ok(keys.indexOf('c') !== -1);
  ok(keys.indexOf('d') !== -1);
});

test("throw an error if the argument isn't an object", function () {
  raises(Object.keys, TypeError);
  raises(function () {
    Object.keys(null);
  }, TypeError);
  raises(function () {
    Object.keys(undefined);
  }, TypeError);
  raises(function () {
    Object.keys(0);
  }, TypeError);
  raises(function () {
    Object.keys('hello');
  }, TypeError);
});


module('Object/is');

test('NaN should be egal to NaN', function () {
  ok(Object.is(NaN, NaN));
});

test("0 shouldn't be egal to -0", function () {
  ok(!Object.is(+0, -0));
});

test("normal circumstances should work as expected", function () {
  var a = [],
      o = {};

  ok(Object.is(0, 0));
  ok(Object.is('foo', 'foo'));
  ok(Object.is(o, o));
  ok(Object.is(a, a));
  ok(Object.is(Object.is,
               Object.is));

  ok(!Object.is(1, 2));
  ok(!Object.is('foo', 'bar'));
  ok(!Object.is({}, {}));
  ok(!Object.is([], []));
  ok(!Object.is(function () {},
                function () {}));
});
