const fs = require('fs/promises');

const usage = require('./usage');
const {createCodeCommandFromJavaScript, apiBotTypes} = require('../utils/converter');
const {die} = require('../utils/control');

module.exports = ({api, config}) => {
  return async function (options) {

    if (options.help) {
      await usage(1, 'start');
    } else if (options.trigger) {
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

        return await api.launchTest(config.getProjectId(), options.label, [population]);
      } catch (err) {
        throw new Error(`Unable to launch test: ${err.response?.message}`);
      }
    } else {
      await usage(1, 'start');
    }
  };
}
