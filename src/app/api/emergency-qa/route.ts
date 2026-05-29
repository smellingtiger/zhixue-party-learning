import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatStream } from '@/lib/emergency-ollama';
import { searchMockDocuments } from '@/lib/emergency-mock-data';
import { getAllDocuments } from '@/lib/emergency-document-data';

function log(phase: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString().substring(11, 23);
  const prefix = `[AI-QA ${ts}][${phase}]`;
  if (data !== undefined) {
    console.log(prefix, msg, typeof data === 'object' ? JSON.stringify(data).substring(0, 800) : data);
  } else {
    console.log(prefix, msg);
  }
}

interface RetrievedDoc {
  id: string;
  title: string;
  category: string;
  snippet: string;
  relevance: number;
}

function buildRetrievalPrompt(question: string, disasterType: string, docs: RetrievedDoc[]): string {
  const contextBlocks = docs.map((d, i) =>
    `【文档${i + 1}】《${d.title}》(分类:${d.category}, 相关度:${(d.relevance * 100).toFixed(0)}%)\n${d.snippet.substring(0, 800)}`
  ).join('\n\n---\n\n');

  return `你是一位专业的应急管理知识库问答助手。请根据以下检索到的应急文档资料，回答用户的问题。

## 回答规范
1. **引用来源**：引用文档中的具体内容时，请注明出自哪篇文档
2. **结构化输出**：使用标题、列表、分点说明
3. **标注风险等级**：适当时使用 🔴（高危）/ 🟡（中危）/ 🟢（低危）
4. **补充建议**：如果文档内容不够完善，请基于你的专业知识补充建议，但要明确标注哪些是补充内容
5. **精度优先**：如果不知道或不确切的答案，请诚实说明，不要编造

## 当前灾害类型
${disasterType}

## 检索到的相关文档（共${docs.length}篇）
${contextBlocks}

## 用户问题
${question}

请基于以上文档内容回答问题，并在末尾列出引用的文档来源清单。`;
}

function extractSnippet(content: string, query: string, maxLen: number = 600): string {
  const lowerContent = content.toLowerCase();
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1);

  let bestPos = 0;
  let bestScore = 0;

  for (const kw of keywords) {
    const pos = lowerContent.indexOf(kw);
    if (pos !== -1) {
      const start = Math.max(0, pos - 50);
      const score = keywords.reduce((s, k) => s + (lowerContent.substring(start, start + 200).includes(k) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        bestPos = start;
      }
    }
  }

  const snippetStart = Math.max(0, bestPos);
  const raw = content.substring(snippetStart, snippetStart + maxLen);
  return (snippetStart > 0 ? '...' : '') + raw.trim() + (snippetStart + maxLen < content.length ? '...' : '');
}

function calculateRelevance(doc: { title: string; content: string; tags: string[] }, query: string): number {
  const lowerQ = query.toLowerCase();
  const lowerTitle = doc.title.toLowerCase();
  const lowerContent = doc.content.toLowerCase();
  let score = 0;

  const keywords = lowerQ.split(/\s+/).filter(k => k.length > 1);
  if (keywords.length === 0) return 0;

  for (const kw of keywords) {
    if (lowerTitle.includes(kw)) score += 3;
    const contentMatches = (lowerContent.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    score += Math.min(contentMatches, 10);
    if (doc.tags.some(t => t.toLowerCase().includes(kw))) score += 1;
  }

  return Math.min(score / (keywords.length * 5), 1);
}

async function retrieveDocuments(question: string, disasterType: string): Promise<RetrievedDoc[]> {
  const t0 = Date.now();
  log('retrieve', `开始检索, question="${question.substring(0, 80)}", disasterType=${disasterType}`);

  let allDocs: Array<{ id: string; title: string; category: string; content: string; tags: string[] }> = [];

  try {
    const liveDocs = await getAllDocuments({ disasterType: disasterType as any });
    allDocs.push(...liveDocs.filter(d => d.content));
    log('retrieve', `实时数据源: ${liveDocs.length}篇(含内容: ${allDocs.length}篇)`);
  } catch (e) {
    log('retrieve', `实时数据源获取失败: ${(e as Error).message}, 降级到模拟数据`);
  }

  const mockMatches = searchMockDocuments(question);
  const mockFiltered = disasterType && disasterType !== 'all'
    ? mockMatches.filter(d => d.disasterType === disasterType)
    : mockMatches;
  for (const md of mockFiltered) {
    if (!allDocs.some(d => d.title === md.title)) {
      allDocs.push(md);
    }
  }
  log('retrieve', `模拟数据补充: ${mockFiltered.length}篇, 合并后总文档=${allDocs.length}篇`);

  const scored = allDocs.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    snippet: extractSnippet(doc.content, question),
    relevance: calculateRelevance(doc, question),
  }));

  scored.sort((a, b) => b.relevance - a.relevance);
  const top = scored.filter(s => s.relevance > 0.03).slice(0, 5);

  log('retrieve', `检索完成, 耗时=${Date.now() - t0}ms, Top${top.length}篇, 最高相关度=${(top[0]?.relevance || 0).toFixed(2)}`);
  if (top.length > 0) {
    log('retrieve', `Top文档: ${top.map(d => `《${d.title}》(${d.relevance.toFixed(2)})`).join(' | ')}`);
  }

  return top;
}

export async function POST(request: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await request.json();
    const { messages, disasterType = 'flood', includeRag = true } = body;

    log('POST', `收到请求, disasterType=${disasterType}, rag=${includeRag}, 消息数=${messages?.length}`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      log('POST', '校验失败: 消息为空');
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    const question = messages[messages.length - 1]?.content || messages[0]?.content || '';
    log('POST', `问题: "${question.substring(0, 150)}"`);

    let retrievalPrompt = '';
    let sources: { title: string; id: string; snippet: string }[] = [];

    if (includeRag) {
      const retrievedDocs = await retrieveDocuments(question, disasterType);
      sources = retrievedDocs.map(d => ({
        title: d.title,
        id: d.id,
        snippet: d.snippet.substring(0, 200),
      }));
      retrievalPrompt = buildRetrievalPrompt(question, disasterType, retrievedDocs);
      log('POST', `RAG提示词长度=${retrievalPrompt.length}, 引用来源=${sources.length}篇`);
    } else {
      retrievalPrompt = buildRetrievalPrompt(question, disasterType, []);
      log('POST', '跳过RAG检索, 使用无上下文的纯LLM回答');
    }

    const systemMessage = {
      role: 'system' as const,
      content: retrievalPrompt,
    };

    const historyMessages = messages.slice(0, -1);
    const allMessages = [systemMessage, ...historyMessages, { role: 'user' as const, content: question }];

    log('POST', `总消息数=${allMessages.length}, 调用LLM流式生成`);

    const streamStart = Date.now();
    log('POST', `准备耗时=${streamStart - t0}ms`);
    const stream = await ollamaChatStream(allMessages);

    log('POST', `流创建完成, 耗时=${Date.now() - streamStart}ms, 总耗时=${Date.now() - t0}ms`);

    const sourcesHeader = encodeURIComponent(JSON.stringify(sources));

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RAG-Sources': sourcesHeader,
        'X-Doc-Count': String(sources.length),
      },
    });

  } catch (error) {
    log('POST', `异常: ${(error as Error).message}, 总耗时=${Date.now() - t0}ms`);
    console.error('Emergency QA API error:', error);
    return NextResponse.json(
      { error: '问答服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}