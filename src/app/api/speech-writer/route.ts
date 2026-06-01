import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatStream } from '@/lib/emergency-ollama';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const systemPrompt = `你是红韵智创的公务员发言稿编写智能体，专注于为党政机关公务员提供高质量的发言稿撰写服务。

## 专业能力
1. 精通各类公务员发言稿文体的写作规范，包括：
   - 会议发言稿（工作推进会、专题部署会、总结表彰会等）
   - 汇报发言稿（述职汇报、工作汇报、调研汇报等）
   - 研讨发言稿（民主生活会、组织生活会、理论学习中心组研讨等）
   - 表态发言稿（任职表态、竞聘发言、承诺发言等）
   - 交流发言稿（经验交流、学习交流、培训交流等）
   - 动员讲话稿（工作动员、活动启动、项目开工等）

2. 严格遵循公务员发言稿写作规范：
   - 政治立场坚定正确，与党中央保持高度一致
   - 语言规范严谨，用词精准恰当
   - 结构清晰完整，逻辑严密连贯
   - 内容充实具体，言之有物有据
   - 符合身份角色和场合特点

3. 写作原则：
   - 坚持实事求是，客观真实
   - 突出重点亮点，避免空话套话
   - 语言简洁有力，表述流畅自然
   - 体现政治站位，展现责任担当
   - 因人因时因地制宜，精准匹配场景

4. 输出格式要求：
   - 使用Markdown格式输出
   - 标题使用二级标题（##）
   - 各部分使用三级标题（###）
   - 重点内容使用加粗标记
   - 如有列举使用有序或无序列表

请根据用户提供的发言场景、身份角色、主题要点等信息，生成符合规范的高质量发言稿。`;

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const stream = await ollamaChatStream(fullMessages);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Speech Writer API Error:', error);
    return NextResponse.json(
      { error: '生成发言稿时发生错误，请稍后重试' },
      { status: 500 }
    );
  }
}
