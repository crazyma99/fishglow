const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');

const uploadDir = path.join(__dirname, '../public/photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `h-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`)
});
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 } });

router.post('/add', upload.single('photo'), (req, res) => {
  try {
    const { openid, fish_name, score, raw_score, image_url, baike_url, description, structured } = req.body;
    if (!openid || !fish_name) return res.json({ code: 1, msg: 'openid and fish_name required' });

    const photo_path = req.file ? `/assets/photos/${req.file.filename}` : '';

    db.prepare(`INSERT INTO history (openid, fish_name, score, raw_score, image_url, baike_url, description, structured, photo_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(openid, fish_name, score || '', raw_score || '', image_url || '', baike_url || '', description || '', structured || '', photo_path);

    res.json({ code: 0, msg: 'ok' });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

router.get('/list', (req, res) => {
  const { openid } = req.query;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const list = db.prepare('SELECT * FROM history WHERE openid = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(openid, limit, offset);
  res.json({ code: 0, data: list });
});

module.exports = router;
