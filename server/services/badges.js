const db = require('../db/init');

const BADGE_THRESHOLDS = [
  { badge_id: 'first', threshold: 1 },
  { badge_id: 'five', threshold: 5 },
  { badge_id: 'ten', threshold: 10 },
  { badge_id: 'twenty', threshold: 20 },
  { badge_id: 'thirty', threshold: 30 },
  { badge_id: 'fifty', threshold: 50 },
  { badge_id: 'hundred', threshold: 100 },
  { badge_id: 'legendary', threshold: 200 }
];

function checkAndUnlockBadges(openid) {
  const row = db.prepare('SELECT COUNT(*) as cnt FROM collections WHERE openid = ?').get(openid);
  const count = row.cnt;
  const newBadges = [];

  for (const { badge_id, threshold } of BADGE_THRESHOLDS) {
    if (count >= threshold) {
      const result = db.prepare(
        'INSERT OR IGNORE INTO achievements (openid, badge_id) VALUES (?, ?)'
      ).run(openid, badge_id);
      if (result.changes > 0) newBadges.push(badge_id);
    }
  }

  return newBadges;
}

module.exports = { checkAndUnlockBadges };
