/*globals mix */

mix(/** @lends Object# */{

  json: function () {
    var key, value, json = [];
    for (key in this) {
      value = this[key];
      if (this.hasOwnProperty(key)) {
        if (!Function.isFunction(value)) {
          json.push("{}:{}".fmt(key.json(), value.json()));
        }
      }
    }
    return "{{{}}}".fmt(json.join(","));
  }.inferior(),

  __fmt__: function (template) {
    String(this).__fmt__(template);
  }.inferior()

}).into(Object.prototype);
