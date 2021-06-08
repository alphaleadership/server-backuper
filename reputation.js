'use strict';

const mem = require('mem');

function set(user, guild, reputation, db) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM reputation WHERE user = ? AND guild = ? LIMIT 1', [user, guild], (err, row) => {
      if (err) return reject(err);
      if (row) {
        db.run('UPDATE reputation SET reputation = ? WHERE user = ? AND guild = ?', [
          reputation, user, guild
        ], (err) => {
          if (err) return reject(err);
          resolve(reputation);
        });
      } else {
        db.run('INSERT INTO reputation VALUES (?, ?, ?)', [
          reputation, user, guild
        ], (err) => {
          if (err) {
            return reject(err);
          } else {
            resolve(reputation);
          }
        });
      }
    });
  });
}

function get(user, guild, db) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM reputation WHERE user = ? AND guild = ? LIMIT 1', [user, guild], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.reputation : 0);
    });
  });
}

async function adjust(user, guild, confidence, score, actionCount, db) {
  let reputation = await get(user, guild, db);
  reputation -= (confidence - score) * Math.max(0.5, actionCount / 25);
  await set(user, guild, reputation, db);
}

module.exports = {
  setReputation: mem(set, {
    cacheKey: arguments_ => arguments_.slice(0, 3).join(','),
    maxAge: 10000
  }),
  getReputation: mem(get, {
    cacheKey: arguments_ => arguments_.slice(0, 2).join(','),
    maxAge: 10000
  }),
  adjustReputation: mem(adjust, {
    cacheKey: arguments_ => arguments_.slice(0, 5).join(','),
    maxAge: 10000
  }),
};
