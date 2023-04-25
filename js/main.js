const process = require('process');
const args = require('command-line-args');
const config = require('./utils/config');
const control = require('./utils/control');

const axios = require('axios').create({
  baseURL: config.getApiBaseUrl(),
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
const start = require('./commands/start')({ api });
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

async function main () {
  const options = args(cliOptions, { stopAtFirstUnknown: true });
  const command = options['command'];
  const argv = options._unknown || [];

  if (options['version'] || command === 'version') {
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

      await checkSession();

      await start(argv[0], runOptions.label, runOptions.json);
    } else {
      await usage(1, command);
    }
  } else if (options['command'] === 'play') {
    await checkSession();

    const filename = argv[0];
    const projectId = config.getProjectId();

    if (!filename) {
      await usage(1, command);
    } else if (!projectId) {
      await usage(1, command, `No project configured! Choose a project with '${process.title} projects' before you play a script.`);
    } else {
      await checkSession();
      await play(filename);
    }
  } else if (options['command'] === 'run') {
    if (argv.length > 0) {
      let runOptions = args([
        { name: 'label', type: String },
        { name: 'json', type: Boolean },
        { name: 'assert', type: String, multiple: true }
      ], { argv: argv.slice(1) });

      await checkSession();
      await run(argv[0], runOptions.label, runOptions.json, runOptions.assert);
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
