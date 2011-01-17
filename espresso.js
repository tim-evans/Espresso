/*!*
 * Espresso
 * ========
 *  A pick-me-up for JavaScript Library authors.
 *
 * Contributors
 *   Tim Evans <tim.evans@junctionnetworks.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/**
 * @namespace
 * <p>A pick-me-up for JavaScript Library authors.</p>
 *
 * <p>Espresso acts as a partial shim to ECMAScript 5, falling back
 * to native browser support when available.</p>
 *
 * <p>Espresso's goal is to provide a small library that provides
 * the basics that provide the power to developers to produce
 * sophisticated JavaScript libraries that have clear, concise,
 * and readable code, as well as a powerful consumer-facing API.</p>
 *
 * <p>This library provides the Publish-Subscribe pattern,
 * Key-Value Observing (a la Cocoa), and Ruby-like mixins.</p>
 *
 * @version 0.4.1
 */
/*global Espresso */
Espresso = {

  /**
   * The version string.
   * @type String
   */
  VERSION: '0.4.1'
};
/**
 * Mix in functionality to a pre-existing object.
 * This is the function that makes everything work- where all of the
 * function decorators are made into reality. To see examples of
 * the decorators working, visit the {@link Function} documentation.
 *
 * To create your own function decorator, add a unique function to
 * the underscore object on the function (this._ inside your decorator code).
 * This function will take three arguments: the template you're mixing into,
 * the current key being mixed in, and the value associated with that key.
 * You should return a new value for the key passed in.
 * For more details, take a look at the code for a pre-baked decorator like
 * {@link Function#around}.
 *
 * @param {...} mixins Objects to mixin to the template provided on into.
 * @returns {Object} An object with "into" field, call into with the template
 *                   to apply the mixins on. That will return the template
 *                   with the mixins on it.
 *
 * @example
 *   var k = mix({
 * 
 *   }).into({});
 */
var mix = function () {
  var mixins = arguments,
      i = 0, len = mixins ? mixins.length : 0;

  return {
    into: function (template) {
      var mixin, key, value,
          _, transform;

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          if (template[key] && value.isInferior) {
            continue;
          }

          _ = value && value._;
          if (value instanceof Function) {
            for (transform in _) {
              if (_.hasOwnProperty(transform)) {
                value = _[transform](template, value, key);
              }
            }
          }

          template[key] = value;
        }

        // Take care of IE clobbering toString and valueOf
        if (mixin && mixin.toString !== Object.prototype.toString) {
          template.toString = mixin.toString;
        } else if (mixin && mixin.valueOf !== Object.prototype.valueOf) {
          template.valueOf = mixin.valueOf;
        }
      }
      return template;
    }
  };
};
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
  on: function () {
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
    that = that || this;
    setTimeout(function () {
      return method.apply(that, args);
    }, timeout);
  },

  defer: function (that) {
    var args = Array.from(arguments);
    args.unshift(0);
    return this.delay.apply(this, args);
  }

}).into(Function.prototype);
/**
 * @namespace
 * The Enumerable mixin provides common operations on enumerations of objects.
 *
 * @requires forEach
 */
/*globals Espresso mix */

Espresso.Enumerable = /** @lends Espresso.Enumerable# */{

  /**
   * @function
   * @returns {void}
   */
  forEach: function () {
    throw new Error("You MUST override Espresso.Enumerable.forEach to be able " +
                    "to use the Enumerable mixin.");
  }.inferior(),

  /**
   * Returns an array where each value on the enumerable
   * is mutated by the lambda function.
   * {{{
   *   var cube = function (n) { return n * n * n };
   *   alert([1, 2, 3, 4].map(cube));
   *   // -> [1, 8, 27, 64]
   * }}}
   * @param {Function} lambda The lambda that transforms an element in the enumerable.
   * @param {Object} [self] The value of 'this' inside the lambda.
   * @returns {Array} The collection of results from the map function.
   */
  map: function (lambda, self) {
    var arr = [];

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    lambda = lambda || function (v) {
      return v;
    };
    this.forEach(function (k, v) {
      arr.set(arr.length, lambda.call(self, k, v, this));
    }, this);
    return arr;
  }.inferior(),

  /**
   * Reduce the content of an enumerable down to a single value.
   * {{{
   *   var range = mix(Espresso.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.call(self, v, i++, this);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   *
   *   var multiply = function (a, b) { return a * b; };
   *   var factorial = function (n) {
   *     return range.create(1, n).reduce(multiply);
   *   }
   *
   *   alert("5! is {}".fmt(factorial(5)));
   *   alert("120! is {}".fmt(factorial(120)));
   * }}}
   * @param {Function} lambda The lambda that performs the reduction.
   * @param {Object} [seed] The seed value to provide for the first time.
   * @returns {Object} The reduced output.
   */
  reduce: function (lambda, seed) {
    var shouldSeed = (arguments.length === 1),
        self = this;

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
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
  }.inferior(),

  /**
   * Converts an enumerable into an Array.
   * {{{
   *   var range = mix(Espresso.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.call(self, v, i++, this);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   * 
   *   alert(range.create(0, 200).toArray());
   *   // -> [0, 1, 2, 3, 4, 5, ... 198, 199, 200]
   * }}}
   * @returns {Array}
   */
  toArray: function () {
    return this.map(function (v) {
      return v;
    });
  }.inferior(),

  /**
   * Returns the size of the Espresso.Enumerable.
   * {{{
   *   var range = mix(Espresso.Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.call(self, v, i++, this);
   *       }
   *     },
   *
   *     create: function (begin, end) {
   *       return mix(this, { begin: begin, end: end }).into({});
   *     }
   *   }).into({});
   *
   *   alert(range.create(0, 20).size());
   *   // -> 21
   * }}}
   * @returns {Number}
   */
  size: function () {
    return this.reduce(function (i) {
      return i + 1;
    }, 0);
  },

  filter: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (seive, v, k, t) {
      if (lambda.call(self, v, k, t)) {
        seive.set(seive.length, v);
      }
    }, []);
  }.inferior(),

  every: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every && lambda.call(self, v, k, t);
    }, true);
  }.inferior(),

  some: function (lambda, self) {
    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    return this.reduce(function (every, v, k, t) {
      return every || lambda(self, v, k, t);
    }, false);
  }.inferior(),

  pluck: function (property) {
    return this.map(function (v) {
      if (v.get) {
        return v.get(property);
      } else {
        return v[property];
      }
    });
  },

  extract: function (keys) {
    var arr = [];
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    keys.forEach(function (v, k) {
      arr.set(arr.length, this.get(k));
    }, this);
    return arr;
  },

  contains: function (val) {
    var args = Array.from(arguments);

    if (args.length > 1) {
      return args.every(function (v, k) {
        return this.contains(v);
      }, this);
    } else {
      return this.reduce(function (contained, v, k) {
        return contained || v === val;
      }, false);
    }
  }
};
/**
 * @namespace
 * Publish-Subscribe mixin that provides the basics of eventing.
 *
 * @example
 *   var sailor = mix(Espresso.PubSub, {
 *     name: "",
 *     ahoy: function (action, sailor) {
 *       alert("{0.name}: Ahoy, {1.name}!".fmt(this, sailor));
 *     }
 *   }).into({});
 *
 *   var ship = mix(Espresso.PubSub, {
 *     sailors: [],
 *
 *     add: function (sailor, sync) {
 *       this.sailors.push(sailor);
 *       alert("Added {name}".fmt(sailor));
 *       this.publish("add", sailor);
 *       this.subscribe("add", sailor.ahoy.bind(sailor), { synchronous: !!sync });
 *     }
 *   }).into({});
 *
 *   var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
 *       daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
 *       flapjack = mix(sailor, { name: "Flapjack" }).into({});
 *
 *   ship.add(ahab, true);
 *   ship.add(daveyJones);
 *   ship.add(flapjack);
 */
