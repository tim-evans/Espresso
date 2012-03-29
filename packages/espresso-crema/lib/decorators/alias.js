require('espresso-crema/decorator');

var meta = Espresso.meta,
    metaPath = Espresso.metaPath,
    slice = Array.prototype.slice;

/**
  Provides a mechanism to alias an object with
  using other names.

  Any arguments passed in after the target will
  be used as aliases for the target. Each of these
  aliases will be references to the original, meaning
  that all of them will be indistinguishable and if
  one of them is altered in place, then all will be.

  @param {Object} target The target to apply this decorator to.
  @param {...} aliases The aliases this object has.
  @returns {Object} The reciever.
 */
Espresso.alias = Espresso.Decorator.create({

  name: 'alias',

  preprocess: function (target) {
    var m = meta(target, true);
    m.aliases = (m.aliases || []).concat(slice.call(arguments, 1));
    return target;
  },

  process: function (target, value, key) {
    var aliases = metaPath(value, ['aliases']),
        len, mixin;

    if (aliases) {
      len = aliases.length;

      delete meta(value).aliases; // Remove aliases to prevent recursion
      while (len--) {
        mixin = {};
        mixin[aliases[len]] = value;
        mix(mixin).into(target);
      }
    }
    return value;
  }
});
