const rateLimit = require('express-rate-limit');

// 通用接口：宽松限流（读取类）
const perMinute = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { code: 429, msg: '请求过于频繁，请稍后再试' }
});

// 写入类接口：中等限流
const perMinuteWrite = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { code: 429, msg: '操作过于频繁' }
});

// AI 调用类：严格限流（防 token 滥用）
const perSecond = rateLimit({
  windowMs: 1000,
  max: 2,
  message: { code: 429, msg: '请求过于频繁' }
});

module.exports = { perMinute, perMinuteWrite, perSecond };
