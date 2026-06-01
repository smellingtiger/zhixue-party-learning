import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const MODEL = 'deepseek-ai/DeepSeek-V4-Flash';

function stripThinking(content: string): string {
  return content.replace(/\u003cthink\u003e[\s\S]*?\u003c\/think\u003e/g, '').trim();
}

const SYSTEM_PROMPT = [
  '你是一名经验丰富的应急指挥官，正在使用"危机模拟推演系统"进行应急方案推演。',
  '',
  '## 你的核心职责',
  '1. 分析用户描述的突发事件或指令',
  '2. 结合地图态势和可用资源，给出专业建议',
  '3. 以简洁、专业的语言输出处置方案',
  '',
  '## 输出规则',
  '- 回复要简练、可操作、直接回答用户问题',
  '- 涉及资源调度时明确说明需要什么类型的资源',
  '- 涉及时间时给出合理预估',
  '- 不要暴露你是AI或大语言模型',
  '- 如果用户问的是通用知识，直接回答',
  '- 如果用户发送了具体事件信息要求生成方案，按以下JSON格式输出：',
  '```json',
  '{',
  '  "plan": "方案概述",',
  '  "analysis": "分析",',
  '  "dispatchedResources": [{"resourceId":"id","resourceName":"名称","reason":"理由","estimatedArrival":"到达时间"}],',
  '  "steps": ["步骤1","步骤2","步骤3"],',
  '  "estimatedDuration": "预计耗时",',
  '  "riskWarning": "风险提示"',
  '}',
  '```',
  '',
  '## 重要约束',
  '- 不要编造不存在的功能或数据',
  '- 如果无法判断，建议用户查看实时数据',
].join('\n');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: '缺少消息内容' }, { status: 400 });
    }

    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.role !== 'user') {
      return Response.json({ error: '最后一条消息必须是用户消息' }, { status: 400 });
    }

    const systemMessages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (context?.event) {
      systemMessages.push({
        role: 'system',
        content: '当前正在处理的事件：' + context.event.typeName + '（' + context.event.severity + '），位置(' + context.event.location.lat + ', ' + context.event.location.lng + '），描述：' + context.event.description,
      });
    }

    if (context?.resources) {
      const resourceList = context.resources.map((r: any) =>
        '- ' + r.name + '（' + r.typeName + '）状态:' + r.statusName + ' 可用:' + r.available + '/' + r.total
      ).join('\n');
      systemMessages.push({
        role: 'system',
        content: '当前可用救援资源：\n' + resourceList,
      });
    }

    const allMessages = [...systemMessages, ...messages];

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
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      console.error('[Sentinel Chat] API Error: ' + res.status + ' ' + res.statusText);
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
                  const endIdx = thinkBuffer.indexOf('\u003c/think\u003e');
                  if (endIdx !== -1) {
                    thinkBuffer = thinkBuffer.substring(endIdx + '\u003c/think\u003e'.length);
                    skipThink = false;
                  }
                }

                if (!skipThink) {
                  const thinkStartIdx = thinkBuffer.indexOf('\u003cthink\u003e');
                  if (thinkStartIdx !== -1) {
                    if (thinkStartIdx > 0) {
                      controller.enqueue(encoder.encode(
                        'data: ' + JSON.stringify({ content: stripThinking(thinkBuffer.substring(0, thinkStartIdx)) }) + '\n\n'
                      ));
                    }
                    thinkBuffer = thinkBuffer.substring(thinkStartIdx + '\u003cthink\u003e'.length);
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
          console.error('[Sentinel Chat] Stream error:', error);
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
    console.error('[Sentinel Chat] Error:', error.message);

    return Response.json({
      error: '对话服务暂时不可用',
      fallback: '请稍后重试。您可以手动选择资源进行派遣操作。',
    }, { status: 500 });
  }
}
