'use strict';
require('dotenv').config();
const fs = require('fs');
const network = require('./network.js');
const fsp = fs.promises;
// Load plugins
const path = require('path');
const plugins = {};
const pluginList = fs.readdirSync('plugins');
const reputationManager = require('./reputation.js');
pluginList.forEach(pluginName => {
  const plugin = {};
  console.log(`Loading '${pluginName}' plugin...`);
  plugin.name = pluginName;
  plugin.actions = require(`./${path.join('plugins', pluginName, 'actions.js')}`);
  plugin.client = require(`./${path.join('plugins', pluginName, 'client.js')}`).createClient();
  plugin.handler = require(`./${path.join('plugins', pluginName, 'handler.js')}`)(plugin.client);
  plugin.login = require(`./${path.join('plugins', pluginName, 'client.js')}`).login;
  plugin.converter = require(`./${path.join('plugins', pluginName, 'converter.js')}`);
  plugin.optional = fs.readdirSync(`./${path.join('plugins', pluginName, 'optional')}`).filter(file => file.endsWith('.js'));
  plugins[pluginName] = plugin;
});
// End plugins load
// Operate with plugins
Object.keys(plugins).forEach(plugin => {
  let pluginName = plugin;
  plugin = plugins[plugin];
  plugin.converter.createSqliteTable().then(db => {
    plugin.login(plugin.client, process.env[pluginName]).then(() => {
      console.debug(`Successfully loaded '${pluginName}' plugin!`);
      plugin.handler.on('event', async (event) => {
        if (!event) return;
        let {
          runData: converted,
          convertedAction: action,
          guild: guild,
          actionsCount: actionsCount
        } = await plugin.converter(event);
        if (action.actionType === 'CREATE') return;
        let {
          confidence
        } = await network(converted);
        confidence += Math.min(actionsCount / 70, 0.3);
        confidence = (confidence > 1) ? 1 : confidence; // So it's fail-safe. Just in case.
        const score = 0.93; // Feel free to change
        console.log(confidence, score, confidence > score, actionsCount);
        if (confidence > score) {
          plugin.actions.alert(
            `Detected destructive activity in **${guild.name}**! Type of activity is **${action.type}**. The action was done by **${action.executor}**.`,
            guild.id,
            plugin.client
          );
          let totalRaids = parseInt(await fsp.readFile('accidents.txt'));
          await fsp.writeFile('accidents.txt', String(totalRaids + 1));
        }
        await reputationManager.adjustReputation(action.executorID, guild.id, confidence, score, actionsCount, db);
      });
    });
  });
  plugin.optional.forEach(script => {
    script = require(path.resolve(`${path.join('plugins', pluginName, 'optional', script)}`));
    script(process.env[pluginName]);
  });
});
// End plugin operations