/*global context setup should assert Espresso formatting*/

context("Formatter", 
  should("have a function named format", function () {
    assert.kindOf("function", Espresso.format);
  }),

  context("format",
    // Regular arguments
    formatting("'{}' with '\"espresso\"' should return 'espresso'"),
    formatting("'{}' with '[0, 1, 2]' should return '0,1,2'"),

    // Escaped braces
    formatting("'{{' should return '{'"),

    // Automatically unpacking arrays
    formatting("'{}' with '[0]' should return '0'"),
    formatting("'{0}' with '[0]' should return '0'"),

    // Indexing
    formatting("'{0}' with '\"espresso\"' should return 'espresso'"),
    formatting("'{1} and {0}' with '\"cigarettes\"' and '\"coffee\"' should return 'coffee and cigarettes'"),

    // Auto-indexing
    formatting("'{} and {}' with '\"coffee\"' and '\"cigarettes\"' should return 'coffee and cigarettes'"),

    // Property indexing
    formatting("'{0.name}' with '{ name: \"Bill Murray\" }' should return 'Bill Murray'"),
    formatting("'{name}' with '{ name: \"Bill Murray\" }' should return 'Bill Murray'"),

    // Syntax errors
    should("throw an error when encountering unmatched braces", function () {
      assert.raises(Error, Espresso.format.bind(Espresso),
                    "{answer", { answer: 42 });
    }),

    // Deferring specification formatting
    should("defer the formatting spec to the object", function () {
      var spec = 'abc', template = "{:" + spec + "}", called = false;
      var obj = {
        __format__: function (s) {
          called = true;
          assert.equal(spec, s);
        }
      };
      Espresso.format(template, obj);
      assert.isTrue(called);
    })
  ),

  should("have a field named SPECIFIER", function () {
    assert.kindOf("regexp", Espresso.FORMAT_SPECIFIER);
  })

);
