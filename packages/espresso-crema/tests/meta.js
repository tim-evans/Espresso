module('meta');
var meta = Espresso.meta,
    o = {};

test('Will return null if not passed with create flag', function () {
  equals(meta(o), undefined);
});

test('Will return an object if passed with the create flag', function () {
  var m = meta(o, true);
  ok(m);

  // Check that the meta key is enumerable
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      equals(o[key], m);
    }
  }
});

test('Is unique across different objects', function () {
  var m1 = meta(o, true),
      m2 = meta({}, true);

  notEqual(m1, m2);
});


module('metaPath');

var metaPath = Espresso.metaPath;

test('that it will return the value of the object if it exists', function () {
  var m = meta(o, true),
      name;

  m.cookie = {};
  m.cookie.monster = 'Cookie Monster';

  name = metaPath(o, ['cookie', 'monster']);
  equals(name, m.cookie.monster);

  name = metaPath(o, ['count', 'van', 'count']);
  equals(name, undefined);
});

test('that it will set the value of the object, setting deep objects', function () {
  // create the meta object
  meta(o, true);

  metaPath(o, ['count', 'van', 'count'], 'Count van Count');
  equals(meta(o).count.van.count, 'Count van Count');
});

test("that it will create the meta object if it doesn't exist", function () {
  metaPath(o, ['cookie', 'monster'], 'Cookie Monster');
  equals(meta(o).cookie.monster, 'Cookie Monster');
});
