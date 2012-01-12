require('espresso-pubsub');

var publish = Espresso.publish,
    subscribe = Espresso.subscribe,
    CHANGE = ':change', changeSlice = -1 * CHANGE.length,
    WILL_CHANGE = ':before', willChangeSlice = -1 * WILL_CHANGE.length;

/** @ignore */
function willChange(object, key) {
  // If there is no path, assume we're notifying on Espresso.
  if (arguments.length === 1) {
    key = object;
    object = Espresso;
  }

  publish(object, key + WILL_CHANGE);
}

/** @ignore */
function didChange(object, key, value) {
  // If there is no path, assume we're notifying on Espresso.
  if (arguments.length === 1) {
    key = object;
    object = Espresso;
  }

  publish(object, key + CHANGE, value);
}

/** @ignore */
function didChangeXForm(target, method, params) {
  method.call(target, params[0], params[1].slice(0, changeSlice), params[2]);
}

/** @ignore */
function addObserver(object, key, target, fn) {
  return subscribe(object, key + CHANGE, target, fn, didChangeXForm);
}

/** @ignore */
function willChangeXForm(target, method, params) {
  var o = params[0],
      key = params[1].slice(0, willChangeSlice);

  method.call(target, o, key, Espresso.getPath(o, key));
}

/** @ignore */
function addBeforeObserver(object, key, target, fn) {
  return subscribe(object, key + WILL_CHANGE, target, fn, didChangeXForm);
}

/** @ignore */
function removeObserver(object, key, fn) {
  return unsubscribe(object, key + CHANGE, fn);
}

/** @ignore */
function removeBeforeObserver(object, key, fn) {
  return unsubscribe(object, key + WILL_CHANGE, fn);
}

mix(/** @scope Espresso */{

  /** @function
    @desc

    @param {Object} [object] The object to lookup the key on.
      If no object is provided, it will fallback on `Espresso`.
    @param {String} key The key to notify that the property will change.
   */
  propertyWillChange: willChange,

  /** @function
    @desc

    @param {Object} [object] The object to lookup the key on.
      If no object is provided, it will fallback on `Espresso`.
    @param {String} key The key to notify that the property changed on.
    @param {Object} value The new value of the property.
   */
  propertyDidChange: didChange,

  addObserver: addObserver,

  removeObserver: removeObserver,

  addBeforeObserver: addBeforeObserver,

  removeBeforeObserver: removeObserver

}).into(Espresso);
