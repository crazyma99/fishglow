const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ code: 0, msg: 'ok', timestamp: Date.now() });
});

module.exports = router;
