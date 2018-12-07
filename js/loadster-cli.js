const Package = require('../package.json')
const Process = require('process')
const CommandLineArgs = require('command-line-args')
const Axios = require('axios')
const BaseURL = 'https://api.loadsterperformance.com'

const options = CommandLineArgs([
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

const argv = options._unknown || []

if (options['version']) {
    printVersion()
} else if (options['command'] === 'run') {
    if (argv.length > 0) {
        runTest(argv[0])
    } else {
        printUsage(1)
    }
} else {
    printUsage(0)
}

/**
 * Runs a test by hitting the API with a trigger code.
 */
function runTest (triggerCode) {
    new Promise(async (resolve, reject) => {
        try {
            let response = await Axios.post(`${BaseURL}/cloud/triggers/${triggerCode}`)

            resolve(response.data)
        } catch (err) {
            reject(new Error(`Unable to run test with trigger code ${triggerCode} (${err.response.status})`))
        }
    }).then(result => {
        if (argv.indexOf('--json') >= 0) {
            console.log(JSON.stringify(result, null, 2))
        } else {
            console.log(`${result.message}\n`)

            if (result.statusUrl) {
                console.log(`Fetch the current test status as JSON at any time:\n\n${result.statusUrl}\n`)
            }

            if (result.reportUrl) {
                console.log(`View the running test or test report in your browser:\n\n${result.reportUrl}\n`)
            }
        }
    }).catch(err => {
        printError(err.toString(), 2)
    })
}

/**
 * Prints the version and exits.
 */
function printVersion () {
    console.log(Package.version)
}

/**
 * Prints usage and exits.
 */
function printUsage (exitCode) {
    console.log(`This is the command line interface for Loadster's cloud-hybrid testing platform.`)
    console.log(`Build scenarios and get trigger codes at https://loadster.app/dashboard/`)
    console.log()
    console.log(`Usage: ${Process.title} run <trigger-code> [--json]`)

    Process.exitCode = exitCode
}

/**
 * Prints an error and exits.
 */
function printError (message, exitCode) {
    console.error(message)

    Process.exitCode = exitCode
}
