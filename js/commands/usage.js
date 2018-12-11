const Process = require('process')

module.exports = (exitCode) => {
    console.log(`This is the command line interface for Loadster's cloud-hybrid testing platform.`)
    console.log(`To build Loadster test scenarios and get trigger codes, go to:`)
    console.log()
    console.log(`    https://loadster.app/dashboard/`)
    console.log()
    console.log(`To start a test and exit:`)
    console.log()
    console.log(`    ${Process.title} start <trigger-code> [--json] [--label (str)]`)
    console.log()
    console.log(`        --json             Print output in JSON instead of human-friendly`)
    console.log(`        --label (str)      Label the test for easy identification later`)
    console.log()
    console.log(`To run a test, waiting until it finishes:`)
    console.log()
    console.log(`    ${Process.title} run <trigger-code> [--json] [--label (str)] [--assert (str)]`)
    console.log()
    console.log(`        --json             Print output in JSON instead of human-friendly`)
    console.log(`        --label (str)      Label the test for easy identification later`)
    console.log(`        --assert (str)     Assert a value match at the conclusion of a test`)
    console.log()
    console.log(`Examples of assertions:`)
    console.log()
    console.log(`        --assert 'totalErrors == 0'`)
    console.log(`        --assert 'totalPages >= 1500'`)
    console.log(`        --assert 'avgHitsPerSecond > 7.5'`)
    console.log(`        --assert 'avgBytesPerSecond <= 10000'`)


    Process.exitCode = exitCode || 0
}