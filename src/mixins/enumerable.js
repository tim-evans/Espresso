/**
 * Enumerable mixin.
 * @requires forEach
 * @class Seed.Enumerable
 */
/*globals Seed */

Seed.Enumerable = /** @lends Seed.Enumerable# */{

  /**
   * Returns an array where each value on the enumerable
   * is mutated by the lambda function.
   * {{{
   *   var cube = function (n) { return n * n * n };
   *   alert([1, 2, 3, 4].map(cube));
   *   // -> [1, 8, 27, 64]
   * }}}
   * @param {Function} lambda The lambda that transforms an element in the enumerable.
   * @param {Object} [self] The value of 'this' inside the lambda.
   * @returns {Array} The collection of results from the map function.
   */
  map: function (lambda, self) {
    var arr = [];
    lambda = lambda || Function.echo;
    this.forEach(function () {
      arr.push(lambda.apply(self, arguments));
    });
    return arr;
  }.inferior(),

  /**
   * Reduce the content of an enumerable down to a single value.
   * {{{
   *   var range = mix(Seed.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   *
   *   var multiply = function (a, b) { return a * b; };
   *   var factorial = function (n) {
   *     return range.create(1, n).reduce(multiply);
   *   }
   *
   *   alert("5! is {}".fmt(factorial(5)));
   *   alert("120! is {}".fmt(factorial(120)));
   * }}}
   * @param {Function} lambda The lambda that performs the reduction.
   * @param {Object} [seed] The seed value to provide for the first time.
   * @returns {Object} The reduced output.
   */
  reduce: function (lambda, seed) {
    var shouldSeed = (typeof seed === "undefined"),
        self = this;
    this.forEach(function (v, k) {
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, k, self);
      }
    });
    return seed;
  }.inferior(),

  /**
   * Converts an enumerable into an Array.
   * {{{
   *   var range = mix(Seed.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   * 
   *   alert(range.create(0, 200).toArray());
   *   // -> [0, 1, 2, 3, 4, 5, ... 198, 199, 200]
   * }}}
   * @returns {Array}
   */
  toArray: function () {
    return this.map();
  },

  /**
   * Returns the size of the Seed.Enumerable.
   * {{{
   *   var range = mix(Seed.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   *
   *   alert(range.create(0, 20).size());
   *   // -> 21
   * }}}
   * @returns {Number}
   */
  size: function () {
    return this.reduce(function (i) {
      return i + 1;
    }, 0);
  },

  filter: function (lambda, self) {
    return this.reduce(function (seive, v, k, t) {
      if (lambda.apply(self, [v, k, t])) {
        seive.push(v);
      }
    }, []);
  }.inferior(),

  every: function (lambda, self) {
    return this.reduce(function (every, v, k, t) {
      return every && lambda.apply(self, [v, k, t]);
    }, true);
  }.inferior(),

  some: function (lambda, self) {
    return this.reduce(function (every, v, k, t) {
      return every || lambda(self, [v, k, t]);
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
    var arr = [];
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    keys.forEach(function (v, k) {
      if (this.get) {
        arr.push(this.get(k));
      } else {
        arr.push(this[k]);
      }
    }, this);
    return arr;
  },

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
  },

  zip: function () {
    var iter = Function.echo, args = Array.from(arguments), collections;
    if (args.slice(-1)[0] instanceof Function) {
      iter = args.pop();
    }

    collections = [this].concat(args).map(Array.from);
    return this.map(function (v, k) {
      return iter(collections.pluck(k));
    });
  }

};
