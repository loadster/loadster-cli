module.exports = ({ config }) => {
  return async function logout () {
    config.removeAuthToken();
  };
};
