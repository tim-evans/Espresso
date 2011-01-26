/*global context setup should assert Espresso*/

context("Object",

  should("have a function named keys", function () {
    assert.kindOf("function", Object.keys);
  }),

  context("keys",
    should("return the keys on the object instance.", function () {
      var keys = Object.keys({ a: 'a', b: 'b' });
      assert.isTrue(keys.indexOf('a') !== -1);
      assert.isTrue(keys.indexOf('b') !== -1);
    }),

    should("not return keys that aren't it's own property", function () {
      var base = mix({ a: 'a', b: 'b' }).into({});
      var F = function () {};
      F.prototype = base;
      base = new F();
      base = mix({ c: 'c', d: 'd' }).into(base);

      var keys = Object.keys(base);

      assert.isTrue(keys.indexOf('a') === -1);
      assert.isTrue(keys.indexOf('b') === -1);
      assert.isTrue(keys.indexOf('c') !== -1);
      assert.isTrue(keys.indexOf('d') !== -1);
    }),

    should("throw an error if the argument isn't an object", function () {
      assert.raises(TypeError, Object.keys);
      assert.raises(TypeError, Object.keys, null);
      assert.raises(TypeError, Object.keys, undefined);
      assert.raises(TypeError, Object.keys, 0);
      assert.raises(TypeError, Object.keys, "hello");
    })
  ),

  should("have an instance function named __fmt__", function () {
    assert.isTrue(Object.prototype.__fmt__);
  }),

  context("__fmt__",
    should("defer to String.prototype.__fmt__", function () {
      var o = {};
      assert.equal(Espresso.Formatter.fmt("{}", o), "[object Object]");

      o = {
        toString: function () {
          return "object"; 
        }
      };
      assert.equal(Espresso.Formatter.fmt("{}", o), "object");
    })
  )
);
