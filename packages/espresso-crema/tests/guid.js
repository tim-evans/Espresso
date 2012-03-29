module('guidFor');
var guidFor = Espresso.guidFor;

test('GUIDs for Boolean values are constants', function () {
  equals(guidFor(true), '(true)');
  equals(guidFor(false), '(false)');
});

test('GUIDs for `null` and `undefined` are constants', function () {
  equals(guidFor(null), '(null)');
  equals(guidFor(undefined), '(undefined)');
});

test('GUIDs for `Object` and `Array` are constants', function () {
  equals(guidFor(Object), '{}');
  equals(guidFor(Array), '[]');
});

test('GUIDs for Numbers are constants', function () {
  var oneMillion = Number('1000000'),
      fourtyTwo = Number('42');

  equals(guidFor(oneMillion), guidFor(1000000));
  equals(guidFor(fourtyTwo), guidFor(42));
  equals(guidFor(NaN), guidFor(NaN));
  equals(guidFor(Infinity), guidFor(Infinity));
  equals(guidFor(-Infinity), guidFor(-Infinity));
});

test('GUIDs for Strings are unique', function () {
  var quote = new String('Life, the Universe and Everything');
  equals(guidFor(quote), guidFor('Life, the Universe and Everything'));
});

test('GUIDs for Objects are unique (and tagged)', function () {
  var o = { hello: 'humans' },
      oo = { o: o };
  equals(guidFor(o), guidFor(oo.o));
});
