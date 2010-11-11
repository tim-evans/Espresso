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
