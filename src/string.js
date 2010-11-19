/*globals mix Seed */

/**
 * @class Seed.String
 * Add-ons to Strings to make them easier to deal with.
 * @extends Seed.Enumerable
 */
Seed.String = mix(Seed.Enumerable, /** @lends Seed.String# */{

  /**
   * Iterator for Strings.
   * {{{
   *   "boom".forEach(alert);
   *   // -> 'b'
   *   // -> 'o'
   *   // -> 'o'
   *   // -> 'm'
   * }}}
   * @param {Function} callback The callback to call for each element.
   * @param {Object} self The Object to use as this when executing the callback.
   * @returns {void}
   */
  forEach: function (lambda, self) {
    var i = 0, len = this.length;
    for (; i < len; i += 1) {
      lambda.apply(self, [this.charAt(i), i, this]);
    }
  }.inferior(),

  /**
   * Capitalize a string.
   *
   * {{{
   *   alert("hydrogen".capitalize());
   *   // -> "Hydrogen"
   * }}}
   * @returns {String} The string, capitalized.
   */
  capitalize: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },

  /**
   * Camelize a string.
   *
   * {{{
   *   alert("domo arigatou".camelize());
   *   // -> domoArigatou
   * }}}
   * @function
   * @returns {String} The string, camelized.
   */
  camelize: (function () {
    var camelizer = /([\2-+_\s]+)(.)/g;
    return function () {
      return this.replace(camelizer, function (junk, seperator, chr) {
        return chr.toUpperCase();
      });
    };
  }()),

  /**
   * @function
   */
  dasherize: (function () {
    var decamelizer = /([a-z])([A-Z])/g,
        dasherizer = /([_+\s]+)/g;
    return function () {
      var res = this.replace(decamelizer, function (junk, a, b) {
        return a + '-' + b.toLowerCase();
      });
      return res.toLowerCase().replace(dasherizer, '-');
    };
  }()),

  /**
   * Returns the string repeated the specified
   * number of times.
   *
   * {{{
   *   alert("bacon".times(5));
   *   // -> "baconbaconbaconbaconbacon"
   * }}}
   *
   * @param {Number} n The number of times to repeat this string.
   * @returns The string repeated n times.
   */
  times: function (n) {
    return (new Array(n + 1)).join(this);
  },

  /**
   * Trim leading and trailing whitespace.
   * "Faster JavaScript Trim":http://blog.stevenlevithan.com/archives/faster-trim-javascript
   */
  trim: function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }.inferior(),

  unescape: (function () {
    // The entity table. It maps entity names to characters.
    var entity = {
      quot: '"',
      lt:   '<',
      gt:   '>',
      amp:  '&'
    }, re = /&([^&;]+);/g;

    // Replaces entity characters with their
    // more commonplace cousins:
    //  eg. &quot; => "
    return function () {
      return this.replace(re,
        function (a, b) {
          var r = entity[b];
          return typeof r === 'string' ? r : a;
        }
      );
    };
  }()),

  escape: (function () {
    var character = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot'
    }, re = /[<>&"]/g;
    return function () {
      return this.replace(re, function (c) {
        return character[c];
      });
    };
  }()),

  /**
   * Returns true if the string is contained
   * inside of the parent string.
   *
   * Overrides the Enumerable contains to be something
   * more intuitive.
   * {{{
   *   alert("seedling".contains('seed'));
   *   // -> 'true'
   * }}}
   * @returns {Boolean} true if contained in the other string.
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
   * Format formats a string in the vein of Python's format,
   * Ruby fmt, and .NET String.Format.
   *
   * To write { or } in your Strings, just double them, and
   * you'll end up with a single one.
   *
   * If you have more than one argument, then you can reference
   * by the argument number (which is optional on a single argument).
   *
   * If you want to tie into this, and want to specify your own
   * format specifier, override __fmt__ on your object, and it will
   * pass you in the specifier (after the colon). You return the
   * string it should look like, and that's it!
   *
   * For an example of an formatting extension, look at the Date mix.
   * It implements the Ruby/Python formatting specification for Dates.
   *
   * {{{
   *   alert("Hello, {name}!".fmt({ name: 'Domo' }));
   *   // -> "Hello, Domo!"
   * }}}
   *
   * {{{
   *   alert("I love {pi:.2}".fmt({ pi: 22 / 7 }));
   *   // -> "I love 3.14"
   * }}}
   *
   * {{{
   *   alert("The {confection.type} is {confection.descriptor}.".fmt({
   *     confection: {
   *       type: 'cake',
   *       descriptor: 'a lie'
   *     }
   *   }));
   *   // -> "The cake is a lie."
   * }}}
   *
   * {{{
   *   alert(":-{{".fmt());  // Double {{ or }} to escape it.
   *   // -> ":-{"
   * }}}
   *
   * {{{
   *   alert("{0.name} likes {1.name}.".fmt({ name: "Domo" }, { name: "yakitori" }));
   *   // -> "Domo likes yakitori."
   * }}}
   *
   * {{{
   *   // BEWARE!! 
   *   alert("{:*<{}}".fmt(3, 4));
   *   // -> "**4"
   * }}}
   * @returns {String} A formatted string.
   */
  fmt: function () {
    var args = Array.from(arguments);
    args.unshift(this.toString());
    return Seed.String.Formatter.fmt.apply(Seed.String.Formatter, args);
  },

  /**
   * Format a string according to a format specifier.
   * This is a function called by Formatter, 
   * A valid specifier can have:
   * [[fill]align][minimumwidth]
   */
  __fmt__: function (spec) {
    var match = spec.match(Seed.String.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2] || ' ',
        minWidth = match[6] || 0, len, before, after;

    if (align) {
      align = align.slice(-1);
    }

    len = Math.max(minWidth, this.length);
    before = len - this.length;
    after = 0;

    switch (align) {
    case '>':
      after = before;
      before = 0;
      break;
    case '^':
      after = Math.ceil(before / 2);
      before = Math.floor(before / 2);
      break;
    }
    return fill.times(before) + this + fill.times(after);
  },

  json: function () {
    return '"' + this + '"';
  }

}).into({});

mix(Seed.String, /** @lends String.prototype */{}).into(String.prototype);
