module('Number/isFinite');

test("should return true only iff it's a number", function () {
  ok(!Number.isFinite(NaN));
  ok(!Number.isFinite("foo"));
  ok(!Number.isFinite(Infinity));
  ok(!Number.isFinite(-Infinity));
  ok(Number.isFinite(0));
});


module('Number/isNaN');

test("should return true only iff it's a number", function () {
  ok(Number.isNaN(NaN));
  ok(!Number.isNaN("foo"));
  ok(!Number.isNaN(Infinity));
  ok(!Number.isNaN(-Infinity));

  ok(Number.isNaN(parseInt("foo")));
});


module('Number/isInteger');

test("should return true only iff and an integer", function () {
  ok(!Number.isInteger(NaN));
  ok(!Number.isInteger("foo"));
  ok(!Number.isInteger(Infinity));
  ok(!Number.isInteger(-Infinity));
  ok(!Number.isInteger(-12345678.9));
  ok(!Number.isInteger(1234567.89));

  ok(Number.isInteger(10));
  ok(Number.isInteger(-100));
});


module('Number/toInteger');

test("should return non-numbers as +0", function () {
  equals(Number.toInteger(NaN), +0);
  equals(Number.toInteger("foo"), +0);
});

test("should return integers as-is", function () {
  equals(Number.toInteger(Infinity), +Infinity);
  equals(Number.toInteger(-Infinity), -Infinity);

  equals(Number.toInteger(10), 10);
  equals(Number.toInteger(-100), -100);
});

test("should return floats rounded down", function () {
  equals(Number.toInteger(-12345678.9), -12345678);
  equals(Number.toInteger(1234567.89), 1234567);
});
