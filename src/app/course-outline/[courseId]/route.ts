import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { courseVideoMapping } from '@/lib/video-mapping';

const STT_BASE_DIR = 'E:\\社院课程stt';
const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || 'http://192.168.1.212:8080';

interface SemanticOutlineEntry {
  index: number;
  start_time_second: number;
  end_time_second: number;
  summary: string;
  isEstimated?: boolean;
}

const OUTLINE_CATEGORIES = ['政治理论', '统战理论', '新发展理念', '国家治理'];

function getOutlinePath(videoRelPath: string): string | null {
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  if (parts.length < 2) return null;

  const category = parts[0];
  const filename = path.parse(parts[1]).name;

  return path.join(STT_BASE_DIR, category, 'output_outline', `${filename}.json`);
}

function getFunasrPath(videoRelPath: string): string | null {
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  if (parts.length < 2) return null;

  const category = parts[0];
  const filename = path.parse(parts[1]).name;

  return path.join(STT_BASE_DIR, category, 'output_funasr', `${filename}.json`);
}

function findFunasrJson(courseCode: string): string | null {
  for (const cat of OUTLINE_CATEGORIES) {
    const p = path.join(STT_BASE_DIR, cat, 'output_funasr', `${courseCode}.json`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseTimeToSeconds(time?: string): number | undefined {
  if (!time) return undefined;
  const parts = time.split(':').map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2 && parts.every(n => !isNaN(n))) {
    return parts[0] * 60 + parts[1];
  }
  return undefined;
}

function funasrJsonToOutline(funasrData: any[]): SemanticOutlineEntry[] {
  if (!Array.isArray(funasrData) || funasrData.length === 0) return [];

  const markers: SemanticOutlineEntry[] = [];
  for (let i = 0; i < funasrData.length; i++) {
    const para = funasrData[i];
    const startTime = para.start_time_second ?? parseTimeToSeconds(para.start_time);
    const endTime = para.end_time_second ?? parseTimeToSeconds(para.end_time);
    if (startTime !== undefined) {
      markers.push({
        index: i,
        start_time_second: startTime,
        end_time_second: endTime ?? startTime,
        summary: para.title || para.content?.substring(0, 40) || `第${i + 1}段`,
      });
    }
  }
  return markers;
}

async function getOutlineFromKnowledgeBase(courseId: string): Promise<SemanticOutlineEntry[]> {
  try {
    const res = await fetch(`${KNOWLEDGE_SERVICE_URL}/api/files/${encodeURIComponent(courseId)}`);
    if (!res.ok) return [];

    const data = await res.json();
    const segments = data.segments || [];
    if (segments.length === 0) return [];

    const markers: SemanticOutlineEntry[] = [];
    let markerIndex = 0;

    for (const seg of segments) {
      const startTime = parseTimeToSeconds(seg.time);
      const endTime = parseTimeToSeconds(seg.timeEnd);
      if (startTime !== undefined) {
        markers.push({
          index: markerIndex++,
          start_time_second: startTime,
          end_time_second: endTime ?? startTime,
          summary: seg.title || `第${markerIndex}段`,
          isEstimated: true,
        });
      }
    }

    return markers;
  } catch (error) {
    console.error('[course-outline] 知识库获取失败:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const videoRelPath = courseVideoMapping[courseId];

    if (videoRelPath) {
      const outlinePath = getOutlinePath(videoRelPath);
      if (outlinePath && fs.existsSync(outlinePath)) {
        const content = fs.readFileSync(outlinePath, 'utf-8');
        const data: SemanticOutlineEntry[] = JSON.parse(content);
        return NextResponse.json(data);
      }

      const funasrPath = getFunasrPath(videoRelPath);
      if (funasrPath && fs.existsSync(funasrPath)) {
        const content = fs.readFileSync(funasrPath, 'utf-8');
        const funasrData = JSON.parse(content);
        const markers = funasrJsonToOutline(funasrData);
        if (markers.length > 0) {
          return NextResponse.json(markers);
        }
      }
    }

    const codeFromId = courseId.replace(/[^A-Za-z0-9_]/g, '').substring(0, 30);
    const funasrByCode = findFunasrJson(codeFromId);
    if (funasrByCode) {
      const content = fs.readFileSync(funasrByCode, 'utf-8');
      const funasrData = JSON.parse(content);
      const markers = funasrJsonToOutline(funasrData);
      if (markers.length > 0) {
        return NextResponse.json(markers);
      }
    }

    const kbMarkers = await getOutlineFromKnowledgeBase(courseId);
    if (kbMarkers.length > 0) {
      return NextResponse.json(kbMarkers);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to load outline:', error);
    return NextResponse.json([]);
  }
}
