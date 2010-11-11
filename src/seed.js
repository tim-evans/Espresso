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
