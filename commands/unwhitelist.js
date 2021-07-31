module.exports = {
  name: "unwhitelist",
  aliases: ["uwl", "uw"],
  description: "Unwhitelists a member.",
  category: "security",
  guildOnly: true,
  async execute(message) {
    // const { l } = require("../localize.js");
    const responses = require("../responses.js");
    const { whitelist } = this;
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Provide a user!");
    }
    if (message.guild.ownerID !== message.author.id) {
      return message.reply(
        "You muset be the owner of this server to whitelist users!"
      );
    }
    whitelist.del(`${message.guild.id}.${user.id}`, "");
    responses.done(message);
  },
};
