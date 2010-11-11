/*!*
 * Seed
 * ====
 *  A small JavaScript Library used to grow your own JavaScript libraries.
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
 * Mix in functionality to a pre-existing object.
 * This is the function that makes everything work- where all of the
 * function decorators are made into reality. To see examples of
 * the decorators working, visit the "Function":Function documentation.
 *
 * To create your own function decorator, add a unique function to
 * the underscore object on the function (this._ inside your decorator code).
 * This function will take three arguments: the template you're mixing into,
 * the current key being mixed in, and the value associated with that key.
 * You should return a new value for the key passed in.
 * For more details, take a look at the code for a pre-baked decorator like
 * "Function#around":Function#around .
 *
 * {{{
 *   // Delicious cookies...
 *   var eggs = { 'eggs': '2 large {}' },
 *       butter = { 'butter': '2 sticks of {}' },
 *       bakingPowder = { 'baking powder': '1 tsp {}' },
 *       flour = { 'flour': '2 1/4 cups {}' },
 *       sugar = { 'sugar': '1/2 cup {}' },
 *       brownSugar = { 'brown sugar': '1/2 cup {}' },
 *       mapleSyrup = { 'maple syrup': '2 Tbsp {}' },
 *       vanilla = { 'vanilla extract': '1 tsp {}' },
 *       chocolate = { 'dark chocolate chips': '2 cups {}' },
 *       nuts = { 'walnuts': '1 cup {}' };
 *
 *   var batter = mix(eggs, butter, bakingPowder, flour, sugar,
 *                    brownSugar, mapleSyrup, vanilla, chocolate, nuts).into({});
 *   var recipe = mix(batter).into({
 *     name: 'Chocolate Chip cookies',
 *
 *     list: function () {
 *       var list = [this.name, '='.times(this.name.length)],
 *           ingredient, amount;
 *       for (var ingredient in this) {
 *         amount = this[ingredient];
 *         if (this.hasOwnProperty(ingredient) && !Function.isFunction(amount) &&
 *             ingredient !== 'name') {
 *           list.push(amount.fmt(ingredient));
 *         }
 *       }
 *       return list.join('\n');
 *     }
 *   });
 *
 *   alert(recipe.list());
 * }}}
 * @param {...} mixins Objects to mixin to the template provided on into.
 * @returns {Object} An object with "into" field, call into with the template
 *                   to apply the mixins on. That will return the template
 *                   with the mixins on it.
 */
var mix = function () {
  var mixins = arguments;

  return {
    into: function (seed) {
      var key, mixin, o,
          i = 0, len = mixins ? mixins.length : 0,
          j = 0, name, aliases, _, transformer;
      for (; i < len; i += 1) {
        o = mixins[i];
        for (key in o) {
          mixin = o[key];
          aliases = mixin && mixin.aliases || [];
          aliases.push(key);

          for (j = 0; j < aliases.length; j += 1) {
            name = aliases[j];

            if (seed[name] && mixin.isInferior) {
              continue;
            }

            _ = mixin && mixin._;

            if (Function.isFunction(mixin)) {
              for (transformer in _) {
                if (_.hasOwnProperty(transformer)) {
                  mixin = _[transformer](seed, mixin, name);
                }
              }
            }

            seed[name] = mixin;

            // Take care of IE clobbering toString and valueOf
            if (name === "toString" &&
                seed.toString === Object.prototype.toString) {
              seed.toString = mixin;
            } else if (name === "valueOf" &&
                seed.valueOf === Object.prototype.valueOf) {
              seed.valueOf = mixin;
            }
          }

          // Delete aliases- they're redundant information.
          if (mixin && mixin.aliases) {
            delete mixin.aliases;
          }
        }
      }
      return seed;
    }
  };
};
/*globals mix _G */

Function.isFunction = function (o) {
  return o instanceof Function;
};

mix(/** @lends Function */{

  /**
   * Echoes the first argument back.
   *
   * {{{
   *   alert(Function.echo("Echo"));
   *   // -> "Echo"
   * }}}
   * @param {Object} echo The object to return.
   * @returns {Object} The first argument passed in.
   */
  echo: function (echo) {
    return echo;
  }
}).into(Function);

mix(/** @lends Function.prototype */{
  /**
   * Marks the function as inferior.
   * If there's another attribute on the Object
   * you're mixing in to, the inferior function will
   * not be mixed in.
   *
   * A common use of this is for feature detection.
   * Implement the API as described, and fall back
   * to your own custom function.
   * {{{
   * }}}
   * @returns {Function} The reciever.
   */
  inferior: function () {
    this.isInferior = true;
    return this;
  }
}).into(Function.prototype);

