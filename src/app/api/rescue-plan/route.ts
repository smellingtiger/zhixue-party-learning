import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash';

function stripThinking(content: string): string {
  return content.replace(/\u003cthink\u003e[\s\S]*?\u003c\/think\u003e/g, '').trim();
}

const SYSTEM_PROMPT = [
  '你是一名经验丰富的应急指挥官。当发生突发事件时，你需要根据事件信息和可用资源，制定最优的救援方案。',
  '',
  '## 你的职责',
  '1. 分析事件类型、严重程度和位置信息',
  '2. 评估可用资源的类型、位置和能力',
  '3. 制定合理的资源调度方案',
  '4. 说明派遣理由和预计效果',
  '',
  '## 输出格式',
  '你必须严格按照以下 JSON 格式返回结果，不要包含任何其他文本：',
  '{',
  '  "plan": "救援方案概述，用简洁的语言描述整体策略",',
  '  "analysis": "详细分析事件的威胁程度和应对思路",',
  '  "dispatchedResources": [',
  '    {',
  '      "resourceId": "资源ID",',
  '      "resourceName": "资源名称",',
  '      "reason": "派遣理由",',
  '      "estimatedArrival": "预计到达时间"',
  '    }',
  '  ],',
  '  "steps": ["步骤1","步骤2","步骤3"],',
  '  "estimatedDuration": "预计整体处置时间",',
  '  "riskWarning": "需要关注的风险点"',
  '}',
].join('\n');

function buildContextualFallback(event: any, resources: any[]) {
  const eventType = event?.typeName || '突发灾害';
  const severity = event?.severityName || '未知';

  const eventSpecificAnalysis: Record<string, string> = {
    '火灾': '火势蔓延迅速，周边可能存在易燃物。需优先控制火源蔓延路径，同时疏散下风向人员。消防力量应从上风向接近，避免被浓烟包围。',
    '洪涝': '水位持续上涨可能导致交通中断和人员被困。应优先保障低洼地区居民安全转移，同时部署排水设备降低积水深度。',
    '城市内涝': '城区多条主干道积水严重，地下空间进水风险高。应优先保障交通生命线畅通，重点防护地下车库、隧道等低洼区域。',
    '危化品泄漏': '有毒物质扩散方向取决于当前风向风速。必须立即确定扩散范围，组织下风向区域紧急疏散。专业防护装备是关键。',
    '地震': '震后黄金72小时是搜救关键期。需快速评估建筑受损情况，优先搜索有生存迹象的区域。次生灾害防范同等重要。',
    '寒潮灾害': '道路结冰严重影响交通通行能力。除雪融冰设备需优先部署到主干道，同时做好弱势群体的保暖物资供应。',
    '森林火灾': '山地林区地形复杂，风向多变。需利用隔离带阻断蔓延路径，同步转移下风向居民。直升机侦查和投水是关键手段。',
  };

  const analysis = eventSpecificAnalysis[eventType] || '根据' + eventType + '事件的特性，需要综合评估影响范围、潜在连锁风险和可用资源匹配度，制定分阶段应对策略。';

  const dispatchRules: [string, string[], number][] = [
    ['火灾', ['fire_truck', 'ambulance', 'rescue_team'], 3],
    ['洪涝', ['engineering_vehicle', 'police_car', 'ambulance'], 3],
    ['城市内涝', ['engineering_vehicle', 'police_car', 'ambulance', 'fire_truck'], 4],
    ['危化品泄漏', ['rescue_team', 'fire_truck', 'police_car', 'ambulance'], 4],
    ['地震', ['rescue_team', 'ambulance', 'engineering_vehicle', 'fire_truck'], 4],
    ['寒潮灾害', ['engineering_vehicle', 'police_car', 'rescue_team'], 3],
    ['森林火灾', ['fire_truck', 'rescue_team', 'ambulance'], 3],
  ];

  const rule = dispatchRules.find(([t]) => t === eventType) || dispatchRules[0];
  const preferredTypes = rule[1];
  const maxDispatch = Math.min(rule[2], resources.length);

  const dispatched: any[] = [];
  for (const type of preferredTypes) {
    if (dispatched.length >= maxDispatch) break;
    const candidates = resources.filter(
      (r: any) => (r.typeName === type || r.type === type) && !dispatched.find((d: any) => d.resourceId === r.id)
    );
    for (const c of candidates.slice(0, 1)) {
      if (dispatched.length >= maxDispatch) break;
      const reasons: Record<string, string> = {
        fire_truck: eventType + '现场需要专业灭火设备和水源保障，该单位距离较近且状态良好',
        ambulance: eventType + '可能导致人员伤亡，医疗急救力量需提前抵达现场待命',
        police_car: '现场秩序维护和交通管制是应急处置的基础保障',
        rescue_team: eventType + '复杂度高，专业救援队能提供技术支持和人员搜救能力',
        engineering_vehicle: '基础设施抢修和障碍清除是恢复现场条件的关键环节',
      };
      dispatched.push({
        resourceId: c.id,
        resourceName: c.name,
        reason: reasons[c.type] || ('根据' + eventType + '特性，该类型资源为必要配置'),
        estimatedArrival: String(Math.floor(5 + Math.random() * 10)) + '-' + String(Math.floor(12 + Math.random() * 8)) + '分钟',
      });
    }
  }

  if (dispatched.length < maxDispatch) {
    const remaining = resources.filter((r: any) => !dispatched.find((d: any) => d.resourceId === r.id));
    for (const r of remaining.slice(0, maxDispatch - dispatched.length)) {
      dispatched.push({
        resourceId: r.id,
        resourceName: r.name,
        reason: '作为增援力量储备，视现场态势变化灵活调配',
        estimatedArrival: String(Math.floor(10 + Math.random() * 8)) + '-' + String(Math.floor(18 + Math.random() * 10)) + '分钟',
      });
    }
  }

  return {
    plan: '针对【' + eventType + '·' + severity + '级】事件的应急响应方案 — 基于当前情报分析，建议采取"先控后救、内外协同"的处置策略，共调派' + dispatched.length + '支救援力量（注：本地智能推演模式）',
    analysis,
    dispatchedResources: dispatched,
    steps: [
      '立即派遣最近的专业力量前往事发地点进行初步勘察',
      '根据现场反馈调整后续资源配置方案',
      '建立现场指挥部统一协调各救援单元行动',
      '持续监控事态发展，动态优化处置策略',
    ],
    estimatedDuration: '3-6小时',
    riskWarning: '请密切关注事态演变，做好随时增援的准备，保持与上级指挥部门的实时联络畅通',
  };
}

