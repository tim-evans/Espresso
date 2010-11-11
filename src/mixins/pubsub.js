/**
 * @namespace PubSub
 * Publish-Subscribe mixin that provides the basics of eventing.
 *
 * {{{
 *   var sailor = mix(PubSub, {
 *     name: "",
 *     ahoy: function (action, sailor) {
 *       alert("{0.name}: Ahoy, {1.name}!".fmt(this, sailor));
 *     }
 *   }).into({});
 *
 *   var ship = mix(PubSub, {
 *     sailors: [],
 *
 *     add: function (sailor) {
 *       this.sailors.push(sailor);
 *       this.publish("add", sailor);
 *       this.subscribe("add", sailor.ahoy.bind(sailor));
 *     }
 *   }).into({});
 *
 *   var ahab = mix(sailor, { name: "Captain Ahab" }).into({}),
 *       daveyJones = mix(sailor, { name: "Davey Jones" }).into({}),
 *       flapjack = mix(sailor, { name: "Flapjack" }).into({});
 *
 *   ship.add(ahab);
 *   ship.add(daveyJones);
 *   ship.add(flapjack);
 * }}}
 */
PubSub = /** @lends PubSub# */{

  /** @private */
  _subscriptions: null,

  /**
   * Subscribe to an event.
   *
   * @param {Object} event The event to subscribe to.
   * @param {Function} handler The handler to call when the event is published.
   */
  subscribe: function (event, handler) {
    var subscriptions = this._subscriptions || {};
    if (!subscriptions[event]) {
      subscriptions[event] = [];
    }
    subscriptions[event].push(handler);
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
    var subscriptions = this._subscriptions;
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].remove(handler);
    }
    return this;
  },

  /**
   * Publish an event, passing all arguments along to the subscribed functions.
   * This is done asynchronously, with each callback being deferred.
   *
   * @param {Object} event The event to publish.
   */
  publish: function (event) {
    var subscriptions = this._subscriptions,
        args = Array.from(arguments);
    if (subscriptions && subscriptions[event]) {
      subscriptions[event].forEach(function (v) {
        v.defer.apply(v, args);
      }.bind(this));
    }
    return this;
  }

};
