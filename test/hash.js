/*global context setup should assert Espresso*/

var hash;
context("Espresso.Hash",
  setup(function () {
    hash = Espresso.Hash.extend({
      a: 1,
      b: 2,
      c: 3,
      d: function () { return 4; }.property()
    });
  }),

  should("be defined", function () {
    assert.isTrue(Espresso.Hash);
  }),

  should("mixin Espresso.Enumerable", function () {
    assert.mixesIn(Espresso.Hash, Espresso.Enumerable);
  }),

  should("mixin Espresso.PubSub", function () {
    assert.mixesIn(Espresso.Hash, Espresso.PubSub);
  }),

  should("mixin Espresso.KVO", function () {
    assert.mixesIn(Espresso.Hash, Espresso.KVO);
  }),

  should("have a function with a slot named 'forEach'", function () {
    assert.kindOf('function', Espresso.Hash.forEach);
  }),

  context("forEach",
    should("iterate over all keys on the hash", function () {
      var visited = {}, count = 0;

      hash.forEach(function (v, k) {
        visited[k] = v;
        count += 1;
      });

      assert.equal(visited.a, 1);
      assert.equal(visited.b, 2);
      assert.equal(visited.c, 3);
      assert.equal(visited.d, 4);
      assert.equal(count, 4);
    }),

    should("provide a third argument that is 'this'", function () {
      hash.forEach(function (v, k, self) {
        assert.equal(self, hash);
      });
    })
  ),

  should("have a function with a slot named 'keys'", function () {
    assert.kindOf('function', Espresso.Hash.keys);
  }),

  context("keys",
    should("return all keys on the hash in an Array", function () {
      var keys = hash.keys();
      assert.isTrue(keys.indexOf('a') !== -1);
      assert.isTrue(keys.indexOf('b') !== -1);
      assert.isTrue(keys.indexOf('c') !== -1);
      assert.isTrue(keys.indexOf('d') !== -1);
      assert.equal(keys.length, 4);
    })
  ),

  should("have a function with a slot named 'values'", function () {
    assert.kindOf('function', Espresso.Hash.values);
  }),

  context("values",
    should("return all values on the hash in an Array", function () {
      var values = hash.values();
      assert.isTrue(values.indexOf(1) !== -1);
      assert.isTrue(values.indexOf(2) !== -1);
      assert.isTrue(values.indexOf(3) !== -1);
      assert.isTrue(values.indexOf(4) !== -1);
      assert.equal(values.length, 4);
    })
  ),

  should("have a function with a slot named 'toArray'", function () {
    assert.kindOf('function', Espresso.Hash.toArray);
  }),

  context("toArray",
    should("return all toArray on the hash in an Array", function () {
      var arr = hash.toArray();

      assert.equal(arr[0][0], 'a');
      assert.equal(arr[0][1], 1);
      assert.equal(arr[1][0], 'b');
      assert.equal(arr[1][1], 2);
      assert.equal(arr[2][0], 'c');
      assert.equal(arr[2][1], 3);
      assert.equal(arr[3][0], 'd');
      assert.equal(arr[3][1], 4);
      assert.equal(arr.length, 4);
    })
  )
);
