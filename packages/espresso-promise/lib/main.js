var metaPath = Espresso.metaPath,
    isCallable = Espresso.isCallable;

var FAILED = 'failed',
    FULFILLED = 'fulfilled',
    UNFULFILLED = 'unfulfilled';

var notify = function (promise, args) {
  var m = metaPath(promise, ['promise']),
      state = promise.state();

  if (m.timer) {
    clearTimeout(m.timer);
    delete m.timer;
  }

  if (m.completed) return;

  var callbacks = state === FULFILLED
                  ? m.fulfilledHandlers
                  : m.failedHandlers;

  if (state === UNFULFILLED) {
    throw new TypeError("Cannot notify a promise when it is unfulfilled");
  }

  for (var i = 0, len = callbacks.length; i < len; i++) {
    callbacks[i].apply(m.scope, arguments);
  }
  m.completed = true;
};

/** @class

  Simple implementation of promises / futures / eventuals
  for providing a consistent callback mechanism for any
  kind of asynchronous interations.

  Compare the following snippets of code:

       // without promises
       elodin.sendMessage({
         to: "kote@the.waystone.net",
         body: "Quit grabbing at my tits."
       }, {
         onSuccess: function (response) {
           // handle completion here.
         },
         onError: function (error) {
           // handle failed operation here.
         }
       });


       // with promises
       elodin.sendMessage({
         to: "kote@the.waystone.net",
         body: "Quit grabbing at my tits."
       }).then(function (response) {
         // handle completion here.
       }, function (error) {
         // handle failed operation here.
       });


  While it might seem like a minor change, promises are
  more flexible. Instead of having to deal with lots of
  nested callbacks, `then` can be chained to form a list
  of callbacks that need to be called. These callbacks
  will be invoked in the order that you specify too.

  This brew of promise allows them to be reused multiple
  times by `reset`ing the promise so it can be fired
  again later. If your promise must be fulfilled within
  a certain time limit, you may provide a timeout that
  will cause the promise to fail if nothing else satisfies
  the promise within the time limit.

  To fulfill promises, you can `fulfill` or `smash` the
  promise. Each of these can be called with a number of
  arguments that will be forwarded to the callbacks.

  @see http://en.wikipedia.org/wiki/Futures_and_promises
 */
Espresso.Promise = function (timeout, scope) {
  metaPath(this, ['promise'], {
    fulfilledHandlers: [],
    failedHandlers: [],
    scope: scope,
    timeout: timeout
  });

  this.reset();
};

mix(/** @scope Espresso.Promise.prototype */{

  /** @function
    @constructor
    Initialize the promise.

    @param {Number} [timeout] The timeout that the promise should wait until it smashes them to bits.
    @param {Object} [scope] The scope that the callbacks should be called in.
    @returns {Espresso.Promise} The new promise.
   */

  /**
    The current state for the promise
    (one of `unfulfilled`, `fulfilled`, or `failed`).

    The only valid state transition is
    to `fulfilled` or `failed`. From there,
    no state transition is allowed.

    This is in accordance to CommonJS spec
    of the state of the promise.

    @field
    @type String
    @default "unfulfilled"
   */
  state: function (v) {
    var m = metaPath(this, ['promise']);
    if (arguments.length === 1 &&
        m.state === UNFULFILLED &&
        (v === FULFILLED || v === FAILED)) {
      m.state = v;
    }
    return m.state;
  },

  /**
    Chainable `then` property which will trigger
    the handlers in-order.

    @param {Function} [fulfilledHandler] The function to call when the promise has been fulfilled.
    @param {Function} [failedHandler] The function to call when the promise has failed.
    @returns {Espresso.Promise} The reciever.
   */
  then: function (fulfilledHandler, failedHandler) {
    var m = metaPath(this, ['promise']);
    if (isCallable(fulfilledHandler)) {
      m.fulfilledHandlers.push(fulfilledHandler);
    }

    if (isCallable(failedHandler)) {
      m.failedHandlers.push(failedHandler);
    }
    return this;
  },

  /**
    Fulfill a promise.
    @param {...} [arguments] The arguments to provide to the functions that were promised a callback.
    @returns {void}
   */
  fulfill: function () {
    this.state(FULFILLED);
    return notify(this, arguments);
  },

  /**
    Smash a promise into itty bitty pieces.
    @param {...} [arguments] The arguments to provide to the functions that were promised a callback.
    @returns {void}
   */
  smash: function () {
    this.state(FAILED);
    return notify(this, arguments);
  },

  /**
    Resets the promise back to being unfulfilled.
    This allows for reuse of a single promise
    multiple times.
    @returns {void}
   */
  reset: function () {
    var m = metaPath(this, ['promise']);

    m.state = UNFULFILLED;
    m.completed = false;

    if (m.timeout) {
      m.timer = setTimeout(function () {
        that.smash(new Error("Promise timed out after " + m.timeout + " ms"));
      }, m.timeout);
    }
  }

}).into(Espresso.Promise.prototype);

mix(/** @scope Espresso.Promise */{

 /**
    Constant for the fulfilled state.
    @const
    @type String
    @default 'fulfilled'
   */
  FULFILLED: FULFILLED,

  /**
    Constant for the unfulfilled state.
    @const
    @type String
    @default 'unfulfilled'
   */
  UNFULFILLED: UNFULFILLED,

  /**
    Constant for the failed state.
    @const
    @type String
    @default 'failed'
   */
  FAILED: FAILED

}).into(Espresso.Promise);
