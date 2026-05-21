import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://192.168.1.212:8080';

const NAS_MAPPING_FILE = path.join(process.cwd(), 'knowledge-server', 'course_nas_mapping.json');
let nasMappingCache: Record<string, any> | null = null;

function loadNasMapping(): Record<string, any> {
  if (nasMappingCache) return nasMappingCache;
  try {
    if (fs.existsSync(NAS_MAPPING_FILE)) {
      const data = JSON.parse(fs.readFileSync(NAS_MAPPING_FILE, 'utf-8'));
      nasMappingCache = {};
      for (const item of data.matched || []) {
        nasMappingCache[item.course_code] = item;
        if (item.txt_file) {
          nasMappingCache[item.txt_file.replace(/\.txt$/, '')] = item;
        }
        if (item.chinese_name) {
          nasMappingCache[item.chinese_name] = item;
        }
      }
    } else {
      nasMappingCache = {};
    }
  } catch (error) {
    console.error('[知识库详情] 加载NAS映射失败:', error);
    nasMappingCache = {};
  }
  return nasMappingCache;
}

function checkNasVideo(filename: string, title: string): string | null {
  const mapping = loadNasMapping();
  const codeFromFile = filename?.replace(/\.txt$/, '') || '';
  if (codeFromFile && mapping[codeFromFile]) {
    return codeFromFile;
  }
  if (title && mapping[title]) {
    const item = mapping[title];
    return item.course_code || null;
  }
  return null;
}

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

    const segments = (data.segments || []).map((seg: any, idx: number) => ({
      title: seg.title || '',
      time: seg.time || '',
      content: seg.content || '',
      needsTitleGeneration: !seg.title || seg.title.trim() === '' || seg.title === '未命名段落' || seg.title === '未命名',
    }));

    const nasCourseCode = checkNasVideo(data.filename, data.title);

    return NextResponse.json({
      id: data.id,
      courseName: data.title,
      category: data.category,
      paragraphCount: data.paragraph_count,
      fileName: data.filename,
      videoId: nasCourseCode,
      hasVideo: !!nasCourseCode,
      segments,
    });
  } catch (error) {
    console.error('知识库详情API错误:', error);
    return NextResponse.json({ error: '获取文档详情失败' }, { status: 500 });
  }
}
