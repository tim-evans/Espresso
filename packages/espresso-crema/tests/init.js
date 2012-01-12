module("init");
var metaPath = Espresso.metaPath,
    init = Espresso.init;

test("that initializing an object is only allowed once", function () {
  var o = {},
      callCount = 0;

  o.init = function () {};
  metaPath(o.init, ['init', 'test'], function () {
    callCount++;
  });

  o = mix(o).into({});
  equals(callCount, 0);

  init(o);
  equals(callCount, 1);

  init(o);
  equals(callCount, 1);
});

test("the property to be initialized is called with the target object, the value, and key", function () {
  var o = {},
      called = false;

  o.init = function () {};
  metaPath(o.init, ['init', 'test'], function (target, value, key) {
    called = true;
    equals(target, o);
    equals(value, o.init);
    equals(key, 'init');
  });

  o = mix(o).into({});
  init(o);
  ok(called);
});
