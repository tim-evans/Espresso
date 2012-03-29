module("A");
var toString = Object.prototype.toString; 

test("Will convert arguments objects into an array", function () {
  equals(toString.call(Espresso.A(arguments)), '[object Array]');
});

test("Pseudo-arrays will be turned into an array", function () {
  var pseudoArray = { length: 5, 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' },
      arr = Espresso.A(pseudoArray);

  equals(toString.call(arr), "[object Array]");
  equals(pseudoArray.length, arr.length);
  for (var i = 0; i < pseudoArray.length; i++) {
    equals(pseudoArray[i], arr[i]);
  }
});

module("K");

test("Will return the arguments passed in", function () {
  equals(Espresso.K("K")[0], "K");
});

module("isCallable");
var isCallable = Espresso.isCallable;

test("A function is callable", function () {
  ok(isCallable(Espresso.K));
});

test("An object with `call` and `apply` as functions is callable", function () {
  ok(isCallable({
    call: Espresso.K,
    apply: Espresso.K
  }));
});

test("An object with `call` xor `apply` as functions is NOT callable", function () {
  ok(!isCallable({
    apply: Espresso.K
  }));

  ok(!isCallable({
    call: Espresso.K
  }));
});

test("Numbers aren't callable", function () {
  ok(!isCallable(2));
});

test("Strings aren't callable", function () {
  ok(!isCallable("hello"));
});

test("Objects aren't callable", function () {
  ok(!isCallable({}));
});

test("Booleans aren't callable", function () {
  ok(!isCallable(true));
  ok(!isCallable(false));
});

test("Non-value objects aren't callable", function () {
  ok(!isCallable(undefined));
  ok(!isCallable(null));
  ok(!isCallable(NaN));
  ok(!isCallable(Infinity));
  ok(!isCallable(-Infinity));
});