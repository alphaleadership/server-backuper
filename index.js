'use strict';
require('dotenv').config();
const fs = require('fs');
const fsp = fs.promises;
if (!fs.existsSync('db')) {
  fs.mkdirSync('db');
} else if (!fs.statSync('db').isDirectory()) {
  throw new Error('`db` exists and is not a directory. Aborting.');
} else {
  fs.closeSync(fs.openSync('db/reputation.sqlite'));
}
if (!fs.existsSync('data')) {
  throw new Error('`data` does not exist.');
} else if (!fs.statSync('db').isDirectory()) {
  throw new Error('`data` is not a directory.');
}
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/reputation.sqlite');
const brain = require('brain.js');
const Discord = require('discord.js');
const config = require('./configuration.json');
const reputationManager = require('./reputation.js');
const actionsScores = require('./data/actionsScores.json');
const allowed_actions = ['INVITE_CREATE', 'BOT_ADD', 'MEMBER_ADD', 'EMOJI_CREATE', 'EMOJI_DELETE', 'EMOJI_UPDATE', 'MEMBER_MOVE', 'MEMBER_UPDATE', 'MEMBER_DISCONNECT'];
// const action_descriptions = new Map();
// action_descriptions.set('MEMBER_KICK', 'Kicks member from the guild. As a result member won\'t be able to join the guild without an invite.');
// action_descriptions.set('MEMBER_BAN', 'Bans member from the guild. As a result member won\'t be able to join the guild before they get unbanned and invited.');
// action_descriptions.set('MEMBER_PRUNE', 'Kicks member from the guild. As a result member won\'t be able to join the guild without an invite.');
const up = Date.now();
// const fetch = require('node-fetch');
var load = Date.now();
const argv = require('minimist')(process.argv);
const client = new Discord.Client({
  messageEditHistoryMaxSize: 5,
  messageCacheLifetime: 36000,
  messageSweepInterval: 1800,
  disableMentions: 'everyone'
});
client.commands = new Discord.Collection();
const neuralNetwork = new brain.NeuralNetwork();
neuralNetwork.fromJSON(require('./data/net.json'));
console.log(`Loaded dependencies in ${Date.now() - load} millliseconds!`);

// var BRUH = {};

/**
 * 
 * @param {Discord.Guild} guild
 */

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
// const disabledCommands = String(argv['disable-commands'] || '').split(', ').join().split(',');

for (const file of commandFiles) {
  // if (argv.commands === false) break; // Debug
  const command = require(`./commands/` + file);
  // if (disabledCommands.includes(command.name)) continue; // Debug
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

/**
 * 
 * @param {String} action 
 */

function getActionScore(action) {
  return actionsScores[action] || 0.4;
}


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
  // backup(guild);
  if (!argv.protection) return 0;
  if (guild) {
    let fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
    });
    let action = fetchedLogs.entries.first();
    if (action.executor.id === client.user.id || action.executor.id === guild.ownerID) return;
    if (allowed_actions.includes(fetchedLogs.entries.first().action)) return;
    let runData = {};
    if (action.targetType === 'USER') {
      runData.victimReputation = await reputationManager.getReputation(action.target.id, guild.id, db);
    }
    runData.reputation = await reputationManager.getReputation(action.executor.id, guild.id, db);
    runData.actionScore = getActionScore(action.action);
    let confidence = neuralNetwork.run(runData).confidence;
    confidence = (confidence > 1) ? 0.65 : confidence;
    let score = 0.93;
    switch (action.targetType) {
      case 'CHANNEL': {
        if (Date.now() - action.target.createdTimestamp < 60000) {
          confidence = 0.1;
        } else if (Date.now() - action.target.createdTimestamp < 300000) {
          confidence = 0.2;
        } else if (Date.now() - action.target.createdTimestamp < 600000) {
          confidence = 0.3;
        }
      }
    }
    console.log(confidence, score, await reputationManager.getReputation(action.executor.id, guild.id, db), await reputationManager.getReputation(action.target.id, guild.id, db));
    if (confidence >= score) {
      let embed = {
        "title": "<:warn:803972986905821235> Attention!",
        "description": `Detected destructive activity in **${guild.name}**! Type of activity is **${action.action}**. The action was done by **${action.executor.tag}**.`,
        "color": 14895693,
        "thumbnail": {
          "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
        },
        "timestamp": Date.now()
      };
      (guild.channels.cache.find(c => c.name === 'sb-alerts' && c.isText()) || await client.users.fetch(guild.ownerID)).send({
        embed
      });
      let totalRaids = parseInt(await fsp.readFile('accidents.txt'));
      await fsp.writeFile('accidents.txt', String(totalRaids + 1));
      await reputationManager.adjustReputation(action.executor.id, guild.id, confidence, score, fetchedLogs.entries.filter(e => e.executor.id === action.executor.id).size, db);
    }
    // if (confidence - score > 0.25 && confidence - score <= 0.3) {
    //   (await guild.members.fetch({
    //     user: fetchedLogs.entries.first().executor
    //   })).kick({
    //     reason: 'Anti-raid'
    //   });
    // }
    // if (confidence - score > 0.3) {
    //   (await guild.members.fetch({
    //     user: fetchedLogs.entries.first().executor
    //   })).ban({
    //     days: 1,
    //     reason: 'Anti-raid'
    //   });
    // }
  }
}

client.on('ready', async () => {
  let userCount = 0;
  client.guilds.cache.forEach(g => {
    userCount += g.memberCount;
  });
  await client.user.setStatus('idle');
  await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers and ${userCount} members!`);
  setInterval(async () => {
    let userCount = 0;
    client.guilds.cache.forEach(g => {
      userCount += g.memberCount;
    });
    await client.user.setStatus('idle');
    await client.user.setActivity(`Protecting ${client.guilds.cache.size} servers and ${userCount} members!`);
  }, 60000);
  console.log(`Connected in ${Date.now() - up} milliseconds!`);
});


client.on('message', message => {
  if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) {
    let embed = {
      "title": "My prefix",
      "description": "My prefix is **b!**",
      "color": 14895693,
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/797792817983389726/c37f92aa872ea449ff88450818cac325.png?size=256"
      },
      "footer": {
        "text": `Requested by ${message.author.tag}`
      }
    };
    return message.channel.send({
      embed
    });
  }
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // If command exist
  if (!command) return;

  // Check if command can be executed in DM
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  // Check if args are required
  if (command.args && !args.length) {
    let reply = `Please provide arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  // Check if user is in cooldown
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 0) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      // If user is in cooldown
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  } else {
    timestamps.set(message.author.id, now);
    setTimeout(() => {
      timestamps.delete(message.author.id)
    }, cooldownAmount);
    // Execute command
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('There was an error while trying to execute that command!');
    }
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS reputation (user INT, reputation INT, guild INT)', () => {
    client.login(process.env.TOKEN);
  });
});
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

// eslint-disable-next-line no-unused-vars
client.on("channelUpdate", function (oldChannel, _newChannel) {
  recognize(oldChannel.guild);
});

// eslint-disable-next-line no-unused-vars
client.on("guildBanAdd", function (guild, _user) {
  recognize(guild);
});

// eslint-disable-next-line no-unused-vars
client.on("guildBanRemove", function (guild, _user) {
  recognize(guild);
});

client.on("guildMemberRemove", function (member) {
  recognize(member.guild);
});

// client.on("guildMemberUpdate", function (oldMember, _newMember) {
//   recognize(oldMember.guild);
// });

// eslint-disable-next-line no-unused-vars
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
