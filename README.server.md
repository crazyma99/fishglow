# 渔光后端服务

Node.js + Express + SQLite 后端，提供 API 服务、AI 识别、文件存储。

## 技术栈

- **运行时**: Node.js 20 + Express
- **数据库**: SQLite (better-sqlite3, WAL 模式)
- **图片处理**: Sharp (压缩/裁剪)
- **文件上传**: Multer (内存/磁盘存储, 4MB 限制)
- **限流**: express-rate-limit (20/min 全局, 2/sec 识别接口)
- **进程管理**: PM2

## 数据库 Schema

| 表 | 用途 |
|----|------|
| `users` | 用户（openid 主键） |
| `fish` | 鱼种数据库（30 种官方 + 社区贡献） |
| `collections` | 用户图鉴收藏 (UNIQUE: openid + fish_name) |
| `history` | 识别历史记录 |
| `achievements` | 成就解锁 (UNIQUE: openid + badge_id) |
| `contributions` | 用户贡献待审核 |

启动时自动从 `data/fish_seasonal.json` 导入 30 种鱼到 `fish` 表（仅首次）。

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/auth/openid` | 微信登录换 openid |
| POST | `/api/recognize` | 上传图片 AI 识别 (multipart, field: `file`) |
| POST | `/api/structurize` | 按需结构化百科文本 |
| GET | `/api/seasonal?month=5` | 当月鱼种推荐（从 DB 查询, 5 分钟缓存） |
| GET | `/api/badges` | 勋章图片 URL 映射 |
| GET | `/api/map?provinces=广东,湖南` | 动态着色中国地图 SVG |
| GET | `/api/fish/cover?name=鲫鱼` | 获取鱼种封面图 URL |

### 用户接口（需 openid）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user?openid=xxx` | 获取用户信息 |
| POST | `/api/user/update` | 更新昵称/头像 |
| GET | `/api/user/stats?openid=xxx` | 统计数据 |
| POST | `/api/collection/add` | 收藏鱼种（支持 JSON 和 multipart） |
| GET | `/api/collection/list?openid=xxx` | 图鉴列表 |
| POST | `/api/history/add` | 添加识别历史 |
| GET | `/api/history/list?openid=xxx&limit=50&offset=0` | 历史列表 |
| GET | `/api/achievements?openid=xxx` | 用户成就 |

### 贡献接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/contribute/check?fish_name=xxx` | 检查鱼种是否已有数据 |
| POST | `/api/contribute/generate` | AI 生成鱼种数据（Mimo, 60s 超时） |
| POST | `/api/contribute/submit` | 用户提交贡献 |
| GET | `/api/contribute/my?openid=xxx` | 用户贡献列表 |
| GET | `/api/contribute/detail?id=xxx` | 贡献详情 |

### 管理接口（需 admin_key）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/contribute/pending` | 待审核列表 |
| POST | `/api/contribute/review` | 审核通过/拒绝 |
| GET | `/api/fish/list` | 鱼种全列表 |
| GET | `/api/fish/detail?id=xxx` | 鱼种详情 |
| POST | `/api/fish/create` | 新增鱼种 |
| POST | `/api/fish/update` | 更新鱼种 |
| POST | `/api/fish/delete` | 删除鱼种 |
| POST | `/api/fish/upload-cover` | 上传封面图 (multipart, 裁剪 600×400) |
| GET | `/api/user/list` | 用户列表(含统计) |

## 第三方服务

| 服务 | 用途 | 配置 |
|------|------|------|
| 百度动物识别 | 图片识别 Top6 鱼种 | `BAIDU_API_KEY` / `BAIDU_SECRET_KEY` |
| Mimo 大模型 | 结构化提取 + 贡献数据生成 | `MIMO_BASE_URL` / `MIMO_API_KEY` / `MIMO_MODEL` |
| 微信 jscode2session | 小程序登录 | `WX_APPID` / `WX_SECRET` |

## 部署

```bash
# 环境变量
cp .env.example .env
# 填入实际密钥

# 安装 & 启动
npm install --production
pm2 start app.js --name fishglow --cwd /opt/fishglow/server
pm2 save
```

### Nginx 配置 (HTTPS 反向代理)

```nginx
server {
    listen 443 ssl;
    server_name fishglow.crazyma99.xyz;

    location / {
        proxy_pass http://127.0.0.1:3900;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 静态资源

| 路径 | 内容 |
|------|------|
| `/assets/badges/` | 8 个勋章 PNG + banner.jpg |
| `/assets/photos/` | 用户上传照片（运行时生成） |
| `/assets/fish-covers/` | 鱼种封面图（管理后台上传） |
| `/assets/admin/` | 管理后台构建产物 |
| `/assets/logo.svg` | 品牌 Logo |
| `/assets/china-map-lite.svg` | 中国地图底图 |
