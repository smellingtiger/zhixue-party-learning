import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatStream } from '@/lib/emergency-ollama';

function log(phase: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString().substring(11, 23);
  const prefix = `[AI-SOLUTION ${ts}][${phase}]`;
  if (data !== undefined) {
    console.log(prefix, msg, typeof data === 'object' ? JSON.stringify(data).substring(0, 500) : data);
  } else {
    console.log(prefix, msg);
  }
}

const SYSTEM_PROMPT = `你是一位专业的应急管理方案顾问，具备以下核心能力：

## 角色定位
- 应急指挥方案专家，专注于自然灾害和突发事件的应对策略
- 能够识别用户问题中的潜在风险点和容易被忽视的细节
- 基于真实案例提供可操作的指导建议

## 核心职责
1. **精准诊断**：快速理解用户场景，识别关键风险点
2. **方案定制**：针对具体场景提供分步骤的解决方案
3. **盲区提醒**：主动指出用户可能忽视的重要环节
4. **案例支撑**：引用类似案例增强方案可信度

## 输出规范
- 结构化输出（使用标题、列表、重点标注）
- 标注风险等级（🔴高危 / 🟡中危 / 🟢低危）
- 提供具体操作步骤而非泛泛而谈
- 主动追问关键信息以完善方案

## 反馈机制
- 当用户表现出积极反馈时，深化方案细节
- 当用户提出质疑时，补充证据和替代方案
- 当用户描述模糊时，主动澄清关键参数

## 案例库意识
- 内置常见灾害应对典型案例
- 能根据用户场景匹配相似案例
- 总结案例教训并应用到当前方案`;

const CASE_LIBRARY: Record<string, string[]> = {
  flood: [
    '2021年郑州7·20特大暴雨：城市内涝应急响应经验',
    '2012年北京7·21暴雨灾害：排水系统优化启示',
    '2023年京津冀洪涝：跨区域协调机制案例'
  ],
  typhoon: [
    '2024年台风"格美"防御：提前转移与安置经验',
    '2019年台风"利奇马"：建筑加固与物资储备案例',
    '2021年台风"烟花"：次生灾害防范要点'
  ],
  earthquake: [
    '2008年汶川地震：黄金72小时救援组织',
    '2013年雅安地震：快速评估与资源调配',
    '2022年泸定地震：现代通信技术在救援中的应用'
  ],
  'forest-fire': [
    '2020年澳大利亚山火：大规模疏散与生态恢复',
    '2019年四川凉山火灾：专业队伍协同作战',
    '2022年重庆山火：志愿者与专业力量配合'
  ],
  'cold-wave': [
    '2008年南方冰灾：电力保障与交通疏导',
    '2021年寒潮袭击：农业防冻与社会保供',
    '2023年极寒天气：脆弱群体保护机制'
  ]
};

function getRelevantCases(disasterType: string): string {
  const cases = CASE_LIBRARY[disasterType] || CASE_LIBRARY.flood;
  return `\n\n## 参考案例\n${cases.map(c => `- ${c}`).join('\n')}`;
}

function analyzeUserIntent(message: string): { intent: string; confidence: number } {
  const positivePatterns = ['好的', '明白', '了解', '谢谢', '可以', '行', '收到'];
  const questionPatterns = ['为什么', '怎么', '如何', '什么情况', '如果', '万一', '是否'];
  
  let intent = 'neutral';
  let confidence = 0.5;

  if (positivePatterns.some(p => message.includes(p))) {
    intent = 'positive_feedback';
    confidence = 0.8;
  }
  
  if (questionPatterns.some(p => message.includes(p))) {
    intent = 'clarification_request';
    confidence = 0.85;
  }

  if (message.length > 20 && !questionPatterns.some(p => message.includes(p))) {
    intent = 'detailed_scenario';
    confidence = 0.75;
  }

  log('analyzeIntent', `意图=${intent}, 置信度=${confidence}, 消息="${message.substring(0, 80)}"`);
  return { intent, confidence };
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await request.json();
    const { messages, disasterType = 'flood' } = body;

    log('POST', `收到请求, disasterType=${disasterType}, 消息数=${messages?.length || 0}`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      log('POST', '请求校验失败: 消息为空');
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    log('POST', `最后一条消息: "${lastMessage.substring(0, 100)}"`);

    const userIntent = analyzeUserIntent(lastMessage);
    
    const caseContext = getRelevantCases(disasterType);
    log('POST', `案例上下文长度=${caseContext.length}, 灾害类型=${disasterType}`);

    const systemContent = `${SYSTEM_PROMPT}${caseContext}\n\n## 当前分析意图\n用户当前意图：${userIntent.intent}（置信度：${(userIntent.confidence * 100).toFixed(0)}%）\n请根据此意图调整回复策略。`;
    log('POST', `System Prompt总长度=${systemContent.length}`);

    const systemMessage = {
      role: 'system',
      content: systemContent
    };

    const allMessages = [systemMessage, ...messages];
    log('POST', `总消息数=${allMessages.length}, 开始调用LLM流式生成`);

    const streamStart = Date.now();
    log('POST', `请求准备耗时=${streamStart - t0}ms`);
    const stream = await ollamaChatStream(allMessages);

    log('POST', `流创建完成, 创建耗时=${Date.now() - streamStart}ms, 总耗时=${Date.now() - t0}ms`);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-User-Intent': userIntent.intent,
        'X-Intent-Confidence': userIntent.confidence.toString()
      }
    });

  } catch (error) {
    log('POST', `异常: ${(error as Error).message}, 总耗时=${Date.now() - t0}ms`);
    console.error('Emergency solution API error:', error);
    return NextResponse.json(
      { error: '生成方案失败，请稍后重试' },
      { status: 500 }
    );
  }
}
