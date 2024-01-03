const fs = require('fs/promises');
const process = require('process');
const sleep = require('sleep-promise');

const {createCodeCommandFromJavaScript, apiBotTypes} = require('../utils/converter');
const {die} = require('../utils/control');

const TEST_STATUS_KEYS = [
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
];

const TEST_REPORT_KEYS = [
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
];

const STARTING = 'STARTING';
const STOPPING = 'STOPPING';
const FINISHED = 'FINISHED';
const FAILED = 'FAILED';
const CANCELED = 'CANCELED';


function formatHHMMSS (ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor((ms % 3600000) / 60000);
  let s = Math.floor((ms % 60000) / 1000);

  return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

function parseAssertion (str) {
  let regex = /^\s*?(\w+)\s*?([<=>][=]?)\s*?(\w+)\s*?$/;
  let parsed = str.match(regex);

  if (parsed.length !== 4) {
    throw new Error(`invalid assertion [${str}]`);
  } else if (isNaN(parseFloat(parsed[3]))) {
    throw new Error(`invalid assertion value [${parsed[3]}] in assertion [${str}]`);
  } else {
    return {
      name: parsed[1],
      operator: parsed[2],
      value: parseFloat(parsed[3])
    };
  }
}

async function printTestResults(result, json = false) {
  if (json) {
    console.log(JSON.stringify(result, null, '  '));
  } else {
    if (result.message) {
      console.log(`${result.message}\n`);
    }

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
}

module.exports = ({api, axios, config}) => {
  async function get (url) {
    let response = await axios.get(url);

    return response.data;
  }

  async function launchTest(options) {
    if (options.trigger) {
      const {trigger, label} = options;

      try {
        return await api.invokeTrigger(trigger, label);
      } catch (err) {
        throw new Error(`Unable to run test with trigger code ${trigger} (${err.response.status})`);
      }
    } else if (options.script) {
      const engines = await api.listEngines();

      const {script, bots, location} = options;
      const type = options['type']?.toLowerCase() || 'protocol';
      const rampUpPattern = options['ramp-up-pattern'] || 'linear';
      const rampUpMinutes = options['ramp-up-minutes'] || 1;
      const peakMinutes = options['peak-minutes'] || 1;
      const rampDownPattern = options['ramp-down-pattern'] || 'linear';
      const rampDownMinutes = options['ramp-down-minutes'] || 1;
      const engine = engines.find(e => e.testRunningAllowed && e.name === location);
      const commands = [];

      if (!location) {
        die('Please specify a --location (the name of a cloud region or private engine).')
      } else if (!bots || bots <= 0 || bots > 10000) {
        die('Please specify a --bots (an integer between 1 and 10000).');
      } else if (!apiBotTypes[type]) {
        die('Please specify a --type of protocol or browser.');
      } else if (!['linear', 'natural', 'aggressive'].includes(rampUpPattern)) {
        die('Please specify a --ramp-up-pattern of linear, natural, or aggressive.');
      } else if (!['linear', 'natural', 'delayed'].includes(rampDownPattern)) {
        die('Please specify a --ramp-down-pattern of linear, natural, or delayed.');
      } else if (!engine) {
        die(`Invalid location: ${location}.`);
      }

      try {
        const data = await fs.readFile(script, {encoding: 'utf8'});

        commands.push(createCodeCommandFromJavaScript(data));
      } catch (err) {
        throw new Error(`Unable to load script from file ${script}`);
      }

      try {
        const population = {
          name: 'Group 1',
          count: Math.floor(bots),
          loadEngineId: engine.id,
          type: apiBotTypes[type],
          rampUp: {
            strategy: rampUpPattern,
            duration: rampUpMinutes * 60000
          },
          peakDuration: peakMinutes * 60000,
          rampDown: {
            strategy: rampDownPattern,
            duration: rampDownMinutes * 60000
          },
          commands: commands
        };

        return api.launchTest(config.getProjectId(), options.label, [population]);
      } catch (err) {
        throw new Error(`Unable to launch test: ${err.response?.message}`);
      }
    }
  }

  async function watchTest (test, { assert, json }) {
    let assertions = (assert || []).map(parseAssertion);

    try {
      let status;

      while (true) {
        status = await get(test.statusUrl);

        if (!status || status.stage === FINISHED || status.stage === FAILED || status.stage === CANCELED) {
          break;
        } else if (json) {
          console.log(JSON.stringify(status));
        } else if (status.stage === STARTING) {
          console.log('Test is starting...');
        } else if (status.stage === STOPPING) {
          console.log('Test is stopping...');
        } else {
          status.runningUsers = status.populations.map(p => p.runningUsers).reduce((t, n) => t + n);

          console.log();
          console.log(`[${formatHHMMSS(status.elapsedTime)}]`);

          for (let statusKey of TEST_STATUS_KEYS) {
            console.log(` - ${statusKey}: ${(status[statusKey] || 0).toFixed(2)}`);
          }
        }

        await sleep(5000);
      }

      let report = await get(test.reportDataUrl);

      report.maxUsers = report.maxVirtualUsers;

      delete report['jsonDataByProvider'];
      delete report['urlsByTotalResponseTime'];

      if (json) {
        console.log(JSON.stringify(report));
      } else {
        console.log();

        if (status.finished) {
          console.log('[Finished]');

          for (let reportKey of TEST_REPORT_KEYS) {
            console.log(` - ${reportKey}: ${(report[reportKey] || 0).toFixed(2)}`);
          }
        } else if (status.failed) {
          console.log('[Failed]');
        } else if (status.canceled) {
          console.log('[Canceled]');
        }
      }

      if (assertions.length) {
        console.log();
      }

      for (let assertion of assertions) {
        let actual = report[assertion.name];
        let pass = false;

        if (assertion.operator === '==') {
          pass = actual === assertion.value;
        } else if (assertion.operator === '>=') {
          pass = actual >= assertion.value;
        } else if (assertion.operator === '<=') {
          pass = actual <= assertion.value;
        } else if (assertion.operator === '>') {
          pass = actual > assertion.value;
        } else if (assertion.operator === '<') {
          pass = actual < assertion.value;
        }

        if (json) {
          console.log(JSON.stringify({
            assertion: `${assertion.name} ${assertion.operator} ${assertion.value}`,
            actual: actual,
            pass: pass
          }));
        } else {
          console.log(`${pass ? 'PASS' : 'FAIL'} [${assertion.name} ${assertion.operator} ${assertion.value}] (actual: ${actual})`);
        }

        if (!pass) {
          process.exitCode = 3;
        }
      }
    } catch (err) {
      throw new Error(`Failed to evaluate test status`);
    }
  }

  return async function (options, evaluate) {
    const test = await launchTest(options);

    await printTestResults(test, options.json);

    if (evaluate) {
      await watchTest(test, options);
    }
  };
}
