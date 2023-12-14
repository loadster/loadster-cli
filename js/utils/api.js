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
    async getScript (projectId, scriptId) {
      const result = await axios.get(`/projects/${projectId}/scripts/${scriptId}`);

      return result.data;
    },
    async invokeTrigger (triggerCode, label) {
      const response = await axios.post(`/s/${triggerCode}?label=${encodeURI(label || '')}`);

      return response.data;
    },
    async playScript (projectId, scriptId, commands) {
      const response = await axios.post(`/player/script/actions/start`, { projectId, scriptId, commands, source: 'CLI' });

      return response.data;
    }
  };
};
