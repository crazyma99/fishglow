const router = require('express').Router();
const db = require('../db/init');

// 内存缓存，5分钟过期
let cache = { data: null, expiry: 0 };

function getAllFish() {
  const now = Date.now();
  if (cache.data && now < cache.expiry) return cache.data;

  const rows = db.prepare('SELECT * FROM fish').all();
  const parsed = rows.map(row => ({
    id: row.id,
    name_zh: row.name_zh,
    name_latin: row.name_latin,
    monthly_activity: JSON.parse(row.monthly_activity || '[]'),
    fishing_methods: JSON.parse(row.fishing_methods || '[]'),
    recommended_bait: JSON.parse(row.recommended_bait || '{}'),
    best_time: JSON.parse(row.best_time || '{}'),
    water_temp: { optimal_min: row.water_temp_min, optimal_max: row.water_temp_max },
    habitat: row.habitat,
    difficulty: row.difficulty,
    tip: row.tip,
    distribution_provinces: JSON.parse(row.distribution_provinces || '[]'),
    cover_image: row.cover_image || '',
    source: row.source
  }));

  cache = { data: parsed, expiry: now + 5 * 60 * 1000 };
  return parsed;
}

// 新增鱼种后清缓存
function invalidateCache() { cache = { data: null, expiry: 0 }; }

router.get('/', (req, res) => {
  const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
  const monthIndex = month - 1;

  const allFish = getAllFish();
  const recommendations = allFish.map(fish => {
    const score = (fish.monthly_activity || [])[monthIndex] || 0;
    const level = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
    return { ...fish, score, level };
  }).sort((a, b) => b.score - a.score);

  res.json({ code: 0, data: { month, recommendations } });
});

module.exports = router;
module.exports.invalidateCache = invalidateCache;
