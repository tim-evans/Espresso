/**
  @module espresso
  @submodule espresso-crema
 */

var toString = Object.prototype.toString,
    slice = Array.prototype.slice,
    META_KEY = '__cr__' + (new Date()).getTime() + '__meta__',
    T_FUNCTION = '[object Function]',
    T_STRING   = '[object String]',
    T_NUMBER   = '[object Number]',
    T_BOOLEAN  = '[object Boolean]',
    T_OBJECT   = '[object Object]',
    uuid = 0,
    st = {}; // string cache

/**
  Espresso is a JavaScript library to be used as a
  foundation library to create JavaScript libraries.
  This library is made with the to aid in creating
  code that's pleasant to read, smaller, and
  consequently, less buggy.

  Espresso provides a partial shim for ECMAScript 5,
  falling back to native support when available, and
  provides support for Enumerables, Observers, mixins,
  and string formatting.

  @class Espresso
  @static
 */
Espresso = {

  /**
    Check to see if the object has function-like properties.
    If it's callable, then it's a function or an object with
    `call` and `apply` functions (which are assumed to work
    how the same ones work on {@link Function.prototype}).

    @method isCallable
    @param {Object} obj The Object to check whether it is callable or not.
    @return {Boolean} True if the Object is callable, otherwise false.
   */
  isCallable: function (obj) {
    return obj && (toString.call(obj) === T_FUNCTION ||
                   (obj.call != null && toString.call(obj.call) === T_FUNCTION &&
                    obj.apply != null && toString.call(obj.apply) === T_FUNCTION));
  },

  /**
    Convert an iterable object into an Array.

    @method A
    @param {Object} iterable An iterable object with a length and indexing.
    @return {Array} The object passed in as an Array.
   */
  A: function (iterable) {
    return slice.apply(iterable);
  },

  /**
    Constant function that returns the arguments passed in.

    @method K
    @return The arguments passed in.
   */
  K: function () {
    return arguments;
  },

  /**
    Internal method for returning description of
    properties that are created by Espresso.

    Note: This is modeled after Ember.
    @method meta
    @param {Object} o The object to get the information of.
    @param {Boolean} create Whether the meta information
      should be created upon calling this method.
    @return {Object} A object with the information about
      the passed object
   */
  meta: function (o, create) {
    var info = o && o[META_KEY];
    if (create && info == null) {
      info = o[META_KEY] = {};
    }
    return info;
  },

  /**
    Gets or sets the meta object provided the given tuple path.
    For example:

        var fruitStand = { owner: 'Gazpacho' };

    Let's take the above object, and look at it's meta hash.

        Espresso.meta(fruitStand);
        // => undefined

    Let's add items to the private inventory of the fruit stand:

        Espresso.metaPath(fruitStand, ['inventory'], ['Floss Berries']);
        // => ['Floss Berries']

    Let's take a look at the meta hash now:

        Espresso.meta(fruitStand);
        // => { 'inventory': ['Floss Berries'] }

    Now to add another item to the fruit store's inventory:

        Espresso.metaPath(fuitStand, ['inventory']).push('Bluenana');

    @method metaPath
    @param {Object} o The object to look up the meta object of.
    @param {String[]} path A tuple containing the list of properties to look up.
    @param {Object} [value] The value to set the path.
    @return The value of the object at the given location in the meta object.
   */
  metaPath: function (o, path, value) {
    var i = 0, len = path ? path.length : 0,
        m;

    if (arguments.length === 3) {
      m = Espresso.meta(o, true);
      for (; i < len - 1; i++) {
        o = m[path[i]] || {};
        m[path[i]] = o;
        m = o;
      }
      m[path[len - 1]] = value;
      m = value;
    } else {
      m = Espresso.meta(o);
      for (; i < len; i++) {
        m = m ? m[path[i]] : undefined;
      }
    }
    return m;
  },

  /**
    Returns the **G**lobally **U**nique **Id**entifier for the given object.
    @method guidFor
    @param {Object} o The object to get the GUID of.
    @return {String} The GUID of the passed object.
   */
  guidFor: function (o) {
    if (o === null) return '(null)';
    if (o === void(0)) return '(undefined)';

    var cache, result, m,
        type = toString.call(o);

    switch(type) {
    case T_NUMBER:
      result = 'nu' + o;
      break;
    case T_STRING:
      result = st[o];
      if (!result) result = st[o] = 'st' + (uuid++);
      break;
    case T_BOOLEAN:
      result = o ? '(true)' : '(false)';
      break;
    default:
      if (o === Object) return '{}';
      if (o === Array) return '[]';
      m = Espresso.meta(o, true);
      result = m.guid;
      if (!result) result = m.guid = 'cr' + (uuid++);
    }
    return result;
  },

  /**
    Initializes any properties that require initialization
    on the object.

    This is used for decorating objects with functionality
    @method init
    @param {Object} object The object to initialize
   */
  init: function (object) {
    var initializer, initializers,
        globalInitializers,
        value, key,
        metaPath = Espresso.metaPath;

    if (!metaPath(object, ['initialized'])) {
      globalInitializers = metaPath(object, ['init']);

      // Lazily instantiate new meta hashes
      // so we can have a meta hierarchy
      if (META_KEY in object) {
        object[META_KEY] = null;
      }

      metaPath(object, ['initialized'], true);

      for (key in object) {
        value = object[key];
        initializers = metaPath(value, ['init']);
        if (initializers != null) {
          for (initializer in initializers) {
            if (initializers.hasOwnProperty(initializer)) {
              initializers[initializer](object, value, key);
            }
          }
        }
      }

      // After all properties have been initialized,
      // call any global initializers
      initializers = globalInitializers;
      if (initializers != null) {
        for (initializer in initializers) {
          if (initializers.hasOwnProperty(initializer)) {
            initializers[initializer](object);
          }
        }
      }
    }
    return object;
  },

  /**
    Removes any private references to foreign objects
    on the META_KEY property so this object can be
    properly garbage collect.

    Note that after destroying an object, things will
    not work as expected.

    @method destroy
    @param {Object} object The object to destroy
   */
  destroy: function (object) {
    var meta = object[META_KEY];
    if (meta) {
      object[META_KEY] = null;
    }
  }
};

// Apply it at the global scope
this.Espresso = Espresso;

var metaPath = Espresso.metaPath,
    nonEnumerables = ['hasOwnProperty',
                      'valueOf',
                      'isPrototypeOf',
                      'propertyIsEnumerable',
                      'toLocaleString',
                      'toString'];

var merge = function (source, targetRoot, key) {
  if (targetRoot[key] == null) {
    targetRoot[key] = {};
  }
  var target = targetRoot[key],
      value;

  for (var property in source) {
    if (source.hasOwnProperty(property)) {
      value = source[property];
      if (target[property] == null) {
        target[property] = value;
      } else if (toString.call(target[property]) === T_OBJECT) {
        merge(value, target, property);
      } else {
        target[property] = value;
      }
    } 
  };
};

/**
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

  @method mix
  @param {Object} mixins* Objects to mixin to the target provided on into.
  @return {Object} An object with `into` field, call into with the target
                    to apply the mixins on. That will return the target
                    with the mixins on it.
    @param {Object} target The object to put the mixins on
    @return {Object} The target
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
          if (key == META_KEY) {
            merge(value, target, META_KEY);
            continue;
          }

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
          for (e = 0; e < nonEnumerables.length; e++) {
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
