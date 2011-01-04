/*globals mix Enumerable Espresso */

/** @name Array
  @namespace

  Shim for the native Array object.

  @extends Espresso.Enumerable
  @extends Espresso.KVO

 */
mix(/** @scope Array */{

  /** @function

    Convert an iterable object into an Array.

    This is used mostly for the arguments variable
    in functions.

    @param {Object} iterable An iterable object with a length and indexing.
    @returns {Array} The object passed in as an Array.
   */
  from: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }()),

  /**
    Returns whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: function (obj) {
    return (/array/i).test(Object.prototype.toString.call(obj));
  }.inferior()

}).into(Array);

/** @name Array.prototype
   @namespace */
mix(Espresso.Enumerable, Espresso.KVO, /** @scope Array.prototype */{

  /**
   * The size of the Array.
   * @returns {Number} The length of the Array.
   */
  size: function () {
    return this.length;
  }.property(),

  /**
   * Iterator over the Array.
   *
   * Implemented to be in conformance with ECMA-262 Edition 5,
   * so you will use the native forEach where it exists.
   *
   * @param {Function} lambda The callback to call for each element.
   * @param {Object} [self] The Object to use as this when executing the callback.
   * @returns {void}
   * 
   * @example
   *   [1, 1, 2, 3, 5].forEach(alert);
   *   // -> 1
   *   // -> 1
   *   // -> 2
   *   // -> 3
   *   // -> 5
   */
  forEach: function (lambda, self) {
    var len, k;

    // 3. Let len be ToUint32(lenValue).
    len = this.get('size');

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      // c. If kPresent is true, then
      if (this.hasOwnProperty(k)) {
        //  i. Let kValue be the result of calling the [[Get]]
        //     internal method of O with argument Pk.
        // ii. Call the [[Call]] internal method of lambda
        //     with T as the this value and argument list
        //     containing kValue, k, and O.
        lambda.call(self, this.get(k), k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }.inferior(),

  /**
   * @function
   */
  indexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
                         Math.max(i, len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o === this.get(i)) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  /**
   * KVO compliant reverse().
   *
   * @function
   * @see ECMA-262 15.4.4.8 Array.prototype.reverse()
   */
  reverse: function () {
    var O, len, middle,
        lower, upper,
        lowerP, upperP,
        upperValue, lowerValue;

    // 1. Let O be the result of calling ToObject
    //    passing this value as the argument.
    O = [];

    // 3. Let len be ToUint(lenVal)
    len = this.get('size');

    // 4. Let middle be floor(len/2)
    middle = Math.floor(len / 2);

    // 5. Let lower be 0.
    lower = 0;

    // 6. Repeat, while lower !== middle
    while (lower !== middle) {
      // a. Let upper be len - lower - 1.
      upper = len - lower - 1;

      // b. Let upperP be ToString(upper).
      upperP = upper.toString();

      // c. Let lowerP be ToString(lower).
      lowerP = lower.toString();

      // d. Let lowerValue be the result of calling the [[Get]]
      //    intenal method of O with argument lowerP
      lowerValue = this.get(lowerP);
      
      // e. Let upperValue be the result of calling the [[Get]]
      //    intenal method of O with argument upperP
      upperValue = this.get(upperP);

      // h. If lowerExists is true and upperExists is true, then
      //     i. Call the [[Put]] internal method of O with arguments
      //        lowerP, upperValue, and true.
      //     i. Call the [[Put]] internal method of O with arguments
      //        upperP, lowerValue, and true.
      O.set(lowerP, upperValue);
      O.set(upperP, lowerValue);

      // l. Increase lower by 1.
      lower += 1;
    }

    // 7. Return 0.
    return O;
  }.inferior(),

  /**
   * Returns the last index that the object is found at.
   *
   * @function
   * @param searchElement The item to look for.
   * @param [fromIndex] The index to begin searching from.
   * @returns The last index of an item.
   * @see ECMA-262 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex ])
   */
  lastIndexOf: function (searchElement, fromIndex) {
    var k = 0, len = this.get('size'), n;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed, let n be
    //    ToInteger(fromIndex); else let n be len.
    n = fromIndex || len;

    // 6. If n >= 0, then let k be min(n, len - 1).
    if (n > 0) {
      k = Math.min(n, len - 1);

    // 7. Else, n < 0
    } else {
      // a. Let k be len - abs(n).
      k = len - Math.abs(n);
    }

    // 8. Repeat, while k >= 0
    while (k >= 0) {
      // a. Let kPresent be the result of calling the [[HasProperty]]
      //    internal method of O with argument toString(k).
      // b. If kPresent is true, then
      if (this.hasOwnProperty(searchElement) &&
        //   i. Let elementK be the result of calling the [[Get]]
        //      internal method of O with the argument toString(k).
        //  ii. Let same be the result of applying the
        //      Strict Equality Comparision Algorithm to
        //      searchElement and elementK.
        // iii. If same is true, return k.
          this.get(k.toString() === searchElement)) {
        return k;
      }

      // c. Decrease k by 1.
      k -= 1;
    }
    return -1;
  }.inferior(),

  flatten: function () {
    var ret = [];
    this.forEach(function (v) {
      if (v instanceof Array) {
        ret.concat(v.flatten());
      } else {
        ret[ret.length] = v;
      }
    });
    return ret;
  },

  remove: function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from: from;
    return this.push.apply(this, rest);
  },

  /**
    Returns all unique values on the array.

    @returns {Array}
   */
  unique: function () {
    var o = [];
    this.forEach(function (v) {
      o[v] = v;
    });
    return o.values();
  }.inferior(),

  without: function () {
    var without = Array.from(arguments);
    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement[complement.length] = v;
      }
      return complement;
    }, []);
  }
}).into(Array.prototype);