/*global mix Espresso */

Espresso.PubSub = /** @lends Espresso.PubSub# */{

  /** @private */
  _subscriptions: null,

  /**
   * Subscribe to an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   * @param {Object} [options] Optional parameters.
   *   @param {Boolean} [options.synchronous] Whether the handler should be called synchronously or not. Defaults to asynchronous calls.
   * @returns {Object} The reciever.
   */
  subscribe: function (event, handler, options) {
    if (!Espresso.isCallable(handler)) {
      throw new TypeError("{} is not callable.".fmt(handler));
    }

    var subscriptions = this._subscriptions || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }
    subscriptions[event].push(mix(options, {
      subscriber: handler
    }).into({}));
    this._subscriptions = subscriptions;
    return this;
  },

  /**
   * Unsubscribe from an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   * @returns {Object} The reciever.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this._subscriptions, handlers, i, len;
    if (subscriptions && subscriptions[event]) {
      handlers = subscriptions[event];
      for (i = 0, len = handlers.length; i < len; i += 1) {
        if (handlers[i].subscriber === handler) {
          subscriptions.splice(i, 1);
          break;
        }
      }
    }
    return this;
  },

  /**
   * Publish an event, passing all arguments along to the subscribed functions.
   *
   * @param {Object} event The event to publish.
   * @returns {Object} The reciever.
   */
  publish: function (event) {
    var subscriptions = this._subscriptions,
        args = arguments, subscriber;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        subscriber = subscription.subscriber;
        if (subscription.synchronous) {
          subscriber.apply(this, args);
        } else {
          var A = [this];
          A = A.concat(Array.from(args));
          console.log(A);
          subscriber.defer.apply(subscriber, A);
        }
      }, this);
    }
    return this;
  }
};

Espresso.Scheduler = {
  setTimeout: function (lambda, time) {
    setTimeout(lambda, time);
  }
};
/*globals Espresso */
/**
 * @namespace
 * Key-Value Observing (KVO) is a design pattern build on top of the
 * Publish-Subscribe pattern. It's designed to have notifications
 * delivered to functions when a value changes and allows calculated
 * properties as well as dependant properties.
 *
 * To take advantage of KVO, simply use get() and set() when you want
 * to access or set a value.
 *
 * @see <a href="http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html">Key-Value Observing</a>
 */
Espresso.KVO = /** @lends Espresso.KVO# */{

  /**
   * Get a value on an object.
   * Use this instead of subscript ([]) or dot notation
   * for public variables. Otherwise, you won't reap benefits
   * of being notified when they are set, or if the property
   * is computed.
   *
   * Get is tolerant of when trying to access objects that
   * don't exist- it will return undefined in that case.
   *
   * {{{
   *   var Oxygen = mix(Espresso.KVO).into({
   *     symbol: 'O'
   *   });
   *
   *   var Hydrogen = mix(Espresso.KVO).into({
   *     symbol: 'H'
   *   });
   *
   *   var water = mix(Espresso.KVO).into({
   *     structure: [Hydrogen, Oxygen, Hydrogen],
   *     symbol: function () {
   *       return this.get('structure').pluck('symbol').join('=');
   *     }.property()
   *   });
   *
   *   alert(Oxygen.get('symbol'));
   *   // -> 'O'
   *
   *   alert(water.get('structure[0].symbol'));
   *   // -> 'H'
   *
   *   alert(water.get('symbol'));
   *   // -> 'H=O=H'
   * }}}
   *
   * @param {String} key The key to lookup on the object.
   * @returns {Object} The value of the key.
   */
  get: function (key) {
    key = key.toString();
    var value, idx = key.lastIndexOf('.'), object;
    if (idx === -1) {
      object = this;
    } else {
      object = Espresso.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      value = object[key];
      if (typeof value === "undefined") {
        value = object.unknownProperty.call(object, key);
      } else if (value && value.isProperty) {
        if (value.isCacheable) {
          object.__cache__ = object.__cache__ || {};
          if (!object.__cache__.hasOwnProperty(key)) {
            object.__cache__[key] = value.call(object, key);
          }
          return value.__cache__;
        }
        value = value.call(object, key);
      }
      return value;
    }
    return undefined;
  },

  /**
   * Set a value on an object.
   * Use this instead of subscript ([]) or dot notation
   * for public variables. Otherwise, you won't reap benefits
   * of being notified when they are set, or if the property
   * is computed.
   *
   * Set is tolerant of when trying to access objects that
   * don't exist- it will ignore your attempt in that case.
   *
   * Keep in mind that events are lazy- they get processed after
   * the processor has nothing to do. So don't expect to get notified
   * immediately when you set the value.
   *
   * {{{
   *   var person = Espresso.Template.extend({
   *     name: '',
   *
   *     _firstTime: true,
   *     nameDidChange: function (key, value) {
   *       if (this._firstTime) {
   *         this._firstTime = false;
   *         alert("Hi, my name's {}".fmt(value));
   *       } else {
   *         alert("No wait, it's {}".fmt(value));
   *       }
   *     }.on('name')
   *   });
   *
   *   person.set('name', 'Ian Donald Calvin Euclid Zappa');
   *   // -> "Hi, my name's Ian Donald Calvin Euclid Zappa"
   *
   *   person.set('name', 'Dweezil Zappa');
   *   // -> "No wait, it's Dweezil Zappa"
   * }}}
   * @param {String} key The key to lookup on the object.
   * @param {Object} value The value to set the object at the key's path to.
   * @returns {Object} The reciever.
   */
  set: function (key, value) {
    key = key.toString();

    var property, idx = key.lastIndexOf('.'), object, result;
    if (idx === -1) {
      object = this;
    } else {
      object = Espresso.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      property = object[key];

      if (property && property.isProperty) {
        result = property.call(object, key, value);
        if (property.isCacheable) {
          object.__cache__ = object.__cache__ || {};
          object.__cache__[key] = result;
        }
      } else if (typeof property === "undefined") {
        object.unknownProperty.call(object, key, value);
      } else {
        object[key] = value;
      }

      // Expected behaviour is strange unless publishes
      // are done immediately.
      if (object.publish) {
        object.publish(key, value);
      }
    }
    return this;
  },

  /**
   * @function
   * Called whenever you try to get or set an undefined property.
   *
   * This is a generic property that you can override to intercept
   * general gets and sets, making use out of them.
   * @param {String} key The unknown key that was looked up.
   * @param {Object} [value] The value to set the key to.
   */
  unknownProperty: function (key, value) {
    if (typeof value !== "undefined") {
      this[key] = value;
    }
    return value;
  }.property()
};
/*globals mix Enumerable Espresso */

/**
 * @name Array
 * @namespace
 *
 * Shim for the native Array object.
 *
 * @extends Espresso.Enumerable
 * @extends Espresso.KVO
 */
mix(/** @scope Array */{

  /**
   * @function
   * Convert an iterable object into an Array.
   *
   * This is used mostly for the arguments variable
   * in functions.
   *
   * @param {Object} iterable An iterable object with a length and indexing.
   * @returns {Array} The object passed in as an Array.
   */
  from: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }()),

  /**
   * Returns whether the object passed in is an Array or not.
   *
   * @param {Object} obj The Object to test if it's an Array.
   * @returns {Boolean} True if the obj is an array.
   */
  isArray: function (obj) {
    return (/array/i).test(Object.prototype.toString.call(obj));
  }.inferior()

}).into(Array);

/**
 * @name Array.prototype
 * @namespace

 */
