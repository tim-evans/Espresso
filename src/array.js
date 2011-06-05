/*globals mix Espresso */

/** @name Array
  @namespace

  Shim for the native Array object.

  @extends Espresso.Enumerable
 */
mix(/** @scope Array */{

  /**
    Checks whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: (function () {
    var toString = Object.prototype.toString;
    return function (obj) {
      return toString.call(obj) === '[object Array]';
    };
  }()).inferior()

}).into(Array);

mix(Espresso.Enumerable, /** @scope Array.prototype */{

  /**
    Iterator over the Array.

    Implemented to be in conformance with ECMA-262 Edition 5,
    so you will use the native `forEach` where it exists.

    @param {Function} lambda The callback to call for each element.
    @param {Object} [self] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: function (lambda, self) {
    // 3. Let len be ToUint32(lenValue).
    var len = this.length,
    // 6. Let k be 0.
        k = 0;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    // 7. Repeat, while k < len
    while (k < len) {
      // c. If kPresent is true, then
      if (this.hasOwnProperty(k)) {
        //  i. Let kValue be the result of calling the [[Get]]
        //     internal method of O with argument Pk.
        // ii. Call the [[Call]] internal method of lambda
        //     with T as the this value and argument list
        //     containing kValue, k, and O.
        lambda.call(self, this[k], k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }.inferior(),

  /**
    Shim for `indexOf`.

    @param {Object} o The object to test.
    @param {Number} [fromIndex] The index to start looking at for the element.
    @returns {Number} The first index of an item (or -1 if no matching item was found).
   */
  indexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
      Math.max(i, len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o === this[i]) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  /**
    Reduce the content of an array down to a single
    value (starting from the end and working backwards).

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
   */
  reduceRight: function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        len = this.length, v;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    while (len-- > 0) {
      v = this[len];
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, len, this);
      }
    }

    // 5. If len is 0 and seed is not present, throw a TypeError exception.
    if (shouldSeed) {
      throw new TypeError("There was nothing to reduce!");
    }
    return seed;
  }.inferior(),

  /**
    Shim for `reverse`.
    Note: the Array is reversed in-place.

    @returns {Array} The array in reverse order.
   */
  reverse: function () {
    var O, len, middle,
        lower, upper,
        lowerP, upperP,
        upperValue, lowerValue;

    // 1. Let O be the result of calling ToObject
    //    passing this value as the argument.
    O = this;

    // 3. Let len be ToUint(lenVal)
    len = this.length;

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
      lowerValue = this[lowerP];
      
      // e. Let upperValue be the result of calling the [[Get]]
      //    intenal method of O with argument upperP
      upperValue = this[upperP];

      // h. If lowerExists is true and upperExists is true, then
      //     i. Call the [[Put]] internal method of O with arguments
      //        lowerP, upperValue, and true.
      //     i. Call the [[Put]] internal method of O with arguments
      //        upperP, lowerValue, and true.
      O[lowerP] = upperValue;
      O[upperP] = lowerValue;

      // l. Increase lower by 1.
      lower += 1;
    }

    // 7. Return 0.
    return O;
  }.inferior(),

  /**
    Shim for `lastIndexOf`.

    @param searchElement The item to look for.
    @param [fromIndex] The index to begin searching from.
    @returns {Number} The last index of an item (or -1 if not found).
   */
  lastIndexOf: function (searchElement, fromIndex) {
    var k = 0, len = this.length, n;

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
        //   i. Let elementK be the result of calling the [[Get]]
        //      internal method of O with the argument toString(k).
        //  ii. Let same be the result of applying the
        //      Strict Equality Comparision Algorithm to
        //      searchElement and elementK.
        // iii. If same is true, return k.
      if (this[k.toString()] === searchElement) {
        return k;
      }

      // c. Decrease k by 1.
      k -= 1;
    }
    return -1;
  }.inferior()

}).into(Array.prototype);
