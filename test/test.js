/*global assert should Espresso*/
assert.isNumber = function (str) {
  if (isNaN(+str)) {
    this.fail("Expected " + this._printObject(str) + " to be a number.");
  }
};

assert.hasValue = function (o) {
  if (typeof o === "undefined" || o === null) {
    this.fail("Expected " + this._printObject(o) + " to be defined.");
  }
};

assert.matches = function (expected, actual) {
  if (!actual.match(expected)) {
    this.fail("Expected " + this._printObject(expected) + " to match " + this._printObject(actual));
  }
};

assert.kindOf = function (type, o) {
  var typ = Object.prototype.toString.call(o),
      re = new RegExp(type, 'i');

  if (!re.test(typ)) {
    this.fail("Expected " + this._printObject(o) + " to be of type " + type + ".");
  }
};

assert.raises = function (err, lambda) {
  var args = Espresso.A(arguments).slice(2),
      caught = false;

  try {
    lambda.apply(null, args);
  } catch (x) {
    caught = true;
    if (!(x instanceof err)) {
      this.fail("Expected " + lambda.toString() + " to throw " + err + ".");
    }
  }

  if (!caught) {
    this.fail("Expected " + lambda.toString() + " to throw " + err + ".");
  }
};

assert.mixesIn = function (o) {
  var mixins = Espresso.A(arguments).slice(1);
  for (var i = 0, len = mixins.length; i < len; i++) {
    for (var k in mixins[i]) {
      if (mixins[i].hasOwnProperty(k) && Espresso.isCallable(mixins[i])) {
        assert.isTrue(o[k]);
      }
    }
  }
};

var formatting = function (spec) {
  var format = Espresso.format.bind(Espresso);
  return should(spec, function () {
    var parts = spec.match(/'([^']+)'( with '(.+)')? should return '([^']*)'/),
        args = parts[2] ? parts[2].match(/'([^']+)'/g): [];

    for (var i = 0, len = args.length; i < len; i++) {
      args[i] = eval('(' + args[i].slice(1, -1) + ')');
    }
    assert.equal(parts.slice(-1), format.apply(null, [].concat(parts[1]).concat(args)));

    assert.equal(parts.slice(-1), parts[1].format.apply(parts[1], args));
  });
};
