const responses = require("../responses");

module.exports = {
  name: "punishment",
  aliases: ["pn", "p"],
  description: "Set a punishment for this server",
  usage: "b!punishment <ban|kick|none>",
  category: "security",
  guildOnly: true,
  async execute(message, [punishment]) {
    // const { l } = require("../localize.js");
    const { punishments } = this;
    if (message.guild.ownerId !== message.author.id) {
      message.reply(
        "You must be the owner of this server to configure punishments!"
      );
      return;
    }
    if (!["ban", "kick", "none"].includes(punishment)) {
      message.reply("Valid punishments are 'ban', 'kick', and 'none'!");
      return;
    }
    punishments.put(message.guild.id, punishment);
    responses.done(message);
  },
};
