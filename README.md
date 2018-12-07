# loadster-cli

This is a simple Loadster Command Line Interface, to work with Loadster's
cloud-hybrid load testing platform at [loadster.app](https://loadster.app).

It's a work in progress!

## Run a Load Test

You can use this utility to kick off load tests from your Loadster
scenarios. To run a load test, you must first create a scenario in
your [Loadster Dashboard](https://loadster.app/dashboard/), and obtain
the **trigger code** unique to that scenario.

To run a load test:

```
$ loadster run <trigger-code>
```

Once it starts, you can observe the load test in real time
from your Loadster dashboard.
