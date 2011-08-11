/*global context setup should assert Espresso mix*/

var observable, callCount;
context("Espresso.Observable",
  setup(function () {
    observable = mix(Espresso.Observable, {
      property: 'a',

      nestedProperty: {
        inside: {
          a: {
            nestedProperty: {
              is: 'b'
            }
          }
        }
      },

      _value: 'c',

      computedProperty: Espresso.property(function (k, v) {
        if (arguments.length === 2) {
          this._value = v;
        }
        return this._value;
      }),

      _nestedValue: {
        wont: { work: 'd' }
      },

      nestedComputedProperty: Espresso.property(function () {
        return this._nestedValue;
      })
    }).into({});
    observable.initObservable();
  }),

  should("be defined", function () {
    assert.isTrue(Espresso.Observable);
  }),

  should("be an Object", function () {
    assert.kindOf("object", Espresso.Observable);
  }),

  should("mixin Espresso.Subscribable", function () {
    assert.mixesIn(Espresso.Observable, Espresso.Subscribable);
  }),

  should("have a function named 'get'", function () {
    assert.kindOf("function", Espresso.Observable.get);
  }),

  context("get",
    should("return values that are plain JS objects", function () {
      assert.equal(observable.get('property'), 'a');
    }),

    should("use the `.` notation to get nested properties", function () {
      assert.equal(observable.getPath('nestedProperty.inside.a.nestedProperty.is'), 'b');
    }),

    should("return values that are decorated with `property()`", function () {
      assert.equal(observable.get('computedProperty'), 'c');
    }),

    should("NOT work with nested properties returned by a computed property", function () {
      // shouldn't apply to ECMAScript5 properties
      if ("defineProperty" in Object) return;

      assert.equal(observable.get('nestedComputedProperty.wont.work'), void(0));
    }),

    should("NOT work with nested properties returned by a computed property", function () {
      assert.equal(observable.getPath('nestedComputedProperty.wont.work'), 'd');
    }),

    should("be tolerant of unknown namespaces", function () {
      assert.equal(observable.get('foo.bar.baz.qux.quux'), void(0));
    }),

    should("defer to `unknownProperty` when there is no key on the object", function () {
      var called = false, o;
      o = mix(observable, { unknownProperty: function (k) { called = true; } }).into({});
      o.get('foo');
      assert.isTrue(called);
    }),

    should("`unknownProperty` should be called with the key of the object", function () {
      var called = false, o;
      o = mix(observable, {
        unknownProperty: function (k) {
          assert.equal(arguments.length, 1);
          assert.equal('foo', k);
          called = true;
        }
      }).into({});
      observable.initObservable();
      o.get('foo');
      assert.isTrue(called);
    }),

    context("cacheable",
      setup(function () {
        callCount = 0;

        observable = mix(Espresso.Observable, {
          cacheableProperty: Espresso.property(function (k, v) {
            callCount++;
            return v;
          }).cacheable(),

          foo: 'bar',

          dependentCacheableProperty: Espresso.property(function (k, v) {
            return "{}-{}".format(this.get('foo'), callCount++);
          }, 'foo').cacheable(),

          otherDependentCacheableProperty: Espresso.property(function (k, v) {
            return "{}-{}".format(this.get('foo'), callCount++);
          }, 'foo').cacheable()
        }).into({});
        observable.initObservable();
      }),

      should("call the property only ONCE for the first `get`", function () {
        assert.equal(0, callCount);
        observable.get('cacheableProperty');
        observable.get('cacheableProperty');
        observable.get('cacheableProperty');
        observable.get('cacheableProperty');
        assert.equal(1, callCount);
      }),

      should("not call the property if the property has been `set`", function () {
        assert.equal(0, callCount);
        observable.set('cacheableProperty', 'foo');
        assert.equal(1, callCount);
        assert.equal(observable.get('cacheableProperty'), 'foo');
        assert.equal(observable.get('cacheableProperty'), 'foo');
        assert.equal(1, callCount);
      }),

      should("invalidate the cache when a dependent key is `set`", function () {
        assert.equal(0, callCount);
        assert.equal('bar-0', observable.get('dependentCacheableProperty'));
        assert.equal('bar-1', observable.get('otherDependentCacheableProperty'));
        assert.equal(2, callCount);
        observable.set('foo', 'baz');
        assert.equal(4, callCount);
        assert.equal('baz-2', observable.get('dependentCacheableProperty'));
        assert.equal('baz-3', observable.get('otherDependentCacheableProperty'));
      }),

      should("invalidate the cache before a `get` even takes place if the dependent key was `set`", function () {
        assert.equal(0, callCount);
        observable.set('foo', 'baz');
        assert.equal(2, callCount);
        assert.equal('baz-0', observable.get('dependentCacheableProperty'));
        assert.equal('baz-1', observable.get('otherDependentCacheableProperty'));
      })
    )
  ),

  should("have a function named 'set'", function () {
    assert.kindOf("function", Espresso.Observable.set);
  }),

  context("set",

    should("set the value of native JS properties", function () {
      assert.equal(observable.set('property', 'zorp'), observable);
      assert.equal(observable.get('property'), 'zorp');
    }),

    should("set the value of nested properties", function () {
      assert.equal(observable.set('nestedProperty.inside.a.nestedProperty.is', 'boom'), observable);
      assert.equal(observable.get('nestedProperty.inside.a.nestedProperty.is'), 'boom');
    }),

    should("return values that are decorated with `property()`", function () {
      observable.set('computedProperty', 'zap');
      assert.equal('zap', observable.get('computedProperty'));
    }),

    should("NOT work with nested properties returned by a computed property", function () {
      // shouldn't apply to ECMAScript5 properties
      if ("defineProperty" in Object) return;

      var called = false;
      observable.unknownProperty = function () { called = true; };
      observable.set('nestedComputedProperty.wont.work', 'plop');
      assert.equal('d', observable.getPath('nestedComputedProperty.wont.work'));
      assert.isTrue(called);
    }),

    should("work with nested properties returned by a computed property", function () {
      var called = false;
      observable.setPath('nestedComputedProperty.wont.work', 'plop');
      assert.equal('plop', observable.getPath('nestedComputedProperty.wont.work'));
    }),

    should("be tolerant of unknown namespaces (and call unknownProperty)", function () {
      var called = false;
      observable.unknownProperty = function (k, v) {
        called = true;
      };
      observable.set('foo.bar.baz.qux.quux');
      assert.isTrue(called);
    }),

    context("idempotent",
      setup(function () {
        callCount = 0;
        observable = mix(Espresso.Observable, {
          _value: null,

          idempotentProperty: Espresso.property(function (k, v) {
            if (arguments.length === 2) {
              callCount++;
              this._value = v;
            }
            return this._value;
          }).idempotent().cacheable()
        }).into({});
        observable.initObservable();
      }),

      should("call the property only ONCE for the first `set` using the same value", function () {
        assert.equal(0, callCount);
        observable.set('idempotentProperty', 'once');
        assert.equal(1, callCount);
        observable.set('idempotentProperty', 'once');
        assert.equal(1, callCount);
        assert.equal(observable.get('idempotentProperty'), 'once');
        assert.equal(1, callCount);
      }),

      should("invalidate the cache when a dependent key is `set`", function () {
        assert.equal(0, callCount);
        observable.set('idempotentProperty', 'once');
        assert.equal(1, callCount);
        observable.set('idempotentProperty', 'twice');
        assert.equal(2, callCount);
        assert.equal(observable.get('idempotentProperty'), 'twice');
        assert.equal(2, callCount);
      })
    ),

    context("default unknownProperty",
      should("set the value on the object", function () {
        observable.set("foo", "bar");
        assert.equal(observable.foo, "bar");
      }),

      should("set the value on nested object", function () {
        observable.setPath("nestedProperty.inside.b", "baz");
        assert.equal(observable.getPath('nestedProperty.inside.b'), "baz");
      }),

      should("use preexisting computed properties", function () {
        observable.set("foo.bar.baz", "qux");

        // won't work!
        assert.equal(observable.get("nestedComputedProperty.foo.bar"), null);
      })
    )
  )
);
