/**
 * @class
 * @extends Enumerable
 * @extends Seed
 */
/*globals Hash Seed Enumerable */

Hash = Seed.extend(Enumerable, /** @lends Hash# */{

  /**
   * Iterator
   */
  forEach: function (lambda, self) {
    var k, v;
    for (k in this) {
      v = this.get(k);
      if (k[0] !== '_' && !Function.isFunction(v)) {
        lambda.apply(self, [v, k, this]);
      }
    }
  },

  /**
   * Return all keys on the hash.
   */
  keys: function () {
    return this.map(function (k, v) {
      return k;
    });
  },

  /**
   * Return all values on the hash.
   */
  values: function () {
    return this.map(function (k, v) {
      return v;
    });
  },

  /**
   * Convert the Hash into an Array of tuples.
   * @returns {Array[]} An array of tuples.
   */
  toArray: function () {
    return this.map(function (k, v) {
      return [k, v];
    });
  }

});
