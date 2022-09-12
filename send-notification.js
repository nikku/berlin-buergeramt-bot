const notifier = require('node-notifier');
const opener = require('opener');

async function sendNotification(notification) {

  const {
    type,
    message,
    url,
  } = notification;

  const title = `Buergeramt Bot :: ${ type.toUpperCase() }`;

  notifier.notify(
    {
      title,
      message
    },
    function (err, response, metadata) {

      if (err) {
        return console.error(err);
      }

      if (url) {
        return opener(url);
      }
    }
  );
}

module.exports = sendNotification;
