const process = require('process');
const args = require('command-line-args');
const axios = require('axios').create({
  baseURL: process.env['LOADSTER_API_URL'] || 'https://api.loadster.app',
  timeout: 10000
});

const cliOptions = [
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

const config = require('./utils/config');

axios.interceptors.request.use(async requestConfig => {
  const token = config.getAuthToken();

  if (token) {
    requestConfig.auth = { username: 'token', password: token };
  }

  return requestConfig;
}, error => {
  return Promise.reject(error);
});

const api = require('./utils/api')({ axios });

const start = require('./commands/start')({ api });
const login = require('./commands/login')({ api, config });
const logout = require('./commands/logout')({ config });
const run = require('./commands/run')({ api, axios });
const projects = require('./commands/projects')({ api, config });
const usage = require('./commands/usage')(cliOptions);
const version = require('./commands/version');

const main = async function () {
  const options = args(cliOptions, { stopAtFirstUnknown: true });
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
      let runOptions = args([
        { name: 'label', type: String },
        { name: 'json', type: Boolean }
      ], { argv: argv.slice(1) });

      await start(argv[0], runOptions.label, runOptions.json);
    } else {
      await usage(1);
    }
  } else if (options['command'] === 'run') {
    if (argv.length > 0) {
      let runOptions = args([
        { name: 'label', type: String },
        { name: 'json', type: Boolean },
        { name: 'assert', type: String, multiple: true }
      ], { argv: argv.slice(1) });

      await run(argv[0], runOptions.label, runOptions.json, runOptions.assert);
    } else {
      await usage(1);
    }
  } else if (options['command'] === 'projects') {
    const subcommand = argv[0] || 'list';

    if (!['list', 'use'].includes(subcommand)) {
      await usage(0);
    }

    await projects[subcommand](argv.slice(1));
  } else {
    await usage(0);
  }
};

main().catch(err => {
  console.error(err.toString());
  console.error(err);

  process.exitCode = 1;
});
