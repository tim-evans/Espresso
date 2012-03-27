/*globals mix Espresso */
require('espresso-shim/number');
var inferior = Espresso.inferior,
    toInteger = Number.toInteger;

mix(/** @scope String.prototype */{

  /** @function
    @desc
    Returns the string repeated the specified number of times.

    @param {Number} n The number of times to repeat this string.
    @returns {String} The string repeated n times.
    @example
      alert("Stop hittin' yourself. ".repeat(50));
   */
  repeat: inferior(function (n) {
    n = toInteger(n);
    var result = '',
        str = this + '';
    while (--n >= 0) {
      result += str;
    }
    return result;
  }),

  /** @function
    @desc
    Trim leading and trailing whitespace.

    @returns {String} The string with leading and trailing whitespace removed.
    @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
    @see <a href="http://jsperf.com/mega-trim-test">Mega Trim Test</a>
   */
  trim: inferior(function () {
   var s = this.match(/\S+(?:\s+\S+)*/);
   return s ? s[0] : '';
  }),

  /** @function
    @desc
    @param {String} s The prefix to test against.
    @returns {Boolean} `true` when the string starts with the given prefix.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
    @see https://jsperf.com/js-startswith/6
   */
  startsWith: inferior(function (s) {
    return this.slice(0, s.length) === s;
  }),

  /** @function
    @desc
    @param {String} s The prefix to test against.
    @returns {Boolean} `true` when the string ends with the given prefix.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  endsWith: inferior(function (s) {
    var t = String(s),
        idx = this.lastIndexOf(t);
    return idx >= 0 && idx === this.length - t.length;
  }),


  /** @function
    @desc
    @param {String} s The string to test whether it's a substring of the other.
    @returns {Boolean} `true` when the string contains the other string.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  contains: inferior(function (s) {
    return this.indexOf(s) !== -1;
  }),

  /** @function
    @desc
    @returns {String[]} The string as an Array of characters.
    @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  toArray: inferior(function () {
    return this.split('');
  })

}).into(String.prototype);
