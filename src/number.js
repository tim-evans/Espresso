/*globals mix Espresso */

mix(/** @lends Number# */{

  toJSON: function (key) {
    return this.valueOf();
  }.inferior(),

  __fmt__: function (spec) {
    // Don't want Infinity, -Infinity and NaN in here!
    if (!isFinite(this)) {
      return this;
    }

    var match = spec.match(Espresso.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2],
        sign = match[3] || '-',
        base = !!match[4],
        minWidth = match[6] || 0,
        precision = match[7],
        type = match[8], value = this;

    if (align) {
      align = align.slice(-1);
    }

    spec = (fill || '') + (align || '') + (minWidth || '');
    if (!fill && !!match[5]) {
      fill = '0';
      spec = '0' + align + minWidth;
      if (!align) {
        align = '=';
        spec = spec.get(0) + '=' + minWidth;
      }
    }

    if (precision) {
      precision = +precision.slice(1);
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

    if (precision && !isNaN(precision)) {
      // Opting to go with a more intuitive approach than Python...
      //  >>> "{.2}".format(math.pi)
      //  "3.1"
      // Which is waaay less intuitive than
      //  > "{.2}".fmt(Math.PI)
      //  "3.14"
      value = +value.toFixed(precision);
      precision++; // make floating point precision work like Python.
    } else {
      precision = null;
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
      // Follow Python's example (using 6 as the default)
      value = value.toPrecision(precision || 7).toLowerCase();
      break;
    case 'F':
      // Follow Python's example (using 6 as the default)
      value = value.toPrecision(precision || 7).toUpperCase();
      break;
    case 'G':
      value = String(value).toUpperCase();
      break;
    case '%':
      value = (value.toPrecision(7) * 100) + '%';
      break;
    case 'n':
      value = value.toLocaleString();
      break;
    case 'g':
    case 'd':
    case '':
    case undefined:
      value = String(value).toLowerCase();
      break;
    default:
      throw new Error('Unrecognized format type: "{0}"'.fmt(type));
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
