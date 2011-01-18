
      .`.`.
     ._____.
    (|     | Espresso
      `---`

## What exactly _is_ this?

Espresso is a JavaScript library that serves as groundwork for developing specialized JavaScript libraries. This means that Espresso acts as a shim, taking care of all of the cross-browser discrepancies, and leaves you to *not worry* about whatever unsupported clients are doing.

In addition to acting as a shim, Espresso provides some espressive mechanisms for mixins, eventing, and observing.


### Mixins

The `mix` function is the gooey center of it all. At it's simplest, it copies over slots on an object to a target object. At it's most complex, it can do feature detection, subscribe to events, provide aliases to functions, and provides a simple way to create diffs / copies of an existing object.

One of the core features to `mix` is the ability to have function decorators. All decorators bundled with the library use the mechanism. They provide a level of readability and a whiff of metaprogramming that make reading your code a pleasure.

The no-frills decorators are the following:

 - `inferior`: tells `mix` *not* to override the base function if
    it exists.
 - `around`: the `super` mechanism of Espresso. The base function
    will be provided as the first argument to your function.
 - `alias`: tells `mix` to mixin the function under the additional
    names given.

In addition to these, there are decorators for the Publish-Subscribe mixin and the Key-Value Observing mixin. These decorators will be discussed in their pertinent sections.


### Publish-Subscribe

The Publish-Subscribe mixin (PubSub) provides a general purpose mechanism for subscribing to an event and being notified when it occurs. Currently, the mixin provides the ability to configure how the events should be delivered to the function (asynchronously or synchronously). The default is asynchronous execution. The mixin also has a hook to handle any events that have no subscribers. This can be used to lazily catch errors, or may be used in a more proactive manner to do some clever metaprogramming. The power is in your hands.

For those who like that sugary stuff, PubSub has a decorator for subscribing to events asynchronously via the `on` decorator.


### Key-Value Observing

The Key-Value Observing mixin (KVO) is inspired by SproutCore's Observable mixin, which was in turn inspired from Cocoa's KVO paradigm.

For those of you not familiar with the KVO, here's a crash course. KVO describes when you register as an observer to changes on a property path. When that property changes, you get notified. Let's break that down a bit. A property path is simply an absolute path to an object like `coffee.isHot`. If `isHot` changes (from `true` to `false`), then you get notified. It's that simple.

To get and set, you need to use `get` and `set` provided by the KVO mixin. These provide all the magic of Key-Value Observing. `get` and `set` provides functionality for computed properties and caching.

The decorators for KVO are the following:

 - `property` marks the property as a computed property. You may do
    `get`s and `set`s on the property now.
 - `cacheable` marks the property as cacheable. `get`ting the value
    more than once will return the cached value.
 - `idempotent` marks the property as idempotent. `set`ting the value
    more than once will not call the computed property again.
 - `observes` notifies the function whenever the dependent keys are
    `set`.

The mixin as of now, is completely compliant with SproutCore's implementation, and will gracefully degrade to using it. Note that it doesn't work the other way around, as Espresso's KVO mixin is dependent on the PubSub mixin.


### Classes and Templates

Espresso has two mechanisms for inheritance. There's a prototypal inheritance through `Template`s and classical inheritance through `Class`es. Both have the same semantics, but have totally different designs and use cases for them. Both mixin `PubSub` and `KVO`.

`Template`s are always instances, and are purely one-offs from an empty object. Every single time a `Template` is `extend`ed, it will be initialized.

`Class`es are always functions, and are instantiated upon creating the object with the `new` operator. A `Class` is instantiated when it is invoked with `new` rather than when `extend`ing an object.


### String Formatting

Espresso provides a powerful string formatting based off of Python's {format} strings. Those familiar with Ruby's #{templates} and .NET's String.Format will be feel right at home with the formatting mechanism provided. This means you can have pretty string templates like `"{pi} is delicious"`.
