mix(/** @scope Espresso */{

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
    if (Espresso.isCallable(fn)) {
      mix(Espresso.Property, {
        dependentKeys: Espresso.A(arguments).slice(1)
      }).into(fn);
    } else {
      fn = {};
    }

    // Decorator API
    fn._ = fn._ || {};
    /** @ignore */
    fn._.property = function (template, value, key) {
      var kvoKey = key,
          isComputed = Espresso.isCallable(value),
          meta = template.__espmeta__ || {};

      // ECMAScript5 compatible API (no need for get or set!)
      try { // IE burps on this
        if ("defineProperty" in Object) {
          kvoKey = "__kvo__{}__".format(key);

          if (meta[kvoKey]) { delete template[key]; }

          if (isComputed) {
            template[kvoKey] = value;
            meta[key] = { closureKey: kvoKey };
          }

          Object.defineProperty(template, key, {
            get: function () { return this.get(kvoKey); },
            set: function (value) { return this.set(kvoKey, value); },
            enumerable: true,
            configurable: true
          });

          kvoKey.name = key;
          value = void(0);
        }
      } catch (e) {}

      meta[kvoKey] = { referenceKey: key,
                       isComputed: isComputed };
      template.__espmeta__ = meta;

      return value;
    };

    return fn;
  }

}).into(Espresso);