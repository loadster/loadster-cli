# loadster-cli

This is a simple Loadster Command Line Interface, to work with Loadster's
cloud-hybrid load testing platform at [loadster.app](https://loadster.app).

## Run a Load Test

You can use this utility to kick off load tests from your Loadster
scenarios. To run a load test, you must first create a scenario in
your [Loadster Dashboard](https://loadster.app/dashboard/), and obtain
the **trigger code** unique to that scenario.

To launch a load test and exit immediately:

```
$ loadster run <trigger-code> [--observe] [--json]
```

If you include the `--observe` flag, the process will block while the test
runs, and print stats every few seconds. Otherwise, the process will simply
launch the test and exit immediately.

If you include the `--json` flag, the output will be printed in JSON instead
of human-friendly text. This is useful if you're writing your own scripts.

Once it starts, you can observe the load test in real time
from your Loadster dashboard.
