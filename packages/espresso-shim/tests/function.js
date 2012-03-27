module('Function/bind');

test("`this` is bound for functions", function () {
  var that = "foo", lambda = function () { equals(that, this); };
  lambda.bind(that)();
});

test("`this` is bound for constructors", function () {
  var that = "foo", K;
  function Class() {
    ok(this instanceof Class);
  }
  K = Class.bind(that);
  new K();
});

test("that extra arguments along for the ride", function () {
  var that = "foo",
      lambda = function (a, b, c) { equals(a, 'a');
                                    equals(b, 'b');
                                    equals(c, 'c');
                                    equals(that, this); };
  lambda.bind(that, 'a', 'b')('c');
});
