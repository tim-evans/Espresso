/*globals mix Espresso */

mix(/** @lends Espresso */{

  /**
   * The global variable.
   *
   * @type Object
   */
  global: this,

  /**
   * <p>Lookup a variable's value given its Object notation.
   * This requires absolute queries to the Object.</p>
   *
   * <p>The most effort that is performed on behalf of the
   * lookup when it fails is when it's an array AND it's the
   * only element in the array, THEN it will unpack the element
   * and make that the argument.</p>
   *
   * <p>This does not mean that absolute notation does not
   * work in these cases; it just means that it's optional.</p>
   *
   * <p>This prevents unnecessary indexing by the user,
   * expecially in the case of the arguments Array.</p>
   *
   * @example
   *   // Properties on the global scope need to be there-
   *   // local scoped variables will not be found!
   *   window.arthur = Espresso.Template.extend({
   *     name: 'Arthur Dent',
   *     species: 'Human',
   *     description: 'Mostly Harmless'
   *   });
   *
   *   alert(Espresso.getObjectFor("arthur.name"));
   *   // -> 'Arthur Dent'
   *
   * @example
   *   alert(Espresso.getObjectFor("lang.pr._coffee", {
   *     lang: {
   *       en: { _coffee: "coffee" },
   *       pr: { _coffee: "cafe" }
   *     }
   *   }));
   *   // -> "cafe"
   * 
   * @function
   * @param {String} key The key to get on the target.
   * @param {Object} [object] The target object to get a value from.
   * @returns {Object} The referenced value in the args passed in.
   */
  getObjectFor: (function () {
    /** @ignore */
    var getProperty = function (property, obj) {
      if (property in obj) {
        obj = obj[property];
      } else {
        // Try to be helpful-
        //  1) If the property doesn't exist on the object,
        //  2) The object is an Array
        //  3) The Array has only one element in it.
        // Unpack the element and try the lookup again.
        if (Array.isArray(obj) && obj.length === 1) {
          obj = obj[0];
        }
        if (property in obj) {
          obj = obj[property];
        } else {
          obj = undefined;
        }
      }
      return obj;
    };


    return function (key, object) {
      // Array / Attribute subscript
      var iarr = key.indexOf('['),
          iattr = key.indexOf('.');

      // Use global scope as default
      object = (arguments.length === 1) ? this.global: object;

      // Nothing to look up on undefined or null objects.
      if (!Espresso.hasValue(object)) {
        return object;
      }

      // Access attributes by the array subscript.
      if ((iarr < iattr || iattr === -1) && iarr > -1) {

        // Found something that looks like: animals[0]
        // Unpack the first part, then deal with the array subscript.
        if (key[0] !== '[') {
          object = getProperty(key.split('[', 1), object);
        }

        // Eat up the descriptor until the beginning of
        // the Array subscript is reached.
        key = key.slice(key.indexOf('[') + 1);

        // Unpack the inside of the array subscript.
        object = getProperty(key.split(']', 1), object);

        // Eat up the rest of the descriptor, leaving new stuff.
        key = key.slice(key.indexOf(']') + 1);

        // Someone's referencing something weird...
        if (!(key === "" || key[0] === '.' || key[0] === '[')) {
          throw new Error("You need to properly index elements!");
        }

        // Eat up the dot.
        if (key.length && key.get(0) === '.') {
          key = key.slice(1);
        }

        // Recurse.
        return Espresso.getObjectFor(key, object);
      } else if ((iattr < iarr || iarr === -1) && iattr > -1) {
        object = getProperty(key.split('.', 1), object);

        // Eat up the dot.
        key = key.slice(key.indexOf('.') + 1);

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
   * Checks whether the variable is defined <b>and</b> is not null.
   *
   * @param {Object} o The object to test if it's defined or not.
   * @returns {Boolean} True if the value is not null and not undefined.
   *
   * @example
   *   var unbound; // This variable is very lonely (and very much undefined)
   *   undefined = 'all your base belong to us'; // Yes, you can rename undefined, but...
   *   alert(Espresso.hasValue(unbound));
   *   // -> false
   *
   *   alert(Espresso.hasValue(undefined));
   *   // -> true
   */
  hasValue: function (o) {
    return (typeof o !== "undefined" && o !== null);
  },

  /**
   * <p>ECMAScript compliant isCallable.</p>
   *
   * <p>The abstract operation IsCallback determines if its argument,
   * which must be an ECMAScript language value, is a callable function
   * Object if it's an Object that hass a function called 'call'.</p>
   *
   * <p>This allows overriding 'call' on an object, effectively making it
   * a callable object.</p>
   *
   * <p>The one addition is ensuring that the method is also applicable,
   * (having the 'apply' being callable too).</p>
   *
   * @function
   * @param {Object} obj The Object to check whether it is callable or not.
   * @returns {Boolean} True if the Object is callable, otherwise false.
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
  }())
}).into(Espresso);
