# 渔光 FishGlow — Y2K Streetwear × Pixel 设计系统

---

## 设计理念

**Y2K 街头潮牌** + **像素复古** + **品牌色板**

融合千禧年街头文化的大胆撞色、像素游戏的8-bit质感、以及品牌独有的荧光绿+辣橙双色系统。
目标是让一个钓鱼工具看起来像潮牌App，而不是传统工具。

---

## 一、色彩系统

### 品牌色（来自色板）

| Token | 色号 | 名称 | 用途 |
|-------|------|------|------|
| `--brand-orange` | `#FF590E` | 辣么橙 | 主CTA、按钮、品牌高亮 |
| `--brand-green` | `#B4EF4E` | 介么绿 | 强调、标签、成功状态、活跃指示 |
| `--brand-black` | `#222222` | 么么黑 | 主文本、粗边框、标题 |

### 中性色阶

| Token | 色号 | 用途 |
|-------|------|------|
| `--neutral-50` | `#F6F6F6` | 页面背景（浅色模式） |
| `--neutral-100` | `#EEEEEE` | 卡片背景/输入框底 |
| `--neutral-200` | `#D8D8D8` | 分割线、边框 |
| `--neutral-400` | `#A9A9A9` | 次级文本、占位符 |
| `--neutral-900` | `#222222` | 主文本 |

### 功能色

| Token | 色号 | 用途 |
|-------|------|------|
| `--color-success` | `#B4EF4E` | 成功（复用介么绿） |
| `--color-error` | `#FF590E` | 错误/危险（复用辣么橙加深） |
| `--color-warning` | `#FFD93D` | 警告（Y2K经典黄） |
| `--color-info` | `#00CFFF` | 信息/链接（Y2K氰蓝） |

### 深色模式（备选）

| Token | 色号 | 用途 |
|-------|------|------|
| `--dark-bg` | `#0A0A0A` | 深色页面背景 |
| `--dark-card` | `#1A1A1A` | 深色卡片 |
| `--dark-text` | `#F6F6F6` | 深色模式主文本 |

---

## 二、字体系统

### 像素字体（标题/强调）

```
字体: "Press Start 2P" （英文像素体）
中文备选: 站酷快乐体 / 方正像素体 / 系统默认粗体
用途: 页面大标题、成就名称、数字显示
```

### 正文字体

```
字体: -apple-system, "PingFang SC", sans-serif
字重: 400(正文) / 700(强调) / 900(标题)
用途: 所有正文内容
```

### 字号阶梯

| 级别 | 大小 | 字重 | 用途 |
|------|------|------|------|
| Display | 48rpx | 900 | 数字统计、大数展示 |
| H1 | 36rpx | 900 | 页面主标题 |
| H2 | 30rpx | 700 | 卡片标题 |
| Body | 28rpx | 400 | 正文 |
| Caption | 24rpx | 400 | 说明、时间 |
| Pixel | 20rpx | - | 像素字体用 |

---

## 三、组件风格

### 卡片 Card

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │ ← 外层: 4px 实色偏移阴影
│ │                     │ │
│ │    Card Content     │ │ ← 内层: 白底/#EEEEEE
│ │                     │ │    3px #222 实线边框
│ └─────────────────────┘ │    border-radius: 0 (直角!)
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← 阴影: box-shadow: 4px 4px 0 #222
└─────────────────────────┘
```

```css
.card {
  background: #EEEEEE;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  padding: 24rpx;
}

/* 按压时阴影消失 + 位移 */
.card:active {
  box-shadow: none;
  transform: translate(4px, 4px);
}
```

### 按钮 Button

```
 ┌──────────────────┐
 │ ██ 拍照识鱼 ██  │ ← 辣么橙底 #FF590E
 └──────────────────┘   白色粗体文字
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   3px #222 边框
                        box-shadow: 4px 4px 0 #222
```

```css
.btn-primary {
  background: #FF590E;
  color: #FFFFFF;
  border: 3px solid #222222;
  border-radius: 0;
  box-shadow: 4px 4px 0 #222222;
  font-weight: 900;
  font-size: 28rpx;
  padding: 20rpx 32rpx;
  text-transform: uppercase;
}

.btn-secondary {
  background: #B4EF4E;
  color: #222222;
  /* 同上边框阴影 */
}

.btn-ghost {
  background: transparent;
  color: #222222;
  border: 3px solid #222222;
  box-shadow: none;
}
```

### 标签 Tag

```
┌─────────┐         ┌─────────┐
│ 台 钓   │ ← 绿底  │ 困 难   │ ← 橙底
└─────────┘         └─────────┘
  2px #222 边框       像素风格方块
  border-radius: 0
