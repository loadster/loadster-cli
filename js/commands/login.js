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

module.exports = ({ axios, config }) => {
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
      const loginResult = await axios.post(`/account/actions/login`, { username, password });

      if (loginResult.status === 200) {
        config.setAuthToken(loginResult.data.token);

        console.log(`Logged in as ${loginResult.data.profile.email}`);
      }
    } catch (err) {
      throw new Error('Login failed! Please try again.');
    }
  };
};
