(function (root)/** @lends _global_ */{

   var toString = Object.prototype.toString;

   module(module);

   /** @function
     @desc

     Provides a way to make code modules by exporting them
     at readtime to their appropriate namespaces.

     This idea was taken from J. Weir's [namespace][1]
     project and adapted to harness the mixin capabilities
     of Espresso. Creating modules is based off of how Erlang
     modules work, in particular, the `-export` directive (for
     those of you in the know).

     Making a module is as simple as this:

         (function () {
            module("String.prototype", gsub);

            var toString = Object.prototype.toString;

            function gsub(find, replace) {
              if (/string/i.test(toString.call(find))) {
                find = new RegExp(find, 'g');
              }
              return this.replace(find, replace);
            }
         }());

         var song = "I swiped your cat / And I stole your cathodes"
         alert(song.gsub('cat', 'banjo'));

         alert(song.gsub(/\bcat\b/, 'banjo'));

       [1]: http://jweir.github.com/namespace/

     @param {String} [namespace] The namespace to mixin to. Defaults to the root namespace.
     @param {...} exports The functions to export to the namespace.
     @returns {void}
     */
   function module(namespace, exports) {
     var functions = Array.from(arguments), target;

     if (/String/.test(toString.call(namespace))) {
       target = namespace.split('.').reduce(namespaceFor, root);
       functions.shift();
     } else if (Espresso.isCallable(namespace)) {
       target = root;
     }
     mix(mixinFromFunctions(functions)).into(target);
   }

   /** @ignore */
   function namespaceFor(ns, part) {
     ns[part] = ns[part] || {};
     return ns[part];
   }

   /** @ignore */
   function nameFor(lambda) {
     return lambda.name ?
       lambda.name: lambda.toString().match(/^\s*function\s+([^\s\(]+)/)[1];
   }

   /** @ignore */
   function mixinFromFunctions(lambdas) {
     return lambdas.reduce(function (o, lambda) {
       o[nameFor(lambda)] = lambda;
       return o;
     }, {});
   }
}(this));
