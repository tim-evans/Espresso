/*!*
  ( ( (
   ) ) )
  ._____.
 (|     | Espresso
   `---`    A pick-me-up for JavaScript libraries.

  Contributors
    Tim Evans <tim.evans@junctionnetworks.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */
/*globals ESP Espresso */

/** @namespace

  Espresso is a JavaScript library to be used as a
  foundation library to create JavaScript libraries.
  This library is made with the to aid in creating
  code that's pleasant to read, smaller, and
  consequently, less buggy.

  Espresso provides a partial shim for ECMAScript 5,
  falling back to native support when available, and
  provides support for Enumerables, Observers, mixins,
  and string formatting.
 */
Espresso = {

  /**
    The version string.
    @type String
   */
  VERSION: '0.5.7',

  /** @function
    @desc

    Lookup a variable's value given its Object notation.
    This requires absolute queries to the Object, using
    idiomatic JavaScript notation.

    @example
      // No scope assumes the object has is at the global scope.
      window.environment = {
        isBrowser: (function () {
          return document in this;
        }())
      };

      alert(Espresso.getObjectFor("environment.isBrowser"));

    @example
      alert(Espresso.getObjectFor("lang.pr._coffee", {
        lang: {
          en: { _coffee: "coffee" },
          pr: { _coffee: "cafe" }
        }
      }));
      // -> "cafe"

    @example
      alert(Espresso.getObjectFor("options[0]", {
        options: ["espresso", "coffee", "tea"]
      }));
      // -> "espresso"

    @param {String} key The key to get on the target.
    @param {Object} [object] The target object to get a value from.
    @returns {Object} The referenced value in the args passed in.
   */
  getObjectFor: (function () {
    // Return the property or `undefined`
    var get, getPath,
        G = this, idx = 0, fullKey;
        baseError = "Malformed property path:\n",
        unmatchedError = baseError + "Unmatched {} brace:\n{}\n{: >{}}",
        emptyPropertyError = baseError + "Expected a property, but got {}:\n{}\n{: >{}}^",
        unexpectedTokenError = baseError + "Expected {} as the next character, but got '{}'\n{}\n{: >{}}";

    /** @ignore */
    get = function (property, obj) {
      if (property in obj) {
        obj = obj[property];
      } else {
        obj = void 0;
      }
      return obj;
    };

    /** @ignore */
    getPath = function (key, object) {
      var iattr = key.indexOf('.'),
          ioArr = key.indexOf('['),
          icArr = key.indexOf(']'), chr;

      // Nothing to look up on undefined or null objects.
      if (object == null) {
        return object;
      }

      // Can't start properties with a leading '.'
      if (iattr === 0) {
        throw new SyntaxError(Espresso.format(
          emptyPropertyError, "'" + key.charAt(0) + "'",
          fullKey, idx, '^'));
      }

      // Unmatched opening brace
      if (ioArr > icArr) {
        throw new SyntaxError(Espresso.format(
          unmatchedError, "opening",
          fullKey, ioArr + 1, '^'));

      // Unmatched closing brace
      } else if (icArr !== -1 && ioArr === -1) {
        throw new SyntaxError(Espresso.format(
          unmatchedError, "closing",
          fullKey, icArr + 1, '^'));
      }

      // Array accessor (`[]`) access
      if ((ioArr < iattr || iattr === -1) && ioArr > -1) {

        // Found something that looks like `ingredients[0]`
        // Unpack the first part, then deal with the array subscript.
        if (ioArr !== 0) {
          object = get(key.slice(0, ioArr), object);

          // Stop here if object has no value
          if (object == null) {
            return object;
          }
        }

        key = key.slice(ioArr + 1);
        icArr -= ioArr + 1;
        idx += ioArr;

        // No property to parse
        if (!key.length || !icArr) {
          throw new SyntaxError(Espresso.format(
            emptyPropertyError, key.length ? "']'": "EOS",
            fullKey, idx + 1, '^'));
        }

        // Unpack the property
        object = get(key.slice(0, icArr), object);

        // Eat the rest of the descriptor
        key = key.slice(icArr + 1);
        idx += icArr + 2;

        chr = key.charAt(0);
        // Malformed property path
        if (!(chr === "" || chr === '.' || chr === '[')) {
          throw new SyntaxError(Espresso.format(
            unexpectedTokenError, "EOS, '.', or '['",
            chr, fullKey, idx + 1, '^'));
        }

        // Eat up the dot.
        if (key.length && chr === '.') {
          key = key.slice(1);
          if (!key.length) {
            throw new SyntaxError(Espresso.format(
              emptyPropertyError, 'EOS', fullKey, fullKey.length, '^'));
          }
        }

        // Recurse
        return getPath(key, object);

      // Attribute (`.`) subscript
      } else if ((iattr < ioArr || ioArr === -1) && iattr > -1) {
        object = get(key.split('.', 1), object);
        idx += iattr + 1;

        // Eat up the dot.
        key = key.slice(iattr + 1);

        chr = key.charAt(0);
        if (chr === '' || chr === '[') {
          throw new SyntaxError(Espresso.format(
            emptyPropertyError, chr ? chr : 'EOS', fullKey, idx, '^'));
        }

        // Recurse
        return getPath(key, object);

      // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol get
      return get(key, object);
    };

    return function (key, object) {
      // Reset debugging helpers
      fullKey = key;
      idx = 0;

      // Use global scope as default
      object = (arguments.length === 1) ? G: object;

      return getPath(key, object);
    };
  }()),

  /**
    Checks whether the variable is defined *and* is not null.

    @param {Object} o The object to test if it's defined or not.
    @returns {Boolean} True if the value is not null and not undefined.

    @example
      var unbound;
      undefined = 'bwahahaha!';
      alert(Espresso.hasValue(unbound));
      // -> false

      alert(Espresso.hasValue(undefined));
      // -> true
   */
  hasValue: function (o) {
    return o != null;
  },

  /** @function
    @desc

    Check to see if the object has function-like properties.
    If it's callable, then it's a function or an object with
    `call` and `apply` functions (which are assumed to work
    how the same ones work on {@link Function.prototype}).

    @param {Object} obj The Object to check whether it is callable or not.
    @returns {Boolean} True if the Object is callable, otherwise false.
   */
  isCallable: (function () {
    var isFunction = '[object Function]',
        isObject = '[object Object]',
        toString = Object.prototype.toString,
        nil = null;
    return function (obj) {
      return obj && (toString.call(obj) === isFunction ||
             (obj.call != nil && toString.call(obj.call) === isFunction &&
              obj.apply != nil && toString.call(obj.apply) === isFunction));
    };
  }()),

  /** @function
    @desc
    Convert an iterable object into an Array.

    @param {Object} iterable An iterable object with a length and indexing.
    @returns {Array} The object passed in as an Array.
   */
  A: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }()),

  /**
    Defers execution until a later time (when the ready
    queue is empty).

    @param {Function} lambda The function to call.
    @param {Array} args The arguments to apply to the function.
    @param {Object} that The object to apply as `this`.
   */
  defer: function (lambda, args, that) {
    that = that || lambda;
    setTimeout(function () {
      lambda.apply(that, args);
    }, 0);
  }

};

// Apply it at the global scope
this.Espresso = Espresso;
/*globals mix */

