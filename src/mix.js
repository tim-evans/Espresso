/*global mix */

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

      mix({
        gsub: function (find, replace) {
          if (/string/i.test(Object.prototype.toString.call(find))) {
            find = new RegExp(find, 'g');
          }
          return this.replace(find, replace);
        }
      }).into(String.prototype);

      var song = "I swiped your cat / And I stole your cathodes"
      alert(song.gsub('cat', 'banjo'));

      alert(song.gsub(/\bcat\b/, 'banjo'));

  Using `mix`, it's possible to create whatever types
  of objects you want, without polluting it's namespace.
  Espresso uses `mix` internally as a shim for ECMAScript 5
  compatability and creating the base objects
  {@link Espresso.Template} and {@link Espresso.Class}.

  @param {...} mixins Objects to mixin to the template provided on into.
  @returns {Object} An object with "into" field, call into with the template
                    to apply the mixins on. That will return the template
                    with the mixins on it.
 */
mix = function () {
  var mixins = arguments,
      i = 0, len = mixins ? mixins.length : 0;

  return {
    into: function (template) {
      var mixin, key, value,
          _, decorator;

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          _ = value && value._;
          if (value instanceof Function) {
            for (decorator in _) {
              if (_.hasOwnProperty(decorator)) {
                value = _[decorator](template, value, key);
              }
            }
          }

          template[key] = value;
        }

        // Take care of IE clobbering toString and valueOf
        if (mixin && mixin.toString !== Object.prototype.toString) {
          template.toString = mixin.toString;
        } else if (mixin && mixin.valueOf !== Object.prototype.valueOf) {
          template.valueOf = mixin.valueOf;
        }
      }
      return template;
    }
  };
};
