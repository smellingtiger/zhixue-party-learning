import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat } from '@/lib/emergency-ollama';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供需要审核的发言稿内容' },
        { status: 400 }
      );
    }

    const auditPrompt = `你是红韵智创的内容审核专家，专注于对党政机关公务员发言稿进行内容审核。

请对以下发言稿进行全面审核，从以下5个维度进行评估：

## 审核维度

1. **政治规范性**（权重30%）
   - 政治立场是否坚定正确
   - 是否与党中央保持高度一致
   - 是否存在政治表述错误
   - 是否使用了规范的政治术语

2. **语言规范性**（权重25%）
   - 用词是否准确恰当
   - 语法是否正确
   - 是否符合党政机关公文语言规范
   - 是否存在错别字、语病

3. **内容合规性**（权重25%）
   - 是否存在敏感词、不当表述
   - 是否泄露国家秘密或工作秘密
   - 是否存在夸大、虚假内容
   - 是否符合事实

4. **结构完整性**（权重10%）
   - 发言稿结构是否完整（开头、主体、结尾）
   - 逻辑是否连贯
   - 层次是否清晰

5. **格式规范性**（权重10%）
   - 标点符号使用是否正确
   - 数字、日期格式是否规范
   - 称谓、敬语使用是否得当

## 输出格式要求

请严格按照以下JSON格式输出审核结果（不要输出其他内容）：

{
  "overall_score": 0-100的整数,
  "status": "pass" | "warning" | "reject",
  "dimensions": {
    "political": { "score": 0-100, "issues": ["问题1", "问题2"] },
    "language": { "score": 0-100, "issues": ["问题1", "问题2"] },
    "compliance": { "score": 0-100, "issues": ["问题1", "问题2"] },
    "structure": { "score": 0-100, "issues": ["问题1", "问题2"] },
    "format": { "score": 0-100, "issues": ["问题1", "问题2"] }
  },
  "summary": "审核总结（50字以内）",
  "suggestions": ["修改建议1", "修改建议2"]
}

## 判定标准

- **pass（通过）**：总分≥85，且各维度均≥70
- **warning（警告）**：总分≥70，或有1-2个维度<70
- **reject（不通过）**：总分<70，或有政治规范性问题

请开始审核以下发言稿：

${content}`;

    const auditResult = await ollamaChat([
      { role: 'system', content: '你是一个专业的党政机关公文内容审核专家。' },
      { role: 'user', content: auditPrompt }
    ]);

    // 解析JSON结果
    let parsedResult;
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = auditResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('未找到JSON格式输出');
      }
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      // 返回默认审核结果
      parsedResult = {
        overall_score: 75,
        status: 'warning',
        dimensions: {
          political: { score: 80, issues: ['无法自动解析审核结果，建议人工审核'] },
          language: { score: 75, issues: [] },
          compliance: { score: 75, issues: [] },
          structure: { score: 75, issues: [] },
          format: { score: 75, issues: [] }
        },
        summary: 'AI审核结果解析失败，建议人工审核',
        suggestions: ['请人工审核发言稿内容']
      };
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('内容审核API Error:', error);
    return NextResponse.json(
      { error: '内容审核时发生错误，请稍后重试' },
      { status: 500 }
    );
  }
}
