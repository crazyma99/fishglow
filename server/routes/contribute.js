const router = require('express').Router();
const db = require('../db/init');
const { generateFishData } = require('../services/contribute');
const { perSecond } = require('../middleware/rateLimit');
const { invalidateCache } = require('./seasonal');

// POST /api/contribute/generate — AI 生成鱼种数据（供用户编辑）
router.post('/generate', perSecond, async (req, res) => {
  try {
    const { fish_name } = req.body;
    if (!fish_name) return res.json({ code: 1, msg: 'fish_name required' });

    // 先检查是否已有数据
    const existing = db.prepare('SELECT id FROM fish WHERE name_zh = ?').get(fish_name);
    if (existing) {
      return res.json({ code: 1, msg: '该鱼种已有完整数据' });
    }

    // 检查是否已有待审核贡献
    const pending = db.prepare("SELECT id FROM contributions WHERE fish_name = ? AND status = 'pending'").get(fish_name);
    if (pending) {
      return res.json({ code: 1, msg: '该鱼种已有用户提交待审核' });
    }

    const data = await generateFishData(fish_name);
    if (!data) {
      return res.json({ code: 1, msg: 'AI 生成失败，请稍后重试' });
    }

    res.json({ code: 0, data: { fish_name, ...data } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// POST /api/contribute/submit — 用户提交贡献
router.post('/submit', (req, res) => {
  try {
    const {
      openid, fish_name, name_latin, aliases,
      monthly_activity, fishing_methods, recommended_bait, best_time,
      water_temp_min, water_temp_max, habitat, difficulty, tip,
      distribution_provinces
    } = req.body;

    if (!openid || !fish_name) return res.json({ code: 1, msg: 'openid and fish_name required' });

    // 去重检查：同一用户不能重复提交同一鱼种
    const existing = db.prepare("SELECT id FROM contributions WHERE openid = ? AND fish_name = ? AND status = 'pending'").get(openid, fish_name);
    if (existing) return res.json({ code: 1, msg: '您已提交过该鱼种，请等待审核' });

    db.prepare(`INSERT INTO contributions (openid, fish_name, name_latin, aliases, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        openid, fish_name, name_latin || '', aliases || '',
        typeof monthly_activity === 'string' ? monthly_activity : JSON.stringify(monthly_activity),
        typeof fishing_methods === 'string' ? fishing_methods : JSON.stringify(fishing_methods),
        typeof recommended_bait === 'string' ? recommended_bait : JSON.stringify(recommended_bait),
        typeof best_time === 'string' ? best_time : JSON.stringify(best_time),
        water_temp_min || 0, water_temp_max || 0,
        habitat || '', difficulty || '', tip || '',
        typeof distribution_provinces === 'string' ? distribution_provinces : JSON.stringify(distribution_provinces)
      );

    res.json({ code: 0, msg: '提交成功，等待审核' });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// GET /api/contribute/check?fish_name=xxx — 检查鱼种是否已有数据
router.get('/check', (req, res) => {
  const { fish_name } = req.query;
  if (!fish_name) return res.json({ code: 1, msg: 'fish_name required' });

  const inFish = db.prepare('SELECT id FROM fish WHERE name_zh = ?').get(fish_name);
  const pending = db.prepare("SELECT id FROM contributions WHERE fish_name = ? AND status = 'pending'").get(fish_name);

  res.json({
    code: 0,
    data: {
      has_data: !!inFish,
      has_pending: !!pending
    }
  });
});

// GET /api/contribute/my?openid=xxx — 获取用户自己的贡献列表
router.get('/my', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const list = db.prepare('SELECT * FROM contributions WHERE openid = ? ORDER BY created_at DESC').all(openid);
  res.json({ code: 0, data: list });
});

// GET /api/contribute/detail?id=xxx — 获取单条贡献详情
router.get('/detail', (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ code: 1, msg: 'id required' });
  const item = db.prepare('SELECT * FROM contributions WHERE id = ?').get(id);
  if (!item) return res.json({ code: 1, msg: '贡献不存在' });
  res.json({ code: 0, data: item });
});

// === 审核后台接口（需鉴权，此处简化用 admin_key） ===

// GET /api/contribute/pending — 获取待审核列表
router.get('/pending', (req, res) => {
  const { admin_key } = req.query;
  if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });

  const list = db.prepare("SELECT * FROM contributions WHERE status = 'pending' ORDER BY created_at DESC").all();
  res.json({ code: 0, data: list });
});

// POST /api/contribute/review — 审核（通过/拒绝）
router.post('/review', (req, res) => {
  try {
    const { admin_key, id, action, reviewer_note } = req.body;
    if (admin_key !== process.env.ADMIN_KEY) return res.json({ code: 403, msg: '无权限' });
    if (!id || !action) return res.json({ code: 1, msg: 'id and action required' });

    if (action === 'approve') {
      const contrib = db.prepare('SELECT * FROM contributions WHERE id = ?').get(id);
      if (!contrib) return res.json({ code: 1, msg: '贡献不存在' });

      // 检查 fish 表是否已有同名鱼种
      const existingFish = db.prepare('SELECT id FROM fish WHERE name_zh = ?').get(contrib.fish_name);
      if (existingFish) {
        db.prepare("UPDATE contributions SET status = 'rejected', reviewer_note = '该鱼种已被其他贡献入库', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
        return res.json({ code: 1, msg: '该鱼种已存在于数据库中' });
      }

      const fishId = 'community_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

      // 写入 fish 表
      db.prepare(`INSERT OR IGNORE INTO fish (id, name_zh, name_latin, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'community')`)
        .run(
          fishId, contrib.fish_name, contrib.name_latin,
          contrib.monthly_activity, contrib.fishing_methods,
          contrib.recommended_bait, contrib.best_time,
          contrib.water_temp_min, contrib.water_temp_max,
          contrib.habitat, contrib.difficulty, contrib.tip,
          contrib.distribution_provinces
        );

      // 更新贡献状态
      db.prepare("UPDATE contributions SET status = 'approved', reviewer_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(reviewer_note || '', id);

      // 清除 seasonal 缓存
      invalidateCache();

      res.json({ code: 0, msg: '已通过并入库' });
    } else if (action === 'reject') {
      db.prepare("UPDATE contributions SET status = 'rejected', reviewer_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(reviewer_note || '', id);
      res.json({ code: 0, msg: '已拒绝' });
    } else {
      res.json({ code: 1, msg: 'action must be approve or reject' });
    }
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

module.exports = router;
