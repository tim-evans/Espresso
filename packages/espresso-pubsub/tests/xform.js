module('pubsub/xform');

var publish = Espresso.publish,
    subscribe = Espresso.subscribe;

test('subscribing with an xform will deliver the event to the xform', function () {
  var o = {},
      methodCalled = 0,
      xformCalled = 0;
  subscribe(o, 'bang!', function () {
    methodCalled++;
  }, null, function () {
    xformCalled++;
  });

  equals(methodCalled, 0, 'PRECOND- should not fire yet');
  equals(xformCalled, 0, 'PRECOND- should not fire yet');

  Espresso.publish(o, 'bang!');

  equals(methodCalled, 0, 'should not have fired because xform did not trigger it');
  equals(xformCalled, 1, 'should have fired once');
});

test('xform arguments', function () {
  var o = {},
      wasCalled = false;
  subscribe(o, 'bang!', Espresso.K, 'target', function (target, method, args) {
    equals(target, 'target', 'the target should match the subscribe target');
    equals(method, Espresso.K, 'the method should match the subscribe target');
    equals(args.length, 2, 'there should be 2 arguments');
    equals(args[0], o, 'the first argument should be the object that was published to');
    equals(args[1], 'bang!', 'the second argument should be the event that was published');
    wasCalled = true;
  });

  publish(o, 'bang!');

  ok(wasCalled, 'the xform should have been called');
});
