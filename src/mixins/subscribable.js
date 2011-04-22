/** @namespace
  Publish-Subscribe is a design pattern that allows
  event broadcasting to subscribed handlers. When an
  event is published to a node, the event is broadcasted
  to all subscribed handlers.

  Events can be filtered at runtime, which can tell
  PubSub whether or not it should publish events to
  that handler, and they can be sent either synchronously
  or asynchronously (the default is asynchronous).

  @example
    var ship = mix(Espresso.Subscribable, {
      sailors: [],

      add: function (sailor, sync) {
        this.sailors.push(sailor);
        alert("Added {name}".fmt(sailor));
        this.publish("add", sailor);
       this.subscribe("add", sailor.ahoy.bind(sailor), { synchronous: !!sync });
      }
    }).into({});

    var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
        daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
        flapjack = mix(sailor, { name: "Flapjack" }).into({});

    ship.add(ahab, true);
    ship.add(daveyJones);
    ship.add(flapjack);
 */
/*global mix Espresso */

Espresso.Subscribable = /** @lends Espresso.Subscribable# */{

  /**
    Walk like a duck.
    @type Boolean
   */
  isSubscribable: true,

  /** @private */
  _subscriptions: null,

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
      throw new TypeError("{} is not callable.".fmt(handler));
    }

    var subscriptions = this._subscriptions || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }

    if (options && options.condition && !Espresso.isCallable(options.condition)) {
      delete options.condition;
    }
    mix({ condition: function () { return true; }.inferior() }).into(options);

    subscriptions[event].push(mix(options, {
      subscriber: handler
    }).into({}));

    this._subscriptions = subscriptions;
    return this;
  },

  /**
    Unsubscribe from an event.

    @param {Object} event The event to subscribe to.
    @param {Function} handler The handler to call when the event is published.
    @returns {Object} The reciever.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this._subscriptions, handlers, i, len;
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
    the function. All unpublished events are `invoke`d rather
    than `defer`red.

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
    var subscriptions = this._subscriptions,
        args = arguments, subscriber, published = false;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        if (Espresso.Scheduler.invoke(subscription.condition, args, this)) {
          subscriber = subscription.subscriber;
          if (subscription.synchronous) {
            Espresso.Scheduler.invoke(subscriber, args, this);
          } else {
            Espresso.Scheduler.defer(subscriber, args, this);
          }
          published = true;
        }
      }, this);
    }
    if (!published && Espresso.isCallable(this.unpublishedEvent)) {
      Espresso.Scheduler.invoke(this.unpublishedEvent, arguments, this);
    }
    return this;
  }
};

/** @namespace

  The scheduler is a mechanism to call functions in an
  abstract fashion. The built-in implementation is
  simplistic and may not meet the needs of your library.

  It's here so you may swap out functionality to suit your
  needs without mucking with moving parts within Espresso.
  You may interpret the functions as you see fit. Just mind
  that mucking with their implementation *will* change how
  notifications are delivered for the {@link Espresso.Subscribable}
  and {@link Espresso.Observable} mixins.
 */
Espresso.Scheduler = {

  /**
    Defers execution until a later time (when the ready
    queue is empty).

    @param {Function} lambda The function to call.
    @param {Array} args The arguments to apply to the function.
    @param {Object} that The object to apply as `this`.
   */
  defer: function (lambda, args, that) {
    that = that || lambda;
    setTimeout(function () {
      lambda.apply(that, args);
    }, 0);
  },

  /**
    Invokes a function immediately.

    @param {Function} lambda The function to call.
    @param {Array} args The arguments to apply to the function.
    @param {Object} that The object to apply as `this`.
   */
  invoke: function (lambda, args, that) {
    that = that || lambda;
    return lambda.apply(that, args);
  }
};
