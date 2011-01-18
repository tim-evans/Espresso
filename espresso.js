/*!*
   .`.`.
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
/*global Espresso */

/** @namespace

  Espresso is a JavaScript library to be used as a
  foundation library to create JavaScript libraries.
  It also acts as a partial shim to ECMAScript 5,
  falling back to native browser support when available.

  Espresso's goal is to provide a small library that
  provides the basics that provide the power to
  developers to produce sophisticated JavaScript libraries
  that have clear, concise, and readable code, as well as
  powerful consumer-facing APIs.

  What does this mean? Less code and robust APIs!

  This library provides the Publish-Subscribe pattern,
  Key-Value Observing (a la Cocoa), and Ruby-like mixins.
 */
Espresso = {

  /**
    The version string.
    @type String
   */
  VERSION: '0.5.2',

  /**
    The global variable.

    Used to be independant of what the global `this` is,
    whether it's `window` or `document` in a browser or
    `global` in NodeJS.

    @type Object
   */
  global: this,

  /** @function
    @desc

    Lookup a variable's value given its Object notation.
    This requires absolute queries to the Object, only using
    the `.` notation.

    The most effort that is performed on behalf of the
    lookup when it fails is when it's an array AND it's the
    only element in the array, THEN it will unpack the element
    and make that the argument.

    This does not mean that absolute notation does not
    work in these cases; it just means that it's optional.

    This prevents unnecessary indexing by the user,
    expecially in the case of the arguments Array.

    @example
      // Properties on the global scope need to be there-
      // local scoped variables will not be found!
      Espresso.global.arthur = Espresso.Template.extend({
        name: 'Arthur Dent',
        species: 'Human',
        description: 'Mostly Harmless'
      });

      alert(Espresso.getObjectFor("arthur.name"));
      // => 'Arthur Dent'

    @example
      alert(Espresso.getObjectFor("lang.pr._coffee", {
        lang: {
          en: { _coffee: "coffee" },
          pr: { _coffee: "cafe" }
        }
      }));
      // -> "cafe"

    @param {String} key The key to get on the target.
    @param {Object} [object] The target object to get a value from.
    @returns {Object} The referenced value in the args passed in.
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
        if (obj && property in obj) { // prevent the apocalypse
          obj = obj[property];
        } else {
          obj = undefined;
        }
      }
      return obj;
    };

    return function (key, object) {
      // Array / Attribute subscript
      var iattr = key.indexOf('.');

      // Use global scope as default
      object = (arguments.length === 1) ? this.global: object;

      // Nothing to look up on undefined or null objects.
      if (!Espresso.hasValue(object)) {
        return object;
      }

      if (iattr > -1) {
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
    Checks whether the variable is defined *and* is not null.

    @param {Object} o The object to test if it's defined or not.
    @returns {Boolean} True if the value is not null and not undefined.

    @example
      var unbound; // This variable is very lonely (and very much undefined)
      undefined = 'all your base belong to us'; // Yes, you can rename undefined, but...
      alert(Espresso.hasValue(unbound));
      // -> false

      alert(Espresso.hasValue(undefined));
      // -> true
   */
  hasValue: function (o) {
    return (typeof o !== "undefined" && o !== null);
  },

  /** @function
    @desc

    ECMAScript compliant isCallable.

    > The abstract operation IsCallable determines if its argument,
    > which must be an ECMAScript language value, is a callable function
    > Object if it's an Object that hass a function called `call`.

    This allows overriding `call` on an object, effectively making it
    a callable object.

    The one addition is ensuring that the method is also applicable,
    (having the `apply` being callable too).

    @param {Object} obj The Object to check whether it is callable or not.
    @returns {Boolean} True if the Object is callable, otherwise false.
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
};

// Apply it at the global scope
Espresso.global.Espresso = Espresso;
/*global mix Espresso */

/** @function
  @desc
  Mix in functionality to a pre-existing object.

  At the base level, `mix` will add the properties
  given on `mix` to the object passed in on `into`.

  Function decorators are told to alter the function
  on mixin time, rather than at decoration time.
  Function decorators do things like subscribe to
  events, tell `mix` to ignore it, ask to be sent
  the super class from the base object, and so on.

  Using the decorator interface to inject your own
  library's custom work in is fairly simple. The
  guidelines are that decorators **should** propagate
  through inheritance and mixins. Decorators should
  also not interfere with other decorator's behaviour.

  If you would like to mixin functionality to
  preexisting objects, use `mix` to do so, using the
  Object as the second parameter, like so:

      mix({
        gsub: function (find, replace) {
          if (/string/i.test(Object.prototype.toString.call(find))) {
            find = new RegExp(find, 'g');
          }
          return this.replace(find, replace);
        }
      }).into(String.prototype);

      var song = "I swiped your cat / And I stole your cathodes"
      alert(song.gsub('cat', 'banjo'));

      alert(song.gsub(/\bcat\b/, 'banjo'));

  Using `mix`, it's possible to create whatever types
  of objects you want, without polluting it's namespace.
  Espresso uses `mix` internally as a shim for ECMAScript 5
  compatability and creating the base objects
  {@link Espresso.Template} and {@link Espresso.Class}.

  @param {...} mixins Objects to mixin to the template provided on into.
  @returns {Object} An object with "into" field, call into with the template
                    to apply the mixins on. That will return the template
                    with the mixins on it.
 */
mix = function () {
  var mixins = arguments,
      i = 0, len = mixins ? mixins.length : 0;

  return {
    into: function (template) {
      var mixin, key, value,
          _, decorator;

      for (; i < len; i += 1) {
        mixin = mixins[i];
        for (key in mixin) {
          value = mixin[key];

          _ = value && value._;
          if (Espresso.isCallable(value)) {
            for (decorator in _) {
              if (_.hasOwnProperty(decorator)) {
                value = _[decorator](template, value, key);
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

// Apply it at the global scope
Espresso.global.mix = mix;
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
/*globals Espresso mix */

/** @namespace

  The Enumerable mixin provides common operations
  on enumerations of objects.

  @requires `forEach`- the enumerator over the collection.
 */
Espresso.Enumerable = /** @lends Espresso.Enumerable# */{

  /** @function
    @returns {void}
   */
  forEach: function () {
    throw new Error("You MUST override Espresso.Enumerable.forEach to be able " +
                    "to use the Enumerable mixin.");
  }.inferior(),

  /**
    Returns an array where each value on the enumerable
    is mutated by the lambda function.

        var cube = function (n) { return n * n * n };
        alert([1, 2, 3, 4].map(cube));
        // -> [1, 8, 27, 64]

    @param {Function} lambda The lambda that transforms an element in the enumerable.
    @param {Object} [self] The value of 'this' inside the lambda.
    @returns {Array} The collection of results from the map function.
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
    Reduce the content of an enumerable down to
    a single value.

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

        alert("5! is {}".fmt(factorial(5)));
        alert("120! is {}".fmt(factorial(120)));

    @param {Function} lambda The lambda that performs the reduction.
    @param {Object} [seed] The seed value to provide for the first time.
    @returns {Object} The reduced output.
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
    Converts an enumerable into an Array.

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

        alert(range.create(0, 200).toArray());
        // -> [0, 1, 2, 3, 4, 5, ... 198, 199, 200]

    @returns {Array}
   */
  toArray: function () {
    return this.map(function (v) {
      return v;
    });
  }.inferior(),

  /**
    Returns the size of the {@link Espresso.Enumerable}.

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

        alert(range.create(0, 20).size());
        // -> 21

    @returns {Number}
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
/** @namespace
  Publish-Subscribe mixin that provides the basics of eventing.

  @example
    var sailor = mix(Espresso.PubSub, {
      name: "",
      ahoy: function (action, sailor) {
        alert("{0.name}: Ahoy, {1.name}!".fmt(this, sailor));
      }
    }).into({});

    var ship = mix(Espresso.PubSub, {
      sailors: [],

      add: function (sailor, sync) {
        this.sailors.push(sailor);
        alert("Added {name}".fmt(sailor));
        this.publish("add", sailor);
       this.subscribe("add", sailor.ahoy.bind(sailor), { synchronous: !!sync });
      }
    }).into({});

    var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
        daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
        flapjack = mix(sailor, { name: "Flapjack" }).into({});

    ship.add(ahab, true);
    ship.add(daveyJones);
    ship.add(flapjack);
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
          subscriptions[event].remove(i);
          break;
        }
      }
    }
    return this;
  },

  /**
   * Gets called when an event has no subscribers to it.
   * Override to handle the case when nothing is published.
   *
   * @param {Object} event The event that was ignored.
   */
  unpublishedEvent: function (event) {},

  /**
   * Publish an event, passing all arguments along to the subscribed functions.
   *
   * @param {Object} event The event to publish.
   * @returns {Object} The reciever.
   */
  publish: function (event) {
    var subscriptions = this._subscriptions,
        args = arguments, subscriber, published = false;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        subscriber = subscription.subscriber;
        if (subscription.synchronous) {
          Espresso.Scheduler.invoke(subscriber, args, this);
        } else {
          Espresso.Scheduler.defer(subscriber, args, this);
        }
        published = true;
      }, this);
    }
    if (!published && Espresso.isCallable(this.unpublishedEvent)) {
      Espresso.Scheduler.invoke(this.unpublishedEvent, arguments, this);
    }
    return this;
  }
};

/** @namespace

  The scheduler is a mechanism to call functions in an
  abstract fashion. The built-in implementation is
  simplistic and may not meet the needs of your library.

  It's here so you may swap out functionality to suit your
  needs without mucking with moving parts within Espresso.
  You may interpret the functions as you see fit. Just mind
  that mucking with their implementation *will* change how
  notifications are delivered for the {@link Espresso.PubSub}
  and {@link Espresso.KVO} mixins.
 */
Espresso.Scheduler = {

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
  },

  /**
    Invokes a function immediately.

    @param {Function} lambda The function to call.
    @param {Array} args The arguments to apply to the function.
    @param {Object} that The object to apply as `this`.
   */
  invoke: function (lambda, args, that) {
    that = that || lambda;
    lambda.apply(that, args);
  }
};
/*globals Espresso */
/** @namespace

  [Key-Value Observing][kvo] (KVO) is a mechanism that allows
  objects to be notified of changes to specified properties of
  other Objects. It is based off of the observer pattern, which
  in turn is built on top of the Publish-Subscribe pattern.

  KVO is used on top of {@link Espresso.PubSub} for notifying
  observers that a change occured.

  To understand Key-Value coding, you must understand property
  paths first. This simply means that you need to understand
  the Object model of the object that you are doing a `get` or
  `set` on. Take the following example:

      var Beatles = mix(Espresso.KVO).into({
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

      alert(Beatles.get('Paul.instruments.0'));
      // => 'vocals'

  Using `get` provides optimizations such as caching on an Object.

  Using `set` provides notifications to observing functions /
  properties.

  The KVO mixin provides the ability to have dynamically computed
  properties via the `property` decorator on functions and the
  ability to intercept `get`s or `set`s to unknown properties via
  `unknownProperty`.

  Computed properties are simply a function that takes 2 arguments,
  the key and the value of the property that triggered the function
  call. These properties may also have dependent keys. When a
  property has dependent keys, every single time a dependent key
  gets `set`, the property will get recomputed.

  Consider the following:

      var Box = Espresso.Template.extend({
        width: 0,
        height: 0,
        depth: 0,

        volume: function () {
          return this.get('width') * this.get('height') * this.get('depth');
        }.property('width', 'height', 'depth').cacheable()
      });

  The `volume` property will get recomputed every single time the
  `width`, `height`, or `depth` values change. If you had another
  object that you would like to monitor the changes, perhaps a
  renderer, you could attach observers to each of the properties
  by subscribing to the property path (via
  {@link Espresso.PubSub#subscribe}) or by decorating your functions
  with {@link Function#observes}, providing any property paths
  that you would like to be notified on.

    [kvo]: http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html
 */
Espresso.KVO = /** @lends Espresso.KVO# */{

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
          return object.__cache__[key];
        }
        value = value.call(object, key);
      }
      return value;
    }
    return undefined;
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
  set: function (key, value) {
    key = key.toString();

    var property, idx = key.lastIndexOf('.'), object, result, didChange = false;
    if (idx === -1) {
      object = this;
    } else {
      object = Espresso.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      property = object[key];

      if (property && property.isProperty) {
        if (property.isIdempotent) {
          object.__value__ = object.__value__ || {};
          if (object.__value__[key] !== value) {
            result = property.call(object, key, value);
            didChange = true;
          }
          object.__value__[key] = value;
        } else {
          result = property.call(object, key, value);
          didChange = true;
        }

        if (property.isCacheable && didChange) {
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
    Called whenever you try to get or set a nonexistent
    property.

    This is a generic property that you can override to
    intercept general gets and sets, making use out of them.

    @param {String} key The unknown key that was looked up.
    @param {Object} [value] The value to set the key to.
    @returns {Object} The value of the key.
   */
  unknownProperty: function (key, value) {
    if (typeof value !== "undefined") {
      this[key] = value;
    }
    return this[key];
  }

};
/*globals mix Enumerable Espresso */

/** @name Array
  @namespace

  Shim for the native Array object.

  @extends Espresso.Enumerable
  @extends Espresso.KVO
 */
mix(/** @scope Array */{

  /** @function
    @desc
    Convert an iterable object into an Array.

    This is used mostly for the arguments variable
    in functions.

    @param {Object} iterable An iterable object with a length and indexing.
    @returns {Array} The object passed in as an Array.
   */
  from: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }()),

  /**
    Returns whether the object passed in is an Array or not.

    @param {Object} obj The Object to test if it's an Array.
    @returns {Boolean} True if the obj is an array.
   */
  isArray: function (obj) {
    return (/array/i).test(Object.prototype.toString.call(obj));
  }.inferior()

}).into(Array);

mix(Espresso.Enumerable, Espresso.KVO, /** @scope Array.prototype */{

  /**
    The size of the Array.

    @returns {Number} The length of the Array.
   */
  size: function () {
    return this.length;
  }.property(),

  /**
    Iterator over the Array.

    Implemented to be in conformance with ECMA-262 Edition 5,
    so you will use the native `forEach` where it exists.

    @param {Function} lambda The callback to call for each element.
    @param {Object} [self] The Object to use as this when executing the callback.
    @returns {void}
   */
  forEach: function (lambda, self) {
    var len, k;

    // 3. Let len be ToUint32(lenValue).
    len = this.get('size');

    // 4. If IsCallable(lambda) is false, throw a TypeError exception
    if (!Espresso.isCallable(lambda)) {
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
    Shim for Internet Explorer, which provides no `indexOf` for
    Array prototypes.

    @param {Object} o The object to test.
    @param {Number} [fromIndex] The index to start looking at for the element.
    @returns {Number} The first index of an item.
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
    Shim for Internet Explorer, which provides no reverse for
    Array prototypes. Returns -1 if the item is not found.

    @returns {Array} The array in reverse order.

    @see ECMA-262 15.4.4.8 Array.prototype.reverse()

    @example
      var racecar = "racecar".split('');
      alert(racecar.reverse().join(''));
      // => 'racecar'
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
    Shim for the last index that the object is found at.
    Returns -1 if the item is not found.

    @param searchElement The item to look for.
    @param [fromIndex] The index to begin searching from.
    @returns {Number} The last index of an item.

    @see ECMA-262 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex ])
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

  /**
    Returns a new array that's a one-dimensional flattening of this
    array (recursively). That is, for every element that's an array,
    extract its elements into the new array. If the optional level
    arguments determines the level of recursion to flatten.

    @param {Number} [level] The maximum level of recursion.
    @returns {Array} The flattened array.
    @example
      var arr = [1, [2, [3, [4, [5]]]]];
      alert(arr.flatten());
      // => [1, 2, 3, 4, 5]

      alert(arr.flatten(2));
      // => [1, 2, 3, [4, [5]]];
   */
  flatten: function (level) {
    var ret = [], hasLevel = arguments.length !== 0;
    if (hasLevel && level === 0) {
      return this;
    }

    this.forEach(function (v) {
      if (Array.isArray(v)) {
        if (hasLevel) {
          ret = ret.concat(v.flatten(level - 1));
        } else {
          ret = ret.concat(v.flatten());
        }
      } else {
        ret[ret.length] = v;
      }
    });

    return ret;
  },

  /**
    Removes the value from the array.

    @param {Number} from The position to begin removing values from.
    @param {Number} [to] The position to remove values to.
    @returns {Number} The length of the array.
    @example
      var breakfast = ["banana", "waffles", "bacon", "coffee"];
      breakfast.remove(0);

      alert(breakfast);
      // => ["waffles", "bacon", "coffee"]

      breakfast.unshift("sausages", "pancakes")
      alert(breakfast);
      // => ["sausages", "pancakes", "waffles", "bacon", "coffee"]

      breakfast.remove(1, 2);
      alert(breakfast);
      // => ["sausages", "bacon", "coffee"]
   */
  remove: function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from: from;
    return this.push.apply(this, rest);
  },

  /**
    Returns a new array by removing duplicate values in `this`.

    @returns {Array} The array with all duplicates removed.
    @example
      var magic = 'abracadabra'.split('').unique().join('');
      alert(magic);
      // => 'abrcd'
   */
  unique: function () {
    var o = Espresso.Hash.extend();
    this.forEach(function (v) {
      o[v] = v;
    });
    return o.values();
  },

  /**
    Returns a new array by removing all values passed in.

    @param {...} values Removes all values on the array that
      match the arguments passed in.
    @returns {Array} The array without the values given.
   */
  without: function () {
    var without = Array.from(arguments);
    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement[complement.length] = v;
      }
      return complement;
    }, []);
  },

  /**
    Removes all `undefined` or `null` values.

    @returns {Array} The array without any `undefined` or `null` values.
    @example
      var nil;

      alert([undefined, null, nil, 'nada'].compact());
      // => ['nada']
   */
  compact: function () {
    var nil;
    return this.without(null, nil);
  }

}).into(Array.prototype);
/*globals Espresso mix*/

