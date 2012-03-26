var metaPath = Espresso.metaPath,
    meta = Espresso.meta,
    getPath = Espresso.getPath,
    tokenize = Espresso.tokensForPropertyPath,
    slice = Array.prototype.slice;

/**

  @param {Function} fn The function to be notified when
    any of the dependant keys change.
  @param {...} dependantKeys The list of keys that should
    trigger a notification to the function.
  @returns {Function} The reciever.
 */
Espresso.observes = Espresso.Decorator.create({

  name: 'observes',

  preprocess: function (target, dependantKeys) {
    var m = meta(target, true);
    m["dependants:change"] = (m["dependants:change"] || []).concat(slice.call(arguments, 1));
    return target;
  },

  init: function (target, value, key) {
    var dependants = meta(target)["dependants:change"],
        dependant, o, tokens;

    for (var i = 0, len = dependants.length; i < len; i++) {
      o = target;
      dependant = dependants[i];

      // If it's a property path, follow the chain.
      tokens = tokenize(dependant);
      if (tokens.length > 1) {
        o = getPath(tokens.slice(0, -2).join('.'));
        dependant = tokens[tokens.length - 1];
      }

      // Subscribe to the events.
      Espresso.addObserver(o, dependant, target, value);
    }
    return target;
  }
});

/**

  @param {Function} fn The function to be notified before
    any of the dependant keys change.
  @param {...} dependantKeys The list of keys that should
    trigger a notification to the function.
  @returns {Function} The reciever.
 */
Espresso.observes = Espresso.Decorator.create({

  name: 'observesBefore',

  preprocess: function (target, dependantKeys) {
    var m = meta(target, true);
    m["dependants:before"] = (m["dependants:before"] || []).concat(slice.call(arguments, 1));
    return target;
  },

  init: function (target, value, key) {
    var dependants = meta(target)["dependants:before"],
        dependant, o, tokens;

    for (var i = 0, len = dependants.length; i < len; i++) {
      o = target;
      dependant = dependants[i];

      // If it's a property path, follow the chain.
      tokens = tokenize(dependant);
      if (tokens.length > 1) {
        o = getPath(tokens.slice(0, -2).join('.'));
        dependant = tokens[tokens.length - 1];
      }

      // Subscribe to the events.
      Espresso.addBeforeObserver(o, dependant, target, value);
    }
    return target;
  }
});
