/*globals mix Espresso */
mix(/** @lends Function.prototype */{

  /**
   * Marks the function as inferior.
   * If there's another attribute on the Object
   * you're mixing in to, the inferior function will
   * not be mixed in.
   *
   * @returns {Function} The reciever.
   */
  inferior: function () {
    this.isInferior = true;
    return this;
  }

}).into(Function.prototype);

mix(/** @lends Function.prototype */{

  /**
   * Provides a mechanism to alias a function with
   * other names on the object.
   *
   * @returns {Function} The reciever.
   */
  alias: function () {
    this._ = this._ || {};

    var aliases = Array.from(arguments),
        idx = aliases.length, mixin;

    /** @ignore */
    this._.alias = function (template, value, key) {
      delete value._.alias;
      while (idx--) {
        mixin = {};
        mixin[aliases[idx]] = value;
        mix(mixin).into(template);
      }
      return value;
    };

    return this;
  },

  /**
   * Around provides `super` functionality to a function.
   * When the decorated function is called, it will have it's
   * first argument bound to the function this one will override.
   * If this function will not override anything, then the first
   * argument will be an empty function that returns nothing.
   *
   * @returns {Function} The reciever.
   */
  around: function () {
    this._ = this._ || {};

    var empty = function () {};

    /** @ignore */
    this._.around = function (template, value, key) {
      var base = template[key] || empty;
      if (!(base instanceof Function)) {
        return value;
      }

      return function () {
        return value.apply(this, [base.bind(this)].concat(Array.from(arguments)));
      };
    };
    return this;
  },

  /**
   * Notifies the function when a property did change.
   * The notification will be delivered synchronously to the function.
   *
   * @returns {Function} The reciever.
   */
  notifyOn: function () {
    this._ = this._ || {};

    var pubsub = Array.from(arguments);

    /** @ignore */
    this._.pubsub = function (template, value, key) {
      var i = 0, len = pubsub.length, object, property, iProperty;
      for (i = 0; i < len; i += 1) {
        property = pubsub[i];
        object = template;

        if (property.indexOf('.') !== -1) {
          iProperty = property.lastIndexOf('.');
          object = _G.getObjectFor(property.slice(0, iProperty));
          property = property.slice(iProperty + 1);
        }

        if (object && object.subscribe && object.publish) {
          object.subscribe(property, value, { synchronous: true });
        }
      }
      return value;
    };
    return this;
  },

  /**
   * Marks the function as a computed property.
   * You may now use the function for get() and set().
   *
   * @returns {Function} The reciever.
   */
  property: function () {
    this._ = this._ || {};

    this.isProperty = true;
    this.dependentKeys = Array.prototype.slice.apply(arguments);

    /** @ignore */
    this._.property = function (template, value, key) {
      var i = 0, len = value.dependentKeys.length, object, property, iProperty,
          /** @ignore */
          notifier = function () {
            this.set(key);
          };

      for (i = 0; i < len; i += 1) {
        property = value.dependentKeys[i];
        object = template;

        if (property.indexOf('.') !== -1) {
          iProperty = property.lastIndexOf('.');
          object = _G.getObjectFor(property.slice(0, iProperty));
          property = property.slice(iProperty + 1);
        }

        if (object && object.subscribe && object.publish) {
          object.subscribe(property, notifier, { synchronous: true });
        }
      }

      return value;
    };

    return this;
  }.inferior(),

  /**
   * Marks the computed property as cacheable.
   *
   * @returns {Function} The reciever.
   */
  cacheable: function () {
    this._ = this._ || {};
    this.isCacheable = true;
    this.isProperty = true;

    return this;
  }.inferior()

}).into(Function.prototype);

mix(/** @lends Function.prototype */{

  /**
   * Bind the value of `this` on a function before hand,
   * with any extra arguments being passed in as initial arguments.
   *
   * This implementation conforms to the ECMAScript 5 standard.
   * {{{
   *   var Person = Espresso.Template.extend({
   *     name: 'nil',
   *     greet: function (greeting) {
   *       alert(greeting.fmt(this.name));
   *     }
   *   });
   *
   *   var wash = Person.extend({
   *     name: 'Hoban Washburne'
   *   });
   *
   *   var mal = Person.extend({
   *     name: 'Malcolm Reynolds'
   *   });
   *
   *   mal.greet("Hello, {}!");
   *   // -> "Hello, Malcolm Reynolds!"
   *
   *   var greet = mal.greet.bind(wash);
   *   greet("Howdy, {}!");
   *   // -> "Howdy, Hoban Washburne!"
   * }}}
   *
   * @param {Object} thisArg The value to bind `this` to on the function.
   * @returns {Function} The function passed in, wrapped to ensure `this` is the correct scope.
   */
  bind: function (self) {
    var Target, A;

    // 1. Let Target be the this value.
    Target = this;

    // 2. If IsCallable(Target) is false, throw a TypeError exception
    if (!Espresso.isCallable(Target)) {
      throw new TypeError("The Target is not callable.");
    }

    // 3. Let A be a new (possibly empty) internal list of
    //    all argument values provided after self
    //    (arg1, arg2, etc), in order
    A = Array.from(arguments).slice(1);

    var bound = function () {
      
      if (this instanceof bound) {
        // 15.3.4.5.2 [[Construct]]
        // When the [[Construct]] internal method of a function object, F,
        // that was created using the bind function is called with a list of
        // arguments ExtraArgs, the following steps are taken:
        var Type = function () {}, that;
        Type.prototype = Target.prototype;
        that = new Type();

        Target.apply(self, A.concat(Array.from(arguments)));
        return that;
      } else {
        // 15.3.4.5.1 [[Call]]
        // When the [[Call]] internal method of a function object, F,
        // which was created using the bind function is called with a this
        // value and a list of arguments ExtraArgs, the following steps are taken:
        // 1. Let boundArgs be the value of F's [[BoundArgs]] internal property.
        // 2. Let boundThis be the value of F's [[BoundThis]] internal property.
        // 3. Let target be the value of F's [[TargetFunction]] internal property.
        return Target.apply(self, A.concat(Array.from(arguments)));
      }
    };
    return bound;
  },

  /**
   * Curry will add arguments to a function, returning the function as-is
   */
  curry: function () {
    var Target, A;

    // 1. Let Target be the this value.
    Target = this;

    // 2. If IsCallable(Target) is false, throw a TypeError exception
    if (!Espresso.isCallable(Target)) {
      throw new TypeError("The Target is not callable.");
    }

    // 3. Let A be a new (possibly empty) internal list of
    //    all argument values (arg1, arg2, etc), in order
    A = Array.from(arguments);

    return function () {
      return Target.apply(this, A.concat(Array.from(arguments)));
    };
  },

  delay: function (timeout, that) {
    var args = Array.from(arguments).slice(2),
        method = this;
    setTimeout(function () {
      return method.apply(that, args);
    }, timeout);
  },

  defer: function (that) {
    var args = Array.from(arguments);
    args.unshift(0);
    return this.delay.apply(args);
  }

}).into(Function.prototype);
