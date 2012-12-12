/**
  Espresso PubSub

  @module espresso
  @submodule espresso-pubsub
 */
require('espresso-crema');

var isCallable = Espresso.isCallable,
    metaPath = Espresso.metaPath,
    guidFor = Espresso.guidFor,
    slice = Array.prototype.slice;

/** @ignore */
function subscribe(object, event, method, target, xform) {
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
function unsubscribe(object, event, method, target) {
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
    Subscribe to an event published to an object.

    To do any preprocessing of events, provide an `xform`
    which will be passed the `target`, `method`, and an
    arguments array. The xform can then decide whether the
    event should be delivered or rearrange the parameters
    to better suit the subscriber.

    @method subscribe
    @for Espresso
    @param {Object} object
    @param {String} event The event to subscribe to.
    @param {Function} method The method that should be called on publishes.
    @param {Object} [target] The scope that the method should be called with.
    @param {Function} [xform]
   */
  subscribe: subscribe,

  /**
    Unsubscribe from an event attached by {{#crossLink "Espresso/subscribe"}}{{/crossLink}}.

    @method unsubscribe
    @for Espresso
    @param {Object} object
    @param {String} event The event name
    @param {Function} method The method to call when the event was published
    @param {Object} target The scope that the subscription was made to.
   */
  unsubscribe: unsubscribe,


  /**
    Publish an event to an object, notifying all subscribers
    of the event.

    @method publish
    @for Espresso
    @param {Object} object The object to publish the event on
    @param {String} event The name of the event to publish
    @param {Object} [args]* Any additional arguments to pass along to the subscriber
   */
  publish: publish

}).into(Espresso);