/** @function
  @desc

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

  `mix` takes this a bit furthur, allowing properties on the
  objects being mixed in to be altered at mixin time using
  Espresso's decorator API.

  The API hook is adding an underscore (`_`) hash with a
  function that can change the decorated object in place by
  returning the new desired value. For examples on how to use
  the decorator API, look at the `alias` and `inferior` for
  general purpose decorators and `refine` for a funnction
  decorator.

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

            mix.apply(null, Espresso.A(arguments)).into(prototype);

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

  @param {...} mixins Objects to mixin to the target provided on into.
  @returns {Object} An object with `into` field, call into with the target
                    to apply the mixins on. That will return the target
                    with the mixins on it.
 */
mix = function () {
  var mixins = arguments,
      i = 0, len = mixins.length;

  return {
    into: function (target) {
      var mixin, key, value, _, decorator;

      if (target == null) {
        throw new TypeError("Cannot mix into null or undefined values.");
      }

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          // Function annotation API
          _ = value && value._;
          if (_ != null) {
            for (decorator in _) {
              if (_.hasOwnProperty(decorator)) {
                value = _[decorator](target, value, key);
              }
            }
          }
          if (typeof value !== "undefined") target[key] = value;
        }

        // Take care of IE clobbering `toString` and `valueOf`
        if (mixin && mixin.toString !== Object.prototype.toString) {
          target.toString = mixin.toString;
        } else if (mixin && mixin.valueOf !== Object.prototype.valueOf) {
          target.valueOf = mixin.valueOf;
        }
      }
      return target;
    }
  };
};

// Apply it at the global scope
this.mix = mix;
mix(/** @scope Espresso */{

  /**
    Provides a mechanism to alias an object with
    using other names.

    Any arguments passed in after the target will
    be used as aliases for the target. Each of these
    aliases will be references to the original, meaning
    that all of them will be indistinguishable and if
    one of them is altered in place, then all will be.

    @param {Object} target The target to apply this decorator to.
    @param {...} aliases The aliases this object has.
    @returns {Object} The reciever.
   */
  alias: function (target) {
    target._ = target._ || {};

    var aliases = Espresso.A(arguments).slice(1),
        idx = aliases.length, mixin;

    /** @ignore */
    target._.alias = function (template, value, key) {
      delete value._.alias; // Remove this to prevent recursion.
      while (idx--) {
        mixin = {};
        mixin[aliases[idx]] = value;
        mix(mixin).into(template);
      }
      return value;
    };

    return target;
  }

}).into(Espresso);
mix(/** @scope Espresso */{

  /**
    If the attribute being mixed in exists on the
    Object being mixed in, the object marked as
    inferior will **not** be mixed in. If the base
    object is inferior, it will be overriden.

    @param {Object} target The target to apply the decorator to.
    @param {Object|Function} [condition] If it returns `true`,
      the function is inferior. Otherwise, it isn't.
    @returns {Function} The reciever.
   */
  inferior: function (target, condition) {
    var isInferior = arguments.length === 2 ?
      (Espresso.isCallable(condition) ? condition() : condition) : true;
    if (!isInferior) { return target; }

    target._ = target._ || {};
    target.isInferior = true;

    /** @ignore */
    target._.inferior = function (template, value, key) {
      return (!template[key] || template[key].isInferior) ? value: template[key];
    };

    return target;
  }

}).into(Espresso);
mix(/** @scope Espresso */{

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
          pull: Espresso.refine(function (original) {
            var espresso = original();
            return espresso + milk;
          })
        }).into(Espresso);

    Provide arguments as-is, omit arguments, or add arguments
    to the function. It'll be just like it's being called normally.

    NOTE: If you try to rebind the property using
          {@link Function#bind}, it will _not_ work.

    @param {Function} target The target to apply this decorator to.
    @returns {Function} The reciever.
   */
  refine: function (target) {
    if (!Espresso.isCallable(target)) return target;

    target._ = target._ || {};

    var empty = function () {};

    /** @ignore */
    target._.refine = function (template, value, key) {
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
    return target;
  }

}).into(Espresso);
/*globals mix Espresso */

mix(/** @lends Function.prototype */{

  /** @function
    @desc
    Bind the value of `this` on a function before hand,
    with any extra arguments being passed in as initial
    arguments.

    This implementation conforms to the ECMAScript 5
    standard.

        var barista = function (tpl) {
          alert(tpl.format(this));
          return arguments.callee.bind(this, "Order up! Your {} is ready!");
        };

        orderUp = barista.call("espresso", "I would like an {}");
        // -> "I would like an espresso."

        orderUp();
        // -> "Order up! Your espresso is ready!"

    @param {Object} thisArg The value to bind `this` to on the function.
    @returns {Function} The function passed in, wrapped to ensure `this`
      is the correct scope.
   */
  bind: Espresso.inferior(function (self) {
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

        // 1. Let the target be the value of F's [[TargetFunction]] internal property.
        // 2. If target has no [[Construct]] internal method, a TypeError exception is thrown.
        // 3. Let boundArgs be the value of F's [[BoundArgs]] internal property.
        // 4. Left args be a new list containing the same values as the list boundArgs in the same order followed by the same values as the list ExtraArgs in the same order.
        // 5. Return the result of calling the [[Construct]] internal method of target providing args as the arguments.
        var Type = function () {}, that;
        Type.prototype = Target.prototype;
        that = new Type();

        Target.apply(that, A.concat(Espresso.A(arguments)));
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
  })

}).into(Function.prototype);
/*globals Espresso mix */

/** @namespace
  This mixin defines an enumerable interface that is
  based off of the ECMAScript 5 specification.

  If any of the functions on this interface are defined
  by the host object, they will *not* be applied, with the
  assumption that the host object has a better implementation
  and the same characteristics.

  @requires `forEach`- the enumerator over the collection.
 */
