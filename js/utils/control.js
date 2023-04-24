const process = require('process');

module.exports = {
  die: (message, cause) => {
    if (message) {
      console.error(message);
    }

    if (cause instanceof Error) {
      if (cause.response && cause.response.status === 403) {
        console.error('Unauthorized! Please log in.');

        process.exit(1);
      } else {
        console.error(cause.message);
      }
    }

    process.exit(99);
  }
}
