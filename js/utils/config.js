const path = require('path');
const ospath = require('ospath');

if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  const localStoragePath = path.join(ospath.data(), 'Loadster', 'loadster-cli');

  localStorage = new LocalStorage(localStoragePath);
}

module.exports = {
  getAuthToken () {
    return localStorage.getItem('loadster.api.token');
  },
  setAuthToken (token) {
    localStorage.setItem('loadster.api.token', token);
  },
  removeAuthToken () {
    localStorage.removeItem('loadster.api.token');
  },
};