require('espresso-crema');

var metaPath = Espresso.metaPath,
    isCallable = Espresso.isCallable,
    T_FUNCTION = 'function',
    nextTick;

// IE10 setImmediate support
if (typeof msSetImmediate === T_FUNCTION) {
  nextTick = msSetImmediate.bind(window);

} else if (typeof setImmediate === T_FUNCTION) {
  nextTick = setImmediate;

// http://www.nonblocking.io/2011/06/windownexttick.html 
} if (typeof MessageChannel !== "undefined") {
  var channel = new MessageChannel(),
      head = {},
      tail = head;

  channel.port1.onmessage = function () {
    head = head.next;
    var task = head.task;
    delete head.task;
    task();
  };
  nextTick = function (task) {
    tail = tail.next = { task: task };
    channel.port2.postMessage(0);
  };

// Legacy nextTick
} else {
  nextTick = function (task) {
    setTimeout(task, 0);
  };
}

var isPromise = function (o) {
  return o && isCallable(o.then);
};

var reject = function (reason) {
  return {
    then: function (resolvedHandler, rejectedHandler) {
      var deferrable = defer();
      nextTick(function () {
        deferrable.resolve(rejectedHandler(reason));
      });
      return deferrable.promise;
    }
  };
};

var resolve = function (value) {
  if (isPromise(value)) {
    return value;
  }
  return {
    then: function (resolvedHandler, rejectedHandler) {
      var deferrable = defer();
      nextTick(function () {
        deferrable.resolve(resolvedHandler(value));
      });
      return deferrable.promise;
    }
  };
};

/**
  Creates a new deferrable.
  @returns { promise, resolve }
 */
var defer = function () {
  var pending = [],
      value;

  return {
    resolve: function (resolvedValue) {
      var i, len, pendingTask;
      if (pending) {
        value = resolve(resolvedValue);
        len = pending.length;
        for (i = 0; i < len; i++) {
          nextTick(function (task) {
            return function () {
              value.then.apply(value, task);
            };
          }(pending[i]));
        }
        pending = null;
      }
      return value;
    },
    promise: {
      then: function (resolvedHandler, rejectedHandler) {
        var deferred = defer(),
            resolved,
            rejected;

        if (!isCallable(resolvedHandler)) {
          resolvedHandler = Espresso.K;
        }

        resolved = function (value) {
          deferred.resolve(resolvedHandler(value));
        };

        if (!isCallable(rejectedHandler)) {
          rejectedHandler = function (reason) {
            return reject(reason);
          };
        }

        rejected = function (reason) {
          deferred.resolve(rejectedHandler(reason));
        };

        if (pending) {
          pending.push([resolved, rejected]);
        } else {
          nextTick(function () {
            value.then(resolved, rejected);
          });
        }

        return deferred.promise;
      }
    }
  };
};


/** @class

  Simple implementation of promises / futures / eventuals
  for providing a consistent callback mechanism for any
  kind of asynchronous interaction.

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
       }).then(function (ack) {
         // handle completion here.
       }, function (error) {
         // handle failed operation here.
       });


  While it might seem like a minor change, promises are
  more flexible. Instead of having to deal with lots of
  nested callbacks, `then` can be chained to form a list
  of callbacks that need to be called, which will be
  invoked in the order that you specify.

  @see http://en.wikipedia.org/wiki/Futures_and_promises
 */
mix(/** @scope Espresso */{

  defer: defer,
  reject: reject,
  resolve: resolve,
  isPromise: isPromise,

  when: function (value, resolvedHandler, rejectedHandler) {
    var promise = value;
    if (!isPromise(value)) {
      var deferred = defer();
      deferred.resolve(value);
      promise = deferred.promise;
    }
    promise.then(resolvedHandler, rejectedHandler);

    return promise;
  }
}).into(Espresso);
