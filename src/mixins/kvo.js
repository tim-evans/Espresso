/*globals _G Seed */
/**
 * @class Seed.KVO
 */
Seed.KVO = /** @lends Seed.KVO# */{

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
   *   var Oxygen = mix(Seed.KVO).into({
   *     symbol: 'O'
   *   });
   *
   *   var Hydrogen = mix(Seed.KVO).into({
   *     symbol: 'H'
   *   });
   *
   *   var water = mix(Seed.KVO).into({
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
        value = object.unknownProperty.apply(object, [key]);
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
   *   var person = Root.extend({
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
    var property, idx = key.lastIndexOf('.'), object;
    if (idx === -1) {
      object = this;
    } else {
      object = _G.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    if (object) {
      property = object[key];

      if (property && property.isProperty) {
        property.apply(object, [key, value]);
      } else if (typeof property === "undefined") {
        object.unknownProperty.apply(object, arguments);
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
   * Called whenever you try to get or set an undefined property.
   *
   * This is a generic property that you can override to intercept
   * general gets and sets, making use out of them.
   * {{{
   *   var trickster = Root.extend({
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
  }.property()

};
