module.exports = {
  name: "whitelist",
  aliases: ["wl", "w"],
  description: "Whitelists a member.",
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
    whitelist.put(`${message.guild.id}.${user.id}`, "");
    responses.done(message);
  },
};
