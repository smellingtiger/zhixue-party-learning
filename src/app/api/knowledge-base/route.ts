import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8080';

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

    const res = await fetch(`${KNOWLEDGE_SERVICE_URL}/api/files?${params}`);
    const data = await res.json();

    const files = data.files || [];
    const total = data.total ?? 0;
    const start = (page - 1) * pageSize;
    const paged = files.slice(start, start + pageSize);

    const docs = paged.map((f: any) => ({
      id: f.id,
      courseName: f.title,
      category: f.category,
      paragraphCount: f.paragraph_count,
      fileName: f.filename,
    }));

    return NextResponse.json({
      docs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      categories: data.categories || [],
      categoryCounts: data.category_counts || {},
      totalDocuments: total,
    });
  } catch (error) {
    console.error('知识库API错误:', error);
    return NextResponse.json({ error: '获取知识库列表失败' }, { status: 500 });
  }
}
