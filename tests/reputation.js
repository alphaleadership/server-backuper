const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database(':memory:');
db.run('CREATE TABLE IF NOT EXISTS reputation (reputation INT, user INT, guild INT)', async () => {
  const r = require('../reputation');
  for (let z = 0; z < 100; z++) {
    const guild = Math.round(Math.random() * 100000);
    const user = Math.round(Math.random() * 100000);
    const reputation = Math.round((Math.random() - 0.5) * 100);
    await r.setReputation(user, guild, reputation, db);
    const rp = await r.getReputation(user, guild, db);
    if (rp !== reputation) {
      throw new Error(`Stored reputation is ${rp}, but have set ${reputation}.`);
    }
  }
});
