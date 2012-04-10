/*globals mix */
var inferior = Espresso.inferior;

mix(/** @scope Object */{

  /** @function
    @desc
    Returns all iterable keys on the passed Object.

    @param {Object} O The object to return the keys of.
    @returns {Array} A list of all keys on the object passed in.
    @throws {TypeError} When `O` is not an object.
   */
  keys: inferior(function (O) {
    var array = [], key;

    // 1. If the Type(O) is not Object, throw a TypeError exception.
    if (typeof O !== "object" || O == null) {
      throw new TypeError(O + " is not an object.");
    }

    // 5. For each own enumerable property of O whose name String is P
    for (key in O) {
      if (O.hasOwnProperty(key)) {
        array[array.length] = key;
      }
    }

    // 6. Return array.
    return array;
  }),

  /** @function
    @desc
    Returns whether two values are not observably distinguishable.

    @param {Object} x
    @param {Object} y
    @returns {Boolean} Whether x and y are equivalent.
   */
  is: inferior(function (x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1 / x === 1 / y;
    }

    // NaN !== NaN, but they are identical.
    return x !== x && y !== y;
  })

}).into(Object);
