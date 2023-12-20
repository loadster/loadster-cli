# Loadster Command Line Interface

This is a simple Loadster Command Line Interface, to work with Loadster's
cloud-hybrid load testing platform at [loadster.app](https://loadster.app).

## Installing the Loadster CLI

We publish official builds to [Releases](https://github.com/loadster/loadster-cli/releases).
You're also welcome to pull down the source and build your own if you prefer.

## Usage

You can print usage instructions and make sure the CLI is installed correctly
with:

```
$ loadster --help
```

Some of the top-level commands have additional flags. You can see them by appending
the command with `--help`. For example, you can see additional help for the `run`
command with:

```
$ loadster run --help
```

## Play a Script

The Loadster CLI can play scripts that exist in your Loadster repository
(the ones visible on your [Loadster Dashboard](https://loadster.app/dashboard/))
or from local .js files on your filesystem.

To play a script, you'll first need to log in to your Loadster account with the CLI.

```
$ loadster login
```

You'll also need to select a project:

```
$ loadster projects list
$ loadster projects use <project-id>
```

Once you're "using" a project, you can play scripts that exist in that project.

To play a script that exists in your Loadster dashboard:

```
$ loadster play <script-id>
```

To play a script on your local filesystem:

```
$ loadster play -f ./examples/protocol-script.js
```

When you play a script, the CLI will print the script logs in real time.
After it finishes, it will give you a URL to view the full script results
in your dashboard, which can be helpful if you need to debug the script.

If a script plays without errors, the CLI will exit with a `0` (successful)
exit code. If there are script errors it will exit with a non-zero exit code.
You can use this if you want to play a script from your CI tool or some other
automation.

## Start a Load Test

You can use this utility to kick off load tests from your Loadster
scenarios. To run a load test, you must first create a scenario in
your [Loadster Dashboard](https://loadster.app/dashboard/), and obtain
the **trigger code** unique to that scenario.

To launch a load test and exit immediately:

```
$ loadster start <trigger-code> [--json]
```

If you include the `--json` flag, the output will be printed in JSON instead
of human-friendly text. This is useful if you're writing your own scripts.
There are a few other flags as well, which you can see with:

```
$ loadster run --help
```

Once the test is launched, the CLI will print out URLs for monitoring the
progress or viewing the live test on your Loadster dashboard.

## Run a Load Test (Blocking)

You can also start a load test, and block until it finishes:

```
$ loadster run <trigger-code> [--json]
```

The `run` option will monitor the test as it runs, printing out high-level
metrics every few seconds. At the end of the test, final test metrics
are printed.

### Assertions

With the `run` option, you can easily evaluate certain high-level metrics
with pass/fail assertions. For example:

```
$ loadster run <trigger-code> --assert 'totalErrors == 0' --assert 'avgHitsPerSecond > 7.5' --assert 'avgBytesPerSecond <= 10000'
```

All assertions are evaluated immediately after the test finishes. If the
test launched successfully and all assertions passed, the process will exit
with a `0` exit code. Otherwise, it will exit with a non-zero exit code.

## Getting Help

This open source CLI is fully supported by [Loadster](https://loadster.app)
as a companion tool to our load testing platform. We would be happy to assist
you if you're having trouble, but also would enjoy hearing how you're using
the Loadster CLI in your Continuous Integration process or for whatever other
situation you find it useful for.

Email us at [support@loadster.app](mailto:support@loadster.app)!
