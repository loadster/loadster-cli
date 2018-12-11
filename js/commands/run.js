const Axios = require('axios')
const BaseURL = 'https://api.loadsterperformance.com'

async function start (triggerCode, label) {
    let response = await Axios.post(`${BaseURL}/cloud/triggers/${triggerCode}?label=${encodeURI(label || '')}`)

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

module.exports = async (triggerCode, label, json, observe) => {
    try {
        let result = await start(triggerCode, label)

        if (observe) {
            if (!json) {
                console.log(`Test launched! To view it in your browser:\n\n${result.reportUrl}\n`)
            }

            let status

            while (true) {
                status = await get(result.statusUrl)

                if (status.finished || status.failed || status.canceled) {
                    break
                } else if (json) {
                    console.log(JSON.stringify(status))
                } else if (!status.started) {
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
        } else if (json) {
            console.log(JSON.stringify(result, null, 2))
        } else {
            console.log(`${result.message}\n`)

            if (result.reportUrl) {
                console.log(`View the running test or test report in your browser:\n\n${result.reportUrl}\n`)
            }

            if (result.statusUrl) {
                console.log(`Fetch the current test status as JSON at any time:\n\n${result.statusUrl}\n`)
            }

            if (result.reportDataUrl) {
                console.log(`Fetch the test report data as JSON after finishing:\n\n${result.reportDataUrl}\n`)
            }
        }
    } catch (err) {
        throw new Error(`Unable to run test with trigger code ${triggerCode} (${err.response.status})`)
    }
}
