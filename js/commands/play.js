const fs = require('fs/promises');

module.exports = ({ api, config }) => {
  return async function (filename) {
    const projectId = config.getProjectId();
    const commands = [];

    try {
      const data = await fs.readFile(filename, { encoding: 'utf8' });

      commands.push({ type: 'code', code: data, language: 'javascript' });
    } catch (err) {
      throw new Error(`Unable to read ${filename}`);
    }

    try {
      const response = await api.playScript(projectId, commands);
      const scriptRunId = response.scriptRunId;

      console.log(`Playing ${filename} (id=${scriptRunId})`);
    } catch (err) {
      console.error(err.response.status);
      console.error(err.response.data.message);

      throw new Error(`Unable to play script at ${filename}`);
    }
  };
}
