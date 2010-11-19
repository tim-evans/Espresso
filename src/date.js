/*globals mix */

mix(/** @lends Date# */{

  get: function (key) {
    return this["get" + key.capitalize()]();
  },

  toLocaleTimeString: function () {
    return "{:H:M:S}".fmt(this);
  }.inferior(),

  toISOString: function () {
    return "{:Y-m-dTH:M:S.f}Z".fmt(new Date(this.get('time') +
                                            this.get('timezoneOffset') * 60 * 1000));
  }.inferior(),
 
  json: function () {
    return '"{0}"'.fmt(this.toISOString());
  },

  /**
   * Date Formatting support.
   * The following flags are acceptable in a format string:
   * Format meaning:
   * 
   * * a - The abbreviated weekday name ("Sun")
   * * A - The full weekday name ("Sunday")
   * * b - The abbreviated month name ("Jan")
   * * B - The full month name ("January")
   * * c - The preferred local date and time representation
   * * d - Day of the month (01..31)
   * * H - Hour of the day, 24-hour clock (00..23)
   * * I - Hour of the day, 12-hour clock (01..12)
   * * j - Day of the year (001..366)
   * * m - Month of the year (01..12)
   * * M - Minute of the hour (00..59)
   * * p - Meridian indicator ("AM" or "PM")
   * * S - Second of the minute (00..60)
   * * U - Week number of the current year,
   *       starting with the first Sunday as the first
   *       day of the first week (00..53)
   * * W - Week number of the current year,
   *       starting with the first Monday as the first
   *       day of the first week (00..53)
   * * w - Day of the week (Sunday is 0, 0..6)
   * * x - Preferred representation for the date alone, no time
   * * X - Preferred representation for the time alone, no date
   * * y - Year without a century (00..99)
   * * Y - Year with century
   * * Z - Time zone name
   *
   * For example:
   * {{{
   *   alert("Today is {:A, B d, Y}.".fmt(new Date()));
   * }}}
   * {{{
   *   alert("The time is: {:c}.".fmt(new Date()));
   * }}}
   * @function
   */
  __fmt__: (function () {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    return function (template) {
      var result = '', i = 0;

      for (; i < template.length; i += 1) {
        switch (template[i]) {
        case 'a':
          result += days[this.get('day')].slice(0, 3);
          break;
        case 'A':
          result += days[this.get('day')];
          break;
        case 'b':
          result += months[this.get('month')].slice(0, 3);
          break;
        case 'B':
          result += months[this.get('month')];
          break;
        case 'c':
          result += "{:A, B H:M:S Y}".fmt(this);
          break;
        case 'd':
          result += "{:02}".fmt(this.get('date'));
          break;
        case 'f':
          result += "{:03}".fmt(this.get('milliseconds'));
          break;
        case 'H':
          result += "{:02}".fmt(this.get('hours'));
          break;
        case 'I':
          result += "{:02}".fmt(this.get('hours') % 12);
          break;
        case 'j':
          result += "{:03}".fmt(Math.ciel(this - new Date(this.get('fullYear'), 0, 1) / 86400000));
          break;
        case 'm':
          result += "{:02}".fmt(this.get('month') + 1);
          break;
        case 'M':
          result += "{:02}".fmt(this.get('minutes'));
          break;
        case 'p':
          result += this.get('hours') > 11 ? "PM" : "AM";
          break;
        case 'S':
          result += "{:02}".fmt(this.get('seconds'));
          break;
        case 'w':
          result += this.get('day');
          break;
        case 'x':
          result += "{:m/d/y}".fmt(this);
          break;
        case 'X':
          result += this.toLocaleTimeString();
          break;
        case 'y':
          result += "{:02}".fmt(this.getYear() % 100);
          break;
        case 'Y':
          result += this.get('fullYear');
          break;
        case 'Z':
          result += this.get('timezoneOffset');
          break;
        default:
          result += template[i];
        }
      }
      return result;
    };
  }())
}).into(Date.prototype);
