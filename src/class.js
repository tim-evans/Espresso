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