mix(/** @lends Function.prototype */{
  alias: function () {
    this.aliases = Array.from(arguments);
    return this;
  },

  around: function () {
    this._ = this._ || {};

    /** @ignore */
    this._.around = function (template, value, key) {
      var base = template[key] || Function.empty;
      if (!base) {
        return value;
      }

      return function () {
        return value.apply(this, [base.bind(this)].concat(Array.from(arguments)));
      };
    };
    return this;
  },

  on: function () {
    this._ = this._ || {};

    var pubsub = Array.from(arguments);

    /** @ignore */
    this._.pubsub = function (template, value, key) {
      var i = 0, len = pubsub.length, path, property, iProperty;
      if (template.subscribe && template.publish) {
        for (i = 0; i < len; i += 1) {
          path = pubsub[i];
          if (path.indexOf('.') !== -1) {
            iProperty = path.lastIndexOf('.');
            property = path.slice(iProperty + 1);
            path = path.slice(0, iProperty);
            _G.getObjectFor(path).subscribe(property, value.bind(template));
          } else {
            template.subscribe(pubsub[i], value.bind(template));
          }
        }
      }
      return value;
    };
    return this;
  },

  /**
   * Marks the function as a computed property.
   * You may now use the function for get() and set().
   * This is inferior, but compatible with SproutCore's property decorator.
   * {{{
   *   var Person = Seed.extend({
   *     firstName: '',
   *     lastName: '',
   * 
   *     fullName: function (k, v) {
   *       return [this.get('firstName'), this.get('lastName')].join(' ');
   *     }.property()
   *   });
   *
   *   alert(Person.extend({ firstName: "Douglas", lastName: "Crockford" }).get('fullName'));
   * }}}
   * @returns {Function} The reciever.
   */
  property: function () {
    this.isProperty = true;
    return this;
  }.inferior()

}).into(Function.prototype);

mix(/** @lends Function.prototype */{

  /**
   * Bind the value of `this` on a function
   * before hand.
   *
   * {{{
   *   var Person = Seed.extend({
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
   * @returns {Function} The function passed in, wrapped to ensure `this` is the correct scope.
   */
  bind: function (that) {
    var method = this;
    return function () {
      return method.apply(that, arguments);
    };
  },

  curry: function () {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments),
        method = this;
    return function () {
      return method.apply(this, args.concat(slice.apply(arguments)));
    };
  }.inferior(),

  delay: function (timeout) {
    var args = Array.from(arguments).slice(1),
        self = this;
    setTimeout(function () {
      return self.apply(self, args);
    }, timeout);
  },

  defer: function () {
    var args = Array.from(arguments);
    args.unshift(0);
    return this.delay.apply(this, args);
  }

}).into(Function.prototype);
/**
 * Enumerable mixin.
 * @requires forEach
 * @class Enumerable
 */
Enumerable = /** @lends Enumerable# */{

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
    lambda = lambda || Function.echo;
    this.forEach(function () {
      arr.push(lambda.apply(self, arguments));
    });
    return arr;
  }.inferior(),

  /**
   * Reduce the content of an enumerable down to a single value.
   * {{{
   *   var range = mix(Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
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
    var shouldSeed = (typeof seed === "undefined"),
        self = this;
    this.forEach(function (v, k) {
      if (shouldSeed) {
        seed = v;
        shouldSeed = false;
      } else {
        seed = lambda(seed, v, k, self);
      }
    });
    return seed;
  }.inferior(),

  /**
   * Converts an enumerable into an Array.
   * {{{
   *   var range = mix(Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
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
    return this.map();
  },

  /**
   * Returns the size of the Enumerable.
   * {{{
   *   var range = mix(Enumerable, {
   *     begin: 0,
   *     end: 0,
   *
   *     forEach: function (lambda, self) {
   *       var i = 0;
   *       for (var v = this.begin; v <= this.end; v++) {
   *         lambda.apply(self, [v, i++, this]);
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
    return this.reduce(function (seive, v, k, t) {
      if (lambda.apply(self, [v, k, t])) {
        seive.push(v);
      }
    }, []);
  }.inferior(),

  every: function (lambda, self) {
    return this.reduce(function (every, v, k, t) {
      return every && lambda.apply(self, [v, k, t]);
    }, true);
  }.inferior(),

  some: function (lambda, self) {
    return this.reduce(function (every, v, k, t) {
      return every || lambda(self, [v, k, t]);
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
    var arr = [], self = this;
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    keys.forEach(function (v, k) {
      if (self.get) {
        arr.push(self.get(k));
      } else {
        arr.push(self[k]);
      }
    });
    return arr;
  },

  contains: function (val) {
    var self = this,
        args = Array.from(arguments);

    if (args.length > 1) {
      return args.every(function (v, k) {
        return self.contains(v);
      });
    } else {
      return this.reduce(function (contained, v, k) {
        return contained || v === val;
      }, false);
    }
  },

  zip: function () {
    var iter = Function.echo, args = Array.from(arguments), collections;
    if (Function.isFunction(args.slice(-1)[0])) {
      iter = args.pop();
    }

    collections = [this].concat(args).map(Array.from);
    return this.map(function (v, k) {
      return iter(collections.pluck(k));
    });
  }

};
/**
 * @namespace PubSub
 * Publish-Subscribe mixin that provides the basics of eventing.
 *
 * {{{
 *   var sailor = mix(PubSub, {
 *     name: "",
 *     ahoy: function (action, sailor) {
 *       alert("{0.name}: Ahoy, {1.name}!".fmt(this, sailor));
 *     }
 *   }).into({});
 *
 *   var ship = mix(PubSub, {
 *     sailors: [],
 *
 *     add: function (sailor) {
 *       this.sailors.push(sailor);
 *       this.publish("add", sailor);
 *       this.subscribe("add", sailor.ahoy.bind(sailor));
 *     }
 *   }).into({});
 *
 *   var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
 *       daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
 *       flapjack = mix(sailor, { name: "Flapjack" }).into({});
 *
 *   ship.add(ahab);
 *   ship.add(daveyJones);
 *   ship.add(flapjack);
 * }}}
 */
