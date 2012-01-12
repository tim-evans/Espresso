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

  subscribe: subscribe,

  unsubscribe: unsubscribe,

  publish: publish

}).into(Espresso);
