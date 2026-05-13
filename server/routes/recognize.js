const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { recognizeAnimal } = require('../services/baidu');
const { structurize } = require('../services/mimo');
const { perSecond } = require('../middleware/rateLimit');

const uploadDir = path.join(__dirname, '../public/photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

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
    const results = await recognizeAnimal(base64);

    if (results.length > 0 && results[0].baike_info && results[0].baike_info.description) {
      const structured = await structurize(results[0].name, results[0].baike_info.description);
      results[0].structured = structured;
    }

    res.json({ code: 0, data: { result: results, photo_url: photoUrl } });
  } catch (err) {
    console.error('Recognize error:', err.message);
    res.json({ code: 1, msg: '识别失败: ' + err.message });
  }
});

module.exports = router;
