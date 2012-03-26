require('espresso-crema/core');

var metaPath = Espresso.metaPath;

/**
  Tests to see whether the decorator with the given
  name has been applied to the target.

  @param {Object} target The target to test.
  @param {String} name The name of the decorator to test
  @returns {Boolean} Whether the decorator with the given
    name has been applied to the target.
 */
Espresso.hasDecorator = function (target, name) {
  return metaPath(target, ['decorators', name]) ||
         metaPath(target, ['init', name]);  
};

/** @namespace
  The decorator specification is as follows:

  - `name`        : the unique name of the decorator
  - `precondition`: a function that returns a `Boolean`
                    that indicates whether this decoration
                    should be applied to the target.
                    The `precondition` function will get
                    passed the same arguments as the decorator
                    function. If the precondition fails,
                    then the decorator acts like a no-op.
  - `preprocess`  : a function that will be called after
                    the decorator has been setup.
                    The `preprocess` function will get
                    passed the same arguments as the decorator
                    function. Any return value will be returned
                    by the decorator. For most decorators,
                    you want to return the target back.
  - `process`     : called at mixin time. The process
                    function will get passed `target`
                    (the target object being mixed into),
                    `value` (the object being decorated),
                    and `key` (the key of the value).
                    The return value will be set as the new
                    value in the mixed in object.
  - `init`        : called when the object is initialized
                    via `Espresso.init`. The `init` function
                    will get passed the same arguments as
                    `process`, but will *not* alter the output
                    of the value. It is intended for setup tasks.
 */
Espresso.Decorator = {

  /**
    A registry of all decorators that have been
    registered for use by Espresso.

    Having this hash avoids naming conflicts
    between decorators.

    @type Object
    @default {}
   */
  registry: {},

  /**
    Creates and registers a new decorator according to a specification.
    @param {Object} spec The decorator specification.
    @returns {Function} A function that will properly decorate the first
      parameter passed into it.
   */
  create: function (spec) {
    if (!spec.name) {
      throw new Error("Decorators are required to have a name attribute");
    }
    if (this.registry[spec.name]) {
      throw new Error(spec.name + " is already a registered decoration");
    }

    this.registry[spec.name] = spec;

    return function (target) {
      if (!spec.precondition || spec.precondition.apply(null, arguments)) {
        if (spec.process) {
          metaPath(target, ['decorators', spec.name], spec.process);
        }

        if (spec.init) {
          metaPath(target, ['init', spec.name], spec.init);
        }

        if (spec.preprocess) {
          return spec.preprocess.apply(null, arguments);
        }
      }

      return target;
    };
  }
};
