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
    // Return the property or `undefined`
    var get, getPath,
        G = this, idx = 0, fullKey;
        baseError = "Malformed property path:\n",
        unmatchedError = baseError + "Unmatched {} brace:\n{}\n{: >{}}",
        emptyPropertyError = baseError + "Expected a property, but got {}:\n{}\n{: >{}}^",
        unexpectedTokenError = baseError + "Expected {} as the next character, but got '{}'\n{}\n{: >{}}";

    /** @ignore */
    get = function (property, obj) {
      if (property in obj) {
        obj = obj[property];
      } else {
        obj = void 0;
      }
      return obj;
    };

    /** @ignore */
    getPath = function (key, object) {
      var iattr = key.indexOf('.'),
          ioArr = key.indexOf('['),
          icArr = key.indexOf(']'), chr;

      // Nothing to look up on undefined or null objects.
      if (object == null) {
        return object;
      }

      // Can't start properties with a leading '.'
      if (iattr === 0) {
        throw new SyntaxError(Espresso.format(
          emptyPropertyError, "'" + key.charAt(0) + "'",
          fullKey, idx, '^'));
      }

      // Unmatched opening brace
      if (ioArr > icArr) {
        throw new SyntaxError(Espresso.format(
          unmatchedError, "opening",
          fullKey, ioArr + 1, '^'));

      // Unmatched closing brace
      } else if (icArr !== -1 && ioArr === -1) {
        throw new SyntaxError(Espresso.format(
          unmatchedError, "closing",
          fullKey, icArr + 1, '^'));
      }

      // Array accessor (`[]`) access
      if ((ioArr < iattr || iattr === -1) && ioArr > -1) {

        // Found something that looks like `ingredients[0]`
        // Unpack the first part, then deal with the array subscript.
        if (ioArr !== 0) {
          object = get(key.slice(0, ioArr), object);

          // Stop here if object has no value
          if (object == null) {
            return object;
          }
        }

        key = key.slice(ioArr + 1);
        icArr -= ioArr + 1;
        idx += ioArr;

        // No property to parse
        if (!key.length || !icArr) {
          throw new SyntaxError(Espresso.format(
            emptyPropertyError, key.length ? "']'": "EOS",
            fullKey, idx + 1, '^'));
        }

        // Unpack the property
        object = get(key.slice(0, icArr), object);

        // Eat the rest of the descriptor
        key = key.slice(icArr + 1);
        idx += icArr + 2;

        chr = key.charAt(0);
        // Malformed property path
        if (!(chr === "" || chr === '.' || chr === '[')) {
          throw new SyntaxError(Espresso.format(
            unexpectedTokenError, "EOS, '.', or '['",
            chr, fullKey, idx + 1, '^'));
        }

        // Eat up the dot.
        if (key.length && chr === '.') {
          key = key.slice(1);
          if (!key.length) {
            throw new SyntaxError(Espresso.format(
              emptyPropertyError, 'EOS', fullKey, fullKey.length, '^'));
          }
        }

        // Recurse
        return getPath(key, object);

      // Attribute (`.`) subscript
      } else if ((iattr < ioArr || ioArr === -1) && iattr > -1) {
        object = get(key.split('.', 1), object);
        idx += iattr + 1;

        // Eat up the dot.
        key = key.slice(iattr + 1);

        chr = key.charAt(0);
        if (chr === '' || chr === '[') {
          throw new SyntaxError(Espresso.format(
            emptyPropertyError, chr ? chr : 'EOS', fullKey, idx, '^'));
        }

        // Recurse
        return getPath(key, object);

      // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol get
      return get(key, object);
    };

    return function (key, object) {
      // Reset debugging helpers
      fullKey = key;
      idx = 0;

      // Use global scope as default
      object = (arguments.length === 1) ? G: object;

      return getPath(key, object);
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
