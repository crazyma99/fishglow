const axios = require('axios');

/**
 * 调用 Mimo 大模型（开启 thinking + 联网搜索）为新鱼种生成完整数据
 * 返回结构化鱼种信息供用户编辑提交
 */
async function generateFishData(fishName) {
  const prompt = `你是一个淡水鱼类百科专家。请为"${fishName}"生成完整的钓鱼百科数据。

请搜索网络获取准确信息，然后输出以下JSON格式，不要输出其他内容：
{
  "name_latin": "拉丁学名",
  "monthly_activity": [1月到12月的活跃度评分,每月1-10分],
  "fishing_methods": ["适合的钓法数组"],
  "recommended_bait": {
    "spring": ["春季推荐饵料"],
    "summer": ["夏季推荐饵料"],
    "autumn": ["秋季推荐饵料"],
    "winter": ["冬季推荐饵料"]
  },
  "best_time": {
    "spring": "春季最佳钓鱼时间",
    "summer": "夏季最佳钓鱼时间",
    "autumn": "秋季最佳钓鱼时间",
    "winter": "冬季最佳钓鱼时间"
  },
  "water_temp_min": 最适水温下限数字,
  "water_temp_max": 最适水温上限数字,
  "habitat": "栖息环境描述30字内",
  "difficulty": "easy或medium或hard",
  "tip": "钓鱼技巧建议50字内",
  "distribution_provinces": ["分布省份数组，如广东,湖南等"]
}

注意：
- monthly_activity 必须是12个整数的数组
- 根据鱼的实际习性填写，冬季不活跃的鱼活跃度应为1-3
- distribution_provinces 只填中国大陆省份名称
- difficulty: easy=新手可钓, medium=需要技巧, hard=较难钓获`;

  try {
    const { data } = await axios.post(
      `${process.env.MIMO_BASE_URL}/chat/completions`,
      {
        model: process.env.MIMO_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        // 开启 thinking 让模型充分推理（贡献场景不受时间限制）
        // 注意：这里不禁用 thinking，允许模型深度思考
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 贡献场景允许更长超时
      }
    );

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 校验关键字段
      if (!Array.isArray(parsed.monthly_activity) || parsed.monthly_activity.length !== 12) {
        parsed.monthly_activity = [5,5,5,5,5,5,5,5,5,5,5,5];
      }
      if (!Array.isArray(parsed.fishing_methods)) {
        parsed.fishing_methods = [];
      }
      if (!Array.isArray(parsed.distribution_provinces)) {
        parsed.distribution_provinces = [];
      }
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Generate fish data error:', err.message);
    return null;
  }
}

module.exports = { generateFishData };
