mix(/** @scope Espresso */{

  /**
    If the attribute being mixed in exists on the
    Object being mixed in, the function marked as
    inferior will **not** be mixed in. If the base
    function is inferior, it will be overriden.

    @param {Object} target The target to apply the decorator to.
    @param {Object|Function} [condition] If it returns `true`,
      the function is inferior. Otherwise, it isn't.
    @returns {Function} The reciever.
   */
  inferior: function (target, condition) {
    var isInferior = arguments.length === 2 ?
      (Espresso.isCallable(condition) ? condition() : condition) : true;
    if (!isInferior) { return target; }

    target._ = target._ || {};
    target.isInferior = true;

    /** @ignore */
    target._.inferior = function (template, value, key) {
      return (!template[key] || template[key].isInferior) ? value: template[key];
    };

    return target;
  }

}).into(Espresso);
