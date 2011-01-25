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

mix(/** @scope Espresso.Class.prototype */{

  /**
    Filters out private variables and functions
    when serializing the JSON to a String.

    @returns {Object} The object hash to use when converting to JSON.
   */
  toJSON: function (key) {
    var k, v, json = {};
    for (k in this) {
      v = this.get ? this.get(k) : this[k];
      if (k.charAt && k.charAt(0) !== "_" && !Espresso.isCallable(v) && k !== 'unknownProperty') {
        json[k] = v;
      }
    }
    return json;
  }
}).into(Espresso.Class.prototype);
