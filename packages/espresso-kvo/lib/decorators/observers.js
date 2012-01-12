var metaPath = Espresso.metaPath,
    getPath = Espresso.getPath,
    tokenize = Espresso.tokensForPropertyPath,
    slice = Array.prototype.slice;

mix(/** @scope Espresso */{

  /**
    Marks a function as a computed property, where the
    getter and setter functions are the same function.

    If you're in an ECMAScript5 supported environment,
    you may use normal object accessors on properties,
    which will call `get` and `set` for you:

        Greeter = mix(Espresso.Observable, {
          L10N: {
            hello: {
              en: 'Hello',
              ja: 'こんにちは',
              fr: 'Bonjour'
            }
          },

          language: Espresso.property(),

          greeting: Espresso.property(function () {
            return L10N.hello[Espresso.get(this, 'language')];
          }, 'language').cacheable()
        }).into({});
        Greeter.initObservable();

        Espresso.set(Greeter, 'language', 'en');
        alert(Espresso.get(Greeter, 'greeting'));
        // -> 'Hello'

        Espresso.set(Greeter, 'language', 'fr');
        alert(Espresso.get(Greeter, 'greeting'));
        // -> 'Bonjour'

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
  observes: function (target, dependentKeys) {
    dependentKeys = slice.call(arguments, 1);

    // Init API
    metaPath(target, ['init', 'observe'], function (target, value, key) {
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

        // Subscribe to the events.
        Espresso.addObserver(o, dependent, target, value);
      }
      return target;
    });

    return target;
  },

  observesBefore: function (target, dependentKeys) {
    dependentKeys = slice.call(arguments, 1);

    // Init API
    metaPath(target, ['init', 'observe:before'], function (target, value, key) {
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

        // Subscribe to the events.
        Espresso.addBeforeObserver(o, dependent, target, value);
      }
      return target;
    });

    return target;
  }

}).into(Espresso);
