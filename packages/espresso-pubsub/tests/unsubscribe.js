module('pubsub/unsubscribe');

var subscribe = Espresso.subscribe,
    unsubscribe = Espresso.unsubscribe,
    publish = Espresso.publish;

test('`unsubscribe` throws an error when the host object is null or undefined', function () {
  raises(function () {
    unsubscribe(undefined, 'espresso:error');
  }, TypeError, 'should throw an error for `undefined`');

  raises(function () {
    unsubscribe(null, 'espresso:error');
  }, TypeError, 'should throw an error for `null`');
});

test('unsubscribing from a non-existing event will do nothing', function () {
  unsubscribe({}, 'espresso:event', null, Espresso.K);
  ok(true, 'no error should have been thrown');  
});

test('unsubscribing from the handler will stop it from being notified', function () {
  var called = 0,
      o = {},
      fun = function () { called++; };

  subscribe(o, 'espresso:event', null, fun);
  publish(o, 'espresso:event');
  equals(called, 1, 'the callback should be called once');

  unsubscribe(o, 'espresso:event', null, fun);
  publish(o, 'espresso:event');
  equals(called, 1, 'the callback should be called once');
});

test('unsubscribing from the handler / target pair will stop it from being notified', function () {
  var called = '',
      o = {},
      fun = function () { called += this; };

  subscribe(o, 'espresso:event', 'a', fun);
  subscribe(o, 'espresso:event', 'b', fun);
  subscribe(o, 'espresso:event', 'c', fun);

  publish(o, 'espresso:event');
  equals(called, 'abc', 'the callback should be called by all subscribers');

  called = '';
  unsubscribe(o, 'espresso:event', 'c', fun);
  publish(o, 'espresso:event');
  equals(called, 'ab');

  called = '';
  unsubscribe(o, 'espresso:event', 'b', fun);
  publish(o, 'espresso:event');
  equals(called, 'a');

  called = '';
  unsubscribe(o, 'espresso:event', 'a', fun);
  publish(o, 'espresso:event');
  equals(called, '');
});
