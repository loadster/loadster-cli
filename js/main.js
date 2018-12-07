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
    }
], {stopAtFirstUnknown: true})

const main = async function () {
    const argv = options._unknown || []

    if (options['version']) {
        await version()
    } else if (options['command'] === 'run') {
        if (argv.length > 0) {
            await run(argv[0], argv.indexOf('--json') !== -1)
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
