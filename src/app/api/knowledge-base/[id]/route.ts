import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const KNOWLEDGE_SERVICE_URL = 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const res = await fetch(`${KNOWLEDGE_SERVICE_URL}/api/files/${encodeURIComponent(id)}`);

    if (!res.ok) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    const data = await res.json();

    const segments = (data.segments || []).map((seg: any) => ({
      title: seg.title,
      time: seg.time || '',
      content: seg.content || '',
    }));

    return NextResponse.json({
      id: data.id,
      courseName: data.title,
      category: data.category,
      paragraphCount: data.paragraph_count,
      fileName: data.filename,
      segments,
    });
  } catch (error) {
    console.error('知识库详情API错误:', error);
    return NextResponse.json({ error: '获取文档详情失败' }, { status: 500 });
  }
}
