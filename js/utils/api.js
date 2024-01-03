const { apiBotTypes } = require('./converter');

module.exports = ({ axios }) => {
  return {
    async login (username, password) {
      const result = await axios.post(`/account/actions/login`, { username, password });

      return result.data;
    },
    async getTeam () {
      const result = await axios.get(`/team`);

      return result.data;
    },
    async listProjects () {
      const result = await axios.get(`/projects`);

      return result.data;
    },
    async listEngines () {
      const result = await axios.get(`/engines`, { params: { 'includeCloud': true }});

      return result.data;
    },
    async invokeTrigger (triggerCode, label) {
      const response = await axios.post(`/s/${triggerCode}?label=${encodeURI(label || '')}`);

      return response.data;
    },
    async playScript (projectId, scriptId, type, commands) {
      const response = await axios.post(`/player/script/actions/start`, {
        projectId,
        scriptId,
        commands,
        source: 'CLI',
        type: apiBotTypes[type?.toLowerCase() || 'protocol']
      });

      return response.data;
    },
    async launchTest (projectId, label, populations) {
      const response = await axios.post(`/cloud/tests`, {
        repositoryProjectId: projectId,
        label: label,
        populations: populations,
        source: 'cli'
      });

      return response.data;
    }
  };
};
