require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { perMinute } = require('./middleware/rateLimit');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源
app.use('/assets', express.static(path.join(__dirname, 'public')));

// 全局限流
app.use('/api', perMinute);

// 路由
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recognize', require('./routes/recognize'));
app.use('/api/structurize', require('./routes/structurize'));
app.use('/api/seasonal', require('./routes/seasonal'));
app.use('/api/user', require('./routes/user'));
app.use('/api/collection', require('./routes/collection'));
app.use('/api/history', require('./routes/history'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/map', require('./routes/map'));
app.use('/api/contribute', require('./routes/contribute'));
app.use('/api/fish', require('./routes/fish'));

const PORT = process.env.PORT || 3900;
const HTTPS_PORT = process.env.HTTPS_PORT || 3901;

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 1, msg: 'Internal Server Error' });
});

// HTTP
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FishGlow HTTP running on port ${PORT}`);
});

// HTTPS (局域网真机预览用)
const fs2 = require('fs');
const https = require('https');
const sslPath = path.join(__dirname, 'ssl');
if (fs2.existsSync(path.join(sslPath, 'key.pem'))) {
  const httpsOptions = {
    key: fs2.readFileSync(path.join(sslPath, 'key.pem')),
    cert: fs2.readFileSync(path.join(sslPath, 'cert.pem'))
  };
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`FishGlow HTTPS running on port ${HTTPS_PORT}`);
  });
}
