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
      assert.equal();
    })
  )
);
