/*globals Espresso */

/** @namespace

  [Key-Value Observing][kvo] (KVO) is a mechanism that allows
  objects to be notified of changes to specified properties of
  other Objects. It is based off of the observer pattern, which
  in turn is built on top of the Publish-Subscribe pattern.

  KVO is used on top of {@link Espresso.Subscribable} for notifying
  observers that a change occured.

  To understand Key-Value coding, you must understand property
  paths first. This simply means that you need to understand
  the Object model of the object that you are doing a `get` or
  `set` on. Take the following example:

      var Beatles = mix(Espresso.Observable).into({
        Paul: {
          instruments: ['vocals', 'bass', 'guitar', 'piano',
                        'keyboards', 'drums', 'ukelele',
                        'mandolin']
        },
        John: {
          instruments: ['vocals', 'guitar', 'piano', 'banjo',
                        'harmonica', 'mellotron',
                        'six-string bass', 'percussion']
        },
        Ringo: {
          instruments: ['drums', 'vocals', 'percussion',
                        'tambourine']
        },
        George: {
          instruments: ['guitar', 'vocals', 'bass', 'keyboards',
                        'ukelele', 'mandolin', 'sitar', 'tambura',
                        'sarod', 'swarmandal']
        }
      });

      Beatles.initObservable();
      alert(Beatles.getPath('Paul.instruments[0]'));
      // => 'vocals'

  Using `get` provides optimizations such as caching on an Object.

  Using `set` provides notifications to observing functions /
  properties.

  The Observable mixin provides the ability to have dynamically computed
  properties via the `property` decorator on functions and the
  ability to intercept `get`s or `set`s to unknown properties via
  `unknownProperty`.

  Computed properties are simply a function that takes 2 arguments,
  the key and the value of the property that triggered the function
  call. These properties may also have dependent keys. When a
  property has dependent keys, every single time a dependent key
  gets `set`, the property will get recomputed.

  Consider the following:

      var Box = mix(Espresso.Observable).into({
        width: 0,
        height: 0,
        depth: 0,

        volume: Espresso.property(function () {
          return this.get('width') * this.get('height') * this.get('depth');
        }, 'width', 'height', 'depth').cacheable()
      });

  The `volume` property will get recomputed every single time the
  `width`, `height`, or `depth` values change. If you had another
  object that you would like to monitor the changes, perhaps a
  renderer, you could attach observers to each of the properties
  by subscribing to the property path (via
  {@link Espresso.Subscribable#subscribe}), providing any property paths
  that you would like to be notified on.

    [kvo]: http://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/KeyValueObserving/KeyValueObserving.html

  @extends Espresso.Subscribable
 */
Espresso.Observable = mix(Espresso.Subscribable).into(/** @lends Espresso.Observable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isObservable: true,

  /**
    Initialize the observer. This needs to be explicitly
    called to activate property observing.

    When creating your base object for your library, you
    should use the following boilerplate to make property
    observing automatically initialize (with the following
    boilerplate assuming your constructor is called `init`):

        mix({
          init: Espresso.refine(function (original) {
            this.initObservable();
            return original.apply(null, Espresso.A(arguments).slice(1));
          })
        }).into(Espresso.Observable);

    @returns {void}
   */
  initObservable: function () {
    if (this.__isObservableInitialized__) { return; }
    this.__isObservableInitialized__ = true;

    var key, property, i = 0, len, dependents,
        meta = Espresso.meta(this, true),
        dependent, iDependent, object, notifier, tokens;

    /** @ignore */
    notifier = function (key) {
      this.set(key);
    };

    for (key in meta.desc) { // Iterate over all keys
      property = meta.desc[key];

      if (property.watching) {
        dependents = property.watching;
        len = dependents.length;
        for (i = 0; i < len; i += 1) {
          dependent = dependents[i];
          object = this;

          // If it's a property path, follow the chain.
          tokens = Espresso.tokensForPropertyPath(dependent);
          if (tokens.length > 1) {
            object = Espresso.getPath(tokens.slice(0, -2).join('.'));
            dependent = tokens[tokens.length - 1];
          }

          // Subscribe to the events.
          if (object && object.isObservable && object.isSubscribable) {
            object.subscribe(dependent, notifier.bind(this, key), { synchronous: true });
          }
        }
      }
    }
  },

  /**
    Get a value on an object that is a property path.

    This function will return the value given the
    property path using `get` when necessary.

    This means you should write:

        zombie.getPath('brain.isDelicious');

    instead of:

        zombie.get('brain.isDelicious');

    @param {String} key The property path to lookup on the object.
    @returns {Object} The value of the key.
   */
  getPath: function (k) {
    return Espresso.getPath(this, k);
  },

  /**
    Get a value on an object.

    Use this instead of subscript (`[]`) or dot notation
    for public variables. Otherwise, you won't reap benefits
    of being notified when they are set, or if the property
    is computed.

    Get is tolerant of when trying to access objects that
    don't exist- it will return undefined in that case.

    @param {String} key The key to lookup on the object.
    @returns {Object} The value of the key.
   */
  get: function (k) {
    return Espresso.get(this, k);
  },

  /**
    Set a value that is a property path.

    This function will return the value given the
    property path using `set` and `get` when necessary.

    This means you should write:

        zombie.setPath('brain.isDelicious', true);

    instead of:

        zombie.set('brain.isDelicious', true);

    @param {String} key The property path to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  setPath: function (k, v) {
    Espresso.setPath(this, k, v);
    return this;
  },

  /**
    Set a value on an object.

    Use this instead of subscript (`[]`) or dot notation
    for public variables. Otherwise, you won't reap benefits
    of being notified when they are set, or if the property
    is computed.

    Set is tolerant of when trying to access objects that
    don't exist- it will ignore your attempt in that case.

    @param {String} key The key to lookup on the object.
    @param {Object} value The value to set the object at the key's path to.
    @returns {Object} The reciever.
   */
  set: function (k, v) {
    Espresso.set(this, k, v);
    return this;
  },

  /**
    Called whenever you try to get or set a nonexistent
    property.

    This is a generic property that you can override to
    intercept general gets and sets, making use out of them.

    @param {String} key The unknown key that was looked up.
    @param {Object} [value] The value to set the key to.
    @returns {Object} The value of the key.
   */
  unknownProperty: function (key, value) {
    if (arguments.length === 2) {
      this[key] = value;
    }
    return void(0);
  }
});
