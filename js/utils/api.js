const { apiBotTypes } = require('./converter');
const config = require('./config');

module.exports = () => {
  const baseUrl = config.getApiBaseUrl();
  const timeout = 10000;

  const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const token = config.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Basic ${Buffer.from(`token:${token}`).toString('base64')}`
      }),
      ...options.headers
    };

    try {
      const fullUrl = /^https?:/.test(url) ? url : baseUrl + url;
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(id);
    }
  };

  return {
    async login(username, password) {
      return await fetchWithTimeout(`/account/actions/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    },
    async getTeam() {
      return await fetchWithTimeout(`/team`, { method: 'GET' });
    },
    async listProjects() {
      return await fetchWithTimeout(`/projects`, { method: 'GET' });
    },
    async listEngines() {
      const url = `/engines?includeCloud=true`;
      return await fetchWithTimeout(url, { method: 'GET' });
    },
    async invokeTrigger(triggerCode, label) {
      const encodedLabel = encodeURIComponent(label || '');
      return await fetchWithTimeout(`/s/${triggerCode}?label=${encodedLabel}`, { method: 'POST' });
    },
    async playScript(projectId, scriptId, type, commands) {
      return await fetchWithTimeout(`/player/script/actions/start`, {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          scriptId,
          commands,
          source: 'CLI',
          type: apiBotTypes[type?.toLowerCase() || 'protocol']
        })
      });
    },
    async launchTest(projectId, label, populations) {
      return await fetchWithTimeout(`/cloud/tests`, {
        method: 'POST',
        body: JSON.stringify({
          repositoryProjectId: projectId,
          label,
          populations,
          source: 'cli'
        })
      });
    },
    async getUrl(url) {
      return await fetchWithTimeout(url);
    }
  };
};
