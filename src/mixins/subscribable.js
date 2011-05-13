/*global mix Espresso */

/** @namespace
  Implements the Observer / Publish-Subscribe pattern.

  Subscribe to events that are published to objects that
  mixin this, and you'll be notified when the events come
  in. If something is published and there are no handlers
  for that specific event, there is a `unpublishedEvent`
  function that will be called whenever an event doesn't
  have any subscribers.

  Publishing an event will use the first argument as the
  event to trigger, and call all the subscription handlers
  with all of the arguments passed into that `publish`.

  Subscribing to an event requires the event that it would
  like to recieve events from and the callback at minimum.

  If extra configuration is wanted, the `options` hash
  provides a way to dynamically have events delivered or
  ignored beforehand (possibly providing lint-checking before
  the event is delivered), and whether the event should
  be delivered synchronously or asynchronously. (By default,
  it's asynchronous).

  @example

      var Clock = mix(Espresso.Subscribable, {
        tick: function () {
          this.time = Date.now();
        }
      }).into({});

      Clock.subscribe("tick", Clock.tick);
      setInterval(Clock.publish.bind(Clock, "tick"), 1000);

 */
Espresso.Subscribable = /** @lends Espresso.Subscribable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isSubscribable: true,

  /** @private */
  __subscriptions__: null,

  /**
    Subscribe to an event.

    @param {Object} event The event to subscribe to.
    @param {Function} handler The handler to call when the event is published.
    @param {Object} [options] Optional parameters.
      @param {Boolean} [options.synchronous] Whether the handler should be called synchronously or not. Defaults to asynchronous calls.
      @param {Function} [options.condition] A mechanism to refine whether a specific event is wanted. Return true if you would like the event, and false if you don't.
    @returns {Object} The reciever.
   */
  subscribe: function (event, handler, options) {
    if (!Espresso.isCallable(handler)) {
      throw new TypeError("{} is not callable.".format(handler));
    }

    var subscriptions = this.__subscriptions__ || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }

    if (options && options.condition && !Espresso.isCallable(options.condition)) {
      delete options.condition;
    }
    options = mix({ condition: function () { return true; }.inferior() }).into(options || {});

    subscriptions[event].push(mix(options, {
      subscriber: handler
    }).into({}));

    this.__subscriptions__ = subscriptions;
    return this;
  },

  /**
    Unsubscribe from an event.

    @param {Object} event The event to subscribe to.
    @param {Function} handler The handler to call when the event is published.
    @returns {Object} The reciever.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this.__subscriptions__, handlers, i, len;
    if (subscriptions && subscriptions[event]) {
      handlers = subscriptions[event];
      for (i = 0, len = handlers.length; i < len; i += 1) {
        if (handlers[i].subscriber === handler) {
          subscriptions[event].splice(i, 1);
          break;
        }
      }
    }
    return this;
  },

  /**
    Gets called when an event has no subscribers to it.

    Override to handle the case when nothing is published.
    (There are no subscribers for an event.)

    Any parameters passed to the event are also passed into
    the function. All unpublished events are invoked immediately
    rather than `defer`red.

    @param {Object} event The event that was ignored.
    @returns {void}
   */
  unpublishedEvent: function (event) {},

  /**
    Publish an event, passing all arguments along to the subscribed functions.

    @param {Object} event The event to publish.
    @returns {Object} The reciever.
   */
  publish: function (event) {
    var subscriptions = this.__subscriptions__,
        args = arguments, subscriber, published = false;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        if (subscription.condition.apply(this, args)) {
          subscriber = subscription.subscriber;
          if (subscription.synchronous) {
            subscriber.apply(this, args);
          } else {
            Espresso.defer(subscriber, args, this);
          }
          published = true;
        }
      }, this);
    }
    if (!published && Espresso.isCallable(this.unpublishedEvent)) {
      this.unpublishedEvent.apply(this, arguments);
    }
    return this;
  }
};
