/*globals mix Seed */

mix(/** @lends Number# */{
  json: function () {
    return isFinite(this) ? String(this) : "null";
  },

  __fmt__: function (spec) {
    // Don't want Infinity, -Infinity and NaN in here!
    if (!isFinite(this)) {
      return this;
    }

    var match = spec.match(Seed.String.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2],
        sign = match[3] || '-',
        base = !!match[4],
        precision = match[7],
        type = match[8], value = this;

    if (align) {
      align = align.slice(-1);
    }

    if (!fill && !!match[5]) {
      fill = '0';
      spec = '0' + spec;
      if (!align) {
        align = '=';
        spec = spec[0] + '=' + spec.slice(1);
      }
    }

    if (precision) {
      precision = precision.slice(1);
    }

    switch (sign) {
    case '+':
      sign = (value >= 0) ? '+': '-';
      break;
    case '-':
      sign = (value >= 0) ? '': '-';
      break;
    case ' ':
      sign = (value >= 0) ? ' ': '-';
      break;
    default:
      sign = "";
    }

    if (precision) {
      value = +value.toFixed(precision);
    }

    value = Math.abs(value);

    switch (type) {
    case 'b':
      base = base ? '0b': '';
      value = base + value.toString(2);
      break;
    case 'c':
      value = String.fromCharCode(value);
      break;
    case 'o':
      base = base ? '0o': '';
      value = base + value.toString(8);
      break;
    case 'x':
      base = base ? '0x': '';
      value = base + value.toString(16).toLowerCase();
      break;
    case 'X':
      base = base ? '0x': '';
      value = base + value.toString(16).toUpperCase();
      break;
    case 'e':
      value = value.toExponential().toLowerCase();
      break;
    case 'E':
      value = value.toExponential().toUpperCase();
      break;
    case 'f':
      value = value.toFixed().toLowerCase();
      break;
    case 'F':
      value = value.toFixed().toUpperCase();
      break;
    case 'G':
      value = String(value).toUpperCase();
      break;
    case '%':
      value = (value.toFixed() * 100) + '%';
      break;
    case 'n':
      value = value.toLocaleString();
      break;
    case 'g':
    case 'd':
    case undefined:
      value = String(value).toLowerCase();
      break;
    default:
      throw new Error('Unrecognized format type: "{0}"'.fmt(spec.type));
    }

    if (align !== '=') {
      value = sign + value;      
    }

    value = String(value).__fmt__(spec);

    if (align === '=') {
      value = sign + value;
    }

    return value;
  }

}).into(Number.prototype);
