const fs = require('fs/promises');
const { die } = require('../utils/control');

module.exports = ({ api, config, control, events }) => {
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

  async function subscribe () {
    try {
      await events.subscribe(handleEvent);
    } catch (err) {
      console.warn('Websocket connection failed! You might not see realtime output.', err);
    }
  }

  async function cleanup () {
    scriptRunId = null;

    await events.unsubscribe();
  }

  async function handleEvent (type, data) {
    if (data['scriptRunId'] !== scriptRunId) {
      // ignored, it's a different script run
    } else if (type === 'PlayScriptFinishedEvent') {
      setTimeout(cleanup, 3000);
    } else if (type === 'PlayScriptLogEvent') {
      // TODO - sometimes logs arrive out of order... maybe we need a rolling sorting window?
      if (data.type === 'info') {
        console.log(`    ${data.text}`);
      } else {
        console.log(data.text);
      }
    }
  }

  return async function (filename) {
    const projectId = config.getProjectId();
    const commands = await loadCommands(filename);

    await subscribe();

    try {
      const response = await api.playScript(projectId, commands);

      scriptRunId = response['scriptRunId'];
    } catch (err) {
      await cleanup();

      die('Failed to play script!', err);
    }
  };
}
