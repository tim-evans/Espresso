var promise;

module("Promise", {
  setup: function () {
    promise = new Espresso.Promise();

    // Precondition
    equals(promise.state(), Espresso.Promise.UNFULFILLED);
  }
});

test("when fulfilling a promise, the state becomes 'fulfilled'", function () {
  promise.fulfill();
  equals(promise.state(), Espresso.Promise.FULFILLED);
});

test("when smashing a promise, the state becomes 'failed'", function () {
  promise.smash();
  equals(promise.state(), Espresso.Promise.FAILED);
});

test("the first argument to 'then' should be called when the promise is fulfilled", function () {
  var isFulfilled = false;
  promise.then(function () {
    isFulfilled = true;
  });

  promise.fulfill();

  ok(isFulfilled, "the callback should have been called");
});

test("the first argument to 'then' should be called when the promise is fulfilled", function () {
  var hasFailed = false;
  promise.then(null, function () {
    hasFailed = true;
  });

  promise.smash();

  ok(hasFailed, "the callback should have been called");
});

test("multiple callbacks should be allowed", function () {
  var fulfilled = 0,
      failed = 0;
  promise.then(function () {
    fulfilled++;
  }, function () {
    failed++;
  }).then(function () {
    fulfilled++;
  }, function () {
    failed++;
  });

  promise.fulfill();
  equals(2, fulfilled, "2 success callbacks should have been called");
  equals(0, failed, "0 failure callbacks should have been called");

  // Reset the promise to test failures too.
  promise.reset();
  fulfilled = failed = 0;

  promise.smash();
  equals(0, fulfilled, "0 success callbacks should have been called");
  equals(2, failed, "2 failure callbacks should have been called");
});

test("the callbacks should be called with the direct arguments passed into `fulfill` and `smash`", function () {
  expect(13);

  var fulfilled = 0,
      failed = 0;
  promise.then(function (a, b, c) {
    equals('a', a);
    equals('b', b);
    equals('c', c);
  }, function (d, e, f) {
    equals('d', d);
    equals('e', e);
    equals('f', f);
  }).then(function (a, b, c) {
    equals('a', a);
    equals('b', b);
    equals('c', c);
  }, function (d, e, f) {
    equals('d', d);
    equals('e', e);
    equals('f', f);
  });

  promise.fulfill('a', 'b', 'c');

  // Reset the promise to test failures too.
  promise.reset();

  promise.smash('d', 'e', 'f');
});
