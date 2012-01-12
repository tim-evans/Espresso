var inferior = Espresso.inferior,
    toString = Object.prototype.toString,
    T_NUMBER = '[object Number]';

mix({
  isFinite: inferior(function (value) {
    return toString.call(value) === T_NUMBER &&
           isFinite(value);
  }),

  isNaN: inferior(function (value) {
    return toString.call(value) === T_NUMBER &&
           isNaN(value);
  }),

  isInteger: inferior(function (value) {
    return toString.call(value) === T_NUMBER &&
           isFinite(value) &&
           value > -9007199254740992 && value < 9007199254740992 &&
           floor(value) === value;
  }),

  toInteger: inferior(function (value) {
    var n = +value;
    return isNaN(n)
           ? +0
             : n === 0 || !isFinite(n)
           ? n
           : (n < 0 ? -1 : 1) * Math.floor(Math.abs(n));
  })

}).into(Number);
