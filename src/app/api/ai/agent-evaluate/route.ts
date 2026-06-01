import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash';

function stripThinking(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

// 角色专属评估提示词
function buildAgentEvaluationPrompt(data: any): { system: string; user: string } {
  const rolePersonas: Record<string, { persona: string; focus: string; tone: string }> = {
    'mayor': {
      persona: '你是武汉市市长（指挥长），统筹全局，对全市防汛救灾负总责。',
      focus: '全局统筹、人命安全、社会稳定、各部门协调效率',
      tone: '沉稳果断，以"我要求""必须确保"等指令性语言为主',
    },
    'vice-mayor': {
      persona: '你是武汉市副市长（副指挥长），协助市长工作，负责协调各部门落实应急措施。',
      focus: '跨部门协调、资源调配、督促落实、灾情发展趋势研判',
      tone: '务实高效，以"建议""协调""督促"等协商性语言为主',
    },
    'emergency-bureau': {
      persona: '你是武汉市应急管理局局长（应急枢纽），负责预案执行、物资调度、信息汇总。',
      focus: '预案执行到位率、信息传递及时性、物资储备、值班人员在岗率',
      tone: '专业严谨，以"根据预案""数据显示"等专业性语言为主',
    },
    'urban-management': {
      persona: '你是武汉市城管局局长，负责排水设施、城市内涝处置、市政设施维护。',
      focus: '排水设施运行状态、积水点处置效率、设备人员安全、市政设施损坏',
      tone: '吃苦耐劳，以"现场情况""设备状态"等实操性语言为主',
    },
    'traffic-bureau': {
      persona: '你是武汉市交通运输局局长，负责道路通行保障、抢险通道、公交运营安全。',
      focus: '道路通行能力、公交运营安全、抢险通道畅通、群众出行需求',
      tone: '细致周到，以"路况信息""通行能力"等分析性语言为主',
    },
    'police-bureau': {
      persona: '你是武汉市公安局局长，负责治安秩序、交通管控、群众疏散、重点区域管控。',
      focus: '交通秩序维护、社会治安稳定、群众疏散组织、重点区域管控',
      tone: '雷厉风行，以"秩序维护""治安保障"等权威性语言为主',
    },
    'health-bureau': {
      persona: '你是武汉市卫健委主任，负责伤员救治、医疗资源调度、防疫措施。',
      focus: '伤员救治及时性、医疗资源充足性、防疫措施落实、医护人员安全',
      tone: '仁心仁术，以"伤员情况""医疗资源"等关切性语言为主',
    },
    'weather-bureau': {
      persona: '你是武汉市气象局局长，负责气象监测预报、预警信息发布。',
      focus: '预报准确性、监测数据连续性、预警信息发布、极端天气研判',
      tone: '科学客观，以"监测数据""预报趋势"等科学性语言为主',
    },
    'street-office': {
      persona: '你是属地街道办主任，负责基层群众转移安置、社区秩序维护、信息上传下达。',
      focus: '群众转移安置、脆弱群体关怀、社区秩序维护、信息上传下达',
      tone: '贴近群众，以"群众反映""社区情况"等基层性语言为主',
    },
    'housing-bureau': {
      persona: '你是武汉市住建局局长，负责建筑安全评估、危房人员撤离、在建工程安全。',
      focus: '建筑结构安全、在建工程风险、危房人员撤离、工程抢险安全',
      tone: '注重安全，以"建筑安全""工程状态"等评估性语言为主',
    },
    'natural-resources': {
      persona: '你是武汉市自然资源和规划局局长，负责地质灾害监测、次生灾害风险评估。',
      focus: '地质灾害隐患、次生灾害风险、监测预警发布、安置点选址安全',
      tone: '敬畏自然，以"地质风险""次生灾害"等预警性语言为主',
    },
    'telecom': {
      persona: '你是通信部门负责人，负责通信网络保障、应急通信车调度。',
      focus: '通信网络畅通、应急通信保障、基站设备安全、指挥系统运行',
      tone: '技术导向，以"网络状态""通信保障"等技术性语言为主',
    },
    'power-company': {
      persona: '你是供电部门负责人，负责电网安全、关键设施供电保障。',
      focus: '电网安全稳定、关键设施供电、涉水区域断电、抢修人员安全',
      tone: '责任重大，以"供电能力""设备运行"等保障性语言为主',
    },
    'armed-police': {
      persona: '你是武警部队指挥官，负责抢险救援、受困群众转移、社会秩序维护。',
      focus: '受困群众救援、兵力部署合理、抢险任务执行、官兵自身安全',
      tone: '英勇果敢，以"兵力部署""执行任务"等军事性语言为主',
    },
    'water-bureau': {
      persona: '你是武汉市水务局局长，负责水库河道安全、泄洪调度、堤防巡查。',
      focus: '水库河道安全、泄洪调度执行、堤防巡查维护、洪水预警发布',
      tone: '专业精深，以"水位监测""泄洪调度"等专业性语言为主',
    },
  };

  const { persona, focus, tone } = rolePersonas[data.agentRoleId] || {
    persona: '你是应急指挥体系中的一员。',
    focus: '任务完成质量、人员安全保障',
    tone: '客观理性',
  };

  const systemPrompt = `${persona}

你的核心关注点：${focus}
你的说话风格：${tone}

当前场景：
- 阶段：${data.phaseName}
- 响应等级：${data.responseLevel}
- 灾情概况：${data.currentSituation}

你正在应急指挥会议上听取汇报。`;

  const userPrompt = `指挥员${data.playerDepartment}刚刚提交了以下处置方案：

${data.playerPlan}

请你以${data.agentRoleName}（${data.agentRoleDepartment}）的身份，从你的专业角度和职责范围出发，对这个方案进行独立评估。

**评估要求：**
1. **不要重复方案内容**，直接给出你的评价
2. **从你的专业视角出发**，关注与你职责相关的部分
3. **结合当前灾情**，评估方案在你负责领域的可行性和风险
4. **给出具体的建议或补充**（如果需要）
5. **注意角色关系**：如果你是上级，用指令性语气；如果是平级，用协商性语气；如果是下级，用汇报性语气
6. **控制篇幅**：100-200字，简明扼要，像一个真实的应急会议发言

请直接输出你的评估发言，不需要任何格式标记。`;

  return { system: systemPrompt, user: userPrompt };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentRoleId,
      agentRoleName,
      agentRoleDepartment,
      playerDepartment,
      playerPlan,
      phaseName,
      responseLevel,
      currentSituation,
    } = body;

    const { system: systemPrompt, user: userPrompt } = buildAgentEvaluationPrompt({
      agentRoleId,
      agentRoleName,
      agentRoleDepartment,
      playerDepartment,
      playerPlan,
      phaseName,
      responseLevel,
      currentSituation,
    });

    const res = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SILICONFLOW_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: userPrompt },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      console.error('[Agent Evaluate] API Error:', res.status, res.statusText);
      throw new Error('API请求失败 (' + res.status + ')');
    }

    if (!res.body) {
      throw new Error('响应体为空');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    return new Response(new ReadableStream({
      async start(controller) {
        let buffer = '';
        let skipThink = false;
        let thinkBuffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const jsonStr = trimmed.slice(6);
              if (jsonStr === '[DONE]') break;

              try {
                const json = JSON.parse(jsonStr);
                const chunk = json.choices?.[0]?.delta?.content;
                if (!chunk) continue;

                thinkBuffer += chunk;

                if (skipThink) {
                  const endIdx = thinkBuffer.indexOf('</think>');
                  if (endIdx !== -1) {
                    thinkBuffer = thinkBuffer.substring(endIdx + '</think>'.length);
                    skipThink = false;
                  }
                }

                if (!skipThink) {
                  const thinkStartIdx = thinkBuffer.indexOf('<think>');
                  if (thinkStartIdx !== -1) {
                    if (thinkStartIdx > 0) {
                      controller.enqueue(encoder.encode(
                        'data: ' + JSON.stringify({ content: stripThinking(thinkBuffer.substring(0, thinkStartIdx)) }) + '\n\n'
                      ));
                    }
                    thinkBuffer = thinkBuffer.substring(thinkStartIdx + '<think>'.length);
                    skipThink = true;
                  } else if (thinkBuffer) {
                    controller.enqueue(encoder.encode(
                      'data: ' + JSON.stringify({ content: stripThinking(thinkBuffer) }) + '\n\n'
                    ));
                    thinkBuffer = '';
                  }
                }
              } catch {}
            }
          }

          if (!skipThink && thinkBuffer) {
            controller.enqueue(encoder.encode(
              'data: ' + JSON.stringify({ content: stripThinking(thinkBuffer) }) + '\n\n'
            ));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[Agent Evaluate] Stream error:', error);
          controller.error(error);
        }
      },
    }), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Agent Evaluate] Error:', error.message);

    return Response.json({
      error: '评估服务暂时不可用',
      fallback: '请稍后重试。',
    }, { status: 500 });
  }
}
