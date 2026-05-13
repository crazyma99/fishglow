# 渔光小程序前端

微信小程序客户端，基于 uni-app (Vue 3 + Vite) 开发。

## 技术栈

- **框架**: uni-app (Vue 3, `<script setup>`)
- **构建**: Vite → 微信小程序
- **状态**: ref + uni.storage (无 Pinia)
- **图标**: IconPark SVG 三色变体 (primary/muted/white)

## 设计规范

| Token | 值 | 用途 |
|-------|------|------|
| Primary | `#EA580C` | 主色（高饱和橙） |
| Secondary | `#0EA5E9` | 辅色（水蓝） |
| Background | `#FAFBFC` | 页面背景 |
| Card | `#FFFFFF` | 卡片 + 1px `#E2E8F0` 边框 |
| Text | `#1E293B` / `#64748B` | 主/次文本 |
| Radius | `4rpx` | Fluent Design 直角风格 |
| Spacing | 8rpx 倍数 | 16/24/32/48rpx |

## 页面结构

### Tab 页 (5个)

| Tab | 路径 | 功能 |
|-----|------|------|
| 首页 | `pages/home` | Logo + 每日一鱼 + 本周挑战 + 当季活跃 + 快捷入口 |
| 鱼库 | `pages/fishdb` | 搜索 + 分类筛选(全部/台钓/路亚/传统钓/抛竿) |
| 识鱼 | `pages/identify` | 全屏相机 + 拍照/相册 + 水波纹 loading |
| 图鉴 | `pages/collection` | 3 列网格收集册 + 下拉刷新 |
| 我的 | `pages/profile` | 用户信息 + 统计 + 成就 + 登录/退出 |

### 二级页 (6个)

| 页面 | 路径 | 功能 |
|------|------|------|
| 识别结果 | `pages/result` | Hero 大图 + 置信度环 + 卡片式结构化信息 + 候选滑动 + 贡献入口 |
| 鱼种详情 | `pages/fish-detail` | 条形图月活跃度 + 中国地图省份分布 + 水温可视化 |
| 成就墙 | `pages/achievement` | 2 列勋章 + 点击详情弹窗(条件/进度/时间) |
| 识别历史 | `pages/history` | 时间线列表 + 分页加载 |
| 我的贡献 | `pages/contributions` | 贡献列表 + 状态标签(审核中/已通过/已拒绝) |
| 贡献详情 | `pages/contribution-detail` | 状态横幅 + 审核备注 + 完整数据展示 |

## 公共组件

| 组件 | 用途 |
|------|------|
| `FishCard.vue` | 鱼种卡片（封面图/占位图 + 名称 + 难度 + 钓法标签） |
| `BadgeItem.vue` | 勋章项（SVG 图标 + 锁定/解锁态） |
| `LoadingWave.vue` | 水波纹同心圆 loading 动效 |

## 开发

```bash
npm install
npm run dev:mp-weixin    # 开发模式
npm run build:mp-weixin  # 生产构建
```

输出目录: `dist/dev/mp-weixin/` 或 `dist/build/mp-weixin/`

用微信开发者工具导入输出目录，勾选「不校验合法域名」进行调试。

## 配置

API 地址在 `src/utils/config.js` 中统一配置：

```js
const SERVER_BASE = 'http://10.192.165.191:3900';  // 本地开发
// const SERVER_BASE = 'https://fishglow.crazyma99.xyz'; // 生产
```

## 关键注意点

1. `uploadFile` 字段名必须是 `file`
2. `structured` 是对象 `{alias, family, ...}` 不是数组
3. 季节 API 路径: `res.data.recommendations`
4. 鱼库筛选字段: `fishing_methods`（数组）
5. 相机页: `height: 100vh; background: #000`
6. tabBar 页用 `uni.switchTab`，非 tabBar 用 `navigateTo`
7. iOS 日期兼容: `new Date(str.replace(' ', 'T'))`
