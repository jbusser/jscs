var Redis = require("redis");
var Resque = require("node-resque");
var Linter = require("./lib/linter");
var Queue = require("./lib/queue");

var redis = Redis.createClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

var outbound = new Queue({
  redis: redis,
  queueName: "high",
  jobName: "CompletedFileReviewJob",
});

var linter = new Linter(outbound);

var worker = new Resque.multiWorker({
  connection: { redis: redis },
  queues: ["jscs_review"],
}, {
  "JscsReviewJob": function(payload, callback) {
    linter.lint(payload).finally(callback);
  }
});

worker.start();

process.on("SIGINT", function(){
  worker.end(function(){
    process.exit();
  });
});
