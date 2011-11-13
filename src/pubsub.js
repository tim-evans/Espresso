(function () {

var isCallable = Espresso.isCallable,
    meta = Espresso.meta,
    guidFor = Espresso.guidFor,
    fmt = Espresso.format,
    A = Espresso.A;

/** @ignore */
function subscribe(object, event, target, method, xform) {
  if (!isCallable(method)) {
    throw new TypeError(fmt("{} is not callable.", method));
  }

  var m = meta(object, true), o,
      keys = ['subscriptions', event, guidFor(target)];

  for (var i = 0, len = keys.length; i < len; i++) {
    o = m[keys[i]] || {};
    m[keys[i]] = o;
    m = o;
  }

  m[guidFor(method)] = {
    subscriber: method,
    target: target,
    xform: xform
  };
}

/** @ignore */
function unsubscribe(object, event, target, method) {
  var m = meta(object, true), o,
      keys = ['subscriptions', event, guidFor(target)];

  for (var i = 0, len = keys.length; i < len; i++) {
    m = m ? m[keys[i]] : null;
  }

  if (m) {
    delete m[guidFor(method)];
  }

  return object;
};

/** @ignore */
function publish(object, event) {
  var m = meta(object),
      args = arguments,
      subscription,
      targetSets, set,
      subscriptions, k,
      target, method;

  if (m && m.subscriptions && m.subscriptions[event]) {
    targetSets = m.subscriptions[event];
    for (set in targetSets) {
      subscriptions = targetSets[set];
      for (k in subscriptions) {
        subscription = subscriptions[k];

        target = subscription.target;
        method = subscription.subscriber;

        if (subscription.xform) {
          subscription.xform(target, method, A(args));
        } else {
          method.apply(target, args);
        }
      }
    }
  }

  return object;
};

mix({

  subscribe: subscribe,

  unsubscribe: unsubscribe,

  publish: publish

}).into(Espresso);

}());