Espresso.Enumerable = /** @lends Espresso.Enumerable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isEnumerable: true,

  /** @function
    @desc
    Iterates over each item on the Enumerable.

    The Function `forEach` should follow the specification as
    defined in the ECMAScript 5 standard. All function using
    `forEach` in the Enumerable mixin depend on it being this way.

    @param {Function} lambda The callback to call for each element.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: Espresso.inferior(function (lambda, that) {
    throw new Error("You MUST override Espresso.Enumerable.forEach to be able " +
                    "to use the Enumerable mixin.");
  }),

  /** @function
    @desc
    Returns an array where each value on the enumerable
    is mutated by the lambda function.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Array} The collection of results from the map function.
    @example
      var cube = function (n) { return n * n * n };
      alert([1, 2, 3, 4].map(cube));
      // -> [1, 8, 27, 64]
   */
  map: Espresso.inferior(function (lambda, self) {
    var arr = [];

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    this.forEach(function (k, v) {
      arr.push(lambda.call(self, k, v, this));
    }, this);
    return arr;
  }),

  /** @function
    @desc
    Reduce the content of an enumerable down to a single value.

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
    @example
      var range = mix(Espresso.Enumerable, {
        begin: 0,
        end: 0,

        forEach: function (lambda, self) {
          var i = 0;
          for (var v = this.begin; v <= this.end; v++) {
            lambda.call(self, v, i++, this);
          }
        },

        create: function (begin, end) {
          return mix(this, { begin: begin, end: end }).into({});
        }
      }).into({});

      var multiply = function (a, b) { return a * b; };
      var factorial = function (n) {
        return range.create(1, n).reduce(multiply);
      }

      alert("5! is {}".format(factorial(5)));
      alert("120! is {}".format(factorial(120)));
   */
  reduce: Espresso.inferior(function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        self = this;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    this.forEach(function (v, k) {
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, k, self);
      }
    });

    // 5. If len is 0 and seed is not present, throw a TypeError exception.
    if (shouldSeed) {
      throw new TypeError("There was nothing to reduce!");
    }
    return seed;
  }),

  /** @function
    @desc
    Returns all elements on the Enumerable for which the
    input function returns true for.

    @param {Function} lambda The function to filter the Enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Object[]} An array with the values for which `lambda` returns `true`
   */
  filter: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (seive, v, k, t) {
      if (lambda.call(self, v, k, t)) {
        seive.push(v);
      }
      return seive;
    }, []);
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for every element
    in the Enumerable, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` for every iteration.
  */
  every: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every && lambda.call(self, v, k, t);
    }, true);
  }),

  /** @function
    @desc
    Returns `true` if `lambda` returns `true` for at least one
    element in the Enumerable, otherwise, it returns `false`.

    @param {Function} lambda The lambda that transforms an element in the enumerable.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [self] The value of `this` inside the lambda.
    @returns {Boolean} `true` if `lambda` returns `true` at least once.
   */
  some: Espresso.inferior(function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every || lambda.call(self, v, k, t);
    }, false);
  })

};
/*global mix Espresso */

/** @namespace
  Implements the Observer / Publish-Subscribe pattern.

  Subscribe to events that are published to objects that
  mixin this, and you'll be notified when the events come
  in. If something is published and there are no handlers
  for that specific event, there is a `unpublishedEvent`
  function that will be called whenever an event doesn't
  have any subscribers.

  Publishing an event will use the first argument as the
  event to trigger, and call all the subscription handlers
  with all of the arguments passed into that `publish`.

  Subscribing to an event requires the event that it would
  like to recieve events from and the callback at minimum.

  If extra configuration is wanted, the `options` hash
  provides a way to dynamically have events delivered or
  ignored beforehand (possibly providing lint-checking before
  the event is delivered), and whether the event should
  be delivered synchronously or asynchronously. (By default,
  it's asynchronous).

  @example
      var Clock = mix(Espresso.Subscribable, {
        tick: function () {
          this.time = Date.now();
        }
      }).into({});

      Clock.subscribe("tick", Clock.tick);
      setInterval(Clock.publish.bind(Clock, "tick"), 1000);

 */
Espresso.Subscribable = /** @lends Espresso.Subscribable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isSubscribable: true,

  /** @private */
  __subscriptions__: null,

  /**
    Subscribe to an event.

    @param {Object} event The event to subscribe to.
    @param {Function} handler The handler to call when the event is published.
    @param {Object} [options] Optional parameters.
      @param {Boolean} [options.synchronous] Whether the handler should be called synchronously or not. Defaults to asynchronous calls.
      @param {Function} [options.condition] A mechanism to refine whether a specific event is wanted. Return true if you would like the event, and false if you don't.
    @returns {Object} The reciever.
   */
  subscribe: function (event, handler, options) {
    if (!Espresso.isCallable(handler)) {
      throw new TypeError("{} is not callable.".format(handler));
    }

    var subscriptions = this.__subscriptions__ || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }

    if (options && options.condition && !Espresso.isCallable(options.condition)) {
      delete options.condition;
    }

    options = mix({
      condition: Espresso.inferior(function () { return true; })
    }).into(options || {});

    subscriptions[event].push(mix(options, {
      subscriber: handler
    }).into({}));

    this.__subscriptions__ = subscriptions;
    return this;
  },

  /**
    Unsubscribe from an event.

    @param {Object} event The event to subscribe to.
    @param {Function} handler The handler to call when the event is published.
    @returns {Object} The reciever.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this.__subscriptions__, handlers, i, len;
    if (subscriptions && subscriptions[event]) {
      handlers = subscriptions[event];
      for (i = 0, len = handlers.length; i < len; i += 1) {
        if (handlers[i].subscriber === handler) {
          subscriptions[event].splice(i, 1);
          break;
        }
      }
    }
    return this;
  },

  /**
    Gets called when an event has no subscribers to it.

    Override to handle the case when nothing is published.
    (There are no subscribers for an event.)

    Any parameters passed to the event are also passed into
    the function. All unpublished events are invoked immediately
    rather than `defer`red.

    @param {Object} event The event that was ignored.
    @returns {void}
   */
  unpublishedEvent: function (event) {},

  /**
    Publish an event, passing all arguments along to the subscribed functions.

    @param {Object} event The event to publish.
    @returns {Object} The reciever.
   */
  publish: function (event) {
    var subscriptions = this.__subscriptions__,
        args = arguments, subscriber, published = false;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        if (subscription.condition.apply(this, args)) {
          subscriber = subscription.subscriber;
          if (subscription.synchronous) {
            subscriber.apply(this, args);
          } else {
            Espresso.defer(subscriber, args, this);
          }
          published = true;
        }
      }, this);
    }
    if (!published && Espresso.isCallable(this.unpublishedEvent)) {
      this.unpublishedEvent.apply(this, arguments);
    }
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
/*globals Espresso */
/** @namespace

  [Key-Value Observing][kvo] (KVO) is a mechanism that allows
  objects to be notified of changes to specified properties of
  other Objects. It is based off of the observer pattern, which
  in turn is built on top of the Publish-Subscribe pattern.

  KVO is used on top of {@link Espresso.Subscribable} for notifying
  observers that a change occured.

  To understand Key-Value coding, you must understand property
  paths first. This simply means that you need to understand
  the Object model of the object that you are doing a `get` or
  `set` on. Take the following example:

      var Beatles = mix(Espresso.Observable).into({
        Paul: {
          instruments: ['vocals', 'bass', 'guitar', 'piano',
                        'keyboards', 'drums', 'ukelele',
                        'mandolin']
        },
        John: {
          instruments: ['vocals', 'guitar', 'piano', 'banjo',
                        'harmonica', 'mellotron',
                        'six-string bass', 'percussion']
        },
        Ringo: {
          instruments: ['drums', 'vocals', 'percussion',
                        'tambourine']
        },
        George: {
          instruments: ['guitar', 'vocals', 'bass', 'keyboards',
                        'ukelele', 'mandolin', 'sitar', 'tambura',
                        'sarod', 'swarmandal']
        }
      });

      Beatles.initObservable();
      alert(Beatles.getPath('Paul.instruments[0]'));
      // => 'vocals'

  Using `get` provides optimizations such as caching on an Object.

  Using `set` provides notifications to observing functions /
  properties.

  The Observable mixin provides the ability to have dynamically computed
  properties via the `property` decorator on functions and the
  ability to intercept `get`s or `set`s to unknown properties via
  `unknownProperty`.

  Computed properties are simply a function that takes 2 arguments,
  the key and the value of the property that triggered the function
  call. These properties may also have dependent keys. When a
  property has dependent keys, every single time a dependent key
  gets `set`, the property will get recomputed.

  Consider the following:

      var Box = mix(Espresso.Observable).into({
        width: 0,
        height: 0,
        depth: 0,

        volume: Espresso.property(function () {
          return this.get('width') * this.get('height') * this.get('depth');
        }, 'width', 'height', 'depth').cacheable()
      });

  The `volume` property will get recomputed every single time the
  `width`, `height`, or `depth` values change. If you had another
  object that you would like to monitor the changes, perhaps a
  renderer, you could attach observers to each of the properties
  by subscribing to the property path (via
  {@link Espresso.Subscribable#subscribe}), providing any property paths
  that you would like to be notified on.

    [kvo]: http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html

  @extends Espresso.Subscribable
 */
Espresso.Observable = mix(Espresso.Subscribable).into(/** @lends Espresso.Observable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isObservable: true,

  /**
    Initialize the observer. This needs to be explicitly
    called to activate property observing.

    When creating your base object for your library, you
    should use the following boilerplate to make property
    observing automatically initialize (with the following
    boilerplate assuming your constructor is called `init`):

        mix({
          init: Espresso.refine(function (original) {
            this.initObservable();
            return original.apply(null, Espresso.A(arguments).slice(1));
          })
        }).into(Espresso.Observable);

    @returns {void}
   */
  initObservable: function () {
    if (this.__isObservableInitialized__) { return; }
    this.__isObservableInitialized__ = true;

    var key, property, i = 0, len, dependents, meta = this.__espmeta__,
        dependent, iDependent, object, notifier;

    /** @ignore */
    notifier = function (key) {
      this.set(key);
    };

    for (key in meta) { // Iterate over all keys
      if (meta.hasOwnProperty(key) && meta[key].referenceKey) {
        property = this[key];

        if (Espresso.isCallable(property) &&
            property.isProperty && property.dependentKeys) {

          dependents = property.dependentKeys;
          len = dependents.length;
          for (i = 0; i < len; i += 1) {
            dependent = dependents[i];
            object = this;

            // If it's a property path, follow the chain.
            if (dependent.indexOf('.') !== -1) {
              iDependent = dependent.lastIndexOf('.');
              object = Espresso.getObjectFor(dependent.slice(0, iDependent));
              dependent = dependent.slice(iDependent + 1);
            }

            // Subscribe to the events.
            if (object && object.isObservable && object.isSubscribable) {
              object.subscribe(dependent, notifier.bind(this, key), { synchronous: true });
            }
          }
        }
      }
    }
  },

  /**
    Get a value on an object that is a property path.

    This function will return the value given the
    property path using `get` when necessary.

    This means you should write:

        zombie.getPath('brain.isDelicious');

    instead of:

        zombie.get('brain.isDelicious');

    @param {String} key The property path to lookup on the object.
    @returns {Object} The value of the key.
   */
  getPath: function (k) {
    k = k.toString();

    var result = this, key = k, idx;
    while (result != null && k.length > 0) {
      idx = k.indexOf('.');
      key = (idx === -1) ? k : k.slice(0, idx);
      k = (idx === -1) ? "" : k.slice(idx + 1);
      result = result.get ? result.get(key) : result[key];
    }
    return result;
  },

  /**
    Get a value on an object.

    Use this instead of subscript (`[]`) or dot notation
    for public variables. Otherwise, you won't reap benefits
    of being notified when they are set, or if the property
    is computed.

    Get is tolerant of when trying to access objects that
    don't exist- it will return undefined in that case.

    @param {String} key The key to lookup on the object.
    @returns {Object} The value of the key.
   */
  get: function (k) {
    k = k.toString();
    var object = this, value, info, refKey;

    // Retrieve metadata about this property
    info = this.__espmeta__ ? this.__espmeta__[k] : null;
    refKey = k;
    if (info) {
      if (info.closureKey) {
        k = info.closureKey;
      }

      if (info.referenceKey && info.isComputed) {
        refKey = info.referenceKey;
      }
    }

    value = object[k];
    // Deal with properties
    if (value && value.isProperty) {
      // If the value of the property is cached,
      // retrieve it from the cache and return it.
      if (value.isCacheable) {
        object.__cache__ = object.__cache__ || {};
        if (!object.__cache__.hasOwnProperty(k)) {
          object.__cache__[k] = value.call(object, refKey);
        }
        value = object.__cache__[k];

      // Otherwise, we need to retrieve the value
      } else {
        value = value.call(object, refKey);
      }

    // Unknown properties
    } else if (typeof value === "undefined") {
      value = object.unknownProperty(k);
    }
    return value;
  },

  /**
    Set a value that is a property path.

    This function will return the value given the
    property path using `set` and `get` when necessary.

    This means you should write:

        zombie.setPath('brain.isDelicious', true);

    instead of:

        zombie.set('brain.isDelicious', true);

    @param {String} key The property path to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  setPath: function (k, v) {
    k = k.toString();

    var idx = k.lastIndexOf('.'),
        object = idx === -1 ? this : this.getPath(k.slice(0, idx));

    if (idx !== -1) k = k.slice(idx + 1);
    object && object.set ? object.set(k, v) : object[k] = v;
    return this;
  },

  /**
    Set a value on an object.

    Use this instead of subscript (`[]`) or dot notation
    for public variables. Otherwise, you won't reap benefits
    of being notified when they are set, or if the property
    is computed.

    Set is tolerant of when trying to access objects that
    don't exist- it will ignore your attempt in that case.

    @param {String} key The key to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  set: function (k, v) {
    k = k.toString();

    var property, key = k, value = v, idx = key.lastIndexOf('.'), object = this,
        result, didChange = false, info, refKey, isComputed = false;

    // Retrieve metadata about this property
    info = this.__espmeta__ ? this.__espmeta__[k] : null;
    refKey = key;
    if (info) {
      if (info.closureKey) {
        key = info.closureKey;
      }

      if (info.referenceKey) {
        refKey = info.referenceKey;
      }
      isComputed = info.isComputed;
    }

    property = object[key];

    // Properties first.
    if (property && property.isProperty) {
      // If setting it multiple times with the same
      // value does nothing, check to see if we should
      // set it again.
      if (property.isIdempotent) {
        object.__value__ = object.__value__ || {};
        if (object.__value__[key] !== value) {
          result = property.call(object, refKey, value);
          didChange = true;
        }
        object.__value__[key] = value;

      // Otherwise, call the property with the key and value.
      } else {
        result = property.call(object, refKey, value);
        didChange = true;
      }

      // Cache the new return from the function
      // so we don't have to waste another lookup later.
      if (property.isCacheable && didChange) {
        object.__cache__ = object.__cache__ || {};
        object.__cache__[key] = result;
      }

    // Unknown property
    } else if (typeof property === "undefined") {
      this.unknownProperty(k, v);

    // Simply set it (taking into account computed ECMAScript5 properties).
    } else {
      object[isComputed ? refKey : key] = value;
    }

    // Expected behaviour is strange unless publishes
    // are done immediately.
    if (object.publish && !(property && property.isIdempotent && !didChange)) {
      object.publish(refKey, value);
    }

    return this;
  },

  /**
    Called whenever you try to get or set a nonexistent
    property.

    This is a generic property that you can override to
    intercept general gets and sets, making use out of them.

    @param {String} key The unknown key that was looked up.
    @param {Object} [value] The value to set the key to.
    @returns {Object} The value of the key.
   */
  unknownProperty: function (key, value) {
    if (arguments.length === 2) {
      var parts = key.split('.'), part, root = this,
          len = parts.length - 1, i = 0, o;
      for (; i < len; i++) {
        part = parts[i];
        o = root.get ? root.get(part) : Espresso.getObjectFor(part, root);

        // Don't mess with existing objects.
        if (typeof o !== "undefined") {
          root = o;

        // Create new Objects when they don't exist
        } else {
          root[part] = {};
          root = root[part];
        }
      }

      part = parts[len];
      if (root[part] != null && root.set) {
        root.set(part, value);
      } else {
        root[part] = value;
      }
    }
    return Espresso.getObjectFor(key, this);
  }

});
/** @namespace
  A mixin to apply to callable objects that
  want to be a computed property. This means
  that the property will act like a getter /
  setter, but with notifications via KVO.
 */
Espresso.Property = /** @lends Espresso.Property# */{

  /**
    Walk like a duck.
    @type Boolean
    @default true
   */
  isProperty: true,

  /**
    Whether or not the property should be
    cached when it gets recalculated.
    @type Boolean
    @default false
   */
  isCacheable: false,

  /**
    Whether the property is volatile or not.
    Defaults to being a volatile property.
    @type Boolean
    @default false
   */
  isIdempotent: false,

  /**
    The keys that this property depends on.
    If any of these keys change, the property
    should be notified it did so.
    @type Array
   */
  dependentKeys: null,

  /**
    Marks the property as cacheable.
    @returns {Espresso.Property} The property.
   */
   cacheable: function () {
     this.isCacheable = true;
     return this;
   },

  /**
    Marks the property as idempotent.
    @returns {Espresso.Property} The property.
   */
   idempotent: function () {
     this.isIdempotent = true;
     return this;
   }
};
/*globals mix Espresso */

/** @name Array
  @namespace

  Shim for the native Array object.

  @extends Espresso.Enumerable
 */
mix(/** @scope Array */{

  /** @function
    @desc
    Checks whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: Espresso.inferior(function () {
    var toString = Object.prototype.toString;
    return function (obj) {
      return toString.call(obj) === '[object Array]';
    };
  }())

}).into(Array);

mix(Espresso.Enumerable, /** @scope Array.prototype */{

  /** @function
    @desc
    Iterator over the Array.

    Implemented to be in conformance with ECMA-262 Edition 5,
    so you will use the native `forEach` where it exists.

    @param {Function} lambda The callback to call for each element.
    @param {Object} [self] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: Espresso.inferior(function (lambda, self) {
    // 3. Let len be ToUint32(lenValue).
    var len = this.length,
    // 6. Let k be 0.
        k = 0;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    // 7. Repeat, while k < len
    while (k < len) {
      // c. If kPresent is true, then
      if (this.hasOwnProperty(k)) {
        //  i. Let kValue be the result of calling the [[Get]]
        //     internal method of O with argument Pk.
        // ii. Call the [[Call]] internal method of lambda
        //     with T as the this value and argument list
        //     containing kValue, k, and O.
        lambda.call(self, this[k], k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }),

  /** @function
    @desc
    Shim for `indexOf`.

    @param {Object} o The object to test.
    @param {Number} [fromIndex] The index to start looking at for the element.
    @returns {Number} The first index of an item (or -1 if no matching item was found).
   */
  indexOf: Espresso.inferior(function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
      Math.max(i, len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o === this[i]) {
        return i;
      }
    }
    return -1;
  }),

  /** @function
    @desc
    Reduce the content of an array down to a single
    value (starting from the end and working backwards).

    @param {Function} lambda The lambda that performs the reduction.
      @param {Object} lambda.value The value of the enumerated item.
      @param {Object} lambda.key The key of the enumerated item.
      @param {Object} lambda.self The object being enumerated over.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
   */
  reduceRight: Espresso.inferior(function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        len = this.length, v;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".format(lambda));
    }

    while (len-- > 0) {
      v = this[len];
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, len, this);
      }
    }

    // 5. If len is 0 and seed is not present, throw a TypeError exception.
    if (shouldSeed) {
      throw new TypeError("There was nothing to reduce!");
    }
    return seed;
  }),

  /** @function
    @desc
    Shim for `reverse`.
    Note: the Array is reversed in-place.

    @returns {Array} The array in reverse order.
   */
  reverse: Espresso.inferior(function () {
    var O, len, middle,
        lower, upper,
        lowerP, upperP,
        upperValue, lowerValue;

    // 1. Let O be the result of calling ToObject
    //    passing this value as the argument.
    O = this;

    // 3. Let len be ToUint(lenVal)
    len = this.length;

    // 4. Let middle be floor(len/2)
    middle = Math.floor(len / 2);

    // 5. Let lower be 0.
    lower = 0;

    // 6. Repeat, while lower !== middle
    while (lower !== middle) {
      // a. Let upper be len - lower - 1.
      upper = len - lower - 1;

      // b. Let upperP be ToString(upper).
      upperP = upper.toString();

      // c. Let lowerP be ToString(lower).
      lowerP = lower.toString();

      // d. Let lowerValue be the result of calling the [[Get]]
      //    intenal method of O with argument lowerP
      lowerValue = this[lowerP];
      
      // e. Let upperValue be the result of calling the [[Get]]
      //    intenal method of O with argument upperP
      upperValue = this[upperP];

      // h. If lowerExists is true and upperExists is true, then
      //     i. Call the [[Put]] internal method of O with arguments
      //        lowerP, upperValue, and true.
      //     i. Call the [[Put]] internal method of O with arguments
      //        upperP, lowerValue, and true.
      O[lowerP] = upperValue;
      O[upperP] = lowerValue;

      // l. Increase lower by 1.
      lower += 1;
    }

    // 7. Return 0.
    return O;
  }),

  /** @function
    @desc
    Shim for `lastIndexOf`.

    @param searchElement The item to look for.
    @param [fromIndex] The index to begin searching from.
    @returns {Number} The last index of an item (or -1 if not found).
   */
  lastIndexOf: Espresso.inferior(function (searchElement, fromIndex) {
    var k = 0, len = this.length, n;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed, let n be
    //    ToInteger(fromIndex); else let n be len.
    n = fromIndex || len;

    // 6. If n >= 0, then let k be min(n, len - 1).
    if (n > 0) {
      k = Math.min(n, len - 1);

    // 7. Else, n < 0
    } else {
      // a. Let k be len - abs(n).
      k = len - Math.abs(n);
    }

    // 8. Repeat, while k >= 0
    while (k >= 0) {
      // a. Let kPresent be the result of calling the [[HasProperty]]
      //    internal method of O with argument toString(k).
      // b. If kPresent is true, then
        //   i. Let elementK be the result of calling the [[Get]]
        //      internal method of O with the argument toString(k).
        //  ii. Let same be the result of applying the
        //      Strict Equality Comparision Algorithm to
        //      searchElement and elementK.
        // iii. If same is true, return k.
      if (this[k.toString()] === searchElement) {
        return k;
      }

      // c. Decrease k by 1.
      k -= 1;
    }
    return -1;
  })

}).into(Array.prototype);
/*globals mix Espresso */

mix(/** @scope String.prototype */{

  /** @function
    @desc
    Returns the string repeated the specified number of times.

    @param {Number} n The number of times to repeat this string.
    @returns {String} The string repeated n times.
    @example
      alert("Stop hittin' yourself. ".repeat(50));
   */
  repeat: Espresso.inferior(function (n) {
    return n < 1 ? '': (new Array(n)).join(this + '') + this;
  }),

  /** @function
    @desc
    Trim leading and trailing whitespace.

    @returns {String} The string with leading and trailing whitespace removed.
    @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
    @see <a href="http://jsperf.com/mega-trim-test">Mega Trim Test</a>
   */
  trim: Espresso.inferior(function () {
   var s = this.match(/\S+(?:\s+\S+)*/);
   return s ? s[0] : '';
  }),

  /** @function
    @desc
    Format formats a string in the vein of Python's format,
    Ruby #{templates}, and .NET String.Format.

    To write { or } in your Strings, just double them, and
    you'll end up with a single one.

    If you have more than one argument, then you can reference
    by the argument number (which is optional on a single argument).

    If you want to tie into this, and want to specify your own
    format specifier, override toFormat on your object, and it will
    pass you in the specifier (after the colon). You return the
    string it should look like, and that's it!

    For an example of an formatting extension, look at the Date mix.
    It implements the Ruby/Python formatting specification for Dates.

    @returns {String} The formatted string.
    @example
      alert("b{0}{0}a".format('an'));
      // => "banana"

    @example
      alert("I love {pi:.{precision}}".format({ pi: 22 / 7, precision: 2 }));
      // => "I love 3.14"

    @example
      alert("The {thing.name} is {thing.desc}.".format({
        thing: {
          name: 'cake',
          desc: 'a lie'
        }
      }));
      // => "The cake is a lie."

    @example
      alert(":-{{".format());  // Double {{ or }} to escape it.
      // => ":-{"
   */
  format: Espresso.inferior(function () {
    return Espresso.vformat(this, Espresso.A(arguments));
  }),

  /** @function
    @desc
    Formatter for `String`s.

    Don't call this function- It's here for `Espresso.format`
    to take care of buisiness for you.

    @param {String} spec The specifier string.
    @returns {String} The string formatted using the format specifier.
   */
  toFormat: Espresso.inferior(function (spec) {
    var match = spec.match(Espresso.FORMAT_SPECIFIER),
        align = match[1],
        fill = match[2] || ' ',
        minWidth = match[6] || 0,
        maxWidth = match[7] || null, len, before, after, value,
        length = this.length;

    if (align) {
      align = align.slice(-1);
    }

    len = Math.max(minWidth, length);
    before = len - length;
    after = 0;

    switch (align) {
    case '<':
      after = before;
      before = 0;
      break;
    case '^':
      after = Math.ceil(before / 2);
      before = Math.floor(before / 2);
      break;
    }

    value = this;
    if (maxWidth != null) {
      maxWidth = +maxWidth.slice(1);
      value = isNaN(maxWidth) ? value : value.slice(0, maxWidth);
    }

    return fill.repeat(before) + value + fill.repeat(after);
  })

}).into(String.prototype);
/*globals Espresso */

(function ()/** @lends Espresso */{
  mix({
    /**
      Advanced String Formatting borrowed from the eponymous Python PEP.

      The formatter follows the rules of Python [PEP 3101][pep]
      (Advanced String Formatting) and following the ECMAScript
      Harmony strawman specification for string formatting
      (found [here][strawman]).

      To use literal object notation, just pass in one argument for
      the formatter. This is optional however, as you can always
      absolutely name the arguments via the number in the argument
      list. This means that:

          alert(Espresso.format("Hello, {name}!", { name: "world" }));

      is equivalent to:

          alert(Espresso.format("Hello, {0.name}!", { name: "world" }));

      For more than one argument you must provide the position of your
      argument.

          alert(Espresso.format("{0}, {1}!", "hello", "world"));

      If your arguments and formatter are "as is"- that is, in order,
      and flat objects as you intend them to be, you can write your
      template string like so:

          alert(Espresso.format("{}, {}!", "hello", "world"));

      To use the literals `{` and `}`, simply double them, like the following:

          alert(Espresso.format("{lang} uses the {{variable}} format too!", {
             lang: "Python", variable: "(not used)"
          }));
          // => "Python uses the {variable} format too!"

      Check out the examples given for some ideas on how to use it.

      The formatting API uses the special `toFormat` function on an
      object to handle the interpretation of the format specifiers.

      The default `toFormat` handler is on `Object.prototype`.

      For an example of a specialized format schema, consider the
      following example:

          Localizer = mix({
            toFormat: function (spec) {
              return this[spec];
            }
          }).into({});

          _hello = mix(Localizer).into({
            en: 'hello',
            fr: 'bonjour',
            ja: 'こんにちは'
          });

          alert(Espresso.format("{:en}", _hello));
          // => "hello"

          alert(Espresso.format("{:fr}", _hello));
          // => "bonjour"

          alert(Espresso.format("{:ja}", _hello));
          // => "こんにちは"

        [pep]: http://www.python.org/dev/peps/pep-3101/
        [strawman]: http://wiki.ecmascript.org/doku.php?id=strawman:string_format_take_two

      @param {String} template The template string to format the arguments with.
      @returns {String} The template formatted with the given leftover arguments.
     */
    format: function (template) {
      return format(template, Espresso.A(arguments).slice(1));
    },

    /**
      Same as {@link Espresso.format}, but with an explicit argument list.

      @param {String} template The template string to format the argument list with.
      @param {Array} argList The argument list to format.
      @returns {String} The template formatted with the given leftover arguments.
      @see Espresso.format
     */
    vformat: function (template, args) {
      return format(template, args);
    },

    /**
      The specifier regular expression.

      The groups are:

        `[[fill]align][sign][#][0][minimumwidth][.precision][type]`

      The brackets (`[]`) indicates an optional element.

      The `fill` is the character to fill the rest of the minimum width
      of the string.

      The `align` is one of:

        - `^` Forces the field to be centered within the available space.
        - `<` Forces the field to be left-aligned within the available
              space. This is the default.
        - `>` Forces the field to be right-aligned within the available space.
        - `=` Forces the padding to be placed after the sign (if any)
              but before the digits. This alignment option is only valid
              for numeric types.

      Unless the minimum field width is defined, the field width
      will always be the same size as the data to fill it, so that
      the alignment option has no meaning in this case.

      The `sign` is only valid for numeric types, and can be one of
      the following:

        - `+` Indicates that a sign shoulb be used for both positive
              as well as negative numbers.
        - `-` Indicates that a sign shoulb be used only for as negative
              numbers. This is the default.
        - ` ` Indicates that a leading space should be used on positive
              numbers.

      If the `#` character is present, integers use the 'alternate form'
      for formatting. This means that binary, octal, and hexadecimal
      output will be prefixed with '0b', '0o', and '0x', respectively.

      `width` is a decimal integer defining the minimum field width. If
      not specified, then the field width will be determined by the
      content.

      If the width field is preceded by a zero (`0`) character, this enables
      zero-padding. This is equivalent to an alignment type of `=` and a
      fill character of `0`.

      The 'precision' is a decimal number indicating how many digits
      should be displayed after the decimal point in a floating point
      conversion. For non-numeric types the field indicates the maximum
      field size- in other words, how many characters will be used from
      the field content. The precision is ignored for integer conversions.

      Finally, the 'type' determines how the data should be presented.

      The available integer presentation types are:

        - `b` Binary. Outputs the number in base 2.
        - `c` Character. Converts the integer to the corresponding
              Unicode character before printing.
        - `d` Decimal Integer. Outputs the number in base 10.
        - `o` Octal format. Outputs the number in base 8.
        - `x` Hex format. Outputs the number in base 16, using lower-
              case letters for the digits above 9.
        - `X` Hex format. Outputs the number in base 16, using upper-
              case letters for the digits above 9.
        - `n` Number. This is the same as `d`, except that it uses the
              current locale setting to insert the appropriate
              number separator characters.
        - ` ` (None) the same as `d`

      The available floating point presentation types are:

        - `e` Exponent notation. Prints the number in scientific
              notation using the letter `e` to indicate the exponent.
        - `E` Exponent notation. Same as `e` except it converts the
              number to uppercase.
        - `f` Fixed point. Displays the number as a fixed-point
              number.
        - `F` Fixed point. Same as `f` except it converts the number
              to uppercase.
        - `g` General format. This prints the number as a fixed-point
              number, unless the number is too large, in which case
              it switches to `e` exponent notation.
        - `G` General format. Same as `g` except switches to `E`
              if the number gets to large.
        - `n` Number. This is the same as `g`, except that it uses the
              current locale setting to insert the appropriate
              number separator characters.
        - `%` Percentage. Multiplies the number by 100 and displays
              in fixed (`f`) format, followed by a percent sign.
        - ` ` (None) similar to `g`, except that it prints at least one
              digit after the decimal point.

      @type RegExp
     */
    FORMAT_SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(\.\d+)?([bcoxXeEfFG%ngd])?/
  }).into(Espresso);

  // Error strings.
  var error = "Unmatched {} brace for '{{}}'.",
      unmatchedOpening = error.format('opening'),
      unmatchedClosing = error.format('closing'),
      openingBrace = '{',
      closingBrace = '}',
      specifierSeparator = ':';

  /** @ignore */  // Docs are above
  function format(template, args) {
    var prev = '', ch,
        buffer = [],
        result, idx = 0,
        len = template.length;

    for (; idx < len; idx++) {
      ch = template.charAt(idx);

      if (prev === closingBrace) {
        if (ch !== closingBrace) {
          throw new Error(unmatchedClosing.format(template.slice(0, idx)));

        // Double-escaped closing brace.
        } else {
          buffer[buffer.length] = closingBrace;
          prev = '';
          continue;
        }
      }

      // Begin template parsing
      if (ch === openingBrace) {
        result = parseField(template.slice(idx + 1), args);
        buffer[buffer.length] = result[1];
        idx += result[0]; // continue after the template.

      // Normal string processing
      } else if (ch !== closingBrace) {
        buffer[buffer.length] = ch;
      }
      prev = ch;
    }
    return buffer.join('');
  }

  /** @ignore
    Parses the template with the arguments provided,
    parsing any nested templates.

    @param {String} template The template string to format.
    @param {Array} args The arguments to parse the template string.
    @returns {Array} A tuple with the length it ate up and the formatted template.
   */
  function parseField(template, args) {
    var idx = 0, ch, len = template.length,
        inSpecifier = false, iBrace = 0;
    for (; idx < len; idx++) {
      ch = template.charAt(idx);
      if (!inSpecifier) {
        if (ch === specifierSeparator) {
          inSpecifier = true;
          continue;
        }

        // Double-escaped opening brace
        if (ch === openingBrace) {
          if (idx === 0) {
            return [1, openingBrace];
          } else {
            throw new Error(unmatchedOpening.format(template.slice(0, idx)));
          }

        // Done formatting.
        } else if (ch === closingBrace) {
          return [idx + 1, formatField(template.slice(0, idx), args)];
        }

      // Format the template's specifier *after* the whole specifier is found.
      } else {
        if (ch === openingBrace) {
          iBrace++;
        } else if (ch === closingBrace) {
          iBrace--;
        }

        // Spec is done.
        if (iBrace === -1) {
          return [idx + 1, formatField(format(template.slice(0, idx), args), args)];
        }
      }
    }
    throw new Error(unmatchedOpening.format(template));
  }

  /** @ignore
    Returns the value of the template string formatted with the
    given arguments.

    @param {String} value The template string and format specifier.
    @param {Array} args An Array of arguments to use to format the template string.
    @returns {String} The formatted template.
   */
  function formatField(value, args) {
    var iSpec = value.indexOf(specifierSeparator),
        spec, res;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    // Got `{}`; shift off the first argument passed in.
    if (value === '') {
      res = args.shift();

    // Return the object referenced by the property path given.
    } else {
      res = Espresso.getObjectFor(value, args);

      // Allow for references to object literals
      if (typeof res === "undefined" &&
          Array.isArray(args) && args.length === 1 && Espresso.hasValue(args[0])) {
        res = args[0].getPath ? args[0].getPath(value) : Espresso.getObjectFor(value, args[0]);
      }
    }

    if (!spec) {
      return res;
    }

    return res != null && res.toFormat ? res.toFormat(spec) : String(res).toFormat(spec);
  }
}());
/*globals mix Espresso */

