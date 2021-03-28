'use strict';
require('dotenv').config();
const allowed_actions = ['INVITE_CREATE', 'BOT_ADD', 'MEMBER_ADD', 'EMOJI_CREATE', 'EMOJI_DELETE', 'EMOJI_UPDATE', 'MEMBER_MOVE', 'MEMBER_UPDATE'];
const action_descriptions = new Map();
action_descriptions.set('MEMBER_KICK', 'Kicks member from the guild. As a result member won\'t be able to join the guild without an invite.');
action_descriptions.set('MEMBER_BAN', 'Bans member from the guild. As a result member won\'t be able to join the guild before they get unbanned and invited.');
action_descriptions.set('MEMBER_PRUNE', 'Kicks member from the guild. As a result member won\'t be able to join the guild without an invite.');
const up = Date.now();
// const fetch = require('node-fetch');
var load = Date.now();
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const fsp = require('fs').promises;
const brain = require('brain.js');
console.log(`Loaded dependencies in ${Date.now() - load} millliseconds!`);
const neuralNetwork = new brain.recurrent.LSTM();
load = Date.now();
neuralNetwork.fromJSON(JSON.parse(fs.readFileSync('./neuralNetwork.json')));
console.log(`Loaded neural network in ${Date.now() - load} millliseconds!`);
var isloading;
isloading = true;
isloading = false;
// var BRUH = {};

/**
 * 
 * @param {Discord.Role} role 
 */

function getRoleScore(role) {
  let score = 0.3;
  if (role.permissions.any('ADMINISTRATOR')) {
    return 1;
  } else {
    if (role.permissions.any('BAN_MEMBERS') || role.permissions.any('KICK_MEMBERS')) {
      score += 0.25;
    }
    if (role.permissions.any('MANAGE_CHANNELS')) {
      score += 0.25;
    }
    if (role.permissions.any('MANAGE_ROLES')) {
      score += 0.15;
    }
    if (role.permissions.any('MANAGE_GUILD')) {
      score += 0.1;
    }
    if (role.permissions.any('MANAGE_MESSAGES')) {
      score += 0.1;
    }
  }
  return score;
}

/**
 * @param {Discord.Guild} guild 
 */
async function recognize(guild) {
  if (guild) {
    let fetchedLogs = await guild.fetchAuditLogs({
      limit: 100,
    });
    let action = fetchedLogs.entries.first();
    if ((fetchedLogs.entries.first().executor.id === client.user.id) || fetchedLogs.entries.first().executor.id === guild.ownerID) return;
    if (allowed_actions.includes(fetchedLogs.entries.first().action)) return;
    let processedLogs = new Array();
    fetchedLogs.entries.forEach((entry) => {
      if ((entry.executor.id === fetchedLogs.entries.first().executor.id) && Date.now() - entry.createdTimestamp < 600000) {
        processedLogs.push(entry.action);
      }
    });
    if (processedLogs[0] == undefined) return;
    let confidence = neuralNetwork.run(processedLogs).replace(/[^.0-9]/g, '');
    let score;
    // fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${process.argv[2]}`).then(r => r.json()).then(d => {
    // let d.players.find(e => {
    //   return e.id === process.argv[3];
    // }).level  
    let messages = 0;
    // guild.channels.cache.forEach(channel => {
    // await fetch(`https://discord.com/api/v8/guilds/${guild.id}/messages/search?channel_id=${channel.id}&author_id=${fetchedLogs.entries.first().executor.id}`, {
    //   "headers": {
    //     "Accept": "*/*",
    //     "Accept-Language": "ru",
    //     "Authorization": process.env.TOKEN,
    //     "Pragma": "no-cache",
    //     "Cache-Control": "no-cache"
    //   },
    //   "method": "GET",
    //   "mode": "cors"
    // })
    // let result = await r.json();
    // if (result['total_results']) {
    //   if (messages < 70) {
    //     score = 0.6;
    //   } else if (messages < 400) {
    //     score = 0.7
    //   } else if (messages < 1500) {
    //     score = 0.85;
    //   } else {
    //     score = 0.95;
    //   }
    // } else {
    //   let starttime = Date.now();
    //   while (Date.now() - starttime < result['retry_after'] + 1500) {
    //     ;
    //   }
    // }
    // });
    // console.log(level);
    // });
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
    switch (action.targetType) {
      case 'CHANNEL': {
        if (Date.now() - action.target.createdTimestamp < 60000) {
          confidence = 0.1;
        } else if (Date.now() - action.target.createdTimestamp < 300000) {
          confidence = 0.2;
        } else if (Date.now() - action.target.createdTimestamp < 600000) {
          confidence = 0.3;
        }
      };
    }
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

// client.guilds.cache.forEach(async (guildForBackup) => {
async function backup() {
  //   backuper.create(guildForBackup, {
  //     maxMessagesPerChannel: 500,
  //     jsonSave: true,
  //     jsonBeautify: false,
  //     saveImages: 'base64'
  //   }).then(async (data) => {
  //     let dataread = await fsp.readFile('/home/all/Mail.ru/Server Backuper/index.json');
  //     let datajson = JSON.parse(dataread);
  //     let arr = JSON.parse(dataread)[guildForBackup.id] || [];
  //     arr.push({
  //       id: (await backuper.list())[0],
  //       timestamp: Date.now()
  //     });
  //     datajson[guildForBackup.id] = arr;
  //     await fsp.writeFile('/home/all/Mail.ru/Server Backuper/index.json', JSON.stringify(datajson, null, 2));
  //   });
  // });
  // console.log(`Backuped ${client.guilds.cache.size} servers at ${new Date().toUTCString()}!`);
}

setInterval(() => {
  console.log(`Uptime is ${client.uptime} ms`);
}, 120000);

client.on('ready', async () => {
  await client.user.setStatus('idle');
  await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers!`);
  setInterval(async () => {
    await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers!`);
  }, 60000);
  setInterval(backup, 600000);
  setImmediate(backup);
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
            // {
            //   "name": "b!strict <on | off>",
            //   "value": "Turn strict mode on/off",
            // },
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
          // {
          //   "name": "b!strict <on | off>",
          //   "value": "Turn strict mode on/off. What is strict mode? You can turn strict mode on, and all changes in your server will be automatically restored. Also known as emergency mode. (DISABLED right now)",
          // },
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

// Don't mind

client.on("channelCreate", function (channel) {
  recognize(channel.guild);
});

client.on("channelDelete", function (channel) {
  recognize(channel.guild);
});

// client.on("channelPinsUpdate", function (channel, _time) {
//   recognize(channel.guild);
// });

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
  if (messages.size > 15) {
    recognize(messages.first().guild);
  }
});

client.on("roleCreate", function (role) {
  if (getRoleScore(role) > 0.3) {
    recognize(role.guild);
  }
});

client.on("roleDelete", function (role) {
  if (getRoleScore(role) > 0.3) {
    recognize(role.guild);
  }
});

client.on("roleUpdate", function (oldRole, newRole) {
  if (getRoleScore(newRole) > 0.3) {
    recognize(oldRole.guild);
  }
});