# 渔光 FishGlow — 全栈开发 PRD

> 本文档是完整的开发规范。AI 拿到此文档 + `assets_docs/` 目录下的数据文件，即可从零完成整个项目的前端+后端+部署。无需参考其他代码。

---

## 一、产品概要

- **名称**：渔光（FishGlow）
- **形态**：微信小程序 + Node.js 后端
- **定位**：面向钓鱼爱好者的 AI 识鱼工具。拍照识别鱼种 → 查看百科 → 收集渔获图鉴。
- **核心卖点**：拍照即知鱼名、宝可梦式图鉴收集、当月钓什么鱼一目了然

---

## 二、凭证与环境（直接使用，不需申请）

### 2.1 微信小程序

| Key | Value |
|-----|-------|
| AppID | `wxd73380ffc5598f8c` |
| AppSecret | `bcba6c77b7ea027e84646d2ee5e23bba` |

### 2.2 百度 AI 动物识别

| Key | Value |
|-----|-------|
| API Key | `D250LTvMC61lvJRDzNlWOJhy` |
| Secret Key | `MqF1YoO5w1j8QiXgnbpSHIiHkKPABJFT` |
| Token 接口 | `GET https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={AK}&client_secret={SK}` |
| 识别接口 | `POST https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token={token}` |
| 请求体 | `application/x-www-form-urlencoded`，字段 `image`=base64, `top_num`=6, `baike_num`=3 |
| Token 有效期 | 30天，需缓存+过期前刷新 |

### 2.3 Mimo 大模型（结构化提取用）

| Key | Value |
|-----|-------|
| Base URL | `https://token-plan-cn.xiaomimimo.com/v1` |
| API Key | `tp-cetnejc7h5v7m8d8lqknegcbh6h7nrp6o838ao8v75rjgsfi` |
| Model | `mimo-v2.5` |
| 接口 | `POST {Base URL}/chat/completions` |
| 必须参数 | `thinking: { type: "disabled" }`（否则推理模型消耗大量token且超时） |

### 2.4 服务器

| Key | Value |
|-----|-------|
| 云服务商 | 腾讯云轻量 |
| IP | `42.194.215.240` |
| SSH | `ssh ubuntu@42.194.215.240`（已配置免密） |
| 部署路径 | `/opt/fishglow` |
| 域名 | `fishglow.crazyma99.xyz` |
| HTTPS | 已配置 Let's Encrypt + Nginx 反向代理(443→127.0.0.1:3900) |
| 前端 BASE_URL | `https://fishglow.crazyma99.xyz/api` |
| 静态资源 URL | `https://fishglow.crazyma99.xyz/assets/` |

### 2.5 后端 .env 完整内容

```env
BAIDU_API_KEY=D250LTvMC61lvJRDzNlWOJhy
BAIDU_SECRET_KEY=MqF1YoO5w1j8QiXgnbpSHIiHkKPABJFT
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_API_KEY=tp-cetnejc7h5v7m8d8lqknegcbh6h7nrp6o838ao8v75rjgsfi
MIMO_MODEL=mimo-v2.5
WX_APPID=wxd73380ffc5598f8c
WX_SECRET=bcba6c77b7ea027e84646d2ee5e23bba
PORT=3900
NODE_ENV=production
RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_PER_SECOND=2
```

---

## 三、技术选型

### 前端

| 项 | 选型 |
|----|------|
| 框架 | uni-app (Vue 3, `<script setup>`) |
| 编译目标 | 微信小程序 |
| 构建 | Vite (`npm run dev:mp-weixin`) |
| 输出 | `dist/dev/mp-weixin/`（导入微信开发者工具） |
| 图标 | IconPark SVG，三色变体 (primary/muted/white) |
| 状态 | ref + uni.storage（无 Pinia） |

### 后端

| 项 | 选型 |
|----|------|
| 运行时 | Node.js 20 + Express |
| 数据库 | SQLite (better-sqlite3) |
| 文件上传 | multer (内存存储, 限 4MB) |
| 图片压缩 | Sharp (max 1200px, JPEG Q80) |
| 限流 | express-rate-limit |
| 进程 | PM2 |

