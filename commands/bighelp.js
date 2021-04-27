module.exports = {
  name: 'bighelp',
  aliases: ['bh'],
  description: 'Displays big detailed help.',
  category: 'help',
  guildOnly: false,
  execute(message) {
    let embed = {
      "title": "My commands",
      "description": "For now my commands are:",
      "color": 14895693,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
      },
      "fields": [{
          "name": "b!help",
          "value": "Displays help message. Nothing else.",
        },
        {
          "name": "b!bighelp",
          "value": "Displays big detailed help.",
        },
        {
          "name": "b!exploits",
          "value": "Checks your server for bots with unpatched bugs, which can allow people to raid your server! For instance, sometimes such bugs allow raiders to ping **everyone** and **here**, even if they are no allowed to do it!",
        }
      ],
      "footer": {
        "text": `Requested by ${message.author.tag}`
      }
    };
    message.channel.send({
      embed
    });
  },
};