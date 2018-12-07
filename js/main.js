const Process = require('process')
const Options = require('command-line-args')

const run = require('./commands/run')
const usage = require('./commands/usage')
const version = require('./commands/version')

const options = Options([
    {
        name: 'command',
        defaultOption: true
    },
    {
        name: 'version',
        alias: 'v',
        type: Boolean
    },
    {
        name: 'json',
        type: Boolean
    },
    {
        name: 'observe',
        type: Boolean
    }
], {stopAtFirstUnknown: true})

const main = async function () {
    const argv = options._unknown || []

    if (options['version']) {
        await version()
    } else if (options['command'] === 'run') {
        if (argv.length > 0) {
            let json = argv.indexOf('--json') >= 0
            let observe = argv.indexOf('--observe') >= 0

            await run(argv[0], json, observe)
        } else {
            await usage(1)
        }
    } else {
        await usage(0)
    }
}

main().catch(err => {
    console.error(err.toString())

    Process.exitCode = 1
})
