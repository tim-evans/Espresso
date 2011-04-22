/*global mix Espresso */

/** @function
  @desc
  Mix in functionality to a pre-existing object.

  At the base level, `mix` will add the properties
  given on `mix` to the object passed in on `into`.

  Function decorators are told to alter the function
  on mixin time, rather than at decoration time.
  Function decorators do things like subscribe to
  events, tell `mix` to ignore it, ask to be sent
  the super class from the base object, and so on.

  Using the decorator interface to inject your own
  library's custom work in is fairly simple. The
  guidelines are that decorators **should** propagate
  through inheritance and mixins. Decorators should
  also not interfere with other decorator's behaviour.

  If you would like to mixin functionality to
  preexisting objects, use `mix` to do so, using the
  Object as the second parameter, like so:

      // Simple screenplay reader.
      var screenplay = {
        dialogue: function (speaker, dialogue) {
          alert("{}: {}".format(speaker, dialogue));
        },

        scene: function () {
          var args = Espresso.A(arguments);
          args.forEach(function (line) {
            this.dialogue.apply(this, line);
          }, this);
        }
      };

      // Add the Spanish Inquisition.
      mix({
        dialogue: function (original, speaker, dialogue) {
          original(speaker, dialogue);
          if (dialogue.indexOf("Spanish Inquisition") !== -1) {
            original("Cardinal Ximinez",
                     "Nobody Expects the Spanish Inquisition!");
          }
        }.refine()
      }).into(screenplay);

      screenplay.scene(
        ["Chapman",   "Trouble at the mill."],
        ["Cleveland", "Oh no- what kind of trouble?"],
        ["Chapman",   "One on't cross beams gone owt askew on treadle."],
        ["Cleveland", "Pardon?"],
        ["Chapman",   "One on't cross beams gone owt askew on treadle."],
        ["Cleveland", "I don't understand what you're saying."],
        ["Chapman",   "One of the cross beams gone out askew on the treadle."],
        ["Cleveland", "Well, what on earth does that mean?"],
        ["Chapman",   "I don't know- Mr. Wentworth just told me to come in here " +
                      "and say that there was trouble at the mill, that's all- " +
                      "I didn't expect a kind of Spanish Inquisition!"]
      );

  Using `mix`, it's possible to create whatever types
  of objects you want, without polluting it's namespace.
  Espresso uses `mix` internally as a shim for ECMAScript 5
  compatability and creating the core of your library.

  @param {...} mixins Objects to mixin to the target provided on into.
  @returns {Object} An object with `into` field, call into with the target
                    to apply the mixins on. That will return the target
                    with the mixins on it.
 */
mix = function () {
  var mixins = arguments,
      i = 0, len = mixins ? mixins.length : 0;

  return {
    into: function (target) {
      var mixin, key, value,
          _, decorator;

      if (!Espresso.hasValue(target)) {
        throw new TypeError("Cannot mix into null or undefined values.");
      }

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          _ = value && value._;
          if (Espresso.isCallable(value) && _) {
            for (decorator in _) {
              if (_.hasOwnProperty(decorator)) {
                value = _[decorator](target, value, key);
              }
            }
          }

          target[key] = value;
        }

        // Take care of IE clobbering toString and valueOf
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
Espresso.global.mix = mix;
