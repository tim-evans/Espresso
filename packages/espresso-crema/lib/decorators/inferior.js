require('espresso-crema/decorator');

var metaPath = Espresso.metaPath,
    isCallable = Espresso.isCallable;

/**
  If the attribute being mixed in exists on the
  Object being mixed in, the object marked as
  inferior will **not** be mixed in. If the base
  object is inferior, it will be overriden.

  @param {Object} target The target to apply the decorator to.
  @param {Object|Function} [condition] If it returns `true`,
    the function is inferior. Otherwise, it isn't.
  @returns {Function} The reciever.
 */
Espresso.inferior = Espresso.Decorator.create({

  name: 'inferior',

  precondition: function (target, condition) {
    return (arguments.length === 2 ?
            (isCallable(condition) ? condition() : condition) : true);
  },

  process: function (template, value, key) {
    var original = template[key];
    return (original == null || Espresso.hasDecorator(original, 'inferior'))
            ? value
            : original;
  }

});
