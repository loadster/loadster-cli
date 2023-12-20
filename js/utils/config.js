const path = require('path');
const ospath = require('ospath');

const AUTH_TOKEN = 'loadster.api.token';
const PROJECT_ID = 'loadster.project.id';
const TEAM_ID = 'loadster.team.id';

if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  const localStoragePath = path.join(ospath.data(), 'Loadster', 'loadster-cli');

  localStorage = new LocalStorage(localStoragePath);
}

module.exports = {
  getAuthToken () {
    return localStorage.getItem(AUTH_TOKEN);
  },
  setAuthToken (token) {
    localStorage.setItem(AUTH_TOKEN, token);
  },
  removeAuthToken () {
    localStorage.removeItem(AUTH_TOKEN);
  },
  getTeamId () {
    return localStorage.getItem(TEAM_ID);
  },
  setTeamId (teamId) {
    localStorage.setItem(TEAM_ID, teamId);
  },
  getProjectId () {
    return localStorage.getItem(PROJECT_ID);
  },
  setProjectId (projectId) {
    localStorage.setItem(PROJECT_ID, projectId);
  },
  getApiBaseUrl () {
    return process.env['LOADSTER_API_URL'] || 'https://api.loadster.app';
  },
  getDashboardBaseUrl () {
    return process.env['LOADSTER_DASHBOARD_URL'] || 'https://loadster.app/dashboard';
  },
  getPusherKey () {
    return '90d3c779a92f12206ce8';
  }
};
