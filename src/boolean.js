/*globals mix */

mix(/** @lends Boolean# */{

  /**
    Returns the data to be serialized into JSON.

    @returns {Boolean} The value of the object.
   */
  toJSON: function (key) {
    return this.valueOf();
  }.inferior()

}).into(Boolean.prototype);
