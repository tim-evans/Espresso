/*global context setup should assert Espresso mix*/

var pubsub;
context("Espresso.PubSub",
  setup(function () {
    pubsub = mix(Espresso.PubSub).into({});
  }),

  should("be defined", function () {
    assert.isTrue(Espresso.PubSub);
  }),

  should("be an Object", function () {
    assert.kindOf("object", Espresso.PubSub);
  }),

  should("have a function named subscribe", function () {
    assert.kindOf("function", Espresso.PubSub.subscribe);
  }),

  context("subscribe",
    should("deliver events to the function passed in when the event happens", function () {
      var win = false;
      pubsub.subscribe("bang", function () {
        win = true;
      }, { synchronous: true });
      assert.isFalse(win);
      pubsub.publish("bang");
      assert.isTrue(win);
    }),

    should("pass all arguments to the function", function () {
      var win = false;
      pubsub.subscribe("bang", function (evt, a, b, c) {
        win = true;
        assert.equal('bang', evt);
        assert.equal('a', a);
        assert.equal('b', b);
        assert.equal('c', c);
      }, { synchronous: true });
      assert.isFalse(win);
      pubsub.publish("bang", 'a', 'b', 'c');
      assert.isTrue(win);
    }),

    context("condition", 
      should("deliver events only if the condition returns true", function () {
        var shot = false;
        pubsub.subscribe("bang", function (evt) {
          shot = true;
        }, { synchronous: true,
             condition: function () { return false; }});
        assert.isFalse(shot);
        pubsub.publish("bang");
        assert.isFalse(shot);
      }),

      should("not barf on subscribe with condition not being a function", function () {
        var shot = false;
        pubsub.subscribe("bang", function (evt) {
          shot = true;
        }, { synchronous: true,
             condition: null });
        assert.isFalse(shot);
        pubsub.publish("bang");
        assert.isTrue(shot);
      }),

      should("pass all arguments to the condition function before being processed by the event", function () {
        var shot = false;
        pubsub.subscribe("bang", function (evt) {
          shot = true;
        }, { synchronous: true,
             condition: function (evt, a, b, c) {
               assert.equal('bang', evt);
               assert.equal('a', a);
               assert.equal('b', b);
               assert.equal('c', c);
               return true;
             }
        });
        assert.isFalse(shot);
        pubsub.publish("bang", 'a', 'b', 'c');
        assert.isTrue(shot);
      })
    )
  ),

  should("have a function named unsubscribe", function () {
    assert.kindOf("function", Espresso.PubSub.unsubscribe);
  }),

  context("unsubscribe",
    should("not deliver events when unsubscribed", function () {
      var win = false, lambda = function () {
        win = true;
      };
      pubsub.subscribe("bang", lambda, { synchronous: true });
      pubsub.publish("bang");
      assert.isTrue(win);
      win = false;
      pubsub.unsubscribe("bang", lambda);
      pubsub.publish("bang");
      assert.isFalse(win);
    })
  ),

  // Publish is tested in tandem with 'subscribe'.
  should("have a function named publish", function () {
    assert.kindOf("function", Espresso.PubSub.publish);
  }),

  context("unpublishedEvent",
    should("get called when an event has no subscribers", function () {
      var win = false;
      pubsub.unpublishedEvent = function () {
        win = true;
      };
      pubsub.publish("mystery");
      assert.isTrue(win);
    }),

    should("not get called if unpublishedEvent is NOT a function", function () {
      pubsub.unpublishedEvent = null;
      pubsub.publish("mystery");
      assert.isTrue(true);
    })
  )
);
