(function () {

var fullKey, idx,
    delimiters = ['[', ']', '.'],
    fmt = Espresso.format,
    baseError = "Malformed property path:\n{}\n{:->{}}\n",
    emptyPropertyError = baseError +
     "Expected a property, but got '{}'.",
    unexpectedTokenError = baseError +
     "Expected {} as the next token, but got '{}'.";

function meta(o, k) {
  return mix(o.__espmeta__ && o.__espmeta__[k]).into({
    closureKey: k,
    referenceKey: k,
    isComputed: false
  });
}

/** @ignore
  Returns the index of the next delimiter character.
 */
function nextDelimiterFor(path, idx) {
  idx = idx || 0;

  var next = -1, iDelimiter = -1,
      i = 0, len = delimiters.length;

  for (; i < len; i++) {
    iDelimiter = path.indexOf(delimiters[i], idx);
    if (iDelimiter !== -1) {
      next = (iDelimiter < next || next === -1) ?
        iDelimiter : next;
    }
  }

  return next;
}

function getPath(object, path) {
  var nextDelimiter = nextDelimiterFor(path), tuple;

  // Nothing to look up on undefined or null objects.
  if (object == null) {
    return object;
  }
  
  if (nextDelimiter >= 0) {
    if (nextDelimiter !== 0) {
      object = get(object, path.slice(0, nextDelimiter));
      path = path.slice(nextDelimiter);
      idx += nextDelimiter;
    }

    nextDelimiter = path.charAt(0);
    tuple = (['[', ']'].indexOf(nextDelimiter) !== -1) ?
      getIndexedProperty(path) : getProperty(path);

    path = path.slice(tuple[1]);
    object = get(object, tuple[0]);
    idx += tuple[1];

    return path.length ?
      getPath(object, path) : object;
  }

  return get(object, path);
}

function get(object, key) {
  if (key === "") {
    throw new Error(
      fmt(emptyPropertyError,
          fullKey, idx + 2, '^',
          fullKey.charAt(idx + 1)));
  }

  var value = (key in object) ? object[key] : void 0,
      m = meta(object, key);

  // Deal with properties
  if (value != null && value.isProperty) {
    // If the value of the property is cached,
    // retrieve it from the cache and return it.
    if (value.isCacheable) {
      object.__cache__ = object.__cache__ || {};
      if (!object.__cache__.hasOwnProperty(m.closureKey)) {
        object.__cache__[m.closureKey] = value.call(object, m.referenceKey);
      }
      value = object.__cache__[m.closureKey];

    // Otherwise, we need to retrieve the value
    } else {
      value = value.call(object, m.referenceKey);
    }

  // Unknown properties
  } else if (typeof value === "undefined" && object.unknownProperty) {
    value = object.unknownProperty(key);
  }
  return value;
}


function setPath(object, path, value) {
  var nextDelimiter = nextDelimiterFor(path), tuple;

  // Nothing to look up on undefined or null objects.
  if (object == null) {
    return object;
  }
  
  if (nextDelimiter >= 0) {
    if (nextDelimiter !== 0) {
      object = get(object, path.slice(0, nextDelimiter));
      path = path.slice(nextDelimiter);
      idx += nextDelimiter;
    }

    nextDelimiter = path.charAt(0);
    tuple = (['[', ']'].indexOf(nextDelimiter) !== -1) ?
      getIndexedProperty(path) : getProperty(path);

    path = path.slice(tuple[1]);
    if (path.length) {
      object = get(object, path);
      idx += tuple[1];
    }
    return path.length ?
      setPath(object, path, value) : set(object, tuple[0], value);
  }

  return set(object, path, value);
}


/** @ignore
  Returns the property that starts with a '.'.

  This will return a tuple with the key and the amount
  of characters that were eaten by this method.
 */
function getProperty(path) {
  // Assume the path starts with '.'
  var endProperty = nextDelimiterFor(path, 1),
      property;

  if (endProperty === -1) endProperty = path.length;
  property = path.slice(1, endProperty);

  // Should hold to native JavaScript variable naming conditions
  // (sans reserved words)
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(property)) {
    throw new Error(fmt(unexpectedTokenError,
      fullKey, idx + 2, '^',
      "a string", property));
  }

  return [property, endProperty];
}

/** @ignore
  Returns the property that starts with a '[' or ']'.

  This will return a tuple with the key and the amount
  of characters that were eaten by this method.
 */
function getIndexedProperty(path) {
  if (path.charAt(0) === ']') {
    throw new Error(fmt(unexpectedTokenError,
                        fullKey, idx + 1, '^',
                        "'['", ']'));
  }

  // Assume the path starts with '[' or ']'
  var startBrace = 1, endBrace, quote, chr;

  quote = !/^\[\d+\]/.test(path) || "";

  if (quote) {
    quote = path.charAt(startBrace);
    if (quote !== '"' && quote !== "'") {
      throw new Error(fmt(unexpectedTokenError,
                          fullKey, idx + 2, '^',
                          "''', '\"', or a number", quote));
    }
    startBrace += 1;
  }

  // Look for quote first
  if (quote) {
    endBrace = path.indexOf(quote, startBrace);

    // Check to see if the quote was escaped, if so, keep looking.
    while (path.charAt(endBrace - 1) === '\\') {
      endBrace = path.indexOf(quote, endBrace + 1);
      if (endBrace === -1) break;
    }

    // No ending quote
    if (endBrace === -1) {
      throw new Error(fmt(unexpectedTokenError,
                          fullKey, idx + 2, '^',
                          quote, path));

    // Ending quote is not immediately preceded by ']'
    } else if (path.charAt(endBrace + 1) !== ']') {
      throw new Error(fmt(unexpectedTokenError,
                          fullKey, idx + endBrace + 2, '^',
                          ']', path.charAt(endBrace + 1)));
    }
  } else {
    endBrace = path.indexOf(']', startBrace);
    if (endBrace === -1) {
      throw new Error(fmt(unexpectedTokenError,
                          fullKey, idx + 2, '^',
                          ']', path));
    }
  }

  chr = path.charAt(endBrace + quote.length + 1);
  if (chr !== "" && chr !== "[" && chr !== ".") {
    throw new Error(fmt(unexpectedTokenError,
                        fullKey, idx + 2, '^',
                        "'[', '.', or EOS", chr));
  }

  return [path.slice(startBrace, endBrace), endBrace + quote.length + 1];
}

mix({

  get: function (object, path) {
    // Initialize debugging variables
    fullKey = path;
    idx = 0;

    return get(object, path);
  },

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

      alert(Espresso.getPath("environment.isBrowser"));

    @example
      alert(Espresso.getPath("lang.pr._coffee", {
        lang: {
          en: { _coffee: "coffee" },
          pr: { _coffee: "cafe" }
        }
      }));
      // -> "cafe"

    @example
      alert(Espresso.getPath("options[0]", {
        options: ["espresso", "coffee", "tea"]
      }));
      // -> "espresso"

    @param {Object} object The target object to get a value from.
    @param {String} key The key to get on the target.
    @returns {Object} The referenced value in the args passed in.
   */
  getPath: function (object, path) {
    // Initialize debugging variables
    fullKey = path;
    idx = 0;

    return getPath(object, path);
  }

}).into(Espresso);

}());
