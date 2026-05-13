const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');
const { checkAndUnlockBadges } = require('../services/badges');

const uploadDir = path.join(__dirname, '../public/photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`)
});
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 } });

router.post('/add', upload.single('photo'), (req, res) => {
  try {
    // 兼容 JSON 和 multipart 两种请求
    const body = req.body || {};
    const { openid, fish_name, score, image_url, baike_url, description, structured } = body;
    if (!openid || !fish_name) return res.json({ code: 1, msg: 'openid and fish_name required' });

    const photo_path = req.file ? `/assets/photos/${req.file.filename}` : '';

    db.prepare(`INSERT INTO collections (openid, fish_name, score, image_url, baike_url, description, structured, photo_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(openid, fish_name) DO UPDATE SET
        score = excluded.score,
        image_url = CASE WHEN excluded.image_url != '' THEN excluded.image_url ELSE collections.image_url END,
        baike_url = CASE WHEN excluded.baike_url != '' THEN excluded.baike_url ELSE collections.baike_url END,
        description = CASE WHEN excluded.description != '' THEN excluded.description ELSE collections.description END,
        structured = CASE WHEN excluded.structured != '' THEN excluded.structured ELSE collections.structured END,
        photo_path = CASE WHEN excluded.photo_path != '' THEN excluded.photo_path ELSE collections.photo_path END`)
      .run(openid, fish_name, score || '', image_url || '', baike_url || '', description || '', structured || '', photo_path);

    const new_badges = checkAndUnlockBadges(openid);
    res.json({ code: 0, msg: 'ok', data: { new_badges } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

router.get('/list', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const list = db.prepare('SELECT * FROM collections WHERE openid = ? ORDER BY created_at DESC').all(openid);
  res.json({ code: 0, data: list });
});

module.exports = router;
