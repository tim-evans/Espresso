var deferred,
    promise;

module("Promises/B", {
  setup: function () {
    deferred = Espresso.defer();
    promise = deferred.promise;
  }
});

test("the first argument to 'then' should be called when the promise is resolved", function () {
  var isFulfilled = false;
  promise.then(function () {
    isFulfilled = true;
  });

  deferred.resolve();
  stop();

  promise.then(function () {
    ok(isFulfilled, "the callback should have been called");
    start();
  });
});

test("the second argument to 'then' should be called when the promise is rejected", function () {
  var hasFailed = false;
  promise.then(null, function () {
    hasFailed = true;
  });

  deferred.resolve(Espresso.reject());
  stop();

  promise.then(null, function () {
    ok(hasFailed, "the callback should have been called");
    start();
  });
});

test("chained promises", function () {
  var result,
      chain = promise.then(function (value) {
        return value + 2;
      });

  chain.then(function (res) {
    result = res;
  });

  deferred.resolve(42);
  stop();
  chain.then(function () {
    equals(44, result);
    start();
  });
});

