/*globals mix */

mix(/** @scope Object.prototype */{

  /**
    Formats an Object by coercing the Object to a
    String and calling `__format__` on the string with
    the format specifier passed in.

    @param {String} spec The string specification to format the object.
    @returns {String} The object as a formatted string according to the specification.
   */
  __format__: function (spec) {
    return String(this).__format__(spec);
  }.inferior()

}).into(Object.prototype);

mix(/** @scope Object */{

  /**
    Returns all iterable keys on the passed Object.

    @param {Object} O The object to return the keys of.
    @returns {Array} A list of all keys on the object passed in.
    @throws {TypeError} When `O` is not an object.
   */
  keys: function (O) {
    var array = [], key;

    // 1. If the Type(O) is not Object, throw a TypeError exception.
    if (typeof O !== "object") {
      throw new TypeError("{} is not an object.".format(O));
    }

    // 5. For each own enumerable property of O whose name String is P
    for (key in O) {
      if (O.hasOwnProperty(key)) {
        array[array.length] = key;
      }
    }

    // 6. Return array.
    return array;
  }.inferior()

}).into(Object);
