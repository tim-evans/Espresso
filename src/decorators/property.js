mix(/** @scope Espresso */{

  /**
    Marks a function as a computed property, where the
    getter and setter functions are the same function.

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