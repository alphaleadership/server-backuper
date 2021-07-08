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
      message.reply("Provide a user!");
    }
    whitelist.del(`${message.guild.id}.${user.id}`, "");
    responses.done(message);
  },
};
