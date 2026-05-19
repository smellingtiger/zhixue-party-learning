import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseTitle, transcript } = await request.json() as {
      courseId: string;
      courseTitle: string;
      transcript: Array<{ start_time_second: number; end_time_second: number; content: string }>;
    };
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 将转写内容按段落组织成列表
    const paragraphs = transcript.map((p, i) => 
      `段落${i + 1}（${p.start_time_second}s-${p.end_time_second}s）：${p.content.substring(0, 200)}`
    ).join('\n');

    const systemPrompt = `你是一个专业的课程大纲设计师。任务是为在线教育课程的每个段落生成简洁、有学习指导意义的小标题。

## 严格遵循以下规则：
1. 每个小标题必须写清楚"这一节能学到什么核心知识"
2. 小标题必须通顺完整，是一条正常的中文短句
3. 长度控制在8-30字之间，简明扼要
4. **绝对禁止**：不允许出现"嗯、呃、那么、我们、这个、那个、可以说"等任何口语化词汇
5. **绝对禁止**：不允许用"习近平说、总书记指出、他强调、习近平指出"等转述词开头
6. 小标题要有实质知识含量，能真正指导学习路径
7. 使用"分析""解读""探讨""阐述""介绍""讲解"等正面动词开头
8. 每个段落只生成一个标题

## 输出格式：
直接输出JSON数组，不要输出其他任何文字：
[{"index": 1, "title": "..."}, {"index": 2, "title": "..."}]`;

    const userMessage = `课程标题：${courseTitle}
课程ID：${courseId}

以下是课程各段落的转写内容，请严格按要求为每个段落生成学习导向小标题：

${paragraphs}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ];

    let fullResponse = '';
    const stream = client.stream(messages, { 
      temperature: 0.3,
      model: 'doubao-seed-2-0-pro-260215'
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content;
      }
    }

    // 解析JSON响应
    const jsonMatch = fullResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI响应格式错误', raw: fullResponse }, { status: 500 });
    }

    const titles = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ titles });
  } catch (error) {
    console.error('生成大纲错误:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
