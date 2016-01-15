var Checker = require("jscs");
var Config = require("./config");

function Linter(houndJavascript) {
  this.houndJavascript = houndJavascript;
}

Linter.prototype.lint = function(payload) {
  var config = new Config(payload.config);

  if (config.isValid()) {
    var checker = new Checker();
    checker.registerDefaultRules();

    try {
      checker.configure(config.parse());
    } catch (exception) {
      return this.houndJavascript.reportInvalidConfig({
        pull_request_number: payload.pull_request_number,
        commit_sha: payload.commit_sha,
        linter_name: "jscs",
        message: "Error parsing config for: jscs. " + exception.message
      });
    }

    var results = checker.checkString(payload.content);
    var violations = results.getErrorList().map(function(error) {
      return { line: error.line, message: error.message };
    });

    return this.houndJavascript.completeFileReview({
      violations: violations,
      filename: payload.filename,
      commit_sha: payload.commit_sha,
      pull_request_number: payload.pull_request_number,
      patch: payload.patch,
    });
  } else {
    return this.houndJavascript.reportInvalidConfig({
      pull_request_number: payload.pull_request_number,
      commit_sha: payload.commit_sha,
      linter_name: "jscs",
    });
  }
};

module.exports = Linter;
