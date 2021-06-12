module.exports = {
  name: "invite",
  aliases: [
    "vote",
    "support",
    "getbot",
    "invitebot",
    "add",
    "addbot",
    "github",
    "gh",
    "code",
    "source",
    "sourcecode",
    "opensource",
    "topgg",
    "dbl",
    "discordbotlist",
    "discordbotlistcom",
    "discordboats",
  ],
  description: "Sends invite link and links you should definitely look at.",
  category: "information",
  guildOnly: false,
  async execute(message) {
    // const { l } = require("../localize.js");
    var embed = {
      title: "Links",
      // description: "Here are all",
      color: 14895693,
      thumbnail: {
        url: "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256",
      },
      fields: [
        {
          name: "Invite link",
          value:
            "Invite the bot [here](https://discord.com/oauth2/authorize?client_id=797792817983389726&permissions=19584&scope=bot)!",
        },
        {
          name: "Website",
          value:
            "You can visit our website [here](https://server-backuper.cloud)!",
        },
        {
          name: "Top.gg",
          value:
            "You can vote for the bot on [Top.gg](https://server-backuper.cloud)!",
        },
        {
          name: "DiscordBotList.com",
          value:
            "You can vote for the bot on [DiscordBotList.com](https://discordbotlist.com/bots/server-backuper)!",
        },
        {
          name: "Discord Boats",
          value:
            "You can vote for the bot on [Discord Boats](https://discord.boats/bot/797792817983389726)!",
        },
      ],
      footer: {
        text: `Requested by ${message.author.tag}`,
      },
    };
    message.channel.send({
      embed,
    });
  },
};
