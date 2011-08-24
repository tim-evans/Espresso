/*globals Espresso */

/** @namespace

  Espresso is a JavaScript library to be used as a
  foundation library to create JavaScript libraries.
  This library is made with the to aid in creating
  code that's pleasant to read, smaller, and
  consequently, less buggy.

  Espresso provides a partial shim for ECMAScript 5,
  falling back to native support when available, and
  provides support for Enumerables, Observers, mixins,
  and string formatting.
 */
Espresso = {

  /**
    The version string.
    @type String
   */
  VERSION: '0.5.8',

  /**
    Checks whether the variable is defined *and* is not null.

    @param {Object} o The object to test if it's defined or not.
    @returns {Boolean} True if the value is not null and not undefined.

    @example
      var unbound;
      undefined = 'bwahahaha!';
      alert(Espresso.hasValue(unbound));
      // -> false

      alert(Espresso.hasValue(undefined));
      // -> true
   */
  hasValue: function (o) {
    return o != null;
  },

  /** @function
    @desc

    Check to see if the object has function-like properties.
    If it's callable, then it's a function or an object with
    `call` and `apply` functions (which are assumed to work
    how the same ones work on {@link Function.prototype}).

    @param {Object} obj The Object to check whether it is callable or not.
    @returns {Boolean} True if the Object is callable, otherwise false.
   */
  isCallable: (function () {
    var isFunction = '[object Function]',
        isObject = '[object Object]',
        toString = Object.prototype.toString,
        nil = null;
    return function (obj) {
      return obj && (toString.call(obj) === isFunction ||
             (obj.call != nil && toString.call(obj.call) === isFunction &&
              obj.apply != nil && toString.call(obj.apply) === isFunction));
    };
  }()),

  /** @function
    @desc
    Convert an iterable object into an Array.

    @param {Object} iterable An iterable object with a length and indexing.
    @returns {Array} The object passed in as an Array.
   */
  A: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }()),

  /**
    Defers execution until a later time (when the ready
    queue is empty).

    @param {Function} lambda The function to call.
    @param {Array} args The arguments to apply to the function.
    @param {Object} that The object to apply as `this`.
   */
  defer: function (lambda, args, that) {
    that = that || lambda;
    setTimeout(function () {
      lambda.apply(that, args);
    }, 0);
  },

  /** @function
    @desc
    Identical to `Object.defineProperty`.
    If not available natively, this is null.

    @param {Object} obj The object ot modify.
    @param {String} key The property name to modify.
    @param {Object} desc The descriptor hash.
    @returns {void}
   */
  defineProperty: (function () {
    var defineProperty = Object.defineProperty;

    // Catch IE8 where Object.defineProperty exists but only works on DOM elements.
    if (defineProperty) {
      try {
        defineProperty({}, 'a', { get: function () {} });
      } catch (x) {
        defineProperty = void(0);
      }
    }

    return defineProperty;
  }()),

  /** @function
    @desc
    Internal method for returning description of
    properties that are created by Espresso.

    Note: This is modeled after SC2.
    @param {Object} o The object to get the information of.
    @param {Boolean} create Whether the meta information
      should be created upon calling this method.
    @returns {Object} A object with the information about
      the passed object
   */
  meta: (function () {
    var META_KEY = "__esp__" + Date.now() + "__meta__";
    return function (o, create) {
      var info = o && o[META_KEY];
      if (create && info == null) {
        info = o[META_KEY] = {
          desc: {},
          cache: {},
          lastSetCache: {}
        };
      }
      return info;
    };
  }())

};

// Apply it at the global scope
this.Espresso = Espresso;
