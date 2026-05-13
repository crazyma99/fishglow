const router = require('express').Router();
const db = require('../db/init');

router.get('/', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  res.json({ code: 0, data: user || null });
});

router.post('/update', (req, res) => {
  const { openid, nickname, avatar_url } = req.body;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  db.prepare('UPDATE users SET nickname = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE openid = ?')
    .run(nickname || '', avatar_url || '', openid);
  res.json({ code: 0, msg: 'ok' });
});

// GET /api/user/list — 管理后台获取用户列表
router.get('/list', (req, res) => {
  const { admin_key } = req.query;
  if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });

  const users = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM collections WHERE openid = u.openid) as collection_count,
      (SELECT COUNT(*) FROM history WHERE openid = u.openid) as history_count,
      (SELECT COUNT(*) FROM contributions WHERE openid = u.openid) as contribution_count
    FROM users u ORDER BY u.created_at DESC
  `).all();

  res.json({ code: 0, data: users });
});

router.get('/stats', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const coll = db.prepare('SELECT COUNT(*) as cnt FROM collections WHERE openid = ?').get(openid);
  const hist = db.prepare('SELECT COUNT(*) as cnt FROM history WHERE openid = ?').get(openid);
  res.json({ code: 0, data: { collection_count: coll.cnt, history_count: hist.cnt } });
});

module.exports = router;
