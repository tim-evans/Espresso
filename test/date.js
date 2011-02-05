/*global context setup should assert Espresso formatting*/

window.date = new Date(1294949214770);
context("Date",

  should("have an instance function named 'toISOString'", function () {
    assert.kindOf('function', (new Date()).toISOString);
  }),

  // Check ISO 8601 specification
  context("toISOString",
    should("conform to the ISO 8601 specification", function () {
      var d = new Date();
      d.toISOString();
    })
  ),

  should("have a flag named 'useUTC'", function () {
    
  }),

  context("fmt",
    formatting("'{:a}' with 'window.date' should return 'Thu'"),
    formatting("'{:A}' with 'window.date' should return 'Thursday'"),
    formatting("'{:b}' with 'window.date' should return 'Jan'"),
    formatting("'{:B}' with 'window.date' should return 'January'"),
    formatting("'{:c}' with 'window.date' should return 'Thu Jan 13 15:06:54 2011'"),
    formatting("'{:d}' with 'window.date' should return '13'"),
    formatting("'{:H}' with 'window.date' should return '15'"),
    formatting("'{:I}' with 'window.date' should return '03'"),
    formatting("'{:j}' with 'window.date' should return '013'"),
    formatting("'{:m}' with 'window.date' should return '01'"),
    formatting("'{:M}' with 'window.date' should return '06'"),
    formatting("'{:p}' with 'window.date' should return 'PM'"),
    formatting("'{:S}' with 'window.date' should return '54'"),
    formatting("'{:U}' with 'window.date' should return '02'"),
    formatting("'{:w}' with 'window.date' should return '4'"),
    formatting("'{:W}' with 'window.date' should return '02'"),
    formatting("'{:x}' with 'window.date' should return '01/13/11'"),
    formatting("'{:X}' with 'window.date' should return '15:06:54'"),
    formatting("'{:y}' with 'window.date' should return '11'"),
    formatting("'{:Y}' with 'window.date' should return '2011'")
  )
);
