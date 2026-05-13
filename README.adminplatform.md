# 渔光管理后台

Vue 3 + Vite 单页应用，用于鱼种数据管理、贡献审核、用户查看。

## 技术栈

- **框架**: Vue 3 (`<script setup>`)
- **路由**: Vue Router 4 (Hash 模式)
- **构建**: Vite
- **UI**: 自定义组件，与小程序设计风格一致

## 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| 仪表盘 | `#/dashboard` | 鱼种总数、待审核、社区贡献、用户数统计 |
| 鱼种数据 | `#/fish` | 列表(含封面缩略图) + 新增 / 编辑 / 删除 + 封面图上传裁剪 |
| 审核列表 | `#/review` | 待审核贡献 → 右侧抽屉查看详情 → 通过入库 / 拒绝 |
| 用户管理 | `#/users` | 用户列表(OpenID/昵称/图鉴/识别/贡献/注册时间) + 详情抽屉 |

## 交互模式

- **左侧边栏**: 固定导航，品牌 Logo + 4 个菜单项
- **内容区**: 表格列表 + 操作按钮
- **右侧抽屉**: 点击行 → 滑出详情面板（查看/编辑/审核）
- **登录**: 管理密钥认证（`ADMIN_KEY` 环境变量）

## 公共组件

| 组件 | 用途 |
|------|------|
| `Drawer.vue` | 右侧抽屉（Teleport, 动画, 遮罩, header/body/footer slot） |
| `FishForm.vue` | 鱼种编辑表单（名称/学名/难度/水温/钓法/活跃度/省份/技巧） |

## 设计 Token

与小程序保持完全一致：

```css
--primary: #EA580C;
--primary-light: #FFF7ED;
--secondary: #0EA5E9;
--bg: #FAFBFC;
--card: #FFFFFF;
--text: #1E293B;
--border: #E2E8F0;
--radius: 4px;
```

## 开发

```bash
cd admin
npm install
npm run dev    # http://localhost:5174 (Vite 自动代理 /api → localhost:3900)
```

## 构建 & 部署

```bash
npm run build  # 输出到 ../server/public/admin/
```

构建产物直接部署在后端静态资源目录下，通过 Express 提供服务：

```
访问: http://your-server/assets/admin/index.html
```

## 封面图上传

鱼种数据页 → 点击鱼种 → 右侧抽屉详情 → 封面图区域：

1. 选择图片文件
2. 客户端 Canvas **自动裁剪为 3:2 比例** (600×400px)
3. 预览确认后上传
4. 服务端 Sharp 二次处理存储

裁剪比例与小程序 FishCard 展示比例一致。
