const axios = require('axios');

let cachedToken = null;
let tokenExpiry = 0;
let refreshPromise = null;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { data } = await axios.get('https://aip.baidubce.com/oauth/2.0/token', {
        params: {
          grant_type: 'client_credentials',
          client_id: process.env.BAIDU_API_KEY,
          client_secret: process.env.BAIDU_SECRET_KEY
        }
      });
      cachedToken = data.access_token;
      tokenExpiry = now + Math.max(data.expires_in - 86400, 60) * 1000;
      return cachedToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function recognizeAnimal(imageBase64) {
  const token = await getAccessToken();
  const { data } = await axios.post(
    `https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token=${token}`,
    `image=${encodeURIComponent(imageBase64)}&top_num=6&baike_num=3`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data.result || [];
}

module.exports = { recognizeAnimal };
