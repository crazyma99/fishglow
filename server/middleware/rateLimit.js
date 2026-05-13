const rateLimit = require('express-rate-limit');

const perMinute = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 20,
  message: { code: 429, msg: '请求过于频繁，请稍后再试' }
});

const perSecond = rateLimit({
  windowMs: 1000,
  max: parseInt(process.env.RATE_LIMIT_PER_SECOND) || 2,
  message: { code: 429, msg: '请求过于频繁' }
});

module.exports = { perMinute, perSecond };
