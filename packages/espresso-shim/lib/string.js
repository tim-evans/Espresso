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

  startsWith: inferior(function (s) {
    return this.indexOf(s) === 0;
  }),

  endsWith: inferior(function (s) {
    var t = String(s),
        idx = this.lastIndexOf(t);
    return idx >= 0 && idx === this.length - t.length;
  }),

  contains: inferior(function (s) {
    return this.indexOf(s) !== -1;
  }),

  toArray: inferior(function () {
    return this.split('');
  })

}).into(String.prototype);
