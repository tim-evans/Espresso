/**
  @module espresso
  @submodule espresso-crema
 */
require('espresso-crema/decorator');

var K = Espresso.K,
    slice = Array.prototype.slice,
    isCallable = Espresso.isCallable;

/**
  Refine allows for function-by-function refinements that
  reopens the function implementation without editing the
  original function's contents. With this, you can implement
  OO constructs like abstract base classes.

  Refinements to a function recieve a prepended argument to
  the argument list which is the original function that
  is being refined (if there isn't an original function that's
  being refined, a empty function will be provided for consistency).

  Calling the refined function should be done like so:

      Machiatto = mix({
        pull: Espresso.refine(function (original) {
          var espresso = original();
          return espresso + milk;
        })
      }).into(Espresso);

  Provide arguments as-is, omit arguments, or add arguments
  to the function. It'll be just like it's being called normally.

  NOTE: If you try to rebind the property using
        {@link Function#bind}, it will _not_ work.

  @method refine
  @for Espresso
  @param {Function} target The target to apply this decorator to.
  @returns {Function} The reciever.
 */
Espresso.refine = Espresso.Decorator.create({

  name: 'refine',

  precondition: function (target) {
    return isCallable(target);
  },

  process: function (template, value, key) {
    var base = template[key] || K;
    if (!isCallable(base)) {
      return value;
    }

    /** @ignore */
    var lambda = function () {
      var that = this;
      return value.apply(that, [function () {
        return base.apply(that, arguments);
      }].concat(slice.call(arguments)));
    };

    // Copy over function properties
    for (var k in value) {
      if (value.hasOwnProperty(k)) {
        lambda[k] = value[k];
      }
    }
    return lambda;
  }
});
