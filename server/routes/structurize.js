const router = require('express').Router();
const { structurize } = require('../services/mimo');
const { perSecond } = require('../middleware/rateLimit');

router.post('/', perSecond, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) return res.json({ code: 1, msg: 'name and description required' });

    const structured = await structurize(name, description);
    res.json({ code: 0, data: { structured } });
  } catch (err) {
    res.json({ code: 1, msg: err.message });
  }
});

module.exports = router;
