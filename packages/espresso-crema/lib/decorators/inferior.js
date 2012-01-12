require('espresso-crema/core');

var metaPath = Espresso.metaPath,
    isCallable = Espresso.isCallable;

/** @ignore */
function inferior(template, value, key) {
  var original = template[key];
  return (original == null ||
          metaPath(original, ['decorators', 'inferior'])) ? value : original;
};

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
Espresso.inferior = function (target, condition) {
  if (arguments.length === 2 ?
      (isCallable(condition) ? condition() : condition) : true) {
    metaPath(target, ['decorators', 'inferior'], inferior);
  }
  return target;
};
