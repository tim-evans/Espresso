/*global context setup should assert Espresso mix*/

var E = Espresso;
context("Espresso PubSub",
  should("have a function named subscribe", function () {
    assert.kindOf("function", E.subscribe);
  }),

  context("subscribe",
    should("deliver events to the function passed in when the event happens", function () {
      var shot = false;
      var o = {};

      E.subscribe(o, "bang", null, function () {
        shot = true;
      });
      assert.isFalse(shot);
      E.publish(o, "bang");
      assert.isTrue(shot);
    }),

    should("pass all arguments to the function", function () {
      var shot = false;
      var o = {};

      E.subscribe(o, "bang", null, function (self, evt, a, b, c) {
        shot = true;
        assert.equal(o, self);
        assert.equal('bang', evt);
        assert.equal('a', a);
        assert.equal('b', b);
        assert.equal('c', c);
      });

      assert.isFalse(shot);
      E.publish(o, "bang", 'a', 'b', 'c');
      assert.isTrue(shot);
    }),

    context("target", 
      should("call subscribed function with `this` as the target", function () {
        var shot = false;
        var o = {};

        E.subscribe(o, "bang", o, function () {
          assert.equal(this, o);
          shot = true;
        });
        assert.isFalse(shot);
        E.publish(o, "bang");
        assert.isTrue(shot);
      })
    ),

    context("method", 
      should("throw an error when not a function", function () {
        assert.raises(TypeError, E.subscribe, {}, "bang", null, null);
      })
    ),

    context("xform", 
      should("call the xform function if it's passed in", function () {
        var shot = false, xformCalled = false;
        var o = {}, fn;

        fn = function (a, b, c) {
          shot = true;
          assert.equal(a, 'a');
          assert.equal(b, 'b');
          assert.equal(c, 'c');
        };

        E.subscribe(o, "bang", o, fn, function (target, method, args) {
          assert.equal(o, target);
          assert.equal(method, fn);
          assert.equal(args.length, 5);
          assert.equal(target, args[0]);
          assert.equal("bang", args[1]);
          xformCalled = true;
          method.apply(target, args.slice(2));
        });

        assert.isFalse(shot);
        assert.isFalse(xformCalled);
        E.publish(o, "bang", 'a', 'b', 'c');
        assert.isTrue(shot);
        assert.isTrue(xformCalled);
      })
    )
  ),

  should("have a function named unsubscribe", function () {
    assert.kindOf("function", E.unsubscribe);
  }),

  context("unsubscribe",
    should("not deliver events when unsubscribed", function () {
      var win = false, o = {},
          lambda = function () {
            win = true;
          };

      E.subscribe(o, "bang", o, lambda);
      E.publish(o, "bang");

      assert.isTrue(win);

      win = false;
      E.unsubscribe(o, "bang", o, lambda);
      E.publish(o, "bang");
      assert.isFalse(win);
    })
  ),

  // Publish is tested in tandem with 'subscribe'.
  should("have a function named publish", function () {
    assert.kindOf("function", E.publish);
  })
);
