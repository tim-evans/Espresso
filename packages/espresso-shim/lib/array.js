/*globals mix Espresso */
var inferior = Espresso.inferior,
    isCallable = Espresso.isCallable,
    toString = Object.prototype.toString,
    T_ARRAY = '[object Array]';

/** @name Array
  @namespace

  Shim for the native Array object.
 */
mix(/** @scope Array */{

  /** @function
    @desc
    Checks whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: inferior(function (obj) {
    return toString.call(obj) === T_ARRAY;
  })

}).into(Array);

mix(/** @scope Array.prototype */{

  /** @function
    @desc
    Iterator over the Array.

    Implemented to be in conformance with ECMA-262 Edition 5,
    so you will use the native `forEach` where it exists.

    @param {Function} lambda The callback to call for each element.
    @param {Object} [scope] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: inferior(function (lambda, scope) {
    // 3. Let len be ToUint32(lenValue).
    var len = this.length,
    // 6. Let k be 0.
        k = 0;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
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
        lambda.call(scope, this[k], k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }),

  /** @function
    @desc
    Shim for `indexOf`.

    @param {Object} o The object to test.
    @param {Number} [fromIndex] The index to start looking at for the element.
    @returns {Number} The first index of an item (or -1 if no matching item was found).
   */
  indexOf: inferior(function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0
        ? fromIndex
        : Math.max(i, len - Math.abs(fromIndex));

    for (; i < len; i += 1) {
      if (o === this[i]) {
        return i;
      }
    }
    return -1;
  }),

  /** @function
    @desc
    Returns an array where each value on the array
    is mutated by the lambda function.

    @param {Function} lambda The lambda that transforms an element in the array.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [scope] The value of `this` inside the lambda.
    @returns {Array} The collection of results from the map function.
    @example
      var cube = function (n) { return n * n * n };
      alert([1, 2, 3, 4].map(cube));
      // -> [1, 8, 27, 64]
   */
  map: inferior(function (lambda, scope) {
    var arr = [],
        i = 0, len = this.length;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
    }

    for (; i < len; i++) {
      arr.push(lambda.call(scope, i, this[i], this));
    }
    return arr;
  }),

  /** @function
    @desc
    Reduce the content of down to a single value.

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
    @example
      var multiply = function (a, b) { return a * b; };
      var factorial = function (n) {
        var arr = new Array(n);
        for (var i = 1; i <= n; i++) arr[i] = i;
        return arr.reduce(multiply);
      }

      alert("5! is " + factorial(5));
      alert("120! is " + factorial(120));
   */
  reduce: inferior(function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        i = 0, len = this.length;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
    }

    for (; i < len; i++) {
      if (shouldSeed) {
        seed = this[i];
        shouldSeed = false;
      } else {
        seed = lambda(seed, this[i], i, this);
      }
    }

    // 5. If len is 0 and seed is not present, throw a TypeError exception.
    if (shouldSeed) {
      throw new TypeError("There was nothing to reduce!");
    }
    return seed;
  }),

  /** @function
    @desc
    Reduce the content of an array down to a single
    value (starting from the end and working backwards).

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
   */
  reduceRight: inferior(function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        len = this.length, v;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!isCallable(lambda)) {
      throw new TypeError(lamda + " is not callable.");
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
  }),

  /** @function
    @desc
    Returns all elements on for which the input
    function returns `true` for.

    @param {Function} lambda The function to filter the Array.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [scope] The value of `this` inside the lambda.
    @returns {Object[]} An array with the values for which `lambda` returns `true`
   */
  filter: inferior(function (lambda, scope) {
    var i, len = this.length,
        seive = [];

    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
    }

    for (i = 0; i < len; i++) {
      if (lambda.call(scope, this[i], i, this)) {
        seive.push(this[i]);
      }
    }
    return seive;
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for every element
    in the array, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the array.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [scope] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` for every iteration.
  */
  every: inferior(function (lambda, scope) {
    var i, len = this.length;
    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
    }

    for (i = 0; i < len; i++) {
      if (!lambda.call(scope, this[i], i, this)) {
        return false;
      }
    }
    return true;
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for at least one
    element in the array, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the array.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [scope] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` at least once.
   */
  some: inferior(function (lambda, scope) {
    var i, len = this.length;
    if (!isCallable(lambda)) {
      throw new TypeError(lambda + " is not callable.");
    }

    for (i = 0; i < len; i++) {
      if (lambda.call(scope, this[i], i, this)) {
        return true;
      }
    }
    return false;
  }),

  /** @function
    @desc
    Shim for `reverse`.
    Note: the Array is reversed in-place.

    @returns {Array} The array in reverse order.
   */
  reverse: inferior(function () {
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
  }),

  /** @function
    @desc
    Shim for `lastIndexOf`.

    @param searchElement The item to look for.
    @param [fromIndex] The index to begin searching from.
    @returns {Number} The last index of an item (or -1 if not found).
   */
  lastIndexOf: inferior(function (searchElement, fromIndex) {
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
  })

}).into(Array.prototype);
