module('mix/into');

test('that mix copies properties passed into `mix` onto the `into` parameter', function () {
  var coffee = {};
  mix({ sugar: 'Yes, please' }).into(coffee);
  equals(coffee.sugar, 'Yes, please');
});

test('that it returns the object passed in on `into`', function () {
  var arcticTern = {};
  equals(arcticTern, mix({ sound: 'Backstreet boys' }).into(arcticTern));
});

test('that all arguments passed into `mix` will be applied to the `into` parameter', function () {
  var coffee = {};
  mix({ sugar: 'Yes, please' },
      { milk: 'Why, thank you' },
      { honey: 'A dab would do fine' }).into(coffee);

  equals('Yes, please', coffee.sugar);
  equals('Why, thank you', coffee.milk);
  equals('A dab would do fine', coffee.honey);  
});

test('that overriding existing properties is allowed', function () {
  var coffee = { sugar: 'Just a teaspoon' };
  equals('Just a teaspoon', coffee.sugar);

  mix({ sugar: 'Yes, please' }).into(coffee);
  equals('Yes, please', coffee.sugar);
});

test('that an error is thrown when mixing into null / undefined values', function () {
  raises(function () {
    mix({}).into(null);
  }, TypeError);

  raises(function () {
    var nil;
    mix({}).into(nil);
  }, TypeError);
});

test('null / undefined values as properties to mixin to a target will be treated as noops', function () {
  var nil;
  ok(mix(null).into({}));
  ok(mix(nil).into({}));
});

test('`hasOwnProperty` is enumerated over', function () {
  var espresso = mix({
    hasOwnProperty: function (k) {
      return k === 'espresso';
    }
  }).into({});
  ok(espresso.hasOwnProperty('espresso'));
});

test('`isPrototypeOf` is enumerated over', function () {
  var espresso = mix({
    isPrototypeOf: function (k) {
      return k === 'espresso';
    }
  }).into({});
  ok(espresso.isPrototypeOf('espresso'));
});

test('`propertyIsEnumerable` is enumerated over', function () {
  var espresso = mix({
    propertyIsEnumerable: function (k) {
      return k === 'espresso';
    }
  }).into({});
  ok(espresso.propertyIsEnumerable('espresso'));
});

test('`toLocaleString` is enumerated over', function () {
  var espresso = mix({
    toLocaleString: function (k) {
      return 'café';
    }
  }).into({});
  equals('café', espresso.toLocaleString());
});

test('`toString` is enumerated over', function () {
  var espresso = mix({
    toString: function () {
      return 'espresso';
    }
  }).into({});
  equals('espresso', espresso.toString());
});

test('`valueOf` is enumerated over', function () {
  var espresso = mix({
    valueOf: function () {
      return 'espresso';
    }
  }).into({});
  equals('espresso', espresso.valueOf());
});

test('decorators should be called on mixin time', function () {
  var called = false,
      o = {};
  Espresso.metaPath(o, ['decorators', 'foo'], function () {
    called = true;
  });

  mix({
    decorator: o
  }).into({});

  ok(called);
});
