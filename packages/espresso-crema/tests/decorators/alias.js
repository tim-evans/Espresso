module('decorators/alias');

test('make a function alias when annotated as such', function () {
  var result = mix({
    coffee: Espresso.alias(function () {
      return 'caffeine';
    }, 'cafe', 'koffie')
  }).into({});

  equals('caffeine', result.coffee());
  equals(result.cafe, result.coffee);
  equals(result.koffie, result.coffee);
});
