const process = require('process');
const colors = require('colors/safe');

module.exports = {
  die: (message, cause) => {
    if (message) {
      console.error(colors.red(message));
    }

    if (cause instanceof Error) {
      if (cause.response && cause.response.status === 403) {
        console.error(colors.red(colors.dim('Unauthorized! Please log in.')));

        process.exit(1);
      } else {
        console.error(colors.red(colors.dim(cause.message)));
      }
    }

    process.exit(99);
  }
}
