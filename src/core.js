/*globals ESP Espresso */

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
  VERSION: '0.5.7',

  /** @function
    @desc

    Lookup a variable's value given its Object notation.
    This requires absolute queries to the Object, using
    idiomatic JavaScript notation.

    @example
      // No scope assumes the object has is at the global scope.
      window.environment = {
        isBrowser: (function () {
          return document in this;
        }())
      };

      alert(Espresso.getObjectFor("environment.isBrowser"));

    @example
      alert(Espresso.getObjectFor("lang.pr._coffee", {
        lang: {
          en: { _coffee: "coffee" },
          pr: { _coffee: "cafe" }
        }
      }));
      // -> "cafe"

    @example
      alert(Espresso.getObjectFor("options[0]", {
        options: ["espresso", "coffee", "tea"]
      }));
      // -> "espresso"

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
    }, G = this, idx = 0, fullKey;

    return function (key, object) {
      var iattr = key.indexOf('.'),
          iarr = key.indexOf('['), chr, msg;

      if (idx === 0) fullKey = key;

      // Use global scope as default
      object = (arguments.length === 1) ? G: object;

      // Nothing to look up on undefined or null objects.
      if (object == null) {
        idx = 0;
        return object;
      }

      // Array accessor (`[]`) access
      if ((iarr < iattr || iattr === -1) && iarr > -1) {

        // Found something that looks like `ingredients[0]`
        // Unpack the first part, then deal with the array subscript.
        if (iarr !== 0) {
          object = getProperty(key.slice(0, iarr), object);
          key = key.slice(iarr + 1);
          idx += iarr;

          // Stop here if object has no value
          if (object == null) {
            idx = 0;
            return object;
          }
        }

        iarr = key.indexOf(']');

        // Unpack the property
        object = getProperty(key.slice(0, iarr), object);

        // Eat the rest of the descriptor
        key = key.slice(iarr + 1);
        idx += iarr + 2;

        chr = key.charAt(0);
        // Malformed property path
        if (!(chr === "" || chr === '.' || chr === '[')) {
          msg = Espresso.format(
              "Expected EOS, '.', or '[' as the next character in the property path, but got '{}'\n{}\n{: >{}}",
              chr, fullKey, idx + 1, '^');
          idx = 0;
          throw new Error(msg);
        }

        // Eat up the dot.
        if (key.length && chr === '.') {
          key = key.slice(1);
        }

        // Recurse
        return Espresso.getObjectFor(key, object);

      // Attribute (`.`) subscript
      } else if ((iattr < iarr || iarr === -1) && iattr > -1) {
        object = getProperty(key.split('.', 1), object);
        idx += iattr + 1;

        // Eat up the dot.
        key = key.slice(iattr + 1);

        chr = key.charAt(0);
        // Malformed property path
        if (chr === "." || chr === '[') {
          msg = Espresso.format(
            "Expected non-delimiter character (anything but '[' or '.') in the property path, but got '{}'\n{}\n{: >{}}",
            chr, fullKey, idx + 1, '^');
          idx = 0;
          throw new Error(msg);
        }

        // Recurse
        return Espresso.getObjectFor(key, object);

      // Done!
      } else if (key === '') {
        idx = 0;
        return object;
      }

      idx = 0;
      // Plain 'ol getObjectFor
      return getProperty(key, object);
    };
  }()),

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
  }

};

// Apply it at the global scope
this.Espresso = Espresso;