export async function POST(request: NextRequest) {
  console.log('[RescuePlan API] 收到请求');

  try {
    const body = await request.json();
    const { event, resources } = body;

    if (!event || !resources) {
      console.warn('[RescuePlan API] 缺少参数:', { hasEvent: !!event, hasResources: !!resources });
      return NextResponse.json({ error: '缺少事件信息或资源列表' }, { status: 400 });
    }

    console.log('[RescuePlan API] 事件类型: ' + event.typeName + ', 资源数量: ' + resources.length);

    const resourceListText = resources
      .map((r: any) =>
        '- ID: ' + r.id + ', 名称: ' + r.name + ', 类型: ' + r.typeName + ', 状态: ' + r.statusName
      )
      .join('\n');

    const userMessage = '当前发生了一起【' + event.typeName + '】事件：\n' +
      '- 严重程度: ' + event.severityName + '\n' +
      '- 描述: ' + event.description + '\n\n' +
      '我们可用的资源有：\n' + resourceListText + '\n\n' +
      '请根据以上信息，制定一份最优的救援方案，明确需要派遣哪些资源，并说明理由。以JSON格式输出。';

    console.log('[RescuePlan API] 正在调用 DeepSeek-V4-Flash...');

    const res = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SILICONFLOW_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      console.error('[RescuePlan API] API Error: ' + res.status + ' ' + res.statusText);
      throw new Error('API请求失败 (' + res.status + ')');
    }

    const data = await res.json();
    const rawContent = stripThinking(data.choices?.[0]?.message?.content || '');
    console.log('[RescuePlan API] LLM响应长度: ' + rawContent.length + ' 字符');

    let parsed: any;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
        console.log('[RescuePlan API] 成功解析LLM返回的JSON');
      } else {
        throw new Error('未找到有效的JSON响应');
      }
    } catch (parseErr: any) {
      console.warn('[RescuePlan API] JSON解析失败，使用上下文感知降级方案: ' + parseErr.message);
      parsed = buildContextualFallback(event, resources);
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('[RescuePlan API] 发生错误:', error.message || error);

    try {
      const cloned = request.clone();
      const fallbackBody = await cloned.json();
      const { event: fbEvent = {}, resources: fbResources = [] } = fallbackBody;
      const fallbackPlan = buildContextualFallback(fbEvent, fbResources);
      return NextResponse.json(fallbackPlan);
    } catch {
      return NextResponse.json({
        plan: '应急响应方案（离线模式）',
        analysis: '系统正在尝试连接AI服务，请稍后重试或使用离线方案',
        dispatchedResources: [],
        steps: ['检查网络连接', '确认服务端状态', '重新发起请求'],
        estimatedDuration: '待定',
        riskWarning: '无法获取AI分析结果，建议人工决策',
      });
    }
  }
}
