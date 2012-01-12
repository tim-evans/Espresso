var meta = Espresso.meta,
    metaPath = Espresso.metaPath,
    subscribe = Espresso.subscribe,
    willChange = Espresso.propertyWillChange,
    didChange = Espresso.propertyWillChange,
    tokenize = Espresso.tokensForPropertyPath,
    slice = Array.prototype.slice;

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
      var m = metaPath(this, cacheable),
          ret, cache = m.lastSetCache;

      // Fast path for idempotent properties
      if (key in cache && cache[key] === value && cacheable) {
        return cache[key];
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

function mkNotifier(target, key, value) {
  var cacheable = value.isCacheable,
      m = meta(target);

  if (cacheable) {
    return function () {
      var ret;

      willChange(target, key);
      delete m.cache[key];
      ret = value.apply(target, arguments);
      m.cache[key] = ret;
      didChange(target, key, ret);
      return ret;
    };
  } else {
    return function () {
      willChange(target, key);
      didChange(target, key, fun.call(this, key, value));
      return ret;
    };
  }  
}

var Property = {
  cacheable: function () {
    this.isCacheable = true;
    return this;
  },
  idempotent: function () {
    this.isIdempotent = true;
    return this;
  }
};


mix(/** @scope Espresso */{

  /**
    Marks a function as a computed property, where the
    getter and setter functions are the same function.

    If you're in an ECMAScript5 supported environment,
    you may use normal object accessors on properties,
    which will call `get` and `set` for you:

        var set = Espresso.set,
            get = Espresso.get;
        Greeter = mix({
          L10N: {
            hello: {
              en: "Hello",
              ja: "こんにちは",
              fr: "Bonjour"
            }
          },

          language: Espresso.property(),

          greeting: Espresso.property(function () {
            return this.L10N.hello[get(this, 'language')];
          }, 'language').cacheable()
        }).into({});
        Espresso.init(Greeter);

        set(Greeter, 'language', 'en');
        alert(get(Greeter, 'greeting'));
        // -> "Hello"

        set(Greeter, 'language', 'fr');
        alert(get(Greeter, 'greeting'));
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
  property: function (target, dependentKeys) {
    dependentKeys = slice.call(arguments, 1);
    if (Espresso.isCallable(target)) {
      mix(Property).into(target);
    } else {
      target = {};
    }

    // Init API
    metaPath(target, ['init', 'property'], function (target, value, key) {
      metaPath(target, ['desc', key], {
        get: mkGetter(key, value),
        set: mkSetter(key, value),
        writable: false,
        enumerable: true,
        configurable: true
      });

      // Setup local object caches
      meta(target).lastSetCache = {};
      meta(target).cache = {};

      // Register dependent keys
      var dependent, tokens, o;

      for (var i = 0, len = dependentKeys.length; i < len; i++) {
        o = target;
        dependent = dependentKeys[i];

        // If it's a property path, follow the chain.
        tokens = tokenize(dependent);
        if (tokens.length > 1) {
          o = getPath(tokens.slice(0, -2).join('.'));
          dependent = tokens[tokens.length - 1];
        }

        Espresso.addObserver(o, dependent, target, mkNotifier(target, key, value));
      }
      return target;
    });

    return target;
  }

}).into(Espresso);
