import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash';

function stripThinking(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function buildSystemPrompt(data: any): string {
  return `你是应急AI参谋长，正在辅助${data.playerDepartment}进行应急指挥推演。

你的职责：
1. 根据当前灾情和响应等级，生成专业、可操作的应急处置方案
2. 方案必须符合应急预案的SOP要求
3. 考虑玩家角色的权限范围，提供针对性的建议
4. 方案结构清晰，包含：总体要求、具体措施、时间节点、资源调配

当前信息：
- 阶段：${data.phaseName}（${data.responseLevel}）
- 玩家角色：${data.playerDepartment}（${data.playerRoleLevel}层）
- 灾情描述：${data.currentSituation}

请直接输出方案内容，使用Markdown格式，结构清晰。`;
}

function buildUserMessage(data: any): string {
  if (data.userEditedPlan) {
    return `以下是我已经拟定的方案，请帮我优化和完善：

${data.userEditedPlan}

请指出方案的不足之处，并提供改进建议。`;
  }

  const roleDirections: Record<string, string> = {
    decision: `作为决策指挥层，请从全局统筹的角度生成方案，包括：
1. 响应等级判定与启动
2. 指挥体系构建
3. 各部门任务分配
4. 资源统筹调配
5. 舆情管控与信息发布
6. 时间节点与阶段性目标`,
    core: `作为核心执行层，请从部门协调的角度生成方案，包括：
1. 本部门职责落实
2. 协同部门配合
3. 资源调度计划
4. 信息上报机制
5. 应急处置流程`,
    collab: `作为协同配合层，请从执行落实的角度生成方案，包括：
1. 本部门具体行动
2. 配合其他部门的方式
3. 人员部署计划
4. 物资准备情况
5. 执行时间节点`,
  };

  return `当前阶段是【${data.phaseName}】，响应等级为【${data.responseLevel}】。

灾情：${data.currentSituation}

${roleDirections[data.playerRoleLevel] || roleDirections.collab}

请确保方案专业、具体、可操作。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentPhaseIndex,
      playerRoleId,
      playerRoleLevel,
      playerDepartment,
      currentSituation,
      previousDecisions,
      userEditedPlan,
      phaseName,
      responseLevel,
    } = body;

    const systemPrompt = buildSystemPrompt({
      playerDepartment,
      phaseName,
      responseLevel,
      playerRoleLevel,
      currentSituation,
    });

    const userMessage = buildUserMessage({
      phaseName,
      responseLevel,
      playerRoleLevel,
      currentSituation,
      userEditedPlan,
    });

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(previousDecisions || []).map((d: string, i: number) => ({
        role: 'system' as const,
        content: `之前决策 ${i + 1}: ${d}`,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const res = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SILICONFLOW_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      console.error('[AI Plan Generator] API Error:', res.status, res.statusText);
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
          console.error('[AI Plan Generator] Stream error:', error);
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
    console.error('[AI Plan Generator] Error:', error.message);

    return Response.json({
      error: '方案生成服务暂时不可用',
      fallback: '请稍后重试。',
    }, { status: 500 });
  }
}
