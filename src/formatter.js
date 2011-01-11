/*globals Espresso */

/** @class

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

      alert(Espresso.Formatter.fmt("Hello, {name}!", { name: "world" }));

  is equivalent to:

      alert(Espresso.Formatter.fmt("Hello, {0.name}!", { name: "world" }));

  For more than one argument you must provide the position of your
  argument.

      alert(Espresso.Formatter.fmt("{0}, {1}!", "hello", "world"));

  If your arguments and formatter are "as is"- that is, in order,
  and flat objects as you intend them to be, you can write your
  template string like so:

      alert(Espresso.Formatter.fmt("{}, {}!", "hello", "world"));

  To use the literals { and }, simply double them, like the following:

      alert(Espresso.Formatter.fmt("{lang} uses the {{variable}} format too!", {
         lang: "Python", variable: "(not used)"
      }));
      // => "Python uses the {variable} format too!"

  Check out the examples given for some ideas on how to use it.

  For developers wishing to have their own custom handler for the
  formatting specifiers, you should write your own  __fmt__ function
  that takes the specifier in as an argument and returns the formatted
  object as a string. All formatters are implemented using this pattern,
  with a fallback to Object's __fmt__, which turns said object into
  a string, then calls __fmt__ on a string.

  Consider the following example:

      Localizer = Espresso.Template.extend({
        __fmt__: function (spec) {
          return this.get(spec);
        }
      });

      _hello = Localizer.extend({
        en: 'hello',
        fr: 'bonjour',
        jp: 'konnichiwa'
      });

      alert(Espresso.Formatter.fmt("{:en}", _hello));
      // => "hello"

      alert(Espresso.Formatter.fmt("{:fr}", _hello));
      // => "bonjour"

      alert(Espresso.Formatter.fmt("{:jp}", _hello));
      // => "konnichiwa"

    [pep]: http://www.python.org/dev/peps/pep-3101/
 */
Espresso.Formatter = {

  /**
    The specifier regular expression.

    The groups are:

      `[[fill]align][sign][#][0][minimumwidth][.precision][type]`

    The brackets (`[]`) indicates an optional element.

    The `fill` is the character to fill the rest of the minimum width
    of the string.

    The `align` is one of:

      - `^` Forces the field to be centered within the available space.
      - `<` Forces the field to be left-aligned within the available space. This is the default.
      - `>` Forces the field to be right-aligned within the available space.
      - `=` Forces the padding to be placed after the sign (if any) but before the digits. This alignment option is only valid for numeric types.

    Unless the minimum field width is defined, the field width
    will always be the same size as the data to fill it, so that
    the alignment option has no meaning in this case.

    The `sign` is only valid for numeric types, and can be one of the following:

      - `+` Indicates that a sign shoulb be used for both positive as well as negative numbers.
      - `-` Indicates that a sign shoulb be used only for as negative numbers. This is the default.
      - ` ` Indicates that a leading space should be used on positive numbers.

    @type RegExp
   */
  SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/,

  /**
    Format a template string with provided arguments.

    @param {String} template The template string to format the arguments with.
    @returns {String} The template formatted with the given leftover arguments.
   */
  fmt: function (template) {
    var args = Array.from(arguments).slice(1),
        prev = '',
        buffer = [],
        result, idx, len = template.length, ch;

    for (idx = 0; idx < len; idx += 1) {
      ch = template.get(idx);

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
        result = this.parseField(template.slice(idx + 1), args);
        buffer[buffer.length] = result[1];
        idx += result[0];
      } else if (ch !== '}') {
        buffer[buffer.length] = ch;
      }
      prev = ch;
    }
    return buffer.join('');
  },

  /**
    Parses the template with the arguments provided,
    parsing any nested templates.

    @param {String} template The template string to format.
    @param {Array} args The arguments to parse the template string.
    @returns {String} The formatted template.
   */
  parseField: function (template, args) {
    var fieldspec = [], result = null, idx = 0, ch, len = template.length;

    for (; idx < len; idx += 1) {
      ch = template.get(idx);
      if (ch === '{') {
        if (fieldspec.length === 0) {
          return [1, '{'];
        }

        result = this.parseField(template.slice(idx + 1), args);
        if (!result[0]) {
          return [idx, '{'];
        } else {
          idx += result[0];
          fieldspec[fieldspec.length] = result[1];
        }
      } else if (ch === '}') {
        return [idx + 1, this.formatField(fieldspec.join(''), args)];
      } else {
        fieldspec[fieldspec.length] = ch;
      }
    }
    return [template.length, fieldspec.join('')];
  },

  /**
    Returns the value of the template string formatted with the
    given arguments.

    @param {String} value The template string and format specifier.
    @param {Array} args An Array of arguments to use to format the template string.
    @returns {String} The formatted template.
   */
  formatField: function (value, args) {
    var iSpec = value.indexOf(':'),
        spec;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    if (value !== '') {
      value = Espresso.getObjectFor(value, args);
    } else {
      value = args.shift();
    }

    if (!spec) {
      return value;
    }

    return value.__fmt__ ? value.__fmt__(spec) : value;
  }  
};
