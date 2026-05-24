const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const SILICONFLOW_API_KEY = 'sk-benvwygtccjxvhrnbjqbztiopkroriorvfllywtkzidbwlwb';
const SILICONFLOW_MODEL = 'deepseek-ai/DeepSeek-V3';

export function stripThinking(content: string): string {
  const result = content.replace(/\u003cthink\u003e[\s\S]*?\u003c\/think\u003e/g, '').trim();
  return result;
}

export async function ollamaChat(messages: Array<{ role: string; content: string }>): Promise<string> {
  const res = await fetch(SILICONFLOW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      messages,
      stream: false
    })
  });

  if (!res.ok) {
    throw new Error(`SiliconFlow API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return stripThinking(data.choices?.[0]?.message?.content || '');
}

export async function ollamaChatStream(messages: Array<{ role: string; content: string }>): Promise<ReadableStream<Uint8Array>> {
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

  if (!res.ok) {
    throw new Error(`SiliconFlow API error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      let skipMode = false;
      let contentBuffer = '';
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

              contentBuffer += chunk;

              if (skipMode) {
                const endIdx = contentBuffer.indexOf('\u003c/think\u003e');
                if (endIdx !== -1) {
                  contentBuffer = contentBuffer.substring(endIdx + '\u003c/think\u003e'.length);
                  skipMode = false;
                }
              }

              if (!skipMode) {
                const startIdx = contentBuffer.indexOf('\u003cthink\u003e');
                if (startIdx !== -1) {
                  if (startIdx > 0) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: contentBuffer.substring(0, startIdx) })}\n\n`));
                  }
                  contentBuffer = contentBuffer.substring(startIdx + '\u003cthink\u003e'.length);
                  skipMode = true;
                } else if (contentBuffer) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: contentBuffer })}\n\n`));
                  contentBuffer = '';
                }
              }
            } catch {}
          }
        }
        if (!skipMode && contentBuffer) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: contentBuffer })}\n\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}
