mix(/** @scope Espresso */{

  /**
    Provides a mechanism to alias a function with
    other names on the object.

    Any arguments passed in will be used as aliases
    for the function. Each of these aliases will be
    references to the original, meaning that all of
    them will be indistinguishable and if one is
    altered in place, then all will be.

    @param {Object} target The target to apply this decorator to.
    @param {...} aliases The aliases this function has.
    @returns {Function} The reciever.
   */
  alias: function (target) {
    target._ = target._ || {};

    var aliases = Espresso.A(arguments).slice(1),
        idx = aliases.length, mixin;

    /** @ignore */
    target._.alias = function (template, value, key) {
      delete value._.alias; // Remove this to prevent recursion.
      while (idx--) {
        mixin = {};
        mixin[aliases[idx]] = value;
        mix(mixin).into(template);
      }
      return value;
    };

    return target;
  }

}).into(Espresso);
