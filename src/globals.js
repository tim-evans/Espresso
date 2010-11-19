/*globals mix */

// Lua-like global variable so you don't have to guess what
// the global variable is.
var _G = mix(/** @lends _global_ */{

  /**
   * Lookup a variable's value given its Object notation.
   * This requires absolute queries to the Object.
   *
   * The most effort that is performed on behalf of the
   * lookup when it fails is when:
   *  If it's an array.
   *    AND
   *  It's the only element in the array,
   *    THEN
   *  unpack the element and make that the argument.
   *
   * This does not mean that absolute notation does not
   * work in these cases; it just means that it's optional.
   *
   * This prevents unnecessary indexing by the user,
   * expecially in the case of the arguments Array.
   *
   * {{{
   *   // Properties on the global scope need to be there-
   *   // local scoped variables will not be found!
   *   window.Hydrogen = Root.extend({
   *     symbol: 'H'
   *   });
   *
   *   alert(getObjectFor("Hydrogen.symbol"));
   *   // -> 'H'
   *
   *   alert(getObjectFor("name", { name: "Ein" }));
   *   // -> "Ein"
   *   alert(getObjectFor("name", [{ name: "Ein" }]));  // Unpacked for you!
   *   // -> "Ein"
   *
   *   alert(getObjectFor("0", ["hello", "world"])); // BEWARE!
   *   // -> ["hello", "world"]
   *
   *   alert(getObjectFor("lang.jp._hello", {
   *     lang: {
   *       en: { _hello: "hello", _goodbye: "goodbye" },
   *       jp: { _hello: "konnichiwa", _goodbye: "sayonara" }
   *     }
   *   }));
   *   // -> "konnichiwa"
   * }}}
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
        if (obj instanceof Array && obj.length === 1) {
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
      object = (arguments.length === 1) ? _G: object;

      // Nothing to look up on undefined or null objects.
      if (!_G.hasValue(object)) {
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
        if (key.length && key[0] === '.') {
          key = key.slice(1);
        }

        // Recurse.
        return _G.getObjectFor(key, object);
      } else if ((iattr < iarr || iarr === -1) && iattr > -1) {
        object = getProperty(key.split('.', 1), object);

        // Eat up the dot.
        key = key.slice(key.indexOf('.') + 1);

        // Recurse
        return _G.getObjectFor(key, object);

        // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol getObjectFor
      return getProperty(key, object);
    };
  }()),

  /**
   * Checks whether the variable is defined *and* not null.
   * {{{
   *   var foo;
   *   alert(hasValue(null));
   *   // -> false
   *
   *   undefined = 'all your base are belong to us';
   *   alert(hasValue(foo));
   *   // -> false
   * }}}
   * @param {Object} o The object to test if it's defined or not.
   * @returns {Boolean} True if the value is not null and not undefined.
   */
  hasValue: function (o) {
    return (typeof o !== "undefined" && o !== null);
  }

}).into(this);
