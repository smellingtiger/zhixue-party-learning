const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const SILICONFLOW_MODEL = 'deepseek-ai/DeepSeek-V4-Flash';

function log(phase: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString().substring(11, 23);
  const prefix = `[AI-LLM ${ts}][${phase}]`;
  if (data !== undefined) {
    console.log(prefix, msg, typeof data === 'object' ? JSON.stringify(data).substring(0, 300) : data);
  } else {
    console.log(prefix, msg);
  }
}

export function stripThinking(content: string): string {
  const t0 = Date.now();
  const result = content.replace(/\u003cthink\u003e[\s\S]*?\u003c\/think\u003e/g, '').trim();
  log('stripThinking', `耗时${Date.now() - t0}ms, 原长度=${content.length}, 结果长度=${result.length}`);
  return result;
}

export async function ollamaChat(messages: Array<{ role: string; content: string }>): Promise<string> {
  const t0 = Date.now();
  const msgPreview = messages.map(m => `${m.role}:${m.content.substring(0, 50)}...`).join(' | ');
  log('ollamaChat', `开始, 消息数=${messages.length}`, msgPreview);

  const body = JSON.stringify({
    model: SILICONFLOW_MODEL,
    messages,
    stream: false
  });
  log('ollamaChat', `请求体大小=${body.length}字节`);

  const res = await fetch(SILICONFLOW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
    },
    body
  });

  const elapsed = Date.now() - t0;
  log('ollamaChat', `API响应 status=${res.status}, 耗时=${elapsed}ms`);

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    log('ollamaChat', `API错误 body=${errText.substring(0, 200)}`);
    throw new Error(`SiliconFlow API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  log('ollamaChat', `原始响应长度=${rawContent.length}, tokens=${data.usage?.total_tokens || 'N/A'}`);

  const result = stripThinking(rawContent);
  log('ollamaChat', `完成, 总耗时=${Date.now() - t0}ms, 最终长度=${result.length}`);
  return result;
}

export async function ollamaChatStream(messages: Array<{ role: string; content: string }>): Promise<ReadableStream<Uint8Array>> {
  const t0 = Date.now();
  const msgPreview = messages.map(m => `${m.role}:${m.content.substring(0, 50)}...`).join(' | ');
  log('ollamaChatStream', `开始建立流式连接, 消息数=${messages.length}`, msgPreview);

  const res = await fetch(SILICONFLOW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      messages,
      stream: true
    })
  });

  log('ollamaChatStream', `连接建立 status=${res.status}, 耗时=${Date.now() - t0}ms`);

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    log('ollamaChatStream', `连接失败 body=${errText.substring(0, 200)}`);
    throw new Error(`SiliconFlow API error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let totalChunks = 0;
  let thinkingChunks = 0;
  let outputChunks = 0;
  let totalContentLen = 0;

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      let skipMode = false;
      let contentBuffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            log('ollamaChatStream', `流结束, 总块数=${totalChunks}, 思考块=${thinkingChunks}, 输出块=${outputChunks}, 内容总长=${totalContentLen}, 总耗时=${Date.now() - t0}ms`);
            break;
          }

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

              totalChunks++;
              contentBuffer += chunk;

              if (skipMode) {
                thinkingChunks++;
                const endIdx = contentBuffer.indexOf('\u003c/think\u003e');
                if (endIdx !== -1) {
                  contentBuffer = contentBuffer.substring(endIdx + '\u003c/think\u003e'.length);
                  skipMode = false;
                  log('ollamaChatStream', `思考标签结束, 已跳过${thinkingChunks}个思考块`);
                }
              }

              if (!skipMode) {
                const startIdx = contentBuffer.indexOf('\u003cthink\u003e');
                if (startIdx !== -1) {
                  if (startIdx > 0) {
                    const emit = contentBuffer.substring(0, startIdx);
                    totalContentLen += emit.length;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: emit })}\n\n`));
                  }
                  contentBuffer = contentBuffer.substring(startIdx + '\u003cthink\u003e'.length);
                  skipMode = true;
                  log('ollamaChatStream', '检测到思考标签, 开始跳过模式');
                } else if (contentBuffer) {
                  totalContentLen += contentBuffer.length;
                  outputChunks++;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: contentBuffer })}\n\n`));
                  contentBuffer = '';
                }
              }
            } catch (e) {
              log('ollamaChatStream', `JSON解析失败: ${(e as Error).message}`);
            }
          }
        }
        if (!skipMode && contentBuffer) {
          totalContentLen += contentBuffer.length;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: contentBuffer })}\n\n`));
        }
        log('ollamaChatStream', `流关闭, 总输出=${totalContentLen}字符, 总耗时=${Date.now() - t0}ms`);
        controller.close();
      } catch (error) {
        log('ollamaChatStream', `流错误: ${(error as Error).message}`);
        controller.error(error);
      }
    }
  });
}
