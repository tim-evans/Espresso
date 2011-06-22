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

      alert(Beatles.get('Paul.instruments.0'));
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

        volume: function () {
          return this.get('width') * this.get('height') * this.get('depth');
        }.property('width', 'height', 'depth').cacheable()
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
   */
  initObservable: function () {
    if (this.__isObservableInitialized__) { return; }
    this.__isObservableInitialized__ = true;

    var key, property, i = 0, len, dependents, meta = this.__espmeta__,
        dependent, iDependent, object, notifier;

    /** @ignore */
    notifier = function (key) {
      this.set(key);
    };

    for (key in meta) { // Iterate over all keys
      if (meta.hasOwnProperty(key) && meta[key].referenceKey) {
        property = this[key];

        if (Espresso.isCallable(property) &&
            property.isProperty && property.dependentKeys) {

          dependents = property.dependentKeys;
          len = dependents.length;
          for (i = 0; i < len; i += 1) {
            dependent = dependents[i];
            object = this;

            // If it's a property path, follow the chain.
            if (dependent.indexOf('.') !== -1) {
              iDependent = dependent.lastIndexOf('.');
              object = Espresso.getObjectFor(dependent.slice(0, iDependent));
              dependent = dependent.slice(iDependent + 1);
            }

            // Subscribe to the events.
            if (object && object.isObservable && object.isSubscribable) {
              object.subscribe(dependent, notifier.bind(this, key), { synchronous: true });
            }
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
    k = k.toString();

    var result = this, key = k, idx;
    while (result != null && k.length > 0) {
      idx = k.indexOf('.');
      key = (idx === -1) ? k : k.slice(0, idx);
      k = (idx === -1) ? "" : k.slice(idx + 1);
      result = result.get ? result.get(key) : result[key];
    }
    return result;
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
    k = k.toString();
    var object = this, value, info, refKey;

    // Retrieve metadata about this property
    info = this.__espmeta__[k];
    refKey = k;
    if (info) {
      if (info.closureKey) {
        k = info.closureKey;
      }

      if (info.referenceKey && info.isComputed) {
        refKey = info.referenceKey;
      }
    }

    value = object[k];
    // Deal with properties
    if (value && value.isProperty) {
      // If the value of the property is cached,
      // retrieve it from the cache and return it.
      if (value.isCacheable) {
        object.__cache__ = object.__cache__ || {};
        if (!object.__cache__.hasOwnProperty(k)) {
          object.__cache__[k] = value.call(object, refKey);
        }
        value = object.__cache__[k];

      // Otherwise, we need to retrieve the value
      } else {
        value = value.call(object, refKey);
      }

    // Unknown properties
    } else if (typeof value === "undefined") {
      value = object.unknownProperty(k);
    }
    return value;
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
    k = k.toString();

    var idx = k.lastIndexOf('.'),
        object = idx === -1 ? this : this.getPath(k.slice(0, idx));

    if (idx !== -1) k = k.slice(idx + 1);
    object && object.set ? object.set(k, v) : object[k] = v;
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
    k = k.toString();

    var property, key = k, value = v, idx = key.lastIndexOf('.'), object = this,
        result, didChange = false, info, refKey, isComputed = false;

    // Retrieve metadata about this property
    info = this.__espmeta__[key];
    refKey = key;
    if (info) {
      if (info.closureKey) {
        key = info.closureKey;
      }

      if (info.referenceKey) {
        refKey = info.referenceKey;
      }
      isComputed = info.isComputed;
    }

    property = object[key];

    // Properties first.
    if (property && property.isProperty) {
      // If setting it multiple times with the same
      // value does nothing, check to see if we should
      // set it again.
      if (property.isIdempotent) {
        object.__value__ = object.__value__ || {};
        if (object.__value__[key] !== value) {
          result = property.call(object, refKey, value);
          didChange = true;
        }
        object.__value__[key] = value;

      // Otherwise, call the property with the key and value.
      } else {
        result = property.call(object, refKey, value);
        didChange = true;
      }

      // Cache the new return from the function
      // so we don't have to waste another lookup later.
      if (property.isCacheable && didChange) {
        object.__cache__ = object.__cache__ || {};
        object.__cache__[key] = result;
      }

    // Unknown property
    } else if (typeof property === "undefined") {
      this.unknownProperty(k, v);

    // Simply set it (taking into account computed ECMAScript5 properties).
    } else {
      object[isComputed ? refKey : key] = value;
    }

    // Expected behaviour is strange unless publishes
    // are done immediately.
    if (object.publish && !(property && property.isIdempotent && !didChange)) {
      object.publish(refKey, value);
    }

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
      var parts = key.split('.'), part, root = this,
          len = parts.length - 1, i = 0, o;
      for (; i < len; i++) {
        part = parts[i];
        o = root.get ? root.get(part) : Espresso.getObjectFor(part, root);

        // Don't mess with existing objects.
        if (typeof o !== "undefined") {
          root = o;

        // Create new Objects when they don't exist
        } else {
          root[part] = {};
          root = root[part];
        }
      }

      part = parts[len];
      if (root[part] != null && root.set) {
        root.set(part, value);
      } else {
        root[part] = value;
      }
    }
    return Espresso.getObjectFor(key, this);
  }

});
