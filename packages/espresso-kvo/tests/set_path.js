module('setPath');

var setPath = Espresso.setPath;

test('the result of `setPath` is the target object', function () {
  var o = {};
  equals(setPath(o, 'foo.bar.baz', 'bar'), o);
});

test('sets the value of the key on the nested target', function () {
  var o = { a: { b: { c: null }}};
  setPath(o, 'a.b.c', 'value');
  equals(o.a.b.c, 'value');
});

test('sets the result of a property defined using the `set` keyword', function () {
  var called = null,
      o = {
        a: {
          set b(value) { called = value; }
        }
      };

  setPath(o, 'a.b', 'value');
  equals(called, 'value');
});

test('will set a property defined using computed properties', function () {
  var called = [],
      o = mix({
        a: Espresso.property(function (key, value) {
          return {
            b: this
          };
        }),

        c: Espresso.property(function (key, value) {
          called = arguments;
        })
      }).into({});
  Espresso.init(o);

  setPath(o, 'a.b.c', 'value');
  equals(called.length, 2);
  equals(called[0], 'c');
  equals(called[1], 'value');
});
