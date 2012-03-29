
     ( ( (
      ) ) )
     ._____.
    (|     | Espresso
      `---`

Espresso is a JavaScript library that serves as groundwork for developing specialized JavaScript libraries. It acts as a shim and provides some base functionality for mixins, eventing, and observing.


### Mixins

`mix` is the core of Espresso. Simply, it copies over slots on an object to a target object. With it's decorator API, it can mutate the slots at runtime to do some interesting things to object hashes passed into it.

The no-frills decorators provided with Espresso are the following:

 - `inferior`: tells `mix` *not* to override the base function if
    it exists.
 - `refine`: the `super` mechanism of Espresso. The base function
    will be provided as the first argument to your function.
 - `alias`: tells `mix` to mixin the function under the additional
    names given.

In addition to these, there are decorators for the Publish-Subscribe mixin and the Key-Value Observing mixin. These decorators will be discussed in their pertinent sections.


### Publish-Subscribe

The Subscribable mixin provides a general purpose mechanism for subscribing to an event and being notified when it occurs. Currently, the mixin provides the ability to configure how the events should be delivered to the function (asynchronously or synchronously). The default is asynchronous execution. The mixin also has a hook to handle any events that have no subscribers.


### Key-Value Observing

The Observable mixin is inspired by SproutCore's Observable mixin, which was in turn inspired from Cocoa's KVO paradigm.

For those of you not familiar with the KVO, here's the crash course. KVO describes when you register as an observer to changes on a property path. When that property changes, you get notified. Let's break that down a bit. A property path is simply an absolute path to an object like `coffee.isHot`. If `isHot` changes (from `true` to `false`), then you get notified. It's that simple.

To get and set, you need to use `get` and `set` provided by the KVO mixin. These provide all the magic of Key-Value Observing. `get` and `set` provides functionality for computed properties and caching.

The decorators for Observable objects are the following:

 - `property` marks the property as a computed property. You may do
    `get`s and `set`s on the property now.
 - `cacheable` marks the property as cacheable. `get`ting the value
    more than once will return the cached value.
 - `idempotent` marks the property as idempotent. `set`ting the value
    more than once will not call the computed property again.


### String Formatting

Espresso provides a string formatting based off of Python's {format} strings. Those familiar with Ruby's #{templates} and .NET's String.Format should feel comfortable with the formatting schema.
