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
