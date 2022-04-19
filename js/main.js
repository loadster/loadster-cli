const Process = require('process');
const Options = require('command-line-args');

const axios = require('axios');
const config = require('./utils/config');

const start = require('./commands/start')({ axios });
const login = require('./commands/login')({ axios, config });
const logout = require('./commands/logout')({ config });
const run = require('./commands/run')({ axios });
const usage = require('./commands/usage');
const version = require('./commands/version');

axios.defaults.baseURL = 'https://api.loadster.app';

const StandardOptions = [
  {
    name: 'command',
    defaultOption: true
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean
  }
];

const main = async function () {
  const options = Options(StandardOptions, { stopAtFirstUnknown: true });
  const command = options['command'];
  const argv = options._unknown || [];

  if (options['version']) {
    await version();
  } else if (command === 'login') {
    await login();
  } else if (command === 'logout') {
    await logout();
  } else if (command === 'start') {
    if (argv.length > 0) {
      let runOptions = Options([
        { name: 'label', type: String },
        { name: 'json', type: Boolean }
      ], { argv: argv.slice(1) });

      await start(argv[0], runOptions.label, runOptions.json);
    } else {
      await usage(1);
    }
  } else if (options['command'] === 'run') {
    if (argv.length > 0) {
      let runOptions = Options([
        { name: 'label', type: String },
        { name: 'json', type: Boolean },
        { name: 'assert', type: String, multiple: true }
      ], { argv: argv.slice(1) });

      await run(argv[0], runOptions.label, runOptions.json, runOptions.assert);
    } else {
      await usage(1);
    }
  } else {
    await usage(0);
  }
};

main().catch(err => {
  console.error(err.toString());

  Process.exitCode = 1;
});
