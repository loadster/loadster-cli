const path = require('path');
const ospath = require('ospath');

const AUTH_TOKEN = 'loadster.api.token';
const PROJECT_ID = 'loadster.project.id';

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
  getProjectId () {
    return localStorage.getItem(PROJECT_ID);
  },
  setProjectId (projectId) {
    localStorage.setItem(PROJECT_ID, projectId);
  }
};