const WIND_DOWN_MS = 3000;
const LOG_BUFFER_MS = 200;

const fs = require('fs/promises');
const colors = require('colors/safe');
const { die } = require('../utils/control');

module.exports = ({ api, config, events }) => {
  const logs = [];
  const errors = [];

  let scriptRunId = null;

  async function loadCommands (filename) {
    const commands = [];

    try {
      const data = await fs.readFile(filename, { encoding: 'utf8' });

      commands.push({ type: 'code', code: data, language: 'javascript', enabled: true });
    } catch (err) {
      die(`Unable to read file: ${filename}`);
    }

    return commands;
  }

  function flushLogs (age) {
    const now = Date.now();
    const aged = logs.sort((a, b) => a.time - b.time).filter(entry => entry.received < now - age);

    aged.forEach(entry => {
      if (entry.type === 'info') {
        console.log(colors.dim(`   ${entry.text}`));
      } else if (entry.type === 'warning') {
        console.log(colors.red(colors.dim(`   ${entry.text}`)));
      } else if (entry.type === 'error') {
        console.log(colors.red(`   ${entry.text}`));
      } else {
        console.log(colors.bold(`${entry.text}`));
      }

      logs.splice(logs.indexOf(entry), 1);
    });
  }

  async function unsubscribeAndFinish () {
    scriptRunId = null;

    await events.unsubscribe();

    flushLogs(0);

    if (errors.length) {
      process.exit(98);
    }
  }

  async function handleEvent (type, data) {
    if (data['scriptRunId'] !== scriptRunId) {
      // ignored, it's a different script run
    } else if (type === 'PlayScriptFinishedEvent') {
      setTimeout(unsubscribeAndFinish, WIND_DOWN_MS);
    } else if (type === 'PlayScriptLogEvent') {
      logs.push({
        ...data,
        received: Date.now()
      });

      flushLogs(LOG_BUFFER_MS);
    } else if (type === 'PlayScriptCommandStatusEvent') {
      if (data['status'] === 'error') {
        console.log('an error!');

        errors.push(data);
      }
    }
  }

  return async function (scriptId, filename) {
    const projectId = config.getProjectId();

    try {
      await events.subscribe(handleEvent);

      if (filename) {
        const commands = await loadCommands(filename);
        const response = await api.playScript(projectId, null, commands);

        scriptRunId = response['scriptRunId'];
      } else {
        const response = await api.playScript(projectId, scriptId, null);

        scriptRunId = response['scriptRunId'];
      }
    } catch (err) {
      await unsubscribeAndFinish();

      die('Failed to play script!', err);
    }
  };
}
