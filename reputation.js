'use strict';

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
          if (err) return reject(err);
          resolve(reputation);
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
  reputation -= (confidence - score) * Math.max(0.8, actionCount / 25) || 1;
  return await set(user, guild, reputation, db);
}

module.exports = {
  setReputation: set,
  getReputation: get,
  adjustReputation: adjust
};