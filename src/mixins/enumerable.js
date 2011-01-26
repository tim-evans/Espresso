/*globals Espresso mix */

/** @namespace

  The Enumerable mixin provides common operations
  on enumerations of objects.

  @requires `forEach`- the enumerator over the collection.
 */
Espresso.Enumerable = /** @lends Espresso.Enumerable# */{

  /** @function
    @returns {void}
   */
  forEach: function () {
    throw new Error("You MUST override Espresso.Enumerable.forEach to be able " +
                    "to use the Enumerable mixin.");
  }.inferior(),

  /**
    Returns an array where each value on the enumerable
    is mutated by the lambda function.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
    @param {Object} [self] The value of 'this' inside the lambda.
    @returns {Array} The collection of results from the map function.
    @example
      var cube = function (n) { return n * n * n };
      alert([1, 2, 3, 4].map(cube));
      // -> [1, 8, 27, 64]
   */
  map: function (lambda, self) {
    var arr = [];

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    this.forEach(function (k, v) {
      arr.set(arr.length, lambda.call(self, k, v, this));
    }, this);
    return arr;
  }.inferior(),

  /**
    Reduce the content of an enumerable down to
    a single value.

    @param {Function} lambda The lambda that performs the reduction.
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

      alert("5! is {}".fmt(factorial(5)));
      alert("120! is {}".fmt(factorial(120)));
   */
  reduce: function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        self = this;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
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
  }.inferior(),

  /**
    Converts an enumerable into an Array.

    @returns {Array} The enumerable as an Array.
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

      alert(range.create(0, 200).toArray());
      // -> [0, 1, 2, 3, 4, 5, ... 198, 199, 200]
   */
  toArray: function () {
    return this.map(function (v) {
      return v;
    });
  }.inferior(),

  filter: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (seive, v, k, t) {
      if (lambda.call(self, v, k, t)) {
        seive.set(seive.length, v);
      }
    }, []);
  }.inferior(),

  every: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every && lambda.call(self, v, k, t);
    }, true);
  }.inferior(),

  some: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every || lambda(self, v, k, t);
    }, false);
  }.inferior(),

  pluck: function (property) {
    return this.map(function (v) {
      if (v.get) {
        return v.get(property);
      } else {
        return v[property];
      }
    });
  },

  extract: function (keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    return this.findAll(function (v, k) {
      return keys.indexOf(k) !== -1;
    });
  },

  find: function (lambda, ifnone) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    var finished = false;
    return this.reduce(function (result, v, k, that) {
      if (!finished && lambda(v, k, that)) {
        finished = true;
        result = v;
      }
      return result;
    }, ifnone);
  },

  findAll: function (lambda) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (result, v, k, that) {
      if (lambda(v, k, that)) {
        result.set(result.length, v);
      }
      return result;
    }, []);
  },

  /**
    Whether or not the {@link Espresso.Enumerable} contains
    the variables.

    @param {...} values The values to check whether they exist
      on the Enumerable.
   */
  contains: function (val) {
    var args = Array.from(arguments);

    if (args.length > 1) {
      return args.every(function (v, k) {
        return this.contains(v);
      }, this);
    } else {
      return this.reduce(function (contained, v, k) {
        return contained || v === val;
      }, false);
    }
  }
};
