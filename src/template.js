/**
 * @class
 * Templates provide inheritance without any classes.
 *
 * @extends Espresso.PubSub
 * @extends Espresso.KVO
 */
/*globals Espresso mix*/
Espresso.Template = mix(Espresso.PubSub, Espresso.KVO, /** @lends Espresso.Template# */{

  /**
   * Override this to act like a constructor.
   *
   * These constructors will take no arguments,
   * and are called after the extending is finished.
   * For stacked Espresso.Templates, use `around()` to get super
   * passed in as the first argument. You can then
   * whenever you please.
   *
   * @returns {void}
   *
   * @example
   *   var shotgun = Espresso.Template.extend({
   *     init: function () {
   *       alert("bang!");
   *     }
   *   });
   */
  init: function () {},

  /**
   * Extend a Template with a collection of objects.
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
   * @returns {Espresso.Template} The extended template.
   *
   * @example
   *   var Animal = Espresso.Template.extend({
   *     move: function (meters) {
   *       return "{} moved {} m.".fmt(this.name, meters);
   *     }
   *   });
   * 
   *   var Snake = Animal.extend({
   *     move: function ($super) {
   *       return "Slithering... {}".fmt($super(5));
   *     }.around()
   *   });
   *
   *   var Horse = Animal.extend({
   *     move: function ($super) {
   *       return "Galloping... {}".fmt($super(45));
   *     }.around()
   *   });
   *
   *   var sam = Snake.extend({ name: "Sammy the Python" });
   *   var tom = Horse.extend({ name: "Tommy the Palomino" });
   *
   *   alert(sam.move());
   *   // -> "Slithering... Sammy the Python moved 5 m."
   *   alert(tom.move());
   *   // -> "Galloping... Tommy the Palomino moved 45 m."
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
   * Filters out private variables and functions.
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