mix(/** @lends Number# */{

  /** @function
    @desc
    Formatter for `Number`s.

    @param {String} spec The specifier to format the number as.
    @returns {String} The number formatted as specified.
   */
  toFormat: Espresso.inferior(function (spec) {
    var value = this;

    // Don't want Infinity, -Infinity and NaN in here!
    if (!isFinite(value)) {
      return value;
    }

    var match = spec.match(Espresso.FORMAT_SPECIFIER),
        align = match[1],
        fill = match[2],
        sign = match[3] || '-',
        base = !!match[4],
        minWidth = match[6] || 0,
        maxWidth = match[7],
        type = match[8], precision;

    // Constants
    var emptyString = '',
        plus = '+',
        minus = '-';

    if (align) {
      align = align.slice(-1);
    }

    if (!fill && !!match[5]) {
      fill = '0';
      if (!align) {
        align = '=';
      }
    }

    precision = maxWidth && +maxWidth.slice(1);

    switch (sign) {
    case plus:
      sign = (value >= 0) ? plus: minus;
      break;
    case minus:
      sign = (value >= 0) ? emptyString: minus;
      break;
    case ' ':
      sign = (value >= 0) ? ' ': minus;
      break;
    default:
      sign = emptyString;
    }

    if (precision != null && precision !== "" && !isNaN(precision)) {
      // Opting to go with a more intuitive approach than Python...
      //  >>> "{.2}".format(math.pi)
      //  "3.1"
      // Which is waaay less intuitive than
      //  >>> "{.2}".format(Math.PI)
      //  "3.14"
      value = +value.toFixed(precision);
      precision++;
    } else {
      precision = null;
    }

    value = Math.abs(value);

    switch (type) {
    case 'd':
      value = Math.round(this - 0.5).toString();
      break;
    case 'b':
      base = base ? '0b' : emptyString;
      value = base + value.toString(2);
      break;
    case 'c':
      value = String.fromCharCode(value);
      break;
    case 'o':
      base = base ? '0o' : emptyString;
      value = base + value.toString(8);
      break;
    case 'x':
      base = base ? '0x' : emptyString;
      value = base + value.toString(16).toLowerCase();
      break;
    case 'X':
      base = base ? '0x' : emptyString;
      value = base + value.toString(16).toUpperCase();
      break;
    case 'e':
      value = value.toExponential().toLowerCase();
      break;
    case 'E':
      value = value.toExponential().toUpperCase();
      break;
    case 'f':
      // Follow Python's example (using 6 as the default)
      value = value.toPrecision(precision || 7).toLowerCase();
      break;
    case 'F':
      // Follow Python's example (using 6 as the default)
      value = value.toPrecision(precision || 7).toUpperCase();
      break;
    case 'G':
      value = String(value).toUpperCase();
      break;
    case '%':
      value = (value.toPrecision(7) * 100) + '%';
      break;
    case 'n':
      value = value.toLocaleString();
      break;
    case 's':
    case 'g':
    case emptyString:
    case void 0:
      value = String(value).toLowerCase();
      break;
    default:
      throw new Error('Unrecognized format type: "{}"'.format(type));
    }

    if (align !== '=') {
      value = sign + value;
    }

    // Clean up the leftover spec and toss it over to String.prototype.toFormat
    spec = (fill || emptyString) + (align || emptyString) + (minWidth || emptyString);
    if (precision) spec += "." + (precision + 1);
    spec += (type || emptyString);
    value = String(value).toFormat(spec);

    if (align === '=') {
      value = sign + value;
    }

    return value;
  })

}).into(Number.prototype);
/*globals mix */
mix(/** @lends Date# */{

  /** @function
    @desc
    Shim for `toISOString`.

    @returns {String} The ISO 6081 formatted UTC date.
   */
  toISOString: Espresso.inferior(function () {
    return "{}-{}-{}T{}:{}:{}.{}Z".format(
      this.getUTCFullYear(),
      this.getUTCMonth(),
      this.getUTCDate(),
      this.getUTCHours(),
      this.getUTCMinutes(),
      this.getUTCSeconds(),
      this.getUTCMilliseconds()
    );
  }),

  /** @function
    @desc
    Date Formatting support (for use with `format`).

    The following flags are acceptable in a format string:

     - `a` The abbreviated weekday name ("Sun")
     - `A` The full weekday name ("Sunday")
     - `b` The abbreviated month name ("Jan")
     - `B` The full month name ("January")
     - `c` The preferred local date and time representation
     - `d` Day of the month (01..31)
     - `H` Hour of the day, 24-hour clock (00..23)
     - `I` Hour of the day, 12-hour clock (01..12)
     - `j` Day of the year (001..366)
     - `m` Month of the year (01..12)
     - `M` Minute of the hour (00..59)
     - `p` Meridian indicator ("AM" or "PM")
     - `S` Second of the minute (00..60)
     - `U` Week number of the current year, starting with the first Sunday as the first day of the first week (00..53)
     - `W` Week number of the current year, starting with the first Monday as the first day of the first week (00..53)
     - `w` Day of the week (Sunday is 0, 0..6)
     - `x` Preferred representation for the date alone, no time
     - `X` Preferred representation for the time alone, no date
     - `y` Year without a century (00..99)
     - `Y` Year with century

    For example:

        alert("Today is {:A, B d, Y}.".format(new Date()));

        alert("The time is: {:c}.".format(new Date()));

    Note: all times used with `format` are **not** in UTC time.

    @param {String} spec The specifier to transform the date to a formatted string.
    @returns {String} The Date transformed into a string as specified.
   */
  toFormat: Espresso.inferior(function () {
    return function (spec) {
      var result = [], i = 0,
          day = Espresso.days[this.getDay()],
          month = Espresso.months[this.getMonth()];

      for (; i < spec.length; i += 1) {
        switch (spec.charAt(i)) {
        case 'a':
          result[result.length] = day.slice(0, 3);
          break;
        case 'A':
          result[result.length] = day;
          break;
        case 'b':
          result[result.length] = month.slice(0, 3);
          break;
        case 'B':
          result[result.length] = month;
          break;
        case 'c':
          result[result.length] = "{0:a b} {1:2} {0:H:M:S Y}".format(this, this.getDate());
          break;
        case 'd':
          result[result.length] = "{:02}".format(this.getDate());
          break;
        case 'H':
          result[result.length] = "{:02}".format(this.getHours());
          break;
        case 'I':
          result[result.length] = "{:02}".format(this.getHours() % 12);
          break;
        case 'j':
          result[result.length] = "{:03}".format(Math.ceil((this - new Date(this.getFullYear(), 0, 1)) / 86400000));
          break;
        case 'm':
          result[result.length] = "{:02}".format(this.getMonth() + 1);
          break;
        case 'M':
          result[result.length] = "{:02}".format(this.getMinutes());
          break;
        case 'p':
          result[result.length] = this.getHours() > 11 ? "PM" : "AM";
          break;
        case 'S':
          result[result.length] = "{:02}".format(this.getSeconds());
          break;
        case 'U':
          // Monday as the first day of the week
          day = ((this.getDay() + 6) % 7) + 1;
          result[result.length] = "{:02}".format(
            Math.ceil((((this - new Date(this.getFullYear(), 0, 1)) / 86400000) + day) / 7) - 1);
          break;
        case 'w':
          result[result.length] = this.getDay();
          break;
        case 'W':
          result[result.length] = "{:02}".format(
            Math.ceil((((this - new Date(this.getFullYear(), 0, 1)) / 86400000) + this.getDay() + 1) / 7) - 1);
          break;
        case 'x':
          result[result.length] = "{:m/d/y}".format(this);
          break;
        case 'X':
          result[result.length] = this.toLocaleTimeString();
          break;
        case 'y':
          result[result.length] = "{:02}".format(this.getYear() % 100);
          break;
        case 'Y':
          result[result.length] = this.getFullYear();
          break;
        default:
          result[result.length] = spec.charAt(i);
        }
      }
      return result.join('');
    };
  }())

}).into(Date.prototype);

