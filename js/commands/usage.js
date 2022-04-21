const process = require('process');
const cliUsage = require('command-line-usage');

module.exports = () => {
  return function (exitCode, command) {
    const title = process.title;

    if (command === 'projects') {
      console.log(cliUsage([
        {
          header: 'Usage',
          content: `$ ${title} projects <subcommand>`
        },
        {
          header: 'Subcommand List',
          content: [
            { name: 'list', summary: 'List all projects in your Loadster team' },
            {
              name: 'use <project-id>',
              summary: 'Configure the CLI to use a project for all operations (playing scripts, running tests, etc)'
            }
          ]
        }
      ]));
    } else if (command === 'run') {
      console.log(cliUsage([
        {
          header: 'Usage',
          content: `$ ${title} run <trigger-code>`
        },
        {
          header: 'Examples',
          content: [
            `  To run a test with a scenario's trigger code and block until it finishes:`,
            ``,
            `  $ ${title} run <trigger-code> [--json] [--label (str)] [--assert (str)]*`,
            ``,
            `    --json             Print output in JSON instead of human-friendly`,
            `    --label (str)      Label the test for easy identification later`,
            `    --assert (str)     Assert a value match at the conclusion of a test`,
            ``,
            `  Examples of assertions:`,
            ``,
            `    --assert 'totalErrors == 0'`,
            `    --assert 'totalPages >= 1500'`,
            `    --assert 'avgHitsPerSecond > 7.5'`,
            `    --assert 'avgBytesPerSecond <= 10000'`
          ],
          raw: true
        }
      ]));
    } else if (command === 'start') {
      console.log(cliUsage([
        {
          header: 'Usage',
          content: `$ ${title} start <trigger-code> `
        },
        {
          header: 'Examples',
          content: [
            `  To start a test with a scenario's trigger code and then exit immediately:`,
            ``,
            `  $ ${title} start <trigger-code> [--json] [--label(str)]`,
            ``,
            `    --json          Print output in JSON instead of human - friendly`,
            `    --label(str)    Label the test for easy identification later`
          ]
        }
      ]));
    } else {
      const guide = cliUsage([
        {
          header: 'Loadster CLI',
          content: `This is the command line interface for Loadster's cloud-hybrid testing platform.`
        },
        {
          header: 'Synopsis',
          content: `  $ ${title} <options> <command>`
        },
        {
          header: 'Command List',
          content: [
            { name: 'login', summary: 'Log in to your Loadster account from the command line.' },
            { name: 'start', summary: 'Start a load test using a trigger code.' },
            { name: 'run', summary: 'Run a load test using a trigger code, waiting for it to finish.' },
            { name: 'projects', summary: 'List your projects or use one for future operations.' },
            { name: 'logout', summary: 'Log out of your Loadster account from the command line.' },
            { name: 'help', summary: ` Display usage instructions (you're reading them).` },
            { name: 'version', summary: `Display the Loadster CLI version.` }
          ]
        }
      ]);

      console.log(guide + '\n');
    }

    process.exitCode = exitCode || 0;
  };
};
