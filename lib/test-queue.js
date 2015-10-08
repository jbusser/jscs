var Queue = require("./lib/queue");

module.exports = function(redis) {
  var inbound = new Queue({
    redis: redis,
    queueName: "jscs_review",
    jobName: "JscsReviewJob",
  });

  inbound.enqueue({
    content: "// TODO",
    config: "{ \"disallowKeywordsInComments\": true }",
  });
};
