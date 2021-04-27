module.exports = {
  name: 'keygen',
  aliases: ['key', 'generate-keys', 'kg', 'k'],
  description: 'Displays help message.',
  category: 'security',
  guildOnly: true,
  cooldown: 2,
  execute(message) {
    message.channel.startTyping();
    const NodeRSA = require('node-rsa');
    const key = new NodeRSA({
      b: 1024
    });
    let privateKey = key.exportKey('pkcs8-private');
    let publicKey = key.exportKey('pkcs8-public');
    let embed = {
      "title": "Your keys",
      "description": "Never share your private key with people you don't want to view your backups!",
      "color": 14895693,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
      },
      "fields": [{
          "name": "Public key",
          "value": publicKey,
        },
        {
          "name": "Private key",
          "value": privateKey,
        }
      ],
      "footer": {
        "text": `Requested by ${message.author.tag}`
      }
    };
    privateKey = null;
    publicKey = null;
    message.react('✅');
    message.author.send({
      embed
    }).then(() => {
      message.channel.stopTyping();
    });
  },
};