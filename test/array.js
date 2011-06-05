/*global context setup should assert Espresso formatting*/

context("Array",

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
  )
);
