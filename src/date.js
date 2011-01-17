/*globals mix */
mix(/** @lends Date# */{

  useUTC: false,

  get: (function () {
    var validSlots = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
    return function (key) {
      var prefix = "get";
      key = key.capitalize();
      if (this.useUTC && validSlots.indexOf(key) !== -1) {
        prefix += "UTC";
      }
      return this[prefix + key]();
    };
  }()),

  set: (function () {
    var validSlots = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
    return function (key, value) {
      var prefix = "set";
      key = key.capitalize();
      if (this.useUTC && validSlots.indexOf(key) !== -1) {
        prefix += "UTC";
      }
      return this[prefix + key](value);
    };
  }()),

  /**
    Shim for `toISOString`.

    @returns {String} The ISO 6081 formatted UTC date.
   */
  toISOString: function () {
    var prev = this.useUTC, result;
    this.useUTC = true;
    result = "{:Y-m-dTH:M:S.f}Z".fmt(this);
    this.useUTC = prev;
    return result;
  }.inferior(),

  /**
    Shim for `toJSON` for Date.

    @param {Object} [key] Optional key argument.
    @returns {String} The date as an ISO Formatted string.
    @see 15.9.5.44 Date.prototype.toJSON
   */
  toJSON: function (key) {
    return isFinite(this.valueOf()) ? this.toISOString(): null;
  }.inferior(),

  /** @function
    @desc
    Date Formatting support.

    The following flags are acceptable in a format string:

     - `a` The abbreviated weekday name ("Sun")
     - `A` The full weekday name ("Sunday")
     - `b` The abbreviated month name ("Jan")
     - `B` The full month name ("January")
     - `c` The preferred local date and time representation
     - `d` Day of the month (01..31)
     - `H` Hour of the day, 24-hour clock (00..23)
     - `I` Hour of the day, 12-hour clock (01..12)
     - `j` Day of the year (001..366)
     - `m` Month of the year (01..12)
     - `M` Minute of the hour (00..59)
     - `p` Meridian indicator ("AM" or "PM")
     - `S` Second of the minute (00..60)
     - `U` Week number of the current year, starting with the first Sunday as the first day of the first week (00..53)
     - `W` Week number of the current year, starting with the first Monday as the first day of the first week (00..53)
     - `w` Day of the week (Sunday is 0, 0..6)
     - `x` Preferred representation for the date alone, no time
     - `X` Preferred representation for the time alone, no date
     - `y` Year without a century (00..99)
     - `Y` Year with century
     - `Z` Timezone name or abbreviation (EST)

    For example:

        alert("Today is {:A, B d, Y}.".fmt(new Date()));

        alert("The time is: {:c}.".fmt(new Date()));

    @param {String} spec The specifier to transform the date to a formatted string.
    @returns {String} The Date transformed into a string as specified.
   */
  __fmt__: (function () {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    return function (spec) {
      var result = [], i = 0;

      for (; i < spec.length; i += 1) {
        switch (spec[i]) {
        case 'a':
          result[result.length] = days[this.get('day')].slice(0, 3);
          break;
        case 'A':
          result[result.length] = days[this.get('day')];
          break;
        case 'b':
          result[result.length] = months[this.get('month')].slice(0, 3);
          break;
        case 'B':
          result[result.length] = months[this.get('month')];
          break;
        case 'c':
          result[result.length] = "{0:a b} {1:2} {0:H:M:S Y}".fmt(this, this.get('date'));
          break;
        case 'd':
          result[result.length] = "{:02}".fmt(this.get('date'));
          break;
        case 'e':
          result[result.length] = "{: 2}".fmt(this.get('date'));
          break;
        case 'f':
          result[result.length] = "{:03}".fmt(this.get('milliseconds'));
          break;
        case 'H':
          result[result.length] = "{:02}".fmt(this.get('hours'));
          break;
        case 'I':
          result[result.length] = "{:02}".fmt(this.get('hours') % 12);
          break;
        case 'j':
          result[result.length] = "{:03}".fmt(Math.ceil((this - new Date(this.get('fullYear'), 0, 1)) / 86400000));
          break;
        case 'm':
          result[result.length] = "{:02}".fmt(this.get('month') + 1);
          break;
        case 'M':
          result[result.length] = "{:02}".fmt(this.get('minutes'));
          break;
        case 'p':
          result[result.length] = this.get('hours') > 11 ? "PM" : "AM";
          break;
        case 'S':
          result[result.length] = "{:02}".fmt(this.get('seconds'));
          break;
        case 'U':
          // Monday as the first day of the week
          var day = ((this.get('day') + 6) % 7) + 1;
          result[result.length] = "{:02}".fmt(
            Math.ceil((((this - new Date(this.get('fullYear'), 0, 1)) / 86400000) + day) / 7) - 1);
          break;
        case 'w':
          result[result.length] = this.get('day');
          break;
        case 'W':
          result[result.length] = "{:02}".fmt(
            Math.ceil((((this - new Date(this.get('fullYear'), 0, 1)) / 86400000) + this.get('day') + 1) / 7) - 1);
          break;
        case 'x':
          result[result.length] = "{:m/d/y}".fmt(this);
          break;
        case 'X':
          result[result.length] = this.toLocaleTimeString();
          break;
        case 'y':
          result[result.length] = "{:02}".fmt(this.getYear() % 100);
          break;
        case 'Y':
          result[result.length] = this.get('fullYear');
          break;
        case 'Z':
          result[result.length] = this.get('timezoneOffset');
          break;
        default:
          result[result.length] = spec[i];
        }
      }
      return result.join('');
    };
  }())
}).into(Date.prototype);

mix({

  /**
    Shim for `now`.

    @returns {Number} The current time.
   */
  now: function () {
    return new Date().getTime();
  }.inferior()

}).into(Date);
