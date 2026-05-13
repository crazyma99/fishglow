const router = require('express').Router();

const getBaseUrl = () => {
  if (process.env.ASSETS_URL) return process.env.ASSETS_URL;
  return process.env.NODE_ENV === 'production'
    ? 'https://fishglow.crazyma99.xyz/assets'
    : `http://localhost:${process.env.PORT || 3900}/assets`;
};

router.get('/', (req, res) => {
  const base = getBaseUrl();
  const badges = ['first', 'five', 'ten', 'twenty', 'thirty', 'fifty', 'hundred', 'legendary'];
  const data = {};
  badges.forEach(id => { data[id] = `${base}/badges/${id}.png`; });
  res.json({ code: 0, data });
});

module.exports = router;
