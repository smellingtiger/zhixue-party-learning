import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeDocDetail } from '@/lib/knowledge-base';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const doc = getKnowledgeDocDetail(decodedId);

    if (!doc) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('知识库详情API错误:', error);
    return NextResponse.json(
      { error: '获取文档详情失败' },
      { status: 500 }
    );
  }
}