/*globals mix */

mix(/** @lends Boolean# */{

  /**
   * Converts a Boolean to valid JSON.
   * {{{
   *   alert(true.json());
   *   // -> "true"
   * }}}
   * @returns {String} The boolean as a JSON string
   */
  json: function () {
    return String(this);
  }

}).into(Boolean.prototype);
