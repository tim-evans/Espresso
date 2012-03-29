mix(/** @scope Espresso */{

  /**
    Returns the tokens that make up a property path.

    If there was any issue parsing the property path,
    an informative error will be throw that will mark
    the offending portion of the property path and
    explain what kind of token was expected.

    For example, property paths will be converted like so:

        Espresso.tokensForPropertyPath('foo.bar.baz');
        // ['foo', 'bar', 'baz']

        Espresso.tokensForPropertyPath("foo['bar']['baz']");
        // ['foo', 'bar', 'baz']

    Property strings enclosed inside braces (`[]`) can have
    any character set except for an unescaped ending quote.
    This means Unicode values, spaces, etc. are all valid:

        Espresso.tokensForPropertyPath("what.is['the answer'].to['life, the universe, and everything?']");
        // ['what', 'is', 'the answer', 'to', 'life, the universe, and everything?']

    On the other hand, property paths delimited by a dot (`.`)
    can only be valid JavaScript variable values. The exception
    to this rule is the first parameter which can start with
    a numeric value.

    @param {String} path The property path to parse into tokens
    @returns {Array} The tokens that make up the property path.
    @throws {Error} When encountering a malformed property path.
   */
  tokensForPropertyPath: function (path) {
    // Reset debugging variables
    fullKey = path; idx = 0;
    var nextDelimiter = nextDelimiterFor(path),
        tokens = [], tuple;

    // No delimiter, the token is the path given
    if (nextDelimiter === -1) {
      tokens = [path];

    // Found a delimiter, extract the string before the delimiter.
    } else {
      tokens = [path.slice(0, nextDelimiter)];
      path = path.slice(nextDelimiter);
      idx += nextDelimiter;
    }

    // First property can be a number or string
    if (!/^[a-zA-Z0-9_$]+$/.test(tokens[0])) {
      throw new Error(fmt(0, 'property', tokens[0] || path.charAt(0)));
    }

    // While there are delimiters left,
    while (nextDelimiter >= 0) {
      // Choose parsing method depending on delimiter character
      tuple = (['[', ']'].indexOf(path.charAt(0)) !== -1) ?
        getIndexedProperty(path) : getProperty(path);

      // Eat up used token
      path = path.slice(tuple[1]);
      // Push it on to the token list
      tokens.push(tuple[0]);
      // Increment the current pointer
      idx += tuple[1];

      // And find the next delimiter
      nextDelimiter = nextDelimiterFor(path);
    }

    return tokens;
  }

}).into(Espresso);


// ...............................................
// PARSER LOGIC
//

var DELIMITERS = ['[', ']', '.'];

/** @ignore
  Returns the index of the next delimiter character
  for the given path, starting at the given index.

  If there is no delimiter found, this will return -1.
 */
function nextDelimiterFor(path, idx) {
  idx = idx || 0;

  var next = -1, iDelimiter = -1,
      i = 0, len = DELIMITERS.length;

  for (; i < len; i++) {
    iDelimiter = path.indexOf(DELIMITERS[i], idx);
    if (iDelimiter !== -1) {
      next = (iDelimiter < next || next === -1) ?
        iDelimiter : next;
    }
  }

  return next;
}

// Private variables for storing the property path that's currently being parsed
// and the current index that's been parsed to
var fullKey, idx,
    /** @ignore */
    fmt = function (idx, expected, actual) {
      return 'Malformed property path:\n' + fullKey + '\n' +
             new Array(idx + 1).join('-') + '^\n' +
             'Expected ' + expected + " as the next token, but got '" + actual + "'.";
    };

var VARIABLE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/** @ignore
  Returns the property that starts with a '.'.

  Looks for a property token that obeys the syntax
  rules of JavaScript variable naming:

      Property
        : VARIABLE '.'
          {$$ = $2;}
        ;

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
  if (!VARIABLE.test(property)) {
    throw new Error(fmt(idx + 1, 'a string', fullKey.charAt(idx + 1)));
  }

  return [property, endProperty];
}


var WHOLE_NUMBER = /^\[(-)?\d+\]/;

/** @ignore
  Returns the property that starts with a '[' or ']'.

  Looks for a property token that follows the following
  lexical grammar (where WHOLE_NUMBER is a whole number and
  STRING is a string without an unescaped closing quote):

      IndexedProperty
        : '[' NUMBER ']'
           {$$ = $2;}
        | '["' STRING '"]'
           {$$ = $2;}
        | "['" STRING "']"
           {$$ = $2;}
        ;

  This means the following tokens are valid:

      ['Hello, world']  => Hello, world
      [0]               => 0
      [-1]              => -1
      ["\\\""]          => "
      ['こんにちは']    => こんにちは

  Note that the escaped double quote was will translate
  into JavaScript as '["\""]'. This is being interpolated
  again by the parser, which means that the string should
  respect explicit escapes in the string.

  This will return a tuple with the key and the amount
  of characters that were eaten by this method.
 */
function getIndexedProperty(path) {
  // Can't start with ']'
  if (path.charAt(0) === ']') {
    throw new Error(fmt(idx, "'['", ']'));
  }

  // Assume the path starts with '[' or ']'
  var startBrace = 1, endBrace, quote, chr;

  quote = !WHOLE_NUMBER.test(path) || '';

  // Requires quotes for valid property paths if
  // the contents aren't numeric
  if (quote) {
    quote = path.charAt(startBrace);
    if (quote !== '"' && quote !== "'") {
      throw new Error(fmt(idx + 1, "''', '\"', or a number", quote));
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
      throw new Error(fmt(idx + 1, 'closing ' + quote, path.slice(2)));

    // Ending quote is not immediately preceded by ']'
    } else if (path.charAt(endBrace + 1) !== ']') {
      throw new Error(fmt(idx + endBrace + 1, "']'", path.charAt(endBrace + 1)));
    }

  // No quote; look for ']'
  } else {
    endBrace = path.indexOf(']', startBrace);
    // We matched against a RegExp, so we don't need to check for
    // the ending ']'
  }

  // Check to see if the next character is valid.
  chr = path.charAt(endBrace + quote.length + 1);
  if (chr !== '' && chr !== '[' && chr !== '.') {
    throw new Error(fmt(idx + 1, "'[', '.', or EOS", chr));
  }

  // Replace escaped quotes with quotes (like \' or \")
  // This allows paths that include ' and " in them.
  return [path.slice(startBrace, endBrace)
              .replace(new RegExp('\\\\' + quote, 'g'), quote), endBrace + quote.length + 1];
}
