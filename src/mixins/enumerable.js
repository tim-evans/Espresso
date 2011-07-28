/*globals Espresso mix */

/** @namespace
  This mixin defines an enumerable interface that is
  based off of the ECMAScript 5 specification.

  If any of the functions on this interface are defined
  by the host object, they will *not* be applied, with the
  assumption that the host object has a better implementation
  and the same characteristics.

  @requires `forEach`- the enumerator over the collection.
 */
Espresso.Enumerable = /** @lends Espresso.Enumerable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isEnumerable: true,

  /** @function
    @desc
    Iterates over each item on the Enumerable.

    The Function `forEach` should follow the specification as
    defined in the ECMAScript 5 standard. All function using
    `forEach` in the Enumerable mixin depend on it being this way.

    @param {Function} lambda The callback to call for each element.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: Espresso.inferior(function (lambda, that) {
    throw new Error("You MUST override Espresso.Enumerable.forEach to be able " +
                    "to use the Enumerable mixin.");
  }),

  /** @function
    @desc
    Returns an array where each value on the enumerable
    is mutated by the lambda function.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Array} The collection of results from the map function.
    @example
      var cube = function (n) { return n * n * n };
      alert([1, 2, 3, 4].map(cube));
      // -> [1, 8, 27, 64]
   */
  map: Espresso.inferior(function (lambda, self) {
    var arr = [];

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    this.forEach(function (k, v) {
      arr.push(lambda.call(self, k, v, this));
    }, this);
    return arr;
  }),

  /** @function
    @desc
    Reduce the content of an enumerable down to a single value.

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
    @example
      var range = mix(Espresso.Enumerable, {
        begin: 0,
        end: 0,

        forEach: function (lambda, self) {
          var i = 0;
          for (var v = this.begin; v <= this.end; v++) {
            lambda.call(self, v, i++, this);
          }
        },

        create: function (begin, end) {
          return mix(this, { begin: begin, end: end }).into({});
        }
      }).into({});

      var multiply = function (a, b) { return a * b; };
      var factorial = function (n) {
        return range.create(1, n).reduce(multiply);
      }

      alert("5! is {}".format(factorial(5)));
      alert("120! is {}".format(factorial(120)));
   */
  reduce: Espresso.inferior(function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        self = this;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    this.forEach(function (v, k) {
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, k, self);
      }
    });

    // 5. If len is 0 and seed is not present, throw a TypeError exception.
    if (shouldSeed) {
      throw new TypeError("There was nothing to reduce!");
    }
    return seed;
  }),

  /** @function
    @desc
    Returns all elements on the Enumerable for which the
    input function returns true for.

    @param {Function} lambda The function to filter the Enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Object[]} An array with the values for which `lambda` returns `true`
   */
  filter: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (seive, v, k, t) {
      if (lambda.call(self, v, k, t)) {
        seive.push(v);
      }
      return seive;
    }, []);
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for every element
    in the Enumerable, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` for every iteration.
  */
  every: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every && lambda.call(self, v, k, t);
    }, true);
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for at least one
    element in the Enumerable, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` at least once.
   */
  some: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every || lambda.call(self, v, k, t);
    }, false);
  })

};
