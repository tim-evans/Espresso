/** @class

  A KVO compliant Object Hash class.
 
  @extends Espresso.Enumerable
  @extends Espresso.KVO
  @extends Espresso.Template
 */
/*globals Espresso */

Espresso.Hash = Espresso.Template.extend(Espresso.Enumerable, Espresso.KVO, /** @lends Espresso.Hash# */{

  /**
   * Iterator
   */
  forEach: function (lambda, self) {
    var k, v;
    for (k in this) {
      v = this.get(k);
      if (k[0] !== '_' && !Espresso.isCallable(v) && k !== "unknownProperty") {
        lambda.call(self, v, k, this);
      }
    }
  },

  /**
   * Return all of the iterable keys on the hash.
   *
   * {{{
   *   var alphabet = Espresso.Hash.extend({
   *     a: 00, b: 01, c: 02, d: 03, e: 04, f: 05,
   *     g: 06, h: 07, i: 08, j: 09, k: 10, j: 11,
   *     k: 12, l: 13, m: 14, n: 15, o: 16, p: 17,
   *     q: 18, r: 19, s: 20, t: 21, u: 22, v: 23,
   *     w: 24, x: 25, y: 26, z: 27
   *   });
   *
   *   alert(alphabet.keys());
   * }}}
   * @returns {Array} A list of all of the iterable keys on the hash.
   */
  keys: function () {
    return this.map(function (v, k) {
      return k;
    });
  },

  /**
   * Return all iterable values on the hash.
   *
   * {{{
   *   var days = Espresso.Hash.extend({
   *     1: 'Sunday',
   *     2: 'Monday',
   *     3: 'Tuesday',
   *     4: 'Wednesday',
   *     5: 'Thursday',
   *     6: 'Friday',
   *     7: 'Saturday'
   *   });
   *
   *   alert(days.values());
   * }}}
   * @returns {Array} A list of all iterable values on the hash.
   */
  values: function () {
    return this.map(function (v, k) {
      return v;
    });
  },

  /**
   * Convert the Hash into an Array of tuples.
   * @returns {Array[]} An array of tuples.
   */
  toArray: function () {
    return this.map(function (v, k) {
      return [k, v];
    });
  }
});
