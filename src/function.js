/*globals mix _G */

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
      if (!(base instanceof Function)) {
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
          object.subscribe(property, value.bind(object), true);
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
   *   var Person = Root.extend({
   *     firstName: '',
   *     lastName: '',
   * 
   *     fullName: function (k, v) {
   *       return [this.get('firstName'), this.get('lastName')].join(' ');
   *     }.property('firstName', 'lastName')
   *   });
   *
   *   alert(Person.extend({ firstName: "Douglas", lastName: "Crockford" }).get('fullName'));
   * }}}
   * @returns {Function} The reciever.
   */
  property: function () {
    this._ = this._ || {};

    this.isProperty = true;
    this.dependentKeys = Array.prototype.slice.apply(arguments);

    /** @ignore */
    this._.property = function (template, value, key) {
      var i = 0, len = value.dependentKeys.length, object, property, iProperty;
      for (i = 0; i < len; i += 1) {
        property = value.dependentKeys[i];
        object = template;

        if (property.indexOf('.') !== -1) {
          iProperty = property.lastIndexOf('.');
          object = _G.getObjectFor(property.slice(0, iProperty));
          property = property.slice(iProperty + 1);
        }

        if (object && object.subscribe && object.publish) {
          object.subscribe(property, value.bind(object), true);
        }
      }
      return value;
    };

    return this;
  }.inferior(),

  /**
   * Marks the computed property as cacheable.
   * This is inferior, but compatible with SproutCore's cacheable decorator.
   * {{{
   *   var Person = Root.extend({
   *     name: function (k, v) {
   *       alert("Setting my name to {}".fmt(v));
   *       return v;
   *     }.cacheable()
   *   });
   *
   *   var person = Person.extend().set('name', 'Marvin');
   *   // Getting the name multiple times does nothing!
   *   person.get('name');
   *   person.get('name');
   *   person.get('name');
   * }}}
   * @returns {Function} The reciever.
   */
  cacheable: function () {
    this._ = this._ || {};

    var cache = {}, self = this;

    /** @ignore */
    var lambda = function (k, v) {
      if (arguments.length > 1) {
        cache[k] = self.apply(this, arguments);
      }
      return cache[k];
    };
    lambda.isProperty = true;
    lambda.dependentKeys = this.dependentKeys || [];
    return lambda;
  }.inferior()

}).into(Function.prototype);

mix(/** @lends Function.prototype */{

  /**
   * Bind the value of `this` on a function
   * before hand.
   *
   * {{{
   *   var Person = Root.extend({
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
