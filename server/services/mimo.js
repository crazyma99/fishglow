const axios = require('axios');

const PROMPT_TEMPLATE = `你是一个鱼类百科数据提取工具。从以下百科文本中提取结构化信息，只输出JSON，不要其他内容。
输出格式：{"alias":"别名","family":"科属","features":"外形特征50字内","habitat":"栖息环境30字内","distribution":"分布区域30字内","food":"食性20字内","breeding":"繁殖季节","edible":"是/否/未知","fun_fact":"冷知识30字内"}
鱼种名称：{name}
百科文本：{description}`;

async function structurize(name, description) {
  const prompt = PROMPT_TEMPLATE
    .replace('{name}', name)
    .replace('{description}', (description || '').slice(0, 3000));

  try {
    const { data } = await axios.post(
      `${process.env.MIMO_BASE_URL}/chat/completions`,
      {
        model: process.env.MIMO_MODEL,
        thinking: { type: 'disabled' },
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (err) {
    console.error('Mimo structurize error:', err.message);
    return null;
  }
}

module.exports = { structurize };
