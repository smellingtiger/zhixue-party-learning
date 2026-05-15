import { NextRequest, NextResponse } from 'next/server';
import { getAllKnowledgeDocs, searchKnowledgeDocs } from '@/lib/knowledge-base';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    let docs = query ? searchKnowledgeDocs(query) : getAllKnowledgeDocs();

    const allCategories = [...new Set(docs.map(d => d.category))];
    
    // 计算每个分类的总数量（在过滤之前）
    const categoryCounts: Record<string, number> = {};
    for (const doc of docs) {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
    }

    if (category) {
      docs = docs.filter(d => d.category === category);
    }

    const total = docs.length;
    const start = (page - 1) * pageSize;
    const paged = docs.slice(start, start + pageSize);

    return NextResponse.json({
      docs: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      categories: allCategories,
      categoryCounts,
      totalDocuments: docs.length,
    });
  } catch (error) {
    console.error('知识库API错误:', error);
    return NextResponse.json(
      { error: '获取知识库列表失败' },
      { status: 500 }
    );
  }
}