### 后端 package.json dependencies

```json
{
  "express": "^4.18",
  "axios": "^1.6",
  "better-sqlite3": "^11",
  "sharp": "^0.33",
  "multer": "^1.4",
  "express-rate-limit": "^7",
  "cors": "^2.8",
  "dotenv": "^16"
}
```

---

## 四、数据库 Schema (SQLite)

```sql
CREATE TABLE users (
  openid TEXT PRIMARY KEY,
  nickname TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL,
  fish_name TEXT NOT NULL,
  score TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  baike_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  structured TEXT DEFAULT '',
  photo_path TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(openid, fish_name)
);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL,
  fish_name TEXT NOT NULL,
  score TEXT DEFAULT '',
  raw_score TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  baike_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  structured TEXT DEFAULT '',
  photo_path TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(openid, badge_id)
);
```

---

## 五、API 接口规范

所有接口前缀 `/api`，JSON 响应格式统一：`{ "code": 0, "msg": "ok", "data": {...} }`

### 5.1 POST /api/auth/openid

前端 `wx.login()` 拿 code → 发给后端 → 后端调微信 `jscode2session` 换 openid → 自动建用户记录 → 返回 openid。

请求: `{ "code": "xxx" }`
响应: `{ "code": 0, "data": { "openid": "oXXX" } }`

### 5.2 POST /api/recognize (multipart)

前端 `uni.uploadFile`，**字段名必须是 `file`**。

后端流程:
1. multer 接收 → buffer → base64
2. 调百度识别 API (top_num=6, baike_num=3)
3. 对 Top 1 结果调 mimo 结构化（可能超时，超时返回 structured=null）
4. 返回完整结果

响应:
```json
{
  "code": 0,
  "data": {
    "result": [
      {
        "score": "0.486",
        "name": "宽鳍鱲",
        "baike_info": {
          "baike_url": "https://baike.baidu.com/...",
          "image_url": "https://bkimg.cdn.bcebos.com/...",
          "description": "宽鳍鱲（学名...）是鲤科..."
        },
        "structured": {
          "alias": "桃花鱼、双尾鱼",
          "family": "鲤科鱲属",
          "features": "体延长侧扁...",
          "habitat": "江河支流和湖泊水库",
          "distribution": "中国、日本、韩国",
          "food": "杂食性",
          "breeding": "4-6月",
          "edible": "是",
          "fun_fact": "是清洁水体的指示鱼类"
        }
      },
      { "score": "0.395", "name": "马口鱼", "baike_info": {...} }
    ]
  }
}
```

### 5.3 POST /api/structurize

按需结构化（前端切换候选鱼种时调用）。

请求: `{ "name": "马口鱼", "description": "百科文本(max 3000字)" }`
响应: `{ "code": 0, "data": { "structured": {...9字段对象} } }`

**Mimo prompt 模板**:
```
你是一个鱼类百科数据提取工具。从以下百科文本中提取结构化信息，只输出JSON，不要其他内容。
输出格式：{"alias":"别名","family":"科属","features":"外形特征50字内","habitat":"栖息环境30字内","distribution":"分布区域30字内","food":"食性20字内","breeding":"繁殖季节","edible":"是/否/未知","fun_fact":"冷知识30字内"}
鱼种名称：{name}
百科文本：{description}
```

### 5.4 GET /api/seasonal?month=5

返回当月鱼种列表按活跃度降序。数据源: `server/data/fish_seasonal.json`（附件提供完整30种数据）。

响应: `{ "code": 0, "data": { "month": 5, "recommendations": [{...鱼种对象, score: 9, level: "high"}] } }`

level 规则: score>=7 → "high", score>=4 → "medium", else → "low"

### 5.5 GET /api/badges

返回勋章图片URL映射。图片存 `server/public/badges/`。

响应: `{ "code": 0, "data": { "first": "https://fishglow.crazyma99.xyz/assets/badges/first.png", ... } }`

### 5.6 GET /api/user?openid=xxx
### 5.7 POST /api/user/update `{ "openid", "nickname", "avatar_url" }`
### 5.8 POST /api/collection/add (multipart: openid, fish_name, score, image_url, baike_url, description, structured, photo文件)

