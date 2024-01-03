const process = require('process');
const args = require('command-line-args');
const config = require('./utils/config');
const control = require('./utils/control');

const axios = require('axios').create({
  baseURL: config.getApiBaseUrl(),
  timeout: 10000
});

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
const script = require('./commands/script')({ api, events, config, control });
const test = require('./commands/test')({ api, axios, config });
const projects = require('./commands/projects')({ api, config });
const usage = require('./commands/usage')();
const version = require('./commands/version');
const { die } = require('./utils/control');

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

const RUN_OPTIONS = [
  ...START_OPTIONS,
  {name: 'assert', type: String, multiple: true}
];

const PLAY_OPTIONS = [
  { name: 'id', type: String, defaultOption: true },
  { name: 'file', type: String, alias: 'f' },
  { name: 'type', type: String, defaultValue: 'protocol' }
];

async function checkSession () {
  try {
    await api.getTeam();
  } catch (err) {
    await usage(1, 'login', `You aren't logged in! Log in with '${process.title} login' first.`);

    process.exit(1);
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
  } else if (options['command'] === 'play') {
    await checkSession();

    const playOptions = args(PLAY_OPTIONS, {argv});
    const projectId = config.getProjectId();

    if (!projectId) {
      await usage(1, command, `No project configured! Choose a project with '${process.title} projects' before you play a script.`);
    } else if (playOptions.id || playOptions.file) {
      await script(playOptions);
    } else {
      await usage(1, command, 'Please specify a script.');
    }
  } else if (command === 'start') {
    await checkSession();

    const startOptions = args(START_OPTIONS, {argv});

    if (startOptions.help) {
      await usage(1, command);
    } else if (startOptions.trigger || startOptions.script) {
      await test(startOptions, false);
    } else {
      await usage(1, command);
    }
  } else if (options['command'] === 'run') {
    await checkSession();

    const runOptions = args(RUN_OPTIONS, {argv});

    if (runOptions.help) {
      await usage(1, command);
    } else if (runOptions.trigger || runOptions.script) {
      await test(runOptions, true);
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
