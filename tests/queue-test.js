var Redis = require("fakeredis");
var Queue = require("../lib/queue");
var RSVP = require("rsvp");
var lastJob = require("./helpers/redis").lastJob;

QUnit.module("Queue");

RSVP.on("error", function(error) {
  throw new Error(error);
});

asyncTest("#enqueue", function() {
  var redis = Redis.createClient();
  var queue = new Queue({
    redis: redis,
    queueName: "high",
    jobName: "CompletedFileReviewJob",
  });

  queue.enqueue({
    foo: "bar",
  }).then(function() {
    lastJob(redis, "high", function(job) {
      start();
      equal(job.class, "CompletedFileReviewJob", "pushes the proper job type");
      equal(job.args[0].foo, "bar", "pushes a job onto the queue");
    });
  });
});
