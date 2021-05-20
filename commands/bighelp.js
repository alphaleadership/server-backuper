module.exports = {
  name: 'bighelp',
  aliases: ['bh'],
  description: 'Displays help message.',
  category: 'help',
  guildOnly: false,
  async execute(message) {
    const {
      l
    } = require('../localize.js');
    var embed = l({
      "title": 'cmd.bighelp.title',
      "description": 'cmd.bighelp.description',
      "color": 14895693,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
      },
      "fields": [{
          "name": "b!help",
          "value": 'cmd.bighelp.commands.help',
        },
        {
          "name": "b!bighelp",
          "value": 'cmd.bighelp.commands.bighelp',
        },
        {
          "name": "b!exploits",
          "value": 'cmd.bighelp.commands.exploits',
        }
      ],
      "footer": {
        "text": 'requestedBy'
      }
    }, 'en', {
      tag: message.author.tag
    });
    message.channel.send({
      embed
    });
  },
};