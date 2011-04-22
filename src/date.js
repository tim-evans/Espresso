/*globals mix */
mix(/** @lends Date# */{

  /**
    Shim for `toISOString`.

    @returns {String} The ISO 6081 formatted UTC date.
   */
  toISOString: function () {
    return "{}-{}-{}T{}:{}:{}.{}Z".format(
      this.getUTCFullYear(),
      this.getUTCMonth(),
      this.getUTCDate(),
      this.getUTCHours(),
      this.getUTCMinutes(),
      this.getUTCSeconds(),
      this.getUTCMilliseconds()
    );
  }.inferior(),

  /** @function
    @desc
    Date Formatting support (for use with `format`).

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

    For example:

        alert("Today is {:A, B d, Y}.".format(new Date()));

        alert("The time is: {:c}.".format(new Date()));

    Note: all times used with `format` are **NOT** in UTC.

    @param {String} spec The specifier to transform the date to a formatted string.
    @returns {String} The Date transformed into a string as specified.
   */
  __format__: (function () {
    return function (spec) {
      var result = [], i = 0;

      for (; i < spec.length; i += 1) {
        switch (spec.charAt(i)) {
        case 'a':
          result[result.length] = Date.days[this.getDay()].slice(0, 3);
          break;
        case 'A':
          result[result.length] = Date.days[this.getDay()];
          break;
        case 'b':
          result[result.length] = Date.months[this.getMonth()].slice(0, 3);
          break;
        case 'B':
          result[result.length] = Date.months[this.getMonth()];
          break;
        case 'c':
          result[result.length] = "{0:a b} {1:2} {0:H:M:S Y}".format(this, this.getDate());
          break;
        case 'd':
          result[result.length] = "{:02}".format(this.getDate());
          break;
        case 'H':
          result[result.length] = "{:02}".format(this.getHours());
          break;
        case 'I':
          result[result.length] = "{:02}".format(this.getHours() % 12);
          break;
        case 'j':
          result[result.length] = "{:03}".format(Math.ceil((this - new Date(this.getFullYear(), 0, 1)) / 86400000));
          break;
        case 'm':
          result[result.length] = "{:02}".format(this.getMonth() + 1);
          break;
        case 'M':
          result[result.length] = "{:02}".format(this.getMinutes());
          break;
        case 'p':
          result[result.length] = this.getHours() > 11 ? "PM" : "AM";
          break;
        case 'S':
          result[result.length] = "{:02}".format(this.getSeconds());
          break;
        case 'U':
          // Monday as the first day of the week
          var day = ((this.getDay() + 6) % 7) + 1;
          result[result.length] = "{:02}".format(
            Math.ceil((((this - new Date(this.getFullYear(), 0, 1)) / 86400000) + day) / 7) - 1);
          break;
        case 'w':
          result[result.length] = this.getDay();
          break;
        case 'W':
          result[result.length] = "{:02}".format(
            Math.ceil((((this - new Date(this.getFullYear(), 0, 1)) / 86400000) + this.getDay() + 1) / 7) - 1);
          break;
        case 'x':
          result[result.length] = "{:m/d/y}".format(this);
          break;
        case 'X':
          result[result.length] = this.toLocaleTimeString();
          break;
        case 'y':
          result[result.length] = "{:02}".format(this.getYear() % 100);
          break;
        case 'Y':
          result[result.length] = this.getFullYear();
          break;
        default:
          result[result.length] = spec.charAt(i);
        }
      }
      return result.join('');
    };
  }())
}).into(Date.prototype);

mix(/** @lends Date */{

  /**
    Shim for `now`.

    @returns {Number} The current time.
   */
  now: function () {
    return new Date().getTime();
  }.inferior(),

  /**
    Strings for the days of the week.
    If you want to use a different locale,
    set the `days` string to reflect the locale's.

    @type String[]
   */
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  /**
    Strings for the months of the week.
    If you want to use a different locale,
    set the `months` string to reflect the locale's.

    @type String[]
   */
  months: ["January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December"]
}).into(Date);
