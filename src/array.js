/*globals mix Enumerable Espresso */

/** @name Array
  @namespace

  Shim for the native Array object.

  @extends Espresso.Enumerable
 */
mix(/** @scope Array */{

  /**
    Returns whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: function (obj) {
    return (/array/i).test(Object.prototype.toString.call(obj));
  }.inferior()

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
    var len, k;

    // 3. Let len be ToUint32(lenValue).
    len = this.length;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
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
        lambda.call(self, this[k], k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }.inferior(),

  /**
    Shim for Internet Explorer, which provides no `indexOf` for
    Array prototypes.

    @param {Object} o The object to test.
    @param {Number} [fromIndex] The index to start looking at for the element.
    @returns {Number} The first index of an item.
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
    Shim for Internet Explorer, which provides no reverse for
    Array prototypes. Note: the Array is reversed in-place.

    @returns {Array} The array in reverse order.

    @see ECMA-262 15.4.4.8 Array.prototype.reverse()

    @example
      var racecar = "racecar".split('');
      alert(racecar.reverse().join(''));
      // => 'racecar'
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
    Shim for the last index that the object is found at.
    Returns -1 if the item is not found.

    @param searchElement The item to look for.
    @param [fromIndex] The index to begin searching from.
    @returns {Number} The last index of an item.

    @see ECMA-262 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex ])
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
  }.inferior(),

  /**
    Returns a new array that's a one-dimensional flattening of this
    array (recursively). That is, for every element that's an array,
    extract its elements into the new array. If the optional level
    arguments determines the level of recursion to flatten.

    @param {Number} [level] The maximum level of recursion.
    @returns {Array} The flattened array.
    @example
      var arr = [1, [2, [3, [4, [5]]]]];
      alert(arr.flatten());
      // => [1, 2, 3, 4, 5]

      alert(arr.flatten(2));
      // => [1, 2, 3, [4, [5]]];
   */
  flatten: function (level) {
    var ret = [], hasLevel = arguments.length !== 0;
    if (hasLevel && level === 0) {
      return this;
    }

    this.forEach(function (v) {
      if (Array.isArray(v)) {
        if (hasLevel) {
          ret = ret.concat(v.flatten(level - 1));
        } else {
          ret = ret.concat(v.flatten());
        }
      } else {
        ret[ret.length] = v;
      }
    });

    return ret;
  },

  /**
    Returns a new array by removing duplicate values in `this`.

    @returns {Array} The array with all duplicates removed.
    @example
      var magic = 'abracadabra'.split('').unique().join('');
      alert(magic);
      // => 'abrcd'
   */
  unique: function () {
    var o = {}, values = [];
    this.forEach(function (v) {
      o[v] = v;
    });

    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        values.push(o[k]);
      }
    }
    return values;
  },

  /**
    Returns a new array by removing all values passed in.

    @param {...} values Removes all values on the array that
      match the arguments passed in.
    @returns {Array} The array without the values given.
   */
  without: function () {
    var without = Espresso.A(arguments);

    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement.push(v);
      }
      return complement;
    }, []);
  },

  /**
    Removes all `undefined` or `null` values.

    @returns {Array} The array without any `undefined` or `null` values.
    @example
      var nil;

      alert([undefined, null, nil, 'nada'].compact());
      // => ['nada']
   */
  compact: function () {
    return this.without(null, void(0));
  }

}).into(Array.prototype);
