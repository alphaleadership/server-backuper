'use strict';
require('dotenv').config();
const allowed_actions = ['INVITE_CREATE', 'BOT_ADD', 'MEMBER_ADD', 'EMOJI_CREATE', 'EMOJI_DELETE', 'EMOJI_UPDATE', 'MEMBER_MOVE'];
const up = Date.now('CHANNEL_CREATE');
var load = Date.now();
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const brain = require('brain.js');
console.log(`Loaded dependencies in ${Date.now() - load} millliseconds!`);
const neuralNetwork = new brain.recurrent.LSTM();
load = Date.now();
neuralNetwork.fromJSON(JSON.parse(fs.readFileSync('./neuralNetwork.json')));
console.log(`Loaded neural network in ${Date.now() - load} millliseconds!`);
var isloading;
isloading = true;
isloading = false;

async function recognize(guild) {
  if (guild) {
    let fetchedLogs = await guild.fetchAuditLogs({
      limit: 100,
    });
    if ((fetchedLogs.entries.first().executor.id === client.user.id) || fetchedLogs.entries.first().executor.id === guild.ownerID) return;
    if (allowed_actions.includes(fetchedLogs.entries.first().action)) return;
    let processedLogs = new Array();
    fetchedLogs.entries.forEach((entry) => {
      if ((entry.executor.id === fetchedLogs.entries.first().executor.id) && Date.now() - entry.createdTimestamp < 600000) {
        processedLogs.push(entry.action);
      }
    });
    let confidence = neuralNetwork.run(processedLogs).replace(/[^.0-9]/g, '');
    let score;
    let d = (Date.now() - fetchedLogs.entries.first().executor.createdTimestamp) / 86400000;
    if (d < 2) {
      score = 0.6;
    } else if (d < 7) {
      score = 0.63;
    } else if (d < 20) {
      score = 0.66;
    } else {
      score = 0.69;
    }
    confidence = (confidence > 1) ? 0.65 : confidence;
    console.log(`Confidence: ${confidence}. Score: ${score}`);
    if (confidence >= score) {
      let embed = {
        "title": "<:warn:803972986905821235> Attention!",
        "description": `Detected destructive activity in **${guild.name}**! Type of activity is \`${processedLogs[0]}\`. The action was done by **${fetchedLogs.entries.first().executor.tag}**.`,
        "color": 14895693,
        "thumbnail": {
          "url": "https://cdn.discordapp.com/app-icons/797792817983389726/1a67802b742db5844da3896e6fbe5f1f.png?size=256"
        },
        "timestamp": Date.now()
      };
      (await client.users.fetch(guild.ownerID)).send({
        embed
      });
    }
    if (confidence - score > 0.25 && confidence - score <= 0.3) {
      (await guild.members.fetch({
        user: fetchedLogs.entries.first().executor
      })).kick({
        reason: 'Anti-raid'
      });
    }
    if (confidence - score > 0.3) {
      (await guild.members.fetch({
        user: fetchedLogs.entries.first().executor
      })).ban({
        days: 1,
        reason: 'Anti-raid'
      });
    }
  }
}

setInterval(() => {
  console.log(`Uptime is ${client.uptime} ms`);
}, 120000);

client.on('ready', async () => {
  await client.user.setStatus('idle');
  await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers! | Running in IBM Cloud!`);
  setInterval(async () => {
    await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers! | Running in IBM Cloud!`);
  }, 60000);
  console.log(`Connected in ${Date.now() - up} milliseconds!`);
});

client.on('message', async (message) => {
  if (!message.author.bot) {
    if (isloading) {
      message.react('❎');
      message.reply('Backuper hasn\'t fully loaded yet, try again in a few minutes.');
    } else {
      if (message.content === 'b!help') {
        let embed = {
          "title": "My commands",
          "description": "I always try to protect your server from harmful activity, meaning you don't have to run any commands for it. For now my commands are:",
          "color": 14895693,
          "thumbnail": {
            "url": "https://cdn.discordapp.com/app-icons/797792817983389726/1a67802b742db5844da3896e6fbe5f1f.png?size=256"
          },
          "fields": [{
              "name": "b!help",
              "value": "Displays this message",
            },
            {
              "name": "b!strict <on | off>",
              "value": "Turn strict mode on/off",
            },
            {
              "name": "b!bighelp",
              "value": "Displays big help. Avoid using this command in chat!",
            }
          ],
          "footer": {
            "text": `Requested by ${message.author.tag}`
          }
        };
        message.channel.send({
          embed
        });
      }
    }
    if (message.content === 'b!bighelp') {
      let embed = {
        "title": "My commands",
        "description": "I always try to protect your server from harmful activity, meaning you don't have to run any commands for it. For now my commands are:",
        "color": 14895693,
        "thumbnail": {
          "url": "https://cdn.discordapp.com/app-icons/797792817983389726/1a67802b742db5844da3896e6fbe5f1f.png?size=256"
        },
        "fields": [{
            "name": "b!help",
            "value": "Displays help message. Nothing else.",
          },
          {
            "name": "b!strict <on | off>",
            "value": "Turn strict mode on/off. What is strict mode? You can turn strict mode on, and all changes in your server will be automatically restored. Also known as emergency mode. (DISABLED right now)",
          },
          {
            "name": "b!bighelp",
            "value": "Displays big detailed help.",
          }
        ],
        "footer": {
          "text": `Requested by ${message.author.tag}`
        }
      };
      message.channel.send({
        embed
      });
    }
  }
});

client.login(process.env.TOKEN);

// Event handlers, put here for convenience.

client.on("channelCreate", function (channel) {
  recognize(channel.guild);
});

client.on("channelDelete", function (channel) {
  recognize(channel.guild);
});

client.on("channelUpdate", function (oldChannel, _newChannel) {
  recognize(oldChannel.guild);
});

client.on("guildBanAdd", function (guild, _user) {
  recognize(guild);
});

client.on("guildBanRemove", function (guild, _user) {
  recognize(guild);
});

client.on("guildMemberRemove", function (member) {
  recognize(member.guild);
});

client.on("guildMemberUpdate", function (oldMember, _newMember) {
  recognize(oldMember.guild);
});

client.on("guildUpdate", function (oldGuild, _newGuild) {
  recognize(oldGuild);
});

client.on("messageDeleteBulk", function (messages) {
  recognize(messages.first().guild);
});

client.on("roleCreate", function (role) {
  recognize(role.guild);
});

client.on("roleDelete", function (role) {
  recognize(role.guild);
});

client.on("roleUpdate", function (oldRole, _newRole) {
  recognize(oldRole.guild);
});
