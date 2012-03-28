require('espresso-crema');

var isCallable = Espresso.isCallable,
    metaPath = Espresso.metaPath,
    guidFor = Espresso.guidFor,
    slice = Array.prototype.slice;

/** @ignore */
function subscribe(object, event, target, method, xform) {
  if (!isCallable(method)) {
    throw new TypeError(method + ' is not callable.');
  }

  metaPath(object, ['subscriptions', event, guidFor(target), guidFor(method)], {
    subscriber: method,
    target: target,
    xform: xform
  });
}

/** @ignore */
function unsubscribe(object, event, target, method) {
  var m = metaPath(object, ['subscriptions', event, guidFor(target)]);

  if (m) {
    delete m[guidFor(method)];
  }

  return object;
};

/** @ignore */
function publish(object, event) {
  var targetSets = metaPath(object, ['subscriptions', event]),
      args = slice.apply(arguments),
      subscription,
      set,
      subscriptions, k,
      target, method;

  if (targetSets) {
    for (set in targetSets) {
      subscriptions = targetSets[set];
      for (k in subscriptions) {
        subscription = subscriptions[k];

        target = subscription.target;
        method = subscription.subscriber;

        if (subscription.xform) {
          subscription.xform(target, method, args);
        } else {
          method.apply(target, args);
        }
      }
    }
  }

  return object;
};

mix(/** @scope Espresso */{

  /**
    Subscribe to an events published to any object.

    To do any preprocessing of events, provide an `xform`
    which will be passed the `target`, `method`, and an
    arguments array. The xform can then decide whether the
    event should be delivered or rearrange the parameters
    to better suit the subscriber.

    @param {Object} object
    @param {String} event The event to subscribe to.
    @param {Object} target The scope that the method should be called with.
    @param {Function} method The method that should be called on publishes.
    @param {Function} [xform]
   */
  subscribe: subscribe,

  /**
    @param {Object} object
    @param {String} event
    @param {Object} target
    @param {Function} method
   */
  unsubscribe: unsubscribe,


  /**
    @param {Object} object
    @param {String} event
   */
  publish: publish

}).into(Espresso);
