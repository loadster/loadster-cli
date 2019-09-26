const Axios = require('axios')
const BaseURL = 'https://api.loadster.app'

async function start (triggerCode, label) {
    let response = await Axios.post(`${BaseURL}/s/${triggerCode}?label=${encodeURI(label || '')}`)

    return response.data
}

module.exports = async (triggerCode, label, json) => {
    try {
        let result = await start(triggerCode, label)

        if (json) {
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