mix(/** @lends Date */{

  /** @function
    @desc
    Shim for `now`.

    @returns {Number} The current time.
   */
  now: Espresso.inferior(function () {
    return new Date().getTime();
  })

}).into(Date);

mix(/** @lends Espresso */{

  /**
    Strings for the days of the week, starting
    with `'Sunday'`.

    If you want to use a different locale,
    set the `days` string to reflect the locale's.

    @type String[]
   */
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  /**
    Strings for the months of the year.

    If you want to use a different locale,
    set the `months` string to reflect the locale's.

    @type String[]
   */
  months: ["January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December"]
}).into(Espresso);
/*globals mix */

mix(/** @scope Object */{

  /** @function
    @desc
    Returns all iterable keys on the passed Object.

    @param {Object} O The object to return the keys of.
    @returns {Array} A list of all keys on the object passed in.
    @throws {TypeError} When `O` is not an object.
   */
  keys: Espresso.inferior(function (O) {
    var array = [], key;

    // 1. If the Type(O) is not Object, throw a TypeError exception.
    if (typeof O !== "object" || O == null) {
      throw new TypeError("{} is not an object.".format(O));
    }

    // 5. For each own enumerable property of O whose name String is P
    for (key in O) {
      if (O.hasOwnProperty(key)) {
        array[array.length] = key;
      }
    }

    // 6. Return array.
    return array;
  })

}).into(Object);
