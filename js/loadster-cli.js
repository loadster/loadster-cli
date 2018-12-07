const Package = require('../package.json')
const Process = require('process')
const CommandLineArgs = require('command-line-args')

const options = CommandLineArgs([
    {
        name: 'command',
        defaultOption: true
    },
    {
        name: 'version',
        alias: 'v',
        type: Boolean
    }
], {stopAtFirstUnknown: true})

if (options['version']) {
    printVersion()
} else if (options['command'] === 'run') {
    const argv = options._unknown || []

    if (argv.length > 0) {
        const testTrigger = argv[0]

        // TODO - run the test
    } else {
        printUsage(1)
    }
} else {
    printUsage(0)
}

function printVersion () {
    console.log(Package.version)
}

function printUsage (exitCode) {
    console.log(`This is the command line interface for Loadster's cloud-hybrid testing platform.`)
    console.log(`Head over to https://loadster.app/dashboard/ to obtain your test triggers.\n`)
    console.log(`Usage: ${Process.title} run <test-trigger>`)

    Process.exitCode = exitCode
}
