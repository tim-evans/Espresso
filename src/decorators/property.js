Espresso.property = function (fun, dependentKeys) {
  if (!Espresso.isCallable(fun)) {
    throw "";
  }

  fun.isProperty = true;
  fun.dependentKeys = Espresso.A(arguments).slice(1);

  fun.cacheable = function () {
    this.isCacheable = true;
    return this;
  };

  fun.idempotent = function () {
    this.isIdempotent = true;
    return this;
  };

  // Decorator API
  fun._ = fun._ || {};
  /** @ignore */
  fun._.property = function (template, value, key) {
    var kvoKey = key,
        meta = template.__espmeta__ || {};
    meta[kvoKey] = { referenceKey: key };
    template.__espmeta__ = meta;

    return value;
  };

  return fun;
};
