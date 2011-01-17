/*global JSON mix Espresso*/

/** @namespace
  Shim for JSON.

  Parts are borrowed from Douglas Crockford's [JSON2][1]. This
  JSON parser is designed to be safe rather than fast. The
  parser will fall back on native implementations when possible.

  For more information about the JSON object, see [Mozilla's
  documentation][2] on it.

    [1]: https://github.com/douglascrockford/JSON-js
    [2]: https://developer.mozilla.org/En/Using_native_JSON

  @name JSON
 */
Espresso.global.JSON = Espresso.global.JSON || {};

mix(/** @lends JSON# */{

  /** @function
    @desc

    The `stringify` function returns a String in JSON
    format representing an ECMAScript value.

    @param {Object} value An ECMAScript value.
    @param {Function|Array} [replacer] Either a function that
      alters the way objects and arrays are stringified or an
      array of strings and numbers that acts as a white list
      for selecteing the object properties that will be stringified.
    @param {String|Number} [space] Allows the result to have
      white space injected into it to improve human readability.

    @returns {String} The ECMAScript value as a JSON string.
   */
  stringify: (function () {
    var escapable, abbrev, stack, indent, gap, space,
        PropertyList, ReplacerFunction, Str, Quote, JO, JA;

    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    abbrev = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };

    /** @ignore
     * The abstract operation Str(key, holder) has access to ReplacerFunction
     * from the invocation of the stringify method.
     */
    Str = function (key, holder) {
      var value;

      // 1. Let value be the result of calling the [[Get]] internal method of
      //    holder with argument key.
      value = holder && (holder.get && holder.get(key) || holder[key]);

      // 2. If Type(value) is Object, then
      if (typeof value === "object") {
        // a. Let toJSON be the result of calling the [[Call]] internal method
        //    of value with argument toJSON
        // b. If IsCallable(toJSON) is true
        if (value && Espresso.isCallable(value.toJSON)) {
          // i. Let value be the result of calling the [[Call]] internal method
          //    of toJSON passing value as the this value and with an argument
          //    list consisting of key and value.
          value = value.toJSON(key);
        }
      }

      // 3. If ReplacerFunction is not undefined, then
      if (typeof ReplacerFunction !== "undefined") {
        // a. Let value be the result of calling the [[Call]] internal method
        //    of ReplacerFunction passing holder as the this value and with
        //    an argument list containing key and value.
        ReplacerFunction.call(holder, key, value);
      }

      // 5. If value is null then return "null".
      switch (typeof value) {
      case 'boolean':
      case 'null':
        return String(value);
      case 'string':
        return Quote(value);
      case 'number':
        return isFinite(value) ? String(value): "null";
      case 'object':
        if (!value) {
          return 'null';
        }

        if (Array.isArray(value)) {
          return JA(value);
        } else {
          return JO(value);
        }
        break;
      default:
        return undefined;
      }
    };

    /** @ignore
     * The abstract operation Quote(value) wraps a String value
     * in double quotes and escapes characters within it.
     */
    Quote = function (value) {
      escapable.lastIndex = 0;
      return '"' + (escapable.test(value) ?
        value.replace(escapable, function (a) {
          var c = abbrev[a];
          return typeof c === 'string' ?
            c: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }): value) + '"';
    };

    /** @ignore */
    JO = function (value) {
      var stepback, K, partial;

      // 1. If stack contains value then throw a TypeError exception
      //    because the structure is cyclical.
      if (stack.indexOf(value) !== -1) {
        throw new TypeError("Cannot stringify a cyclical structure to JSON.");
      }

      // 2. Append value to stack.
      stack[stack.length] = value;

      // 3. Let stepback be indent.
      stepback = indent;

      // 4. Let indent be the concatenation of indent and gap.
      indent += gap;

      // 5. If PropertyList is not undefined, then
      if (typeof PropertyList !== "undefined") {
        // a. Let K be PropertyList.
        K = PropertyList;

      // 6. Else
      } else {
        // a. Let K be an internal List of Strings consisting
        //    of the names of all the own properties of value whose
        //    [[Enumerable]] attribute is true.
        //    The ordering of the Strings should be the same as that used by the
        //    Object.keys standard built-in function.
        K = Object.keys(value);
      }

      // 7. Let partial be an empty List.
      partial = [];

      // 8. For each element P of K.
      K.forEach(function (P) {
        var strP = Str(P, value), member;
        if (typeof strP !== "undefined") {
          member = Quote(P);
          member += ":";
          if (gap !== '') {
            member += space;
          }
          member += strP;
          partial[partial.length] = member;
        }
      });

      var result;
      if (partial.length === 0) {
        result = "{}";
      } else {
        if (gap === '') {
          result = "{" + partial.join(',') + "}";
        } else {
          result = '{\n' +
            indent + partial.join(',\n' + indent) + '\n' +
           stepback + '}';
        }
      }

      stack.pop();
      indent = stepback;
      return result;
    };

    /** @ignore */
    JA = function (value) {
      var stepback, partial, len, index, strP, result;

      // 1. If stack contains value then throw a TypeError exception
      //    because the structure is cyclical.
      if (stack.indexOf(value) !== -1) {
        throw new TypeError("Cannot stringify a cyclical structure to JSON.");
      }

      // 2. Append value to stack.
      stack[stack.length] = value;

      // 3. Let stepback be indent.
      stepback = indent;

      // 4. Let indent be the concatenation of indent and gap.
      indent += gap;

      // 5. Let partial be an empty List.
      partial = [];

      // 6. Let len be the result of calling the [[Get]] internal method
      //    of value with argument "length".
      len = value.get('length');

      // 7. Let index be 0.
      index = 0;

      // 8. Repeat while index < len
      while (index < len) {
        strP = Str(String(index), value);
        if (typeof strP === "undefined") {
          partial[partial.length] = "null";
        } else {
          partial[partial.length] = strP;
        }
        index += 1;
      }

      // 9. If partial is empty, then
      if (partial.length === 0) {
        result = "[]";

      // 10. Else
      } else {
        if (gap === '') {
          result = "[" + partial.join(',') + "]";
        } else {
          result = '[\n' +
            indent + partial.join(',\n' + indent) + '\n' +
           stepback + ']';
        }
      }

      // 11. Remove the last element of stack.
      stack.pop();

      // 12. Let indent be stepback.
      indent = stepback;

      // 13. Return final.
      return result;
    };

    return function (value, replacer, sp) {
      var k, v, len, item;

      // 1. Let stack be an empty List.
      stack = [];

      // 2. Let indent be the empty String.
      indent = '';

      // 3. Let PropertyList and ReplacerFunction be undefined
      PropertyList = ReplacerFunction = undefined;

      // 4. If Type(replacer) is Object, then
      if (typeof replacer === "object") {
        // a. If IsCallable(replacer) is true, then
        if (isCallable(replacer)) {
          //  i. Let ReplacerFunction be replacer.
          ReplacerFunction = replacer;

        // b. Else if the [[Class]] internal property of replacer is "Array", then
        } else if (Array.isArray()) {
          //  i. Let PropertyList be an empty internal List
          PropertyList = [];

          // ii. For each value v of a property of replacer that has an array
          //     index property name. The properties are enumerated in the ascending
          //     array index order of their names.
          len = replacer.length;
          for (k = 0; k < len; k += 1) {
            v = replacer[k];
            item = undefined;
            if (typeof v === "string") {
              item = v;
            } else if (typeof v === "number") {
              item = v.toString();
            } else if (typeof v === "object" &&
                       (/string/i.test(Object.prototype.toString.call(v)) ||
                        /number/i.test(Object.prototype.toString.call(v)))) {
              item = v.toString();
            }
            if (typeof item !== "undefined" && PropertyList.indexOf(item) === -1) {
              PropertyList[PropertyList.length] = item;
            }
          }
        }
      }

      // 5. If Type(space) is Object then,
      if (typeof sp === "object") {
        // a. If the [[Class]] property of space is "Number" then,
        if (/number/i.test(Object.prototype.toString.call(sp))) {
          // i. Let space be ToNumber(space).
          sp = Number(sp);

        // b. Else if the [[Class]] internal property of space is "String" then,
        } else if (/string/i.test(Object.prototype.toString.call(sp))) {
          // i. Let space be ToString(space)
          sp = sp.toString();
        }
      }

      // 6. If Type(space) is Number
      if (typeof sp === "number") {
        // a. Let space be min(10, ToInteger(space)).
        sp = Math.min(10, sp);
        // b. Set gap to a String containing `space` space characters.
        //    This will be the empty String if space is less than 1.
        gap = sp < 1 ? '': ' '.times(sp);

      // 7. Else if Type(space) is String
      } else if (typeof sp === "string") {
        // a. If the number of characters in space is 10 or less,
        //    set gap to space otherwise set gap to a String consisting
        //    of the first 10 characters of space.
        gap = (sp.length <= 10) ? sp: sp.slice(0, 10);

      // 8. Else
      } else {
        // a. Set gap to the empty String.
        gap = '';
      }
      space = sp;

      return Str('', {'': value});
    };
  }()).inferior(),

  /** @function
    @desc

    The `parse` function parses a JSON text and produces an
    ECMAScript value.

    @param {String} text The JSON text to parse.
    @param {Function} [reviver] A function that takes two
      values (key and value). It can filter and transform the
      results. It is called with each of the key/value pairs
      produced by the parse, and its return value is used
      instead of the original value. If it returns what it
      recieved, the structure is not modified. If it returns
      `undefined`, then the property is deleted from the result.

    @returns {Object} The JSON text as an ECMAScript value.
   */
  parse: (function () {
    /** @ignore */
    var evaluate = function (text) {
      var at = 0,     // The index of the current character
          ch = ' ',   // The current character
          escapee = { '"':  '"',
                      '\\': '\\',
                      '/':  '/',
                      b:    '\b',
                      f:    '\f',
                      n:    '\n',
                      r:    '\r',
                      t:    '\t' },
      /** @ignore */
      next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
          throw new SyntaxError("Expected '{}' instead of '{}'".fmt(c, ch));
        }

        // Get the next character. When there are no more characters,
        // return the empty string.
        ch = text.charAt(at);
        at += 1;
        return ch;
      },

      // Parse a number value.
      /** @ignore */
      number = function () {
        var number,
            string = '';

        if (ch === '-') {
          string = '-';
          next('-');
        }
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
        if (ch === '.') {
          string += '.';
          while (next() && ch >= '0' && ch <= '9') {
            string += ch;
          }
        }
        if (ch === 'e' || ch === 'E') {
          string += ch;
          next();
          if (ch === '-' || ch === '+') {
            string += ch;
            next();
          }
          while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
          }
        }
        number = +string;
        if (isNaN(number)) {
          throw new SyntaxError("'{}' is not a number.".fmt(string));
        } else {
          return number;
        }
      },

      // Parse a string value.
      /** @ignore */
      string = function () {
        var hex,
            i,
            string = '',
            uffff;

        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
          while (next()) {
            if (ch === '"') {
              next();
              return string;
            } else if (ch === '\\') {
              next();
              if (ch === 'u') {
                uffff = 0;
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(next(), 16);
                  if (!isFinite(hex)) {
                    break;
                  }
                  uffff = uffff * 16 + hex;
                }
                string += String.fromCharCode(uffff);
              } else if (typeof escapee[ch] === 'string') {
                string += escapee[ch];
              } else {
                break;
              }
            } else {
              string += ch;
            }
          }
        }
        throw new SyntaxError("Bad string.");
      },

      // Skip whitespace.
      /** @ignore */
      white = function () {
        while (ch && ch <= ' ') {
          next();
        }
      },

      // true, false, or null.
      /** @ignore */
      word = function () {
        switch (ch) {
        case 't':
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f':
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n':
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
        }
        throw new SyntaxError("Unexpected character '{}'".fmt(ch));
      },

      value,  // Place holder for the value function.

      // Parse an array value.
      /** @ignore */
      array = function () {
        var array = [];

        if (ch === '[') {
          next('[');
          white();
          if (ch === ']') {
            next(']');
            return array;   // empty array
          }
          while (ch) {
            array.push(value());
            white();
            if (ch === ']') {
              next(']');
              return array;
            }
            next(',');
            white();
          }
        }
        throw new SyntaxError("Bad Array");
      },

      // Parse an object value.
      /** @ignore */
      object = function () {
        var key,
            object = {};

        if (ch === '{') {
          next('{');
          white();
          if (ch === '}') {
            next('}');
            return object;   // empty object
          }
          while (ch) {
            key = string();
            white();
            next(':');
            if (Object.hasOwnProperty.call(object, key)) {
              throw new SyntaxError('Duplicate key "{}"'.fmt(key));
            }
            object[key] = value();
            white();
            if (ch === '}') {
              next('}');
              return object;
            }
            next(',');
            white();
          }
        }
        throw new SyntaxError("Bad Object");
      };

      // Parse a JSON value. It could be an object, an array, a string, a number,
      // or a word.
      /** @ignore */
      value = function () {
        white();
        switch (ch) {
        case '{':
          return object();
        case '[':
          return array();
        case '"':
          return string();
        case '-':
          return number();
        default:
          return ch >= '0' && ch <= '9' ? number() : word();
        }
      };

      var ret = value();
      white();
      if (ch) {
        throw new SyntaxError("Unexpected character '{}'".fmt(ch));
      }
      return ret;
    };

    return function (text, reviver) {
      var o = evaluate(text);

      /** @ignore */
      var Walk = function (holder, key) {
        var val = holder[key], k, v;

        if (Espresso.hasValue(val)) {
          for (k in val) {
            if (val.hasOwnProperty(k)) {
              v = Walk(val, k);
              if (typeof v === "undefined") {
                delete val[k];
              } else {
                val[k] = v;
              }
            }
          }
        }
        return reviver.call(holder, key, val);
      };

      return Espresso.isCallable(reviver) ?
        Walk({ '': o }, ''): o;
    };
  }()).inferior()
}).into(JSON);
