# 渔光 FishGlow

<p align="center">
  <img src="assets_docs/banner.jpg" width="600" />
</p>

> 面向钓鱼爱好者的 AI 识鱼工具。拍照识别鱼种 → 查看百科 → 收集渔获图鉴。

## 特性

- 📷 **拍照识鱼** — 百度 AI 动物识别 + Mimo 大模型结构化提取
- 📖 **鱼种百科** — 30+ 淡水鱼种，含月活跃度、钓法、饵料、水温、省份分布
- 🗺️ **中国地图可视化** — SVG 省份级分布高亮
- 🏆 **图鉴收集** — 宝可梦式收集体验 + 8 级成就勋章
- 🤝 **社区贡献** — 用户可提交新鱼种数据，AI 预填 + 人工审核入库
- 🔧 **管理后台** — 鱼种 CRUD、贡献审核、用户管理、封面图上传

## 项目结构

```
fishglow/
├── src/                  # 小程序前端 (uni-app Vue 3)
├── server/               # 后端服务 (Node.js + Express + SQLite)
├── admin/                # 管理后台 (Vue 3 + Vite)
├── assets_docs/          # 美术素材与数据文件
└── docs/                 # 项目文档
```

| 模块 | 技术栈 | 文档 |
|------|--------|------|
| 小程序前端 | uni-app, Vue 3, Vite | [README.miniprogram.md](./README.miniprogram.md) |
| 后端服务 | Node.js, Express, SQLite, Sharp | [README.server.md](./README.server.md) |
| 管理后台 | Vue 3, Vue Router, Vite | [README.adminplatform.md](./README.adminplatform.md) |

## 快速开始

```bash
# 1. 后端
cd server
cp .env.example .env   # 填入实际密钥
npm install
node app.js            # http://localhost:3900

# 2. 小程序前端
npm install
npm run dev:mp-weixin  # 输出到 dist/dev/mp-weixin/
# 用微信开发者工具导入 dist/dev/mp-weixin/

# 3. 管理后台
cd admin
npm install
npm run dev            # http://localhost:5174
```

## 环境要求

- Node.js 20+
- 微信开发者工具
- 百度 AI 动物识别 API 凭证
- Mimo 大模型 API 凭证

## License

MIT
