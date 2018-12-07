const Axios = require('axios')
const BaseURL = 'https://api.loadsterperformance.com'

async function start (triggerCode, label) {
    let response = await Axios.post(`${BaseURL}/cloud/triggers/${triggerCode}?label=${encodeURI(label || '')}`)

    return response.data
}

async function getStatus (statusUrl) {
    let response = await Axios.get(statusUrl)

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

module.exports = async (triggerCode, label, json, observe) => {
    try {
        let result = await start(triggerCode, label)

        if (observe) {
            if (!json) {
                console.log(`Test launched! To view it in your browser:\n\n${result.reportUrl}\n`)
            }

            let status

            while (true) {
                status = await getStatus(result.statusUrl)

                if (status.finished || status.failed || status.canceled) {
                    break
                } else if (json) {
                    console.log(JSON.stringify(status))
                } else if (!status.started) {
                    console.log('Test is starting...')
                } else {
                    let runningUsers = status.populations.map(p => p.runningUsers).reduce((t, n) => t + n)

                    console.log()
                    console.log(`[${formatHHMMSS(status.elapsedTime)}]`)
                    console.log(` - Running V-Users:     ${runningUsers}`)
                    console.log(` - Response Time (avg): ${status.responseTimeAverage.toFixed(2)} s `)
                    console.log(` - Response Time (p90): ${status.responseTimeP90.toFixed(2)} s `)
                    console.log(` - Response Time (p80): ${status.responseTimeP80.toFixed(2)} s `)
                    console.log(` - Upload Throughput:   ${status.uploadThroughputBytesPerSecond.toFixed(0)} bytes/sec`)
                    console.log(` - Download Throughput: ${status.downloadThroughputBytesPerSecond.toFixed(0)} bytes/sec`)
                    console.log(` - Pages per Second:    ${status.pagesPerSecond.toFixed(1)}`)
                    console.log(` - Hits per Second:     ${status.hitsPerSecond.toFixed(1)}`)
                    console.log(` - Total Pages:         ${status.totalPages}`)
                    console.log(` - Total Hits:          ${status.totalHits}`)
                    console.log(` - Total Errors:        ${status.totalErrors}`)
                    console.log(` - Total Iterations:    ${status.totalIterations}`)
                }

                await sleep(5000)
            }

            if (json) {
                console.log(JSON.stringify(status))
            } else {
                console.log()

                if (status.finished) {
                    console.log('Test is finished!')
                } else if (status.failed) {
                    console.log('Test failed!')
                } else if (status.canceled) {
                    console.log('Test canceled!')
                }
            }
        } else if (json) {
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
    } catch (err) {
        throw new Error(`Unable to run test with trigger code ${triggerCode} (${err.response.status})`)
    }
}
