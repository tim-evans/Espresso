(function () {

var META_KEY = "__esp__" + Date.now() + "__meta__",
    hasES5Properties = !!Object.defineProperty;

/** @ignore
  Returns meta-info about an object's contents.
  This contains things like the cache, and ES5
  descriptors.
 */
function meta(o, create) {
  var info = o && o[META_KEY];
  if (create && info == null) {
    info = o[META_KEY] = {
      desc: {},
      cache: {},
      lastSetCache: {}
    };
  }
  return info;
}

/** @ignore
  Creates a getter that will return what's
  in the cache if
 */
function mkGetter(key, desc) {
  var cacheable = desc.isCacheable,
      fun = desc;

  if (cacheable) {
    return function () {
      var value, cache = meta(this).cache;
      if (key in cache) return cache[key];
      value = cache[key] = fun.call(this, key);
      return value;
    };
  } else {
    return function () {
      return fun.call(this, key);
    };
  }
}

function mkSetter(key, desc) {
  var idempotent = desc.isIdempotent,
      cacheable = desc.isCacheable,
      fun = desc;

  if (idempotent) {
    return function (value) {
      var m = meta(this, cacheable),
          ret, cache = m.lastSetCache;

      // Fast path for idempotent properties
      if (key in cache && cache[key] === value && cacheable) {
        return m.cache[key];
      }

      cache[key] = value;
      if (cacheable) delete m.cache[key];
      ret = fun.call(this, key, value);
      if (cacheable) m.cache[key] = ret;
      return ret;
    };
  } else {
    return function (value) {
      var m = meta(this, cacheable),
          ret;

      if (cacheable) delete m.cache[key];
      ret = fun.call(this, key, value);
      if (cacheable) m.cache[key] = ret;
      return ret;
    };
  }
}


mix(/** @scope Espresso */{

  /** @function
    @desc
    Internal method for returning description of
    properties that are created by Espresso.

    Note: This is modeled after SC2.
    @param {Object} o The object to get the information of.
    @param {Boolean} create Whether the meta information
      should be created upon calling this method.
    @returns {Object} A object with the information about
      the passed object
   */
  meta: meta,

  /**
    Marks a function as a computed property, where the
    getter and setter functions are the same function.

    If you're in an ECMAScript5 supported environment,
    you may use normal object accessors on properties,
    which will call `get` and `set` for you:

        Greeter = mix(Espresso.Observable, {
          "L10N": {
            hello: {
              en: "Hello",
              ja: "こんにちは",
              fr: "Bonjour"
            }
          },

          language: Espresso.property(),

          greeting: Espresso.property(function () {
            return "{{L10N.hello.{language}}}".format(this).format(this);
          }, "language").cacheable()
        }).into({});
        Greeter.initObservable();

        Greeter.language = "en";
        alert(Greeter.greeting);
        // -> "Hello"

        Greeter.language = "fr";
        alert(Greeter.greeting);
        // -> "Bonjour"

    Keep in mind that everything that needs property observing
    has to be an {@link Espresso.Property}. For instance
    if the example above didn't have `language` as
    {@link Espresso.property}, you would have to explicitly
    `set` `language` to have `greeting` be notified of the
    property changes.

    @param {Function} fn The function to be called when
      the property should be computed.
    @param {...} dependentKeys The dependent keys that
      this property has. When any of these keys get
      updated via KVO, the property will be notified.
    @returns {Espresso.Property} The function as a Espresso.property.
   */
  property: function (fn, dependentKeys) {
    dependentKeys = Espresso.A(arguments).slice(1);
    if (Espresso.isCallable(fn)) {
      mix(Espresso.Property).into(fn);
    } else {
      fn = {};
    }

    // Decorator API
    fn._ = fn._ || {};
    /** @ignore */
    fn._.property = function (template, value, key) {
      var m = meta(template, true);

      m.desc[key] = { watching: dependentKeys };
      m.desc[key].get = mkGetter(key, value);
      m.desc[key].set = mkSetter(key, value);

      // ECMAScript5 compatible API (no need for get or set!)
      if (hasES5Properties) {
        Object.defineProperty(template, key, {
          get: m.desc[key].get,
          set: m.desc[key].set,
          enumerable: true,
          configurable: true
        });

        // Don't return anything...
        value = void(0);
      }
      return value;
    };

    return fn;
  }

}).into(Espresso);

}());