mix(Espresso.Enumerable, Espresso.KVO, /** @scope Array.prototype */{

  /**
   * The size of the Array.
   * @returns {Number} The length of the Array.
   */
  size: function () {
    return this.length;
  }.property(),

  /**
   * Iterator over the Array.
   *
   * Implemented to be in conformance with ECMA-262 Edition 5,
   * so you will use the native forEach where it exists.
   *
   * @param {Function} lambda The callback to call for each element.
   * @param {Object} [self] The Object to use as this when executing the callback.
   * @returns {void}
   * 
   * @example
   *   [1, 1, 2, 3, 5].forEach(alert);
   *   // -> 1
   *   // -> 1
   *   // -> 2
   *   // -> 3
   *   // -> 5
   */
  forEach: function (lambda, self) {
    var len, k;

    // 3. Let len be ToUint32(lenValue).
    len = this.get('size');

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      // c. If kPresent is true, then
      if (this.hasOwnProperty(k)) {
        //  i. Let kValue be the result of calling the [[Get]]
        //     internal method of O with argument Pk.
        // ii. Call the [[Call]] internal method of lambda
        //     with T as the this value and argument list
        //     containing kValue, k, and O.
        lambda.call(self, this.get(k), k, this);
      }

      // d. Increase k by 1.
      k += 1;
    }

    // 8. Return
  }.inferior(),

  /**
   * @function
   */
  indexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
                         Math.max(i, len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o === this.get(i)) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  /**
   * KVO compliant reverse().
   *
   * @function
   * @see ECMA-262 15.4.4.8 Array.prototype.reverse()
   */
  reverse: function () {
    var O, len, middle,
        lower, upper,
        lowerP, upperP,
        upperValue, lowerValue;

    // 1. Let O be the result of calling ToObject
    //    passing this value as the argument.
    O = [];

    // 3. Let len be ToUint(lenVal)
    len = this.get('size');

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
      lowerValue = this.get(lowerP);
      
      // e. Let upperValue be the result of calling the [[Get]]
      //    intenal method of O with argument upperP
      upperValue = this.get(upperP);

      // h. If lowerExists is true and upperExists is true, then
      //     i. Call the [[Put]] internal method of O with arguments
      //        lowerP, upperValue, and true.
      //     i. Call the [[Put]] internal method of O with arguments
      //        upperP, lowerValue, and true.
      O.set(lowerP, upperValue);
      O.set(upperP, lowerValue);

      // l. Increase lower by 1.
      lower += 1;
    }

    // 7. Return 0.
    return O;
  }.inferior(),

  /**
   * Returns the last index that the object is found at.
   *
   * @function
   * @param searchElement The item to look for.
   * @param [fromIndex] The index to begin searching from.
   * @returns The last index of an item.
   * @see ECMA-262 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex ])
   */
  lastIndexOf: function (searchElement, fromIndex) {
    var k = 0, len = this.get('size'), n;

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
      if (this.hasOwnProperty(searchElement) &&
        //   i. Let elementK be the result of calling the [[Get]]
        //      internal method of O with the argument toString(k).
        //  ii. Let same be the result of applying the
        //      Strict Equality Comparision Algorithm to
        //      searchElement and elementK.
        // iii. If same is true, return k.
          this.get(k.toString() === searchElement)) {
        return k;
      }

      // c. Decrease k by 1.
      k -= 1;
    }
    return -1;
  }.inferior(),

  flatten: function () {
    var ret = [];
    this.forEach(function (v) {
      if (v instanceof Array) {
        ret.concat(v.flatten());
      } else {
        ret[ret.length] = v;
      }
    });
    return ret;
  },

  remove: function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from: from;
    return this.push.apply(this, rest);
  },

  /**
   * Returns all unique values on the array.
   *
   * @returns {Array}
   */
  unique: function () {
    var o = [];
    this.forEach(function (v) {
      o[v] = v;
    });
    return o.values();
  }.inferior(),

  without: function () {
    var without = Array.from(arguments);
    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement[complement.length] = v;
      }
      return complement;
    }, []);
  }
}).into(Array.prototype);
/**
 * @class
 * Templates provide inheritance without any classes.
 *
 * @extends Espresso.PubSub
 * @extends Espresso.KVO
 */
/*globals Espresso mix*/
Espresso.Template = mix(Espresso.PubSub, Espresso.KVO, /** @lends Espresso.Template# */{

  /**
   * Override this to act like a constructor.
   *
   * These constructors will take no arguments,
   * and are called after the extending is finished.
   * For stacked Espresso.Templates, use `around()` to get super
   * passed in as the first argument. You can then
   * whenever you please.
   *
   * @returns {void}
   *
   * @example
   *   var shotgun = Espresso.Template.extend({
   *     init: function () {
   *       alert("bang!");
   *     }
   *   });
   */
  init: function () {},

  /**
   * Extend a Template with a collection of objects.
   *
   * If you use around to get the super argument of the
   * base object's function, the function will be augmented
   * in such a way that you don't have to set the scope in
   * which the function should be called in. Just call the
   * function normally, assuming that it is "special" and
   * will have `this` reference the current context you're in.
   * If you want to, you certainly have the option to apply
   * the scope if you want.
   * 
   * @returns {Espresso.Template} The extended template.
   *
   * @example
   *   var Animal = Espresso.Template.extend({
   *     move: function (meters) {
   *       return "{} moved {} m.".fmt(this.name, meters);
   *     }
   *   });
   * 
   *   var Snake = Animal.extend({
   *     move: function ($super) {
   *       return "Slithering... {}".fmt($super(5));
   *     }.around()
   *   });
   *
   *   var Horse = Animal.extend({
   *     move: function ($super) {
   *       return "Galloping... {}".fmt($super(45));
   *     }.around()
   *   });
   *
   *   var sam = Snake.extend({ name: "Sammy the Python" });
   *   var tom = Horse.extend({ name: "Tommy the Palomino" });
   *
   *   alert(sam.move());
   *   // -> "Slithering... Sammy the Python moved 5 m."
   *   alert(tom.move());
   *   // -> "Galloping... Tommy the Palomino moved 45 m."
   */
  extend: function () {
    var F = function () {},
        extension;

    F.prototype = this;
    extension = new F();
    mix.apply(null, arguments).into(extension);

    if (extension.init && extension.init instanceof Function) {
      extension.init();
    }
    return extension;
  },

  /**
   * Filters out private variables and functions.
   */
  toJSON: function (key) {
    var k, v, json = {};
    for (k in this) {
      v = this.get(k);
      if (k.charAt(0) !== "_" && !Espresso.isCallable(v) && k !== 'unknownProperty') {
        json[k] = v;
      }
    }

    return json;
  }

}).into({});
/*global mix Espresso*/

/**
 * <p>Object-Oriented for those of you who need
 * type checking and proper inheritance in your
 * applications.</p>
 *
 * <p>Based off of John Resig's
 * <a href="http://ejohn.org/blog/simple-javascript-inheritance/">simple inheritance</a>.</p>
 *
 * @class
 * @extends Espresso.PubSub
 * @extends Espresso.KVO
 */
Espresso.Class = function () {};

mix(/** @scope Espresso.Class */{

  /**
   * Extend the class with the given properties.
   * Multiple inheritance is not doable without
   * breaking the inheritance chain.
   *
   * @returns {Espresso.Class} The extended Class.
   */
  extend: function () {
    var prototype = new this(), i, len = arguments.length;

    for (i = 0; i < len; i += 1) {
      mix.apply(null, [arguments[i]]).into(prototype);
    }

    function Class() {
      if (Espresso.isCallable(this.init)) {
        this.init.apply(this, arguments);
      }
    }

    Class.prototype = prototype;
    Class.constructor = Class;

    Class.extend = arguments.callee;
    return Class;
  }
}).into(Espresso.Class);

mix(Espresso.PubSub, Espresso.KVO, /** @scope Espresso.Class.prototype */{

  /**
   * Filters out private variables and functions
   * when serializing the JSON to a String.
   *
   * @returns {Object} The object hash to use when converting to JSON.
   */
  toJSON: function (key) {
    var k, v, json = {};
    for (k in this) {
      v = this.get(k);
      if (k.charAt(0) !== "_" && !Espresso.isCallable(v) && k !== 'unknownProperty') {
        json[k] = v;
      }
    }
    return json;
  }
}).into(Espresso.Class.prototype);
/*globals mix Espresso */

