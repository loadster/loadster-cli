module.exports = ({ axios }) => {
  return async function (triggerCode, label, json) {
    try {
      let response = await axios.post(`/s/${triggerCode}?label=${encodeURI(label || '')}`);
      let result = response.data;

      if (json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`${result.message}\n`);

        if (result.reportUrl) {
          console.log(`View the running test or test report in your browser:\n\n${result.reportUrl}\n`);
        }

        if (result.statusUrl) {
          console.log(`Fetch the current test status as JSON at any time:\n\n${result.statusUrl}\n`);
        }

        if (result.reportDataUrl) {
          console.log(`Fetch the test report data as JSON after finishing:\n\n${result.reportDataUrl}\n`);
        }
      }
    } catch (err) {
      throw new Error(`Unable to run test with trigger code ${triggerCode} (${err.response.status})`);
    }
  };
}
