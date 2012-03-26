module('pubsub/subscribe');

var subscribe = Espresso.subscribe,
    publish = Espresso.publish;

test('`subscribe` throws an error when the host object is null or undefined', function () {
  raises(function () {
    subscribe(undefined, 'espresso:error', null, null);
  }, TypeError, 'should throw an error for `undefined`');

  raises(function () {
    subscribe(null, 'espresso:error', null, null);
  }, TypeError, 'should throw an error for `null`');
});

test("`subscribe` throws an error when the method isn't callable", function () {
  raises(function () {
    subscribe({}, 'espresso:error', null, null);
  }, TypeError);
});

test('subscribing to an event and publishing the event name on the object will notify subscribers', function () {
  var called = false,
      o = {},
      fun = function () { called = true; };
  subscribe(o, 'espresso:event', null, fun);
  ok(!called, 'the callback should not have been called yet');

  publish(o, 'espresso:event');
  ok(called, 'the callback should not have been called');
});

test('callback functions will be passed all arguments passed to publish', function () {
  var called = null,
      o = {},
      fun = function () { called = arguments; };
  subscribe(o, 'espresso:event', null, fun);
  ok(!called, 'the callback should not have been called yet');

  publish(o, 'espresso:event', 'hello', 'world', Espresso);

  equals(called.length, 5, 'the callback should have had 5 arguments supplied to it');
  equals(called[0], o, 'the 1st argument should be the target object');
  equals(called[1], 'espresso:event', 'the 2nd argument should be the event fired');
  equals(called[2], 'hello');
  equals(called[3], 'world');
  same(called[4], Espresso);
});

test('subscribing to the same event multiple times will not result in extra subscriptions', function () {
  var called = 0,
      o = {},
      fun = function () { called++; };
  subscribe(o, 'espresso:event', null, fun);
  subscribe(o, 'espresso:event', null, fun);

  publish(o, 'espresso:event');
  equals(called, 1, 'the callback should not have been called only once');
});

test('subscribing to the same event with different targets and the same callback will trigger the event for each target', function () {
  var called = {},
      o = {},
      fun = function () { called[this] = true; };
  subscribe(o, 'espresso:event', 'target a', fun);
  subscribe(o, 'espresso:event', 'target b', fun);
  equals(Object.keys(called).length, 0, 'the callback should not have been called yet');

  publish(o, 'espresso:event');
  equals(Object.keys(called).length, 2, 'the callback should not have been called twice');

  ok(called['target a'], 'the callback with target "target a" should have been called');
  ok(called['target b'], 'the callback with target "target b" should have been called');
});

test('subscribing to different events will trigger only the subscribers for that event', function () {
  var called = { 'property:before': 0,
                 'property:change': 0 },
      o = {},
      fun = function (host, ev) { this[ev]++; };
  subscribe(o, 'property:before', called, fun);
  subscribe(o, 'property:change', called, fun);

  publish(o, 'property:before');

  equals(called['property:before'], 1, '"property:before" should have been called once');
  equals(called['property:change'], 0, '"property:change" should have not been called yet');

  publish(o, 'property:change');

  equals(called['property:before'], 1, '"property:before" should have been called once');
  equals(called['property:change'], 1, '"property:change" should have been called once');
});

test('multiple subscriptions to the same event will all be triggered (in order of subscription)', function () {
  var called = '',
      o = {},
      f1 = function () { called += 'a'; },
      f2 = function () { called += 'b'; },
      f3 = function () { called += 'c'; },
      f4 = function () { called += 'd'; };


  subscribe(o, 'espresso:event', o, f1);
  subscribe(o, 'espresso:event', o, f2);
  subscribe(o, 'espresso:event', o, f3);
  subscribe(o, 'espresso:event', o, f4);

  publish(o, 'espresso:event');

  equals(called, 'abcd');
});
