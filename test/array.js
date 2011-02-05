/*global context setup should assert Espresso formatting*/

context("Array",

  should("have a class function named 'from'", function () {
    assert.kindOf('function', Array.from);
  }),

  context("from",
    should("turn array-like objects (that have a length and can be indexed by []) into an Array", function () {
      var pseudoArray = { length: 5, 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e' },
          arr = Array.from(pseudoArray);

      assert.kindOf("array", arr);
      assert.equal(pseudoArray.length, arr.length);
      for (var i = 0; i < pseudoArray.length; i++) {
        assert.equal(pseudoArray[i], arr[i]);
      }
    })
  ),

  should("have a class function named 'isArray'", function () {
    assert.kindOf('function', Array.isArray);
  }),

  context("isArray",
    should("return `true` if the Object is an Array", function () {
      assert.isTrue(Array.isArray(new Array()));
      assert.isTrue(Array.isArray([]));
      assert.isFalse(Array.isArray({ length: 0 }));
    })
  ),

  should("mixin Espresso.Enumerable", function () {
    assert.mixesIn([], Espresso.Enumerable);
  }),

  should("have an instance function named 'forEach'", function () {
    assert.kindOf('function', [].forEach);
  }),

  context("forEach",
    should("iterate over all items in the array", function () {
      var arr = [1, 2, 3, 4, 5], called = 0;
      arr.forEach(function (v, i, self) {
        assert.equal(arr, self);
        assert.equal(i, called++);
        assert.equal(v, called);
      });
      assert.equal(called, 5);
    })
  ),

  should("have an instance function named 'indexOf'", function () {
    assert.kindOf('function', [].indexOf);
  }),

  context("indexOf",
    should("return the index of the object passed in", function () {
      var obj = { key: 'blah' };
      var arr = [3, true, 'foo', obj, true];

      assert.equal(arr.indexOf(3), 0);
      assert.equal(arr.indexOf(true), 1);
      assert.equal(arr.indexOf('foo'), 2);
      assert.equal(arr.indexOf(obj), 3);
    }),

    should("return -1 if the object doesn't exist", function () {
      var arr = [3, true, 'foo'];
      assert.equal(arr.indexOf('ohai'), -1);
    })
  ),

  should("have an instance function named 'reduceRight'", function () {
    assert.kindOf('function', [].reduceRight);
  }),

  context("reduceRight",
    should("reduce an array (from the end to the beginning)", function () {
      var arr = [3, 2, 1, 0];

      assert.equal(arr.reduceRight(function (E, v, i, self) {
        assert.equal(arr, self);
        assert.equal(3 - i, v);
        return E + v;
      }), 6);
    }),

    should("reduce an array (from the end to the beginning)", function () {
      var arr = [3, 2, 1, 0];

      assert.equal(arr.reduceRight(function (E, v, i, self) {
        assert.equal(arr, self);
        assert.equal(3 - i, v);
        return E + v;
      }), 6);
    })
  ),

  should("have an instance function named 'reverse'", function () {
    assert.kindOf('function', [].reverse);
  }),

  context("reverse",
    should("return the array reversed", function () {
      var arr = [1, 2, 4, 8, 16, 32, 64],
          res = arr.reverse(), idx = arr.length, i = 0;

      assert.equal(res, arr);
      while (idx-- > 0) {
        assert.equal(res[i++], Math.pow(2, idx));
      }
    })
  ),

  should("have an instance function named 'lastIndexOf'", function () {
    assert.kindOf('function', [].lastIndexOf);
  }),

  context("lastIndexOf",
    should("return the last index of the element to find", function () {
      var obj = { key: 'blah' };
      var arr = [3, true, 'foo', obj, true];

      assert.equal(arr.lastIndexOf(3), 0);
      assert.equal(arr.lastIndexOf(true), 4);
      assert.equal(arr.lastIndexOf('foo'), 2);
      assert.equal(arr.lastIndexOf(obj), 3);
    }),

    should("return -1 if the object doesn't exist", function () {
      var arr = [3, true, 'foo'];
      assert.equal(arr.lastIndexOf('ohai'), -1);
    })
  ),

  should("have an instance function named 'flatten'", function () {
    assert.kindOf('function', [].flatten);
  }),

  context("flatten",
    should("return the array flattened", function () {
      var arr = [0, [1, [2, [3, [4]]], 5, [[[6]]]]],
          res = arr.flatten();

      assert.equal(res.length, 7);
      res.forEach(function (v, i) {
        assert.equal(v, i);
      });
    }),

    should("recurse only the number of times provided", function () {
      var arr = [0, [1, [2, [3, [4]]], 5, [[[6]]]]],
          res = arr.flatten(2);

      assert.equal(res.length, 6);
      assert.equal(res[0], 0);
      assert.equal(res[1], 1);
      assert.equal(res[2], 2);
      assert.equal(res[3][0], 3);
      assert.equal(res[3][1][0], 4);
      assert.equal(res[4], 5);
      assert.equal(res[5][0], 6);
    })
  ),

  should("have an instance function named 'unique'", function () {
    assert.kindOf('function', [].unique);
  }),

  context("unique",
    should("return the Array", function () {
      var arr = ['a', 'b', 0, true, 'a', false, /match-me/i, 0, true], res;

      res = arr.unique();
      assert.equal(res.length, 6);
      assert.isTrue(res.indexOf('a') !== -1);
      assert.isTrue(res.indexOf('b') !== -1);
      assert.isTrue(res.indexOf(0) !== -1);
      assert.isTrue(res.indexOf(true) !== -1);
      assert.isTrue(res.indexOf(false) !== -1);
      assert.isTrue(res.indexOf(arr[6]) !== -1);
    })
  ),

  should("have an instance function named 'without'", function () {
    assert.kindOf('function', [].without);
  }),

  context("without",
    should("return a new Array without any of the elements provided", function () {
      var arr = ['a', 'b', 0, true, 'a'], res;

      res = arr.without('a', true);
      assert.equal(res.length, 2);
      assert.equal(res[0], 'b');
      assert.equal(res[1], 0);
    })
  ),

  should("have an instance function named 'compact'", function () {
    assert.kindOf('function', [].compact);
  }),

  context("compact",
    should("return a new Array without any undefined or null values", function () {
      var nil, arr = [undefined, 'nada', null, 0, nil], res;

      res = arr.compact();
      assert.equal(res.length, 2);
      assert.equal(res[0], 'nada');
      assert.equal(res[1], 0);

      undefined = 'foo';
      arr = [undefined, 'nada', null, 0, nil];
      res = arr.compact();
      assert.equal(res.length, 3);
      assert.equal(res[0], undefined);
      assert.equal(res[1], 'nada');
      assert.equal(res[2], 0);
    })
  )

);
