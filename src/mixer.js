/*global mix Espresso */

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

  `mix` takes this a bit furthur, allowing properties on the
  objects being mixed in to be altered at mixin time using
  Espresso's decorator API.

  The API hook is adding an underscore (`_`) hash with a
  function that can change the decorated object in place by
  returning the new desired value. For examples on how to use
  the decorator API, look at the `alias` and `inferior` for
  general purpose decorators and `refine` for a funnction
  decorator.

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

            mix.apply(null, Espresso.A(arguments)).into(prototype);

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
      i = 0, len = mixins.length;

  return {
    into: function (target) {
      var mixin, key, value, _, decorator;

      if (target == null) {
        throw new TypeError("Cannot mix into null or undefined values.");
      }

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          // Function annotation API
          _ = value && value._;
          if (Espresso.hasValue(_)) {
            for (decorator in _) {
              if (_.hasOwnProperty(decorator)) {
                value = _[decorator](target, value, key);
              }
            }
          }

          target[key] = value;
        }

        // Take care of IE clobbering `toString` and `valueOf`
        if (mixin && mixin.toString !== Object.prototype.toString) {
          target.toString = mixin.toString;
        } else if (mixin && mixin.valueOf !== Object.prototype.valueOf) {
          target.valueOf = mixin.valueOf;
        }
      }
      return target;
    }
  };
};

// Apply it at the global scope
Espresso.G.mix = mix;
