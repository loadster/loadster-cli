const Process = require('process')

module.exports = (exitCode) => {
    console.log(`This is the command line interface for Loadster's cloud-hybrid testing platform.`)
    console.log(`Build scenarios and get trigger codes at https://loadster.app/dashboard/`)
    console.log()
    console.log(`Usage: ${Process.title} run <trigger-code> [--json]`)

    Process.exitCode = exitCode || 0
}