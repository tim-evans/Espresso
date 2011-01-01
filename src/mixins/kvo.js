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
