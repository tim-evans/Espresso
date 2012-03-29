module('FSM/init');

test('calling Espresso.init should call `initStates`', function () {
  var fsm, isCalled;
  fsm = mix(Espresso.FSM, {
    currentStateName: 'A',
    initStates: function () {
      isCalled = true;
    },
    states: {
      A: {}
    }
  }).into({});

  ok(!isCalled, 'initStates should not be called yet');
  Espresso.init(fsm);
  ok(isCalled, 'initStates should have been called');
});

test('calling Espresso.init should call `enter` on the state with the name `currentStateName`', function () {
  var fsm, isCalled;
  fsm = mix(Espresso.FSM, {
    currentStateName: 'opened',
    states: {
      opened: {
        enter: function () {
          isCalled = true;
        }
      }
    }
  }).into({});

  ok(!isCalled, '`enter` should not be called yet');
  Espresso.init(fsm);
  ok(isCalled, '`enter` should have been called');
});

test('`enter` should be called after `initStates`', function () {
  var fsm, isCalled;
  fsm = mix(Espresso.FSM, {
    states: {
      opened: {
        enter: function () {
          isCalled = true;
        }
      }
    },
    initStates: function () {
      this.currentStateName = 'opened';
    }
  }).into({});

  ok(!isCalled, '`enter` should not be called yet');
  Espresso.init(fsm);
  ok(isCalled, '`enter` should have been called');
});

test("`stateProperties` should be set on initialization", function () {
  var fsm, isCalled;
  fsm = mix(Espresso.FSM, {
    currentStateName: 'A',
    stateProperties: ['bool', 'string', 'nully'],
    states: {
      A: {
        bool: true,
        string: 'hello',
        nully: null,
        ignored: 'TROLOLOLO'
      }
    }
  }).into({});

  ok(!fsm.hasOwnProperty('bool'), "`bool` shouldn't have been set yet");
  ok(!fsm.hasOwnProperty('string'), "`string` shouldn't have been set yet");
  ok(!fsm.hasOwnProperty('nully'), "`nully` shouldn't have been set yet");
  ok(!fsm.hasOwnProperty('ignored'), "`ignored` shouldn't have been set");

  Espresso.init(fsm);

  equals(fsm.bool, true, "`bool` should have been set to `true`");
  equals(fsm.string, 'hello', "`string` should have been set to `'hello'`");
  equals(fsm.nully, null, "`nully` should have been set to `null`");
  ok(!fsm.hasOwnProperty('ignored'), "`ignored` shouldn't have been set");
});

test("`stateActions` should be created on initialization", function () {
  var fsm, isCalled = {};
  fsm = mix(Espresso.FSM, {
    currentStateName: 'A',
    stateActions: ['burp', 'belch', 'cough'],
    burp: function () {},
    states: {
      A: {
        burp: function () {
          isCalled.burp = true;
        },
        belch: function () {
          isCalled.belch = true;
        },
        cough: function () {
          isCalled.cough = true;
        }
      }
    }
  }).into({});

  Espresso.init(fsm);

  ok(fsm.burp, "`burp` should be defined");
  ok(fsm.belch, "`belch` should be defined");
  ok(fsm.cough, "`cough` should be defined");

  fsm.burp();
  ok(!isCalled.burp, "`burp` should have not been called");

  fsm.belch();
  ok(isCalled.belch, "`belch` should have been called");

  fsm.cough();
  ok(isCalled.cough, "`cough` should have been called");

});

test("`currentState` should be set to the state object", function () {
  var fsm = mix(Espresso.FSM, {
    currentStateName: 'A',
    states: {
      A: {}
    }
  }).into({});

  equals(fsm.currentState, null, "no current state should've been set yet");
  Espresso.init(fsm);
  equals(fsm.currentState, fsm.states.A, "no current state should been set");
});
