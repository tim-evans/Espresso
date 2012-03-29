var isCallable = Espresso.isCallable,
    enumerable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

module('Array/isArray');

test('returns `true` if the Object is an Array', function () {
  ok(Array.isArray(new Array()));
  ok(Array.isArray([]));
  ok(!Array.isArray({ length: 0 }));

  // Test sandboxing
  if (document) {
    var iframe = document.createElement('iframe'),
        IFArray;
    document.body.appendChild(iframe);
    IFArray = iframe.contentWindow.Array;
    if (IFArray) {
      ok(Array.isArray(new IFArray()), 'sandboxed Arrays in iframes should be Arrays');
    }
    document.body.removeChild(iframe);
  }
});


module('Array/forEach');

test('has an instance function named `forEach`', function () {
  ok(isCallable([].forEach));
});

test('it should iterate over all items', function () {
  var arr = [1, 2, 3, 4, 5], called = 0;
  arr.forEach(function (v, i, self) {
    equals(arr, self);
    equals(i, called++);
    equals(v, called);
  });
  equals(called, 5);
});


module('Array/indexOf');

test('has an instance function named `indexOf`', function () {
  ok(isCallable([].indexOf));
});

test('it should return the index of the object passed in', function () {
  var obj = { key: 'blah' },
      arr = [3, true, 'foo', obj, true];

  equals(arr.indexOf(3), 0);
  equals(arr.indexOf(true), 1);
  equals(arr.indexOf('foo'), 2);
  equals(arr.indexOf(obj), 3);
});

test("it should return -1 if the object doesn't exist", function () {
  var arr = [3, true, 'foo'];
  equals(arr.indexOf('ohai'), -1);
});


module('Array/lastIndexOf');

test('has an instance function named `lastIndexOf`', function () {
  ok(isCallable([].lastIndexOf));
});

test('it returns the last index of the element to find', function () {
  var obj = { key: 'blah' },
      arr = [3, true, 'foo', obj, true];

  equals(arr.lastIndexOf(3), 0);
  equals(arr.lastIndexOf(true), 4);
  equals(arr.lastIndexOf('foo'), 2);
  equals(arr.lastIndexOf(obj), 3);
});

test("it returns -1 if the element wasn't found", function () {
  var arr = [3, true, 'foo'];
  equals(arr.lastIndexOf('ohai'), -1);
});


module('Array/map');

test('has an instance function named `map`', function () {
  ok(isCallable(enumerable.map));
});

test("throw an error if no function is provided", function () {
  raises(enumerable.map, TypeError);
});

test("return an Array", function () {
  ok(Array.isArray(enumerable.map(function () {})));
});

test("have the same length as the enumerable", function () {
  equals(enumerable.map(function () {}).length, 10);
});

test("call the function with 3 arguments", function () {
  enumerable.map(function () {
    equals(arguments.length, 3);
  });
});

test("have an optional second argument that augments `this`", function () {
  enumerable.map(function () {
    equals('foo', this.toString());
  }, 'foo');
});


module('Array/reduce');

test('has an instance function named `reduce`', function () {
  ok(isCallable([].reduce));
});

test('it should thow an error if no function is provided', function () {
  raises([].reduce, TypeError);
});

test('it has an optional argument that is the initial value', function () {
  [].reduce(function (init) {
    equals(10, init);
  }, 10);
});

test('it uses the first item in the array as the initial value', function () {
  [10].reduce(function (init) {
    equals(10, init);
  });
});

test('it returns the value returned to the next item in the array', function () {
  enumerable.reduce(function (init) {
    equals(10, init);
    return init;
  }, 10);
});

test('callbacks get passed 4 arguments', function () {
  enumerable.reduce(function (init, key, value, self) {
    equals(arguments.length, 4);
  });
});

test('it has the proper arguments passed in for each element', function () {
  var num = 1;
  enumerable.reduce(function (init, key, value, self) {
    equals(num++, key);
    equals(init, key - 1);
    equals(self, enumerable);
    equals(value, key);
    return key;
  });
});


module('Array/reduceRight');

test('has an instance function named `reduceRight`', function () {
  ok(isCallable([].reduceRight));
});

test('should reduce an array (from the end to the beginning)', function () {
  var arr = [3, 2, 1, 0];

  equals(arr.reduceRight(function (E, v, i, self) {
    equals(arr, self);
    equals(3 - i, v);
    return E + v;
  }), 6);
});

test('should reduce an array (from the end to the beginning)', function () {
  var arr = [3, 2, 1, 0];

  equals(arr.reduceRight(function (E, v, i, self) {
    equals(arr, self);
    equals(3 - i, v);
    return E + v;
  }), 6);
});


module('Array/reverse');

test('has an instance function named `reverse`', function () {
  ok(isCallable([].reverse));
});

test('it should reverse the source array in place', function () {
  var arr = [1, 2, 4, 8, 16, 32, 64],
      res = arr.reverse(), idx = arr.length, i = 0;

  equals(res, arr);
  while (idx-- > 0) {
    equals(res[i++], Math.pow(2, idx));
  }
});


module('Array/filter');

test('has an instance function named `filter`', function () {
  ok(isCallable([].filter));
});

test('it should throw an error if no function is provided', function () {
  raises(enumerable.filter, TypeError);
});

test('it returns an Array', function () {
  ok(Array.isArray(enumerable.filter(function () {})));
});

test('it calls the function with 3 arguments', function () {
  enumerable.filter(function () {
    equals(arguments.length, 3);
  });
});

test('that is has an optional second argument that augments the scope', function () {
  enumerable.filter(function () {
    equals('foo', this.toString());
  }, 'foo');
});


module('Array/some');

test('has an instance function named `some`', function () {
  ok(isCallable([].some));
});

test('it should throw an error if no function is provided', function () {
  raises(enumerable.some, TypeError);
});

test('it returns true if any of the iterations returns true', function () {
  ok(enumerable.some(function (v) {
    return v === 0;
  }));
});

test('it return false all of the iterations returns false', function () {
  ok(!enumerable.some(function (v) {
    return false;
  }));
});

test('it calls the function with 3 arguments', function () {
  enumerable.some(function () {
    equals(arguments.length, 3);
  });
});

test('it has an optional second argument that augments the scope', function () {
  enumerable.some(function () {
    equals('foo', this.toString());
  }, 'foo');
});


module('Array/every');

test('has an instance function named `every`', function () {
  ok(isCallable([].every));
});

test('it should throw an error if no function is provided', function () {
  raises(enumerable.every, TypeError);
});

test('it returns true if all of the iterations returns true', function () {
  ok(enumerable.every(function (v) {
    return true;
  }));
});

test('it return false any of the iterations returns false', function () {
  ok(!enumerable.every(function (v) {
    return v !== 0;
  }));
});

test('it calls the function with 3 arguments', function () {
  enumerable.every(function () {
    equals(arguments.length, 3);
  });
});

test('it has an optional second argument that augments the scope', function () {
  enumerable.every(function () {
    equals('foo', this.toString());
  }, 'foo');
});
