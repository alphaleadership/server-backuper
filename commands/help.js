module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Displays help message.",
  category: "help",
  guildOnly: false,
  async execute(message) {
    const { l } = require("../localize.js");
    const embed = {
      title: "My commands",
      description: "For now my commands are:",
      color: 14895693,
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${this.client.user.id}/${this.client.user.avatar}.png?size=256`,
      },
      fields: this.client.commands
        .filter((c) => !c.hidden)
        .map((command) => {
          return {
            name: command.name,
            value: command.description,
          };
        }),
      footer: {
        text: `Requested by ${message.author.tag}`,
      },
    };
    message.channel.send({
      embed,
    });
  },
};
