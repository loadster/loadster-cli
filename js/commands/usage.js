const Process = require('process')

module.exports = (exitCode) => {
    console.log(`This is the command line interface for Loadster's cloud-hybrid testing platform.`)
    console.log(`Build scenarios and get trigger codes at https://loadster.app/dashboard/`)
    console.log()
    console.log(`Usage: ${Process.title} run <trigger-code> [--observe] [--json]`)
    console.log()
    console.log(`Options:`)
    console.log(`    --observe    Block while the test runs and print live stats`)
    console.log(`    --json       Print output in JSON instead of human-friendly`)

    Process.exitCode = exitCode || 0
}