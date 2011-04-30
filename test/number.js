/*global context setup should assert Espresso formatting*/

context("Number",

  // Tests __format__ implementation against PEP 3101
  //   http://www.python.org/dev/peps/pep-3101/
  context("format",
    // Test alignment
    formatting("'{:=3}' with '-1' should return '-  1'"),

    // Test sign
    formatting("'{:+}' with '1' should return '+1'"),
    formatting("'{:+}' with '-1' should return '-1'"),
    formatting("'{:-}' with '1' should return '1'"),
    formatting("'{:-}' with '-1' should return '-1'"),
    formatting("'{: }' with '1' should return ' 1'"),
    formatting("'{: }' with '-1' should return '-1'"),

    // Test zero-padding
    formatting("'{:03}' with '-1' should return '-001'"),

    // Test precision
    formatting("'{:.2}' with '22/7' should return '3.14'"),
    formatting("'{:.0}' with '22/7' should return '3'"),

    // Test types
    formatting("'{:b}' with '10' should return '1010'"),
    formatting("'{:#b}' with '10' should return '0b1010'"),
    formatting("'{:o}' with '10' should return '12'"),
    formatting("'{:#o}' with '10' should return '0o12'"),
    formatting("'{:x}' with '10' should return 'a'"),
    formatting("'{:#x}' with '10' should return '0xa'"),
    formatting("'{:#X}' with '10' should return '0xA'"),
    formatting("'{:c}' with '48' should return '0'"),
    formatting("'{:d}' with '32' should return '32'"),
    // 'n' flag is OS/browser dependent.

    formatting("'{:e}' with '1000' should return '1e+3'"),
    formatting("'{:E}' with '1000' should return '1E+3'"),
    formatting("'{:f}' with 'Math.PI' should return '3.141593'"),
    formatting("'{:.10f}' with 'Math.PI' should return '3.1415926536'"),
    formatting("'{:g}' with '1000' should return '1000'"),
    formatting("'{:g}' with '1e50' should return '1e+50'"),
    formatting("'{:G}' with '1000' should return '1000'"),
    formatting("'{:G}' with '1e50' should return '1E+50'"),
    formatting("'{:%}' with '.10' should return '10%'"),
    formatting("'{}' with '.10' should return '0.1'")
  )
);