收藏后自动 `checkAndUnlockBadges` → 响应含 `new_badges: []`

### 5.9 GET /api/collection/list?openid=xxx
### 5.10 POST /api/history/add (multipart: openid, fish_name, score, raw_score, image_url, baike_url, description, structured, photo文件)
### 5.11 GET /api/history/list?openid=xxx&limit=50&offset=0
### 5.12 GET /api/achievements?openid=xxx
### 5.13 GET /api/user/stats?openid=xxx → `{ collection_count, history_count }`
### 5.14 GET /api/health → `{ "code": 0, "msg": "ok", "timestamp": ... }`

---

## 六、页面结构与功能

### 6.1 Tab 导航 (5个)

| Tab | 路径 | 功能 |
|-----|------|------|
| 首页 | pages/home | 发现 Feed: 每日一鱼+本周挑战+当季鱼种+快捷入口 |
| 鱼库 | pages/fishdb | 搜索+分类筛选(全部/台钓/路亚/传统钓/抛竿)+鱼种列表 |
| 识鱼 | pages/identify | 全屏相机+拍照/相册+水波纹loading动效 |
| 图鉴 | pages/collection | 3列网格收集册+统计 |
| 我的 | pages/profile | 用户信息+统计+成就预览+菜单 |

### 6.2 二级页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 识别结果 | pages/result | 展示Top结果+结构化信息+候选+收藏/分享 |
| 鱼种详情 | pages/fish-detail | 全年月历+钓法+饵料+水温+建议 |
| 我的成就 | pages/achievement | 2列勋章墙+进度 |
| 识别历史 | pages/history | 列表+时间+点击回顾 |

### 6.3 首页模块

1. **每日一鱼**: 卡片展示一种鱼（从季节数据随机取），点击进鱼种详情
2. **本周挑战**: "识别5种不同的鱼" + 进度条（读本地 collection 长度 vs 5）
3. **当季活跃**: 水平滚动鱼种卡片（GET /api/seasonal 取 Top 10）
4. **快捷入口**: 2×2 网格 → 识别历史/我的成就/鱼类百科/去钓鱼(预留showToast)

### 6.4 识鱼流程

```
点击快门/选相册 → isLoading=true → uploadFile(name:"file") → 后端识别
  → 成功: setStorageSync('temp_result', { imagePath, results, timestamp }) → navigateTo result
  → 失败: showToast
```

### 6.5 结果页数据消费

读取 `temp_result` 后立即 `removeStorageSync`。

结果格式化:
- 过滤 `name !== '非动物' && parseFloat(score) > 0.01`
- 置信度展示: ≥0.8 "非常匹配"(绿) / ≥0.5 "可能是"(金) / 其他 "也许是"(灰)
- **structured 是对象不是数组**: `{ alias, family, features, habitat, distribution, food, breeding, edible, fun_fact }`
- 如果 structured 为 null 且有 description → 调 `/api/structurize` 补充

### 6.6 成就系统

| badge_id | 名称 | 阈值 |
|----------|------|------|
| first | 初识 | 1 |
| five | 入门 | 5 |
| ten | 钓友 | 10 |
| twenty | 探索者 | 20 |
| thirty | 达人 | 30 |
| fifty | 大师 | 50 |
| hundred | 百鱼斋主 | 100 |
| legendary | 渔光传说 | 200 |

收藏时后端检查 `countCollections(openid)` >= threshold → 解锁写入 achievements 表。

---

## 七、设计规范

### 配色 (浅色清新水蓝系)

使用 `/ui-ux-pro-max` 进行小程序前端设计，浅色+高饱和度橙为主色系，采用日系设计风格，卡片化设计，直角矩形（类Fluent Design）

### 图标

IconPark SVG，三色存放 `static/icons/{primary|muted|white}/xxx.svg`。
所需: camera, album, fish, bookmark, history, trophy, lock, search, share, arrow-left, arrow-right, info, star, logout, close

### 字体

系统字体 `-apple-system, PingFang SC`。基准 28rpx，标题 30-36rpx bold。

---

## 八、关键踩坑点（必读）

