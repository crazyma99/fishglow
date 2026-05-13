const router = require('express').Router();
const axios = require('axios');
const db = require('../db/init');

router.post('/openid', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.json({ code: 1, msg: 'code is required' });

    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    if (!data.openid) return res.json({ code: 1, msg: data.errmsg || '登录失败' });

    // 自动建用户，默认昵称: 渔友 + openid 后4位
    const defaultNickname = '渔友 ' + data.openid.slice(-4);
    db.prepare('INSERT OR IGNORE INTO users (openid, nickname) VALUES (?, ?)').run(data.openid, defaultNickname);
    res.json({ code: 0, data: { openid: data.openid } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

module.exports = router;
