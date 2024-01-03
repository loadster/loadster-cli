const Pusher = require('pusher-js');

let pusher;
let channel;

module.exports = ({ config }) => {
  const channelName = `private-customer-${config.getTeamId()}`;

  const createPusherIfNecessary = async () => {
    if (!pusher) {
      const token = config.getAuthToken();

      pusher = new Pusher(config.getPusherKey(), {
        cluster: 'mt1',
        forceTLS: true,
        authEndpoint: `${config.getApiBaseUrl()}/team/actions/authenticate-pusher-channel`,
        auth: {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      });
    }
  };

  return {
    async subscribe (handler) {
      await createPusherIfNecessary();

      try {
        channel = pusher.subscribe(channelName);

        channel.bind_global((eventType, event) => {
          handler(eventType, typeof event === 'string' ? JSON.parse(event) : event);
        });
      } catch (err) {
        console.warn('Websocket subscription failed! You might not see realtime output.');
      }
    },
    async unsubscribe () {
      if (channel) {
        await channel.unbind_all();
        await pusher.unsubscribe(channelName);
      }

      if (pusher) {
        await pusher.disconnect();
      }
    }
  };
};