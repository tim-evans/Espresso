/*globals Espresso */

(function ()/** @lends Espresso */{

// Error strings.
var baseError = "Malformed format template:\n{}\n{:->{}}\n",
    unmatchedOpening = baseError + "Unmatched opening brace.",
    unmatchedClosing = baseError + "Unmatched closing brace.",
    openingBrace = '{',
    closingBrace = '}',
    specifierSeparator = ':';

/** @ignore */  // Docs are above
function vformat(template, args) {
  var prev = '', ch,
      buffer = [],
      result, idx = 0,
      len = template.length;

  for (; idx < len; idx++) {
    ch = template.charAt(idx);

    if (prev === closingBrace) {
      if (ch !== closingBrace) {
        throw new Error(vformat(unmatchedClosing, [template, idx, '^']));

      // Double-escaped closing brace.
      } else {
        buffer[buffer.length] = closingBrace;
        prev = '';
        continue;
      }
    }

    // Begin template parsing
    if (ch === openingBrace) {
      result = parseField(template, idx, template.slice(idx + 1), args);
      buffer[buffer.length] = result[1];
      idx += result[0]; // continue after the template.

    // Normal string processing
    } else if (ch !== closingBrace) {
      buffer[buffer.length] = ch;
    }
    prev = ch;
  }

  // Can't end with an unclosed closing brace
  if (ch === closingBrace && template.charAt(idx - 2) !== closingBrace) {
    throw new Error(vformat(unmatchedClosing, [template, idx, '^']));
  }
  return buffer.join('');
}

/** @ignore
  Parses the template with the arguments provided,
  parsing any nested templates.

  @param {String} template The template string to format.
  @param {Array} args The arguments to parse the template string.
  @returns {Array} A tuple with the length it ate up and the formatted template.
 */
function parseField(fullTemplate, fullIdx, template, args) {
  var idx = 0, ch, len = template.length,
      inSpecifier = false, iBrace = 0;
  for (; idx < len; idx++) {
    ch = template.charAt(idx);
    if (!inSpecifier) {
      if (ch === specifierSeparator) {
        inSpecifier = true;
        continue;
      }

      // Double-escaped opening brace
      if (ch === openingBrace) {
        if (idx === 0) {
          return [1, openingBrace];
        } else {
          throw new Error(vformat(unmatchedOpening, [fullTemplate, fullIdx + 1,  '^']));
        }

      // Done formatting.
      } else if (ch === closingBrace) {
        return [idx + 1, formatField(template.slice(0, idx), args)];
      }

    // Format the template's specifier *after* the whole specifier is found.
    } else {
      if (ch === openingBrace) {
        iBrace++;
      } else if (ch === closingBrace) {
        iBrace--;
      }

      // Spec is done.
      if (iBrace === -1) {
        return [idx + 1, formatField(vformat(template.slice(0, idx), args), args)];
      }
    }
  }
  throw new Error(vformat(unmatchedOpening, [fullTemplate, fullIdx + 1, '^']));
}

/** @ignore
  Returns the value of the template string formatted with the
  given arguments.

  @param {String} value The template string and format specifier.
  @param {Array} args An Array of arguments to use to format the template string.
  @returns {String} The formatted template.
 */
function formatField(value, args) {
  var iSpec = value.indexOf(specifierSeparator),
      spec, res;
  iSpec = iSpec === -1 ? value.length : iSpec;
  spec = value.slice(iSpec + 1);
  value = value.slice(0, iSpec);

  // Got `{}`; shift off the first argument passed in.
  if (value === '') {
    res = args.shift();

  // Return the object referenced by the property path given.
  } else {
    // First, try to get the value by absolute paths
    res = Espresso.getPath(args, value);

    // Allow for references to object literals
    if (typeof res === "undefined" &&
        Array.isArray(args) && args.length === 1 && args[0] != null) {
      res = Espresso.getPath(args[0], value);
    }
  }

  if (!spec) {
    return res;
  }

  return res != null && res.toFormat ? res.toFormat(spec) : String(res).toFormat(spec);
}

mix({
  /**
    Advanced String Formatting borrowed from the eponymous Python PEP.

    The formatter follows the rules of Python [PEP 3101][pep]
    (Advanced String Formatting) and following the ECMAScript
    Harmony strawman specification for string formatting
    (found [here][strawman]).

    To use literal object notation, just pass in one argument for
    the formatter. This is optional however, as you can always
    absolutely name the arguments via the number in the argument
    list. This means that:

        alert(Espresso.format("Hello, {name}!", { name: "world" }));

    is equivalent to:

        alert(Espresso.format("Hello, {0.name}!", { name: "world" }));

    For more than one argument you must provide the position of your
    argument.

        alert(Espresso.format("{0}, {1}!", "hello", "world"));

    If your arguments and formatter are "as is"- that is, in order,
    and flat objects as you intend them to be, you can write your
    template string like so:

        alert(Espresso.format("{}, {}!", "hello", "world"));

    To use the literals `{` and `}`, simply double them, like the following:

        alert(Espresso.format("{lang} uses the {{variable}} format too!", {
           lang: "Python", variable: "(not used)"
        }));
        // => "Python uses the {variable} format too!"

    Check out the examples given for some ideas on how to use it.

    The formatting API uses the special `toFormat` function on an
    object to handle the interpretation of the format specifiers.

    The default `toFormat` handler is on `Object.prototype`.

    For an example of a specialized format schema, consider the
    following example:

        Localizer = mix({
          toFormat: function (spec) {
            return this[spec];
          }
        }).into({});

        _hello = mix(Localizer).into({
          en: 'hello',
          fr: 'bonjour',
          ja: 'こんにちは'
        });

        alert(Espresso.format("{:en}", _hello));
        // => "hello"

        alert(Espresso.format("{:fr}", _hello));
        // => "bonjour"

        alert(Espresso.format("{:ja}", _hello));
        // => "こんにちは"

      [pep]: http://www.python.org/dev/peps/pep-3101/
      [strawman]: http://wiki.ecmascript.org/doku.php?id=strawman:string_format_take_two

    @param {String} template The template string to format the arguments with.
    @returns {String} The template formatted with the given leftover arguments.
   */
  format: function (template) {
    return vformat(template, Espresso.A(arguments).slice(1));
  },

  /**
    Same as {@link Espresso.format}, but with an explicit argument list.

    @param {String} template The template string to format the argument list with.
    @param {Array} argList The argument list to format.
    @returns {String} The template formatted with the given leftover arguments.
    @see Espresso.format
   */
  vformat: vformat,

  /**
    The specifier regular expression.

    The groups are:

      `[[fill]align][sign][#][0][minimumwidth][.precision][type]`

    The brackets (`[]`) indicates an optional element.

    The `fill` is the character to fill the rest of the minimum width
    of the string.

    The `align` is one of:

      - `^` Forces the field to be centered within the available space.
      - `<` Forces the field to be left-aligned within the available
            space. This is the default.
      - `>` Forces the field to be right-aligned within the available space.
      - `=` Forces the padding to be placed after the sign (if any)
            but before the digits. This alignment option is only valid
            for numeric types.

    Unless the minimum field width is defined, the field width
    will always be the same size as the data to fill it, so that
    the alignment option has no meaning in this case.

    The `sign` is only valid for numeric types, and can be one of
    the following:

      - `+` Indicates that a sign shoulb be used for both positive
            as well as negative numbers.
      - `-` Indicates that a sign shoulb be used only for as negative
            numbers. This is the default.
      - ` ` Indicates that a leading space should be used on positive
            numbers.

    If the `#` character is present, integers use the 'alternate form'
    for formatting. This means that binary, octal, and hexadecimal
    output will be prefixed with '0b', '0o', and '0x', respectively.

    `width` is a decimal integer defining the minimum field width. If
    not specified, then the field width will be determined by the
    content.

    If the width field is preceded by a zero (`0`) character, this enables
    zero-padding. This is equivalent to an alignment type of `=` and a
    fill character of `0`.

    The 'precision' is a decimal number indicating how many digits
    should be displayed after the decimal point in a floating point
    conversion. For non-numeric types the field indicates the maximum
    field size- in other words, how many characters will be used from
    the field content. The precision is ignored for integer conversions.

    Finally, the 'type' determines how the data should be presented.

    The available integer presentation types are:

      - `b` Binary. Outputs the number in base 2.
      - `c` Character. Converts the integer to the corresponding
            Unicode character before printing.
      - `d` Decimal Integer. Outputs the number in base 10.
      - `o` Octal format. Outputs the number in base 8.
      - `x` Hex format. Outputs the number in base 16, using lower-
            case letters for the digits above 9.
      - `X` Hex format. Outputs the number in base 16, using upper-
            case letters for the digits above 9.
      - `n` Number. This is the same as `d`, except that it uses the
            current locale setting to insert the appropriate
            number separator characters.
      - ` ` (None) the same as `d`

    The available floating point presentation types are:

      - `e` Exponent notation. Prints the number in scientific
            notation using the letter `e` to indicate the exponent.
      - `E` Exponent notation. Same as `e` except it converts the
            number to uppercase.
      - `f` Fixed point. Displays the number as a fixed-point
            number.
      - `F` Fixed point. Same as `f` except it converts the number
            to uppercase.
      - `g` General format. This prints the number as a fixed-point
            number, unless the number is too large, in which case
            it switches to `e` exponent notation.
      - `G` General format. Same as `g` except switches to `E`
            if the number gets to large.
      - `n` Number. This is the same as `g`, except that it uses the
            current locale setting to insert the appropriate
            number separator characters.
      - `%` Percentage. Multiplies the number by 100 and displays
            in fixed (`f`) format, followed by a percent sign.
      - ` ` (None) similar to `g`, except that it prints at least one
            digit after the decimal point.

    @type RegExp
   */
  FORMAT_SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(\.\d+)?([bcoxXeEfFG%ngd])?/
}).into(Espresso);

}());
