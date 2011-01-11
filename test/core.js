/*global context setup should assert Espresso*/

var version;
context("Espresso",
  should("be defined", function () {
    assert.isTrue(Espresso);
  }),

  should("have a version attribute on it", function () {
    assert.isTrue(Espresso.VERSION);
  }),

  context("version",
    setup(function () {
      version = Espresso.VERSION.split('.');
    }),

    should("follow the major.minor.patch schema", function () {
      assert.equal(version.length, 3);
      assert.isNumber(version[0]);
      assert.isNumber(version[1]);
      assert.isNumber(version[2]);
    })
  ),

  should("have a function named getObjectFor", function () {
    assert.kindOf('function', Espresso.getObjectFor);
  }),

  context("getObjectFor",
    should("be able to find global objects (with no reference)", function () {
      window.greeting = "hello";
      assert.equal(Espresso.getObjectFor("greeting"), "hello");
    }),

    should("be able to find local objects", function () {
      var o = { greeting: "konnichiwa" };
      assert.equal(Espresso.getObjectFor("greeting", o), "konnichiwa");
    }),

    should("follow . delimited property paths", function () {
      var o = { a: { b: { c: 'd' } } };
      assert.equal(Espresso.getObjectFor("a.b.c", o), "d");
    }),

    should("unpack arrays if unsuccessful in finding the property", function () {
      var o = { greeting: "konnichiwa" };
      assert.equal(Espresso.getObjectFor("greeting", [o]), "konnichiwa");
    })
  ),

  should("have a function named hasValue", function () {
    assert.kindOf('function', Espresso.hasValue);
  }),

  context("getObjectFor",
    should("return false for null values", function () {
      assert.isFalse(Espresso.hasValue(null));
    }),

    should("return false for undefined values", function () {
      var unbound;
      assert.isFalse(Espresso.hasValue(unbound));
    })
  ),

  should("have a function named isCallable", function () {
    assert.kindOf('function', Espresso.isCallable);
  })
);
