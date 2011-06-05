/*globals mix Espresso */

mix(/** @scope String.prototype */{

  /**
    Returns the string repeated the specified number of times.

    @param {Number} n The number of times to repeat this string.
    @param {String} [separator] The separator to put between each iteration of the string.
    @returns {String} The string repeated n times.
    @example
      alert("Stop hittin' yourself. ".repeat(50));
   */
  repeat: function (n, sep) {
    sep = sep || '';
    return n < 1 ? '': (new Array(n)).join(this + sep) + this;
  },

  /** @function
    @desc
    Trim leading and trailing whitespace.

    @returns {String} The string with leading and trailing whitespace removed.
    @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
   */
  trim: (function () {
    var left = /^\s\s*/, right = /\s\s*$/;
    return function () {
      return this.replace(left, '').replace(right, '');
    };
  }()).inferior(),

  /**
    Returns true if the string is contained
    inside of the parent string.

    @returns {Boolean} true if contained in the other string.
    @example
      alert('restraurant'.contains('aura'));
      // => true
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
    Format formats a string in the vein of Python's format,
    Ruby #{templates}, and .NET String.Format.

    To write { or } in your Strings, just double them, and
    you'll end up with a single one.

    If you have more than one argument, then you can reference
    by the argument number (which is optional on a single argument).

    If you want to tie into this, and want to specify your own
    format specifier, override toFormat on your object, and it will
    pass you in the specifier (after the colon). You return the
    string it should look like, and that's it!

    For an example of an formatting extension, look at the Date mix.
    It implements the Ruby/Python formatting specification for Dates.

    @returns {String} The formatted string.
    @example
      alert("b{0}{0}a".format('an'));
      // => "banana"

    @example
      alert("I love {pi:.{precision}}".format({ pi: 22 / 7, precision: 2 }));
      // => "I love 3.14"

    @example
      alert("The {thing.name} is {thing.desc}.".format({
        thing: {
          name: 'cake',
          desc: 'a lie'
        }
      }));
      // => "The cake is a lie."

    @example
      alert(":-{{".format());  // Double {{ or }} to escape it.
      // => ":-{"
   */
  format: function () {
    return Espresso.vformat(this, Espresso.A(arguments));
  },

  /**
    Formatter for `String`s.

    Don't call this function- It's here for `Espresso.format`
    to take care of buisiness for you.

    @param {String} spec The specifier string.
    @returns {String} The string formatted using the format specifier.
   */
  toFormat: function (spec) {
    var match = spec.match(Espresso.FORMAT_SPECIFIER),
        align = match[1],
        fill = match[2] || ' ',
        minWidth = match[6] || 0,
        maxWidth = match[7] || null, len, before, after, value,
        length = this.length;

    if (align) {
      align = align.slice(-1);
    }

    len = Math.max(minWidth, length);
    before = len - length;
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

    value = this;
    if (maxWidth != null) {
      maxWidth = +maxWidth.slice(1);
      value = isNaN(maxWidth) ? value : value.slice(0, maxWidth);
    }

    return fill.repeat(before) + value + fill.repeat(after);
  }.inferior()

}).into(String.prototype);
