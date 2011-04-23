/*global Espresso */

/** @namespace

  Espresso is a JavaScript library to be used as a
  foundation library to create JavaScript libraries.
  It also acts as a partial shim to ECMAScript 5,
  falling back to native browser support when available.

  Espresso's goal is to provide a small library that
  provides the basics that provide the power to
  developers to produce sophisticated JavaScript libraries
  that have clear, concise, and readable code, as well as
  powerful consumer-facing APIs.

  What does this mean? Less code and robust APIs!

  This library provides the Publish-Subscribe pattern,
  Key-Value Observing (a la Cocoa), and Ruby-like mixins.
 */
Espresso = {

  /**
    The version string.
    @type String
   */
  VERSION: '1.2.0',

  /**
    The global variable.

    Used to be independant of what the global `this` is,
    whether it's `window` or `document` in a browser or
    `global` in Node.

    @type Object
   */
  global: this,

  /** @function
    @desc

    Lookup a variable's value given its Object notation.
    This requires absolute queries to the Object, only using
    the `.` notation.

    The most effort that is performed on behalf of the
    lookup when it fails is when it's an array AND it's the
    only element in the array, THEN it will unpack the element
    and make that the argument.

    This does not mean that absolute notation does not
    work in these cases; it just means that it's optional.

    This prevents unnecessary indexing by the user,
    expecially in the case of the arguments Array.

    @example
      // Properties on the global scope need to be there-
      // local scoped variables will not be found!
      window.arthur = {
        name: 'Arthur Dent',
        species: 'Human',
        description: 'Mostly Harmless'
      };

      alert(Espresso.getObjectFor("arthur.name"));
      // => 'Arthur Dent'

    @example
      alert(Espresso.getObjectFor("lang.pr._coffee", {
        lang: {
          en: { _coffee: "coffee" },
          pr: { _coffee: "cafe" }
        }
      }));
      // -> "cafe"

    @param {String} key The key to get on the target.
    @param {Object} [object] The target object to get a value from.
    @returns {Object} The referenced value in the args passed in.
   */
  getObjectFor: (function () {
    /** @ignore */
    // Return the property or `undefined`
    var getProperty = function (property, obj) {
      if (property in obj) {
        obj = obj[property];
      } else {
        obj = void 0;
      }
      return obj;
    }, G = this;

    return function (key, object) {
      // Attribute (`.`) subscript
      var iattr = key.indexOf('.');

      // Use global scope as default
      object = (arguments.length === 1) ? G: object;

      // Nothing to look up on undefined or null objects.
      if (!Espresso.hasValue(object)) {
        return object;
      }

      if (iattr > -1) {
        object = getProperty(key.split('.', 1), object);

        // Eat up the dot.
        key = key.slice(iattr + 1);

        // Recurse
        return Espresso.getObjectFor(key, object);

      // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol getObjectFor
      return getProperty(key, object);
    };
  }()),

  /**
    Checks whether the variable is defined *and* is not null.

    @param {Object} o The object to test if it's defined or not.
    @returns {Boolean} True if the value is not null and not undefined.

    @example
      var unbound; // This variable is very lonely (and very much undefined)
      undefined = 'all your base belong to us'; // Yes, you can rename undefined, but...
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

    ECMAScript compliant isCallable.

    > The abstract operation IsCallable determines if its argument,
    > which must be an ECMAScript language value, is a callable function
    > Object if it's an Object that hass a function called `call`.

    This allows overriding `call` on an object, effectively making it
    a callable object.

    The one addition is ensuring that the method is also applicable,
    (having the `apply` being callable too).

    @param {Object} obj The Object to check whether it is callable or not.
    @returns {Boolean} True if the Object is callable, otherwise false.
   */
  isCallable: (function () {
    var callable = /[Function|Object]/,
        toString = Object.prototype.toString;
    return function (obj) {
      return !!(obj && callable.test(toString.call(obj)) &&
                Espresso.hasValue(obj.call) &&
                callable.test(toString.call(obj.call)) &&
                Espresso.hasValue(obj.apply) &&
                callable.test(toString.call(obj.apply)));
    };
  }()),

  /** @function
    @desc
    Convert an iterable object into an Array.

    This is used mostly for the arguments variable
    in functions.

    @param {Object} iterable An iterable object with a length and indexing.
    @returns {Array} The object passed in as an Array.
   */
  A: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }())
};

// Apply it at the global scope
Espresso.global.Espresso = Espresso;
