var HoundJavascript = require("hound-javascript");
var Linter = require("../lib/linter");
var Redis = require("fakeredis");
var lastJob = require("./helpers/redis").lastJob;

QUnit.module("Linter");

asyncTest("JSCS linting", function() {
  var payload = {
    content: "// TODO",
    config: "{ \"disallowKeywordsInComments\": true }",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var redis = Redis.createClient();
  var houndJavascript = new HoundJavascript(redis);
  var linter = new Linter(houndJavascript);

  linter.lint(payload).then(function() {
    lastJob(redis, "high", function(job) {
      start();

      equal(
        job.class,
        "CompletedFileReviewJob",
        "pushes the proper job type"
      );
      deepEqual(
        job.args[0],
        {
          violations: [
            {
              line: 1,
              message: "Comments cannot contain the following keywords: todo, fixme",
            },
          ],
          filename: "filename",
          commit_sha: "commit_sha",
          pull_request_number: "pull_request_number",
          patch: "patch",
        },
        "pushes a job onto the queue"
      );
    });
  });
});

asyncTest("Reporting an invalid configuration file", function() {
  var payload = {
    content: "// TODO",
    config: "---\nyaml: is good\ntrue/false/syntax/error",
    filename: "filename",
    commit_sha: "commit_sha",
    pull_request_number: "pull_request_number",
    patch: "patch",
  };
  var redis = Redis.createClient();
  var houndJavascript = new HoundJavascript(redis);
  var linter = new Linter(houndJavascript);

  linter.lint(payload).then(function() {
    lastJob(redis, "high", function(job) {
      start();

      equal(
        job.class,
        "ReportInvalidConfigJob",
        "pushes the proper job type"
      );
      deepEqual(
        job.args[0],
        {
          commit_sha: "commit_sha",
          pull_request_number: "pull_request_number",
          linter_name: "jscs",
        },
        "pushes a job onto the queue"
      );
    });
  });
});
