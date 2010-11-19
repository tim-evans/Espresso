/**
 * @class
 * The root of all other objects stem from.
 * Seeds have support for "Key-Value Observing":http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html
 * a la Cocoa.
 * @extends Seed.PubSub
 * @extends Seed.KVO
 */
/*globals Seed Root mix _G */

Root = mix(Seed.PubSub, Seed.KVO, /** @lends Root# */{

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
   *   var animal = Root.extend({
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

    if (extension.init && extension.init instanceof Function) {
      extension.init();
    }
    return extension;
  },

  /**
   * Convert this object fragment into JSON text.
   * This eschews the JSON.stringify in favor of each
   * native type knowing how to convert itself to JSON
   * using the json() method.
   *
   * {{{
   *   var Person = Root.extend({
   *     _SEP: "(not JSONified- Someone Else's Problem)",
   *   });
   *
   *   var cast = Root.extend({
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
      value = this.get(key);
      if (key.charAt(0) !== "_" && !(value instanceof Function)) {
        json.push("{}:{}".fmt(key.json(), value.json()));
      }
    }
    return "{{{}}}".fmt(json.join(","));
  }

}).into({});
