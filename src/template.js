/** @class

  Templates provide inheritance without any classes.

  The idiomatic use of templates is to have generic
  object that uses internal slots to determine what
  to do.

  In Object Oriented design, a constructor would look
  like the following:

      var Person = Espresso.Class.extend({
        init: function (name) {
          this.set('name', name);
        }
      });

      var hoban = new Person("Hoban 'Wash' Washburne");

  Using templates, the equivalent code would be:

      var Person = Espresso.Template.extend({
        name: null // Imply a name
      });

      var hoban = Person.extend({
        name: "Hoban 'Wash' Washburne"
      });

  The end result is straightforward (and transparent)
  object construction.

  The other benefit to using templates over classes
  is the fact that _everything_ is an object, and
  therefore can be extended upon. This allows one-off
  objects to be created from derivative objects, and
  truly encapsulates the concept prototypal inheritance.

  Templates are slightly more advanced than Classes,
  since they are typeless and require stateless objects
  to perform at their best.

  @extends Espresso.PubSub
  @extends Espresso.KVO
 */
/*globals Espresso mix*/
Espresso.Template = mix(Espresso.PubSub, Espresso.KVO, /** @lends Espresso.Template# */{

  /**
    Override `init` to act like a constructor like so:

        var shotgun = Espresso.Template.extend({
          init: function () { alert("bang!"); }
        });

    These constructors will take no arguments,
    and are called after the extending is finished.
    For stacked Espresso.Templates, use `around()` to
    get the super object passed in as the first argument.

    @returns {void}
   */
  init: function () {},

  /**
    Extend a Template with a collection of objects.

    If you use around to get the super argument of the
    base object's function, the function will be augmented
    in such a way that you don't have to set the scope in
    which the function should be called in. Just call the
    function normally, assuming that it is "special" and
    will have `this` reference the current context you're in.
    If you want to, you certainly have the option to apply
    the scope if you want.

    @returns {Espresso.Template} The extended template.

    @example
      var Animal = Espresso.Template.extend({
        move: function (meters) {
          return "{} moved {} m.".fmt(this.name, meters);
        }
      });

      var Snake = Animal.extend({
        move: function ($super) {
          return "Slithering... {}".fmt($super(5));
        }.around()
      });

      var Horse = Animal.extend({
        move: function ($super) {
          return "Galloping... {}".fmt($super(45));
       }.around()
      });

      var sam = Snake.extend({ name: "Sammy the Python" });
      var tom = Horse.extend({ name: "Tommy the Palomino" });

      alert(sam.move());
      // -> "Slithering... Sammy the Python moved 5 m."
      alert(tom.move());
      // -> "Galloping... Tommy the Palomino moved 45 m."
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

  /** @function

    Filters out private variables, functions, and {@link KVO#unknownProperty}
    when parsing to JSON.

    @returns Object The slots to stringify to JSON.
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
