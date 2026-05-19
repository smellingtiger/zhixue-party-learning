import { NextRequest, NextResponse } from 'next/server';
import { resolveKnowledgeVideoId } from '@/lib/title-video-mapping';

export const dynamic = 'force-dynamic';

const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://192.168.1.212:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    params.set('sort', 'title');

    const [filesRes, infoRes] = await Promise.all([
      fetch(`${KNOWLEDGE_SERVICE_URL}/api/files?${params}`),
      fetch(`${KNOWLEDGE_SERVICE_URL}/api/info`),
    ]);

    const data = await filesRes.json();
    const info = await infoRes.json().catch(() => ({}));

    const files = data.files || [];
    const filteredCount = data.total ?? 0;
    const start = (page - 1) * pageSize;
    const paged = files.slice(start, start + pageSize);

    const docs = paged.map((f: any) => ({
      id: f.id,
      title: f.title,
      courseName: f.title,
      category: f.category,
      paragraphCount: f.paragraph_count,
      fileName: f.filename,
      videoId: resolveKnowledgeVideoId(f.id, f.filename, f.title),
    }));

    const globalTotal = info.total_files ?? data.total ?? 0;
    const globalParagraphs = info.total_paragraphs || 0;
    const globalCategories = info.categories || data.categories || [];
    const globalCategoryCounts = info.category_counts || data.category_counts || {};
    const globalCategoryParagraphs = info.category_paragraph_counts || {};

    return NextResponse.json({
      docs,
      total: filteredCount,
      globalTotal,
      globalParagraphs,
      globalCategories,
      globalCategoryCounts,
      globalCategoryParagraphs,
      page,
      pageSize,
      totalPages: Math.ceil(filteredCount / pageSize),
    });
  } catch (error) {
    console.error('知识库API错误:', error);
    return NextResponse.json({ error: '获取知识库列表失败' }, { status: 500 });
  }
}