1. **uploadFile 字段名是 `file`**，不是 `image`
2. **structured 是对象** `{alias, family, ...}`，不要当数组遍历
3. **mimo 必须 `thinking: { type: "disabled" }`**，否则超时
4. **季节 API 返回路径**: `res.data.data.recommendations`
5. **鱼种过滤字段是 `fishing_methods`**（数组），不是 `methods`
6. **小程序相机页面需要**: page `height: 100vh` + `background: #000`
7. **canvas 分享需要**: 模板中放 `<canvas canvas-id="shareCanvas" class="share-canvas"/>` + 样式 `position:fixed; left:-9999rpx`
8. **PM2 必须指定 --cwd**: `pm2 start app.js --name fishglow --cwd /opt/fishglow/server`
9. **百度 token 缓存**: 有效期30天，需内存缓存+并发锁防重复刷新
10. **小程序不支持本地字体加载**: 图标用 SVG image 方案，不用 @font-face
11. **图鉴/历史传给 result 页格式**: `{ imagePath, results: [{ name, score, baike_info: { image_url, baike_url, description }, structured }], timestamp }`
12. **tabBar 页面用 switchTab**，非 tabBar 页面用 navigateTo

---

## 九、静态数据文件

以下文件放在项目 `assets_docs/` 或 `server/data/` 中：

| 文件 | 说明 | 位置 |
|------|------|------|
| `fish_seasonal.json` | 30种淡水鱼×12月活跃度+钓法+饵料+水温 | server/data/ |
| 勋章图片 ×8 | first/five/ten/twenty/thirty/fifty/hundred/legendary.png | server/public/badges/ |
| banner.jpg | 成就页顶部背景图 | server/public/badges/ |
| IconPark SVG ×15 | 三色变体(primary/muted/white) | src/static/icons/ |

`fish_seasonal.json` 单条数据结构:
```json
{
  "id": "crucian_carp",
  "name_zh": "鲫鱼",
  "name_latin": "Carassius auratus",
  "monthly_activity": [5,6,8,10,9,6,4,4,7,9,8,5],
  "fishing_methods": ["台钓", "传统钓", "筏钓"],
  "recommended_bait": {
    "spring": ["蚯蚓", "红虫", "商品饵(腥香型)"],
    "summer": ["玉米粒", "面饵", "商品饵(清淡型)"],
    "autumn": ["蚯蚓", "红虫", "商品饵(腥香型)"],
    "winter": ["红虫", "蚯蚓", "虾拉饵"]
  },
  "best_time": {
    "spring": "全天，早晚优先",
    "summer": "早晨/傍晚/夜钓",
    "autumn": "全天",
    "winter": "中午前后(10:00-15:00)"
  },
  "water_temp": { "optimal_min": 15, "optimal_max": 25 },
  "habitat": "静水/缓流，水草区、淤泥底",
  "difficulty": "easy",
  "tip": "四季可钓的入门首选，春秋找浅滩水草区，冬季找深水向阳处"
}
```

---

## 十、部署流程

```bash
# 服务器已就绪，Nginx+HTTPS已配置
ssh ubuntu@42.194.215.240
sudo rm -rf /opt/fishglow
sudo git clone {你的仓库} /opt/fishglow
cd /opt/fishglow/server
sudo npm install --production
# 写入 .env（第二章2.5节内容）
sudo pm2 start app.js --name fishglow --cwd /opt/fishglow/server
sudo pm2 save
```

---

## 十一、验收标准

- [ ] 真机拍照识别成功，返回鱼名+结构化信息
- [ ] 结果页展示"非常匹配/可能是/也许是"（非原始百分比）
- [ ] 收入图鉴后在图鉴Tab可见
- [ ] 鱼库搜索、分类筛选正常
- [ ] 鱼种详情展示月历+当季饵料+水温
- [ ] 分享卡片可生成并保存到相册
- [ ] 成就解锁正常（收藏第1条后出现"初识"勋章）
- [ ] 识别历史列表正常
- [ ] 退出登录/修改昵称正常
- [ ] 服务端 health check 正常
- [ ] 所有 Tab 页切换无白屏
