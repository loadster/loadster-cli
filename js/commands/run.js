const Axios = require('axios')
const BaseURL = 'https://api.loadsterperformance.com'

module.exports = async (triggerCode, jsonOutput) => {
    try {
        let response = await Axios.post(`${BaseURL}/cloud/triggers/${triggerCode}`)
        let result = response.data

        if (jsonOutput) {
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
