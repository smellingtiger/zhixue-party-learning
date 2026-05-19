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
    } else {
      nasMappingCache = {};
    }
  } catch (error) {
    console.error('加载NAS映射文件失败:', error);
    nasMappingCache = {};
  }
  
  return nasMappingCache;
}

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseCode: string }> }
) {
  try {
    const { courseCode } = await params;
    
    const nasMapping = loadNasMapping();
    
    if (!(courseCode in nasMapping)) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 });
    }
    
    const item = nasMapping[courseCode];
    const videoPath = item.nas_path;
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: '视频文件不存在' }, { status: 404 });
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const ext = path.extname(videoPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'video/mp4';
    
    const range = request.headers.get('range');
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      const fileStream = fs.createReadStream(videoPath, { start, end });
      
      const headers = new Headers({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      });
      
      return new NextResponse(fileStream as any, {
        status: 206,
        headers,
      });
    } else {
      const fileStream = fs.createReadStream(videoPath);
      
      const headers = new Headers({
        'Content-Length': fileSize.toString(),
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      
      return new NextResponse(fileStream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('[知识库视频流] 错误:', error);
    return NextResponse.json({ error: '视频文件读取失败' }, { status: 500 });
  }
}
