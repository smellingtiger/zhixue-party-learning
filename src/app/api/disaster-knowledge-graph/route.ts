import { NextRequest, NextResponse } from 'next/server';

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';
const SILICONFLOW_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

interface DisasterGraphNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'subcategory' | 'detail';
  description?: string;
  children?: DisasterGraphNode[];
}

interface GenerateGraphRequest {
  disasterType: string;
}

const DISASTER_CONFIG: Record<string, { root: string; categories: string[] }> = {
  '地震': { root: '地震灾害', categories: ['成因机制', '预警监测', '应急避险', '次生灾害', '防灾减灾'] },
  '洪水': { root: '洪水灾害', categories: ['洪水类型', '形成原因', '预警等级', '应急措施', '灾后重建'] },
  '台风': { root: '台风灾害', categories: ['台风分级', '形成机制', '路径预测', '防御措施', '历史案例'] },
  '火山爆发': { root: '火山灾害', categories: ['火山类型', '喷发类型', '监测预警', '避险方法', '防灾准备'] },
  '泥石流': { root: '泥石流灾害', categories: ['形成条件', '易发区域', '预警识别', '逃生方法', '防治工程'] },
  '海啸': { root: '海啸灾害', categories: ['海啸成因', '传播特性', '预警系统', '避险方法', '应急救援'] },
  '龙卷风': { root: '龙卷风灾害', categories: ['龙卷风分级', '形成条件', '预警信号', '安全避险', '建筑防护'] },
  '森林火灾': { root: '森林火灾', categories: ['火灾类型', '起火原因', '扑救方法', '逃生自救', '防火措施'] },
  '沙尘暴': { root: '沙尘暴灾害', categories: ['形成原因', '影响范围', '健康防护', '治理措施', '预警预报'] },
  '雪崩': { root: '雪崩灾害', categories: ['雪崩类型', '触发因素', '危险区域', '逃生方法', '预防措施'] },
  '干旱': { root: '干旱灾害', categories: ['干旱类型', '成因分析', '监测指标', '应对措施', '节水技术'] },
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateGraphRequest = await request.json();
    const { disasterType } = body;

    if (!disasterType || !DISASTER_CONFIG[disasterType]) {
      return NextResponse.json(
        { error: '无效的灾害类型' },
        { status: 400 }
      );
    }

    const config = DISASTER_CONFIG[disasterType];
    const prompt = generatePrompt(disasterType, config);

    console.log(`[灾害图谱] 生成 ${disasterType} 知识图谱...`);
    const startTime = Date.now();

    const response = await fetch(`${SILICONFLOW_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: SILICONFLOW_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[灾害图谱] API 错误: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `API 调用失败: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    const duration = Date.now() - startTime;
    
    console.log(`[灾害图谱] API 耗时: ${duration}ms, 响应长度: ${content.length}`);

    const graphData = parseJsonResponse(content);

    return NextResponse.json({
      success: true,
      data: graphData,
      disasterType,
    });

  } catch (error) {
    console.error('[灾害图谱] 生成失败:', error);
    return NextResponse.json(
      { error: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

function generatePrompt(disasterType: string, config: { root: string; categories: string[] }): string {
  return `为"${disasterType}"生成JSON知识图谱。

结构要求：
- 根节点："${config.root}"，type=root
- 5个一级分类：${config.categories.join('、')}，type=category
- 每个分类下2个子类，type=subcategory
- 每个子类下1个知识点，type=detail

字段：id(英文短字符串)、label、type、description(15字内)、children(数组)
要求：标准JSON、双引号、直接输出无标记`;
}

function parseJsonResponse(content: string): DisasterGraphNode {
  let jsonStr = content;

  const markdownMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (markdownMatch) {
    jsonStr = markdownMatch[1];
  } else {
    const bracketMatch = content.match(/\{[\s\S]*\}/);
    if (bracketMatch) {
      jsonStr = bracketMatch[0];
    }
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('[灾害图谱] 首次解析失败，尝试修复...');
    const fixed = fixJson(jsonStr);
    return JSON.parse(fixed);
  }
}

function fixJson(jsonStr: string): string {
  let fixed = jsonStr;

  // 修复未闭合的引号
  fixed = fixed.replace(/"([^"]*?)(?=[,\n\r}])/g, '"$1"');
  
  // 移除尾逗号
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
  // 补全括号
  let braceCount = 0;
  for (const char of fixed) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  if (braceCount > 0) fixed += '}'.repeat(braceCount);

  let bracketCount = 0;
  for (const char of fixed) {
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }
  if (bracketCount > 0) fixed += ']'.repeat(bracketCount);

  return fixed.trim();
}

export async function GET() {
  return NextResponse.json({
    availableDisasters: Object.keys(DISASTER_CONFIG),
    llmConfig: {
      provider: '硅基流动 (SiliconFlow)',
      baseUrl: SILICONFLOW_BASE_URL,
      model: SILICONFLOW_MODEL,
    },
  });
}
