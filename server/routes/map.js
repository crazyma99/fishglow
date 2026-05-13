const router = require('express').Router();
const fs = require('fs');
const path = require('path');

// 省份中文名 → SVG class 名映射
const PROVINCE_CLASS_MAP = {
  '安徽': 'anhui', '澳门': 'aomen', '北京': 'beijing', '重庆': 'chongqing',
  '福建': 'fujian', '甘肃': 'gansu', '广东': 'guangdong', '广西': 'guangxi',
  '贵州': 'guizhou', '海南': 'hainan', '河北': 'hebei', '黑龙江': 'heilongjiang',
  '河南': 'henan', '湖北': 'hubei', '湖南': 'hunan', '江苏': 'jiangsu',
  '江西': 'jiangxi', '吉林': 'jilin', '辽宁': 'liaoning', '内蒙古': 'neimenggu',
  '宁夏': 'ningxia', '青海': 'qinghai', '山东': 'shandong', '上海': 'shanghai',
  '山西': 'shanxi', '陕西': 'shanxiHZ', '四川': 'sichuan', '台湾': 'taiwan',
  '天津': 'tianjin', '香港': 'xianggang', '新疆': 'xinjiang', '西藏': 'xizang',
  '云南': 'yunnan', '浙江': 'zhejiang'
};

// 读取基础 SVG
const baseSvgPath = path.join(__dirname, '../public/china-map-lite.svg');
let baseSvg = '';
try {
  baseSvg = fs.readFileSync(baseSvgPath, 'utf-8');
} catch (e) {
  console.error('Failed to load china-map-lite.svg:', e.message);
}

// GET /api/map?provinces=广东,广西,湖南
// 返回着色后的 SVG
router.get('/', (req, res) => {
  const provincesParam = req.query.provinces || '';
  const provinceNames = provincesParam.split(',').filter(Boolean);

  // 将中文省份名转为 SVG class 名
  const activeClasses = provinceNames
    .map(name => PROVINCE_CLASS_MAP[name.trim()])
    .filter(Boolean);

  if (!baseSvg) {
    return res.status(500).send('Map SVG not available');
  }

  // 生成带高亮样式的 SVG
  let svg = baseSvg;

  // 替换 style 块，添加高亮省份样式
  const activeSelectors = activeClasses.map(cls => `.state.${cls}`).join(',\n');
  const newStyle = `
.state { fill: #E2E8F0; stroke: #FFFFFF; stroke-width: 0.5; transition: fill 0.2s; }
${activeSelectors ? `${activeSelectors} { fill: #EA580C; }` : ''}
`;

  svg = svg.replace(/<style>[\s\S]*?<\/style>/, `<style>${newStyle}</style>`);

  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

module.exports = router;
