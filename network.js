const brain = require('brain.js');
const neuralNetwork = new brain.NeuralNetwork();
const path = require('path');
neuralNetwork.fromJSON(require(path.resolve('./data/net.json')));

function run(data) {
  return new Promise((resolve, reject) => {
    if (typeof data !== 'object' || Array.isArray(data)) return reject(new TypeError('\'data\' must be an object.'));
    process.nextTick(() => {
      try {
        resolve(neuralNetwork.run(data));
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = run;