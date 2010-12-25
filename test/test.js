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

assert.kindOf = function (type, o) {
  var typ = Object.prototype.toString.call(o),
      re = new RegExp(type, 'i');

  if (!re.test(typ)) {
    this.fail("Expected " + this._printObject(o) + " to be of type " + type + ".");
  }
};

assert.raises = function (err, lambda) {
  var args = Array.from(arguments).slice(2),
      caught = false;

  try {
    lambda.apply(args);    
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
  var mixins = Array.from(arguments).slice(1);

  for (var i = 0, len = mixins.length; i < len; i++) {
    for (var j = 0, l = mixins[i].length; j < l; j++) {
      assert.isTrue(o[mixins[i]][j]);
    }
  }
};

var fmt = Espresso.Formatter.fmt.bind(Espresso.Formatter);
var formatting = function (spec) {
  return should(spec, function () {
    var parts = spec.match(/'([^']+)'( with '(.+)')? should return '([^']+)'/),
        args = parts[2] ? parts[2].match(/'([^']+)'/g): [];

    for (var i = 0, len = args.length; i < len; i++) {
      args[i] = eval('(' + args[i].slice(1, -1) + ')');
    }
    assert.equal(fmt.apply(null, [].concat(parts[1]).concat(args)), parts.slice(-1));

    assert.equal(parts[1].fmt.apply(parts[1], args), parts.slice(-1));
  });
};