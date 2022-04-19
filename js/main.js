const Process = require('process');
const Options = require('command-line-args');

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

const start = require('./commands/start');
const run = require('./commands/run');
const usage = require('./commands/usage');
const version = require('./commands/version');

const main = async function () {
  const options = Options(StandardOptions, { stopAtFirstUnknown: true });
  const argv = options._unknown || [];

  if (options['version']) {
    await version();
  } else if (options['command'] === 'start') {
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
