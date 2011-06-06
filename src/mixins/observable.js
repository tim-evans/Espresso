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
    var key = k, value, idx = key.lastIndexOf('.'), object,
        info, refKey;
    if (idx === -1) {
      object = this;
    } else {
      object = Espresso.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

    info = this.__espmeta__[key];
    refKey = key;
    if (info) {
      if (info.closureKey) {
        key = info.closureKey;
      }

      if (info.referenceKey && info.isComputed) {
        refKey = info.referenceKey;
      }
    }

    if (object) {
      value = object[key];
      if (typeof value === "undefined") {
        if (Espresso.isCallable(object.unknownProperty)) {
          value = object.unknownProperty.call(object, refKey);
        } else {
          value = this.unknownProperty(k);
        }
      } else if (value && value.isProperty) {
        if (value.isCacheable) {
          object.__cache__ = object.__cache__ || {};
          if (!object.__cache__.hasOwnProperty(key)) {
            object.__cache__[key] = value.call(object, refKey);
          }
          return object.__cache__[key];
        }
        value = value.call(object, refKey);
      }
      return value;
    }
    return this.unknownProperty(k);
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

    var property, key = k, value = v, idx = key.lastIndexOf('.'), object,
        result, didChange = false, info, refKey, isComputed = false;
    if (idx === -1) {
      object = this;
    } else {
      object = Espresso.getObjectFor(key.slice(0, idx), this);
      key = key.slice(idx + 1);
    }

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

    if (object) {
      property = object[key];

      if (property && property.isProperty) {
        if (property.isIdempotent) {
          object.__value__ = object.__value__ || {};
          if (object.__value__[key] !== value) {
            result = property.call(object, refKey, value);
            didChange = true;
          }
          object.__value__[key] = value;
        } else {
          result = property.call(object, refKey, value);
          didChange = true;
        }

        if (property.isCacheable && didChange) {
          object.__cache__ = object.__cache__ || {};
          object.__cache__[key] = result;
        }
      } else if (typeof property === "undefined") {
        if (Espresso.isCallable(object.unknownProperty)) {
          object.unknownProperty.call(object, key, value);
        } else {
          this.unknownProperty(k, v);
        }
      } else {
        object[isComputed ? refKey : key] = value;
      }

      // Expected behaviour is strange unless publishes
      // are done immediately.
      if (object.publish && !(property && property.isIdempotent && !didChange)) {
        object.publish(refKey, value);
      }
    } else {
      this.unknownProperty(k, v);
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
        if (typeof o === "undefined") {
          root[part] = {};
          root = root[part];
        } else {
          root = o;
        }
      }

      o = root.get ? root.get(parts[len]) : Espresso.getObjectFor(parts[len], root);
      if (typeof o === "undefined") {
        root[parts[len]] = value;
      }
    }
    return Espresso.getObjectFor(key, this);
  }

});
