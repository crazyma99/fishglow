const router = require('express').Router();
const db = require('../db/init');

router.get('/', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const list = db.prepare('SELECT * FROM achievements WHERE openid = ? ORDER BY unlocked_at ASC').all(openid);
  res.json({ code: 0, data: list });
});

module.exports = router;
