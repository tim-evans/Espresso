/*globals mix Espresso */

mix(/** @lends Function.prototype */{

  /**
    If the attribute being mixed in exists on the
    Object being mixed in, the function marked as
    inferior will **not** be mixed in.

    Also, if the base function is inferior, it
    will be overriden.

    @returns {Function} The reciever.
   */
  inferior: function () {
    this._ = this._ || {};
    this.isInferior = true;

    /** @ignore */
    this._.inferior = function (template, value, key) {
      return (!template[key] || template[key].isInferior) ? value: template[key];
    };

    return this;
  },

  /**
    Provides a mechanism to alias a function with
    other names on the object.

    Any arguments passed in will be used as aliases
    for the function. Each of these aliases will be
    references to the original, meaning that all of
    them will be indistinguishable and if one is
    altered in place, then all will be.

    @param {...} aliases The aliases this function has.
    @returns {Function} The reciever.
   */
  alias: function () {
    this._ = this._ || {};

    var aliases = Array.from(arguments),
        idx = aliases.length, mixin;

    /** @ignore */
    this._.alias = function (template, value, key) {
      delete value._.alias; // Remove this to prevent recursion.
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
    Around provides `super` functionality to a function.
    When the decorated function is called, it will have it's
    first argument bound to the function this one will override.

    If this function will not override anything, then the first
    argument will be an empty function that returns nothing.

    The `super` function will always be in the current scope of
    the function being called at the moment. Since the scope is
    maintained for you, you **must** make sure that scope that the
    first in the chain is what you want all down the chain. This
    is the typical behaviour of `super` in other languages;
    therefore it is done for you, and forces you into that
    situation.

    NOTE: If you try to rebind the property using
          {@link Function#bind}, it will _not_ work.

    @returns {Function} The reciever.
   */
  around: function () {
    this._ = this._ || {};

    var empty = function () {};

    /** @ignore */
    this._.around = function (template, value, key) {
      var base = template[key] || empty;
      if (!Espresso.isCallable(base)) {
        return value;
      }

      return function () {
        return value.apply(this, [base.bind(this)].concat(Array.from(arguments)));
      };
    };
    return this;
  },

  /**
    Notifies the function when a property did change.
    The notification will be delivered asynchronously
    to the function.

    `on` is intended to emphasize the publish/subscribe
    pattern, where messages are delivered asynchronously
    to the method, with the intention that the method
    is foreign code that absolutely cannot disturb the
    execution of the library.

    All `on` does is subscribes the function to the
    property paths given using asynchronous delivery.

    @param {...} subscriptions The events to be
      notified when anything gets published to them.
    @returns {Function} The reciever.
    @see Function#observes
   */
  on: function () {
    this._ = this._ || {};

    var pubsub = Array.from(arguments);

    /** @ignore */
    this._.on = function (template, value, key) {
      var i = 0, len = pubsub.length, object, property, iProperty;
      for (i = 0; i < len; i += 1) {
        property = pubsub[i];
        object = template;

        if (property.indexOf('.') !== -1) {
          iProperty = property.lastIndexOf('.');
          object = Espresso.getObjectFor(property.slice(0, iProperty));
          property = property.slice(iProperty + 1);
        }

        if (object && object.subscribe && object.publish) {
          object.subscribe(property, value);
        }
      }
      return value;
    };
    return this;
  },

  /**
    Notifies the function when a property did change.
    The notification will be delivered synchronously
    to the function.

    `observes` is intended to emphasize the observer
    pattern, where messages are delivered synchronously
    to the method. This is extremely useful for taking
    action when an internal event needs to be propagated
    to many internal sources.

    Try not to expose `observes` as a public API method,
    as it will potentially crash the library's code if
    _any_ error is thrown.

    All `observes` does is subscribes the function to the
    property paths given using synchronous delivery.

    Here's a simple clock using observers to propagate
    changes from appropriate levels outward.

        var Clock = Espresso.Class.extend({
          time: null,
          timer: null,

          init: function () {
            this.set('timer', setInterval(this.tick.bind(this), 1000));
            this.tick();
          },

          tick: function () {
            this.set('time', new Date(Date.now()));
          },

          timeDidChange: function () {
            alert("{:c}".fmt(this.get('time')));
          }.observes('time')
        });

        var clock = new Clock();
        setTimeout(function () {
          clearInterval(clock.get('timer'))
        }, 5000);

    @param {...} observers The property paths to be
      notified when anything gets published to them.
    @returns {Function} The reciever.
    @see Function#on
   */
  observes: function () {
    this._ = this._ || {};

    var pubsub = Array.from(arguments);

    /** @ignore */
    this._.observes = function (template, value, key) {
      var i = 0, len = pubsub.length, object, property, iProperty;
      for (i = 0; i < len; i += 1) {
        property = pubsub[i];
        object = template;

        if (property.indexOf('.') !== -1) {
          iProperty = property.lastIndexOf('.');
          object = Espresso.getObjectFor(property.slice(0, iProperty));
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
    Marks the function as a computed property.
    You may now use the function for `get` and `set`.

    @param {...} dependentKeys The property paths to be
      notified when anything gets published to them.
    @returns {Function} The reciever.
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
          object = Espresso.getObjectFor(property.slice(0, iProperty));
          property = property.slice(iProperty + 1);
        }

        if (object && object.subscribe && object.publish) {
          object.subscribe(property, notifier, { synchronous: true });
        }
      }

      return value;
    };

    return this;
  },

  /**
    Marks the computed property as cacheable.

    Using {@link KVO.get} on the function multiple
    times will cache the response until it has been
    set again.

    @returns {Function} The reciever.
   */
  cacheable: function () {
    this.isCacheable = true;
    this.isProperty = true;

    return this;
  },

  /**
    Marks the computed property as idempotent.

    Using {@link KVO.set} on the function multiple
    times will do act like setting the function once.

    @returns {Function} The reciever.
   */
  idempotent: function () {
    this.isIdempotent = true;
    this.isProperty = true;

    return this;
  }

}).into(Function.prototype);

mix(/** @lends Function.prototype */{

  /**
    Bind the value of `this` on a function before hand,
    with any extra arguments being passed in as initial
    arguments.

    This implementation conforms to the ECMAScript 5
    standard.

        var Person = Espresso.Template.extend({
          name: 'nil',
          greet: function (greeting) {
            alert(greeting.fmt(this.name));
          }
        });

        var wash = Person.extend({
          name: 'Hoban Washburne'
        });

        var mal = Person.extend({
          name: 'Malcolm Reynolds'
        });

        mal.greet("Hello, {}!");
        // -> "Hello, Malcolm Reynolds!"

        var greet = mal.greet.bind(wash);
        greet("Howdy, {}!");
        // -> "Howdy, Hoban Washburne!"

    @param {Object} thisArg The value to bind `this` to on the function.
    @returns {Function} The function passed in, wrapped to ensure `this`
      is the correct scope.
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
  }.inferior(),

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
  }

}).into(Function.prototype);
