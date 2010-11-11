/*globals mix Enumerable */

mix(/** @scope Array */{

  /**
   * Convert an iterable object into an Array.
   * @param {Object} iterable An iterable object with a length and indexing.
   * @returns {Array}
   */
  from: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }())

}).into(Array);

mix(Enumerable, /** @scope Array.prototype */{

  /**
   * Iterator over the Array.
   * Implemented to be in conformance with ECMA-262 Edition 5,
   * so you will use the native forEach where it exists.
   * {{{
   *   [1, 1, 2, 3, 5].forEach(alert);
   *   // -> 1
   *   // -> 1
   *   // -> 2
   *   // -> 3
   *   // -> 5
   * }}}
   * @param {Function} callback The callback to call for each element.
   * @param {Object} self The Object to use as this when executing the callback.
   * @returns {void}
   */
  forEach: function (func, self) {
    var i = 0, len = this.length;
    for (; i < len; i += 1) {
      func.apply(self, [this[i], i, this]);
    }
  }.inferior(),

  indexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
                         i.max(len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o in this && o === this[i]) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  /**
   * @function
   *
   * @param o The item to look for.
   * @param [fromIndex] The index to begin searching from.
   * @returns The last index of an item.
   */
  lastIndexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || len;
    i = fromIndex >= 0 ? len.min(fromIndex + 1):
                         len - Math.abs(fromIndex) + 1;
    while (i--) {
      if (o in this && o === this[i]) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  unique: function () {
    var o = {};
    this.forEach(function (v, k) {
      o[v] = v;
    });
    return o.values();
  }.inferior(),

  without: function () {
    var without = Array.from(arguments);
    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement.push(v);
      }
      return complement;
    }, []);
  },

  json: function () {
    var json = [];
    this.forEach(function (value) {
      json.push(value.json());
    });
    return "[{}]".fmt(json.join(","));
  }
}).into(Array.prototype);