```

```css
.tag {
  border: 2px solid #222222;
  border-radius: 0;
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.tag--green { background: #B4EF4E; color: #222222; }
.tag--orange { background: #FF590E; color: #FFFFFF; }
.tag--gray { background: #D8D8D8; color: #222222; }
.tag--pixel { font-family: 'Press Start 2P', monospace; font-size: 16rpx; }
```

### 输入框 Input

```css
.input {
  background: #F6F6F6;
  border: 3px solid #222222;
  border-radius: 0;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
}

.input:focus {
  border-color: #FF590E;
  box-shadow: 4px 4px 0 #FF590E;
}
```

---

## 四、像素元素

### 像素装饰

```
★ ★ ★        ← 像素星星（成就评分）
░░░▓▓▓████   ← 像素进度条
█▀▀▀▀▀▀█     ← 像素边框容器
█      █
█▄▄▄▄▄▄█
```

### 像素进度条

```css
.progress-pixel {
  height: 16rpx;
  background: #D8D8D8;
  border: 2px solid #222222;
}

.progress-pixel__fill {
  height: 100%;
  background: #B4EF4E;
  /* 无圆角，方块状 */
  image-rendering: pixelated;
}
```

### 像素分割线

```css
.divider-pixel {
  height: 4rpx;
  background: repeating-linear-gradient(
    90deg,
    #222222 0px, #222222 4px,
    transparent 4px, transparent 8px
  );
}
```

---

## 五、间距系统

保持 8px 倍数，但强调**紧凑+留白的反差**：

| Token | 值 | 用途 |
|-------|------|------|
| `--space-xs` | 8rpx | 标签内间距 |
| `--space-sm` | 16rpx | 元素间最小间距 |
| `--space-md` | 24rpx | 卡片内边距 |
| `--space-lg` | 32rpx | 区块间距 |
| `--space-xl` | 48rpx | 大区块分隔 |

---

## 六、图标风格

像素化 SVG 图标，或使用现有图标 + 像素化滤镜：

```css
.icon-pixel {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

---

## 七、动效

| 效果 | 实现 | 场景 |
|------|------|------|
| 按压位移 | `transform: translate(4px, 4px)` + 去阴影 | 所有按钮、卡片 |
| 闪烁 | `animation: blink 0.5s step-end infinite` | 像素光标、加载提示 |
| 逐帧 | `animation-timing-function: steps(N)` | 像素鱼图标动画 |
| 抖动 | `animation: shake 0.3s` | 错误反馈 |
| 滚动文字 | CSS `marquee` 或 `translateX` 动画 | 首页横幅 |

---

## 八、页面线框图

### 首页

```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗   │
│ ║   FishGlow LOGO (像素)   ║   │ ← 像素风 Logo
│ ╚═══════════════════════════╝   │
│                                 │
│ ┌───────────────────────────┐   │
│ │ ★ 每日一鱼               │   │ ← 3px黑边 + 4px偏移阴影
│ │ ┌──────┐                  │   │
│ │ │ 鲫鱼 │  四季可钓...     │   │ ← 鱼名用像素字体
│ │ └──────┘                  │   │
│ └───────────────────────────┘   │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │ ← 阴影层
│                                 │
│ ┌───────────────────────────┐   │
│ │ ░░░▓▓▓▓████░░░░░░░  3/5  │   │ ← 像素进度条
│ │ 本周挑战                  │   │
│ └───────────────────────────┘   │
│                                 │
│ ← [🐟鲤鱼] [🐟草鱼] [🐟翘嘴] →│ ← 横向滚动卡片
│                                 │
│ ┌──────┐ ┌──────┐              │
│ │识别  │ │成就  │              │ ← 方块快捷入口
│ │历史  │ │墙    │              │    粗边框+荧光绿底
│ ├──────┤ ├──────┤              │
│ │鱼类  │ │去    │              │
│ │百科  │ │钓鱼  │              │
│ └──────┘ └──────┘              │
│                                 │
├─────────────────────────────────┤
│ [🏠] [🐟] [📷] [📖] [👤]     │ ← TabBar 黑底+荧光绿选中
└─────────────────────────────────┘
```

### 识别结果页

```
┌─────────────────────────────────┐
│                                 │
│   [═══ 拍摄照片 ═══]           │ ← 3px黑边图片框
│                                 │
│ ┌───────────────────────────┐   │
│ │                           │   │
│ │  ★宽鳍鱲★               │   │ ← 像素字体鱼名
│ │  [████████░░] 48%         │   │ ← 像素进度条置信度
│ │  ┌─────────┐ ┌─────────┐ │   │
│ │  │科属     │ │栖息地   │ │   │ ← 信息卡（3px边+绿色标题）
│ │  │鲤科鱲属 │ │江河支流 │ │   │
│ │  └─────────┘ └─────────┘ │   │
│ │  ┌─────────────────────┐ │   │
│ │  │ 💡 清洁水体指示鱼类 │ │   │ ← 荧光绿底冷知识
│ │  └─────────────────────┘ │   │
│ └───────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐    │
│ │[██ 收入图鉴 ██][░分享░] │    │ ← 橙色主按钮+幽灵按钮
│ └──────────────────────────┘    │
└─────────────────────────────────┘
```

### 图鉴页

```
┌─────────────────────────────────┐
│  COLLECTION ★ 3/30              │ ← 像素字体标题
│                                 │
│ ┌────┐ ┌────┐ ┌────┐           │
│ │ 鲫 │ │ 鲤 │ │ 草 │ ← 已收集  │ ← 3px黑边+橙色角标
│ │ 鱼 │ │ 鱼 │ │ 鱼 │   彩色    │
│ └────┘ └────┘ └────┘           │
│ ┌────┐ ┌────┐ ┌────┐           │
│ │ ?? │ │ ?? │ │ ?? │ ← 未收集  │ ← 灰色+像素问号
│ │    │ │    │ │    │   锁定    │
│ └────┘ └────┘ └────┘           │
│                                 │
└─────────────────────────────────┘
```

### 成就页

```
┌─────────────────────────────────┐
│  BADGES ★                       │
│                                 │
│ ┌──────────┐ ┌──────────┐      │
│ │  ★★★    │ │  🔒      │      │
│ │  初识    │ │  入门    │      │ ← 解锁: 荧光绿边框
│ │ 2026.5  │ │  5种     │      │ ← 锁定: 灰色+像素锁
│ └──────────┘ └──────────┘      │
│  ▓▓▓▓▓▓▓▓▓▓ ░░░░░░░░░░       │ ← 偏移阴影(解锁有/锁定无)
│                                 │
└─────────────────────────────────┘
```

---

## 九、品牌表达

### 文案风格

| 当前 | Y2K 改造 |
|------|---------|
| 每日一鱼 | ★ TODAY'S CATCH ★ |
| 本周挑战 | WEEKLY QUEST ░░▓▓██ |
| 当季活跃 | HOT THIS SEASON 🔥 |
| 收入图鉴 | ██ COLLECT ██ |
| 识别历史 | SCAN HISTORY |
| 我的成就 | MY BADGES ★ |
| 非常匹配 | PERFECT! |
| 可能是 | MAYBE... |
| 也许是 | HMMMM? |

### 空状态

```
┌─────────────────────────────────┐
│                                 │
│         ░░░░░░░░░░             │
│         ░ 🐟？？ ░             │ ← 像素鱼 + 问号
│         ░░░░░░░░░░             │
│                                 │
│     NO FISH YET...             │ ← 像素字体
│     去拍一条吧！               │
│                                 │
│     [██ GO SCAN ██]            │ ← 荧光绿按钮
│                                 │
└─────────────────────────────────┘
```

---

## 十、设计 Token 总表

```scss
// === 渔光 Y2K Streetwear × Pixel Design System ===

// 品牌色
$brand-orange: #FF590E;
$brand-green: #B4EF4E;
$brand-black: #222222;

// 中性色
$neutral-50: #F6F6F6;
$neutral-100: #EEEEEE;
$neutral-200: #D8D8D8;
$neutral-400: #A9A9A9;
$neutral-900: #222222;

// 功能色
$color-success: #B4EF4E;
$color-error: #FF590E;
$color-warning: #FFD93D;
$color-info: #00CFFF;

// 边框
$border-width: 3px;
$border-color: #222222;
$shadow-offset: 4px;
$shadow: $shadow-offset $shadow-offset 0 $border-color;

// 圆角
$radius: 0;  // 核心：全部直角！

// 间距
$space-xs: 8rpx;
$space-sm: 16rpx;
$space-md: 24rpx;
$space-lg: 32rpx;
$space-xl: 48rpx;

// 字体
$font-body: -apple-system, 'PingFang SC', sans-serif;
$font-pixel: 'Press Start 2P', 'Courier New', monospace;
$font-base: 28rpx;

// 动效
$transition-press: transform 100ms, box-shadow 100ms;
```

---

## 十一、与当前版本对比

| 维度 | 当前 (日系 Flat) | Y2K Streetwear × Pixel |
|------|-----------------|----------------------|
| 底色 | #FAFBFC 浅白 | #F6F6F6 奶灰 |
| 主色 | #EA580C 橙 | #FF590E 辣橙 + #B4EF4E 荧光绿 |
| 边框 | 1px #E2E8F0 淡灰 | 3px #222222 粗黑 |
| 阴影 | 无/极淡 | 4px 4px 0 #222 硬偏移 |
| 圆角 | 4rpx | 0 (全直角) |
| 字体 | 系统默认 | 像素字体标题 + 系统正文 |
| 动效 | opacity 0.7 | 按压位移 + 闪烁 + 像素过渡 |
| 气质 | 安静、日式、留白 | 大胆、街头、像素、复古 |
| 文案 | 中文朴素 | 中英混排 + 符号装饰 |
