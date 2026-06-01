import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const NAS_MAPPING_FILE = path.join(
  process.cwd(),
  'knowledge-server',
  'course_nas_mapping.json'
);

let nasMappingCache: Record<string, any> | null = null;

function loadNasMapping(): Record<string, any> {
  if (nasMappingCache) return nasMappingCache;
  
  try {
    if (fs.existsSync(NAS_MAPPING_FILE)) {
      const data = JSON.parse(fs.readFileSync(NAS_MAPPING_FILE, 'utf-8'));
      nasMappingCache = {};
      for (const item of data.matched || []) {
        nasMappingCache[item.course_code] = item;
      }
      console.log(`已加载 ${Object.keys(nasMappingCache).length} 个课程的NAS视频映射`);
    } else {
      nasMappingCache = {};
    }
  } catch (error) {
    console.error('加载NAS映射文件失败:', error);
    nasMappingCache = {};
  }
  
  return nasMappingCache;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 从8080服务获取课程详情以获取course_code
    const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8080';
    const res = await fetch(`${KNOWLEDGE_SERVICE_URL}/api/files/${encodeURIComponent(id)}`);
    
    if (!res.ok) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }
    
    const courseData = await res.json();
    const courseCode = courseData.filename?.replace('.txt', '') || id;
    
    const nasMapping = loadNasMapping();
    
    if (courseCode in nasMapping) {
      const item = nasMapping[courseCode];
      return NextResponse.json({
        has_video: true,
        course_code: courseCode,
        chinese_name: item.chinese_name,
        video_filename: item.video_filename,
        video_url: `/api/knowledge-base/video/${courseCode}`,
        nas_path: item.nas_path,
      });
    }
    
    return NextResponse.json({
      has_video: false,
      course_code: courseCode,
    });
  } catch (error) {
    console.error('知识库视频信息API错误:', error);
    return NextResponse.json({ error: '获取视频信息失败' }, { status: 500 });
  }
}