/**
 * @name String
 * @namespace
 * Provides
 * @extends Espresso.Enumerable
 */
mix(Espresso.Enumerable, /** @scope String.prototype */{

  /**
   * Iterates over every character in a string.
   * Required by {@link Espresso.Enumerable}.
   *
   * @param {Function} callback The callback to call for each element.
   * @param {Object} that The Object to use as this when executing the callback.
   *
   * @returns {void}
   * @example
   *   "boom".forEach(alert);
   *   // -> 'b'
   *   // -> 'o'
   *   // -> 'o'
   *   // -> 'm'
   */
  forEach: function (lambda, that) {
    var i = 0, len = this.length;

    if (!Espresso.isCallable(lambda)) {
      throw new TypeError("{} is not callable.".fmt(lambda));
    }
    for (; i < len; i += 1) {
      lambda.call(that, this.charAt(i), i, this);
    }
  },

  /**
   * Returns the character at the given index.
   * Provides a more unified interface for dealing with indexing,
   * and is more cross-browser than [].
   *
   * @param {Number} idx The index of the string to get.
   * @returns {String} The character at index idx.
   */
  get: function (idx) {
    return this.charAt(idx);
  },

  /**
   * Capitalize a string.
   *
   * @returns {String} The string, capitalized.
   * @example
   *   ['toast', 'cheese', 'wine'].forEach(function (food) {
   *     alert(food.capitalize());
   *   });
   *   // -> "Toast"
   *   // -> "Cheese"
   *   // -> "Wine"
   */
  capitalize: function () {
    return this.get(0).toUpperCase() + this.slice(1);
  },

  /**
   * Returns the string repeated the specified number of times.
   *
   * @param {Number} n The number of times to repeat this string.
   * @param {String} [separator] The separator to put between each iteration of the string.
   * @returns {String} The string repeated n times.
   * @example
   *   alert("bacon".times(5));
   *   // -> "baconbaconbaconbacon"
   *
   * @example
   *   alert("crunchy".times(2, " bacon is "));
   *   // -> "crunchy bacon is crunchy"
   */
  times: function (n, sep) {
    sep = sep || '';
    return n < 1 ? '': (new Array(n)).join(this + sep) + this;
  },

  /**
   * Trim leading and trailing whitespace.
   *
   * @function
   * @returns {String} The string with leading and trailing whitespace removed.
   * @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
   */
  trim: (function () {
    var left = /^\s\s*/, right = /\s\s*$/;
    return function () {
      return this.replace(left, '').replace(right, '');
    };
  }()).inferior(),

  /**
   * Unescapes any escaped HTML strings into their readable
   * forms.
   *
   * @function
   * @returns {String} The unescaped string.
   */
  unescapeHTML: (function () {
    // The entity table. It maps entity names to characters.
    var entity = {
      quot: '"',
      lt:   '<',
      gt:   '>',
      amp:  '&',
      apos: "'"
    }, re = /&([^&;]+);/g;

    // Replaces entity characters with their
    // more commonplace cousins:
    //  eg. &quot; => "
    return function () {
      return this.replace(re,
        function (a, b) {
          var r = entity[b];
          return typeof r === 'string' ? r : a;
        }
      );
    };
  }()).inferior(),

  /**
   * Replaces any reserved HTML characters into their
   * escaped form.
   *
   * @function
   * @returns {String} The escaped string.
   */
  escapeHTML: (function () {
    var character = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    }, re = /[<>&"']/g;
    return function () {
      return this.replace(re, function (c) {
        return character[c];
      });
    };
  }()).inferior(),

  /**
   * Returns true if the string is contained
   * inside of the parent string.
   *
   * Overrides the Enumerable contains to be something
   * more intuitive.
   *
   * @returns {Boolean} true if contained in the other string.
   * @example
   *   alert('restraurant'.contains('aura'));
   *   // -> true
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
   * <p>Format formats a string in the vein of Python's format,
   * Ruby #{templates}, and .NET String.Format.</p>
   *
   * <p>To write { or } in your Strings, just double them, and
   * you'll end up with a single one.</p>
   *
   * <p>If you have more than one argument, then you can reference
   * by the argument number (which is optional on a single argument).</p>
   *
   * <p>If you want to tie into this, and want to specify your own
   * format specifier, override __fmt__ on your object, and it will
   * pass you in the specifier (after the colon). You return the
   * string it should look like, and that's it!</p>
   *
   * <p>For an example of an formatting extension, look at the Date mix.
   * It implements the Ruby/Python formatting specification for Dates.</p>
   *
   * @returns {String} The formatted string.
   * @example
   *   alert("b{0}{0}a".fmt('an'));
   *   // -> "banana"
   *
   * @example
   *   var kitty = Espresso.Template.extend({
   *     name: "Mister Mittens",
   *     weapons: ["lazzors", "shuriken", "rainbows"],
   *
   *     fight: function (whom) {
   *       return "fightin' the {} with his {}.".fmt(
   *         whom, this.weapons[Math.floor(Math.random() * this.weapons.length)]);
   *     }
   *   });
   *
   *   alert("{0.name} is {1}".fmt(kitty, kitty.fight('zombies')));
   *   // -> "Mister Mittens is fightin' the zombies with ..."
   *
   * @example
   *   alert("I love {pi:.2}".fmt({ pi: 22 / 7 }));
   *   // -> "I love 3.14"
   *
   * @example
   *   alert("The {confection.type} is {confection.descriptor}.".fmt({
   *     confection: {
   *       type: 'cake',
   *       descriptor: 'a lie'
   *     }
   *   }));
   *   // -> "The cake is a lie."
   *
   * @example
   *   alert(":-{{".fmt());  // Double {{ or }} to escape it.
   *   // -> ":-{"
   */
  fmt: function () {
    var args = Array.from(arguments);
    args.unshift(this.toString());
    return Espresso.Formatter.fmt.apply(Espresso.Formatter, args);
  },

  /**
   * Format a string according to a format specifier.
   * This is a function called by Formatter, 
   * A valid specifier can have:
   * [[fill]align][minimumwidth]
   *
   * @param {String} spec The specifier string.
   * @returns {String} The string formatted using the format specifier.
   */
  __fmt__: function (spec) {
    var match = spec.match(Espresso.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2] || ' ',
        minWidth = match[6] || 0, len, before, after;

    if (align) {
      align = align.slice(-1);
    }

    len = Math.max(minWidth, this.length);
    before = len - this.length;
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
    return fill.times(before) + this + fill.times(after);
  },

  /**
   * @function
   */
  toJSON: function (key) {
    return this.valueOf();
  }.inferior()

}).into(String.prototype);
/**
 * @class
 *
 * <p>Advanced String Formatting borrowed from the eponymous Python PEP.
 * It provides a flexible and powerful string formatting utility
 * that allows the your string templates to have meaning!</p>
 *
 * <p>The formatter follows the rules of Python
 * <a href="http://www.python.org/dev/peps/pep-3101/">PEP 3101</a>
 * (Advanced String Formatting) strictly, but takes into account
 * differences between JavaScript and Python.</p>
 *
 * <p>To use literal object notation, just pass in one argument for
 * the formatter. This is optional however, as you can always
 * absolutely name the arguments via the number in the argument
 * list. This means that:</p>
 *
 * {{{
 *   alert(Espresso.Formatter.fmt("Hello, {name}!", { name: "world" }));
 * }}}
 *
 * is equivalent to:
 *
 * {{{
 *   alert(Espresso.Formatter.fmt("Hello, {0.name}!", { name: "world" }));
 * }}}
 *
 * For more than one argument you must mention the position of your
 * argument.
 *
 * {{{
 *   alert(Espresso.Formatter.fmt("{0.name} says {1}!", { name: "Domo" }, "hello"));
 * }}}
 *
 * If your arguments and formatter are "as is"- that is, in order,
 * and flat objects as you intend them to be, you can write your
 * template string like so:
 *
 * {{{
 *   alert(Espresso.Formatter.fmt("{} says {}!", "Domo", "hello"));
 * }}}
 *
 * <p>Check out the examples given for some ideas on how to use it.</p>
 *
 * <p>For developers wishing to have their own custom handler for the
 * formatting specifiers, you should write your own  __fmt__ function
 * that takes the specifier in as an argument and returns the formatted
 * object as a string. All formatters are implemented using this pattern,
 * with a fallback to Object's __fmt__, which turns said object into
 * a string, then calls __fmt__ on a string.</p>
 *
 * <p>Consider the following example:</p>
 *
 * @example
 *   Localizer = Espresso.Template.extend({
 *     __fmt__: function (spec) {
 *       return this.get(spec);
 *     }
 *   });
 *
 *   _hello = Localizer.extend({
 *     en: 'hello',
 *     fr: 'bonjour',
 *     jp: 'konnichiwa'
 *   });
 *
 *   alert(Espresso.Formatter.fmt("{:en}", _hello));
 *   // -> "hello"
 *
 *   alert(Espresso.Formatter.fmt("{:fr}", _hello));
 *   // -> "bonjour"
 *
 *   alert(Espresso.Formatter.fmt("{:jp}", _hello));
 *   // -> "konnichiwa"
 *
 * @example
 *   alert(Espresso.Formatter.fmt("You once were a ve-{0}, but now you will be{0}.", "gone"));
 *   // -> "You once were a ve-gone, but now you will begone."
 *
 * @example
 *   alert(Espresso.Formatter.fmt("Is {} vegan?", "chicken parmesan"));
 *   // -> "Is chicken parmesan vegan?"
 *
 * @example
 *   alert(Espresso.Formatter.fmt("Hello, {name}!", { name: "world" }));
 *   // -> "Hello, world!"
 *
 * @example
 *   alert(Espresso.Formatter.fmt("{lang} uses the {{variable}} format too!", {
 *      lang: "Python", variable: "(not used)"
 *   }));
 *   // -> "Python uses the {{variable}} format too!"
 *
 * @example
 *   alert(Espresso.Formatter.fmt("Today is {:A}.", new Date()));
 *
 * @example
 *   alert(Espresso.Formatter.fmt("Which one comes first? -> {:-^{}}", 3, 4));
 *   // -> "Which one comes first? -> -4-"
 */
