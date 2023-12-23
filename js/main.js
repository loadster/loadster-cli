const process = require('process');
const args = require('command-line-args');
const config = require('./utils/config');
const control = require('./utils/control');

const axios = require('axios').create({
  baseURL: config.getApiBaseUrl(),
  timeout: 10000
});

const MAIN_OPTIONS = [
  {
    name: 'command',
    defaultOption: true
  },
  {
    name: 'version',
    alias: 'v',
    type: Boolean
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean
  }
];

const START_OPTIONS = [
  {name: 'trigger', type: String, defaultOption: true},
  {name: 'script', type: String},
  {name: 'type', type: String, defaultValue: 'protocol'},
  {name: 'bots', type: Number},
  {name: 'location', type: String},
  {name: 'ramp-up-minutes', type: Number},
  {name: 'ramp-up-pattern', type: String},
  {name: 'peak-minutes', type: Number},
  {name: 'ramp-down-minutes', type: Number},
  {name: 'ramp-down-pattern', type: String},
  {name: 'label', type: String},
  {name: 'json', type: Boolean},
  {name: 'help', alias: 'h', type: Boolean}
];

const PLAY_OPTIONS = [
  { name: 'id', type: String, defaultOption: true },
  { name: 'file', type: String, alias: 'f' },
  { name: 'type', type: String, defaultValue: 'protocol' }
];

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
const events = require('./utils/events')({ config });

const login = require('./commands/login')({ api, config });
const logout = require('./commands/logout')({ config });
const play = require('./commands/play')({ api, events, config, control });
const start = require('./commands/start')({ api, config });
const run = require('./commands/run')({ api, axios });
const projects = require('./commands/projects')({ api, config });
const usage = require('./commands/usage')();
const version = require('./commands/version');
const { die } = require('./utils/control');

async function checkSession () {
  try {
    await api.getTeam();
  } catch (err) {
    await usage(1, 'login', `You aren't logged in! Log in with '${process.title} login' first.`);

    process.exit(1);
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

async function main () {
  const options = args(MAIN_OPTIONS, { stopAtFirstUnknown: true });
  const command = options['command'];
  const argv = options._unknown || [];

  if (options['help'] && !command) {
    await usage(1, 'help');
  } else if (options['version'] || command === 'version') {
    await version();
  } else if (command === 'login') {
    await login();
  } else if (command === 'logout') {
    await logout();
  } else if (command === 'start') {
    await checkSession();

    const startOptions = args(START_OPTIONS, {argv});
    const startResult = await start(startOptions);

    await printTestResults(startResult, startOptions.json);
  } else if (options['command'] === 'play') {
    await checkSession();

    const playOptions = args(PLAY_OPTIONS, {argv});
    const projectId = config.getProjectId();

    if (!projectId) {
      await usage(1, command, `No project configured! Choose a project with '${process.title} projects' before you play a script.`);
    } else if (playOptions.id || playOptions.file) {
      await play(playOptions);
    } else {
      await usage(1, command, 'Please specify a script.');
    }
  } else if (options['command'] === 'run') {
    if (argv.length > 0) {
      let runOptions = args([
        { name: 'label', type: String },
        { name: 'json', type: Boolean },
        { name: 'assert', type: String, multiple: true },
        { name: 'help', alias: 'h', type: Boolean }
      ], { argv: argv.slice(1) });

      if (runOptions.help) {
        await usage(1, command);
      } else {
        await checkSession();
        await run(argv[0], runOptions.label, runOptions.json, runOptions.assert);
      }
    } else {
      await usage(1, command);
    }
  } else if (options['command'] === 'projects') {
    const subcommand = argv[0] || 'help';

    if (['list', 'use'].includes(subcommand)) {
      await checkSession();

      await projects[subcommand](argv.slice(1));
    } else {
      await usage(1, command);
    }
  } else {
    await usage(0, command);
  }
}

main().catch(err => {
  die('Operation failed!', err);
});
