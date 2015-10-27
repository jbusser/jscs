var RSVP = require("rsvp");
var Resque = require("node-resque");

function Queue(config) {
  this.queueName = config.queueName;
  this.jobName = config.jobName;
  this.resque = new Resque.queue({
    connection: { redis: config.redis },
  });
}

Queue.prototype.enqueue = function(job) {
  var resque = this.resque;
  var queueName = this.queueName;
  var jobName = this.jobName;

  return new RSVP.Promise(function(resolve, reject) {
    resque.connect(function() {
      resque.enqueue(queueName, jobName, job, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });
};

module.exports = Queue;
