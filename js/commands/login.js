const prompt = require('prompt');

prompt.message = '';
prompt.colors = false;

const promptSchema = {
  properties: {
    username: {
      description: 'Loadster Username',
      required: true
    },
    password: {
      description: 'Loadster Password',
      required: true,
      hidden: true,
      replace: '*'
    }
  }
};

module.exports = ({ api, config }) => {
  return async function login () {
    prompt.start();

    const { username, password } = await new Promise((resolve, reject) => {
      prompt.get(promptSchema, (err, result) => {
        if (err) {
          reject('');
        } else {
          resolve(result);
        }
      });
    });

    try {
      const loginResult = await api.login(username, password);

      config.setAuthToken(loginResult.token);

      console.log(`Logged in as ${loginResult.profile.email}`);
    } catch (err) {
      throw new Error('Login failed! Please try again.');
    }
  };
};
