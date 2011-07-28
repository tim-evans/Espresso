/*globals mix Espresso */

mix(/** @lends Function.prototype */{

  /** @function
    @desc
    Bind the value of `this` on a function before hand,
    with any extra arguments being passed in as initial
    arguments.

    This implementation conforms to the ECMAScript 5
    standard.

        var barista = function (tpl) {
          alert(tpl.format(this));
          return arguments.callee.bind(this, "Order up! Your {} is ready!");
        };

        orderUp = barista.call("espresso", "I would like an {}");
        // -> "I would like an espresso."

        orderUp();
        // -> "Order up! Your espresso is ready!"

    @param {Object} thisArg The value to bind `this` to on the function.
    @returns {Function} The function passed in, wrapped to ensure `this`
      is the correct scope.
   */
  bind: Espresso.inferior(function (self) {
    var Target, A;

    // 1. Let Target be the this value.
    Target = this;

    // 2. If IsCallable(Target) is false, throw a TypeError exception
    if (!Espresso.isCallable(Target)) {
      throw new TypeError("The Target is not callable.");
    }

    // 3. Let A be a new (possibly empty) internal list of
    //    all argument values provided after self
    //    (arg1, arg2, etc), in order
    A = Espresso.A(arguments).slice(1);

    var bound = function () {

      if (this instanceof bound) {
        // 15.3.4.5.2 [[Construct]]
        // When the [[Construct]] internal method of a function object, F,
        // that was created using the bind function is called with a list of
        // arguments ExtraArgs, the following steps are taken:

        // 1. Let the target be the value of F's [[TargetFunction]] internal property.
        // 2. If target has no [[Construct]] internal method, a TypeError exception is thrown.
        // 3. Let boundArgs be the value of F's [[BoundArgs]] internal property.
        // 4. Left args be a new list containing the same values as the list boundArgs in the same order followed by the same values as the list ExtraArgs in the same order.
        // 5. Return the result of calling the [[Construct]] internal method of target providing args as the arguments.
        var Type = function () {}, that;
        Type.prototype = Target.prototype;
        that = new Type();

        Target.apply(that, A.concat(Espresso.A(arguments)));
        return that;
      } else {
        // 15.3.4.5.1 [[Call]]
        // When the [[Call]] internal method of a function object, F,
        // which was created using the bind function is called with a this
        // value and a list of arguments ExtraArgs, the following steps are taken:
        // 1. Let boundArgs be the value of F's [[BoundArgs]] internal property.
        // 2. Let boundThis be the value of F's [[BoundThis]] internal property.
        // 3. Let target be the value of F's [[TargetFunction]] internal property.
        return Target.apply(self, A.concat(Espresso.A(arguments)));
      }
    };
    return bound;
  })

}).into(Function.prototype);
