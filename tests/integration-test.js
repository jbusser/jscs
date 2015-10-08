var Redis = require("fakeredis");
var RSVP = require("rsvp");
var Linter = require("../lib/linter");
var Queue = require("../lib/queue");
var lastJob = require("./helpers/redis").lastJob;

QUnit.module("Integration");

RSVP.on("error", function(error) {
  throw new Error(error);
});

asyncTest("Linter communicates over resque", function() {
  var redis = Redis.createClient();
  var outbound = new Queue({
    redis: redis,
    queueName: "high",
  });
  var linter = new Linter(outbound);

  linter.lint({
    content: "// TODO",
    config: "{ \"disallowKeywordsInComments\": true }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  }).then(function() {
    lastJob(redis, "high", function(job) {
      start();
      var payload = job.args[0];
      var violation = payload.violations[0];

      ok(violation.message.match(/todo/i), "includes the proper message");
      equal(violation.line, 1, "includes the proper line");
      equal(job.filename, job.filename, "passes through filename");
      equal(job.commit_sha, job.commit_sha, "passes through commit_sha");
      equal(
        job.pull_request_number,
        job.pull_request_number,
        "passes through pull_request_number"
      );
      equal(job.patch, job.patch, "passes through patch");
    });
  });
});
