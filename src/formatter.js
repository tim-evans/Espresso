/**
 * @class
 * Advanced String Formatting borrowed from the eponymous Python PEP.
 * It provides a flexible and powerful string formatting utility
 * that allows the your string templates to have meaning!
 *
 * The formatter follows the rules of the Python
 * "PEP 3101(Advanced String Formatting)":http://www.python.org/dev/peps/pep-3101/ strictly,
 * but takes into account differences between JavaScript and Python.
 *
 * To use literal object notation, just pass in one argument for
 * the formatter. This is optional however, as you can always
 * absolutely name the arguments via the number in the argument
 * list. This means that:
 *
 * {{{
 *   Seed.String.Formatter.fmt("Hello, {name}!", { name: "world" });
 * }}}
 *
 * is equivalent to:
 *
 * {{{
 *   Seed.String.Formatter.fmt("Hello, {0.name}!", { name: "world" });
 * }}}
 *
 * For more than one argument you must mention the position of your
 * argument.
 *
 * {{{
 *   Seed.String.Formatter.fmt("{0.name} says {1}!", { name: "Domo" }, "hello");
 * }}}
 *
 * If your arguments and formatter are "as is"- that is, in order,
 * and flat objects as you intend them to be, you can write your
 * template string like so:
 *
 * {{{
 *   Seed.String.Formatter.fmt("{} says {}!", "Domo", "hello");
 * }}}
 *
 * Check out the examples given for some ideas on how to use it.
 *
 * For developers wishing to have their own custom handler for the
 * formatting specifiers, you should write your own  __fmt__ function
 * that takes the specifier in as an argument and returns the formatted
 * object as a string. All formatters are implemented using this pattern,
 * with a fallback to Object's __fmt__, which turns the said object into
 * a string, then calls __fmt__ on a string.
 *
 * Consider the following example:
 *
 * {{{
 *   Localizer = Root.extend({
 *     __fmt__: function (spec) {
 *       return this[spec];
 *     }
 *   });
 *
 *   _hello = Localizer.extend({
 *     en: 'hello',
 *     fr: 'bonjour',
 *     jp: 'konnichiwa'
 *   });
 *
 *   Seed.String.Formatter.fmt("{:en}", _hello);
 *   // -> "hello"
 *
 *   Seed.String.Formatter.fmt("{:fr}", _hello);
 *   // -> "bonjour"
 *
 *   Seed.String.Formatter.fmt("{:jp}", _hello);
 *   // -> "konnichiwa"
 * }}}
 *
 * Try these examples to get a hang of how string formatting works!
 *
 * {{{
 *   Seed.String.Formatter.fmt("Arguments: {1}; {0}; {2}", 0, 1, 2);
 *   // -> "Arguments 1; 0; 2"
 * }}}
 *
 * {{{
 *   Seed.String.Formatter.fmt("{} is my name.", "Domo");
 *   // -> "Domo is my name."
 * }}}
 *
 * {{{
 *   Seed.String.Formatter.fmt("Hello, {name}!", { name: "world" });
 *   // -> "Hello, world!"
 * }}}
 *
 * {{{
 *   Seed.String.Formatter.fmt("{lang} uses the {{variable}} format too!", {
 *      lang: "Python", variable: "(not used)"
 *   });
 *   // -> "Python uses the {{variable}} format too!"
 * }}}
 *
 * {{{
 *   Seed.String.Formatter.fmt("Today is {:A}.", new Date());
 * }}}
 *
 * {{{
 *   Seed.String.Formatter.fmt("Which one comes first? -> {:-^{}}", 3, 4);
 *   // -> "Which one comes first? -> -4-"
 * }}}
 */
/*globals Seed _G */

Seed.String.Formatter = {

  SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/,

  /**
   * Format a template string with provided arguments.
   *
   * @param {String} template The template string to format the arguments with.
   * @param {...} args A variable length of arguments to format the template with.
   */
  fmt: function (template) {
    var args = Array.from(arguments).slice(1),
        prev = '',
        buffer = '',
        result, idx, len = template.length, ch;

    for (idx = 0; idx < len; idx += 1) {
      ch = template[idx];

      if (prev === '}') {
        if (ch !== '}') {
          throw new Error("Unmatched closing brace.");
        } else {
          buffer += '}';
          prev = '';
          continue;
        }
      }

      if (ch === '{') {
        result = this.parseField(template.slice(idx + 1), args);
        buffer += result[1];
        idx += result[0];
      } else if (ch !== '}') {
        buffer += ch;
      }
      prev = ch;
    }
    return buffer;
  },

  parseField: function (template, args) {
    var fieldspec = '', result = null, idx = 0, ch, len = template.length;

    for (; idx < len; idx += 1) {
      ch = template[idx];
      if (ch === '{') {
        if (fieldspec.length === 0) {
          return [1, '{'];
        }

        result = this.parseField(template.slice(idx + 1), args);
        if (!result[0]) {
          return [idx, '{'];
        } else {
          idx += result[0];
          fieldspec += result[1];
        }
      } else if (ch === '}') {
        return [idx + 1, this.formatField(fieldspec, args)];
      } else {
        fieldspec += ch;
      }
    }
    return [template.length, fieldspec];
  },

  formatField: function (value, args) {
    var iSpec = value.indexOf(':'),
        spec;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    if (value !== '') {
      value = _G.getObjectFor(value, args);
    } else {
      value = args.shift();
    }

    if (!spec) {
      return value;
    }

    return value ? value.__fmt__(spec) : value;
  }
  
};
