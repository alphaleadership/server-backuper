module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'Displays help message.',
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
          "value": "Displays this message",
        },
        {
          "name": "b!bighelp",
          "value": "Displays big help. Avoid using this command in chat!",
        },
        {
          "name": "b!exploits",
          "value": "Checks your server for bots with unpatched bugs, which can allow people to raid your server!",
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