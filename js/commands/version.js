const Package = require('../../package.json');

module.exports = () => {
  console.log(Package.version);
};