/*globals Espresso */

Espresso.Formatter = {

  /**
   * The specifier regular expression.
   * The groups are:
   *
   *   `[[fill]align][sign][#][0][minimumwidth][.precision][type]`
   *
   * The brackets (`[]`) indicates an optional element.
   *
   * The `fill` is the character to fill the rest of the minimum width
   * of the string.
   *
   * The `align` is one of:
   *   * `^` Forces the field to be centered within the available space.
   *   * `<` Forces the field to be left-aligned within the available space. This is the default.
   *   * `>` Forces the field to be right-aligned within the available space.
   *   * `=` Forces the padding to be placed after the sign (if any) but before the digits. This alignment option is only valid for numeric types.
   * Unless the minimum field width is defined, the field width
   * will always be the same size as the data to fill it, so that
   * the alignment option has no meaning in this case.
   *
   * The `sign` is only valid for numeric types, and can be one of the following:
   *   * `+` Indicates that a sign shoulb be used for both positive as well as negative numbers.
   *   * `-` Indicates that a sign shoulb be used only for as negative numbers. This is the default.
   *   * ` ` Indicates that a leading space should be used on positive numbers.
   * @type RegExp
   */
  SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/,

  /**
   * Format a template string with provided arguments.
   *
   * @param {String} template The template string to format the arguments with.
   * @returns {String} The template formatted with the given leftover arguments.
   */
  fmt: function (template) {
    var args = Array.from(arguments).slice(1),
        prev = '',
        buffer = [],
        result, idx, len = template.length, ch;

    for (idx = 0; idx < len; idx += 1) {
      ch = template.get(idx);

      if (prev === '}') {
        if (ch !== '}') {
          throw new Error("Unmatched closing brace.");
        } else {
          buffer[buffer.length] = '}';
          prev = '';
          continue;
        }
      }

      if (ch === '{') {
        result = this.parseField(template.slice(idx + 1), args);
        buffer[buffer.length] = result[1];
        idx += result[0];
      } else if (ch !== '}') {
        buffer[buffer.length] = ch;
      }
      prev = ch;
    }
    return buffer.join('');
  },

  /**
   * Parses the template with the arguments provided,
   * parsing any nested templates.
   *
   * @param {String} template The template string to format.
   * @param {Array} args The arguments to parse the template string.
   * @returns {String} The formatted template.
   */
  parseField: function (template, args) {
    var fieldspec = [], result = null, idx = 0, ch, len = template.length;

    for (; idx < len; idx += 1) {
      ch = template.get(idx);
      if (ch === '{') {
        if (fieldspec.length === 0) {
          return [1, '{'];
        }

        result = this.parseField(template.slice(idx + 1), args);
        if (!result[0]) {
          return [idx, '{'];
        } else {
          idx += result[0];
          fieldspec[fieldspec.length] = result[1];
        }
      } else if (ch === '}') {
        return [idx + 1, this.formatField(fieldspec.join(''), args)];
      } else {
        fieldspec[fieldspec.length] = ch;
      }
    }
    return [template.length, fieldspec.join('')];
  },

  /**
   * Returns the value of the template string formatted with the
   * given arguments.
   *
   * @param {String} value The template string and format specifier.
   * @param {Array} args An Array of arguments to use to format the template string.
   * @returns {String} The formatted template.
   */
  formatField: function (value, args) {
    var iSpec = value.indexOf(':'),
        spec;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    if (value !== '') {
      value = Espresso.getObjectFor(value, args);
    } else {
      value = args.shift();
    }

    if (!spec) {
      return value;
    }

    return value.__fmt__ ? value.__fmt__(spec) : value;
  }  
};
/*globals mix Espresso */

mix(/** @lends Number# */{

  toJSON: function (key) {
    return this.valueOf();
  }.inferior(),

  __fmt__: function (spec) {
    // Don't want Infinity, -Infinity and NaN in here!
    if (!isFinite(this)) {
      return this;
    }

    var match = spec.match(Espresso.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2],
        sign = match[3] || '-',
        base = !!match[4],
        precision = match[7],
        type = match[8], value = this;

    if (align) {
      align = align.slice(-1);
    }

    if (!fill && !!match[5]) {
      fill = '0';
      spec = '0' + spec;
      if (!align) {
        align = '=';
        spec = spec[0] + '=' + spec.slice(1);
      }
    }

    if (precision) {
      precision = precision.slice(1);
    }

    switch (sign) {
    case '+':
      sign = (value >= 0) ? '+': '-';
      break;
    case '-':
      sign = (value >= 0) ? '': '-';
      break;
    case ' ':
      sign = (value >= 0) ? ' ': '-';
      break;
    default:
      sign = "";
    }

    if (precision) {
      value = +value.toFixed(precision);
    }

    value = Math.abs(value);

    switch (type) {
    case 'b':
      base = base ? '0b': '';
      value = base + value.toString(2);
      break;
    case 'c':
      value = String.fromCharCode(value);
      break;
    case 'o':
      base = base ? '0o': '';
      value = base + value.toString(8);
      break;
    case 'x':
      base = base ? '0x': '';
      value = base + value.toString(16).toLowerCase();
      break;
    case 'X':
      base = base ? '0x': '';
      value = base + value.toString(16).toUpperCase();
      break;
    case 'e':
      value = value.toExponential().toLowerCase();
      break;
    case 'E':
      value = value.toExponential().toUpperCase();
      break;
    case 'f':
      value = value.toFixed().toLowerCase();
      break;
    case 'F':
      value = value.toFixed().toUpperCase();
      break;
    case 'G':
      value = String(value).toUpperCase();
      break;
    case '%':
      value = (value.toFixed() * 100) + '%';
      break;
    case 'n':
      value = value.toLocaleString();
      break;
    case 'g':
    case 'd':
    case undefined:
      value = String(value).toLowerCase();
      break;
    default:
      throw new Error('Unrecognized format type: "{0}"'.fmt(spec.type));
    }

    if (align !== '=') {
      value = sign + value;      
    }

    value = String(value).__fmt__(spec);

    if (align === '=') {
      value = sign + value;
    }

    return value;
  }

}).into(Number.prototype);
/*globals mix Espresso */

