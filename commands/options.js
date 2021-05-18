module.exports = {
  name: 'options',
  guildOnly: true,
  cooldown: 0,
  async execute(message) {
    console.log('yay');
    const config = require('../configuration.json');
    const minimist = require('minimist');
    const args = minimist(message.content.slice(config.prefix.length).split(/ +/));
    message.channel.send(JSON.stringify(args));
  },
};