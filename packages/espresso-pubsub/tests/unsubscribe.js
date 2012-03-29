module('pubsub/unsubscribe');

var subscribe = Espresso.subscribe,
    unsubscribe = Espresso.unsubscribe,
    publish = Espresso.publish;

test('unsubscribing from a non-existing event will do nothing', function () {
  unsubscribe({}, 'espresso:event', Espresso.K);
  ok(true, 'no error should have been thrown');  
});

test('unsubscribing from the handler will stop it from being notified', function () {
  var called = 0,
      o = {},
      fun = function () { called++; };

  subscribe(o, 'espresso:event', fun);
  publish(o, 'espresso:event');
  equals(called, 1, 'the callback should be called once');

  unsubscribe(o, 'espresso:event', fun);
  publish(o, 'espresso:event');
  equals(called, 1, 'the callback should be called once');
});

test('unsubscribing from the handler / target pair will stop it from being notified', function () {
  var called = '',
      o = {},
      fun = function () { called += this; };

  subscribe(o, 'espresso:event', fun, 'a');
  subscribe(o, 'espresso:event', fun, 'b');
  subscribe(o, 'espresso:event', fun, 'c');

  publish(o, 'espresso:event');
  equals(called, 'abc', 'the callback should be called by all subscribers');

  called = '';
  unsubscribe(o, 'espresso:event', fun, 'c');
  publish(o, 'espresso:event');
  equals(called, 'ab');

  called = '';
  unsubscribe(o, 'espresso:event', fun, 'b');
  publish(o, 'espresso:event');
  equals(called, 'a');

  called = '';
  unsubscribe(o, 'espresso:event', fun, 'a');
  publish(o, 'espresso:event');
  equals(called, '');
});
