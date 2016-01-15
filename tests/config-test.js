var Config = require("../lib/config");

QUnit.module("Config");

test("Parsing a JSCS config file", function() {
  var config = new Config("{ \"esnext\": true }");

  deepEqual(
    config.parse(),
    { esnext: true }
  );
});

test("Having no JSCS config file", function() {
  var config = new Config(null);

  deepEqual(
    config.parse(),
    {}
  );
});

test("Determining a valid configuration file", function() {
  var config = new Config("{ \"esnext\": true }");

  equal(
    config.isValid(),
    true
  );
});

test("Determining an invalid configuration file", function() {
  var config = new Config("---\nyaml: is good\ntrue/false/syntax/error");

  equal(
    config.isValid(),
    false
  );
});
