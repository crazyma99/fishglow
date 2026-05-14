const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'fishglow.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    openid TEXT PRIMARY KEY,
    nickname TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL,
    fish_name TEXT NOT NULL,
    score TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    baike_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    structured TEXT DEFAULT '',
    photo_path TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(openid, fish_name)
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL,
    fish_name TEXT NOT NULL,
    score TEXT DEFAULT '',
    raw_score TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    baike_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    structured TEXT DEFAULT '',
    photo_path TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(openid, badge_id)
  );

  -- 鱼种数据库（从 fish_seasonal.json 迁入 + 用户贡献审核通过后写入）
  CREATE TABLE IF NOT EXISTS fish (
    id TEXT PRIMARY KEY,
    name_zh TEXT NOT NULL UNIQUE,
    name_latin TEXT DEFAULT '',
    monthly_activity TEXT DEFAULT '',
    fishing_methods TEXT DEFAULT '',
    recommended_bait TEXT DEFAULT '',
    best_time TEXT DEFAULT '',
    water_temp_min INTEGER DEFAULT 0,
    water_temp_max INTEGER DEFAULT 0,
    habitat TEXT DEFAULT '',
    difficulty TEXT DEFAULT '',
    tip TEXT DEFAULT '',
    aliases TEXT DEFAULT '',
    distribution_provinces TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    source TEXT DEFAULT 'official',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 用户贡献待审核表
  CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT NOT NULL,
    fish_name TEXT NOT NULL,
    name_latin TEXT DEFAULT '',
    aliases TEXT DEFAULT '',
    monthly_activity TEXT DEFAULT '',
    fishing_methods TEXT DEFAULT '',
    recommended_bait TEXT DEFAULT '',
    best_time TEXT DEFAULT '',
    water_temp_min INTEGER DEFAULT 0,
    water_temp_max INTEGER DEFAULT 0,
    habitat TEXT DEFAULT '',
    difficulty TEXT DEFAULT '',
    tip TEXT DEFAULT '',
    distribution_provinces TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    reviewer_note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME
  );
`);

// 初始化：从 fish_seasonal.json 导入数据到 fish 表（仅首次）
const fishCount = db.prepare('SELECT COUNT(*) as cnt FROM fish').get().cnt;
if (fishCount === 0) {
  const jsonPath = path.join(__dirname, '../data/fish_seasonal.json');
  if (fs.existsSync(jsonPath)) {
    const fishData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const insert = db.prepare(`
      INSERT OR IGNORE INTO fish (id, name_zh, name_latin, aliases, monthly_activity, fishing_methods, recommended_bait, best_time, water_temp_min, water_temp_max, habitat, difficulty, tip, distribution_provinces, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'official')
    `);

    const insertMany = db.transaction((fishes) => {
      for (const f of fishes) {
        insert.run(
          f.id,
          f.name_zh,
          f.name_latin || '',
          f.aliases || f.name_zh,
          JSON.stringify(f.monthly_activity),
          JSON.stringify(f.fishing_methods),
          JSON.stringify(f.recommended_bait),
          JSON.stringify(f.best_time),
          f.water_temp?.optimal_min || 0,
          f.water_temp?.optimal_max || 0,
          f.habitat || '',
          f.difficulty || '',
          f.tip || '',
          JSON.stringify(f.distribution_provinces || []),
        );
      }
    });

    insertMany(fishData);
    console.log(`[DB] Imported ${fishData.length} fish from JSON`);
  }
}

module.exports = db;
