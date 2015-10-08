module.exports = {
  lastJob: function(redis, queueName, callback) {
    redis.rpop("resque:queue:" + queueName, function(_, jobAsJson) {
      var job = JSON.parse(jobAsJson);

      callback(job);
    });
  }
};
