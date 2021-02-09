const Process = require('process')
const Axios = require('axios')
const BaseURL = 'https://api.loadster.app'

async function start (triggerCode, label) {
    let response = await Axios.post(`${BaseURL}/s/${triggerCode}?label=${encodeURI(label || '')}`)

    return response.data
}

async function get (url) {
    let response = await Axios.get(url)

    return response.data
}

async function sleep (ms) {
    await new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function formatHHMMSS (ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor((ms % 3600000) / 60000)
    let s = Math.floor((ms % 60000) / 1000)

    return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
}

function parseAssertion (str) {
    let regex = /^\s*?(\w+)\s*?([<=>][=]?)\s*?(\w+)\s*?$/
    let parsed = str.match(regex)

    if (parsed.length !== 4) {
        throw new Error(`invalid assertion [${str}]`)
    } else if (isNaN(parseFloat(parsed[3]))) {
        throw new Error(`invalid assertion value [${parsed[3]}] in assertion [${str}]`)
    } else {
        return {
            name: parsed[1],
            operator: parsed[2],
            value: parseFloat(parsed[3])
        }
    }
}

const statusKeys = [
    'runningUsers',
    'responseTimeAverage',
    'responseTimeP90',
    'uploadThroughputBytesPerSecond',
    'downloadThroughputBytesPerSecond',
    'pagesPerSecond',
    'hitsPerSecond',
    'totalPages',
    'totalHits',
    'totalErrors',
    'totalIterations'
]

const reportKeys = [
    'maxUsers',
    'avgBytesPerSecond',
    'maxBytesPerSecond',
    'avgPagesPerSecond',
    'maxPagesPerSecond',
    'avgHitsPerSecond',
    'maxHitsPerSecond',
    'totalBytesTransferred',
    'totalPages',
    'totalHits',
    'totalErrors',
    'totalIterations'
]

const RUNNING = "RUNNING";
const FINISHED = "FINISHED";
const FAILED = "FAILED";
const CANCELED = "CANCELED";

module.exports = async (triggerCode, label, json, assert) => {
    let assertions = (assert || []).map(parseAssertion)

    try {
        let result = await start(triggerCode, label)

        if (!json) {
            console.log(`Test launched! To view it in your browser:\n\n${result.reportUrl}\n`)
        }

        let status

        while (true) {
            status = await get(result.statusUrl)

            if (status.stage === FINISHED || status.stage === FAILED || status.stage === CANCELED) {
                break
            } else if (json) {
                console.log(JSON.stringify(status))
            } else if (status.stage !== RUNNING ) {
                console.log('Test is starting...')
            } else {
                status.runningUsers = status.populations.map(p => p.runningUsers).reduce((t, n) => t + n)

                console.log()
                console.log(`[${formatHHMMSS(status.elapsedTime)}]`)

                for (let statusKey of statusKeys) {
                    console.log(` - ${statusKey}: ${(status[statusKey] || 0).toFixed(2)}`)
                }
            }

            await sleep(5000)
        }

        let report = await get(result.reportDataUrl)

        report.maxUsers = report.maxVirtualUsers

        delete report['jsonDataByProvider']
        delete report['urlsByTotalResponseTime']

        if (json) {
            console.log(JSON.stringify(report))
        } else {
            console.log()

            if (status.finished) {
                console.log('[Finished]')

                for (let reportKey of reportKeys) {
                    console.log(` - ${reportKey}: ${(report[reportKey] || 0).toFixed(2)}`)
                }
            } else if (status.failed) {
                console.log('[Failed]')
            } else if (status.canceled) {
                console.log('[Canceled]')
            }
        }

        if (assertions.length) {
            console.log()
        }

        for (let assertion of assertions) {
            let actual = report[assertion.name]
            let pass = false

            if (assertion.operator === '==') {
                pass = actual === assertion.value
            } else if (assertion.operator === '>=') {
                pass = actual >= assertion.value
            } else if (assertion.operator === '<=') {
                pass = actual <= assertion.value
            } else if (assertion.operator === '>') {
                pass = actual > assertion.value
            } else if (assertion.operator === '<') {
                pass = actual < assertion.value
            }

            if (json) {
                console.log(JSON.stringify({
                    assertion: `${assertion.name} ${assertion.operator} ${assertion.value}`,
                    actual: actual,
                    pass: pass
                }))
            } else {
                console.log(`${pass ? 'PASS' : 'FAIL'} [${assertion.name} ${assertion.operator} ${assertion.value}] (actual: ${actual})`)
            }

            if (!pass) {
                Process.exitCode = 3
            }
        }
    } catch (err) {
        throw new Error(`Unable to run test with trigger code ${triggerCode} (${err.response.status})`)
    }
}