/** @class

  Templates provide inheritance without any classes.

  The idiomatic use of templates is to have generic
  object that uses internal slots to determine what
  to do.

  In Object Oriented design, a constructor would look
  like the following:

      var Person = Espresso.Class.extend({
        init: function (name) {
          this.set('name', name);
        }
      });

      var hoban = new Person("Hoban 'Wash' Washburne");

  Using templates, the equivalent code would be:

      var Person = Espresso.Template.extend({
        name: null // Imply a name
      });

      var hoban = Person.extend({
        name: "Hoban 'Wash' Washburne"
      });

  The end result is straightforward (and transparent)
  object construction.

  The other benefit to using templates over classes
  is the fact that _everything_ is an object, and
  therefore can be extended upon. This allows one-off
  objects to be created from derivative objects, and
  truly encapsulates the concept prototypal inheritance.

  Templates are slightly more advanced than Classes,
  since they are typeless and require stateless objects
  to perform at their best.

  @extends Espresso.PubSub
  @extends Espresso.KVO
 */
Espresso.Template = mix(Espresso.PubSub, Espresso.KVO, /** @lends Espresso.Template# */{

  /**
    Override `init` to act like a constructor like so:

        var shotgun = Espresso.Template.extend({
          init: function () { alert("bang!"); }
        });

    These constructors will take no arguments,
    and are called after the extending is finished.
    For stacked Espresso.Templates, use `around()` to
    get the super object passed in as the first argument.

    @returns {void}
   */
  init: function () {},

  /**
    Extend a Template with a collection of objects.

    If you use around to get the super argument of the
    base object's function, the function will be augmented
    in such a way that you don't have to set the scope in
    which the function should be called in. Just call the
    function normally, assuming that it is "special" and
    will have `this` reference the current context you're in.
    If you want to, you certainly have the option to apply
    the scope if you want.

    @returns {Espresso.Template} The extended template.

    @example
      var Animal = Espresso.Template.extend({
        move: function (meters) {
          return "{} moved {} m.".fmt(this.name, meters);
        }
      });

      var Snake = Animal.extend({
        move: function ($super) {
          return "Slithering... {}".fmt($super(5));
        }.around()
      });

      var Horse = Animal.extend({
        move: function ($super) {
          return "Galloping... {}".fmt($super(45));
       }.around()
      });

      var sam = Snake.extend({ name: "Sammy the Python" });
      var tom = Horse.extend({ name: "Tommy the Palomino" });

      alert(sam.move());
      // -> "Slithering... Sammy the Python moved 5 m."
      alert(tom.move());
      // -> "Galloping... Tommy the Palomino moved 45 m."
   */
  extend: function () {
    var F = function () {},
        extension;

    F.prototype = this;
    extension = new F();
    mix.apply(null, arguments).into(extension);

    if (Espresso.isCallable(extension.init)) {
      extension.init();
    }
    return extension;
  },

  /** @function

    Filters out private variables, functions, and
    {@link KVO#unknownProperty} when parsing to JSON.

    It _will_ get any computed properties (via the
    `property` decorator on an Object.

    @returns Object The slots to stringify to JSON.
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

/** @class

  Class provides a manner to perform classical inheritance
  with the ability to mixin modules and extend current classes.

  Class is {@link Espresso.Template}'s sister, which provides
  a root class for all other classes to inherit from.

  This means that the following will work:

      var Person = Espresso.Class.extend({
        init: function (isDancing) {
          this.dancing = isDancing;
        },

        isDancing: function () {
          return this.get('dancing');
        }.property('dancing')
      });

      var Ninja = Person.extend({
        init: function ($super) {
          $super(false);
        }.around(),

        hasShuriken: function () {
          return true; // of course!
        }.property()
      });

      var p = new Person(true);
      alert(p.get('isDancing'));
      // => true

      var n = new Ninja();
      alert(n.get('isDancing'));
      // => false
      alert(n.get('hasShuriken'));
      // => true

      alert(p instanceof Person && p instanceof Espresso.Class &&
            n instanceof Ninja && n instanceof Person && n instanceof Espresso.Class);
      // => true

  Based off of John Resig's [simple inheritance][resig].

    [resig]: http://ejohn.org/blog/simple-javascript-inheritance/

  @extends Espresso.PubSub
  @extends Espresso.KVO
 */
Espresso.Class = function () {};

mix(/** @scope Espresso.Class */{

  /** @function
    @desc

    Extend the class with the given properties.
    Multiple inheritance is not allowed without
    breaking the inheritance chain.

    @returns {Espresso.Class} The extended Class.
   */
  extend: (function () {
    var initializing = false;

    return function () {
      // Prevent initialization when creating the Class.
      initializing = true;
      var prototype = new this(), i, len = arguments.length;
      initializing = false;

      for (i = 0; i < len; i += 1) {
        mix.apply(null, [arguments[i]]).into(prototype);
      }

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
}).into(Espresso.Class);

mix(Espresso.PubSub, Espresso.KVO, /** @scope Espresso.Class.prototype */{

  /**
    Filters out private variables and functions
    when serializing the JSON to a String.

    @returns {Object} The object hash to use when converting to JSON.
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

/** @namespace
  @name String

  @extends Espresso.Enumerable
 */
mix(Espresso.Enumerable, /** @scope String.prototype */{

  /**
    Iterates over every character in a string.
    Required by {@link Espresso.Enumerable}.

    @param {Function} callback The callback to call for each element.
    @param {Object} that The Object to use as this when executing the callback.

    @returns {void}
    @example
      "boom".forEach(alert);
      // => 'b'
      // => 'o'
      // => 'o'
      // => 'm'
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
    Returns the character at the given index.
    Provides a more unified interface for dealing with indexing,
    and is more cross-browser than `[]`.

    @param {Number} idx The index of the string to get.
    @returns {String} The character at index idx.
   */
  get: function (idx) {
    return this.charAt(idx);
  },

  /**
    Capitalize a string.

    @returns {String} The string, capitalized.
    @example
      ['toast', 'cheese', 'wine'].forEach(function (food) {
        alert(food.capitalize());
      });
      // => "Toast"
      // => "Cheese"
      // => "Wine"
   */
  capitalize: function () {
    return this.get(0).toUpperCase() + this.slice(1);
  },

  /**
    Returns the string repeated the specified number of times.

    @param {Number} n The number of times to repeat this string.
    @param {String} [separator] The separator to put between each iteration of the string.
    @returns {String} The string repeated n times.
    @example
      alert("bacon".times(5));
      // => "baconbaconbaconbaconbacon"

    @example
      alert("crunchy".times(2, " bacon is "));
      // => "crunchy bacon is crunchy"
   */
  times: function (n, sep) {
    sep = sep || '';
    return n < 1 ? '': (new Array(n)).join(this + sep) + this;
  },

  /** @function

    Trim leading and trailing whitespace.

    @returns {String} The string with leading and trailing whitespace removed.
    @see <a href="http://blog.stevenlevithan.com/archives/faster-trim-javascript">Faster JavaScript Trim</a>
   */
  trim: (function () {
    var left = /^\s\s*/, right = /\s\s*$/;
    return function () {
      return this.replace(left, '').replace(right, '');
    };
  }()).inferior(),

  /** @function

    Unescapes any escaped HTML strings into their readable
    forms.

    @returns {String} The unescaped string.
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

  /** @function
    Replaces any reserved HTML characters into their
    escaped form.

    @returns {String} The escaped string.
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
    Returns true if the string is contained
    inside of the parent string.

    Overrides the Enumerable contains to be something
    more intuitive.

    @returns {Boolean} true if contained in the other string.
    @example
      alert('restraurant'.contains('aura'));
      // => true
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
    Format formats a string in the vein of Python's format,
    Ruby #{templates}, and .NET String.Format.

    To write { or } in your Strings, just double them, and
    you'll end up with a single one.

    If you have more than one argument, then you can reference
    by the argument number (which is optional on a single argument).

    If you want to tie into this, and want to specify your own
    format specifier, override __fmt__ on your object, and it will
    pass you in the specifier (after the colon). You return the
    string it should look like, and that's it!

    For an example of an formatting extension, look at the Date mix.
    It implements the Ruby/Python formatting specification for Dates.

    @returns {String} The formatted string.
    @example
      alert("b{0}{0}a".fmt('an'));
      // => "banana"

    @example
      var kitty = Espresso.Template.extend({
        name: "Mister Mittens",
        weapons: ["lazzors", "shuriken", "rainbows"],

        fight: function (whom) {
          return "fightin' the {} with his {}.".fmt(
            whom, this.weapons[Math.floor(Math.random() * this.weapons.length)]);
        }
      });

      alert("{0.name} is {1}".fmt(kitty, kitty.fight('zombies')));
      // => "Mister Mittens is fightin' the zombies with ..."

    @example
      alert("I love {pi:.2}".fmt({ pi: 22 / 7 }));
      // => "I love 3.14"

    @example
      alert("The {confection.type} is {confection.descriptor}.".fmt({
        confection: {
          type: 'cake',
          descriptor: 'a lie'
        }
      }));
      // => "The cake is a lie."

    @example
      alert(":-{{".fmt());  // Double {{ or }} to escape it.
      // => ":-{"
   */
  fmt: function () {
    var args = Array.from(arguments);
    args.unshift(this.toString());
    return Espresso.Formatter.fmt.apply(Espresso.Formatter, args);
  },

  /**
    Format a string according to a format specifier.
    This is a function called by Formatter, 
    A valid specifier can have:
    [[fill]align][minimumwidth]

    @param {String} spec The specifier string.
    @returns {String} The string formatted using the format specifier.
   */
  __fmt__: function (spec) {
    var match = spec.match(Espresso.Formatter.SPECIFIER),
        align = match[1],
        fill = match[2] || ' ',
        minWidth = match[6] || 0,
        maxWidth = match[7] || null, len, before, after, value;

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

    value = this;
    if (Espresso.hasValue(maxWidth)) {
      maxWidth = +maxWidth.slice(1);
      if (!isNaN(maxWidth)) {
        value = value.slice(0, maxWidth);
      }
    }

    return fill.times(before) + value + fill.times(after);
  },

  /**
    Shim for `toJSON`. Returns the `valueOf` the String.

    @returns {String} This.
   */
  toJSON: function (key) {
    return this.valueOf();
  }.inferior()

}).into(String.prototype);
/*globals Espresso */

/** @class

  Advanced String Formatting borrowed from the eponymous Python PEP.
  It provides a flexible and powerful string formatting utility
  that allows the your string templates to have meaning!

  The formatter follows the rules of Python [PEP 3101][pep]
  (Advanced String Formatting) strictly, but takes into account
  differences between JavaScript and Python.

  To use literal object notation, just pass in one argument for
  the formatter. This is optional however, as you can always
  absolutely name the arguments via the number in the argument
  list. This means that:

      alert(Espresso.Formatter.fmt("Hello, {name}!", { name: "world" }));

  is equivalent to:

      alert(Espresso.Formatter.fmt("Hello, {0.name}!", { name: "world" }));

  For more than one argument you must provide the position of your
  argument.

      alert(Espresso.Formatter.fmt("{0}, {1}!", "hello", "world"));

  If your arguments and formatter are "as is"- that is, in order,
  and flat objects as you intend them to be, you can write your
  template string like so:

      alert(Espresso.Formatter.fmt("{}, {}!", "hello", "world"));

  To use the literals `{` and `}`, simply double them, like the following:

      alert(Espresso.Formatter.fmt("{lang} uses the {{variable}} format too!", {
         lang: "Python", variable: "(not used)"
      }));
      // => "Python uses the {variable} format too!"

  Check out the examples given for some ideas on how to use it.

  For developers wishing to have their own custom handler for the
  formatting specifiers, you should write your own  `__fmt__` function
  that takes the specifier in as an argument and returns the formatted
  object as a string. All formatters are implemented using this pattern,
  with a fallback to Object's `__fmt__`, which turns said object into
  a string, then calls `__fmt__` on a string.

  Consider the following example:

      Localizer = Espresso.Template.extend({
        __fmt__: function (spec) {
          return this.get(spec);
        }
      });

      _hello = Localizer.extend({
        en: 'hello',
        fr: 'bonjour',
        jp: 'konnichiwa'
      });

      alert(Espresso.Formatter.fmt("{:en}", _hello));
      // => "hello"

      alert(Espresso.Formatter.fmt("{:fr}", _hello));
      // => "bonjour"

      alert(Espresso.Formatter.fmt("{:jp}", _hello));
      // => "konnichiwa"

    [pep]: http://www.python.org/dev/peps/pep-3101/
 */
Espresso.Formatter = {

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
  SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/,

  /**
    Format a template string with provided arguments.

    @param {String} template The template string to format the arguments with.
    @returns {String} The template formatted with the given leftover arguments.
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
    Parses the template with the arguments provided,
    parsing any nested templates.

    @param {String} template The template string to format.
    @param {Array} args The arguments to parse the template string.
    @returns {String} The formatted template.
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
    Returns the value of the template string formatted with the
    given arguments.

    @param {String} value The template string and format specifier.
    @param {Array} args An Array of arguments to use to format the template string.
    @returns {String} The formatted template.
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

  /**
    Shim for `toJSON`. Returns the `valueOf` the Number.

    @returns {String} This.
   */
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
        minWidth = match[6] || 0,
        maxWidth = match[7],
        type = match[8], value = this, precision;

    if (align) {
      align = align.slice(-1);
    }

    if (!fill && !!match[5]) {
      fill = '0';
      if (!align) {
        align = '=';
      }
    }

    if (maxWidth) {
      precision = +maxWidth.slice(1);
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

    if (precision && !isNaN(precision)) {
      // Opting to go with a more intuitive approach than Python...
      //  >>> "{.2}".format(math.pi)
      //  "3.1"
      // Which is waaay less intuitive than
      //  > "{.2}".fmt(Math.PI)
      //  "3.14"
      value = +value.toFixed(precision);
      precision++; // make floating point precision work like Python.
    } else {
      precision = null;
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
    case 'g':
    case 'd':
    case '':
    case undefined:
      value = String(value).toLowerCase();
      break;
    default:
      throw new Error('Unrecognized format type: "{0}"'.fmt(type));
    }

    if (align !== '=') {
      value = sign + value;      
    }

    spec = (fill || '') + (align || '') + (minWidth || '') + (precision || '') + (type || '');
    value = String(value).__fmt__(spec);

    if (align === '=') {
      value = sign + value;
    }

    return value;
  }

}).into(Number.prototype);
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

  /**
    Shim for `toISOString`.

    @returns {String} The ISO 6081 formatted UTC date.
   */
  toISOString: function () {
    var prev = this.useUTC, result;
    this.useUTC = true;
    result = "{:Y-m-dTH:M:S.f}Z".fmt(this);
    this.useUTC = prev;
    return result;
  }.inferior(),

  /**
    Shim for `toJSON` for Date.

    @param {Object} [key] Optional key argument.
    @returns {String} The date as an ISO Formatted string.
    @see 15.9.5.44 Date.prototype.toJSON
   */
  toJSON: function (key) {
    return isFinite(this.valueOf()) ? this.toISOString(): null;
  }.inferior(),

  /** @function
    @desc
    Date Formatting support.

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
     - `Z` Timezone name or abbreviation (EST)

    For example:

        alert("Today is {:A, B d, Y}.".fmt(new Date()));

        alert("The time is: {:c}.".fmt(new Date()));

    @param {String} spec The specifier to transform the date to a formatted string.
    @returns {String} The Date transformed into a string as specified.
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
          result[result.length] = "{0:a b} {1:2} {0:H:M:S Y}".fmt(this, this.get('date'));
          break;
        case 'd':
          result[result.length] = "{:02}".fmt(this.get('date'));
          break;
        case 'e':
          result[result.length] = "{: 2}".fmt(this.get('date'));
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
          result[result.length] = "{:03}".fmt(Math.ceil((this - new Date(this.get('fullYear'), 0, 1)) / 86400000));
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
        case 'U':
          // Monday as the first day of the week
          var day = ((this.get('day') + 6) % 7) + 1;
          result[result.length] = "{:02}".fmt(
            Math.ceil((((this - new Date(this.get('fullYear'), 0, 1)) / 86400000) + day) / 7) - 1);
          break;
        case 'w':
          result[result.length] = this.get('day');
          break;
        case 'W':
          result[result.length] = "{:02}".fmt(
            Math.ceil((((this - new Date(this.get('fullYear'), 0, 1)) / 86400000) + this.get('day') + 1) / 7) - 1);
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

mix(/** @lends Date */{

  /**
    Shim for `now`.

    @returns {Number} The current time.
   */
  now: function () {
    return new Date().getTime();
  }.inferior()

}).into(Date);
/*globals mix */

mix(/** @scope Object.prototype */{

  /**
    Formats an Object by coercing the Object to a
    String and calling `__fmt__` on the string with
    the format specifier passed in.

    @param {String} spec The string specification to format the object.
    @returns {String} The object as a formatted string according to the specification.
   */
  __fmt__: function (spec) {
    return String(this).__fmt__(spec);
  }.inferior()

}).into(Object.prototype);

mix(/** @scope Object */{

  /**
    Returns all iterable keys on the passed Object.

    @param {Object} O The object to return the keys of.
    @returns {Array} A list of all keys on the object passed in.
    @throws {TypeError} When `O` is not an object.
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

/** @name Boolean
  @namespace

  Shim for the native Boolean object.
 */
mix(/** @lends Boolean# */{

  /**
    Returns the data to be serialized into JSON.

    @returns {Boolean} The value of the object.
   */
  toJSON: function (key) {
    return this.valueOf();
  }.inferior()

}).into(Boolean.prototype);
/*globals Espresso */

/** @class

  A KVO compliant Object Hash class.
 
  @extends Espresso.Enumerable
  @extends Espresso.KVO
  @extends Espresso.Template
 */
Espresso.Hash = Espresso.Template.extend(Espresso.Enumerable, Espresso.KVO, /** @lends Espresso.Hash# */{

  /**
   * Iterator
   */
  forEach: function (lambda, self) {
    var k, v;
    for (k in this) {
      v = this.get(k);
      if (k.get(0) !== '_' && !Espresso.isCallable(v) && k !== "unknownProperty") {
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
/*global JSON mix Espresso*/

/** @namespace
  Shim for JSON.

  Parts are borrowed from Douglas Crockford's [JSON2][1]. This
  JSON parser is designed to be safe rather than fast. The
  parser will fall back on native implementations when possible.

  For more information about the JSON object, see [Mozilla's
  documentation][2] on it.

    [1]: https://github.com/douglascrockford/JSON-js
    [2]: https://developer.mozilla.org/En/Using_native_JSON

  @name JSON
 */
Espresso.global.JSON = Espresso.global.JSON || {};

mix(/** @lends JSON# */{

  /** @function
    @desc

    The `stringify` function returns a String in JSON
    format representing an ECMAScript value.

    @param {Object} value An ECMAScript value.
    @param {Function|Array} [replacer] Either a function that
      alters the way objects and arrays are stringified or an
      array of strings and numbers that acts as a white list
      for selecteing the object properties that will be stringified.
    @param {String|Number} [space] Allows the result to have
      white space injected into it to improve human readability.

    @returns {String} The ECMAScript value as a JSON string.
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

  /** @function
    @desc

    The `parse` function parses a JSON text and produces an
    ECMAScript value.

    @param {String} text The JSON text to parse.
    @param {Function} [reviver] A function that takes two
      values (key and value). It can filter and transform the
      results. It is called with each of the key/value pairs
      produced by the parse, and its return value is used
      instead of the original value. If it returns what it
      recieved, the structure is not modified. If it returns
      `undefined`, then the property is deleted from the result.

    @returns {Object} The JSON text as an ECMAScript value.
   */
  parse: (function () {
    /** @ignore */
    var evaluate = function (text) {
      var at = 0,     // The index of the current character
          ch = ' ',   // The current character
          escapee = { '"':  '"',
                      '\\': '\\',
                      '/':  '/',
                      b:    '\b',
                      f:    '\f',
                      n:    '\n',
                      r:    '\r',
                      t:    '\t' },
      /** @ignore */
      next = function (c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ch) {
          throw new SyntaxError("Expected '{}' instead of '{}'".fmt(c, ch));
        }

        // Get the next character. When there are no more characters,
        // return the empty string.
        ch = text.charAt(at);
        at += 1;
        return ch;
      },

      // Parse a number value.
      /** @ignore */
      number = function () {
        var number,
            string = '';

        if (ch === '-') {
          string = '-';
          next('-');
        }
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
        if (ch === '.') {
          string += '.';
          while (next() && ch >= '0' && ch <= '9') {
            string += ch;
          }
        }
        if (ch === 'e' || ch === 'E') {
          string += ch;
          next();
          if (ch === '-' || ch === '+') {
            string += ch;
            next();
          }
          while (ch >= '0' && ch <= '9') {
            string += ch;
            next();
          }
        }
        number = +string;
        if (isNaN(number)) {
          throw new SyntaxError("'{}' is not a number.".fmt(string));
        } else {
          return number;
        }
      },

      // Parse a string value.
      /** @ignore */
      string = function () {
        var hex,
            i,
            string = '',
            uffff;

        // When parsing for string values, we must look for " and \ characters.
        if (ch === '"') {
          while (next()) {
            if (ch === '"') {
              next();
              return string;
            } else if (ch === '\\') {
              next();
              if (ch === 'u') {
                uffff = 0;
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(next(), 16);
                  if (!isFinite(hex)) {
                    break;
                  }
                  uffff = uffff * 16 + hex;
                }
                string += String.fromCharCode(uffff);
              } else if (typeof escapee[ch] === 'string') {
                string += escapee[ch];
              } else {
                break;
              }
            } else {
              string += ch;
            }
          }
        }
        throw new SyntaxError("Bad string.");
      },

      // Skip whitespace.
      /** @ignore */
      white = function () {
        while (ch && ch <= ' ') {
          next();
        }
      },

      // true, false, or null.
      /** @ignore */
      word = function () {
        switch (ch) {
        case 't':
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f':
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n':
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
        }
        throw new SyntaxError("Unexpected character '{}'".fmt(ch));
      },

      value,  // Place holder for the value function.

      // Parse an array value.
      /** @ignore */
      array = function () {
        var array = [];

        if (ch === '[') {
          next('[');
          white();
          if (ch === ']') {
            next(']');
            return array;   // empty array
          }
          while (ch) {
            array.push(value());
            white();
            if (ch === ']') {
              next(']');
              return array;
            }
            next(',');
            white();
          }
        }
        throw new SyntaxError("Bad Array");
      },

      // Parse an object value.
      /** @ignore */
      object = function () {
        var key,
            object = {};

        if (ch === '{') {
          next('{');
          white();
          if (ch === '}') {
            next('}');
            return object;   // empty object
          }
          while (ch) {
            key = string();
            white();
            next(':');
            if (Object.hasOwnProperty.call(object, key)) {
              throw new SyntaxError('Duplicate key "{}"'.fmt(key));
            }
            object[key] = value();
            white();
            if (ch === '}') {
              next('}');
              return object;
            }
            next(',');
            white();
          }
        }
        throw new SyntaxError("Bad Object");
      };

      // Parse a JSON value. It could be an object, an array, a string, a number,
      // or a word.
      /** @ignore */
      value = function () {
        white();
        switch (ch) {
        case '{':
          return object();
        case '[':
          return array();
        case '"':
          return string();
        case '-':
          return number();
        default:
          return ch >= '0' && ch <= '9' ? number() : word();
        }
      };

      var ret = value();
      white();
      if (ch) {
        throw new SyntaxError("Unexpected character '{}'".fmt(ch));
      }
      return ret;
    };

    return function (text, reviver) {
      var o = evaluate(text);

      /** @ignore */
      var Walk = function (holder, key) {
        var val = holder[key], k, v;

        if (Espresso.hasValue(val)) {
          for (k in val) {
            if (val.hasOwnProperty(k)) {
              v = Walk(val, k);
              if (typeof v === "undefined") {
                delete val[k];
              } else {
                val[k] = v;
              }
            }
          }
        }
        return reviver.call(holder, key, val);
      };

      return Espresso.isCallable(reviver) ?
        Walk({ '': o }, ''): o;
    };
  }()).inferior()
}).into(JSON);
