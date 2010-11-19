/**
 * @class
 * Publish-Subscribe mixin that provides the basics of eventing.
 *
 * {{{
 *   var sailor = mix(Seed.PubSub, {
 *     name: "",
 *     ahoy: function (action, sailor) {
 *       alert("{0.name}: Ahoy, {1.name}!".fmt(this, sailor));
 *     }
 *   }).into({});
 *
 *   var ship = mix(Seed.PubSub, {
 *     sailors: [],
 *
 *     add: function (sailor, sync) {
 *       this.sailors.push(sailor);
 *       alert("Added {name}".fmt(sailor));
 *       this.publish("add", sailor);
 *       this.subscribe("add", sailor.ahoy.bind(sailor), sync);
 *     }
 *   }).into({});
 *
 *   var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
 *       daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
 *       flapjack = mix(sailor, { name: "Flapjack" }).into({});
 *
 *   ship.add(ahab, true);
 *   ship.add(daveyJones);
 *   ship.add(flapjack);
 * }}}
 */
Seed.PubSub = /** @lends Seed.PubSub# */{

  /** @private */
  _subscriptions: null,

  /**
   * Subscribe to an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   * @param {Boolean} [synchronous] Whether the handler should be called synchronously or not. Defaults to asynchronous calls.
   */
  subscribe: function (event, handler, synchronous) {
    var subscriptions = this._subscriptions || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }
    subscriptions[event].push({ subscriber: handler,
                                synchronous: !!synchronous});
    this._subscriptions = subscriptions;
    return this;
  },

  /**
   * Unsubscribe from an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   */
  unsubscribe: function (event, handler) {
    var subscriptions = this._subscriptions, handlers, i, len;
    if (subscriptions && subscriptions[event]) {
      handlers = subscriptions[event];
      for (i = 0, len = handlers.length; i < len; i += 1) {
        if (handlers[i].subscriber === handler) {
          subscriptions.splice(i, 1);
          break;
        }
      }
    }
    return this;
  },

  /**
   * Publish an event, passing all arguments along to the subscribed functions.
   *
   * @param {Object} event The event to publish.
   */
  publish: function (event) {
    var subscriptions = this._subscriptions,
        args = Array.from(arguments), subscriber;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (subscription) {
        subscriber = subscription.subscriber;
        if (subscription.synchronous) {
          subscriber.apply(subscriber, args);
        } else {
          subscriber.defer.apply(subscriber, args);          
        }
      }.bind(this));
    }
    return this;
  }
};
