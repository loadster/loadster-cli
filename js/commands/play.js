const fs = require('fs/promises');

module.exports = ({ api, events, config }) => {
  let scriptRunId = null;

  async function loadCommands (filename) {
    const commands = [];

    try {
      const data = await fs.readFile(filename, { encoding: 'utf8' });

      commands.push({ type: 'code', code: data, language: 'javascript', enabled: true });
    } catch (err) {
      throw new Error(`Unable to read ${filename}`);
    }

    return commands;
  }

  async function subscribe () {
    try {
      await events.subscribe(handleEvent);
    } catch (err) {
      console.error('Log subscriber failed! You might not see realtime script output.', err);
    }
  }

  async function cleanup () {
    scriptRunId = null;

    await events.unsubscribe();
  }

  async function handleEvent (type, data) {
    if (data.scriptRunId && data.scriptRunId !== scriptRunId) {
      // ignored, it's a different script run
    } else if (type === 'PlayScriptFinishedEvent') {
      setTimeout(cleanup, 3000);
    } else if (type === 'PlayScriptLogEvent') {
      if (data.type === 'info') {
        console.log(`    ${data.text}`);
      } else {
        console.log(data.text);
      }
    }
  }

  return async function (filename) {
    await subscribe();

    try {
      const projectId = config.getProjectId();
      const commands = await loadCommands(filename);
      const response = await api.playScript(projectId, commands);

      scriptRunId = response.scriptRunId;
    } catch (err) {
      await cleanup();

      throw new Error(`Failed to play script at ${filename}`);
    }
  };
}
