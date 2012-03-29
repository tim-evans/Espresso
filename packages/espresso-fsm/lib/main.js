require('espresso-crema');

var slice = Array.prototype.slice,
    guidFor = Espresso.guidFor;

/** @ignore */
Espresso.get = Espresso.get || function (target, key) {
  return target && target[key];
};

/** @ignore */
Espresso.set = Espresso.set || function (target, key, value) {
  target[key] = value;
  return target;
};

/** @private
  Apply all properties listed in the `stateProperties` property
  on the current state to this object.
 */
function applyStateProperties(fsm) {
  var state = Espresso.get(fsm, 'currentState'),
      properties = Espresso.get(fsm, 'stateProperties'),
      property,
      i = 0, len = properties ? properties.length : 0;

  for (; i < len; i++) {
    property = properties[i];
    Espresso.set(fsm, property, Espresso.get(state, property));
  }
}

/** @private
  Enters a state on the FSM.
 */
function enter(fsm, stateName) {
  var state = Espresso.get(Espresso.get(fsm, 'states'), stateName);

  if (state != null) {
    Espresso.set(fsm, 'currentState', state);
    Espresso.set(fsm, 'currentStateName', stateName);
    fsm.invokeForState('enter');
    applyStateProperties(fsm);
  } else {
    throw new Error("<" + Espresso.get(fsm, 'name') + ":" + guidFor(fsm) + "> Cannot call `enter` on '" + stateName + "' because no corresponding state exists.");
  }
}

function exit(fsm) {
  var state = Espresso.get(fsm, 'currentState');
  if (state != null) {
    fsm.invokeForState('exit');
  } else {
    throw new Error("<" + Espresso.get(fsm, 'name') + ":" + guidFor(fsm) + "> Cannot call `exit` after the FSM has been destroyed.");
  }
}

/** @class
  A very small stand-alone mixin for hand-managed finite
  state machines that have minimal bloat.

  For example, a door:

     function Door () {
       Espresso.init(this);
     };

     Door.states = {
       opened: {
         isOpened: true,
         close: function (door) {
           door.gotoState('closed');
         }
       },

       closed: {
         isOpened: false,
         open: function (door) {
           door.gotoState('opened');
         }
       }
     };

     mix(Espresso.FSM, {
       name: 'Door',
       currentStateName: 'opened',

       states: Door.states,
       stateProperties: ['isOpened'],
       stateActions: ['open', 'close'],
     }).into(Door.prototype);

     door = new Door();
     // door.currentStateName == 'opened'

     door.open();
     // door.currentStateName == 'opened'

     door.close();
     // door.currentStateName == 'closed'

     door.open();
     // door.currentStateName == 'opened'

     door.destroyStates();
     // door.currentStateName == null

 */
Espresso.FSM = {

  /**
    The name of the state machine for debugging purposes.
    @type String
    @default 'FSM'
   */
  name: 'FSM',

  /**
    Whether tracing should be enabled.
    This will show debugging statements when set to `true`.
    @type Boolean
    @default true
   */
  trace: true,

  /**
    A list of properties that should be set upon entering
    a new state. These properties are retrieved on the
    state that was entered and set on the parent state machine.
    @type String[]
    @default null
   */
  stateProperties: null,

  /**
    A list of actions that can be invoked on each state.
    These actions will be defined as functions on the state
    machine that invoke the action on the state, passing along
    all arguments.
    @type String[]
    @default null
   */
  stateActions: null,

  /**
    This gets called right before the first state is entered.
    Do any setup / compute what the first state that should
    be entered here.
   */
  initStates: function () {},

  /** @private
    Exits the currently entered state, cleaning up any
    potential observers. Also sets the `currentState` and
    `currentStateName` to `null`.
   */
  destroyStates: function () {
    var currentState = Espresso.get(this, 'currentStateName');
    if (currentState) {
      if (this.trace) {
        console.log("<" + this.name + ":" + guidFor(this) + "> " +
                    "Exiting " + currentState);
      }
      exit(this);

      // Set all stateful attributes to `null`
      Espresso.set(this, 'currentState', null);
      Espresso.set(this, 'currentStateName', null);
      applyStateProperties(this);
    }
  },

  /**
    The currently active state.
    Set this value on initialization to set the inital state to
    enter the FSM.
    @type String
    @default null
   */
  currentStateName: null,

  /**
    The currently active state.
    @type Object
    @default null
   */
  currentState: null,

  /**
    The states that make up the state machine.
    @type Hash
    @default null
   */
  states: null,

  /**
    Goes to the provided state.
    This will exit the currently entered state, then enter
    the targeted state.

    @param {String} state The state to enter.
   */
  gotoState: function (state) {
    if (this.trace) {
      console.log("<" + this.name + ":" + guidFor(this) + "> " +
                  Espresso.get(this, 'currentStateName') + " => " + state);
    }
    exit(this);
    enter(this, state);
  },

  /**
    Invokes a method on the `currentState` with the given arguments.

    @param {String} method The method to invoke.
    @param {Array} args The arguments to call the method with.
    @returns {Object} Whatever the method invoked returns.
   */
  invokeForState: function (method, args) {
    args = slice.call(args || []);
    args.unshift(this);
    method = Espresso.get(Espresso.get(this, 'currentState'), method);
    return method && method.apply(null, args);
  }

};

/** @private
  This will enter the first state, kicking off state transitions.
 */
Espresso.metaPath(Espresso.FSM, ['init', 'states'], function (target) {
  var actions = Espresso.get(target, 'stateActions'),
      i = 0, len = actions ? actions.length : 0,
      currentState;

  for (; i < len; i++) {
    /** @ignore */
    (function (fsm, action) {
      if (!fsm[action]) {
        fsm[action] = function () {
          return this.invokeForState(action, slice.call(arguments));
        };
      }
    }(target, actions[i]));
  }

  target.initStates && target.initStates();
  currentState = Espresso.get(target, 'currentStateName');

  if (target.trace) {
    console.log("<" + target.name + ":" + guidFor(target) + "> " +
                "Entering " + currentState);
  }

  enter(target, currentState);
});
