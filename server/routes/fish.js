const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');
const { invalidateCache } = require('./seasonal');

const uploadDir = path.join(__dirname, '../public/fish-covers');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

// POST /api/fish/upload-cover — 上传鱼种封面图（管理后台用）
// 裁剪为 3:2 比例（与小程序 FishCard 展示比例一致: 240rpx宽 × 200rpx高 ≈ 6:5，取近似 3:2）
router.post('/upload-cover', upload.single('image'), async (req, res) => {
  try {
    const { admin_key, fish_id } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
    if (!fish_id) return res.json({ code: 1, msg: 'fish_id required' });
    if (!req.file) return res.json({ code: 1, msg: '请上传图片' });

    // 检查鱼种是否存在
    const fish = db.prepare('SELECT id, name_zh FROM fish WHERE id = ?').get(fish_id);
    if (!fish) return res.json({ code: 1, msg: '鱼种不存在' });

    // 裁剪为 640x360 (16:9 比例)，与小程序卡片展示比例一致
    const processed = await sharp(req.file.buffer)
      .resize(640, 360, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `${fish_id}.jpg`;
    fs.writeFileSync(path.join(uploadDir, filename), processed);

    const coverUrl = `/assets/fish-covers/${filename}`;

    // 更新数据库
    db.prepare('UPDATE fish SET cover_image = ? WHERE id = ?').run(coverUrl, fish_id);

    // 清缓存
    invalidateCache();

    res.json({ code: 0, msg: '上传成功', data: { cover_url: coverUrl } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// GET /api/fish/cover?name=鲫鱼 — 获取鱼种封面图URL
router.get('/cover', (req, res) => {
  const { name } = req.query;
  if (!name) return res.json({ code: 1, msg: 'name required' });
  const fish = db.prepare('SELECT cover_image FROM fish WHERE name_zh = ?').get(name);
  res.json({ code: 0, data: { cover_image: fish?.cover_image || '' } });
});

// ===== CRUD (管理后台) =====

// GET /api/fish/list — 获取全部鱼种
router.get('/list', (req, res) => {
  const { admin_key } = req.query;
  if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
  const list = db.prepare('SELECT * FROM fish ORDER BY created_at DESC').all();
  res.json({ code: 0, data: list });
});

// GET /api/fish/detail?id=xxx
router.get('/detail', (req, res) => {
  const { id, admin_key } = req.query;
  if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
  if (!id) return res.json({ code: 1, msg: 'id required' });
  const fish = db.prepare('SELECT * FROM fish WHERE id = ?').get(id);
  if (!fish) return res.json({ code: 1, msg: '鱼种不存在' });
  res.json({ code: 0, data: fish });
});

// POST /api/fish/create — 新增鱼种
router.post('/create', (req, res) => {
  try {
    const { admin_key, name_zh, name_latin, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
    if (!name_zh) return res.json({ code: 1, msg: 'name_zh required' });

    const existing = db.prepare('SELECT id FROM fish WHERE name_zh = ?').get(name_zh);
    if (existing) return res.json({ code: 1, msg: '该鱼种已存在' });

    const id = 'admin_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

    db.prepare(`INSERT INTO fish (id, name_zh, name_latin, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'official')`)
      .run(id, name_zh, name_latin || '',
        typeof monthly_activity === 'string' ? monthly_activity : JSON.stringify(monthly_activity || []),
        typeof fishing_methods === 'string' ? fishing_methods : JSON.stringify(fishing_methods || []),
        typeof recommended_bait === 'string' ? recommended_bait : JSON.stringify(recommended_bait || {}),
        typeof best_time === 'string' ? best_time : JSON.stringify(best_time || {}),
        water_temp_min || 0, water_temp_max || 0,
        habitat || '', difficulty || 'medium', tip || '',
        typeof distribution_provinces === 'string' ? distribution_provinces : JSON.stringify(distribution_provinces || [])
      );

    invalidateCache();
    res.json({ code: 0, msg: '创建成功', data: { id } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// POST /api/fish/update — 更新鱼种
router.post('/update', (req, res) => {
  try {
    const { admin_key, id, name_zh, name_latin, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
    if (!id) return res.json({ code: 1, msg: 'id required' });

    const fish = db.prepare('SELECT id FROM fish WHERE id = ?').get(id);
    if (!fish) return res.json({ code: 1, msg: '鱼种不存在' });

    db.prepare(`UPDATE fish SET name_zh=?, name_latin=?, monthly_activity=?, fishing_methods=?, recommended_bait=?, best_time=?, water_temp_min=?, water_temp_max=?, habitat=?, difficulty=?, tip=?, distribution_provinces=? WHERE id=?`)
      .run(name_zh, name_latin || '',
        typeof monthly_activity === 'string' ? monthly_activity : JSON.stringify(monthly_activity || []),
        typeof fishing_methods === 'string' ? fishing_methods : JSON.stringify(fishing_methods || []),
        typeof recommended_bait === 'string' ? recommended_bait : JSON.stringify(recommended_bait || {}),
        typeof best_time === 'string' ? best_time : JSON.stringify(best_time || {}),
        water_temp_min || 0, water_temp_max || 0,
        habitat || '', difficulty || 'medium', tip || '',
        typeof distribution_provinces === 'string' ? distribution_provinces : JSON.stringify(distribution_provinces || []),
        id
      );

    invalidateCache();
    res.json({ code: 0, msg: '更新成功' });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// POST /api/fish/delete — 删除鱼种
router.post('/delete', (req, res) => {
  try {
    const { admin_key, id } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
    if (!id) return res.json({ code: 1, msg: 'id required' });

    const result = db.prepare('DELETE FROM fish WHERE id = ?').run(id);
    if (result.changes === 0) return res.json({ code: 1, msg: '鱼种不存在' });

    invalidateCache();
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

module.exports = router;
