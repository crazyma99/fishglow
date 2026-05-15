const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');
const { recognizeAnimal } = require('../services/baidu');
const { structurize } = require('../services/mimo');
const { perSecond } = require('../middleware/rateLimit');

const uploadDir = path.join(__dirname, '../public/photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

/**
 * 通过名称或别名匹配 fish 表
 * 返回匹配到的鱼种记录，或 null
 */
function matchFishByName(name) {
  // 1. 精确匹配主名称
  let fish = db.prepare('SELECT * FROM fish WHERE name_zh = ?').get(name);
  if (fish) return fish;

  // 2. 别名匹配
  const all = db.prepare("SELECT * FROM fish WHERE aliases != ''").all();
  for (const f of all) {
    const aliases = f.aliases.split(',').map(a => a.trim());
    if (aliases.includes(name)) return f;
  }

  return null;
}

router.post('/', perSecond, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.json({ code: 1, msg: '请上传图片' });

    const compressed = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 保存用户上传的图片
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, compressed);
    const photoUrl = `/assets/photos/${filename}`;

    const base64 = compressed.toString('base64');
    const rawResults = await recognizeAnimal(base64);

    // === 别名匹配增强 ===
    const enhanced = rawResults.map(r => {
      const matched = matchFishByName(r.name);
      return {
        ...r,
        // 标记是否在数据库中匹配到
        db_matched: !!matched,
        // 如果匹配到，附加数据库中的主名称和 cover_image
        db_name: matched ? matched.name_zh : null,
        db_cover: matched ? matched.cover_image : null,
        db_id: matched ? matched.id : null,
      };
    });

    // === 智能排序 ===
    // 规则: 数据库匹配的优先 → 同级按置信度排序
    enhanced.sort((a, b) => {
      // 匹配到数据库的排前面
      if (a.db_matched && !b.db_matched) return -1;
      if (!a.db_matched && b.db_matched) return 1;
      // 同级按置信度排序
      return parseFloat(b.score) - parseFloat(a.score);
    });

    // 对 Top1 做结构化提取
    if (enhanced.length > 0 && enhanced[0].baike_info && enhanced[0].baike_info.description) {
      const structured = await structurize(enhanced[0].name, enhanced[0].baike_info.description);
      enhanced[0].structured = structured;
    }

    // 判断整体置信度
    const topScore = enhanced.length > 0 ? parseFloat(enhanced[0].score) : 0;
    const confidence_level = topScore >= 0.8 ? 'high' : topScore >= 0.3 ? 'medium' : 'low';

    res.json({
      code: 0,
      data: {
        result: enhanced,
        photo_url: photoUrl,
        confidence_level,  // high/medium/low 供前端展示不同提示
        has_db_match: enhanced.some(r => r.db_matched)  // 是否有任何结果匹配到数据库
      }
    });
  } catch (err) {
    console.error('Recognize error:', err.message);
    res.json({ code: 1, msg: '识别失败: ' + err.message });
  }
});

module.exports = router;
