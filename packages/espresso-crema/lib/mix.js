require('espresso-crema/core');

var metaPath = Espresso.metaPath,
    nonEnumerables = ['hasOwnProperty',
                      'valueOf',
                      'isPrototypeOf',
                      'propertyIsEnumerable',
                      'toLocaleString',
                      'toString'];

/** @function
  @desc

  `mix` provides a way to combine arbritrary objects together.

  The combination can be as simple as adding the properties on
  an object onto another:

      var Caffeinated = { isCaffeinated: true };
      var Coffee = mix({
        isDecaf: function () {
          return !!this.isCaffeinated;
        }
      }).into({});

      decaf = mix(Coffee).into({});
      decaf.isDecaf();
      // -> true

      caf = mix(Caffeinated, Coffee).into({});
      caf.isDecaf();
      // -> false

  Using `mix`, you can design an Object-Oriented `Class`
  object with while still inheriting all of the decorators
  that `mix` applies:

      Class = mix({
        extend: (function () {
          var initializing = false;

          return function () {
            initializing = true;
            var prototype = new this();
            initializing = false;

            mix.apply(null, Array.prototype.slice.apply(arguments))
               .into(prototype);

            function Class() {
              if (!initializing && Espresso.isCallable(this.init)) {
                this.init.apply(this, arguments);
              }
            }

            Class.prototype = prototype;
            Class.constructor = Class;
            Class.extend = arguments.callee;
            return Class;
          };
        }())
      }).into(function () {});

  @param {...} mixins Objects to mixin to the target provided on into.
  @returns {Object} An object with `into` field, call into with the target
                    to apply the mixins on. That will return the target
                    with the mixins on it.
 */
mix = function () {
  var mixins = arguments,
      length = mixins.length,
      e, nonEnumerable;

  return {
    into: function (target) {
      var mixin, key, value, decorators, decorator;

      if (target == null) {
        throw new TypeError('Cannot mix into null or undefined values.');
      }

      for (var i = 0; i < length; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          decorators = metaPath(value, ['decorators']);
          if (decorators != null) {
            for (decorator in decorators) {
              if (decorators.hasOwnProperty(decorator)) {
                value = decorators[decorator](target, value, key);
              }
            }
          }

          if (typeof value !== 'undefined') target[key] = value;
        }

        // Take care of IE ignoring non-enumerable properties
        if (mixin) {
          for (e = 0; e < nonEmumerables.length; e++) {
            nonEnumerable = nonEnumerables[e];
            if (mixin[nonEnumerable] !== Object.prototype[nonEnumerable]) {
              target[nonEnumerable] = mixin[nonEnumerable];
            }
          }
        }
      }
      return target;
    }
  };
};

// Apply it at the global scope
this.mix = mix;
