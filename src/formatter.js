/*globals Espresso */

(function ()/** @lends Espresso */{
  mix({
    /** @function
      @desc
      Advanced String Formatting borrowed from the eponymous Python PEP.
      It provides a flexible and powerful string formatting utility
      that allows the your string templates to have meaning!

      The formatter follows the rules of Python [PEP 3101][pep]
      (Advanced String Formatting) strictly, but takes into account
      differences between JavaScript and Python.

      To use literal object notation, just pass in one argument for
      the formatter. This is optional however, as you can always
      absolutely name the arguments via the number in the argument
      list. This means that:

          alert(Espresso.fmt("Hello, {name}!", { name: "world" }));

      is equivalent to:

          alert(Espresso.fmt("Hello, {0.name}!", { name: "world" }));

      For more than one argument you must provide the position of your
      argument.

          alert(Espresso.fmt("{0}, {1}!", "hello", "world"));

      If your arguments and formatter are "as is"- that is, in order,
      and flat objects as you intend them to be, you can write your
      template string like so:

          alert(Espresso.fmt("{}, {}!", "hello", "world"));

      To use the literals `{` and `}`, simply double them, like the following:

          alert(Espresso.fmt("{lang} uses the {{variable}} format too!", {
             lang: "Python", variable: "(not used)"
          }));
          // => "Python uses the {variable} format too!"

      Check out the examples given for some ideas on how to use it.

      For developers wishing to have their own custom handler for the
      formatting specifiers, you should write your own  `__fmt__` function
      that takes the specifier in as an argument and returns the formatted
      object as a string. All formatters are implemented using this pattern,
      with a fallback to Object's `__fmt__`, which turns said object into
      a string, then calls `__fmt__` on a string.

      Consider the following example:

          Localizer = mix({
            __fmt__: function (spec) {
              return this[spec];
            }
          }).into({});

          _hello = mix(Localizer).into({
            en: 'hello',
            fr: 'bonjour',
            ja: 'こんにちは'
          });

          alert(Espresso.fmt("{:en}", _hello));
          // => "hello"

          alert(Espresso.fmt("{:fr}", _hello));
          // => "bonjour"

          alert(Espresso.fmt("{:ja}", _hello));
          // => "こんにちは"

        [pep]: http://www.python.org/dev/peps/pep-3101/

      @param {String} template The template string to format the arguments with.
      @returns {String} The template formatted with the given leftover arguments.
     */
    fmt: fmt,

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
    FMT_SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/
  }).into(Espresso);

  /** @ignore */  // Docs are above
  function fmt(template) {
    var args = Espresso.toArray(arguments).slice(1),
        prev = '',
        buffer = [],
        result, idx, len = template.length, ch;

    for (idx = 0; idx < len; idx += 1) {
      ch = template.charAt(idx);

      if (prev === '}') {
        if (ch !== '}') {
          throw new Error("Unmatched closing brace.");
        } else {
          buffer[buffer.length] = '}';
          prev = '';
          continue;
        }
      }

      if (ch === '{') {
        result = parseField(template.slice(idx + 1), args);
        buffer[buffer.length] = result[1];
        idx += result[0];
      } else if (ch !== '}') {
        buffer[buffer.length] = ch;
      }
      prev = ch;
    }
    return buffer.join('');
  }

  /** @ignore
    Parses the template with the arguments provided,
    parsing any nested templates.

    @param {String} template The template string to format.
    @param {Array} args The arguments to parse the template string.
    @returns {String} The formatted template.
   */
  function parseField(template, args) {
    var fieldspec = [], result = null, idx = 0, ch, len = template.length;

    for (; idx < len; idx += 1) {
      ch = template.charAt(idx);
      if (ch === '{') {
        if (fieldspec.length === 0) {
          return [1, '{'];
        }

        result = parseField(template.slice(idx + 1), args);
        if (!result[0]) {
          return [idx, '{'];
        } else {
          idx += result[0];
          fieldspec[fieldspec.length] = result[1];
        }
      } else if (ch === '}') {
        return [idx + 1, formatField(fieldspec.join(''), args)];
      } else {
        fieldspec[fieldspec.length] = ch;
      }
    }
    return [template.length, fieldspec.join('')];
  }

  /** @ignore
    Returns the value of the template string formatted with the
    given arguments.

    @param {String} value The template string and format specifier.
    @param {Array} args An Array of arguments to use to format the template string.
    @returns {String} The formatted template.
   */
  function formatField(value, args) {
    var iSpec = value.indexOf(':'),
        spec, res;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    if (value !== '') {
      res = Espresso.getObjectFor(value, args);
      if (typeof res === "undefined" &&
          Array.isArray(args) && args.length === 1 && Espresso.hasValue(args[0])) {
        res = args[0].get ? args[0].get(value) : Espresso.getObjectFor(value, args[0]);
      }
    } else {
      res = args.shift();
    }

    if (!spec) {
      return res;
    }

    return res.__fmt__ ? res.__fmt__(spec) : res;
  }
}());
