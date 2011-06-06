/** @namespace
  A mixin to apply to callable objects that
  want to be a computed property. This means
  that the property will act like a getter /
  setter, but with notifications via KVO.
 */
Espresso.Property = /** @lends Espresso.Property# */{

  /**
    Walk like a duck.
    @type Boolean
    @default true
   */
  isProperty: true,

  /**
    Whether or not the property should be
    cached when it gets recalculated.
    @type Boolean
    @default false
   */
  isCacheable: false,

  /**
    Whether the property is volatile or not.
    Defaults to being a volatile property.
    @type Boolean
    @default false
   */
  isIdempotent: false,

  /**
    The keys that this property depends on.
    If any of these keys change, the property
    should be notified it did so.
    @type Array
   */
  dependentKeys: null,

  /**
    Marks the property as cacheable.
    @returns {Espresso.Property} The property.
   */
   cacheable: function () {
     this.isCacheable = true;
     return this;
   },

  /**
    Marks the property as idempotent.
    @returns {Espresso.Property} The property.
   */
   idempotent: function () {
     this.isIdempotent = true;
     return this;
   }
};