PubSub = /** @lends PubSub# */{

  /** @private */
  _subscriptions: null,

  /**
   * Subscribe to an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   */
  subscribe: function (event, handler) {
    var subscriptions = this._subscriptions || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }
    subscriptions[event].push(handler);
    this._subscriptions = subscriptions;
    return this;
  },

  /**
   * Unsubscribe from an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this._subscriptions;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].remove(handler);
    }
    return this;
  },

  /**
   * Publish an event, passing all arguments along to the subscribed functions.
   * This is done asynchronously, with each callback being deferred.
   *
   * @param {Object} event The event to publish.
   */
  publish: function (event) {
    var subscriptions = this._subscriptions,
        args = Array.from(arguments);
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (v) {
        v.defer.apply(v, args);
      }.bind(this));
    }
    return this;
  }

};
/*globals mix Enumerable */

mix(/** @scope Array */{

  /**
   * Convert an iterable object into an Array.
   * @param {Object} iterable An iterable object with a length and indexing.
   * @returns {Array}
   */
  from: (function () {
    var slice = Array.prototype.slice;
    return function (iterable) {
      return slice.apply(iterable);
    };
  }())

}).into(Array);

mix(Enumerable, /** @scope Array.prototype */{

  /**
   * Iterator over the Array.
   * Implemented to be in conformance with ECMA-262 Edition 5,
   * so you will use the native forEach where it exists.
   * {{{
   *   [1, 1, 2, 3, 5].forEach(alert);
   *   // -> 1
   *   // -> 1
   *   // -> 2
   *   // -> 3
   *   // -> 5
   * }}}
   * @param {Function} callback The callback to call for each element.
   * @param {Object} self The Object to use as this when executing the callback.
   * @returns {void}
   */
  forEach: function (func, self) {
    var i = 0, len = this.length;
    for (; i < len; i += 1) {
      func.apply(self, [this[i], i, this]);
    }
  }.inferior(),

  indexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || 0;
    i = fromIndex >= 0 ? fromIndex:
                         i.max(len - Math.abs(fromIndex));
    for (; i < len; i += 1) {
      if (o in this && o === this[i]) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  /**
   * @function
   *
   * @param o The item to look for.
   * @param [fromIndex] The index to begin searching from.
   * @returns The last index of an item.
   */
  lastIndexOf: function (o, fromIndex) {
    var i = 0, len = this.length;
    fromIndex = fromIndex || len;
    i = fromIndex >= 0 ? len.min(fromIndex + 1):
                         len - Math.abs(fromIndex) + 1;
    while (i--) {
      if (o in this && o === this[i]) {
        return i;
      }
    }
    return -1;
  }.inferior(),

  unique: function () {
    var o = {};
    this.forEach(function (v, k) {
      o[v] = v;
    });
    return o.values();
  }.inferior(),

  without: function () {
    var without = Array.from(arguments);
    return this.reduce(function (complement, v) {
      if (without.indexOf(v) === -1) {
        complement.push(v);
      }
      return complement;
    }, []);
  },

  json: function () {
    var json = [];
    this.forEach(function (value) {
      json.push(value.json());
    });
    return "[{}]".fmt(json.join(","));
  }
}).into(Array.prototype);
/**
 * @class
 * The seed that all other objects grow from.
 * Seeds have support for "Key-Value Observing":http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html
 * a la Cocoa.
 * @extends PubSub
 */
/*globals Seed PubSub mix _G */

Seed = mix(PubSub, /** @lends Seed# */{

  /**
   * The initialization function.
   * This takes no parameters and is called
   * every single time the Seed is extended.
   * Override this to act like a constructor.
   *
   * These constructors will take no arguments,
   * and are called after the extending is finished.
   * For stacked Seeds, use around() to get super
   * passed in as the first argument. You can then
   * whenever you please.
   *
   * @returns {void}
   */
  init: function () {},

  /**
   * Extend a seed with a collection of objects.
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
   * {{{
   *   var animal = Seed.extend({
   *     move: function (meters) {
   *       return "{} moved {} m.".fmt(this.name, meters);
   *     }
   *   });
   * 
   *   var snake = animal.extend({
   *     move: function ($super) {
   *       return "Slithering... {}".fmt($super(5));
   *     }.around()
   *   });
   *
   *   var horse = animal.extend({
   *     move: function ($super) {
   *       return "Galloping... {}".fmt($super(45));
   *     }.around()
   *   });
   *
   *   var sam = snake.extend({ name: "Sammy the Python" });
   *   var tom = horse.extend({ name: "Tommy the Palomino" });
   *
   *   alert(sam.move());
   *   // -> "Slithering... Sammy the Python moved 5 m."
   *   alert(tom.move());
   *   // -> "Galloping... Tommy the Palomino moved 45 m."
   * }}}
   * @returns {Seed} The extended seed.
   */
  extend: function () {
    var F = function () {},
        extension;

    F.prototype = this;
    extension = new F();
    mix.apply(null, arguments).into(extension);

    if (extension.init && Function.isFunction(extension.init)) {
      extension.init();
    }
    return extension;
  },

  /**
   * Key Value Observing support. Get a value on an object.
   * Use this instead of subscript ([]) or dot notation
   * for public variables. Otherwise, you won't reap benefits
   * of being notified when they are set, or if the property
   * is computed.
   *
   * Get is tolerant of when trying to access objects that
   * don't exist- it will return undefined in that case.
   *
   * {{{
   *   var Oxygen = Seed.extend({
   *     symbol: 'O'
   *   });
   *
   *   var Hydrogen = Seed.extend({
   *     symbol: 'H'
   *   });
   *
   *   var water = Seed.extend({
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
    var value, idx = key.lastIndexOf('.'), object;
    if (idx === -1) {
      object = this;
    } else {
      object = _G.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      value = object[key];
      if (typeof value === "undefined") {
        value = object.unknownProperty.apply(object, arguments);
      } else if (value && value.isProperty) {
        value = value.apply(object, [key]);
      }
      return value;
    }
    return undefined;
  },

  /**
   * Key Value Observing support. Set a value on an object.
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
   *   var person = Seed.extend({
   *     name: '',
   *
   *     _firstTime: true,
   *     nameDidChange: function () {
   *       if (this._firstTime) {
   *         this._firstTime = false;
   *         alert("Hi, my name's {}".fmt(this.get('name')));
   *       } else {
   *         alert("No wait, it's {}".fmt(this.get('name')));
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
   * @returns {Seed} The reciever.
   */
  set: function (key, value) {
    var property, idx = key.lastIndexOf('.'), object;
    if (idx === -1) {
      object = this;
    } else {
      object = _G.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      property = object[key];
      if (object.publish) {      
        object.publish(key, value);
      }
      if (property && property.isProperty) {
        property.apply(object, [key, value]);
      } else if (typeof property === "undefined") {
        object.unknownProperty.apply(object, arguments);
      } else {
        object[key] = value;
      }
    }
    return this;
  },

  /**
   * Called whenever you try to get or set an undefined property.
   *
   * This is a generic property that you can override to intercept
   * general gets and sets, making use out of them.
   * {{{
   *   var trickster = Seed.extend({
   *     unknownProperty: function (key, value) {
   *       alert("You're trying to set {} to {}? Well, too bad!".fmt(key, value));
   *     }
   *   });
   *
   *   trickster.set('red', 'rgb(255, 0, 0)');
   * }}}
   * @function
   * @param {String} key The unknown key that was looked up.
   * @param {Object} [value] The value to set the key to.
   */
  unknownProperty: function (key, value) {
    if (typeof value !== "undefined") {
      this[key] = value;
    }
    return value;
  }.property(),

  /**
   * Convert this object fragment into JSON text.
   * This eschews the JSON.stringify in favor of each
   * native type knowing how to convert itself to JSON
   * using the json() method.
   *
   * {{{
   *   var Person = Seed.extend({
   *     _SEP: "(not JSONified- Someone Else's Problem)",
   *   });
   *
   *   var cast = Seed.extend({
   *     'Arthur Dent': Person.extend({
   *        name: 'Arthur Dent',
   *        species: 'Human',
   *        likes: "a spot 'o tea"
   *      }),
   *      'Ford Prefect': Person.extend({
   *        name: 'Ford Prefect',
   *        species: 'Betelgeusian',
   *        dislikes: 'Vogons'
   *      }),
   *      'Zaphod Beeblebrox': Person.extend({
   *        name: 'Zaphod Beeblebrox',
   *        species: 'Betelgeusian',
   *        likes: 'himself'
   *      }),
   *      'Trillian': Person.extend({
   *        name: 'Tricia Marie McMillian',
   *        species: 'Human'
   *      })
   *   });
   *
   *   var extendedCast = cast.extend({
   *      'Slartibartfast': Person.extend({
   *        name: 'Slartibartfast',
   *        species: 'Magrathean',
   *        likes: 'fjords'
   *      }),
   *   });
   *
   *   alert(extendedCast.json());
   * }}}
   * @returns {String} The Seed with all properties (even inherited) converted to JSON.
   */
  json: function () {
    var key, value, json = [];
    for (key in this) {
      value = this[key];
      if (key.charAt(0) !== "_") {
        if (!Function.isFunction(value)) {
          json.push("{}:{}".fmt(key.json(), value.json()));
        }
      }
    }
    return "{{{}}}".fmt(json.join(","));
  }

}).into({});
/*globals mix Enumerable Formatter */

/**
 * @namespace String
 * Add-ons to Strings to make them easier to deal with.
 */
mix(Enumerable, /** @lends String# */{

  /**
   * Iterator for Strings.
   * {{{
   *   "boom".forEach(alert);
   *   // -> 'b'
   *   // -> 'o'
   *   // -> 'o'
   *   // -> 'm'
   * }}}
   * @param {Function} callback The callback to call for each element.
   * @param {Object} self The Object to use as this when executing the callback.
   * @returns {void}
   */
  forEach: function (lambda, self) {
    var i = 0, len = this.length;
    for (; i < len; i += 1) {
      lambda.apply(self, [this.charAt(i), i, this]);
    }
  }.inferior(),

  /**
   * Capitalize a string.
   *
   * {{{
   *   alert("hydrogen".capitalize());
   *   // -> "Hydrogen"
   * }}}
   * @returns {String} The string, capitalized.
   */
  capitalize: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },

  /**
   * Camelize a string.
   *
   * {{{
   *   alert("domo arigatou".camelize());
   *   // -> domoArigatou
   * }}}
   * @function
   * @returns {String} The string, camelized.
   */
  camelize: (function () {
    var camelizer = /([\2-+_\s]+)(.)/g;
    return function () {
      return this.replace(camelizer, function (junk, seperator, chr) {
        return chr.toUpperCase();
      });
    };
  }()),

  /**
   * @function
   */
  dasherize: (function () {
    var decamelizer = /([a-z])([A-Z])/g,
        dasherizer = /([_+\s]+)/g;
    return function () {
      var res = this.replace(decamelizer, function (junk, a, b) {
        return a + '-' + b.toLowerCase();
      });
      return res.toLowerCase().replace(dasherizer, '-');
    };
  }()),

  /**
   * Returns the string repeated the specified
   * number of times.
   *
   * {{{
   *   alert("bacon".times(5));
   *   // -> "baconbaconbaconbaconbacon"
   * }}}
   *
   * @param {Number} n The number of times to repeat this string.
   * @returns The string repeated n times.
   */
  times: function (n) {
    return (new Array(n + 1)).join(this);
  },

  /**
   * Trim leading and trailing whitespace.
   * "Faster JavaScript Trim":http://blog.stevenlevithan.com/archives/faster-trim-javascript
   */
  trim: function () {
    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }.inferior(),

  unescape: (function () {
    // The entity table. It maps entity names to characters.
    var entity = {
      quot: '"',
      lt:   '<',
      gt:   '>',
      amp:  '&'
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
  }()),

  escape: (function () {
    var character = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot'
    }, re = /[<>&"]/g;
    return function () {
      return this.replace(re, function (c) {
        return character[c];
      });
    };
  }()),

  /**
   * Returns true if the string is contained
   * inside of the parent string.
   *
   * Overrides the Enumerable contains to be something
   * more intuitive.
   * {{{
   *   alert("seedling".contains('seed'));
   *   // -> 'true'
   * }}}
   * @returns {Boolean} true if contained in the other string.
   */
  contains: function (str) {
    return this.indexOf(str) !== -1;
  },

  /**
   * Format formats a string in the vein of Python's format,
   * Ruby fmt, and .NET String.Format.
   *
   * To write { or } in your Strings, just double them, and
   * you'll end up with a single one.
   *
   * If you have more than one argument, then you can reference
   * by the argument number (which is optional on a single argument).
   *
   * If you want to tie into this, and want to specify your own
   * format specifier, override __fmt__ on your object, and it will
   * pass you in the specifier (after the colon). You return the
   * string it should look like, and that's it!
   *
   * For an example of an formatting extension, look at the Date mix.
   * It implements the Ruby/Python formatting specification for Dates.
   *
   * {{{
   *   alert("Hello, {name}!".fmt({ name: 'Domo' }));
   *   // -> "Hello, Domo!"
   * }}}
   *
   * {{{
   *   alert("I love {pi:.2}".fmt({ pi: 22 / 7 }));
   *   // -> "I love 3.14"
   * }}}
   *
   * {{{
   *   alert("The {confection.type} is {confection.descriptor}.".fmt({
   *     confection: {
   *       type: 'cake',
   *       descriptor: 'a lie'
   *     }
   *   }));
   *   // -> "The cake is a lie."
   * }}}
   *
   * {{{
   *   alert(":-{{".fmt());  // Double {{ or }} to escape it.
   *   // -> ":-{"
   * }}}
   *
   * {{{
   *   alert("{0.name} likes {1.name}.".fmt({ name: "Domo" }, { name: "yakitori" }));
   *   // -> "Domo likes yakitori."
   * }}}
   *
   * {{{
   *   // BEWARE!! 
   *   alert("{:*<{}}".fmt(3, 4));
   *   // -> "**4"
   * }}}
   * @returns {String} A formatted string.
   */
  fmt: function () {
    var args = Array.from(arguments);
    args.unshift(this.toString());
    return Formatter.fmt.apply(Formatter, args);
  },

  /**
   * Format a string according to a format specifier.
   * This is a function called by Formatter, 
   * A valid specifier can have:
   * [[fill]align][minimumwidth]
   */
  __fmt__: function (spec) {
    var match = spec.match(Formatter.SPECIFIER),
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
    case '>':
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

  json: function () {
    return '"' + this + '"';
  }

}).into(String.prototype);
/**
 * @class
 * Advanced String Formatting borrowed from the eponymous Python PEP.
 * It provides a flexible and powerful string formatting utility
 * that allows the your string templates to have meaning!
 *
 * The formatter follows the rules of the Python
 * "PEP 3101(Advanced String Formatting)":http://www.python.org/dev/peps/pep-3101/ strictly,
 * but takes into account differences between JavaScript and Python.
 *
 * To use literal object notation, just pass in one argument for
 * the formatter. This is optional however, as you can always
 * absolutely name the arguments via the number in the argument
 * list. This means that:
 *
 * {{{
 *   Formatter.fmt("Hello, {name}!", { name: "world" });
 * }}}
 *
 * is equivalent to:
 *
 * {{{
 *   Formatter.fmt("Hello, {0.name}!", { name: "world" });
 * }}}
 *
 * For more than one argument you must mention the position of your
 * argument.
 *
 * {{{
 *   Formatter.fmt("{0.name} says {1}!", { name: "Domo" }, "hello");
 * }}}
 *
 * If your arguments and formatter are "as is"- that is, in order,
 * and flat objects as you intend them to be, you can write your
 * template string like so:
 *
 * {{{
 *   Formatter.fmt("{} says {}!", "Domo", "hello");
 * }}}
 *
 * Check out the examples given for some ideas on how to use it.
 *
 * For developers wishing to have their own custom handler for the
 * formatting specifiers, you should write your own  __fmt__ function
 * that takes the specifier in as an argument and returns the formatted
 * object as a string. All formatters are implemented using this pattern,
 * with a fallback to Object's __fmt__, which turns the said object into
 * a string, then calls __fmt__ on a string.
 *
 * Consider the following example:
 *
 * {{{
 *   Localizer = Seed.extend({
 *     __fmt__: function (spec) {
 *       return this[spec];
 *     }
 *   });
 *
 *   _hello = Localizer.extend({
 *     en: 'hello',
 *     fr: 'bonjour',
 *     jp: 'konnichiwa'
 *   });
 *
 *   Formatter.fmt("{:en}", _hello);
 *   // -> "hello"
 *
 *   Formatter.fmt("{:fr}", _hello);
 *   // -> "bonjour"
 *
 *   Formatter.fmt("{:jp}", _hello);
 *   // -> "konnichiwa"
 * }}}
 *
 * Try these examples to get a hang of how string formatting works!
 *
 * {{{
 *   Formatter.fmt("Arguments: {1}; {0}; {2}", 0, 1, 2);
 *   // -> "Arguments 1; 0; 2"
 * }}}
 *
 * {{{
 *   Formatter.fmt("{} is my name.", "Domo");
 *   // -> "Domo is my name."
 * }}}
 *
 * {{{
 *   Formatter.fmt("Hello, {name}!", { name: "world" });
 *   // -> "Hello, world!"
 * }}}
 *
 * {{{
 *   Formatter.fmt("{lang} uses the {{variable}} format too!", {
 *      lang: "Python", variable: "(not used)"
 *   });
 *   // -> "Python uses the {{variable}} format too!"
 * }}}
 *
 * {{{
 *   Formatter.fmt("Today is {:A}.", new Date());
 * }}}
 *
 * {{{
 *   Formatter.fmt("Which one comes first? -> {:-^{}}", 3, 4);
 *   // -> "Which one comes first? -> -4-"
 * }}}
 */
/*globals Formatter _G */

Formatter = {

  SPECIFIER: /((.)?[><=\^])?([ +\-])?([#])?(0?)(\d+)?(.\d+)?([bcoxXeEfFG%ngd])?/,

  /**
   * Format a template string with provided arguments.
   *
   * @param {String} template The template string to format the arguments with.
   * @param {...} args A variable length of arguments to format the template with.
   */
  fmt: function (template) {
    var args = Array.from(arguments).slice(1),
        prev = '',
        buffer = '',
        result, idx, len = template.length, ch;

    for (idx = 0; idx < len; idx += 1) {
      ch = template[idx];

      if (prev === '}') {
        if (ch !== '}') {
          throw new Error("Unmatched closing brace.");
        } else {
          buffer += '}';
          prev = '';
          continue;
        }
      }

      if (ch === '{') {
        result = this.parseField(template.slice(idx + 1), args);
        buffer += result[1];
        idx += result[0];
      } else if (ch !== '}') {
        buffer += ch;
      }
      prev = ch;
    }
    return buffer;
  },

  parseField: function (template, args) {
    var fieldspec = '', result = null, idx = 0, ch, len = template.length;

    for (; idx < len; idx += 1) {
      ch = template[idx];
      if (ch === '{') {
        if (fieldspec.length === 0) {
          return [1, '{'];
        }

        result = this.parseField(template.slice(idx + 1), args);
        if (!result[0]) {
          return [idx, '{'];
        } else {
          idx += result[0];
          fieldspec += result[1];
        }
      } else if (ch === '}') {
        return [idx + 1, this.formatField(fieldspec, args)];
      } else {
        fieldspec += ch;
      }
    }
    return [template.length, fieldspec];
  },

  formatField: function (value, args) {
    var iSpec = value.indexOf(':'),
        spec;
    iSpec = iSpec === -1 ? value.length : iSpec;
    spec = value.slice(iSpec + 1);
    value = value.slice(0, iSpec);

    if (value !== '') {
      value = _G.getObjectFor(value, args);
    } else {
      value = args.shift();
    }

    if (!spec) {
      return value;
    }

    return value ? value.__fmt__(spec) : value;
  }
  
};
/*globals mix Formatter */

mix(/** @lends Number# */{
  json: function () {
    return isFinite(this) ? String(this) : "null";
  },

  __fmt__: function (spec) {
    // Don't want Infinity, -Infinity and NaN in here!
    if (!isFinite(this)) {
      return this;
    }

    var match = spec.match(Formatter.SPECIFIER),
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
/*globals mix _G */

// Lua-like global variable so you don't have to guess what
// the global variable is.
_G = mix(/** @lends _global_ */{

  /**
   * Lookup a variable's value given its Object notation.
   * This requires absolute queries to the Object.
   *
   * The most effort that is performed on behalf of the
   * lookup when it fails is when:
   *  If it's an array.
   *    AND
   *  It's the only element in the array,
   *    THEN
   *  unpack the element and make that the argument.
   *
   * This does not mean that absolute notation does not
   * work in these cases; it just means that it's optional.
   *
   * This prevents unnecessary indexing by the user,
   * expecially in the case of the arguments Array.
   *
   * {{{
   *   // Properties on the global scope need to be there-
   *   // local scoped variables will not be found!
   *   window.Hydrogen = Seed.extend({
   *     symbol: 'H'
   *   });
   *
   *   alert(getObjectFor("Hydrogen.symbol"));
   *   // -> 'H'
   *
   *   alert(getObjectFor("name", { name: "Ein" }));
   *   // -> "Ein"
   *   alert(getObjectFor("name", [{ name: "Ein" }]));  // Unpacked for you!
   *   // -> "Ein"
   *
   *   alert(getObjectFor("0", ["hello", "world"])); // BEWARE!
   *   // -> ["hello", "world"]
   *
   *   alert(getObjectFor("lang.jp._hello", {
   *     lang: {
   *       en: { _hello: "hello", _goodbye: "goodbye" },
   *       jp: { _hello: "konnichiwa", _goodbye: "sayonara" }
   *     }
   *   }));
   *   // -> "konnichiwa"
   * }}}
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
        if (obj instanceof Array && obj.length === 1) {
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
      object = (arguments.length === 1) ? _G: object;

      // Nothing to look up on undefined or null objects.
      if (!isDefined(object)) {
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
        if (key.length && key[0] === '.') {
          key = key.slice(1);
        }

        // Recurse.
        return getObjectFor(key, object);
      } else if ((iattr < iarr || iarr === -1) && iattr > -1) {
        object = getProperty(key.split('.', 1), object);

        // Eat up the dot.
        key = key.slice(key.indexOf('.') + 1);

        // Recurse
      return getObjectFor(key, object);

        // Done!
      } else if (key === '') {
        return object;
      }

      // Plain 'ol getObjectFor
      return getProperty(key, object);
    };
  }()),

  /**
   * Checks whether the variable is defined *and* not null.
   * {{{
   *   var foo;
   *   alert(isDefined(null));
   *   // -> false
   *
   *   undefined = 'all your base are belong to us';
   *   alert(isDefined(foo));
   *   // -> false
   * }}}
   * @param {Object} o The object to test if it's defined or not.
   * @returns {Boolean} True if the value is not null and not undefined.
   */
  isDefined: function (o) {
    return (typeof o !== "undefined" && o !== null);
  }

}).into(this);
/*globals mix */

mix(/** @lends Date# */{

  get: function (key) {
    return this["get" + key.capitalize()]();
  },

  toLocaleTimeString: function () {
    return "{:H:M:S}".fmt(this);
  }.inferior(),

  toISOString: function () {
    return "{:Y-m-dTH:M:S.f}Z".fmt(new Date(this.get('time') +
                                            this.get('timezoneOffset') * 60 * 1000));
  }.inferior(),
 
  json: function () {
    return '"{0}"'.fmt(this.toISOString());
  },

  __fmt__: (function () {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];

    return function (template) {
      var result = '', i = 0;

      for (; i < template.length; i += 1) {
        switch (template[i]) {
        case 'a':
          result += days[this.get('day')].slice(0, 3);
          break;
        case 'A':
          result += days[this.get('day')];
          break;
        case 'b':
          result += months[this.get('month')].slice(0, 3);
          break;
        case 'B':
          result += months[this.get('month')];
          break;
        case 'c':
          result += "{:A, B H:M:S Y}".fmt(this);
          break;
        case 'd':
          result += "{:02}".fmt(this.get('date'));
          break;
        case 'f':
          result += "{:03}".fmt(this.get('milliseconds'));
          break;
        case 'H':
          result += "{:02}".fmt(this.get('hours'));
          break;
        case 'I':
          result += "{:02}".fmt(this.get('hours') % 12);
          break;
        case 'j':
          result += "{:03}".fmt(Math.ciel(this - new Date(this.get('fullYear'), 0, 1) / 86400000));
          break;
        case 'm':
          result += "{:02}".fmt(this.get('month') + 1);
          break;
        case 'M':
          result += "{:02}".fmt(this.get('minutes'));
          break;
        case 'p':
          result += this.get('hours') > 11 ? "PM" : "AM";
          break;
        case 'S':
          result += "{:02}".fmt(this.get('seconds'));
          break;
        case 'w':
          result += this.get('day');
          break;
        case 'x':
          result += "{:m/d/y}".fmt(this);
          break;
        case 'X':
          result += this.toLocaleTimeString();
          break;
        case 'y':
          result += "{:02}".fmt(this.getYear() % 100);
          break;
        case 'Y':
          result += this.get('fullYear');
          break;
        case 'Z':
          result += this.get('timezoneOffset');
          break;
        default:
          result += template[i];
        }
      }
      return result;
    };
  }())
}).into(Date.prototype);
/*globals mix */

mix(/** @lends Object# */{

  json: function () {
    var key, value, json = [];
    for (key in this) {
      value = this[key];
      if (this.hasOwnProperty(key)) {
        if (!Function.isFunction(value)) {
          json.push("{}:{}".fmt(key.json(), value.json()));
        }
      }
    }
    return "{{{}}}".fmt(json.join(","));
  }.inferior(),

  __fmt__: function (template) {
    String(this).__fmt__(template);
  }.inferior()

}).into(Object.prototype);
/*globals mix */

mix(/** @lends Boolean# */{

  /**
   * Converts a Boolean to valid JSON.
   * {{{
   *   alert(true.json());
   *   // -> "true"
   * }}}
   * @returns {String} The boolean as a JSON string
   */
  json: function () {
    return String(this);
  }

}).into(Boolean.prototype);
/**
 * @class
 * @extends Enumerable
 * @extends Seed
 */
/*globals Hash Seed Enumerable */

Hash = Seed.extend(Enumerable, /** @lends Hash# */{

  /**
   * Iterator
   */
  forEach: function (lambda, self) {
    var k, v;
    for (k in this) {
      v = this.get(k);
      if (k[0] !== '_' && !Function.isFunction(v)) {
        lambda.apply(self, [v, k, this]);
      }
    }
  },

  /**
   * Return all keys on the hash.
   */
  keys: function () {
    return this.map(function (k, v) {
      return k;
    });
  },

  /**
   * Return all values on the hash.
   */
  values: function () {
    return this.map(function (k, v) {
      return v;
    });
  },

  /**
   * Convert the Hash into an Array of tuples.
   * @returns {Array[]} An array of tuples.
   */
  toArray: function () {
    return this.map(function (k, v) {
      return [k, v];
    });
  }

});
