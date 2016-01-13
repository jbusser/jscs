var Redis = require("fakeredis");
var RSVP = require("rsvp");
var HoundJavascript = require("hound-javascript");
var Linter = require("../lib/linter");
var lastJob = require("./helpers/redis").lastJob;

QUnit.module("Integration");

RSVP.on("error", function(error) {
  throw new Error(error);
});

asyncTest("Linter communicates over resque", function() {
  var redis = Redis.createClient();
  var houndJavascript = new HoundJavascript(redis);
  var linter = new Linter(houndJavascript);

  var inboundJob = {
    content: "// TODO",
    config: "{ \"disallowKeywordsInComments\": true }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  linter.lint(inboundJob).then(function() {
    lastJob(redis, "high", function(job) {
      start();
      var payload = job.args[0];
      var violation = payload.violations[0];

      ok(violation.message.match(/todo/i), "includes the proper message");
      equal(violation.line, 1, "includes the proper line");
      equal(
        payload.filename,
        inboundJob.filename,
        "passes through filename"
      );
      equal(
        payload.commit_sha,
        inboundJob.commit_sha,
        "passes through commit_sha"
      );
      equal(
        payload.pull_request_number,
        inboundJob.pull_request_number,
        "passes through pull_request_number"
      );
      equal(
        payload.patch,
        inboundJob.patch,
        "passes through patch"
      );
    });
  });
});
