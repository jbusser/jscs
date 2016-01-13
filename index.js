var Redis = require("redis");
var Resque = require("node-resque");
var Linter = require("./lib/linter");
var HoundJavascript = require("hound-javascript");

var redis = Redis.createClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

var houndJavascript = new HoundJavascript(redis);
var linter = new Linter(houndJavascript);

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
