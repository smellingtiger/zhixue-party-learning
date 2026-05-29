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
      console.log(`[知识库列表] 已加载 ${Object.keys(nasMappingCache).length} 个NAS视频映射条目`);
    } else {
      nasMappingCache = {};
    }
  } catch (error) {
    console.error('[知识库列表] 加载NAS映射失败:', error);
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const knowledgeBase = searchParams.get('knowledge_base') || '';

    const params = new URLSearchParams();
    if (knowledgeBase) params.set('knowledge_base', knowledgeBase);
    params.set('sort', 'title');

    const [filesRes, infoRes] = await Promise.all([
      fetch(`${KNOWLEDGE_SERVICE_URL}/api/files?${params}`),
      fetch(`${KNOWLEDGE_SERVICE_URL}/api/info?knowledge_base=${knowledgeBase}`),
    ]);

    const data = await filesRes.json();
    const info = await infoRes.json().catch(() => ({}));

    let files = data.files || [];
    
    // 应用筛选条件
    if (categoryFilter && categoryFilter !== 'all') {
      files = files.filter((f: any) => f.category === categoryFilter);
    }
    if (query) {
      const qLower = query.toLowerCase();
      files = files.filter((f: any) => f.title.toLowerCase().includes(qLower));
    }

    const docs = files.map((f: any) => {
      const nasCourseCode = checkNasVideo(f.filename, f.title);
      // 直接使用8080后端返回的has_video字段
      const hasVideo = f.has_video === true;
      const videoId = nasCourseCode || f.id;
      return {
        id: f.id,
        title: f.title,
        courseName: f.title,
        category: f.category,
        paragraphCount: f.paragraph_count,
        fileName: f.filename,
        videoId,
        hasVideo,
      };
    });

    const globalTotal = info.total_files ?? data.total ?? 0;
    const globalParagraphs = info.total_paragraphs || 0;
    const globalCategories = info.categories || data.categories || [];
    const globalCategoryCounts = info.category_counts || data.category_counts || {};
    const globalCategoryParagraphs = info.category_paragraph_counts || {};

    const filteredCount = files.length;
    const start = (page - 1) * pageSize;
    const paged = docs.slice(start, start + pageSize);

    return NextResponse.json({
      docs: paged,
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
