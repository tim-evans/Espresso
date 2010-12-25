/**
 * Mix in functionality to a pre-existing object.
 * This is the function that makes everything work- where all of the
 * function decorators are made into reality. To see examples of
 * the decorators working, visit the {@link Function} documentation.
 *
 * To create your own function decorator, add a unique function to
 * the underscore object on the function (this._ inside your decorator code).
 * This function will take three arguments: the template you're mixing into,
 * the current key being mixed in, and the value associated with that key.
 * You should return a new value for the key passed in.
 * For more details, take a look at the code for a pre-baked decorator like
 * {@link Function#around}.
 *
 * @param {...} mixins Objects to mixin to the template provided on into.
 * @returns {Object} An object with "into" field, call into with the template
 *                   to apply the mixins on. That will return the template
 *                   with the mixins on it.
 *
 * @example
 *   var k = mix({
 * 
 *   }).into({});
 */
var mix = function () {
  var mixins = arguments,
      i = 0, len = mixins ? mixins.length : 0;

  return {
    into: function (template) {
      var mixin, key, value,
          _, transform;

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          if (template[key] && value.isInferior) {
            continue;
          }

          _ = value && value._;
          if (value instanceof Function) {
            for (transform in _) {
              if (_.hasOwnProperty(transform)) {
                value = _[transform](template, value, key);
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