mix(/** @lends Espresso */{

  /**
   * The global variable.
   *
   * @type Object
   */
  global: this,

  /**
   * <p>Lookup a variable's value given its Object notation.
   * This requires absolute queries to the Object.</p>
   *
   * <p>The most effort that is performed on behalf of the
   * lookup when it fails is when it's an array AND it's the
   * only element in the array, THEN it will unpack the element
   * and make that the argument.</p>
   *
   * <p>This does not mean that absolute notation does not
   * work in these cases; it just means that it's optional.</p>
   *
   * <p>This prevents unnecessary indexing by the user,
   * expecially in the case of the arguments Array.</p>
   *
   * @example
   *   // Properties on the global scope need to be there-
   *   // local scoped variables will not be found!
   *   window.arthur = Espresso.Template.extend({
   *     name: 'Arthur Dent',
   *     species: 'Human',
   *     description: 'Mostly Harmless'
   *   });
   *
   *   alert(Espresso.getObjectFor("arthur.name"));
   *   // -> 'Arthur Dent'
   *
   * @example
   *   alert(Espresso.getObjectFor("lang.pr._coffee", {
   *     lang: {
   *       en: { _coffee: "coffee" },
   *       pr: { _coffee: "cafe" }
   *     }
   *   }));
   *   // -> "cafe"
   * 
   * @function
   * @param {String} key The key to get on the target.
   * @param {Object} [object] The target object to get a value from.
   * @returns {Object} The referenced value in the args passed in.
   */
  getObjectFor: (function () {
    /** @ignore */
    var getProperty = function (property, obj) {
      if (property in obj) {
        obj = obj[property];
      } else {
        // Try to be helpful-
        //  1) If the property doesn't exist on the object,
        //  2) The object is an Array
        //  3) The Array has only one element in it.
        // Unpack the element and try the lookup again.
        if (Array.isArray(obj) && obj.length === 1) {
          obj = obj[0];
        }
        if (property in obj) {
          obj = obj[property];
        } else {
          obj = undefined;
        }
      }
      return obj;
    };


    return function (key, object) {
      // Array / Attribute subscript
      var iarr = key.indexOf('['),
          iattr = key.indexOf('.');

      // Use global scope as default
      object = (arguments.length === 1) ? this.global: object;

      // Nothing to look up on undefined or null objects.
      if (!Espresso.hasValue(object)) {
        return object;
      }

      // Access attributes by the array subscript.
      if ((iarr < iattr || iattr === -1) && iarr > -1) {

        // Found something that looks like: animals[0]
        // Unpack the first part, then deal with the array subscript.
        if (key[0] !== '[') {
          object = getProperty(key.split('[', 1), object);
        }

        // Eat up the descriptor until the beginning of
        // the Array subscript is reached.
        key = key.slice(key.indexOf('[') + 1);

        // Unpack the inside of the array subscript.
        object = getProperty(key.split(']', 1), object);

        // Eat up the rest of the descriptor, leaving new stuff.
        key = key.slice(key.indexOf(']') + 1);

        // Someone's referencing something weird...
        if (!(key === "" || key[0] === '.' || key[0] === '[')) {
          throw new Error("You need to properly index elements!");
        }

        // Eat up the dot.
        if (key.length && key.get(0) === '.') {
          key = key.slice(1);
        }

        // Recurse.
        return Espresso.getObjectFor(key, object);
      } else if ((iattr < iarr || iarr === -1) && iattr > -1) {
        object = getProperty(key.split('.', 1), object);

        // Eat up the dot.
        key = key.slice(key.indexOf('.') + 1);

        // Recurse
        return Espresso.getObjectFor(key, object);

        // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol getObjectFor
      return getProperty(key, object);
    };
  }()),

  /**
   * Checks whether the variable is defined <b>and</b> is not null.
   *
   * @param {Object} o The object to test if it's defined or not.
   * @returns {Boolean} True if the value is not null and not undefined.
   *
   * @example
   *   var unbound; // This variable is very lonely (and very much undefined)
   *   undefined = 'all your base belong to us'; // Yes, you can rename undefined, but...
   *   alert(Espresso.hasValue(unbound));
   *   // -> false
   *
   *   alert(Espresso.hasValue(undefined));
   *   // -> true
   */
  hasValue: function (o) {
    return (typeof o !== "undefined" && o !== null);
  },

  /**
   * <p>ECMAScript compliant isCallable.</p>
   *
   * <p>The abstract operation IsCallback determines if its argument,
   * which must be an ECMAScript language value, is a callable function
   * Object if it's an Object that hass a function called 'call'.</p>
   *
   * <p>This allows overriding 'call' on an object, effectively making it
   * a callable object.</p>
   *
   * <p>The one addition is ensuring that the method is also applicable,
   * (having the 'apply' being callable too).</p>
   *
   * @function
   * @param {Object} obj The Object to check whether it is callable or not.
   * @returns {Boolean} True if the Object is callable, otherwise false.
   */
  isCallable: (function () {
    var callable = /[Function|Object]/,
        toString = Object.prototype.toString;
    return function (obj) {
      return !!(obj && callable.test(toString.call(obj)) &&
                Espresso.hasValue(obj.call) &&
                callable.test(toString.call(obj.call)) &&
                Espresso.hasValue(obj.apply) &&
                callable.test(toString.call(obj.apply)));
    };
  }())
}).into(Espresso);
/*globals mix */

mix(/** @lends Date# */{

  useUTC: false,

  get: (function () {
    var validSlots = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
    return function (key) {
      var prefix = "get";
      key = key.capitalize();
      if (this.useUTC && validSlots.indexOf(key) !== -1) {
        prefix += "UTC";
      }
      return this[prefix + key]();
    };
  }()),

  set: (function () {
    var validSlots = ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds"];
    return function (key, value) {
      var prefix = "set";
      key = key.capitalize();
      if (this.useUTC && validSlots.indexOf(key) !== -1) {
        prefix += "UTC";
      }
      return this[prefix + key](value);
    };
  }()),

  toISOString: function () {
    var prev = this.useUTC, result;
    this.useUTC = true;
    result = "{:Y-m-dTH:M:S.f}Z".fmt(this);
    this.useUTC = prev;
    return result;
  }.inferior(),

  /**
   * Implements the toJSON method as defined in
   * ECMAScript 5th Edition.
   *
   * @param {Object} [key] Optional key argument.
   * @returns {String} The date as an ISO Formatted string.
   * @see 15.9.5.44 Date.prototype.toJSON
   */
  toJSON: function (key) {
    return isFinite(this.valueOf()) ? this.toISOString(): null;
  }.inferior(),

  /**
   * Date Formatting support.
   * The following flags are acceptable in a format string:
   * Format meaning:
   * 
   *  * `a` The abbreviated weekday name ("Sun")
   *  * `A` The full weekday name ("Sunday")
   *  * `b` The abbreviated month name ("Jan")
   *  * `B` The full month name ("January")
   *  * `c` The preferred local date and time representation
   *  * `d` Day of the month (01..31)
   *  * `H` Hour of the day, 24-hour clock (00..23)
   *  * `I` Hour of the day, 12-hour clock (01..12)
   *  * `j` Day of the year (001..366)
   *  * `m` Month of the year (01..12)
   *  * `M` Minute of the hour (00..59)
   *  * `p` Meridian indicator ("AM" or "PM")
   *  * `S` Second of the minute (00..60)
   *  * `U` Week number of the current year, starting with the first Sunday as the first day of the first week (00..53)
   *  * `W` Week number of the current year, starting with the first Monday as the first day of the first week (00..53)
   *  * `w` Day of the week (Sunday is 0, 0..6)
   *  * `x` Preferred representation for the date alone, no time
   *  * `X` Preferred representation for the time alone, no date
   *  * `y` Year without a century (00..99)
   *  * `Y` Year with century
   *  * `Z` Time zone name
   *
   * For example:
   * {{{
   *   alert("Today is {:A, B d, Y}.".fmt(new Date()));
   * }}}
   * {{{
   *   alert("The time is: {:c}.".fmt(new Date()));
   * }}}
   * @function
   * @param {String} spec The specifier to transform the date to a formatted string.
   * @returns {String} The Date transformed into a string as specified.
   */
  __fmt__: (function () {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    return function (spec) {
      var result = [], i = 0;

      for (; i < spec.length; i += 1) {
        switch (spec[i]) {
        case 'a':
          result[result.length] = days[this.get('day')].slice(0, 3);
          break;
        case 'A':
          result[result.length] = days[this.get('day')];
          break;
        case 'b':
          result[result.length] = months[this.get('month')].slice(0, 3);
          break;
        case 'B':
          result[result.length] = months[this.get('month')];
          break;
        case 'c':
          result[result.length] = "{:A, B H:M:S Y}".fmt(this);
          break;
        case 'd':
          result[result.length] = "{:02}".fmt(this.get('date'));
          break;
        case 'f':
          result[result.length] = "{:03}".fmt(this.get('milliseconds'));
          break;
        case 'H':
          result[result.length] = "{:02}".fmt(this.get('hours'));
          break;
        case 'I':
          result[result.length] = "{:02}".fmt(this.get('hours') % 12);
          break;
        case 'j':
          result[result.length] = "{:03}".fmt(Math.ciel(this - new Date(this.get('fullYear'), 0, 1) / 86400000));
          break;
        case 'm':
          result[result.length] = "{:02}".fmt(this.get('month') + 1);
          break;
        case 'M':
          result[result.length] = "{:02}".fmt(this.get('minutes'));
          break;
        case 'p':
          result[result.length] = this.get('hours') > 11 ? "PM" : "AM";
          break;
        case 'S':
          result[result.length] = "{:02}".fmt(this.get('seconds'));
          break;
        case 'w':
          result[result.length] = this.get('day');
          break;
        case 'x':
          result[result.length] = "{:m/d/y}".fmt(this);
          break;
        case 'X':
          result[result.length] = this.toLocaleTimeString();
          break;
        case 'y':
          result[result.length] = "{:02}".fmt(this.getYear() % 100);
          break;
        case 'Y':
          result[result.length] = this.get('fullYear');
          break;
        case 'Z':
          result[result.length] = this.get('timezoneOffset');
          break;
        default:
          result[result.length] = spec[i];
        }
      }
      return result.join('');
    };
  }())
}).into(Date.prototype);

mix({
  now: function () {
    return new Date().getTime();
  }.inferior()
}).into(Date);
/*globals mix */

mix(/** @scope Object.prototype */{

  /**
   * Formats an Object by coercing the Object to a String and calling
   * __fmt__ on the string with the spec passed in.
   *
   * @param {String} spec The string specification to format the object.
   * @returns {String} The object as a formatted string according to the specification.
   */
  __fmt__: function (spec) {
    return String(this).__fmt__(spec);
  }.inferior()

}).into(Object.prototype);

mix(/** @scope Object */{

  /**
   * Returns all iterable keys on the passed Object.
   *
   * @param {Object} O The object to return the keys of.
   * @returns {Array} A list of all keys on the object passed in.
   * @throws {TypeError} When `O` is not an object.
   */
  keys: function (O) {
    var array = [], key;

    // 1. If the Type(O) is not Object, throw a TypeError exception.
    if (typeof O !== "object") {
      throw new TypeError("{} is not an object.".fmt(O));
    }

    // 5. For each own enumerable property of O whose name String is P
    for (key in O) {
      if (O.hasOwnProperty(key)) {
        array[array.length] = key;
      }
    }

    // 6. Return array.
    return array;
  }.inferior()

}).into(Object);
/*globals mix */
/**
 * @name Boolean
 * @namespace
 *
 * Shim for the native Boolean object.
 */

mix(/** @lends Boolean# */{

  /**
   * Returns the data to be serialized into JSON.
   * @returns {Boolean} The value of the object.
   */
  toJSON: function (key) {
    return this.valueOf();
  }.inferior()
}).into(Boolean.prototype);
/**
 * @class
 * A KVO compliant Object Hash class.
 *
 * @extends Espresso.Enumerable
 * @extends Espresso.KVO
 * @extends Espresso.Template
 * @example
 */
/*globals Espresso */

Espresso.Hash = Espresso.Template.extend(Espresso.Enumerable, Espresso.KVO, /** @lends Espresso.Hash# */{

  /**
   * Iterator
   */
  forEach: function (lambda, self) {
    var k, v;
    for (k in this) {
      v = this.get(k);
      if (k[0] !== '_' && !Espresso.isCallable(v) && k !== "unknownProperty") {
        lambda.call(self, v, k, this);
      }
    }
  },

  /**
   * Return all of the iterable keys on the hash.
   *
   * {{{
   *   var alphabet = Espresso.Hash.extend({
   *     a: 00, b: 01, c: 02, d: 03, e: 04, f: 05,
   *     g: 06, h: 07, i: 08, j: 09, k: 10, j: 11,
   *     k: 12, l: 13, m: 14, n: 15, o: 16, p: 17,
   *     q: 18, r: 19, s: 20, t: 21, u: 22, v: 23,
   *     w: 24, x: 25, y: 26, z: 27
   *   });
   *
   *   alert(alphabet.keys());
   * }}}
   * @returns {Array} A list of all of the iterable keys on the hash.
   */
  keys: function () {
    return this.map(function (v, k) {
      return k;
    });
  },

  /**
   * Return all iterable values on the hash.
   *
   * {{{
   *   var days = Espresso.Hash.extend({
   *     1: 'Sunday',
   *     2: 'Monday',
   *     3: 'Tuesday',
   *     4: 'Wednesday',
   *     5: 'Thursday',
   *     6: 'Friday',
   *     7: 'Saturday'
   *   });
   *
   *   alert(days.values());
   * }}}
   * @returns {Array} A list of all iterable values on the hash.
   */
  values: function () {
    return this.map(function (v, k) {
      return v;
    });
  },

  /**
   * Convert the Hash into an Array of tuples.
   * @returns {Array[]} An array of tuples.
   */
  toArray: function () {
    return this.map(function (v, k) {
      return [k, v];
    });
  }
});
/*global JSON mix */

/**
 * @namespace
 */
JSON = JSON || {};

mix(/** @lends JSON# */{

  /**
   * The `stringify` function returns a String in JSON
   * format representing an ECMAScript value.
   * @function
   * @param {Object} value An ECMAScript value.
   * @param {Function|Array} [replacer] uhh..
   * @param {String|Number} [space] A String
   */
  stringify: (function () {
    var escapable, abbrev, stack, indent, gap, space,
        PropertyList, ReplacerFunction, Str, Quote, JO, JA;

    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    abbrev = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };

    /** @ignore
     * The abstract operation Str(key, holder) has access to ReplacerFunction
     * from the invocation of the stringify method.
     */
    Str = function (key, holder) {
      var value;

      // 1. Let value be the result of calling the [[Get]] internal method of
      //    holder with argument key.
      value = holder && (holder.get && holder.get(key) || holder[key]);

      // 2. If Type(value) is Object, then
      if (typeof value === "object") {
        // a. Let toJSON be the result of calling the [[Call]] internal method
        //    of value with argument toJSON
        // b. If IsCallable(toJSON) is true
        if (value && Espresso.isCallable(value.toJSON)) {
          // i. Let value be the result of calling the [[Call]] internal method
          //    of toJSON passing value as the this value and with an argument
          //    list consisting of key and value.
          value = value.toJSON(key);
        }
      }

      // 3. If ReplacerFunction is not undefined, then
      if (typeof ReplacerFunction !== "undefined") {
        // a. Let value be the result of calling the [[Call]] internal method
        //    of ReplacerFunction passing holder as the this value and with
        //    an argument list containing key and value.
        ReplacerFunction.call(holder, key, value);
      }

      // 5. If value is null then return "null".
      switch (typeof value) {
      case 'boolean':
      case 'null':
        return String(value);
      case 'string':
        return Quote(value);
      case 'number':
        return isFinite(value) ? String(value): "null";
      case 'object':
        if (!value) {
          return 'null';
        }

        if (Array.isArray(value)) {
          return JA(value);
        } else {
          return JO(value);
        }
        break;
      default:
        return undefined;
      }
    };

    /** @ignore
     * The abstract operation Quote(value) wraps a String value
     * in double quotes and escapes characters within it.
     */
    Quote = function (value) {
      escapable.lastIndex = 0;
      return '"' + (escapable.test(value) ?
        value.replace(escapable, function (a) {
          var c = abbrev[a];
          return typeof c === 'string' ?
            c: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }): value) + '"';
    };

    /** @ignore */
    JO = function (value) {
      var stepback, K, partial;

      // 1. If stack contains value then throw a TypeError exception
      //    because the structure is cyclical.
      if (stack.indexOf(value) !== -1) {
        throw new TypeError("Cannot stringify a cyclical structure to JSON.");
      }

      // 2. Append value to stack.
      stack[stack.length] = value;

      // 3. Let stepback be indent.
      stepback = indent;

      // 4. Let indent be the concatenation of indent and gap.
      indent += gap;

      // 5. If PropertyList is not undefined, then
      if (typeof PropertyList !== "undefined") {
        // a. Let K be PropertyList.
        K = PropertyList;

      // 6. Else
      } else {
        // a. Let K be an internal List of Strings consisting
        //    of the names of all the own properties of value whose
        //    [[Enumerable]] attribute is true.
        //    The ordering of the Strings should be the same as that used by the
        //    Object.keys standard built-in function.
        K = Object.keys(value);
      }

      // 7. Let partial be an empty List.
      partial = [];

      // 8. For each element P of K.
      K.forEach(function (P) {
        var strP = Str(P, value), member;
        if (typeof strP !== "undefined") {
          member = Quote(P);
          member += ":";
          if (gap !== '') {
            member += space;
          }
          member += strP;
          partial[partial.length] = member;
        }
      });

      var result;
      if (partial.length === 0) {
        result = "{}";
      } else {
        if (gap === '') {
          result = "{" + partial.join(',') + "}";
        } else {
          result = '{\n' +
            indent + partial.join(',\n' + indent) + '\n' +
           stepback + '}';
        }
      }

      stack.pop();
      indent = stepback;
      return result;
    };

    /** @ignore */
    JA = function (value) {
      var stepback, partial, len, index, strP, result;

      // 1. If stack contains value then throw a TypeError exception
      //    because the structure is cyclical.
      if (stack.indexOf(value) !== -1) {
        throw new TypeError("Cannot stringify a cyclical structure to JSON.");
      }

      // 2. Append value to stack.
      stack[stack.length] = value;

      // 3. Let stepback be indent.
      stepback = indent;

      // 4. Let indent be the concatenation of indent and gap.
      indent += gap;

      // 5. Let partial be an empty List.
      partial = [];

      // 6. Let len be the result of calling the [[Get]] internal method
      //    of value with argument "length".
      len = value.get('length');

      // 7. Let index be 0.
      index = 0;

      // 8. Repeat while index < len
      while (index < len) {
        strP = Str(String(index), value);
        if (typeof strP === "undefined") {
          partial[partial.length] = "null";
        } else {
          partial[partial.length] = strP;
        }
        index += 1;
      }

      // 9. If partial is empty, then
      if (partial.length === 0) {
        result = "[]";

      // 10. Else
      } else {
        if (gap === '') {
          result = "[" + partial.join(',') + "]";
        } else {
          result = '[\n' +
            indent + partial.join(',\n' + indent) + '\n' +
           stepback + ']';
        }
      }

      // 11. Remove the last element of stack.
      stack.pop();

      // 12. Let indent be stepback.
      indent = stepback;

      // 13. Return final.
      return result;
    };

    return function (value, replacer, sp) {
      var k, v, len, item;

      // 1. Let stack be an empty List.
      stack = [];

      // 2. Let indent be the empty String.
      indent = '';

      // 3. Let PropertyList and ReplacerFunction be undefined
      PropertyList = ReplacerFunction = undefined;

      // 4. If Type(replacer) is Object, then
      if (typeof replacer === "object") {
        // a. If IsCallable(replacer) is true, then
        if (isCallable(replacer)) {
          //  i. Let ReplacerFunction be replacer.
          ReplacerFunction = replacer;

        // b. Else if the [[Class]] internal property of replacer is "Array", then
        } else if (Array.isArray()) {
          //  i. Let PropertyList be an empty internal List
          PropertyList = [];

          // ii. For each value v of a property of replacer that has an array
          //     index property name. The properties are enumerated in the ascending
          //     array index order of their names.
          len = replacer.length;
          for (k = 0; k < len; k += 1) {
            v = replacer[k];
            item = undefined;
            if (typeof v === "string") {
              item = v;
            } else if (typeof v === "number") {
              item = v.toString();
            } else if (typeof v === "object" &&
                       (/string/i.test(Object.prototype.toString.call(v)) ||
                        /number/i.test(Object.prototype.toString.call(v)))) {
              item = v.toString();
            }
            if (typeof item !== "undefined" && PropertyList.indexOf(item) === -1) {
              PropertyList[PropertyList.length] = item;
            }
          }
        }
      }

      // 5. If Type(space) is Object then,
      if (typeof sp === "object") {
        // a. If the [[Class]] property of space is "Number" then,
        if (/number/i.test(Object.prototype.toString.call(sp))) {
          // i. Let space be ToNumber(space).
          sp = Number(sp);

        // b. Else if the [[Class]] internal property of space is "String" then,
        } else if (/string/i.test(Object.prototype.toString.call(sp))) {
          // i. Let space be ToString(space)
          sp = sp.toString();
        }
      }

      // 6. If Type(space) is Number
      if (typeof sp === "number") {
        // a. Let space be min(10, ToInteger(space)).
        sp = Math.min(10, sp);
        // b. Set gap to a String containing `space` space characters.
        //    This will be the empty String if space is less than 1.
        gap = sp < 1 ? '': ' '.times(sp);

      // 7. Else if Type(space) is String
      } else if (typeof sp === "string") {
        // a. If the number of characters in space is 10 or less,
        //    set gap to space otherwise set gap to a String consisting
        //    of the first 10 characters of space.
        gap = (sp.length <= 10) ? sp: sp.slice(0, 10);

      // 8. Else
      } else {
        // a. Set gap to the empty String.
        gap = '';
      }
      space = sp;

      return Str('', {'': value});
    };
  }()).inferior(),

  /**
   * @function
   */
  parse: (function () {
    var evaluate = function (text) {
      
    };
    return function (text, reviver) {
      return result;
    };
  }()).inferior()
}).into(JSON);
