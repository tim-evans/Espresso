/**
 * Mix in functionality to a pre-existing object.
 * This is the function that makes everything work- where all of the
 * function decorators are made into reality. To see examples of
 * the decorators working, visit the "Function":Function documentation.
 *
 * To create your own function decorator, add a unique function to
 * the underscore object on the function (this._ inside your decorator code).
 * This function will take three arguments: the template you're mixing into,
 * the current key being mixed in, and the value associated with that key.
 * You should return a new value for the key passed in.
 * For more details, take a look at the code for a pre-baked decorator like
 * "Function#around":Function#around .
 *
 * {{{
 *   // Delicious cookies...
 *   var eggs = { 'eggs': '2 large {}' },
 *       butter = { 'butter': '2 sticks of {}' },
 *       bakingPowder = { 'baking powder': '1 tsp {}' },
 *       flour = { 'flour': '2 1/4 cups {}' },
 *       sugar = { 'sugar': '1/2 cup {}' },
 *       brownSugar = { 'brown sugar': '1/2 cup {}' },
 *       mapleSyrup = { 'maple syrup': '2 Tbsp {}' },
 *       vanilla = { 'vanilla extract': '1 tsp {}' },
 *       chocolate = { 'dark chocolate chips': '2 cups {}' },
 *       nuts = { 'walnuts': '1 cup {}' };
 *
 *   var batter = mix(eggs, butter, bakingPowder, flour, sugar,
 *                    brownSugar, mapleSyrup, vanilla, chocolate, nuts).into({});
 *   var recipe = mix(batter).into({
 *     name: 'Chocolate Chip cookies',
 *
 *     list: function () {
 *       var list = [this.name, '='.times(this.name.length)],
 *           ingredient, amount;
 *       for (var ingredient in this) {
 *         amount = this[ingredient];
 *         if (this.hasOwnProperty(ingredient) && !Function.isFunction(amount) &&
 *             ingredient !== 'name') {
 *           list.push(amount.fmt(ingredient));
 *         }
 *       }
 *       return list.join('\n');
 *     }
 *   });
 *
 *   alert(recipe.list());
 * }}}
 * @param {...} mixins Objects to mixin to the template provided on into.
 * @returns {Object} An object with "into" field, call into with the template
 *                   to apply the mixins on. That will return the template
 *                   with the mixins on it.
 */
var mix = function () {
  var mixins = arguments;

  return {
    into: function (seed) {
      var key, mixin, o,
          i = 0, len = mixins ? mixins.length : 0,
          j = 0, name, aliases, _, transformer;
      for (; i < len; i += 1) {
        o = mixins[i];
        for (key in o) {
          mixin = o[key];
          aliases = mixin && mixin.aliases || [];
          aliases.push(key);

          for (j = 0; j < aliases.length; j += 1) {
            name = aliases[j];

            if (seed[name] && mixin.isInferior) {
              continue;
            }

            _ = mixin && mixin._;

            if (Function.isFunction(mixin)) {
              for (transformer in _) {
                if (_.hasOwnProperty(transformer)) {
                  mixin = _[transformer](seed, mixin, name);
                }
              }
            }

            seed[name] = mixin;

            // Take care of IE clobbering toString and valueOf
            if (name === "toString" &&
                seed.toString === Object.prototype.toString) {
              seed.toString = mixin;
            } else if (name === "valueOf" &&
                seed.valueOf === Object.prototype.valueOf) {
              seed.valueOf = mixin;
            }
          }

          // Delete aliases- they're redundant information.
          if (mixin && mixin.aliases) {
            delete mixin.aliases;
          }
        }
      }
      return seed;
    }
  };
};
