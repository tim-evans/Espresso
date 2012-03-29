require('espresso-crema');
require('espresso-kvo/property_path');
require('espresso-kvo/observers');

var o_get, o_set, get, set,
    metaPath = Espresso.metaPath,
    tokenize = Espresso.tokensForPropertyPath,
    willChange = Espresso.propertyWillChange,
    didChange = Espresso.propertyDidChange,
    isCallable = Espresso.isCallable;

// Handle ES5 compliant JavaScript implementations here.
/** @ignore */
o_get = function (object, key) {
  // If there is no path, assume we're trying to get on Espresso.
  if (arguments.length === 1) {
    key = object;
    object = Espresso;
  }

  if (object == null) return undefined;
  var value = object[key];
  if (typeof value === 'undefined' &&
      isCallable(object.unknownProperty)) {
    value = object.unknownProperty(key);
  }
  return value;
};

/** @ignore */
o_set = function (object, key, value) {
  // Unknown Properties
  if (object != null && !(key in object) &&
      isCallable(object.unknownProperty)) {
    object.unknownProperty(key, value);
  } else {
    willChange(object, key);
    object[key] = value;
    didChange(object, key, value);
  }
  return value;
};

// Fallback on looking up information on the meta hash here.
/** @ignore */
get = function (object, key) {
  if (arguments.length === 1) {
    key = object;
    object = Espresso;
  }

  if (object == null) return undefined;
  var fn = metaPath(object, ['desc', key, 'get']);
  return fn
         ? fn.call(object)
         : o_get(object, key);
};

/** @ignore */
set = function (object, key, value) {
  var fn = metaPath(object, ['desc', key, 'set']);
  if (fn) {
    willChange(object, key);
    fn.call(object, value);
    didChange(object, key, value);
  } else {
    o_set(object, key, value);
  }
  return object;
};

mix(/** @scope Espresso */{

  /** @function
    @desc
    Returns the property for a given value.

    This brings backwards-compatability to ES5 properties.

    If no property with the given name is found on the object,
    `unknownProperty` will be attempted to be invoked.

    @param {Object} [object] The object to lookup the key on.
      If no object is provided, it will fallback on `Espresso`.
    @param {String} key The key to lookup on the object.
    @returns {Object} The value of the property on the object.
   */
  get: get,

  /**
    Lookup a variable's value given its Object notation.
    This requires absolute queries to the Object, using
    idiomatic JavaScript notation. If no second argument
    is given, it will look up the object on `Espresso`.

    @example
      // No scope assumes the object has is at the global scope.
      window.environment = {
        isBrowser: (function () {
          return document in this;
        }())
      };

      alert(Espresso.getPath(window, 'environment.isBrowser'));

    @example
      alert(Espresso.getPath({
        lang: {
          en: { _coffee: 'coffee' },
          pr: { _coffee: 'cafe' }
        }
      }, 'lang.pr._coffee'));
      // -> 'cafe'

    @example
      alert(Espresso.getPath({
        options: ['espresso', 'coffee', 'tea']
      }, 'options[0]'));
      // -> 'espresso'

    @param {Object} object The target object to get a value from.
    @param {String} key The key to get on the target.
    @returns {Object} The referenced value in the args passed in.
   */
  getPath: function (object, path) {
    // If there is no path, assume we're trying to get on Espresso.
    if (arguments.length === 1) {
      path = object;
      object = Espresso;
    }

    var tokens = tokenize(path);

    while (tokens.length) {
      object = get(object, tokens.shift());
    }
    return object;
  },

  /** @function
    @desc
    Set a value on an object.

    Use this instead of subscript (`[]`) or dot notation
    for public variables. Otherwise, you won't reap benefits
    of being notified when they are set, or if the property
    is computed.

    Set is tolerant of when trying to access objects that
    don't exist- it will ignore your attempt in that case.

    @param {String} key The key to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  set: set,

  /**
    Set a value that is a property path.

    This function will return the value given the
    property path using `set` and `get` when necessary.

    This means you should write:

        zombie.setPath('brain.isDelicious', true);

    instead of:

        zombie.set('brain.isDelicious', true);

    @param {String} key The property path to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  setPath: function (object, path, value) {
    var tokens = tokenize(path),
        o = object;

    while (tokens.length > 1) {
      o = get(o, tokens.shift());
    }

    return (o == null)
           ? object
           : set(o, tokens.shift(), value);
  }

}).into(Espresso);
