/*globals mix Espresso */

mix(/** @lends Function.prototype */{

  /**
    If the attribute being mixed in exists on the
    Object being mixed in, the function marked as
    inferior will **not** be mixed in. If the base
    function is inferior, it will be overriden.

    @param {Function} [condition] If it returns `true`,
      the function is inferior. Otherwise, it isn't.
    @returns {Function} The reciever.
   */
  inferior: function (condition) {
    return Espresso.inferior.apply(null, [].concat(this, Espresso.A(arguments)));
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
    return Espresso.alias.apply(null, [].concat(this, Espresso.A(arguments)));
  },

  /**
    Refine allows for function-by-function refinements that
    reopens the function implementation without editing the
    original function's contents. With this, you can implement
    OO constructs like abstract base classes.

    Refinements to a function recieve a prepended argument to
    the argument list which is the original function that
    is being refined (if there isn't an original function that's
    being refined, a empty function will be provided for consistency).

    Calling the refined function should be done like so:

        Machiatto = mix({
          pull: function (original) {
            var espresso = original();
            return espresso + milk;
          }.refine()
        }).into(Espresso);

    Provide arguments as-is, omit arguments, or add arguments
    to the function. It'll be just like it's being called normally.

    NOTE: If you try to rebind the property using
          {@link Function#bind}, it will _not_ work.

    @returns {Function} The reciever.
   */
  refine: function () {
    this._ = this._ || {};

    var empty = function () {};

    /** @ignore */
    this._.refine = function (template, value, key) {
      var base = template[key] || empty;
      if (!Espresso.isCallable(base)) {
        return value;
      }

      /** @ignore */
      var lambda = function () {
        return value.apply(this, [base.bind(this)].concat(Espresso.A(arguments)));
      };

      // Copy over function properties
      for (var k in value) {
        if (value.hasOwnProperty(k)) {
          lambda[k] = value[k];
        }
      }
      return lambda;
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

    Using {@link Espresso.Observable#get} on the function multiple
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

    Using {@link Espresso.Observable#set} on the function multiple
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

        var Person = mix({
          name: 'nil',
          greet: function (greeting) {
            alert(greeting.format(this.name));
          }
        }).into({});

        var wash = mix(Person).into({
          name: 'Hoban Washburne'
        });

        var mal = mix(Person).into({
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
    A = Espresso.A(arguments).slice(1);

    var bound = function () {
      
      if (this instanceof bound) {
        // 15.3.4.5.2 [[Construct]]
        // When the [[Construct]] internal method of a function object, F,
        // that was created using the bind function is called with a list of
        // arguments ExtraArgs, the following steps are taken:
        var Type = function () {}, that;
        Type.prototype = Target.prototype;
        that = new Type();

        Target.apply(self, A.concat(Espresso.A(arguments)));
        return that;
      } else {
        // 15.3.4.5.1 [[Call]]
        // When the [[Call]] internal method of a function object, F,
        // which was created using the bind function is called with a this
        // value and a list of arguments ExtraArgs, the following steps are taken:
        // 1. Let boundArgs be the value of F's [[BoundArgs]] internal property.
        // 2. Let boundThis be the value of F's [[BoundThis]] internal property.
        // 3. Let target be the value of F's [[TargetFunction]] internal property.
        return Target.apply(self, A.concat(Espresso.A(arguments)));
      }
    };
    return bound;
  }.inferior(false), // bind seems to be broken on all browsers

  /**
    Currying transforms a function by transforming by composing it into
    functions that each take a subset of the arguments of the whole.
    The aggregate of all of the arguments passed into curried function
    and the actual function call is what will be provided to the function
    that's being curried.

    This effectively means that you can transform a very simple call into
    atomic calls as follows:

        var mult = function () {
          return Espresso.A(arguments).reduce(function (E, x) { return E * x; }, 1);
        };

        alert(mult.curry(2, 2)());
        // => 4

    Or specify a function that is a subset of the first:

        var add = function () {
          return Espresso.A(arguments).reduce(function (E, x) { return E + x; }, 0);
        };

        var inc = add.curry(1);

        alert(inc(5));
        // => 6

    In layman's terms, `curry` will prepopulate arguments for a function.
    @param {...} args Arguments that will be curried to the function.
    @returns {Function} The function with the arguments provided saved for later.
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
    A = Espresso.A(arguments);

    return function () {
      return Target.apply(this, A.concat(Espresso.A(arguments)));
    };
  }

}).into(Function.prototype);
