const Process = require('process');

module.exports = (exitCode) => {
  const usage = `
This is the command line interface for Loadster's cloud-hybrid testing platform.

To build your scripts and scenarios, go to: 

    https://loadster.app/dashboard/
    
To start a test and exit:

    ${Process.title} start <trigger-code> [--json] [--label (str)]

        --json             Print output in JSON instead of human-friendly
        --label (str)      Label the test for easy identification later

To run a test, waiting until it finishes:

    ${Process.title} run <trigger-code> [--json] [--label (str)] [--assert (str)]
    
        --json             Print output in JSON instead of human-friendly
        --label (str)      Label the test for easy identification later
        --assert (str)     Assert a value match at the conclusion of a test

Examples of assertions:

        --assert 'totalErrors == 0'
        --assert 'totalPages >= 1500'
        --assert 'avgHitsPerSecond > 7.5'
        --assert 'avgBytesPerSecond <= 10000'
  `.trim();

  console.log(usage + '\n');

  Process.exitCode = exitCode || 0;
};
