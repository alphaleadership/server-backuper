module.exports = {
  name: 'e27troh2qtioh2wutio23y9783',
  guildOnly: true,
  cooldown: 0,
  async execute(message) {
    const {
      l
    } = require('../localize.js');
    let embed = l({
      "title": 'cmd.help.title',
      "description": 'cmd.help.description',
      "color": 14895693,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
      },
      "fields": [{
          "name": "b!help",
          "value": 'cmd.help.commands.help',
        },
        {
          "name": "b!bighelp",
          "value": 'cmd.help.commands.bighelp',
        },
        {
          "name": "b!exploits",
          "value": 'cmd.help.commands.exploits',
        }
      ],
      "footer": {
        "text": 'requestedBy'
      }
    }, 'ru-UA', {
      tag: message.author.tag
    });
    message.channel.send({
      embed
    });
  },
};