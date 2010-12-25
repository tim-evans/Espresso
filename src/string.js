/*globals mix Espresso */

/**
 * @name String
 * @namespace
 * Provides
 * @extends Espresso.Enumerable
 */
mix(Espresso.Enumerable, /** @scope String.prototype */{

  /**
   * Iterates over every character in a string.
   * Required by {@link Espresso.Enumerable}.
   *
   * @param {Function} callback The callback to call for each element.
   * @param {Object} that The Object to use as this when executing the callback.
   *
   * @returns {void}
   * @example
   *   "boom".forEach(alert);
   *   // -> 'b'
   *   // -> 'o'
   *   // -> 'o'
   *   // -> 'm'
   */
  forEach: function (lambda, that) {
    var i = 0, len = this.length;

    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }
    for (; i < len; i += 1) {
      lambda.call(that, this.charAt(i), i, this);
    }
  },

  /**
   * Returns the character at the given index.
   * Provides a more unified interface for dealing with indexing,
   * and is more cross-browser than [].
   *
   * @param {Number} idx The index of the string to get.
   * @returns {String} The character at index idx.
   */
  get: function (idx) {
    return this.charAt(idx);
  },

  /**
   * Capitalize a string.
   *
   * @returns {String} The string, capitalized.
   * @example
   *   ['toast', 'cheese', 'wine'].forEach(function (food) {
   *     alert(food.capitalize());
   *   });
   *   // -> "Toast"
   *   // -> "Cheese"
   *   // -> "Wine"
   */
  capitalize: function () {
    return this.get(0).toUpperCase() + this.slice(1);
  },

  /**
   * Camelize a string.
   *
   * @function
   * @returns {String} The string, camelized.
   * @example
   */
  camelize: (function () {
    var camelizer = /([\2\-+_\s]+)(.)/g;
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
   * Returns the string repeated the specified number of times.
   *
   * @param {Number} n The number of times to repeat this string.
   * @param {String} [separator] The separator to put between each iteration of the string.
   * @returns {String} The string repeated n times.
   * @example
   *   alert("bacon".times(5));
   *   // -> "baconbaconbaconbacon"
   *
   * @example
   *   alert("crunchy".times(2, " bacon is "));
   *   // -> "crunchy bacon is crunchy"
   */
  times: function (n, sep) {
    sep = sep || '';
    return n < 1 ? '': (new Array(n)).join(this + sep) + this;
  },

  /**
   * Trim leading and trailing whitespace.
   * @function
   * @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
   */
  trim: (function () {
    var left = /^\s\s*/, right = /\s\s*$/;
    return function () {
      return this.replace(left, '').replace(right, '');
    };
  }()).inferior(),

  /**
   * @function
   */
  unescapeHTML: (function () {
    // The entity table. It maps entity names to characters.
    var entity = {
      quot: '"',
      lt:   '<',
      gt:   '>',
      amp:  '&',
      apos: "'"
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
  }()).inferior(),

  /**
   * @function
   */
  escapeHTML: (function () {
    var character = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    }, re = /[<>&"']/g;
    return function () {
      return this.replace(re, function (c) {
        return character[c];
      });
    };
  }()).inferior(),

  /**
   * Returns true if the string is contained
   * inside of the parent string.
   *
   * Overrides the Enumerable contains to be something
   * more intuitive.
   *
   * @returns {Boolean} true if contained in the other string.
   * @example
   *   alert('restraurant'.contains('aura'));
   *   // -> true
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
   * <p>Format formats a string in the vein of Python's format,
   * Ruby #{templates}, and .NET String.Format.</p>
   *
   * <p>To write { or } in your Strings, just double them, and
   * you'll end up with a single one.</p>
   *
   * <p>If you have more than one argument, then you can reference
   * by the argument number (which is optional on a single argument).</p>
   *
   * <p>If you want to tie into this, and want to specify your own
   * format specifier, override __fmt__ on your object, and it will
   * pass you in the specifier (after the colon). You return the
   * string it should look like, and that's it!</p>
   *
   * <p>For an example of an formatting extension, look at the Date mix.
   * It implements the Ruby/Python formatting specification for Dates.</p>
   *
   * @returns {String} The formatted string.
   * @example
   *   alert("{0} + {0} = {1}".fmt(1, 2));
   *   // -> "1 + 1 = 2"
   *
   * @example
   *   var kitty = Espresso.Template.extend({
   *     name: "Mister Mittens",
   *     weapons: ["lazzors", "shuriken", "rainbows"],
   *
   *     fight: function (whom) {
   *       return "fightin' the {} with his {}.".fmt(
   *         whom, this.weapons[Math.rand(this.weapons.length)]);
   *     }
   *   });
   *
   *   alert("{0.name} is {1}".fmt(kitty, kitty.fight('zombies')));
   *   // -> "Mister Mittens is fightin' the zombies with ..."
   *
   * @example
   *   alert("I love {pi:.2}".fmt({ pi: 22 / 7 }));
   *   // -> "I love 3.14"
   *
   * @example
   *   alert("The {confection.type} is {confection.descriptor}.".fmt({
   *     confection: {
   *       type: 'cake',
   *       descriptor: 'a lie'
   *     }
   *   }));
   *   // -> "The cake is a lie."
   *
   * @example
   *   alert(":-{{".fmt());  // Double {{ or }} to escape it.
   *   // -> ":-{"
   */
  fmt: function () {
    var args = Array.from(arguments);
    args.unshift(this.toString());
    return Espresso.Formatter.fmt.apply(Espresso.Formatter, args);
  },

  /**
   * Format a string according to a format specifier.
   * This is a function called by Formatter, 
   * A valid specifier can have:
   * [[fill]align][minimumwidth]
   */
  __fmt__: function (spec) {
    var match = spec.match(Espresso.Formatter.SPECIFIER),
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
    case '<':
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

  toJSON: function (key) {
    return this.valueOf();
  }.inferior()

}).into(String.prototype);
