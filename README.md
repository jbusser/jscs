# Hound JSCS

[JSCS] is a code style linter for programmatically enforcing your style guide.

`hound-jscs` is a Node service that polls `JscsReviewJob`s from the
`jscs_review` queue, lints code with `JSCS`, then pushes the results to
the `high` queue, as `CompletedFileReviewJob`s.

[JSCS]: http://jscs.info/

## Testing locally

First, add the following to the bottom of `index.js`:

```js
var testQueue = require("./lib/test-queue");

testQueue(redis);
```

Next, start the Resque web interface:

```bash
$ cd node_modules/node-resque/resque-web
$ bundle install
$ bundle exec rackup
$ open http://localhost:9292
```

As you run the worker, monitor how jobs flow through the queues.
