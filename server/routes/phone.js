const router = require('express').Router();
const db = require('../db/init');

// 生成6位数验证码
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/phone/send-code — 发送验证码（开发阶段模拟，不实际发短信）
router.post('/send-code', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return res.json({ code: 1, msg: '手机号格式不正确' });
    }

    // 生成验证码，5分钟有效
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // 清除旧验证码
    db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone);
    // 存入新验证码
    db.prepare('INSERT INTO sms_codes (phone, code, expires_at) VALUES (?, ?, ?)').run(phone, code, expiresAt);

    // 开发阶段：控制台打印验证码（生产环境接入短信服务）
    console.log(`[SMS] 验证码发送: ${phone} → ${code}`);

    res.json({ code: 0, msg: '验证码已发送', data: { debug_code: process.env.NODE_ENV !== 'production' ? code : undefined } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// POST /api/phone/bind — 绑定手机号到已有 openid
router.post('/bind', (req, res) => {
  try {
    const { openid, phone, code } = req.body;
    if (!openid || !phone || !code) return res.json({ code: 1, msg: '参数不完整' });

    // 验证验证码
    const record = db.prepare('SELECT * FROM sms_codes WHERE phone = ? ORDER BY created_at DESC LIMIT 1').get(phone);
    if (!record) return res.json({ code: 1, msg: '请先获取验证码' });
    if (record.code !== code) return res.json({ code: 1, msg: '验证码错误' });
    if (Date.now() > record.expires_at) return res.json({ code: 1, msg: '验证码已过期' });

    // 检查手机号是否已被其他用户绑定
    const existing = db.prepare('SELECT openid FROM users WHERE phone = ? AND openid != ?').get(phone, openid);
    if (existing) return res.json({ code: 1, msg: '该手机号已被其他账号绑定' });

    // 绑定
    db.prepare('UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE openid = ?').run(phone, openid);

    // 清除验证码
    db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone);

    res.json({ code: 0, msg: '绑定成功' });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// POST /api/phone/login — 手机号验证码登录（Android APP 用）
router.post('/login', (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.json({ code: 1, msg: '参数不完整' });

    // 验证验证码
    const record = db.prepare('SELECT * FROM sms_codes WHERE phone = ? ORDER BY created_at DESC LIMIT 1').get(phone);
    if (!record) return res.json({ code: 1, msg: '请先获取验证码' });
    if (record.code !== code) return res.json({ code: 1, msg: '验证码错误' });
    if (Date.now() > record.expires_at) return res.json({ code: 1, msg: '验证码已过期' });

    // 查找已绑定该手机号的用户
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

    if (!user) {
      // 新用户：创建 openid（APP 用户用 phone 前缀生成唯一 ID）
      const openid = 'app_' + phone + '_' + Date.now().toString(36);
      const nickname = '渔友 ' + phone.slice(-4);
      db.prepare('INSERT INTO users (openid, phone, nickname, login_type) VALUES (?, ?, ?, ?)').run(openid, phone, nickname, 'phone');
      user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
    }

    // 清除验证码
    db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone);

    res.json({ code: 0, data: { openid: user.openid, phone: user.phone, nickname: user.nickname } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

// GET /api/phone/status?openid=xxx — 查询绑定状态
router.get('/status', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, msg: 'openid required' });
  const user = db.prepare('SELECT phone FROM users WHERE openid = ?').get(openid);
  const phone = user?.phone || '';
  res.json({ code: 0, data: { bound: !!phone, phone: phone ? phone.slice(0, 3) + '****' + phone.slice(-4) : '' } });
});

module.exports = router;
