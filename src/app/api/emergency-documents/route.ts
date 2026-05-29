import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, getAllLocalMdDocuments } from '@/lib/emergency-document-data';
import { getMockDocumentById } from '@/lib/emergency-mock-data';
import type { EmergencyDocument } from '@/app/safety/emergency-library/types';

function truncateDocuments(docs: EmergencyDocument[], maxContentLength: number = 600): EmergencyDocument[] {
  return docs.map(doc => ({
    ...doc,
    content: doc.content.length > maxContentLength
      ? doc.content.substring(0, maxContentLength) + '...'
      : doc.content,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const disasterType = searchParams.get('disasterType');
    const search = searchParams.get('search');

    if (action === 'detail' && id) {
      let doc: EmergencyDocument | null = null;

      if (id.startsWith('mock-')) {
        doc = getMockDocumentById(id) || null;
      } else if (id.startsWith('local-md-')) {
        const localDocs = getAllLocalMdDocuments();
        doc = localDocs.find(d => d.id === id) || null;
      }

      if (!doc) {
        return NextResponse.json({ error: '文档未找到' }, { status: 404 });
      }

      return NextResponse.json({ document: doc });
    }

    if (action === 'search' && search) {
      const docs = await getAllDocuments({ search });
      return NextResponse.json({
        documents: truncateDocuments(docs),
        total: docs.length,
      });
    }

    const allDocs = await getAllDocuments();

    const categoryCounts: Record<string, number> = {};
    for (const doc of allDocs) {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
    }

    const filteredDocs = await getAllDocuments({
      category: category as EmergencyDocument['category'] | undefined,
      disasterType: disasterType as EmergencyDocument['disasterType'] | undefined,
    });

    return NextResponse.json({
      documents: truncateDocuments(filteredDocs),
      total: filteredDocs.length,
      categories: Object.entries(categoryCounts).map(([cat, count]) => ({
        category: cat,
        count,
      })),
    });
  } catch (error) {
    console.error('应急资料库API错误:', error);
    return NextResponse.json(
      { error: '获取文档列表失败' },
      { status: 500 }
    );
  }
}